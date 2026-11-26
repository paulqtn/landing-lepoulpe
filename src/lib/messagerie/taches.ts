import { adminQuery as q } from "@/lib/admin/db";

/* File de tâches de la messagerie. Rien ne tourne en permanence sur l'hébergement : les tâches
   sont inscrites en base, puis exécutées par petits lots à chaque passage (écran ouvert, bouton
   de synchronisation, tâche planifiée). Une tâche n'est jamais exécutée deux fois en même temps
   (verrou en base), elle est réessayée avec un délai croissant, puis classée en échec. */

export type TypeTache = "sync" | "analyse" | "reponse" | "brouillon_imap";
export type Tache = { id: number; account_id: number; type: TypeTache; ref_id: number; tentatives: number };

export const ESSAIS_MAX = 4;
const ATTENTE_MIN = [1, 4, 15];

/** Inscrit une tâche. Sans effet si la même tâche attend déjà ou est en cours (pas de doublon). */
export async function planifier(accountId: number, type: TypeTache, refId: number, dansSecondes = 0): Promise<void> {
  await q(
    `INSERT INTO mail_jobs (account_id, type, ref_id, prochain_essai_at) VALUES ($1, $2, $3, now() + ($4 || ' seconds')::interval)
     ON CONFLICT (type, ref_id) WHERE statut IN ('attente', 'en_cours') DO NOTHING`,
    [accountId, type, refId, String(dansSecondes)],
  );
}

/** Prend la prochaine tâche d'une boîte, en la verrouillant : deux passages simultanés ne prennent jamais la même. */
export async function prendre(accountId: number, types?: TypeTache[]): Promise<Tache | null> {
  const rows = await q<Tache>(
    `UPDATE mail_jobs SET statut = 'en_cours', tentatives = tentatives + 1, verrou_jusqua = now() + interval '3 minutes'
     WHERE id = (
       SELECT id FROM mail_jobs
       WHERE account_id = $1 AND ($2::text[] IS NULL OR type = ANY($2))
         AND ((statut = 'attente' AND prochain_essai_at <= now()) OR (statut = 'en_cours' AND verrou_jusqua < now()))
       ORDER BY (type = 'sync') DESC, id
       LIMIT 1 FOR UPDATE SKIP LOCKED
     )
     RETURNING id, account_id, type, ref_id, tentatives`,
    [accountId, types ?? null],
  );
  return rows[0] ?? null;
}

export async function terminer(id: number): Promise<void> {
  await q("UPDATE mail_jobs SET statut = 'fait', fini_at = now(), verrou_jusqua = NULL, erreur = NULL WHERE id = $1", [id]);
}

/** Échec : nouvel essai plus tard, ou abandon après le dernier essai (ou si réessayer ne sert à rien). */
export async function echouer(t: Tache, message: string, definitif: boolean): Promise<"reessai" | "echec"> {
  if (definitif || t.tentatives >= ESSAIS_MAX) {
    await q("UPDATE mail_jobs SET statut = 'echec', fini_at = now(), verrou_jusqua = NULL, erreur = $2 WHERE id = $1", [t.id, message.slice(0, 500)]);
    return "echec";
  }
  const minutes = ATTENTE_MIN[Math.min(t.tentatives - 1, ATTENTE_MIN.length - 1)];
  await q("UPDATE mail_jobs SET statut = 'attente', verrou_jusqua = NULL, erreur = $2, prochain_essai_at = now() + ($3 || ' minutes')::interval WHERE id = $1", [t.id, message.slice(0, 500), String(minutes)]);
  return "reessai";
}

export async function enAttente(accountId: number): Promise<number> {
  return Number((await q<{ n: string }>("SELECT count(*)::text AS n FROM mail_jobs WHERE account_id = $1 AND statut IN ('attente', 'en_cours')", [accountId]))[0]?.n ?? 0);
}

/** Ménage : les tâches terminées depuis plus de quinze jours quittent la base. */
export async function menage(accountId: number): Promise<void> {
  await q("DELETE FROM mail_jobs WHERE account_id = $1 AND statut IN ('fait', 'echec') AND fini_at < now() - interval '15 days'", [accountId]);
}
