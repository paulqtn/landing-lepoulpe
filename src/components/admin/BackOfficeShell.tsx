import Link from "next/link";
import { Alertes } from "@/components/admin/Alertes";
import { Toasts } from "@/components/admin/Toasts";
import { SuiviNavigation } from "@/components/admin/FicheBoutons";
import { TelephoneProvider } from "@/components/admin/Telephone";
import { site } from "@/lib/site";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { CommercialNav } from "@/components/admin/CommercialNav";
import { ROLE_LABELS, countUsers, currentUser, hasMenu, setupTokenConfigured, userMenus } from "@/lib/admin/auth";
import { dbConfigured } from "@/lib/admin/db";

/* Coquille commune aux espaces du back office (commercial, logistique) :
   connexion, puis menu latéral limité aux menus ouverts à ce compte. */
export async function BackOfficeShell({ children }: { children: React.ReactNode }) {
  const gate = (node: React.ReactNode) => <main className="mgk-bo grid min-h-[70vh] place-items-center bg-mist px-5 py-16">{node}</main>;

  if (!dbConfigured) return gate(<AdminLogin mode="nodb" />);

  const user = await currentUser();
  if (!user) {
    let users: number;
    try {
      users = await countUsers();
    } catch (e) {
      return gate(<AdminLogin mode="dberror" detail={e instanceof Error ? e.message : undefined} />);
    }
    if (users === 0) return gate(<AdminLogin mode={setupTokenConfigured() ? "setup" : "setup-token-missing"} />);
    return gate(<AdminLogin mode="login" />);
  }

  return (
    <main className="mgk-bo min-h-screen bg-mist">
      <Toasts />
      <SuiviNavigation />
      {/* Barre du haut toujours visible : cloche, téléphone (sur mobile) et retour au site. */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-inkgreen">
            {site.name} <span className="font-semibold text-neutral-400">· back office</span>
          </p>
          <span id="mgk-tel-barre" className="contents" />
          <Alertes depuis={new Date().toISOString()} />
          <Link href="/" className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-pine-300 hover:text-pine-700">
            Voir le site
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-16 rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="mx-3 mb-2 inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-xs font-bold text-pine-800" title={ROLE_LABELS[user.role]}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {user.name}
            </p>
            <CommercialNav menus={userMenus(user)} superadmin={user.role === "superadmin"} />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 md:hidden">
            <CommercialNav menus={userMenus(user)} superadmin={user.role === "superadmin"} compact />
          </div>
          {/* Téléphone intégré : proposé à ceux qui suivent des clients, chargé seulement s'ils l'activent. */}
          <TelephoneProvider visible={hasMenu(user, "clients") || hasMenu(user, "etat")}>{children}</TelephoneProvider>
        </div>
      </div>
    </main>
  );
}
