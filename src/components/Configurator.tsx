"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, HardHat, HelpCircle, Loader2, Lock, Package, Pencil, Zap } from "lucide-react";
import { UsageGlyph } from "@/components/Illustrations";
import { usages } from "@/lib/catalog";
import type { Pose } from "@/lib/pricing";
import { guarantees } from "@/lib/site";

/* ================================================================== */
/*  Configurateur de devis — un seul produit, le garde-corps en verre, */
/*  configuré étape par étape : lieu, système, dimensions, formule.    */
/*  Récap vert + estimation discrète, utilisé sur l'accueil et /devis. */
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

/** Fourchettes €/ml par système de fixation (fourniture / posé). */
const systemRanges: Record<SystemeKey, Record<Pose, [number, number]>> = {
  rail: { kit: [320, 450], pose: [500, 800] },
  pinces: { kit: [250, 380], pose: [450, 650] },
  spider: { kit: [300, 430], pose: [480, 750] },
};

const lineaires = [
  { value: "lt3", label: "0 à 3 m", meters: 2, panels: 2 },
  { value: "3-6", label: "3 à 6 m", meters: 4.5, panels: 4 },
  { value: "6-12", label: "6 à 12 m", meters: 9, panels: 6 },
  { value: "gt12", label: "Plus de 12 m", meters: 15, panels: 9 },
];

const hauteurs = [
  { value: "90", label: "0,90 m", desc: "rampant escalier", glyph: 15 },
  { value: "100", label: "1,00 m", desc: "norme standard", glyph: 20 },
  { value: "110", label: "1,10 m", desc: "confort / piscine", glyph: 25 },
];

const formules: { value: Pose | "unsure"; label: string; desc: string; icon: typeof Package }[] = [
  { value: "kit", label: "Kit à poser", desc: "Livré pré-percé, notice et visserie incluses", icon: Package },
  { value: "pose", label: "Avec pose incluse", desc: "Par notre réseau de poseurs partenaires", icon: HardHat },
  { value: "unsure", label: "Je ne sais pas encore", desc: "On compare les deux formules au devis", icon: HelpCircle },
];

