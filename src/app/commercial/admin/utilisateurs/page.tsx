import { notFound } from "next/navigation";
import { UsersAdmin } from "@/components/admin/UsersAdmin";
import { canManageUsers, currentUser, type User } from "@/lib/admin/auth";
import { adminQuery } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/* Gestion des comptes — réservée au super-administrateur. */
export default async function UtilisateursPage() {
  const me = await currentUser();
  if (!me || !canManageUsers(me)) notFound();
  const users = await adminQuery<User>(
    "SELECT id, email, name, role, active, created_at, last_login_at FROM users ORDER BY active DESC, name",
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Utilisateurs</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">
          Chaque personne a son propre compte. Aucun mot de passe n&rsquo;est lisible, ni ici ni en base : en cas d&rsquo;oubli, réinitialisez-le.
        </p>
      </div>
      <UsersAdmin users={users.map(({ id, email, name, role, active, last_login_at }) => ({ id, email, name, role, active, last_login_at }))} me={me.id} />
    </div>
  );
}
