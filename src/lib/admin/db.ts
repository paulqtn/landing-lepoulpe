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
};

export type LeadEvent = {
  id: number;
  lead_id: number;
  created_at: string;
  type: string;
  message: string | null;
};

/* ----------------------------- Écriture ---------------------------- */

export async function insertLead(input: {
  name: string;
  email: string;
  phone: string;
  source?: string;
  answers?: Record<string, unknown>;
  estimationTTC?: number | null;
}): Promise<Lead> {
  const rows = await q<Lead>(
    `INSERT INTO leads (name, email, phone, source, answers, estimation_ttc)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [input.name, input.email, input.phone, input.source ?? null, input.answers ?? null, input.estimationTTC ?? null],
  );
  return rows[0];
}

export async function addEvent(leadId: number, type: string, message?: string): Promise<void> {
  await q(`INSERT INTO lead_events (lead_id, type, message) VALUES ($1, $2, $3)`, [leadId, type, message ?? null]);
}

export async function updateLead(
  id: number,
  patch: Partial<Pick<Lead, "statut" | "relances" | "next_relance_at" | "assigned_to">>,
): Promise<void> {
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
  const rows = await q<Lead>(`SELECT * FROM leads WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listEvents(leadId: number): Promise<LeadEvent[]> {
  return q<LeadEvent>(`SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at DESC, id DESC`, [leadId]);
}

export async function listLeads(opts: { statut?: string; search?: string; limit?: number } = {}): Promise<Lead[]> {
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
