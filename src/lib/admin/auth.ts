import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* ================================================================== */
/*  Auth du back office : code d'accès + cookie signé (HMAC).          */
/*  ADMIN_ACCESS_CODE à définir dans Vercel (défaut aligné sur le      */
/*  calculateur interne).                                              */
/* ================================================================== */

export const ADMIN_COOKIE = "mgk_admin";
const SESSION_HOURS = 12;

function accessCode(): string {
  return process.env.ADMIN_ACCESS_CODE ?? "HULK";
}

function secret(): string {
  return process.env.ADMIN_SECRET ?? `sign:${accessCode()}`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function checkCode(code: string): boolean {
  const expected = accessCode();
  const a = Buffer.from(code);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeSession(): string {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  return `${exp}.${sign(String(exp))}`;
}

export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const good = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Garde pour les Server Components du back office. */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

/** Garde pour les routes /api/admin/* : renvoie null si OK, sinon une 401. */
export function requireAdmin(req: Request): Response | null {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  if (verifySession(token)) return null;
  return Response.json({ error: "non autorisé" }, { status: 401 });
}
