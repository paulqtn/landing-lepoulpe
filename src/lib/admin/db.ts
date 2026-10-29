import { Pool } from "pg";

/* ================================================================== */
/*  Accès base du back office. Fonctionne avec Vercel Postgres / Neon  */
/*  / Supabase : il suffit d'une URL Postgres dans POSTGRES_URL.       */
/* ================================================================== */

const CONNECTION_URL =
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL ??
  "";

export const dbConfigured = CONNECTION_URL.length > 0;

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: CONNECTION_URL,
      max: 1,
      ssl: /localhost|127\.0\.0\.1/.test(CONNECTION_URL) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          source TEXT,
          answers JSONB,
          estimation_ttc NUMERIC,
          statut TEXT NOT NULL DEFAULT 'nouveau',
          relances INT NOT NULL DEFAULT 0,
          next_relance_at TIMESTAMPTZ,
          assigned_to TEXT
        );
        CREATE TABLE IF NOT EXISTS lead_events (
          id SERIAL PRIMARY KEY,
          lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          type TEXT NOT NULL,
          message TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_leads_statut ON leads(statut);
        CREATE INDEX IF NOT EXISTS idx_leads_next_relance ON leads(next_relance_at);
        CREATE INDEX IF NOT EXISTS idx_events_lead ON lead_events(lead_id);
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS score TEXT NOT NULL DEFAULT 'C';
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_points INT NOT NULL DEFAULT 0;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS token TEXT;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS opens INT NOT NULL DEFAULT 0;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS clicks INT NOT NULL DEFAULT 0;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS devis_views INT NOT NULL DEFAULT 0;
        ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_token ON leads(token);
      `);
    })();
  }
  return schemaReady;
}

async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

/* ------------------------------ Types ------------------------------ */

export { STATUTS, STATUT_LABELS, type Statut } from "./statuts";
import { STATUTS, type Statut } from "./statuts";

export type Lead = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  source: string | null;
  answers: Record<string, unknown> | null;
  estimation_ttc: string | null;
  statut: Statut;
  relances: number;
  next_relance_at: string | null;
  assigned_to: string | null;
  score: "A" | "B" | "C";
  score_points: number;
  token: string | null;
  opens: number;
  clicks: number;
  devis_views: number;
  last_activity_at: string | null;
};

export type LeadEvent = {
  id: number;
  lead_id: number;
  created_at: string;
  type: string;
  message: string | null;
};

/* ----------------------------- Écriture ---------------------------- */

import { randomBytes } from "node:crypto";
import { demoEvents, demoLead, demoLeadByToken, demoLeads } from "./demo";

export async function insertLead(input: {

  name: string;
  email: string;
  phone: string;
  source?: string;
  answers?: Record<string, unknown>;
  estimationTTC?: number | null;
  score?: "A" | "B" | "C";
  scorePoints?: number;
}): Promise<Lead> {
  if (!dbConfigured) throw new Error("mode démo — base non connectée");
  const token = randomBytes(12).toString("hex");
  const rows = await q<Lead>(
    `INSERT INTO leads (name, email, phone, source, answers, estimation_ttc, score, score_points, token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      input.name,
      input.email,
      input.phone,
      input.source ?? null,
      input.answers ?? null,
      input.estimationTTC ?? null,
      input.score ?? "C",
      input.scorePoints ?? 0,
      token,
    ],
  );
  return rows[0];
}

export async function addEvent(leadId: number, type: string, message?: string): Promise<void> {
  if (!dbConfigured) return;
  await q(`INSERT INTO lead_events (lead_id, type, message) VALUES ($1, $2, $3)`, [leadId, type, message ?? null]);
}

