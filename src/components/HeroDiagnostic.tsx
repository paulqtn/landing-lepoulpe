"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

type Answers = Record<string, string>;

const steps = [
  {
    id: "objectif",
    question: "Votre objectif principal ?",
    options: [
      { value: "leads", label: "Générer des leads" },
      { value: "ventes", label: "Vendre en ligne" },
      { value: "visibilite", label: "Gagner en visibilité" },
      { value: "tout", label: "Accélérer globalement" },
    ],
  },
  {
    id: "canal",
    question: "Vous pensez à quel levier ?",
    options: [
      { value: "seo", label: "Référencement (SEO)" },
      { value: "google", label: "Google Ads" },
      { value: "social", label: "Meta / TikTok Ads" },
      { value: "unsure", label: "Je ne sais pas encore" },
    ],
  },
  {
    id: "budget",
    question: "Votre budget mensuel ?",
    options: [
      { value: "s", label: "Moins de 1 000 €" },
      { value: "m", label: "1 000 – 3 000 €" },
      { value: "l", label: "3 000 – 8 000 €" },
      { value: "xl", label: "Plus de 8 000 €" },
    ],
  },
];

function recommend(answers: Answers) {
  const big = answers.budget === "l" || answers.budget === "xl";
  switch (answers.canal) {
    case "seo":
      return {
        title: "Stratégie SEO",
        reason:
          "Une visibilité durable sur Google et des leads de moins en moins chers dans le temps.",
        href: "/seo/strategie-seo",
        cta: "la stratégie SEO",
      };
    case "google":
      return {
        title: "Google Ads",
        reason:
          "Des leads rapides, pilotés au coût par lead, dès le lancement des campagnes.",
        href: "/ads/audit-google-ads",
        cta: "Google Ads",
      };
    case "social":
      return {
        title: "Publicité Meta & TikTok",
        reason:
          "Capter une audience qualifiée à coût maîtrisé, avec des créas qui convertissent.",
        href: "/ads/meta-ads",
        cta: "la publicité sociale",
      };
    default:
      return {
        title: big ? "Accompagnement tout inclus" : "Audit stratégique gratuit",
        reason:
          "On définit la meilleure stratégie d’acquisition pour vos objectifs et votre budget.",
        href: "/offre",
        cta: big ? "l’offre tout inclus" : "l’audit gratuit",
      };
  }
}

export function HeroDiagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const answered = Object.keys(answers).length;

  function select(value: string) {
    const id = steps[step].id;
    setAnswers((a) => ({ ...a, [id]: value }));
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setDone(true);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  const rec = done ? recommend(answers) : null;

  return (
    <div className="border border-neutral-900 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-900 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">
          Diagnostic express
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* progress */}
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full ${
                i < answered ? "bg-poulpe-500" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {rec ? (
          <div className="pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-poulpe-500">
              Notre recommandation
            </span>
            <h3 className="mt-2 font-grotesk text-2xl font-bold text-neutral-900">
              {rec.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {rec.reason}
            </p>
            <Link
              href={rec.href}
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500"
            >
              Découvrir {rec.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="mt-3 flex w-full items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <RotateCcw className="h-3 w-3" />
              Recommencer
            </button>
          </div>
        ) : (
          <div className="pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-grotesk text-lg font-bold text-neutral-900">
                {steps[step].question}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                {step + 1}/{steps.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {steps[step].options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => select(o.value)}
                  className="group flex w-full items-center justify-between gap-3 rounded-md border border-neutral-300 px-4 py-3 text-left text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50"
                >
                  {o.label}
                  <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-poulpe-500" />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-neutral-900"
              >
                <ArrowLeft className="h-3 w-3" />
                Retour
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
