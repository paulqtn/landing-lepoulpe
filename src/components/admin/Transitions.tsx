"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* Fluidité de navigation dans le back office :
   - une fine barre de progression en haut dès qu'on clique un lien interne, jusqu'à l'arrivée ;
   - le contenu de la page qui apparaît en douceur à chaque changement d'écran.
   Rien de tout cela ne joue quand le système demande de réduire les animations (voir globals.css). */

export function BarreNavigation() {
  const chemin = usePathname();
  const params = useSearchParams();
  const [active, setActive] = useState(false);
  const secours = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La page demandée est arrivée : la barre se termine.
  useEffect(() => {
    setActive(false);
    if (secours.current) clearTimeout(secours.current);
  }, [chemin, params]);

  useEffect(() => {
    const clic = (e: MouseEvent) => {
      // Écoute « en capture » : les liens du back office annulent eux-mêmes le clic pour naviguer sans recharger.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
      if (secours.current) clearTimeout(secours.current);
      secours.current = setTimeout(() => setActive(false), 5000); // jamais bloquée à l'écran
    };
    document.addEventListener("click", clic, true);
    return () => document.removeEventListener("click", clic, true);
  }, []);

  return <div aria-hidden className={`mgk-barre ${active ? "mgk-barre-active" : ""}`} />;
}

/** Contenu de la page : rejoué à chaque changement d'écran pour une entrée en douceur. */
export function EntreePage({ children }: { children: React.ReactNode }) {
  const chemin = usePathname();
  return (
    <div key={chemin} className="mgk-entree">
      {children}
    </div>
  );
}
