"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, HelpCircle, Loader2, Lock, Minus, Pencil, Plus, Zap } from "lucide-react";
import { UsageGlyph } from "@/components/Illustrations";
import { usages } from "@/lib/catalog";
import { guarantees } from "@/lib/site";

/* ================================================================== */
/*  Configurateur client — un seul produit, le garde-corps en verre,   */
/*  configuré étape par étape. Le PRIX EXACT est calculé en direct     */
/*  par le moteur interne, côté serveur (/api/estimation) : le client  */
/*  ne voit que son prix fourniture TTC.                               */
/* ================================================================== */

const fmt = new Intl.NumberFormat("fr-FR");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const lieux = usages.map((u) => ({ value: u.slug, label: u.name }));

export type SystemeKey = "rail" | "pinces" | "spider";

const systemes: { value: SystemeKey | "conseil"; label: string; desc: string; photo?: string }[] = [
  { value: "rail", label: "Verre sur rail", desc: "Rail alu au sol, sans poteaux — le plus épuré", photo: "/verre-sur-rail.jpg" },
  { value: "pinces", label: "Verre sur pinces", desc: "Au sol ou sur muret — le classique", photo: "/pinces-au-sol.jpg" },
  { value: "spider", label: "Verre avec spider", desc: "Rotules traversantes — l'esprit architectural", photo: "/garde-corps-verre-fenetre-2.jpg" },
  { value: "conseil", label: "À me conseiller", desc: "Un expert vous oriente selon votre projet" },
];

const hauteurs = [
  { value: "90", label: "0,90 m", desc: "rampant escalier", glyph: 15 },
  { value: "100", label: "1,00 m", desc: "norme standard", glyph: 20 },
  { value: "110", label: "1,10 m", desc: "confort / piscine", glyph: 25 },
];

/** Teintes de verre — nuancier simple, sans jargon. */
const teintes = [
  { value: "clair", label: "Clair", desc: "le classique lumineux", swatch: "bg-gradient-to-br from-sky-50 to-pine-100/60 ring-pine-200" },
  { value: "extra-clair", label: "Extra-clair", desc: "sans reflet vert, haut de gamme", swatch: "bg-gradient-to-br from-white to-neutral-100 ring-neutral-200" },
  { value: "fume-1f", label: "Fumé une face", desc: "intimité côté extérieur", swatch: "bg-gradient-to-br from-neutral-300 to-neutral-400 ring-neutral-400" },
  { value: "fume-2f", label: "Fumé deux faces", desc: "l'effet miroir le plus marqué", swatch: "bg-gradient-to-br from-neutral-500 to-neutral-700 ring-neutral-500" },
] as const;

