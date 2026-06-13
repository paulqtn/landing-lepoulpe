"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Pencil,
  Sparkles,
} from "lucide-react";
import { Icon } from "@/components/Icon";
import {
  type Answers,
  type GenStep,
  type GeneratorConfig,
  computeEstimate,
} from "@/lib/generator";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadForm = { name: string; email: string; phone: string; consent: boolean };

export function LeadGenerator({
  config,
  className = "",
}: {
  config: GeneratorConfig;
  className?: string;
}) {
  const total = config.steps.length + 1; // + lead step
  const leadIndex = config.steps.length;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const estimate = useMemo(
    () => computeEstimate(config.estimate, config.steps, answers),
    [config.estimate, config.steps, answers],
  );

  const onLead = current === leadIndex;
  const step = onLead ? null : config.steps[current];

  const leadErrors = {
    name: lead.name.trim().length < 2,
    email: !EMAIL_RE.test(lead.email),
    phone: lead.phone.replace(/\D/g, "").length < 8,
    consent: !lead.consent,
  };

  const canContinue = onLead
    ? !Object.values(leadErrors).some(Boolean)
    : step!.kind === "single"
      ? Boolean(answers[step!.id])
      : (answers[step!.id]?.trim().length ?? 0) > 2;

  function setAnswer(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function next() {
    if (onLead) return submit();
    if (canContinue) setCurrent((c) => Math.min(c + 1, leadIndex));
  }

  async function submit() {
    if (!canContinue) {
      setShowErrors(true);
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, answers, source: config.eyebrow }),
      });
    } catch {
      // Network errors shouldn't lose the lead UX; we still confirm.
    }
    setStatus("done");
  }

  const progress = status === "done" ? 100 : ((current + 1) / total) * 100;

  return (
    <div
      className={`overflow-hidden rounded-4xl bg-white shadow-floating ring-1 ring-slate-900/5 ${className}`}
    >
      <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
        {/* ---------------------------------------------------------- */}
        {/*  LEFT — live recap "dashboard" panel                        */}
        {/* ---------------------------------------------------------- */}
        <div className="relative order-2 flex flex-col gap-6 bg-gradient-to-br from-ink via-ink-2 to-ink px-6 pb-7 pt-16 text-white sm:px-8 lg:order-1 lg:pt-20">
          <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-50" />
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-poulpe-500/25 blur-3xl" />

          {/* floating sticker badge */}
          <span className="absolute left-6 top-6 inline-flex rotate-[-3deg] items-center gap-1.5 rounded-xl bg-gradient-to-br from-poulpe-400 to-poulpe-600 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-glow">
            <Sparkles className="h-3.5 w-3.5" />
            {config.panelBadge}
          </span>

          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-widest text-poulpe-300">
              {config.panelTitle}
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-white">
              {config.recapTitle}
            </h3>
          </div>

          {/* recap rows */}
          <div className="relative space-y-2.5">
            {config.steps.filter((s) => answers[s.id]).length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm text-slate-400">
                Vos réponses s’affichent ici au fur et à mesure.
              </p>
            )}
            {config.steps.map((s, i) =>
              answers[s.id] ? (
                <RecapRow
                  key={s.id}
                  label={s.recapLabel}
                  value={valueLabel(s, answers[s.id])}
                  onEdit={() => {
                    setStatus("idle");
                    setCurrent(i);
                  }}
                />
              ) : null,
            )}
          </div>

          {/* estimate box */}
          <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-poulpe-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-poulpe-500" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
                {config.estimateLabel}
              </p>
            </div>

            {estimate.ready ? (
              <div className="mt-3 space-y-3">
                {estimate.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-2xl font-extrabold tabular-nums text-white">
                      {m.value}
                    </p>
                    <p className="text-xs text-slate-400">{m.label}</p>
                  </div>
                ))}
                {estimate.gauge && <Gauge {...estimate.gauge} />}
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-slate-400">{config.estimateHint}</p>
                <div className="mt-3 space-y-2">
                  <div className="shimmer h-2.5 w-3/4 rounded-full" />
                  <div className="shimmer h-2.5 w-1/2 rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* guarantees */}
          <ul className="relative space-y-2">
            {config.guarantees.map((g) => (
              <li key={g} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-poulpe-400" />
                {g}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------------------------------------------------------- */}
        {/*  RIGHT — steps                                             */}
        {/* ---------------------------------------------------------- */}
        <div className="order-1 flex min-h-[30rem] flex-col px-6 py-7 sm:px-9 sm:py-9 lg:order-2">
          {/* header */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
              {config.eyebrow}
            </p>
            {status !== "done" && (
              <p className="text-xs font-semibold tabular-nums text-slate-400">
                Étape {current + 1}/{total}
              </p>
            )}
          </div>
          {/* progress */}
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-poulpe-500 to-flame transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* body */}
          <div className="flex flex-1 flex-col pt-8">
            {status === "done" ? (
              <Success config={config} />
            ) : onLead ? (
              <LeadFields
                config={config}
                lead={lead}
                setLead={setLead}
                errors={leadErrors}
                showErrors={showErrors}
              />
            ) : (
              <StepBody
                step={step!}
                value={answers[step!.id] ?? ""}
                onSingle={(v) => setAnswer(step!.id, v)}
                onInput={(v) => setAnswer(step!.id, v)}
                onEnter={next}
              />
            )}

            {/* footer */}
            {status !== "done" && (
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-ink disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>

                <button
                  type="button"
                  onClick={next}
                  disabled={status === "loading" || (!canContinue && !onLead)}
                  className="group inline-flex items-center gap-2 rounded-full bg-poulpe-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-poulpe-500/30 transition-all hover:bg-poulpe-600 hover:shadow-poulpe-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi…
                    </>
                  ) : onLead ? (
                    <>
                      {config.leadStep.submitLabel}
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

            {onLead && status !== "done" && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
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

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function valueLabel(step: GenStep, value: string): string {
  if (step.kind === "single") {
    return step.options.find((o) => o.value === value)?.label ?? value;
  }
  return value;
}

function RecapRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex animate-scale-in items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-poulpe-500 text-white">
        <Check className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-white">
          {value}
        </span>
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-poulpe-300"
      >
        <Pencil className="h-3 w-3" />
        modifier
      </button>
    </div>
  );
}

function Gauge({
  from,
  to,
  max,
  label,
}: {
  from: number;
  to: number;
  max: number;
  label: string;
}) {
  return (
    <div className="pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold tabular-nums text-white">
          {from} → {to}/{max}
        </span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-poulpe-500 to-flame"
          style={{ width: `${(to / max) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-white/60"
          style={{ left: `${(from / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StepBody({
  step,
  value,
  onSingle,
  onInput,
  onEnter,
}: {
  step: GenStep;
  value: string;
  onSingle: (v: string) => void;
  onInput: (v: string) => void;
  onEnter: () => void;
}) {
  return (
    <div className="animate-fade-up">
      <h3 className="text-2xl font-extrabold text-ink sm:text-[1.7rem]">
        {step.question}
      </h3>
      {step.help && <p className="mt-2 text-slate-500">{step.help}</p>}

      {step.kind === "single" ? (
        <div
          className={`mt-6 grid gap-3 ${
            (step.columns ?? 2) === 2 ? "sm:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {step.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSingle(opt.value)}
                aria-pressed={selected}
                className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? "border-poulpe-500 bg-poulpe-50 ring-1 ring-poulpe-500"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-poulpe-300 hover:bg-poulpe-50/40"
                }`}
              >
                {opt.icon && (
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition ${
                      selected
                        ? "bg-poulpe-500 text-white ring-poulpe-500"
                        : "bg-slate-50 text-poulpe-600 ring-slate-100"
                    }`}
                  >
                    <Icon name={opt.icon} className="h-5 w-5" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {opt.label}
                  </span>
                  {opt.desc && (
                    <span className="block text-xs text-slate-500">
                      {opt.desc}
                    </span>
                  )}
                </span>
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                    selected
                      ? "border-poulpe-500 bg-poulpe-500 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative mt-6">
          {step.prefix && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-slate-400">
              {step.prefix}
            </span>
          )}
          <input
            autoFocus
            type={step.inputType ?? "text"}
            value={value}
            placeholder={step.placeholder}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEnter()}
            className={`w-full rounded-2xl border border-slate-200 bg-white py-4 text-base text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:border-poulpe-400 focus:ring-4 focus:ring-poulpe-500/10 ${
              step.prefix ? "pl-[4.75rem] pr-4" : "px-4"
            }`}
          />
        </div>
      )}
    </div>
  );
}

function LeadFields({
  config,
  lead,
  setLead,
  errors,
  showErrors,
}: {
  config: GeneratorConfig;
  lead: LeadForm;
  setLead: React.Dispatch<React.SetStateAction<LeadForm>>;
  errors: { name: boolean; email: boolean; phone: boolean; consent: boolean };
  showErrors: boolean;
}) {
  return (
    <div className="animate-fade-up">
      <h3 className="text-2xl font-extrabold text-ink sm:text-[1.7rem]">
        {config.leadStep.question}
      </h3>
      {config.leadStep.help && (
        <p className="mt-2 text-slate-500">{config.leadStep.help}</p>
      )}

      <div className="mt-6 space-y-4">
        <Field
          label="Nom complet"
          value={lead.name}
          onChange={(v) => setLead((l) => ({ ...l, name: v }))}
          placeholder="Jean Dupont"
          autoComplete="name"
          error={showErrors && errors.name ? "Indiquez votre nom." : undefined}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email professionnel"
            type="email"
            value={lead.email}
            onChange={(v) => setLead((l) => ({ ...l, email: v }))}
            placeholder="jean@entreprise.fr"
            autoComplete="email"
            error={showErrors && errors.email ? "Email invalide." : undefined}
          />
          <Field
            label="Téléphone"
            type="tel"
            value={lead.phone}
            onChange={(v) => setLead((l) => ({ ...l, phone: v }))}
            placeholder="06 12 34 56 78"
            autoComplete="tel"
            error={showErrors && errors.phone ? "Numéro invalide." : undefined}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 pt-1">
          <input
            type="checkbox"
            checked={lead.consent}
            onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-poulpe-500 accent-poulpe-500"
          />
          <span className="text-xs leading-relaxed text-slate-500">
            {config.leadStep.consent}
          </span>
        </label>
        {showErrors && errors.consent && (
          <p className="text-xs font-medium text-poulpe-700">
            Merci d’accepter pour être recontacté.
          </p>
        )}
      </div>
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
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-poulpe-400 focus:border-poulpe-500 focus:ring-poulpe-500/10"
            : "border-slate-200 focus:border-poulpe-400 focus:ring-poulpe-500/10"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-poulpe-700">{error}</span>}
    </label>
  );
}

function Success({ config }: { config: GeneratorConfig }) {
  return (
    <div className="flex flex-1 animate-scale-in flex-col items-center justify-center py-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-poulpe-500 text-white shadow-glow">
        <Check className="h-9 w-9" />
      </span>
      <h3 className="mt-6 text-2xl font-extrabold text-ink">
        {config.successTitle}
      </h3>
      <p className="mt-2 max-w-sm text-slate-600">{config.successText}</p>

      <ul className="mt-7 w-full max-w-sm space-y-2.5 text-left">
        {config.successBullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-3 rounded-xl bg-poulpe-50 px-4 py-3 text-sm font-medium text-ink"
          >
            <Check className="h-4 w-4 shrink-0 text-poulpe-600" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
