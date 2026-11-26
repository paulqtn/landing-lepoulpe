import { adminQuery as q } from "@/lib/admin/db";
import { getSociete } from "@/lib/admin/societe";
import { chargerConversation, indexDe, oublier } from "./boite";
import { ecrireBrouillon, repereDuMessage } from "./brouillons";
import { compteParId, globaux, journal, reglagesDe, type Compte } from "./comptes";
import { avecSignature, contexteRedaction, texteFil } from "./contexte";
import { classer, ErreurIA, iaConfiguree, redigerReponse } from "./ia";
import { CATEGORIES_SANS_REPONSE, estExclu, prioriteParRegle, sansCitation, type Categorie } from "./modele";
import { synchroniser, utilisateurDe } from "./synchro";
import { echouer, enAttente, menage, planifier, prendre, terminer, type Tache } from "./taches";

/* Chaîne de traitement d'un e-mail reçu :
   synchronisation → lecture dans la boîte → analyse → étiquettes (catégorie, priorité, besoin de
   réponse) → contexte commercial → rédaction → dépôt dans les Brouillons de la boîte →
   notification → validation humaine.
   Le message est relu dans la boîte à chaque étape et n'est jamais recopié en base. Chaque étape
   est une tâche de la file : elle peut échouer et reprendre sans refaire les autres. */

/** Analyse d'un message reçu (relu dans la boîte), puis mise en file de la réponse si elle est attendue. */
export async function analyser(compte: Compte, id: number, force = false): Promise<void> {
  const idx = await indexDe(compte, id);
  if (!idx || idx.dossier !== "inbox") return;
  if (idx.ia_manuel && !force) return; // le commercial a classé lui-même : son choix reste
  if (idx.ia_at && !force) return; // déjà analysé : jamais deux fois
  const [g, r, societe] = [await globaux(), reglagesDe(compte), await getSociete()];
  if (!g.ia || !iaConfiguree) return;
  const conv = await chargerConversation(compte, idx);
  const m = conv.message;
  if (!m) return oublier(compte, [idx.id]); // le message a quitté la boîte entre-temps
  if (estExclu(m.fromEmail, r.exclusions)) return;
  const corps = sansCitation(m.texte);
  const c = await classer({ societe: societe.raisonSociale, de: `${m.fromNom} <${m.fromEmail}>`, sujet: m.sujet, corps, fil: texteFil(conv), connu: idx.lead_id !== null });
  const priorite = prioriteParRegle({ from: m.fromEmail, sujet: m.sujet, corps }, r.regles) ?? c.priorite;
  const besoin = c.besoin_reponse && !CATEGORIES_SANS_REPONSE.includes(c.categorie as Categorie);
  await q("UPDATE mail_messages SET categorie = $2, priorite = $3, besoin_reponse = $4, langue = $5, ia_at = now(), ia_erreur = NULL WHERE id = $1 AND (NOT ia_manuel OR $6)", [idx.id, c.categorie, priorite, besoin, c.langue, force]);
  if (besoin && r.brouillonsAuto && r.categoriesAuto.includes(c.categorie as Categorie)) await planifier(compte.id, "reponse", idx.id);
}

/** Rédaction de la réponse, écrite directement dans le dossier Brouillons de la boîte. */
export async function preparerReponse(compte: Compte, id: number): Promise<void> {
  const idx = await indexDe(compte, id);
  if (!idx || idx.dossier !== "inbox") return;
  if (await repereDuMessage(compte, idx.id)) return; // un brouillon existe déjà : on n'en prépare pas un second
  if (idx.repondu_at) return; // déjà répondu entre-temps
  const user = await utilisateurDe(compte);
  if (!user) return;
  const conv = await chargerConversation(compte, idx, { style: true });
  if (!conv.message) return oublier(compte, [idx.id]);
  const red = await redigerReponse(await contexteRedaction(compte, user, conv, idx.lead_id, true));
  await ecrireBrouillon(compte, idx, { dest: conv.message.fromEmail, cc: "", sujet: "", corps: avecSignature(red.texte, reglagesDe(compte).signature), origine: "ia", manquants: red.manquants }, conv.message);
  await journal(compte.user_id, compte.email, "brouillon_ia");
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
    default:
      return {}; // ancien type de tâche : plus rien à faire
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
