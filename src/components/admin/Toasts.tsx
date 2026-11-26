"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";

/* Messages courts de confirmation, affichés en haut de l'écran après une action
   (« Appel enregistré », « Affaire signée »…). Ils restent visibles où que l'on soit
   dans la page et disparaissent seuls. */

type Toast = { id: number; texte: string; erreur: boolean };
const EVT = "mgk:toast";

/** À appeler depuis n'importe quel composant du back office. */
export function toast(texte: string, erreur = false) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT, { detail: { texte, erreur } }));
}

export function Toasts() {
  const [liste, setListe] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    const recevoir = (e: Event) => {
      const d = (e as CustomEvent<{ texte: string; erreur: boolean }>).detail;
      const id = ++n;
      setListe((l) => [...l.slice(-2), { id, texte: d.texte, erreur: d.erreur }]);
      setTimeout(() => setListe((l) => l.filter((x) => x.id !== id)), d.erreur ? 8000 : 4500);
    };
    window.addEventListener(EVT, recevoir);
    return () => window.removeEventListener(EVT, recevoir);
  }, []);
  if (liste.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col items-center gap-2" aria-live="polite">
      {liste.map((t) => (
        <div key={t.id} role="status" className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-card ${t.erreur ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-white text-inkgreen"}`}>
          {t.erreur ? <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />}
          <span className="min-w-0 flex-1">{t.texte}</span>
          <button type="button" aria-label="Fermer" onClick={() => setListe((l) => l.filter((x) => x.id !== t.id))} className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
