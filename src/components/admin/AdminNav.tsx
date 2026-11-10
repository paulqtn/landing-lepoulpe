"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Home, PhoneCall, Settings2 } from "lucide-react";

/* Navigation du back office : Accueil + les 3 pôles, avec état actif. */

const NAV = [
  { href: "/admin", label: "Accueil", icon: Home, exact: true },
  { href: "/admin/commercial", label: "Commercial", icon: PhoneCall, exact: false },
  { href: "/admin/gestion", label: "Gestion", icon: Boxes, exact: false },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3, exact: false },
];

export function AdminNav() {
  const path = usePathname();
  const isActive = (n: (typeof NAV)[number]) =>
    n.exact
      ? path === n.href
      : path.startsWith(n.href) ||
        // Les écrans leads/jour appartiennent au pôle commercial.
        (n.href === "/admin/commercial" && (path.startsWith("/admin/leads") || path.startsWith("/admin/jour")));

  return (
    <nav className="space-y-1">
      {NAV.map((n) => {
        const on = isActive(n);
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
  );
}
