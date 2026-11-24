import { NextResponse } from "next/server";
import { ADMIN_COOKIE, PASSWORD_MIN, audit, checkSetupToken, countUsers, createSession, hashPassword } from "@/lib/admin/auth";
import { adminQuery as q, dbConfigured } from "@/lib/admin/db";

/* Création du tout premier compte (super-administrateur).
   Possible uniquement tant qu'aucun compte n'existe, et sur présentation du
   jeton ADMIN_SETUP_TOKEN défini dans Vercel. Ensuite la route se ferme. */
export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ ok: false, error: "Base de données non connectée." }, { status: 503 });
  if ((await countUsers()) > 0) return NextResponse.json({ ok: false, error: "L'initialisation est déjà faite." }, { status: 409 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!checkSetupToken(token)) return NextResponse.json({ ok: false, error: "Jeton d'initialisation invalide." }, { status: 401 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "E-mail invalide." }, { status: 422 });
  if (name.length < 2 || name.length > 40) return NextResponse.json({ ok: false, error: "Nom : 2 à 40 caractères." }, { status: 422 });
  if (password.length < PASSWORD_MIN)
    return NextResponse.json({ ok: false, error: `Mot de passe : ${PASSWORD_MIN} caractères minimum.` }, { status: 422 });

  // Insertion conditionnelle : impossible de créer deux « premiers » comptes en parallèle.
  const rows = await q<{ id: number }>(
    `INSERT INTO users (email, name, role, password_hash, created_by)
     SELECT $1, $2, 'superadmin', $3, 'initialisation'
     WHERE NOT EXISTS (SELECT 1 FROM users)
     RETURNING id`,
    [email, name, await hashPassword(password)],
  );
  if (!rows[0]) return NextResponse.json({ ok: false, error: "L'initialisation est déjà faite." }, { status: 409 });

  await audit(name, "setup_superadmin", "user", rows[0].id, undefined, { email, name, role: "superadmin" });
  const session = await createSession(rows[0].id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  return res;
}
