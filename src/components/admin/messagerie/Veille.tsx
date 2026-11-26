"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Veille de la messagerie : tant que le back office est ouvert (quelle que soit la page), la
   boîte du commercial est synchronisée et la file de tâches avance. Sur l'écran de la
   messagerie, c'est l'écran lui-même qui s'en charge. Sans boîte connectée, la veille s'arrête. */
export function VeilleMessagerie() {
  const chemin = usePathname();
  useEffect(() => {
    if (chemin.startsWith("/commercial/messagerie")) return;
    let arret = false;
    const passage = async () => {
      if (arret || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/admin/messagerie/tick", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" });
        if (res.status === 409 || res.status === 403 || res.status === 401) arret = true; // pas de boîte, ou menu fermé
      } catch {}
    };
    const debut = setTimeout(passage, 20_000);
    const t = setInterval(passage, 180_000);
    return () => { arret = true; clearTimeout(debut); clearInterval(t); };
  }, [chemin]);
  return null;
}
