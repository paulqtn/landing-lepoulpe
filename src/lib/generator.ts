import type { IconName } from "@/components/Icon";

/* ------------------------------------------------------------------ */
/*  Lead generator — serializable config (safe server → client)        */
/* ------------------------------------------------------------------ */

export type GenOption = {
  value: string;
  label: string;
  desc?: string;
  icon?: IconName;
  /** Numeric hint used by the estimator (traffic midpoint, ad budget…). */
  weight?: number;
};

export type GenStep =
  | {
      kind: "single";
      id: string;
      question: string;
      help?: string;
      recapLabel: string;
      columns?: 1 | 2;
      options: GenOption[];
    }
  | {
      kind: "input";
      id: string;
      question: string;
      help?: string;
      recapLabel: string;
      inputType?: "text" | "url" | "email";
      placeholder?: string;
      prefix?: string;
    };

export type EstimateKind = "seo" | "sea" | "none";

export type GeneratorConfig = {
  /** e.g. "DIAGNOSTIC SEO · 1 MIN" */
  eyebrow: string;
  /** Floating badge on the dark panel, e.g. "AUDIT OFFERT" */
  panelBadge: string;
  panelTitle: string;
  recapTitle: string;
  estimateLabel: string;
  /** Shown in the estimate box before enough answers are given. */
  estimateHint: string;
  steps: GenStep[];
  guarantees: string[];
  estimate: EstimateKind;
  leadStep: {
    question: string;
    help?: string;
    recapLabel: string;
    submitLabel: string;
    consent: string;
  };
  successTitle: string;
  successText: string;
  successBullets: string[];
};

export type Answers = Record<string, string>;

export type EstimateResult = {
  ready: boolean;
  metrics: { label: string; value: string }[];
  gauge?: { from: number; to: number; max: number; label: string };
};

/* ------------------------------------------------------------------ */
/*  Estimation engine (pure, client-side)                              */
/* ------------------------------------------------------------------ */

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

function weightOf(
  steps: GenStep[],
  id: string,
  answers: Answers,
): number | undefined {
  const step = steps.find((s) => s.id === id);
  if (!step || step.kind !== "single") return undefined;
  return step.options.find((o) => o.value === answers[id])?.weight;
}

function estimateSeo(steps: GenStep[], answers: Answers): EstimateResult {
  const traffic = weightOf(steps, "trafic", answers);
  if (traffic == null) return { ready: false, metrics: [] };

  // Smaller sites have the most headroom → larger multiplier.
  const mult = traffic < 1000 ? 4 : traffic < 5000 ? 3 : traffic < 20000 ? 2.2 : 1.8;
  const add = traffic * (mult - 1);
  const baseScore = traffic < 1000 ? 34 : traffic < 5000 ? 46 : traffic < 20000 ? 58 : 66;

  return {
    ready: true,
    metrics: [
      {
        label: "Visiteurs/mois potentiels",
        value: `+${fmt(add * 0.8)} à +${fmt(add * 1.4)}`,
      },
    ],
    gauge: {
      from: baseScore,
      to: Math.min(94, baseScore + 38),
      max: 100,
      label: "Score de visibilité",
    },
  };
}

function estimateSea(steps: GenStep[], answers: Answers): EstimateResult {
  const budget = weightOf(steps, "budget", answers);
  if (budget == null) return { ready: false, metrics: [] };

  const cplLow = 18;
  const cplHigh = 45;
  return {
    ready: true,
    metrics: [
      {
        label: "Leads estimés / mois",
        value: `${fmt(budget / cplHigh)} à ${fmt(budget / cplLow)}`,
      },
      { label: "Coût par lead visé", value: `${cplLow}–${cplHigh} €` },
    ],
  };
}

export function computeEstimate(
  kind: EstimateKind,
  steps: GenStep[],
  answers: Answers,
): EstimateResult {
  if (kind === "seo") return estimateSeo(steps, answers);
  if (kind === "sea") return estimateSea(steps, answers);
  return { ready: false, metrics: [] };
}
