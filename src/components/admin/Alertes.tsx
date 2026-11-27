"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellOff, X } from "lucide-react";

/* Alertes en direct : une cloche sonne et un message s'affiche quand une demande arrive
   ou qu'un client valide son devis en ligne. L'écran interroge le serveur toutes les
   30 secondes, uniquement quand l'onglet est visible. */

type Alerte = { cle: string; titre: string; texte: string; href: string; son?: "notif" };
const PERIODE = 30_000;

function sonner(ctx: AudioContext) {
  // Deux coups de cloche : fondamentale + harmoniques, extinction lente.
  [0, 0.45].forEach((retard) => {
    [[880, 0.5], [1760, 0.25], [2640, 0.12]].forEach(([freq, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const t = ctx.currentTime + retard;
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.5);
    });
  });
}

/** Notification brève à l'arrivée d'un e-mail : trois notes courtes, façon téléphone (moins d'une seconde). */
function notification(ctx: AudioContext) {
  [[1318.5, 0], [1046.5, 0.13], [1568, 0.26]].forEach(([freq, retard]) => {
    [[1, 0.22], [2, 0.05]].forEach(([harmonique, vol]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const t = ctx.currentTime + retard;
      o.type = "sine";
      o.frequency.value = freq * harmonique;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    });
  });
}

export function Alertes({ depuis }: { depuis: string }) {
  const router = useRouter();
  const since = useRef(depuis);
  const vues = useRef(new Set<string>());
  const audio = useRef<AudioContext | null>(null);
  const [liste, setListe] = useState<Alerte[]>([]);
  const [son, setSon] = useState(true);
  const sonRef = useRef(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem("mgk-cloche") !== "non";
      setSon(v);
      sonRef.current = v;
    } catch {}
    // Les navigateurs n'autorisent le son qu'après un premier geste sur la page.
    const debloquer = () => {
      try {
        audio.current ??= new AudioContext();
        if (audio.current.state === "suspended") void audio.current.resume();
      } catch {}
    };
    window.addEventListener("pointerdown", debloquer);
    window.addEventListener("keydown", debloquer);
    return () => {
      window.removeEventListener("pointerdown", debloquer);
      window.removeEventListener("keydown", debloquer);
    };
  }, []);

  const sonnerNotification = useCallback(() => {
    const ctx = audio.current;
    if (!ctx) return;
    if (ctx.state !== "running") void ctx.resume().then(() => ctx.state === "running" && notification(ctx)).catch(() => {});
    else notification(ctx);
  }, []);

  const cloche = useCallback(() => {
    const ctx = audio.current;
    if (!ctx) return;
    if (ctx.state !== "running") {
      // Contexte encore en veille : on le réveille puis on sonne (sans effet si le navigateur refuse).
      void ctx.resume().then(() => ctx.state === "running" && sonner(ctx)).catch(() => {});
      return;
    }
    sonner(ctx);
  }, []);

  useEffect(() => {
    let arret = false;
    async function verifier() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`/api/admin/alerts?since=${encodeURIComponent(since.current)}`, { cache: "no-store" });
        if (!res.ok || arret) return;
        const data = (await res.json()) as { now: string; alertes: Alerte[] };
        since.current = data.now;
        const nouvelles = data.alertes.filter((a) => !vues.current.has(a.cle));
        if (nouvelles.length === 0) return;
        nouvelles.forEach((a) => vues.current.add(a.cle));
        setListe((l) => [...nouvelles, ...l].slice(0, 5));
        // Tout ce qui vient de la messagerie (e-mail reçu, e-mail urgent, réponse prête) joue la
        // notification brève ; une demande du site ou un devis validé garde la cloche.
        if (sonRef.current) (nouvelles.every((a) => a.cle.startsWith("mail-")) ? sonnerNotification : cloche)();
        router.refresh();
      } catch {}
    }
    const timer = setInterval(verifier, PERIODE);
    const retour = () => document.visibilityState === "visible" && verifier();
    document.addEventListener("visibilitychange", retour);
    return () => {
      arret = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", retour);
    };
  }, [cloche, sonnerNotification, router]);

  useEffect(() => {
    // Le compteur dans le titre de l'onglet est reposé régulièrement : un changement de page le remet à zéro.
    const poser = () => {
      const base = document.title.replace(/^\(\d+\) /, "");
      const voulu = liste.length ? `(${liste.length}) ${base}` : base;
      if (document.title !== voulu) document.title = voulu;
    };
    poser();
    const t = setInterval(poser, 1500);
    return () => clearInterval(t);
  }, [liste]);

  return (
    <>
      <button
        type="button"
        title={son ? "Cloche activée : cliquer pour couper le son" : "Cloche coupée : cliquer pour l'activer"}
        aria-pressed={son}
        onClick={() => {
          const v = !son;
          setSon(v);
          sonRef.current = v;
          try {
            localStorage.setItem("mgk-cloche", v ? "oui" : "non");
          } catch {}
          if (v) setTimeout(cloche, 50);
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition ${son ? "border-pine-200 bg-pine-50 text-pine-800" : "border-neutral-200 bg-white text-neutral-500"}`}
      >
        {son ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{son ? "Cloche activée" : "Cloche coupée"}</span>
      </button>
      {liste.length > 0 && (
        <div className="fixed inset-x-3 top-3 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-80" role="status" aria-live="polite">
          {liste.map((a) => (
            <div key={a.cle} className="flex items-start gap-3 rounded-2xl border border-amber-500/50 bg-white p-3 shadow-card">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500 text-pine-950"><Bell className="h-4 w-4" /></span>
              <Link href={a.href} onClick={() => setListe((l) => l.filter((x) => x.cle !== a.cle))} className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-inkgreen">{a.titre}</span>
                <span className="block truncate text-xs text-neutral-600">{a.texte}</span>
              </Link>
              <button type="button" aria-label="Fermer" onClick={() => setListe((l) => l.filter((x) => x.cle !== a.cle))} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
