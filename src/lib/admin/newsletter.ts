import { adminQuery as q } from "./db";
import { buildNewsletterEmail, sendBatch } from "./mail";
import { STATUTS, type Statut } from "./statuts";
import { CORPS_MAX, sanitizeCorps, texteBrut } from "./newsletter-html";

/* ================================================================== */
/*  Newsletter : un e-mail envoyé aux clients choisis par statut.      */
/*  Réservé au super-administrateur. Règles de diffusion :             */
/*   - jamais aux clients anonymisés, désinscrits ou sans e-mail valide */
/*   - une seule fois par adresse, même si elle a plusieurs demandes   */
/*   - chaque e-mail porte un lien de désinscription                   */
/*  L'envoi se fait par lots, à partir d'une file enregistrée en base : */
/*  il peut être repris sans jamais écrire deux fois au même client.   */
/* ================================================================== */

export const LOT = 50;
export const NEWSLETTER_VARIABLES = [
  { cle: "{prenom}", description: "prénom du client" },
  { cle: "{nom}", description: "nom complet" },
  { cle: "{telephone}", description: "votre téléphone" },
  { cle: "{societe}", description: "nom de la société" },
];

/** `corps` est du HTML déjà nettoyé (format « html ») ; les campagnes d'avant la mise en forme sont en « texte ». */
export type Contenu = { sujet: string; corps: string; bouton: string; lien: string; format?: "html" | "texte" };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

export function sanitizeStatuts(raw: unknown): Statut[] {
  return Array.isArray(raw) ? STATUTS.filter((s) => raw.includes(s)) : [];
}

