"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, BellRing, Boxes, Calculator, ClipboardList, Factory, FileText, Hammer, Home, KanbanSquare, LogOut, Megaphone, SlidersHorizontal, Truck, UserCog, UserRound, Users,
} from "lucide-react";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { GROUP_LABELS, MENUS, type MenuKey } from "@/lib/admin/menus";

/* Navigation de l'espace commercial : sa home, ses sous-catégories et,
   selon le rôle, la partie administration. */

const ICONS: Record<MenuKey, typeof Home> = {
  etat: Home, devis: FileText, clients: Users, relances: BellRing, pipeline: KanbanSquare, production: Factory,
  stats: BarChart3, simulation: Calculator,
  logistique: ClipboardList, commandes: Hammer, stock: Boxes, expeditions: Truck,
  tarifs: SlidersHorizontal, diagnostic: Activity,
};

type Item = { href: string; label: string; icon: typeof Home; exact?: boolean };

export function CommercialNav({ menus, superadmin, compact = false }: { menus: MenuKey[]; superadmin: boolean; compact?: boolean }) {
  const path = usePathname();
  // Seuls les menus ouverts à ce compte sont affichés (le serveur les vérifie aussi).
  // « Ma journée » réunit les devis à traiter et les rappels : ces deux listes quittent le menu
  // (elles restent accessibles depuis Ma journée). Sans Ma journée, elles restent au menu.
  const journee = menus.includes("etat");
  const visible = MENUS.filter((m) => menus.includes(m.key) && !(journee && (m.key === "devis" || m.key === "relances")));
  // Sur téléphone, l'entrée de la page en cours est amenée à l'écran.
  const actifRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => { if (compact) actifRef.current?.scrollIntoView({ inline: "center", block: "nearest" }); }, [compact, path]);
  const toItem = (m: (typeof MENUS)[number]): Item => ({ href: m.href, label: m.label, icon: ICONS[m.key], exact: m.exact });
  const groups = (["commercial", "logistique", "administration"] as const)
    .map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      items: [
        ...visible.filter((m) => m.group === g).map(toItem),
        ...(g === "administration" && superadmin
          ? [
              { href: "/commercial/admin/newsletter", label: "Newsletter", icon: Megaphone },
              { href: "/commercial/admin/utilisateurs", label: "Utilisateurs", icon: UserCog },
            ]
          : []),
      ],
    }))
    .filter((g) => g.items.length > 0);
  const account: Item = { href: "/commercial/compte", label: "Mon compte", icon: UserRound };
  const all: Item[] = [...groups.flatMap((g) => g.items), account];
  const isOn = (n: { href: string; exact?: boolean }) => (n.exact ? path === n.href : path.startsWith(n.href));

  if (compact) {
    // Mobile : bandeau défilant, mêmes entrées que le menu latéral.
    return (
      <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" aria-label="Back office">
        {all.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            ref={isOn(n) ? actifRef : undefined}
            aria-current={isOn(n) ? "page" : undefined}
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
      {groups.map((g, i) => (
        <div key={g.key} className={i === 0 ? "" : "mt-2 border-t border-neutral-100 pt-2"}>
          <p className="px-3 pb-1 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{g.label}</p>
          <nav className="space-y-1">{g.items.map(item)}</nav>
        </div>
      ))}
      <div className="mt-2 border-t border-neutral-100 pt-2">
        {item(account)}
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
