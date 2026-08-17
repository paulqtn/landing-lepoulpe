"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Pencil, Zap } from "lucide-react";
import { usages } from "@/lib/catalog";
import { priceRanges, type MaterialSlug, type Pose } from "@/lib/pricing";
import { guarantees } from "@/lib/site";

/* ================================================================== */
/*  Configurateur de devis — 5 étapes, récap vert + estimation live    */
/* ================================================================== */

const fmt = new Intl.NumberFormat("fr-FR");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const lieux = usages.map((u) => ({ value: u.slug, label: u.name }));

const materiaux: { value: MaterialSlug | "conseil"; label: string; desc: string }[] = [
  { value: "verre", label: "Verre", desc: "Vue dégagée, feuilleté sécurisé" },
  { value: "aluminium", label: "Aluminium", desc: "Zéro entretien, meilleur prix" },
  { value: "inox", label: "Inox", desc: "Durable, esprit architectural" },
  { value: "conseil", label: "À me conseiller", desc: "Un expert vous oriente" },
];

const lineaires = [
  { value: "lt3", label: "Moins de 3 m", meters: 2 },
  { value: "3-6", label: "3 à 6 m", meters: 4.5 },
  { value: "6-12", label: "6 à 12 m", meters: 9 },
  { value: "gt12", label: "Plus de 12 m", meters: 15 },
];

const hauteurs = [
  { value: "90", label: "0,90 m", desc: "rampant escalier" },
  { value: "100", label: "1,00 m", desc: "norme standard" },
  { value: "110", label: "1,10 m", desc: "confort / piscine" },
];

const formules: { value: Pose | "unsure"; label: string; desc: string }[] = [
  { value: "kit", label: "Kit à poser moi-même", desc: "Livré prêt à poser, notice incluse" },
  { value: "pose", label: "Avec pose incluse", desc: "Par notre réseau de poseurs" },
  { value: "unsure", label: "Je ne sais pas encore", desc: "On compare les deux au devis" },
];

type State = {
  lieu?: string;
  materiau?: MaterialSlug | "conseil";
  lineaire?: string;
  hauteur?: string;
  formule?: Pose | "unsure";
};

const STEPS = ["Votre projet", "Matériau", "Dimensions", "Formule", "Coordonnées"] as const;

function estimateRange(s: State): { low: string; high: string; withPose: boolean } | null {
  if (!s.materiau || s.materiau === "conseil" || !s.lineaire) return null;
  const meters = lineaires.find((l) => l.value === s.lineaire)?.meters ?? 0;
  const r = priceRanges[s.materiau];
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
    : step === 1 ? !!state.materiau
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
    { label: "Matériau", value: state.materiau ? materiaux.find((m) => m.value === state.materiau)?.label : null, go: 1 },
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
                  <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-white">
                    {est.low} – {est.high} <span className="text-xl">€</span>
                  </p>
                  <p className="mt-1 text-xs text-pine-100/60">
                    {est.withPose ? "Fourniture + pose" : "Fourniture seule"} · à affiner avec un conseiller
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-pine-100/60">Choisissez un matériau et un linéaire pour estimer votre budget.</p>
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
                <OptionGrid options={lieux} selected={state.lieu} onSelect={(v) => { setState((s) => ({ ...s, lieu: v })); setStep(1); }} />
              </StepShell>
            ) : step === 1 ? (
              <StepShell title="Quel matériau ?" help="Chaque matériau a son style et son budget.">
                <OptionGrid
                  options={materiaux}
                  selected={state.materiau}
                  onSelect={(v) => { setState((s) => ({ ...s, materiau: v as State["materiau"] })); setStep(2); }}
                />
              </StepShell>
            ) : step === 2 ? (
              <StepShell title="Quelles dimensions ?" help="Une estimation suffit, on affine ensuite.">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">Linéaire à équiper</p>
                <div className="mt-2.5">
                  <OptionGrid options={lineaires} selected={state.lineaire} onSelect={(v) => setState((s) => ({ ...s, lineaire: v }))} />
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
                        className={`rounded-xl border px-3 py-3 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:border-pine-300"}`}
                      >
                        <span className="block text-sm font-bold text-inkgreen">{h.label}</span>
                        <span className="block text-[11px] text-neutral-500">{h.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            ) : step === 3 ? (
              <StepShell title="Kit ou pose incluse ?" help="Les deux formules figurent au devis si vous hésitez.">
                <OptionGrid
                  options={formules}
                  selected={state.formule}
                  columns={1}
                  onSelect={(v) => { setState((s) => ({ ...s, formule: v as State["formule"] })); setStep(4); }}
                />
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

function OptionGrid({
  options,
  selected,
  onSelect,
  columns = 2,
}: {
  options: { value: string; label: string; desc?: string }[];
  selected?: string;
  onSelect: (v: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2.5 ${columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
      {options.map((o) => {
        const on = selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(o.value)}
            className={`rounded-xl border px-4 py-3.5 text-left transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-pine-300"}`}
          >
            <span className="block text-sm font-bold text-inkgreen">{o.label}</span>
            {o.desc && <span className="mt-0.5 block text-xs text-neutral-500">{o.desc}</span>}
          </button>
        );
      })}
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
