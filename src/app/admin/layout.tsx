import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, LayoutDashboard, LogOut, PhoneCall, Settings2 } from "lucide-react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { isAdmin } from "@/lib/admin/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Back office — ${site.name}`,
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-mist px-5 py-16">
        <AdminLogin />
      </main>
    );
  }

  const nav = [
    { href: "/admin/jour", label: "Ma journée", icon: PhoneCall },
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Demandes de devis", icon: Inbox },
    { href: "/calculateur", label: "Calculateur interne", icon: Settings2 },
  ];

  return (
    <main className="min-h-screen bg-mist">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="px-3 pb-2 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Back office
            </p>
            <nav className="space-y-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-amber-500/15 hover:text-pine-950"
                >
                  <n.icon className="h-4 w-4 text-pine-600" />
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 border-t border-neutral-100 pt-2">
              <AdminLogout>
                <span className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-red-50 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </span>
              </AdminLogout>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
