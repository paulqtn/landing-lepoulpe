"use client";

import { useEffect, useRef, useState } from "react";

/* Nombre qui monte jusqu'à sa valeur à l'arrivée sur la page. Le serveur écrit déjà la vraie
   valeur : sans animation (ou si le système demande de les réduire), elle s'affiche telle quelle. */
const fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function Compteur({ valeur, suffixe = "", duree = 900 }: { valeur: number; suffixe?: string; duree?: number }) {
  const [n, setN] = useState(valeur);
  const cadre = useRef<number | null>(null);
  useEffect(() => {
    if (valeur === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(valeur);
    const debut = performance.now();
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / duree);
      setN(Math.round(valeur * (1 - Math.pow(1 - p, 3)))); // départ vif, arrivée douce
      if (p < 1) cadre.current = requestAnimationFrame(pas);
    };
    setN(0);
    cadre.current = requestAnimationFrame(pas);
    return () => { if (cadre.current) cancelAnimationFrame(cadre.current); };
  }, [valeur, duree]);
  return <span className="tabular-nums">{fmt.format(n)}{suffixe}</span>;
}
