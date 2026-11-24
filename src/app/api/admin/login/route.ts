import { NextResponse } from "next/server";
import { ADMIN_COOKIE, audit, createSession, hashPassword, recentLoginFailures, verifyPassword } from "@/lib/admin/auth";
import { adminQuery as q, dbConfigured } from "@/lib/admin/db";

/* Connexion par e-mail + mot de passe. Aucun code partagé, aucun accès par défaut. */
export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ ok: false, error: "Base de données non connectée." }, { status: 503 });
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ ok: false, error: "Identifiants incomplets." }, { status: 400 });

  if ((await recentLoginFailures(email)) >= 8) {
    return NextResponse.json({ ok: false, error: "Trop de tentatives — réessayez dans 15 minutes." }, { status: 429 });
  }

  const rows = await q<{ id: number; name: string; password_hash: string }>(
    "SELECT id, name, password_hash FROM users WHERE lower(email) = $1 AND active",
    [email],
  );
  const user = rows[0];
  // Même coût de calcul que le compte existe ou non (pas d'indice sur les e-mails valides).
  const ok = user ? await verifyPassword(password, user.password_hash) : (await hashPassword(password), false);
  if (!user || !ok) {
    await audit(null, "login_failed", "user", email);
    return NextResponse.json({ ok: false, error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }

  const session = await createSession(user.id);
  await audit(user.name, "login", "user", user.id);
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