/** Forme du garde-corps selon le nombre de côtés : ligne, L, U, enceinte. */
function ShapeGlyph({ n, className }: { n: number; className?: string }) {
  const d =
    n <= 1 ? "M5 20 H35"
    : n === 2 ? "M8 6 V32 H35"
    : n === 3 ? "M8 6 V32 H32 V6"
    : "M13 6 H8 V32 H32 V6 H27";
  return (
    <svg viewBox="0 0 40 38" className={className} aria-hidden>
      <path d={d} fill="none" className="stroke-pine-700" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Panneau vu de côté avec flèche de hauteur — plus haut = plus protecteur. */
function HeightGlyph({ h, className }: { h: number; className?: string }) {
  const top = 30 - h;
  return (
    <svg viewBox="0 0 44 34" className={className} aria-hidden>
      <rect x={7} y={top} width={20} height={h} rx={1.5} className="fill-pine-100/70 stroke-pine-400" strokeWidth="1" />
      <rect x={4} y={30} width={26} height={3.5} rx={1.75} className="fill-pine-700" />
      <line x1={37} y1={top} x2={37} y2={30} className="stroke-pine-600" strokeWidth="1.5" />
      <line x1={34} y1={top} x2={40} y2={top} className="stroke-pine-600" strokeWidth="1.5" />
      <line x1={34} y1={30} x2={40} y2={30} className="stroke-pine-600" strokeWidth="1.5" />
    </svg>
  );
}

type Estimation = {
  ttc: number;
  ht: number;
  ttcMl: number;
  nbVerres: number;
  hauteurVerre: number;
  verre: string;
  longueurTotale: number;
  enlevementPossible: boolean;
};

type State = {
  lieu?: string;
  systeme?: SystemeKey | "conseil";
  cotes: string[];
  hauteur?: string;
  teinte?: (typeof teintes)[number]["value"];
};

export type ConfiguratorDefaults = {
  systeme?: SystemeKey;
  cotes?: number[];
  hauteur?: string;
};

const STEPS = ["Votre projet", "Système", "Longueurs", "Hauteur", "Teinte", "Coordonnées"] as const;

const fmtM = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Configurator({ defaults = {} }: { defaults?: ConfiguratorDefaults }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({
    systeme: defaults.systeme,
    cotes: defaults.cotes?.length ? defaults.cotes.map((c) => fmtM(c)) : ["3,00"],
    hauteur: defaults.hauteur,
  });
  const [lead, setLead] = useState({ name: "", email: "", phone: "", cp: "", consent: false });
  const [showErr, setShowErr] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const [est, setEst] = useState<Estimation | null>(null);
  const [estLoading, setEstLoading] = useState(false);
  const estSeq = useRef(0);

  const cotesNum = state.cotes.map((c) => parseFloat(c.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
  const totalMl = cotesNum.reduce((a, b) => a + b, 0);

  /* ---------- estimation live (moteur serveur, sortie assainie) ---------- */
  useEffect(() => {
    if (!state.systeme || state.systeme === "conseil" || cotesNum.length === 0 || !state.hauteur) {
      setEst(null);
      return;
    }
    const seq = ++estSeq.current;
    setEstLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/estimation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usage: state.lieu,
            systeme: state.systeme,
            cotes: cotesNum,
            hauteur: Number(state.hauteur),
            teinte: state.teinte ?? "clair",
            cp: lead.cp,
          }),
        });
        if (seq !== estSeq.current) return;
        setEst(res.ok ? await res.json() : null);
      } catch {
        if (seq === estSeq.current) setEst(null);
      } finally {
        if (seq === estSeq.current) setEstLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lieu, state.systeme, state.cotes.join("|"), state.hauteur, state.teinte, lead.cp]);

  const leadErrors = {
    name: lead.name.trim().length < 2,
    email: !EMAIL_RE.test(lead.email),
    phone: lead.phone.replace(/\D/g, "").length < 8,
    consent: !lead.consent,
  };

  const canContinue =
    step === 0 ? !!state.lieu
    : step === 1 ? !!state.systeme
    : step === 2 ? cotesNum.length > 0
    : step === 3 ? !!state.hauteur
    : step === 4 ? !!state.teinte
    : !Object.values(leadErrors).some(Boolean);

  function next() {
    if (step < 5) {
      if (canContinue) setStep((s) => s + 1);
      return;
    }
    void submit();
  }

  /** Ajuste un côté de ±0,50 m (minimum 0,50 m). */
  function bump(i: number, delta: number) {
    setState((s) => ({
      ...s,
      cotes: s.cotes.map((c, j) => {
        if (j !== i) return c;
        const cur = parseFloat(c.replace(",", "."));
        const base = Number.isFinite(cur) && cur > 0 ? cur : 0.5;
        return fmtM(Math.max(0.5, Math.round((base + delta) * 2) / 2));
      }),
    }));
  }

  /** Change le nombre de côtés (1 à 6), en conservant les valeurs saisies. */
  function setNbCotes(n: number) {
    const clamped = Math.min(6, Math.max(1, n));
    setState((s) => {
      const cotes = [...s.cotes];
      while (cotes.length < clamped) cotes.push("1,00");
      return { ...s, cotes: cotes.slice(0, clamped) };
    });
  }

  async function submit() {
    if (!canContinue) {
      setShowErr(true);
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          answers: {
            lieu: state.lieu,
            systeme: state.systeme,
            cotes: cotesNum,
            hauteur: state.hauteur,
            teinte: state.teinte,
            codePostal: lead.cp,
            estimationTTC: est?.ttc ?? null,
          },
          source: "configurateur-devis",
        }),
      });
    } catch {
      /* on confirme quand même côté UX */
    }
    setStatus("done");
  }

  const recapRows = [
    { label: "Projet", value: state.lieu ? `Garde-corps ${lieux.find((l) => l.value === state.lieu)?.label.toLowerCase()}` : null, go: 0 },
    { label: "Système", value: state.systeme ? systemes.find((m) => m.value === state.systeme)?.label : null, go: 1 },
    {
      label: "Longueurs",
      value: step > 2 && cotesNum.length > 0
        ? `${fmt.format(Math.round(totalMl * 100) / 100)} ml · ${cotesNum.length} côté${cotesNum.length > 1 ? "s" : ""}`
        : null,
      go: 2,
    },
    { label: "Hauteur", value: state.hauteur ? hauteurs.find((h) => h.value === state.hauteur)?.label : null, go: 3 },
    { label: "Teinte", value: state.teinte ? teintes.find((t) => t.value === state.teinte)?.label : null, go: 4 },
  ];

  const progress = status === "done" ? 100 : ((step + 1) / 6) * 100;
  const showPrice = est && state.systeme !== "conseil";

  return (
    <div className="relative">
      {/* sticker */}
      <span className="absolute -top-4 left-4 z-10 inline-flex rotate-[-3deg] items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-pine-950 shadow-md sm:-left-3">
        <Zap className="h-3.5 w-3.5" />
        Prix réel en direct
      </span>

      <div className="grid overflow-hidden rounded-3xl shadow-panel lg:grid-cols-[0.9fr_1.1fr]">
        {/* -------- récap + prix (gauche) -------- */}
        <div className="relative order-2 flex flex-col bg-pine-900 p-6 text-white sm:p-8 lg:order-1">
          <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pine-300">Votre projet</p>
            <h3 className="mt-1 text-2xl font-extrabold text-white">Récapitulatif</h3>
          </div>

          <div className="relative mt-5 space-y-2.5">
            {recapRows.every((r) => !r.value) && (
              <p className="rounded-2xl border border-dashed border-white/20 px-4 py-5 text-sm text-pine-100/60">
                Vos choix s’affichent ici au fur et à mesure.
              </p>
            )}
            {recapRows.map((r) =>
              r.value ? (
                <div key={r.label} className="flex animate-scale-in items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-pine-300">{r.label}</span>
                    <span className="block truncate text-sm font-semibold text-white">{r.value}</span>
                  </span>
                  {status !== "done" && (
                    <button
                      type="button"
                      onClick={() => setStep(r.go)}
                      className="inline-flex items-center gap-1 text-xs text-pine-200/70 transition hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                      modifier
                    </button>
                  )}
                </div>
              ) : null,
            )}
          </div>

          {/* prix fourniture calculé en direct */}
          <div className="relative mt-auto pt-6">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-pine-300">
                Votre prix fourniture
              </p>
              {showPrice ? (
                <>
                  <p key={est.ttc} className="mt-2 animate-scale-in text-3xl font-extrabold tabular-nums tracking-tight text-white">
                    {fmt.format(est.ttc)} € <span className="text-base font-bold text-pine-200">TTC</span>
                  </p>
                  <p className="mt-1 text-xs text-pine-100/60">
                    soit {fmt.format(est.ttcMl)} €/ml · {est.nbVerres} panneaux de verre {est.verre} ·
                    livraison incluse{est.enlevementPossible ? " (enlèvement possible)" : ""} · pose non comprise
                  </p>
                </>
              ) : state.systeme === "conseil" ? (
                <p className="mt-2 text-sm text-pine-100/60">
                  Un expert vous oriente et chiffre votre projet au devis — sous 24h.
                </p>
              ) : estLoading ? (
                <div className="mt-3 space-y-2">
                  <div className="shimmer h-2.5 w-3/4 rounded-full" />
                  <div className="shimmer h-2.5 w-1/2 rounded-full" />
                </div>
              ) : (
                <p className="mt-2 text-sm text-pine-100/60">
                  Choisissez un système, vos longueurs et la hauteur : le prix exact s’affiche ici.
                </p>
              )}
            </div>
            <ul className="mt-5 space-y-2">
              {guarantees.map((g) => (
                <li key={g} className="flex items-center gap-2 text-sm text-pine-100/80">
                  <Check className="h-4 w-4 shrink-0 text-green-400" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* -------- étapes (droite) -------- */}
        <div className="order-1 flex min-h-[30rem] flex-col bg-white p-6 sm:p-9 lg:order-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Devis gratuit · 1 min</p>
            {status !== "done" && (
              <p className="font-mono text-xs tabular-nums text-neutral-400">Étape {step + 1}/6</p>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-pine-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div key={status === "done" ? "done" : step} className="flex flex-1 animate-fade-up flex-col pt-7">
            {status === "done" ? (
              <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-pine-600 text-white">
                  <Check className="h-9 w-9" />
                </span>
                <h3 className="mt-6 text-2xl font-extrabold text-inkgreen">Demande bien reçue !</h3>
                <p className="mt-2 max-w-sm text-neutral-600">
                  Votre devis détaillé arrive sous 24h par email. Un conseiller vous appelle pour valider chaque cote.
                </p>
                <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
                  {["Devis détaillé poste par poste", "Cotes vérifiées avec un expert", "Sans engagement"].map((b) => (
                    <li key={b} className="flex items-center gap-3 rounded-xl bg-pine-50 px-4 py-3 text-sm font-semibold text-inkgreen">
                      <Check className="h-4 w-4 shrink-0 text-pine-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ) : step === 0 ? (
              <StepShell title="Votre projet ?" help="Où le garde-corps sera-t-il installé ?">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {lieux.map((l) => {
                    const on = state.lieu === l.value;
                    return (
                      <button
                        key={l.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { setState((s) => ({ ...s, lieu: l.value })); setStep(1); }}
                        className={`flex flex-col items-center gap-2.5 rounded-xl border px-3 py-4 transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <span className={`grid h-12 w-12 place-items-center rounded-xl transition-colors ${on ? "bg-pine-700 text-white" : "bg-pine-50 text-pine-700"}`}>
                          <UsageGlyph usage={l.value} className="h-7 w-7" />
                        </span>
                        <span className="text-sm font-bold text-inkgreen">{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : step === 1 ? (
              <StepShell title="Quel système ?" help="Trois façons de tenir le même verre feuilleté — chacune son style et son budget.">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {systemes.map((o) => {
                    const on = state.systeme === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { setState((s) => ({ ...s, systeme: o.value })); setStep(2); }}
                        className={`overflow-hidden rounded-xl border text-left transition ${on ? "border-pine-600 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <span className="relative block h-20">
                          {o.photo ? (
                            <Image src={o.photo} alt="" fill sizes="16rem" className="object-cover" />
                          ) : (
                            <span className="grid h-full place-items-center bg-mist">
                              <HelpCircle className="h-7 w-7 text-pine-600" />
                            </span>
                          )}
                          {on && (
                            <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-pine-600 text-white shadow-md">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span className="block px-3.5 py-2.5">
                          <span className={`block text-sm font-bold ${on ? "text-pine-700" : "text-inkgreen"}`}>{o.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{o.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : step === 2 ? (
              <StepShell title="Vos longueurs ?" help="Un côté = une longueur à équiper. Les angles entre côtés sont pris en charge automatiquement.">
                {/* nombre de côtés */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-mist/50 px-4 py-3.5">
                  <div className="flex items-center gap-3.5">
                    <ShapeGlyph n={cotesNum.length || state.cotes.length} className="h-10 w-10 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-inkgreen">
                        {state.cotes.length} côté{state.cotes.length > 1 ? "s" : ""}
                        {state.cotes.length > 1 && (
                          <span className="font-semibold text-neutral-500"> · {state.cotes.length - 1} angle{state.cotes.length > 2 ? "s" : ""} géré{state.cotes.length > 2 ? "s" : ""} auto</span>
                        )}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {state.cotes.length === 1 ? "En ligne droite" : state.cotes.length === 2 ? "En L" : state.cotes.length === 3 ? "En U" : "Forme complexe"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNbCotes(state.cotes.length - 1)}
                      disabled={state.cotes.length <= 1}
                      aria-label="Retirer un côté"
                      className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNbCotes(state.cotes.length + 1)}
                      disabled={state.cotes.length >= 6}
                      aria-label="Ajouter un côté"
                      className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* longueur de chaque côté */}
                <div className="mt-4 space-y-2.5">
                  {state.cotes.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine-50 font-mono text-xs font-bold text-pine-700">
                        {i + 1}
                      </span>
                      <span className="hidden text-xs font-semibold uppercase tracking-wide text-neutral-400 sm:block">
                        Côté {i + 1}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => bump(i, -0.5)}
                          aria-label={`Réduire le côté ${i + 1} de 50 cm`}
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex items-baseline gap-1 rounded-xl bg-mist px-2 py-1.5">
                          <input
                            value={c}
                            onChange={(e) => setState((s) => ({ ...s, cotes: s.cotes.map((x, j) => (j === i ? e.target.value : x)) }))}
                            inputMode="decimal"
                            aria-label={`Longueur du côté ${i + 1} en mètres`}
                            className="w-[4.5rem] bg-transparent text-center text-xl font-extrabold tabular-nums text-inkgreen outline-none"
                          />
                          <span className="text-sm font-bold text-neutral-400">m</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => bump(i, 0.5)}
                          aria-label={`Augmenter le côté ${i + 1} de 50 cm`}
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 flex items-baseline justify-between rounded-xl bg-pine-50 px-4 py-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-700">Longueur totale</span>
                  <span className="text-lg font-extrabold tabular-nums text-pine-700">
                    {fmt.format(Math.round(totalMl * 100) / 100)} ml
                  </span>
                </p>
              </StepShell>
            ) : step === 3 ? (
              <StepShell title="Quelle hauteur ?" help="Mesurée du sol fini au sommet du verre — 1,00 m est la hauteur de la norme.">
                <div className="grid grid-cols-3 gap-2.5">
                  {hauteurs.map((h) => {
                    const on = state.hauteur === h.value;
                    return (
                      <button
                        key={h.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { setState((s) => ({ ...s, hauteur: h.value })); setStep(4); }}
                        className={`flex flex-col items-center gap-2.5 rounded-xl border px-3 py-5 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <HeightGlyph h={h.glyph} className="h-12 w-14" />
                        <span>
                          <span className="block text-base font-bold text-inkgreen">{h.label}</span>
                          <span className="block text-[11px] text-neutral-500">{h.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : step === 4 ? (
              <StepShell title="Quelle teinte de verre ?" help="Le clair est le plus courant — les teintes fumées ajoutent intimité et caractère.">
                <div className="grid grid-cols-2 gap-2.5">
                  {teintes.map((t) => {
                    const on = state.teinte === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { setState((s) => ({ ...s, teinte: t.value })); setStep(5); }}
                        className={`flex items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <span className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ${t.swatch}`}>
                          <span className="absolute -left-1 top-0 h-16 w-2 rotate-12 bg-white/50" />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-bold ${on ? "text-pine-700" : "text-inkgreen"}`}>{t.label}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{t.desc}</span>
                        </span>
                        {on && (
                          <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-600 text-white">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : (
              <StepShell title="Où envoyer votre devis ?" help="Devis détaillé par email sous 24h + rappel d’un conseiller pour valider chaque cote.">
                <div className="space-y-3">
                  <Field label="Nom complet" value={lead.name} onChange={(v) => setLead((l) => ({ ...l, name: v }))} placeholder="Jean Dupont" autoComplete="name" error={showErr && leadErrors.name ? "Indiquez votre nom." : undefined} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Email" type="email" value={lead.email} onChange={(v) => setLead((l) => ({ ...l, email: v }))} placeholder="jean@email.fr" autoComplete="email" error={showErr && leadErrors.email ? "Email invalide." : undefined} />
                    <Field label="Téléphone" type="tel" value={lead.phone} onChange={(v) => setLead((l) => ({ ...l, phone: v }))} placeholder="06 12 34 56 78" autoComplete="tel" error={showErr && leadErrors.phone ? "Numéro invalide." : undefined} />
                  </div>
                  <Field label="Code postal du chantier (pour la livraison)" value={lead.cp} onChange={(v) => setLead((l) => ({ ...l, cp: v }))} placeholder="75001" autoComplete="postal-code" />
                  <label className="flex cursor-pointer items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      checked={lead.consent}
                      onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-pine-600"
                    />
                    <span className="text-xs leading-relaxed text-neutral-500">
                      J’accepte d’être recontacté au sujet de mon projet de garde-corps. Pas de spam, jamais.
                    </span>
                  </label>
                  {showErr && leadErrors.consent && (
                    <p className="text-xs font-semibold text-red-600">Merci d’accepter pour recevoir votre devis.</p>
                  )}
                </div>
              </StepShell>
            )}

            {status !== "done" && (
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-neutral-100 pt-5">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition hover:text-inkgreen disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={status === "loading" || (!canContinue && step < 4)}
                  className="group inline-flex items-center gap-2 rounded-full bg-pine-700 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-pine-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
                    </>
                  ) : step === 5 ? (
                    <>
                      Recevoir mon devis gratuit
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
            )}
            {step === 5 && status !== "done" && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                <Lock className="h-3.5 w-3.5" />
                Vos informations restent strictement confidentielles.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- sous-blocs ---------------------------- */

function StepShell({ title, help, children }: { title: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-2xl font-extrabold text-inkgreen">{title}</h3>
      {help && <p className="mt-1.5 text-neutral-500">{help}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-inkgreen outline-none transition placeholder:text-neutral-400 focus:ring-4 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-neutral-200 focus:border-pine-500 focus:ring-pine-500/10"}`}
      />
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}
