"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Minus, PencilRuler, PhoneCall, Plus, ThumbsUp } from "lucide-react";

/* Actions client de la page devis : valider, être rappelé, corriger ses cotes. */

const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DevisActions({
  token,
  systeme,
  usage,
  teinte,
  verre,
  cotes: cotesInit,
  hauteur: hauteurInit,
}: {
  token: string;
  systeme: string;
  usage?: string;
  teinte?: string;
  verre?: string;
  cotes: number[];
  hauteur: string;
}) {
  const [done, setDone] = useState<"valide" | "rappel" | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cotes, setCotes] = useState<string[]>(cotesInit.map(fmtM));
  const [hauteur, setHauteur] = useState(hauteurInit);
  const [apercu, setApercu] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const seq = useRef(0);

  const cotesNum = cotes.map((c) => parseFloat(c.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);

  // Aperçu du nouveau tarif pendant la correction des cotes.
  useEffect(() => {
    if (!editing || cotesNum.length === 0) return;
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/estimation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systeme, usage, teinte, verre, cotes: cotesNum, hauteur: Number(hauteur) }),
        });
        if (res.ok && seq.current === mine) setApercu((await res.json()).ttc);
      } catch {
        /* silencieux */
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, cotes.join("|"), hauteur]);

  async function action(path: "valider" | "rappel") {
    setBusy(true);
    const res = await fetch(`/api/d/${token}/${path}`, { method: "POST" });
    setBusy(false);
    if (res.ok) setDone(path === "valider" ? "valide" : "rappel");
  }

  async function enregistrer() {
    setBusy(true);
    const res = await fetch(`/api/d/${token}/maj`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cotes: cotesNum, hauteur: Number(hauteur) }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => window.location.reload(), 900);
    }
  }

  function bump(i: number, delta: number) {
    setCotes((cs) =>
      cs.map((c, j) => {
        if (j !== i) return c;
        const cur = parseFloat(c.replace(",", "."));
        return fmtM(Math.max(0.5, Math.round(((Number.isFinite(cur) ? cur : 1) + delta) * 2) / 2));
      }),
    );
  }

  if (done) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
        <p className="text-sm font-semibold text-green-800">
          {done === "valide"
            ? "C'est noté ! Un technicien vous appelle très vite pour valider vos cotes et lancer la fabrication."
            : "C'est noté ! Un conseiller vous rappelle au plus vite."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => action("valider")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-pine-950 shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
          Valider ce devis
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => action("rappel")}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pine-700 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pine-600 disabled:opacity-50"
        >
          <PhoneCall className="h-4 w-4" />
          Être rappelé
        </button>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-3.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
        >
          <PencilRuler className="h-4 w-4" />
          Corriger mes cotes
        </button>
      </div>

      {editing && (
        <div className="mt-5 border-t border-neutral-100 pt-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Vos longueurs</p>
          <div className="mt-2.5 space-y-2">
            {cotes.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Côté {i + 1}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button type="button" onClick={() => bump(i, -0.5)} aria-label="Réduire de 50 cm" className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-baseline gap-1 rounded-lg bg-mist px-1.5 py-1">
                    <input
                      value={c}
                      onChange={(e) => setCotes((cs) => cs.map((x, j) => (j === i ? e.target.value : x)))}
                      inputMode="decimal"
                      className="w-14 bg-transparent text-center text-base font-extrabold tabular-nums text-inkgreen outline-none"
                    />
                    <span className="text-xs font-bold text-neutral-400">m</span>
                  </div>
                  <button type="button" onClick={() => bump(i, 0.5)} aria-label="Augmenter de 50 cm" className="grid h-8 w-8 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {cotes.length < 6 && (
              <button type="button" onClick={() => setCotes((cs) => [...cs, "1,00"])} className="w-full rounded-xl border-2 border-dashed border-pine-300/70 px-3 py-2 text-sm font-bold text-pine-700 transition hover:border-pine-500 hover:bg-pine-50">
                + Ajouter un côté
              </button>
            )}
          </div>

          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Hauteur</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["90", "100", "110"].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHauteur(h)}
                className={`rounded-xl border px-2 py-2 text-sm font-bold transition ${hauteur === h ? "border-pine-600 bg-pine-50 text-pine-700 ring-1 ring-pine-600" : "border-neutral-200 text-inkgreen hover:border-pine-300"}`}
              >
                {h === "90" ? "0,90 m" : h === "100" ? "1,00 m" : "1,10 m"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-pine-50 px-4 py-3">
            <span className="text-sm font-semibold text-neutral-600">
              {apercu !== null ? (
                <>
                  Nouveau tarif : <strong className="text-lg font-extrabold tabular-nums text-pine-700">{eur.format(apercu)} € TTC</strong>
                </>
              ) : (
                "Calcul du nouveau tarif…"
              )}
            </span>
            <button
              type="button"
              disabled={busy || cotesNum.length === 0 || saved}
              onClick={enregistrer}
              className="rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-50"
            >
              {saved ? "Enregistré ✓" : busy ? "…" : "Enregistrer ces cotes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
