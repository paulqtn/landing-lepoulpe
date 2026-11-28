import { Suspense } from "react";
import Link from "next/link";
import { BarreNavigation, EntreePage } from "@/components/admin/Transitions";
import { Alertes } from "@/components/admin/Alertes";
import { Toasts } from "@/components/admin/Toasts";
import { SuiviNavigation } from "@/components/admin/FicheBoutons";
import { TelephoneProvider } from "@/components/admin/Telephone";
import { VeilleMessagerie } from "@/components/admin/messagerie/Veille";
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
      <Suspense fallback={null}>
        <BarreNavigation />
      </Suspense>
      <Toasts />
      <SuiviNavigation />
      {hasMenu(user, "messagerie") && <VeilleMessagerie />}

      {/* Menu : collé au bord gauche, sur toute la hauteur de l'écran. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-100 px-5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-pine-700 text-xs font-extrabold text-amber-400">{site.name.charAt(0)}</span>
          <p className="min-w-0 truncate text-sm font-extrabold leading-tight text-inkgreen">
            {site.name}
            <span className="block text-[11px] font-semibold text-neutral-600">Back office</span>
          </p>
        </div>
        <div className="mgk-defile min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <CommercialNav menus={userMenus(user)} superadmin={user.role === "superadmin"} />
        </div>
        <p className="flex shrink-0 items-center gap-2 border-t border-neutral-100 px-5 py-3 text-sm font-bold text-inkgreen" title={ROLE_LABELS[user.role]}>
          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-50 text-xs font-extrabold text-pine-800">
            {user.name.charAt(0).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
          </span>
          <span className="min-w-0">
            <span className="block truncate">{user.name}</span>
            <span className="block truncate text-[11px] font-semibold text-neutral-600">{ROLE_LABELS[user.role]}</span>
          </span>
        </p>
      </aside>

      <div className="md:pl-64">
        {/* Barre du haut toujours visible : cloche, téléphone (sur mobile) et retour au site. */}
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/85 backdrop-blur">
          <div className="flex h-14 w-full items-center gap-3 px-4 sm:px-6 xl:px-8">
            <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-inkgreen md:invisible">
              {site.name} <span className="font-semibold text-neutral-600">· back office</span>
            </p>
            <span id="mgk-tel-barre" className="contents" />
            <Alertes depuis={new Date().toISOString()} />
            <Link href="/" className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-pine-300 hover:text-pine-700">
              Voir le site
            </Link>
          </div>
        </div>
        <div className="w-full px-4 py-6 sm:px-6 xl:px-8">
          <div className="mb-4 md:hidden">
            <CommercialNav menus={userMenus(user)} superadmin={user.role === "superadmin"} compact />
          </div>
          {/* Téléphone intégré : proposé à ceux qui suivent des clients, chargé seulement s'ils l'activent. */}
          <TelephoneProvider visible={hasMenu(user, "clients") || hasMenu(user, "etat")}>
            <EntreePage>{children}</EntreePage>
          </TelephoneProvider>
        </div>
      </div>
    </main>
  );
}
