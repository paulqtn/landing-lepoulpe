import { adminQuery as q } from "@/lib/admin/db";
import { cheminDe, oublier, type Dossier } from "./boite";
import type { Compte } from "./comptes";
import { avecImap, chercher, lireEntetes } from "./imap";
import { CATEGORIE_CLES, PRIORITE_CLES } from "./modele";

/* Listes de la messagerie. L'index en base dit quels messages appartiennent à la vue (il connaît
   leurs étiquettes, pas leur contenu) ; l'objet, l'expéditeur et la date affichés sont relus dans
   la boîte à chaque affichage. La recherche de texte est faite par le serveur de messagerie. */

export const VUES = [
  ["reception", "Boîte de réception"],
  ["non_lus", "Non lus"],
  ["prioritaires", "Prioritaires"],
  ["a_repondre", "À répondre"],
  ["brouillons", "Brouillons préparés"],
  ["en_attente", "En attente"],
  ["envoyes", "Envoyés"],
  ["archives", "Archives"],
] as const;
export type Vue = (typeof VUES)[number][0];

const CONDITIONS: Record<Vue, string> = {
  reception: "m.dossier = 'inbox'",
  non_lus: "m.dossier = 'inbox' AND NOT m.lu",
  prioritaires: "m.dossier = 'inbox' AND m.priorite IN ('urgent', 'eleve') AND m.statut <> 'traite'",
  a_repondre: "m.dossier = 'inbox' AND m.besoin_reponse AND m.statut = 'a_traiter' AND m.repondu_at IS NULL",
  brouillons: "m.dossier = 'inbox' AND EXISTS (SELECT 1 FROM mail_drafts d WHERE d.message_id = m.id AND d.statut = 'brouillon')",
  en_attente: "m.dossier = 'inbox' AND m.statut = 'en_attente'",
  envoyes: "m.dossier = 'sent'",
  archives: "m.dossier = 'archive'",
};
const DOSSIER: Record<Vue, Dossier> = { reception: "inbox", non_lus: "inbox", prioritaires: "inbox", a_repondre: "inbox", brouillons: "inbox", en_attente: "inbox", envoyes: "sent", archives: "archive" };

export type Filtres = { vue: Vue; q?: string; expediteur?: string; categorie?: string; priorite?: string; statut?: string; du?: string; au?: string; page?: number };

export type Ligne = {
  id: number; dossier: Dossier; from_nom: string; from_email: string; dest: { to: string[] }; sujet: string; date: string; lu: boolean;
  categorie: string | null; priorite: string | null; besoin_reponse: boolean | null; statut: string; lead_id: number | null; nb_pieces: number; a_brouillon: boolean; repondu_at: string | null;
};
type Rang = Omit<Ligne, "from_nom" | "from_email" | "dest" | "sujet"> & { uid: string };

export const PAR_PAGE = 40;

export async function lister(compte: Compte, f: Filtres): Promise<{ lignes: Ligne[]; total: number }> {
  const dossier = DOSSIER[f.vue];
  const chemin = cheminDe(compte, dossier);
  if (!chemin) return { lignes: [], total: 0 };
  const vals: unknown[] = [compte.id];
  const w = ["m.account_id = $1", CONDITIONS[f.vue]];
  const ajoute = (sql: string, v: unknown) => { vals.push(v); w.push(sql.replaceAll("?", `$${vals.length}`)); };
  if (f.categorie && (CATEGORIE_CLES as string[]).includes(f.categorie)) ajoute("m.categorie = ?", f.categorie);
  if (f.priorite && (PRIORITE_CLES as string[]).includes(f.priorite)) ajoute("m.priorite = ?", f.priorite);
  if (f.statut && ["a_traiter", "en_attente", "traite"].includes(f.statut)) ajoute("m.statut = ?", f.statut);
  if (f.du && /^\d{4}-\d{2}-\d{2}$/.test(f.du)) ajoute("m.date >= ?::date", f.du);
  if (f.au && /^\d{4}-\d{2}-\d{2}$/.test(f.au)) ajoute("m.date < (?::date + 1)", f.au);
  const page = Math.max(1, f.page ?? 1);

  return avecImap(compte, async (client) => {
    // Recherche de texte ou d'expéditeur : c'est la boîte mail qui cherche, pas la base.
    if (f.q || f.expediteur) ajoute("m.uid = ANY(?::bigint[])", await chercher(client, chemin, { texte: f.q, expediteur: f.expediteur }));
    const where = w.join(" AND ");
    const [rangs, total] = await Promise.all([
      q<Rang>(
        `SELECT m.id, m.dossier, m.uid, m.date, m.lu, m.categorie, m.priorite, m.besoin_reponse, m.statut, m.lead_id, m.repondu_at, m.nb_pieces,
                EXISTS (SELECT 1 FROM mail_drafts d WHERE d.message_id = m.id AND d.statut = 'brouillon') AS a_brouillon
         FROM mail_messages m WHERE ${where} ORDER BY m.date DESC, m.id DESC LIMIT ${PAR_PAGE} OFFSET ${(page - 1) * PAR_PAGE}`,
        vals,
      ),
      q<{ n: string }>(`SELECT count(*)::text AS n FROM mail_messages m WHERE ${where}`, vals),
    ]);
    const entetes = new Map((await lireEntetes(client, chemin, rangs.map((r) => Number(r.uid)))).map((e) => [e.uid, e]));
    const lignes: Ligne[] = [];
    const partis: number[] = [];
    for (const { uid, ...r } of rangs) {
      const e = entetes.get(Number(uid));
      if (!e) { partis.push(r.id); continue; } // plus dans la boîte : la ligne quitte l'index
      lignes.push({ ...r, from_nom: e.fromNom, from_email: e.fromEmail, dest: { to: e.to }, sujet: e.sujet, date: e.date.toISOString(), lu: dossier === "inbox" ? e.lu : true });
    }
    await oublier(compte, partis);
    return { lignes, total: Math.max(0, Number(total[0]?.n ?? 0) - partis.length) };
  });
}