export function sanitizeContenu(raw: unknown): { value?: Contenu; error?: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  if (typeof r.corps === "string" && r.corps.length > CORPS_MAX) return { error: "Le message est trop long : raccourcissez le texte." };
  const c: Contenu = { sujet: str(r.sujet, 150).replace(/\n/g, " "), corps: sanitizeCorps(typeof r.corps === "string" ? r.corps : ""), bouton: str(r.bouton, 40).replace(/\n/g, " "), lien: str(r.lien, 300), format: "html" };
  const texte = texteBrut(c.corps);
  if (c.sujet.length < 3) return { error: "L'objet de l'e-mail est obligatoire." };
  if (texte.length < 20 && !c.corps.includes("<img")) return { error: "Le texte de l'e-mail est trop court." };
  if (c.bouton && !/^https:\/\/[^\s"<>]+$/.test(c.lien)) return { error: "Le bouton doit pointer vers une adresse complète commençant par https://" };
  const inconnues = [...`${c.sujet} ${texte}`.matchAll(/\{[a-zA-Zéèê_]+\}/g)].map((x) => x[0]).filter((v) => !NEWSLETTER_VARIABLES.some((k) => k.cle === v));
  if (inconnues.length) return { error: `Variable inconnue : ${[...new Set(inconnues)].join(", ")}.` };
  return { value: c };
}

/** Clients qui peuvent recevoir une newsletter (une ligne par adresse e-mail). */
const ELIGIBLES = `
  SELECT DISTINCT ON (lower(email)) id, name, email, token, statut
  FROM leads
  WHERE anonymized_at IS NULL AND newsletter_optout_at IS NULL
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$'
  ORDER BY lower(email), created_at DESC, id DESC`;

/** Nombre de destinataires par statut (statut de la demande la plus récente de chaque adresse). */
export async function audienceParStatut(): Promise<{ parStatut: Record<string, number>; exclus: { desinscrits: number; sansEmail: number } }> {
  const rows = await q<{ statut: string; n: string }>(`SELECT statut, count(*)::text AS n FROM (${ELIGIBLES}) e GROUP BY statut`);
  const ex = await q<{ d: string; s: string }>(
    `SELECT count(*) FILTER (WHERE newsletter_optout_at IS NOT NULL)::text AS d,
            count(*) FILTER (WHERE anonymized_at IS NULL AND email !~* '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$')::text AS s FROM leads`,
  );
  return { parStatut: Object.fromEntries(rows.map((r) => [r.statut, Number(r.n)])), exclus: { desinscrits: Number(ex[0]?.d ?? 0), sansEmail: Number(ex[0]?.s ?? 0) } };
}

export async function compterDestinataires(statuts: Statut[]): Promise<number> {
  if (!statuts.length) return 0;
  const rows = await q<{ n: string }>(`SELECT count(*)::text AS n FROM (${ELIGIBLES}) e WHERE statut = ANY($1::text[])`, [statuts]);
  return Number(rows[0]?.n ?? 0);
}

/** Crée la campagne et fige la liste des destinataires. */
export async function creerCampagne(contenu: Contenu, statuts: Statut[], actor: string): Promise<{ id: number; total: number }> {
  const rows = await q<{ id: number }>(
    "INSERT INTO newsletters (created_by, sujet, corps, bouton, lien, statuts, format) VALUES ($1, $2, $3, $4, $5, $6, 'html') RETURNING id",
    [actor, contenu.sujet, contenu.corps, contenu.bouton, contenu.lien, JSON.stringify(statuts)],
  );
  const id = rows[0].id;
  await q(`INSERT INTO newsletter_envois (newsletter_id, lead_id, email) SELECT $1, id, email FROM (${ELIGIBLES}) e WHERE statut = ANY($2::text[])`, [id, statuts]);
  const n = await q<{ n: string }>("SELECT count(*)::text AS n FROM newsletter_envois WHERE newsletter_id = $1", [id]);
  const total = Number(n[0].n);
  await q("UPDATE newsletters SET total = $2 WHERE id = $1", [id, total]);
  return { id, total };
}

export type Progression = { id: number; total: number; envoyes: number; echecs: number; restants: number; termine: boolean; derniereErreur: string | null };

export async function progression(id: number): Promise<Progression | null> {
  const rows = await q<{ total: number; envoyes: string; echecs: string; restants: string; err: string | null }>(
    `SELECT n.total,
            count(*) FILTER (WHERE e.etat = 'envoye')::text AS envoyes,
            count(*) FILTER (WHERE e.etat = 'echec')::text AS echecs,
            count(*) FILTER (WHERE e.etat IN ('attente', 'en_envoi'))::text AS restants,
            max(e.erreur) FILTER (WHERE e.etat = 'echec') AS err
     FROM newsletters n LEFT JOIN newsletter_envois e ON e.newsletter_id = n.id WHERE n.id = $1 GROUP BY n.id`,
    [id],
  );
  if (!rows[0]) return null;
  const restants = Number(rows[0].restants);
  return { id, total: rows[0].total, envoyes: Number(rows[0].envoyes), echecs: Number(rows[0].echecs), restants, termine: restants === 0, derniereErreur: rows[0].err };
}

/**
 * Envoie le lot suivant. Les destinataires du lot sont d'abord réservés en base
 * (« en_envoi ») : deux appels simultanés ne peuvent pas écrire au même client.
 */
export async function envoyerLot(id: number): Promise<Progression | null> {
  const camp = (await q<Contenu & { id: number }>("SELECT id, sujet, corps, bouton, lien, format FROM newsletters WHERE id = $1", [id]))[0];
  if (!camp) return null;
  // Un lot resté « en_envoi » plus de 5 minutes (appel interrompu) n'est PAS renvoyé : on ne sait pas
  // s'il est parti. Il est compté en échec, à relancer volontairement.
  await q("UPDATE newsletter_envois SET etat = 'echec', erreur = 'envoi interrompu — à vérifier avant de relancer', updated_at = now() WHERE newsletter_id = $1 AND etat = 'en_envoi' AND updated_at < now() - interval '5 minutes'", [id]);
  const lot = await q<{ lead_id: number; email: string; name: string; token: string | null; ok: boolean }>(
    `WITH pris AS (
       SELECT lead_id FROM newsletter_envois WHERE newsletter_id = $1 AND etat = 'attente' ORDER BY lead_id LIMIT $2 FOR UPDATE SKIP LOCKED
     ), maj AS (
       UPDATE newsletter_envois e SET etat = 'en_envoi', updated_at = now() FROM pris WHERE e.newsletter_id = $1 AND e.lead_id = pris.lead_id RETURNING e.lead_id, e.email
     )
     SELECT maj.lead_id, maj.email, l.name, l.token, (l.anonymized_at IS NULL AND l.newsletter_optout_at IS NULL) AS ok
     FROM maj JOIN leads l ON l.id = maj.lead_id`,
    [id, LOT],
  );
  if (lot.length) {
    // Désinscription ou anonymisation survenue depuis la création de la campagne : on n'écrit pas.
    const retires = lot.filter((d) => !d.ok).map((d) => d.lead_id);
    const aEnvoyer = lot.filter((d) => d.ok);
    if (retires.length) await q("UPDATE newsletter_envois SET etat = 'echec', erreur = 'désinscrit entre-temps', updated_at = now() WHERE newsletter_id = $1 AND lead_id = ANY($2::int[])", [id, retires]);
    if (aEnvoyer.length) {
      const r = await sendBatch(aEnvoyer.map((d) => ({ to: d.email, ...(({ sujet, html }) => ({ subject: sujet, html }))(buildNewsletterEmail(camp, d)) })));
      await q("UPDATE newsletter_envois SET etat = $3, erreur = $4, updated_at = now() WHERE newsletter_id = $1 AND lead_id = ANY($2::int[])", [
        id, aEnvoyer.map((d) => d.lead_id), r.sent ? "envoye" : "echec", r.sent ? null : (r.reason ?? "erreur").slice(0, 300),
      ]);
    }
  }
  const p = await progression(id);
  if (p?.termine) await q("UPDATE newsletters SET termine_at = COALESCE(termine_at, now()) WHERE id = $1", [id]);
  return p;
}

/** Remet en file les envois en échec d'une campagne (hors désinscrits). */
export async function relancerEchecs(id: number): Promise<void> {
  await q("UPDATE newsletter_envois SET etat = 'attente', erreur = NULL, updated_at = now() WHERE newsletter_id = $1 AND etat = 'echec' AND erreur IS DISTINCT FROM 'désinscrit entre-temps'", [id]);
  await q("UPDATE newsletters SET termine_at = NULL WHERE id = $1", [id]);
}

export type Campagne = { id: number; created_at: string; created_by: string | null; sujet: string; statuts: string[]; total: number; envoyes: number; echecs: number; restants: number };

export async function listCampagnes(limit = 20): Promise<Campagne[]> {
  const rows = await q<Omit<Campagne, "envoyes" | "echecs" | "restants"> & { envoyes: string; echecs: string; restants: string }>(
    `SELECT n.id, n.created_at, n.created_by, n.sujet, n.statuts, n.total,
            count(*) FILTER (WHERE e.etat = 'envoye')::text AS envoyes,
            count(*) FILTER (WHERE e.etat = 'echec')::text AS echecs,
            count(*) FILTER (WHERE e.etat IN ('attente', 'en_envoi'))::text AS restants
     FROM newsletters n LEFT JOIN newsletter_envois e ON e.newsletter_id = n.id GROUP BY n.id ORDER BY n.id DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, envoyes: Number(r.envoyes), echecs: Number(r.echecs), restants: Number(r.restants) }));
}
