import { notFound } from "next/navigation";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { canManageUsers, currentUser, userMenus, type User } from "@/lib/admin/auth";
import { adminQuery } from "@/lib/admin/db";
import { EnTete } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/* Gestion des comptes — réservée au super-administrateur. */
export default async function UtilisateursPage() {
  const me = await currentUser();
  if (!me || !canManageUsers(me)) notFound();
  const users = await adminQuery<User>(
    "SELECT id, email, name, role, active, created_at, last_login_at, menus FROM users ORDER BY active DESC, name",
  );
  const parNom = Object.fromEntries((await adminQuery<{ assigned_to: string; n: string }>("SELECT assigned_to, count(*)::text AS n FROM leads WHERE assigned_to IS NOT NULL GROUP BY assigned_to")).map((r) => [r.assigned_to, Number(r.n)]));
  return (
    <div className="space-y-6">
      <EnTete titre="Utilisateurs" sous="Chaque personne a son propre compte, et vous choisissez menu par menu ce qu'elle peut ouvrir. Aucun mot de passe n'est lisible, ni ici ni en base : en cas d'oubli, réinitialisez-le." />
      <UsersAdmin users={users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, last_login_at: u.last_login_at ? new Date(u.last_login_at).toISOString() : null, clients: parNom[u.name] ?? 0, menus: userMenus(u), custom: u.menus !== null }))} me={me.id} />
    </div>
  );
}
