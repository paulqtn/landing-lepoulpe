import { NextResponse } from "next/server";
import { PASSWORD_MIN, ROLES, audit, destroyUserSessions, hashPassword, requireRole, type Role } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { sanitizeMenus } from "@/lib/admin/menus";

/* Modification d'un compte (rôle, activation, mot de passe) — super-administrateur uniquement.
   Désactiver un compte conserve tout ; le supprimer (DELETE) retire le compte et redistribue ses clients. */
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

/* Suppression définitive d'un compte. Ses clients sont remis dans la file ou confiés à un
   autre compte : aucune fiche, aucun devis ni aucun historique n'est supprimé. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireRole(req, ["superadmin"]);
  if (g.denied) return g.denied;
  const id = Number((await params).id);
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}
  const target = (await q<{ id: number; email: string; name: string; role: Role; active: boolean }>("SELECT id, email, name, role, active FROM users WHERE id = $1", [id]))[0];
  if (!target) return NextResponse.json({ ok: false, error: "Compte introuvable." }, { status: 404 });
  if (target.id === g.user.id) return NextResponse.json({ ok: false, error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 409 });
  if (body.confirmEmail !== target.email) return NextResponse.json({ ok: false, error: "Confirmation incomplète : rechargez la page." }, { status: 409 });
  if (target.role === "superadmin" && target.active) {
    const others = await q("SELECT 1 FROM users WHERE role = 'superadmin' AND active AND id <> $1 LIMIT 1", [id]);
    if (!others.length) return NextResponse.json({ ok: false, error: "Impossible : c'est le dernier super-administrateur actif." }, { status: 409 });
  }
  // Destination de ses clients : la file (null) ou un autre compte actif.
  let cible: string | null = null;
  if (typeof body.clients === "string" && body.clients) {
    const dest = (await q<{ name: string }>("SELECT name FROM users WHERE name = $1 AND active AND id <> $2 AND role <> 'logisticien'", [body.clients, id]))[0];
    if (!dest) return NextResponse.json({ ok: false, error: "Le compte qui doit reprendre ses clients est introuvable ou inactif." }, { status: 422 });
    cible = dest.name;
  }
  // Un homonyme garde ses propres clients : on ne touche aux fiches que si le nom est unique.
  const homonyme = (await q("SELECT 1 FROM users WHERE name = $1 AND id <> $2 LIMIT 1", [target.name, id])).length > 0;
  const deplaces = homonyme ? [] : await q<{ id: number }>("UPDATE leads SET assigned_to = $2 WHERE assigned_to = $1 RETURNING id", [target.name, cible]);
  await q("DELETE FROM users WHERE id = $1", [id]); // ses sessions partent avec lui
  await audit(g.user.name, "user_delete", "user", id, { email: target.email, name: target.name, role: target.role }, { clients: deplaces.length, repris_par: cible ?? "file" });
  return NextResponse.json({ ok: true, clients: deplaces.length });
}
