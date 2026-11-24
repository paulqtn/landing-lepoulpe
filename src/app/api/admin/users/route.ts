import { NextResponse } from "next/server";
import { PASSWORD_MIN, ROLES, audit, hashPassword, requireRole, type Role } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";

/* Création d'un compte — réservée au super-administrateur. */
export async function POST(req: Request) {
  const g = await requireRole(req, ["superadmin"]);
  if (g.denied) return g.denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = ROLES.find((r) => r === body.role) as Role | undefined;
  const password = typeof body.password === "string" ? body.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "E-mail invalide." }, { status: 422 });
  if (name.length < 2 || name.length > 40) return NextResponse.json({ ok: false, error: "Nom : 2 à 40 caractères." }, { status: 422 });
  if (!role) return NextResponse.json({ ok: false, error: "Rôle inconnu." }, { status: 422 });
  if (password.length < PASSWORD_MIN)
    return NextResponse.json({ ok: false, error: `Mot de passe : ${PASSWORD_MIN} caractères minimum.` }, { status: 422 });

  const dup = await q("SELECT 1 FROM users WHERE lower(email) = $1 OR lower(name) = lower($2)", [email, name]);
  if (dup.length) return NextResponse.json({ ok: false, error: "Cet e-mail ou ce nom est déjà utilisé." }, { status: 409 });

  const rows = await q<{ id: number }>(
    "INSERT INTO users (email, name, role, password_hash, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [email, name, role, await hashPassword(password), g.user.name],
  );
  await audit(g.user.name, "user_create", "user", rows[0].id, undefined, { email, name, role });
  return NextResponse.json({ ok: true, id: rows[0].id });
}
