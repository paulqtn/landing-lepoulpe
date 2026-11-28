"use client";

import { useRouter } from "next/navigation";
import { ArrowDownUp } from "lucide-react";

/** Tri de la liste des clients : un menu déroulant, pour ne pas ajouter une rangée de boutons. */
export function TriClients({ valeur, options }: { valeur: string; options: { cle: string; label: string; href: string }[] }) {
  const router = useRouter();
  return (
    <label className="inline-flex shrink-0 items-center gap-2 text-sm text-neutral-600">
      <ArrowDownUp className="h-4 w-4 text-neutral-500" aria-hidden />
      <span className="hidden sm:inline">Trier par</span>
      <select
        id="tri-clients"
        aria-label="Trier la liste"
        value={valeur}
        onChange={(e) => router.push(options.find((o) => o.cle === e.target.value)?.href ?? "/commercial/clients")}
        className="rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-inkgreen outline-none hover:border-pine-300 focus:border-pine-500"
      >
        {options.map((o) => (
          <option key={o.cle} value={o.cle}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