export async function compteurs(compteId: number): Promise<Record<Vue, number> & { categories: Record<string, number> }> {
  const cols = VUES.map(([v]) => `count(*) FILTER (WHERE ${CONDITIONS[v]})::int AS ${v}`).join(", ");
  const [c, cats] = await Promise.all([
    q<Record<Vue, number>>(`SELECT ${cols} FROM mail_messages m WHERE m.account_id = $1`, [compteId]),
    q<{ categorie: string; n: number }>("SELECT categorie, count(*)::int AS n FROM mail_messages m WHERE m.account_id = $1 AND m.dossier = 'inbox' AND m.categorie IS NOT NULL AND m.statut <> 'traite' GROUP BY categorie", [compteId]),
  ]);
  return { ...(c[0] ?? ({} as Record<Vue, number>)), categories: Object.fromEntries(cats.map((x) => [x.categorie, x.n])) };
}

/** Minutes gagnées par brouillon préparé : hypothèse affichée telle quelle dans le tableau de bord. */
export const MINUTES_PAR_BROUILLON = 4;

export async function tableauDeBord(compteId: number) {
  const r = (await q<Record<string, number | null>>(
    `SELECT
       count(*) FILTER (WHERE m.dossier <> 'sent' AND m.date > now() - interval '30 days')::int AS recus,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND m.statut = 'a_traiter' AND m.besoin_reponse IS NOT FALSE AND m.repondu_at IS NULL)::int AS a_traiter,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND m.priorite = 'urgent' AND m.statut <> 'traite')::int AS urgents,
       count(*) FILTER (WHERE m.dossier <> 'sent' AND m.categorie = 'nouveau_prospect' AND m.date > now() - interval '30 days')::int AS prospects,
       count(*) FILTER (WHERE m.dossier <> 'sent' AND m.categorie IN ('opportunite', 'demande_devis', 'negociation', 'validation_commande') AND m.date > now() - interval '30 days')::int AS opportunites,
       count(DISTINCT m.exp) FILTER (WHERE ${CONDITIONS.a_repondre})::int AS clients_en_attente,
       round(avg(extract(epoch FROM (m.repondu_at - m.date)) / 3600) FILTER (WHERE m.dossier <> 'sent' AND m.repondu_at IS NOT NULL AND m.repondu_at > m.date AND m.date > now() - interval '30 days')::numeric, 1)::float AS heures_reponse
     FROM mail_messages m WHERE m.account_id = $1`,
    [compteId],
  ))[0] ?? {};
  const d = (await q<{ generes: number; en_attente: number }>(
    `SELECT count(*) FILTER (WHERE origine = 'ia' AND created_at > now() - interval '30 days')::int AS generes,
            count(*) FILTER (WHERE statut = 'brouillon')::int AS en_attente
     FROM mail_drafts WHERE account_id = $1`,
    [compteId],
  ))[0] ?? { generes: 0, en_attente: 0 };
  return { ...r, reponses_generees: d.generes, brouillons_en_attente: d.en_attente, minutes_economisees: d.generes * MINUTES_PAR_BROUILLON };
}
