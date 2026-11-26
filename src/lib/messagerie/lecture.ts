import { adminQuery as q } from "@/lib/admin/db";
import { CATEGORIE_CLES, PRIORITE_CLES } from "./modele";

/* Lecture des messages d'une boîte pour l'écran : vues, filtres, compteurs et tableau de bord.
   Toutes les requêtes sont bornées à une boîte (account_id). */

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
  reception: "m.dossier = 'inbox' AND NOT m.archive",
  non_lus: "m.dossier = 'inbox' AND NOT m.archive AND NOT m.lu",
  prioritaires: "m.dossier = 'inbox' AND NOT m.archive AND m.priorite IN ('urgent', 'eleve') AND m.statut <> 'traite'",
  a_repondre: "m.dossier = 'inbox' AND NOT m.archive AND m.besoin_reponse AND m.statut = 'a_traiter' AND m.repondu_at IS NULL",
  brouillons: "m.dossier = 'inbox' AND EXISTS (SELECT 1 FROM mail_drafts d WHERE d.message_id = m.id AND d.statut = 'brouillon')",
  en_attente: "m.dossier = 'inbox' AND m.statut = 'en_attente'",
  envoyes: "m.dossier = 'sent'",
  archives: "m.dossier = 'inbox' AND m.archive",
};

export type Filtres = { vue: Vue; q?: string; expediteur?: string; categorie?: string; priorite?: string; statut?: string; du?: string; au?: string; lead?: number; page?: number };

export type Ligne = {
  id: number; dossier: "inbox" | "sent"; from_nom: string; from_email: string; dest: { to?: string[] }; sujet: string; extrait: string; date: string; lu: boolean;
  categorie: string | null; priorite: string | null; besoin_reponse: boolean | null; statut: string; resume: string | null; lead_id: number | null; nb_pieces: number; a_brouillon: boolean; repondu_at: string | null;
};

export const PAR_PAGE = 40;

function clause(compteId: number, f: Filtres): { where: string; vals: unknown[] } {
  const vals: unknown[] = [compteId];
  const w = ["m.account_id = $1", CONDITIONS[f.vue] ?? CONDITIONS.reception];
  // Chaque filtre ajoute une valeur ; tous les « ? » de sa condition désignent cette valeur.
  const ajoute = (sql: string, v: unknown) => { vals.push(v); w.push(sql.replaceAll("?", `$${vals.length}`)); };
  const motif = (t: string) => `%${t.slice(0, 100).replace(/[%_\\]/g, "\\$&")}%`;
  if (f.q) ajoute("(m.sujet ILIKE ? OR m.from_nom ILIKE ? OR m.from_email ILIKE ? OR m.extrait ILIKE ? OR m.resume ILIKE ?)", motif(f.q));
  if (f.expediteur) ajoute("(m.from_email ILIKE ? OR m.from_nom ILIKE ?)", motif(f.expediteur));
  if (f.categorie && (CATEGORIE_CLES as string[]).includes(f.categorie)) ajoute("m.categorie = ?", f.categorie);
  if (f.priorite && (PRIORITE_CLES as string[]).includes(f.priorite)) ajoute("m.priorite = ?", f.priorite);
  if (f.statut && ["a_traiter", "en_attente", "traite"].includes(f.statut)) ajoute("m.statut = ?", f.statut);
  if (f.du && /^\d{4}-\d{2}-\d{2}$/.test(f.du)) ajoute("m.date >= ?::date", f.du);
  if (f.au && /^\d{4}-\d{2}-\d{2}$/.test(f.au)) ajoute("m.date < (?::date + 1)", f.au);
  if (f.lead) ajoute("m.lead_id = ?", f.lead);
  const where = w.join(" AND ");
  return { where, vals };
}

export async function lister(compteId: number, f: Filtres): Promise<{ lignes: Ligne[]; total: number }> {
  const { where, vals } = clause(compteId, f);
  const page = Math.max(1, f.page ?? 1);
  const [lignes, total] = await Promise.all([
    q<Ligne>(
      `SELECT m.id, m.dossier, m.from_nom, m.from_email, m.dest, m.sujet, m.extrait, m.date, m.lu, m.categorie, m.priorite, m.besoin_reponse, m.statut, m.resume, m.lead_id, m.repondu_at,
              jsonb_array_length(m.pieces) AS nb_pieces,
              EXISTS (SELECT 1 FROM mail_drafts d WHERE d.message_id = m.id AND d.statut = 'brouillon') AS a_brouillon
       FROM mail_messages m WHERE ${where} ORDER BY m.date DESC, m.id DESC LIMIT ${PAR_PAGE} OFFSET ${(page - 1) * PAR_PAGE}`,
      vals,
    ),
    q<{ n: string }>(`SELECT count(*)::text AS n FROM mail_messages m WHERE ${where}`, vals),
  ]);
  return { lignes, total: Number(total[0]?.n ?? 0) };
}

export async function compteurs(compteId: number): Promise<Record<Vue, number> & { categories: Record<string, number> }> {
  const cols = VUES.map(([v]) => `count(*) FILTER (WHERE ${CONDITIONS[v]})::int AS ${v}`).join(", ");
  const [c, cats] = await Promise.all([
    q<Record<Vue, number>>(`SELECT ${cols} FROM mail_messages m WHERE m.account_id = $1`, [compteId]),
    q<{ categorie: string; n: number }>("SELECT categorie, count(*)::int AS n FROM mail_messages m WHERE m.account_id = $1 AND m.dossier = 'inbox' AND NOT m.archive AND m.categorie IS NOT NULL AND m.statut <> 'traite' GROUP BY categorie", [compteId]),
  ]);
  return { ...(c[0] ?? ({} as Record<Vue, number>)), categories: Object.fromEntries(cats.map((x) => [x.categorie, x.n])) };
}

/** Minutes gagnées par brouillon préparé : hypothèse affichée telle quelle dans le tableau de bord. */
export const MINUTES_PAR_BROUILLON = 4;

export async function tableauDeBord(compteId: number) {
  const r = (await q<Record<string, number | null>>(
    `SELECT
       count(*) FILTER (WHERE m.dossier = 'inbox' AND m.date > now() - interval '30 days')::int AS recus,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND NOT m.archive AND m.statut = 'a_traiter' AND m.besoin_reponse IS NOT FALSE AND m.repondu_at IS NULL)::int AS a_traiter,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND NOT m.archive AND m.priorite = 'urgent' AND m.statut <> 'traite')::int AS urgents,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND m.categorie = 'nouveau_prospect' AND m.date > now() - interval '30 days')::int AS prospects,
       count(*) FILTER (WHERE m.dossier = 'inbox' AND m.categorie IN ('opportunite', 'demande_devis', 'negociation', 'validation_commande') AND m.date > now() - interval '30 days')::int AS opportunites,
       count(DISTINCT m.from_email) FILTER (WHERE ${CONDITIONS.a_repondre})::int AS clients_en_attente,
       round(avg(extract(epoch FROM (m.repondu_at - m.date)) / 3600) FILTER (WHERE m.dossier = 'inbox' AND m.repondu_at IS NOT NULL AND m.repondu_at > m.date AND m.date > now() - interval '30 days')::numeric, 1)::float AS heures_reponse
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
