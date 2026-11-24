"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, BellRing, Calculator, Factory, FileText, Home, KanbanSquare, LogOut, Settings2, SlidersHorizontal, UserCog, UserRound, Users,
} from "lucide-react";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { MENUS, type MenuKey } from "@/lib/admin/menus";

/* Navigation de l'espace commercial : sa home, ses sous-catégories et,
   selon le rôle, la partie administration. */

const ICONS: Record<MenuKey, typeof Home> = {
  etat: Home, devis: FileText, clients: Users, relances: BellRing, pipeline: KanbanSquare, production: Factory,
  stats: BarChart3, simulation: Calculator, calculateur: Settings2, tarifs: SlidersHorizontal, diagnostic: Activity,
};

type Item = { href: string; label: string; icon: typeof Home; exact?: boolean };

export function CommercialNav({ menus, superadmin, compact = false }: { menus: MenuKey[]; superadmin: boolean; compact?: boolean }) {
  const path = usePathname();
  // Seuls les menus ouverts à ce compte sont affichés (le serveur les vérifie aussi).
  const visible = MENUS.filter((m) => menus.includes(m.key));
  const toItem = (m: (typeof MENUS)[number]): Item => ({ href: m.href, label: m.label, icon: ICONS[m.key], exact: m.exact });
  const NAV = visible.filter((m) => m.group === "commercial").map(toItem);
  const admin: Item[] = [
    ...visible.filter((m) => m.group === "administration").map(toItem),
    ...(superadmin ? [{ href: "/commercial/admin/utilisateurs", label: "Utilisateurs", icon: UserCog }] : []),
  ];
  const all: Item[] = [...NAV, ...admin, { href: "/commercial/compte", label: "Mon compte", icon: UserRound }];
  const isOn = (n: { href: string; exact?: boolean }) => (n.exact ? path === n.href : path.startsWith(n.href));

  if (compact) {
    // Mobile : bandeau défilant, mêmes entrées que le menu latéral.
    return (
      <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" aria-label="Back office">
        {all.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
              isOn(n) ? "border-pine-700 bg-pine-700 text-white" : "border-neutral-200 bg-white text-neutral-700"
            }`}
          >
            <n.icon className="h-3.5 w-3.5" />
            {n.label}
          </Link>
        ))}
        <AdminLogout>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-500">
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </span>
        </AdminLogout>
      </nav>
    );
  }

  const item = (n: Item) => {
    const on = isOn(n);
    return (
      <Link
        key={n.href}
        href={n.href}
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          on ? "bg-pine-700 text-white" : "text-neutral-700 hover:bg-amber-500/15 hover:text-pine-950"
        }`}
      >
        <n.icon className={`h-4 w-4 ${on ? "text-amber-400" : "text-pine-600"}`} />
        {n.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="space-y-1">{NAV.map(item)}</nav>
      {admin.length > 0 && (
        <div className="mt-2 border-t border-neutral-100 pt-2">
          <p className="px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Administration</p>
          <nav className="space-y-1">{admin.map(item)}</nav>
        </div>
      )}
      <div className="mt-2 border-t border-neutral-100 pt-2">
        {item({ href: "/commercial/compte", label: "Mon compte", icon: UserRound })}
        <AdminLogout>
          <span className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </span>
        </AdminLogout>
      </div>
    </>
  );
}
