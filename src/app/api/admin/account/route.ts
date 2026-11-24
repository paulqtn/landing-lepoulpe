import { NextResponse } from "next/server";
import { PASSWORD_MIN, audit, hashPassword, userFromRequest, verifyPassword } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";

/* Chaque utilisateur change lui-même son mot de passe. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const current = typeof body.current === "string" ? body.current : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < PASSWORD_MIN)
    return NextResponse.json({ ok: false, error: `Nouveau mot de passe : ${PASSWORD_MIN} caractères minimum.` }, { status: 422 });
  const rows = await q<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [user.id]);
  if (!rows[0] || !(await verifyPassword(current, rows[0].password_hash)))
    return NextResponse.json({ ok: false, error: "Mot de passe actuel incorrect." }, { status: 401 });
  await q("UPDATE users SET password_hash = $2 WHERE id = $1", [user.id, await hashPassword(password)]);
  await audit(user.name, "password_change", "user", user.id);
  return NextResponse.json({ ok: true });
}
