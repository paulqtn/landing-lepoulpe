import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cache } from "react";
import { cookies } from "next/headers";
import { adminQuery as q, dbConfigured } from "./db";

/* ================================================================== */
/*  Auth du back office : comptes individuels en base.                 */
/*  - Aucun identifiant ni code par défaut dans le code.               */
/*  - Mots de passe hachés (scrypt + sel), jamais stockés en clair.    */
/*  - Session = jeton aléatoire en cookie httpOnly ; la base ne garde  */
/*    que son empreinte, ce qui permet de révoquer une session.        */
/*  - Rôles : superadmin (tout + gestion des comptes), admin (tarifs   */
/*    et paramètres), commercial (CRM, simulation, devis).             */
/* ================================================================== */

export const ADMIN_COOKIE = "mgk_session";
export const SESSION_HOURS = 12;

export const ROLES = ["superadmin", "admin", "commercial"] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super-administrateur",
  admin: "Administrateur",
  commercial: "Commercial",
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
};

const scrypt = promisify(scryptCb) as (pwd: string, salt: Buffer, len: number) => Promise<Buffer>;

export const PASSWORD_MIN = 10;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/* ------------------------------ Sessions ----------------------------- */

export async function createSession(userId: number): Promise<{ token: string; maxAge: number }> {
  const token = randomBytes(32).toString("hex");
  // Ménage des sessions expirées (ne touche à aucune donnée métier).
  await q("DELETE FROM sessions WHERE expires_at < now()");
  await q("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + ($3 || ' hours')::interval)", [
    hashToken(token),
    userId,
    String(SESSION_HOURS),
  ]);
  await q("UPDATE users SET last_login_at = now() WHERE id = $1", [userId]);
  return { token, maxAge: SESSION_HOURS * 3600 };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token || !dbConfigured) return;
  await q("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function destroyUserSessions(userId: number): Promise<void> {
  await q("DELETE FROM sessions WHERE user_id = $1", [userId]);
}

async function userFromToken(token: string | undefined): Promise<User | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token) || !dbConfigured) return null;
  try {
    const rows = await q<User>(
      `SELECT u.id, u.email, u.name, u.role, u.active, u.created_at, u.last_login_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.active`,
      [hashToken(token)],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export function tokenFromRequest(req: Request): string | undefined {
  return (req.headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
}

/** Utilisateur connecté (Server Components) — une seule requête par rendu. */
export const currentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  return userFromToken(jar.get(ADMIN_COOKIE)?.value);
});

export function userFromRequest(req: Request): Promise<User | null> {
  return userFromToken(tokenFromRequest(req));
}

/** Garde pour les Server Components du back office. */
export async function isAdmin(): Promise<boolean> {
  return (await currentUser()) !== null;
}

/** Garde pour les routes /api/admin/* : renvoie null si OK, sinon une 401. */
export async function requireAdmin(req: Request): Promise<Response | null> {
  if (await userFromRequest(req)) return null;
  return Response.json({ error: "non autorisé" }, { status: 401 });
}

/** Garde par rôle : renvoie l'utilisateur, ou la réponse d'erreur à retourner. */
export async function requireRole(req: Request, roles: readonly Role[]): Promise<{ user: User; denied?: undefined } | { denied: Response; user?: undefined }> {
  const user = await userFromRequest(req);
  if (!user) return { denied: Response.json({ error: "non autorisé" }, { status: 401 }) };
  if (!roles.includes(user.role)) return { denied: Response.json({ error: "droits insuffisants" }, { status: 403 }) };
  return { user };
}

export const canManageUsers = (u: User | null) => u?.role === "superadmin";
export const canManageSettings = (u: User | null) => u?.role === "superadmin" || u?.role === "admin";

/* ----------------------- Identité du commercial ----------------------- */

/** Nom de la personne connectée — sert de clé d'attribution des clients. */
export async function currentRep(): Promise<string | null> {
  return (await currentUser())?.name ?? null;
}

export async function repFromRequest(req: Request): Promise<string | null> {
  return (await userFromRequest(req))?.name ?? null;
}

/* --------------------------- Premier compte --------------------------- */

/** Jeton d'initialisation défini dans Vercel (ADMIN_SETUP_TOKEN) — jamais dans le code. */
export function setupTokenConfigured(): boolean {
  return (process.env.ADMIN_SETUP_TOKEN ?? "").length >= 12;
}

export function checkSetupToken(token: string): boolean {
  const expected = process.env.ADMIN_SETUP_TOKEN ?? "";
  if (expected.length < 12) return false;
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function countUsers(): Promise<number> {
  const rows = await q<{ n: string }>("SELECT count(*)::text AS n FROM users");
  return Number(rows[0]?.n ?? 0);
}

/* ------------------------- Journal des actions ------------------------ */

export async function audit(
  actor: string | null,
  action: string,
  entity: string,
  entityId: string | number | null,
  before?: unknown,
  after?: unknown,
): Promise<void> {
  if (!dbConfigured) return;
  try {
    await q("INSERT INTO audit_log (actor, action, entity, entity_id, before, after) VALUES ($1, $2, $3, $4, $5, $6)", [
      actor,
      action,
      entity,
      entityId === null ? null : String(entityId),
      before === undefined ? null : JSON.stringify(before),
      after === undefined ? null : JSON.stringify(after),
    ]);
  } catch (e) {
    console.error("[audit] échec d'écriture :", e);
  }
}

/** Anti-force brute : nombre d'échecs récents pour un e-mail. */
export async function recentLoginFailures(email: string): Promise<number> {
  const rows = await q<{ n: string }>(
    `SELECT count(*)::text AS n FROM audit_log
     WHERE action = 'login_failed' AND entity_id = $1 AND created_at > now() - interval '15 minutes'`,
    [email.toLowerCase()],
  );
  return Number(rows[0]?.n ?? 0);
}