/** Travée de garde-corps vue de face : n panneaux de verre sur profil bas. */
function PanelsGlyph({ panels, className }: { panels: number; className?: string }) {
  const w = 72;
  const gap = 2.5;
  const pw = (w - gap * (panels - 1)) / panels;
  return (
    <svg viewBox="0 0 72 34" className={className} aria-hidden>
      {Array.from({ length: panels }).map((_, i) => (
        <rect
          key={i}
          x={i * (pw + gap)}
          y={4}
          width={pw}
          height={24}
          rx={1.5}
          className="fill-pine-100/70 stroke-pine-400"
          strokeWidth="1"
        />
      ))}
      <rect x={0} y={30} width={w} height={3.5} rx={1.75} className="fill-pine-700" />
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

type State = {
  lieu?: string;
  systeme?: SystemeKey | "conseil";
  lineaire?: string;
  hauteur?: string;
  formule?: Pose | "unsure";
};

const STEPS = ["Votre projet", "Système", "Dimensions", "Formule", "Coordonnées"] as const;

function estimateRange(s: State): { low: string; high: string; withPose: boolean } | null {
  if (!s.systeme || s.systeme === "conseil" || !s.lineaire) return null;
  const meters = lineaires.find((l) => l.value === s.lineaire)?.meters ?? 0;
  const r = systemRanges[s.systeme];
  const pose: Pose | null = s.formule === "kit" || s.formule === "pose" ? s.formule : null;
  const low = (pose ? r[pose][0] : r.kit[0]) * meters;
  const high = (pose ? r[pose][1] : r.pose[1]) * meters;
  const round10 = (n: number) => Math.round(n / 10) * 10;
  return { low: fmt.format(round10(low)), high: fmt.format(round10(high)), withPose: pose !== "kit" };
}

export function Configurator({ defaults = {} }: { defaults?: State }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>(defaults);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", cp: "", consent: false });
  const [showErr, setShowErr] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const est = estimateRange(state);

  const leadErrors = {
    name: lead.name.trim().length < 2,
    email: !EMAIL_RE.test(lead.email),
    phone: lead.phone.replace(/\D/g, "").length < 8,
    consent: !lead.consent,
  };

  const canContinue =
    step === 0 ? !!state.lieu
    : step === 1 ? !!state.systeme
    : step === 2 ? !!state.lineaire && !!state.hauteur
    : step === 3 ? !!state.formule
    : !Object.values(leadErrors).some(Boolean);

  function next() {
    if (step < 4) {
      if (canContinue) setStep((s) => s + 1);
      return;
    }
    void submit();
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
          answers: { ...state, codePostal: lead.cp },
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
      label: "Dimensions",
      value: state.lineaire && state.hauteur
        ? `${lineaires.find((l) => l.value === state.lineaire)?.label} · ${hauteurs.find((h) => h.value === state.hauteur)?.label}`
        : null,
      go: 2,
    },
    { label: "Formule", value: state.formule ? formules.find((f) => f.value === state.formule)?.label : null, go: 3 },
  ];

  const progress = status === "done" ? 100 : ((step + 1) / 5) * 100;

  return (
    <div className="relative">
      {/* sticker */}
      <span className="absolute -top-4 left-4 z-10 inline-flex rotate-[-3deg] items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-pine-950 shadow-md sm:-left-3">
        <Zap className="h-3.5 w-3.5" />
        Devis immédiat
      </span>

      <div className="grid overflow-hidden rounded-3xl shadow-panel lg:grid-cols-[0.9fr_1.1fr]">
        {/* -------- récap (gauche) -------- */}
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

          {/* estimation */}
          <div className="relative mt-auto pt-6">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-pine-300">Estimation indicative</p>
              {est ? (
                <>
                  <p className="mt-2 text-xl font-extrabold tabular-nums tracking-tight text-white">
                    {est.low} – {est.high} €
                  </p>
                  <p className="mt-1 text-xs text-pine-100/60">
                    {est.withPose ? "Fourniture + pose" : "Fourniture seule"} · à affiner avec un conseiller
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-pine-100/60">Choisissez un système et un linéaire pour estimer votre budget.</p>
                  <div className="mt-3 space-y-2">
                    <div className="shimmer h-2.5 w-3/4 rounded-full" />
                    <div className="shimmer h-2.5 w-1/2 rounded-full" />
                  </div>
                </>
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
              <p className="font-mono text-xs tabular-nums text-neutral-400">Étape {step + 1}/5</p>
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
                  Votre devis détaillé arrive sous 24h par email. Un conseiller vous appelle pour affiner votre projet.
                </p>
                <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
                  {["Devis détaillé poste par poste", "Conseils d’un expert garde-corps", "Sans engagement"].map((b) => (
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
              <StepShell title="Quelles dimensions ?" help="Une estimation suffit, on affine ensuite.">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Linéaire à équiper</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {lineaires.map((l) => {
                    const on = state.lineaire === l.value;
                    return (
                      <button
                        key={l.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setState((s) => ({ ...s, lineaire: l.value }))}
                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <PanelsGlyph panels={l.panels} className="h-9 w-full" />
                        <span className="text-sm font-bold text-inkgreen">{l.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Hauteur souhaitée</p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  {hauteurs.map((h) => {
                    const on = state.hauteur === h.value;
                    return (
                      <button
                        key={h.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setState((s) => ({ ...s, hauteur: h.value }))}
                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <HeightGlyph h={h.glyph} className="h-9 w-11" />
                        <span>
                          <span className="block text-sm font-bold text-inkgreen">{h.label}</span>
                          <span className="block text-[11px] text-neutral-500">{h.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : step === 3 ? (
              <StepShell title="Kit ou pose incluse ?" help="Les deux formules figurent au devis si vous hésitez.">
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {formules.map((f) => {
                    const on = state.formule === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => { setState((s) => ({ ...s, formule: f.value as State["formule"] })); setStep(4); }}
                        className={`flex flex-col items-center gap-3 rounded-xl border px-4 py-5 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
                      >
                        <span className={`grid h-12 w-12 place-items-center rounded-xl transition-colors ${on ? "bg-pine-700 text-white" : "bg-pine-50 text-pine-700"}`}>
                          <f.icon className="h-6 w-6" />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-inkgreen">{f.label}</span>
                          <span className="mt-1 block text-xs leading-snug text-neutral-500">{f.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : (
              <StepShell title="Où envoyer votre devis ?" help="Devis détaillé par email sous 24h + rappel d’un conseiller.">
                <div className="space-y-3">
                  <Field label="Nom complet" value={lead.name} onChange={(v) => setLead((l) => ({ ...l, name: v }))} placeholder="Jean Dupont" autoComplete="name" error={showErr && leadErrors.name ? "Indiquez votre nom." : undefined} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Email" type="email" value={lead.email} onChange={(v) => setLead((l) => ({ ...l, email: v }))} placeholder="jean@email.fr" autoComplete="email" error={showErr && leadErrors.email ? "Email invalide." : undefined} />
                    <Field label="Téléphone" type="tel" value={lead.phone} onChange={(v) => setLead((l) => ({ ...l, phone: v }))} placeholder="06 12 34 56 78" autoComplete="tel" error={showErr && leadErrors.phone ? "Numéro invalide." : undefined} />
                  </div>
                  <Field label="Code postal du chantier (optionnel)" value={lead.cp} onChange={(v) => setLead((l) => ({ ...l, cp: v }))} placeholder="75001" autoComplete="postal-code" />
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
                  ) : step === 4 ? (
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
            {step === 4 && status !== "done" && (
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
