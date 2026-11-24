import { NextResponse } from "next/server";
import { PASSWORD_MIN, ROLES, audit, destroyUserSessions, hashPassword, requireRole, type Role } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { sanitizeMenus } from "@/lib/admin/menus";

/* Modification d'un compte (rôle, activation, mot de passe) — super-administrateur uniquement.
   Un compte n'est jamais supprimé : il est désactivé, pour conserver l'historique. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireRole(req, ["superadmin"]);
  if (g.denied) return g.denied;
  const id = Number((await params).id);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const rows = await q<{ id: number; email: string; name: string; role: Role; active: boolean }>(
    "SELECT id, email, name, role, active FROM users WHERE id = $1",
    [id],
  );
  const target = rows[0];
  if (!target) return NextResponse.json({ ok: false, error: "Compte introuvable." }, { status: 404 });

  const role = body.role === undefined ? target.role : (ROLES.find((r) => r === body.role) as Role | undefined);
  const active = body.active === undefined ? target.active : body.active === true;
  if (!role) return NextResponse.json({ ok: false, error: "Rôle inconnu." }, { status: 422 });

  // Il doit toujours rester au moins un super-administrateur actif.
  const losesSuper = target.role === "superadmin" && target.active && (role !== "superadmin" || !active);
  if (losesSuper) {
    const others = await q("SELECT 1 FROM users WHERE role = 'superadmin' AND active AND id <> $1 LIMIT 1", [id]);
    if (!others.length)
      return NextResponse.json({ ok: false, error: "Impossible : c'est le dernier super-administrateur actif." }, { status: 409 });
  }

  let passwordChanged = false;
  if (body.password !== undefined) {
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < PASSWORD_MIN)
      return NextResponse.json({ ok: false, error: `Mot de passe : ${PASSWORD_MIN} caractères minimum.` }, { status: 422 });
    await q("UPDATE users SET password_hash = $2 WHERE id = $1", [id, await hashPassword(password)]);
    passwordChanged = true;
  }
  await q("UPDATE users SET role = $2, active = $3 WHERE id = $1", [id, role, active]);
  // Menus : sélection explicite, ou retour à la sélection de départ quand le rôle change.
  let menusChange: unknown = undefined;
  if (body.menus !== undefined) {
    const menus = body.menus === null ? null : sanitizeMenus(body.menus);
    await q("UPDATE users SET menus = $2 WHERE id = $1", [id, menus === null ? null : JSON.stringify(menus)]);
    menusChange = menus ?? "sélection du rôle";
  } else if (role !== target.role) {
    await q("UPDATE users SET menus = NULL WHERE id = $1", [id]);
    menusChange = "sélection du rôle";
  }
  // Toute modification sensible ferme les sessions ouvertes du compte concerné.
  if (passwordChanged || !active || role !== target.role) await destroyUserSessions(id);

  await audit(
    g.user.name,
    "user_update",
    "user",
    id,
    { role: target.role, active: target.active },
    { role, active, ...(passwordChanged ? { password: "réinitialisé" } : {}), ...(menusChange !== undefined ? { menus: menusChange } : {}) },
  );
  return NextResponse.json({ ok: true });
}
