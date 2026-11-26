"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Handshake } from "lucide-react";
import { toast } from "./Toasts";

/* Petits boutons de la fiche client qui ont besoin du navigateur. */

/** Ouvre la confirmation de signature (gérée par le panneau d'actions de la fiche). */
export function ConclureVente({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("mgk:conclure"))} className={className}>
      <Handshake className="h-4 w-4" /> Conclure la vente
    </button>
  );
}

const CLE_PREC = "mgk-page-precedente";
const CLE_COUR = "mgk-page-courante";

/** À placer une fois dans le back office : retient la page précédente pour le bouton « Retour ». */
export function SuiviNavigation() {
  const chemin = usePathname();
  /* Renvoi depuis une page réservée : on l'explique, puis on nettoie l'adresse. */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("refus") !== "1") return;
    url.searchParams.delete("refus");
    window.history.replaceState(null, "", url.pathname + url.search);
    const t = setTimeout(() => toast("Cette page ne vous est pas ouverte : vous avez été ramené ici. Demandez l'accès à votre administrateur si vous en avez besoin.", true), 150);
    return () => clearTimeout(t);
  }, [chemin]);
  useEffect(() => {
    try {
      const ici = window.location.pathname + window.location.search;
      const avant = sessionStorage.getItem(CLE_COUR);
      if (avant && avant !== ici) sessionStorage.setItem(CLE_PREC, avant);
      sessionStorage.setItem(CLE_COUR, ici);
    } catch {}
  }, [chemin]);
  return null;
}

/** Retour à l'écran d'où l'on vient (liste des devis, relances, clients…), sinon à la liste des clients. */
export function RetourLien({ defaut, label = "Retour" }: { defaut: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        let cible = defaut;
        try {
          const avant = sessionStorage.getItem(CLE_PREC);
          // On ne revient qu'à une liste du back office, jamais à un devis ou à une autre fiche (boucles).
          if (avant && /^\/(commercial|logistique)(\/(devis|clients|relances|pipeline|production|stats))?(\?.*)?$/.test(avant)) cible = avant;
        } catch {}
        router.push(cible);
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition hover:text-inkgreen"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
