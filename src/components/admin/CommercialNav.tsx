"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BellRing, Factory, FileText, Home, KanbanSquare, LogOut, Settings2, Users } from "lucide-react";
import { AdminLogout } from "@/components/admin/AdminLogout";

/* Navigation de l'espace commercial : sa home et ses sous-catégories. */

const NAV = [
  { href: "/commercial", label: "État des lieux", icon: Home, exact: true },
  { href: "/commercial/devis", label: "Devis à traiter", icon: FileText, exact: false },
  { href: "/commercial/clients", label: "Clients", icon: Users, exact: false },
  { href: "/commercial/relances", label: "Relances", icon: BellRing, exact: false },
  { href: "/commercial/pipeline", label: "Pipeline", icon: KanbanSquare, exact: false },
  { href: "/commercial/production", label: "Production", icon: Factory, exact: false },
  { href: "/commercial/stats", label: "Statistiques", icon: BarChart3, exact: false },
];

export function CommercialNav() {
  const path = usePathname();
  return (
    <>
      <nav className="space-y-1">
        {NAV.map((n) => {
          const on = n.exact ? path === n.href : path.startsWith(n.href);
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
        })}
        <Link
          href="/calculateur"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-amber-500/15 hover:text-pine-950"
        >
          <Settings2 className="h-4 w-4 text-pine-600" />
          Calculateur interne
        </Link>
      </nav>
      <div className="mt-2 border-t border-neutral-100 pt-2">
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