export async function updateLead(
  id: number,
  patch: Partial<
    Pick<
      Lead,
      "statut" | "relances" | "next_relance_at" | "assigned_to" | "score" | "score_points" | "answers" | "estimation_ttc"
    >
  >,
): Promise<void> {
  if (!dbConfigured) return;
  const sets: string[] = [];
  const vals: unknown[] = [];
  Object.entries(patch).forEach(([k, v]) => {
    vals.push(v);
    sets.push(`${k} = $${vals.length}`);
  });
  if (!sets.length) return;
  vals.push(id);
  await q(`UPDATE leads SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
}

/* ------------------------------ Lecture ----------------------------- */

export async function getLead(id: number): Promise<Lead | null> {
  if (!dbConfigured) return demoLead(id);
  const rows = await q<Lead>(`SELECT * FROM leads WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listEvents(leadId: number): Promise<LeadEvent[]> {
  if (!dbConfigured) return demoEvents(leadId);
  return q<LeadEvent>(`SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at DESC, id DESC`, [leadId]);
}

export async function listLeads(opts: { statut?: string; search?: string; limit?: number } = {}): Promise<Lead[]> {
  if (!dbConfigured) {
    const needle = (opts.search ?? "").toLowerCase();
    return demoLeads().filter(
      (l) =>
        (!opts.statut || l.statut === opts.statut) &&
        (!needle || [l.name, l.email, l.phone].some((v) => v.toLowerCase().includes(needle))),
    );
  }
  const where: string[] = [];
  const vals: unknown[] = [];
  if (opts.statut && (STATUTS as readonly string[]).includes(opts.statut)) {
    vals.push(opts.statut);
    where.push(`statut = $${vals.length}`);
  }
  if (opts.search) {
    vals.push(`%${opts.search}%`);
    where.push(`(name ILIKE $${vals.length} OR email ILIKE $${vals.length} OR phone ILIKE $${vals.length})`);
  }
  vals.push(Math.min(opts.limit ?? 100, 500));
  return q<Lead>(
    `SELECT * FROM leads ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY created_at DESC LIMIT $${vals.length}`,
    vals,
  );
}

/** Relances arrivées à échéance (cron + dashboard). */
export async function dueRelances(): Promise<Lead[]> {
  if (!dbConfigured) {
    return demoLeads().filter(
      (l) => l.next_relance_at && new Date(l.next_relance_at) <= new Date() && l.statut !== "gagne" && l.statut !== "perdu",
    );
  }
  return q<Lead>(
    `SELECT * FROM leads
     WHERE next_relance_at IS NOT NULL AND next_relance_at <= now()
       AND statut NOT IN ('gagne', 'perdu')
     ORDER BY next_relance_at ASC LIMIT 100`,
  );
}

export async function stats(): Promise<{
  total: number;
  semaine: number;
  devisEnvoyes: number;
  gagnes: number;
  perdus: number;
  relancesDues: number;
  caGagne: number;
}> {
  if (!dbConfigured) {
    const all = demoLeads();
    const dues = all.filter(
      (l) => l.next_relance_at && new Date(l.next_relance_at) <= new Date() && l.statut !== "gagne" && l.statut !== "perdu",
    );
    return {
      total: all.length,
      semaine: all.length,
      devisEnvoyes: all.filter((l) => ["devis_envoye", "relance_1", "relance_2", "relance_3"].includes(l.statut)).length,
      gagnes: 0,
      perdus: 0,
      relancesDues: dues.length,
      caGagne: 0,
    };
  }
  const rows = await q<Record<string, string>>(`

    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS semaine,
      count(*) FILTER (WHERE statut IN ('devis_envoye', 'relance_1', 'relance_2'))::int AS devis,
      count(*) FILTER (WHERE statut = 'gagne')::int AS gagnes,
      count(*) FILTER (WHERE statut = 'perdu')::int AS perdus,
      count(*) FILTER (WHERE next_relance_at IS NOT NULL AND next_relance_at <= now() AND statut NOT IN ('gagne','perdu'))::int AS dues,
      COALESCE(sum(estimation_ttc) FILTER (WHERE statut = 'gagne'), 0)::float AS ca
    FROM leads
  `);
  const r = rows[0] ?? {};
  return {
    total: Number(r.total ?? 0),
    semaine: Number(r.semaine ?? 0),
    devisEnvoyes: Number(r.devis ?? 0),
    gagnes: Number(r.gagnes ?? 0),
    perdus: Number(r.perdus ?? 0),
    relancesDues: Number(r.dues ?? 0),
    caGagne: Number(r.ca ?? 0),
  };
}

/* ---------------------- Devis en ligne & signaux --------------------- */

export async function getLeadByToken(token: string): Promise<Lead | null> {
  if (!dbConfigured) return demoLeadByToken(token);
  if (!/^[0-9a-f]{24}$/.test(token)) return null;
  const rows = await q<Lead>(`SELECT * FROM leads WHERE token = $1`, [token]);
  return rows[0] ?? null;
}

export async function findLeadByEmail(email: string): Promise<Lead | null> {
  if (!dbConfigured) return demoLeads().find((l) => l.email.toLowerCase() === email.toLowerCase()) ?? null;
  const rows = await q<Lead>(`SELECT * FROM leads WHERE lower(email) = lower($1) ORDER BY created_at DESC LIMIT 1`, [email]);
  return rows[0] ?? null;
}

/** Incrémente les compteurs d'engagement et met à jour la dernière activité. */
export async function recordEngagement(
  id: number,
  inc: { opens?: number; clicks?: number; devis_views?: number },
): Promise<void> {
  if (!dbConfigured) return;
  await q(
    `UPDATE leads SET
       opens = opens + $2,
       clicks = clicks + $3,
       devis_views = devis_views + $4,
       last_activity_at = now()
     WHERE id = $1`,
    [id, inc.opens ?? 0, inc.clicks ?? 0, inc.devis_views ?? 0],
  );
}

export async function hasRecentEvent(leadId: number, type: string, hours: number): Promise<boolean> {
  if (!dbConfigured) return true;
  const rows = await q(
    `SELECT 1 FROM lead_events WHERE lead_id = $1 AND type = $2 AND created_at > now() - ($3 || ' hours')::interval LIMIT 1`,
    [leadId, type, String(hours)],
  );
  return rows.length > 0;
}

/* ----------------------- Vue « Ma journée » ------------------------- */

export async function leadsJour(): Promise<{ aAppeler: Lead[]; chauds: Lead[] }> {
  if (!dbConfigured) {
    const all = demoLeads().filter((l) => l.statut !== "gagne" && l.statut !== "perdu");
    return {
      aAppeler: all.filter((l) => l.score === "A").sort((a, b) => b.score_points - a.score_points),
      chauds: all.filter((l) => l.last_activity_at && Date.now() - Number(new Date(l.last_activity_at)) < 48 * 3600_000),
    };
  }
  const [aAppeler, chauds] = await Promise.all([
    q<Lead>(
      `SELECT * FROM leads
       WHERE score = 'A' AND statut NOT IN ('gagne', 'perdu')
       ORDER BY score_points DESC, created_at DESC LIMIT 30`,
    ),
    q<Lead>(
      `SELECT * FROM leads
       WHERE last_activity_at > now() - interval '48 hours' AND statut NOT IN ('gagne', 'perdu')
       ORDER BY last_activity_at DESC LIMIT 20`,
    ),
  ]);
  return { aAppeler, chauds };
}

/** Pipeline : volume et CA estimé par statut. */
export async function pipeline(): Promise<{ statut: Statut; n: number; total: number }[]> {
  if (!dbConfigured) {
    const by = new Map<Statut, { n: number; total: number }>();
    for (const l of demoLeads()) {
      const cur = by.get(l.statut) ?? { n: 0, total: 0 };
      cur.n += 1;
      cur.total += l.estimation_ttc ? Number(l.estimation_ttc) : 0;
      by.set(l.statut, cur);
    }
    const order = STATUTS as readonly string[];
    return [...by.entries()]
      .map(([statut, v]) => ({ statut, ...v }))
      .sort((a, b) => order.indexOf(a.statut) - order.indexOf(b.statut));
  }
  const rows = await q<{ statut: Statut; n: string; total: string }>(
    `SELECT statut, count(*)::int AS n, COALESCE(sum(estimation_ttc), 0)::float AS total
     FROM leads GROUP BY statut`,
  );
  const order = STATUTS as readonly string[];
  return rows
    .map((r) => ({ statut: r.statut, n: Number(r.n), total: Number(r.total) }))
    .sort((a, b) => order.indexOf(a.statut) - order.indexOf(b.statut));
}
