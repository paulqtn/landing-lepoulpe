import { adminQuery as q } from "@/lib/admin/db";
import { getSociete } from "@/lib/admin/societe";
import { deposer, enregistrerBrouillon } from "./brouillons";
import { compteParId, globaux, journal, reglagesDe, type Compte } from "./comptes";
import { avecSignature, contexteRedaction, texteFil, type MessageCtx } from "./contexte";
import { classer, ErreurIA, iaConfiguree, redigerReponse } from "./ia";
import { CATEGORIES_SANS_REPONSE, estExclu, prioriteParRegle, sansCitation, type Categorie } from "./modele";
import { synchroniser, utilisateurDe } from "./synchro";
import { echouer, enAttente, menage, planifier, prendre, terminer, type Tache } from "./taches";

/* Chaîne de traitement d'un e-mail reçu :
   synchronisation → analyse → classement et priorité → besoin de réponse → contexte commercial
   → rédaction → dépôt dans les Brouillons de la boîte → notification → validation humaine.
   Chaque étape est une tâche de la file : elle peut échouer et reprendre sans refaire les autres. */

type Msg = MessageCtx & { account_id: number; ia_at: string | null; ia_manuel: boolean; categorie: Categorie | null; besoin_reponse: boolean | null };

async function message(compte: Compte, id: number): Promise<Msg | null> {
  return (await q<Msg>("SELECT id, account_id, dossier, from_nom, from_email, sujet, date, corps, fil, message_id, lead_id, ia_at, ia_manuel, categorie, besoin_reponse FROM mail_messages WHERE id = $1 AND account_id = $2", [id, compte.id]))[0] ?? null;
}

/** Analyse d'un message reçu, puis mise en file de la réponse si elle est attendue. */
export async function analyser(compte: Compte, id: number, force = false): Promise<void> {
  const m = await message(compte, id);
  if (!m || m.dossier !== "inbox") return;
  if (m.ia_manuel && !force) return; // le commercial a classé lui-même : son choix reste
  if (m.ia_at && !force) return; // déjà analysé : jamais deux fois
  const [g, r, societe] = [await globaux(), reglagesDe(compte), await getSociete()];
  if (!g.ia || !iaConfiguree) return;
  if (estExclu(m.from_email, r.exclusions)) return;
  const corps = sansCitation(m.corps ?? "");
  const c = await classer({ societe: societe.raisonSociale, de: `${m.from_nom} <${m.from_email}>`, sujet: m.sujet, corps, fil: await texteFil(compte, m.fil, m.id), connu: m.lead_id !== null });
  const priorite = prioriteParRegle({ from: m.from_email, sujet: m.sujet, corps }, r.regles) ?? c.priorite;
  const besoin = c.besoin_reponse && !CATEGORIES_SANS_REPONSE.includes(c.categorie);
  await q(
    "UPDATE mail_messages SET categorie = $2, priorite = $3, besoin_reponse = $4, intention = $5, resume = $6, infos = $7, langue = $8, ia_at = now(), ia_erreur = NULL WHERE id = $1 AND (NOT ia_manuel OR $9)",
    [m.id, c.categorie, priorite, besoin, c.intention, c.resume, JSON.stringify(c.infos), c.langue, force],
  );
  if (besoin && r.brouillonsAuto && r.categoriesAuto.includes(c.categorie)) await planifier(compte.id, "reponse", m.id);
}

/** Rédaction de la réponse, enregistrée comme brouillon, puis dépôt dans la boîte en tâche suivante. */
export async function preparerReponse(compte: Compte, id: number): Promise<number | null> {
  const m = await message(compte, id);
  if (!m || m.dossier !== "inbox") return null;
  const existe = await q<{ id: number }>("SELECT id FROM mail_drafts WHERE account_id = $1 AND message_id = $2 AND statut IN ('brouillon', 'envoye') LIMIT 1", [compte.id, m.id]);
  if (existe[0]) return existe[0].id; // un brouillon existe déjà : on n'en prépare pas un second
  const user = await utilisateurDe(compte);
  if (!user) return null;
  const red = await redigerReponse(await contexteRedaction(compte, user, m));
  const b = await enregistrerBrouillon(compte, { messageId: m.id, dest: m.from_email, cc: "", sujet: "", corps: avecSignature(red.texte, reglagesDe(compte).signature), origine: "ia", manquants: red.manquants });
  await planifier(compte.id, "brouillon_imap", b.id);
  await journal(compte.user_id, compte.email, "brouillon_ia", m.sujet);
  return b.id;
}

async function executer(compte: Compte, t: Tache): Promise<{ suite?: boolean }> {
  switch (t.type) {
    case "sync": {
      const b = await synchroniser(compte);
      return { suite: b.reste };
    }
    case "analyse":
      await analyser(compte, t.ref_id);
      return {};
    case "reponse":
      await preparerReponse(compte, t.ref_id);
      return {};
    case "brouillon_imap":
      await deposer(compte, t.ref_id);
      return {};
  }
}

export type BilanPassage = { faites: number; echecs: number; restantes: number };

/** Exécute les tâches d'une boîte dans la limite de temps donnée. */
export async function traiter(compteId: number, budgetMs: number): Promise<BilanPassage> {
  const debut = Date.now();
  const bilan: BilanPassage = { faites: 0, echecs: 0, restantes: 0 };
  let compte = await compteParId(compteId);
  if (!compte) return bilan;
  while (Date.now() - debut < budgetMs) {
    const t = await prendre(compte.id);
    if (!t) break;
    try {
      const r = await executer(compte, t);
      await terminer(t.id);
      bilan.faites++;
      if (t.type === "sync") {
        compte = (await compteParId(compteId)) ?? compte; // l'état de synchronisation vient de changer
        if (r.suite) await planifier(compte.id, "sync", compte.id);
      }
    } catch (e) {
      const texte = e instanceof Error ? e.message : "erreur inconnue";
      const issue = await echouer(t, texte, e instanceof ErreurIA && e.definitive);
      if (issue === "echec") {
        bilan.echecs++;
        if (t.type === "analyse" || t.type === "reponse") await q("UPDATE mail_messages SET ia_erreur = $2 WHERE id = $1", [t.ref_id, texte.slice(0, 300)]);
        await journal(compte.user_id, compte.email, "tache_en_echec", `${t.type} : ${texte}`);
      }
      if (t.type === "sync") break; // boîte injoignable : inutile d'enchaîner
    }
  }
  bilan.restantes = await enAttente(compte.id);
  if (bilan.faites > 0 && Math.random() < 0.05) await menage(compte.id);
  return bilan;
}

/** La synchronisation est-elle due, d'après la fréquence choisie par le commercial ? */
export function synchroDue(compte: Compte): boolean {
  const min = reglagesDe(compte).frequenceMin;
  return !compte.last_sync_at || Date.now() - Number(new Date(compte.last_sync_at)) >= min * 60_000 - 5000;
}
