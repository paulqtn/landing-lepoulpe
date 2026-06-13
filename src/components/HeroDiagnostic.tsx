"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

type Answers = Record<string, string>;

type Step =
  | { id: string; type: "single"; question: string; options: { value: string; label: string }[] }
  | { id: string; type: "site"; question: string };

const steps: Step[] = [
  { id: "site", type: "site", question: "Votre site web actuel ?" },
  {
    id: "google",
    type: "single",
    question: "Vous trouve-t-on sur Google ?",
    options: [
      { value: "well", label: "Oui, plutôt bien" },
      { value: "some", label: "Un peu" },
      { value: "none", label: "Pas vraiment" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "ads",
    type: "single",
    question: "Faites-vous déjà de la publicité ?",
    options: [
      { value: "google", label: "Oui, Google Ads" },
      { value: "social", label: "Oui, Meta / réseaux" },
      { value: "expensive", label: "Oui, mais ça coûte cher" },
      { value: "none", label: "Non, jamais" },
    ],
  },
  {
    id: "frein",
    type: "single",
    question: "Votre principal frein aujourd’hui ?",
    options: [
      { value: "visibility", label: "Pas assez de visibilité" },
      { value: "conversion", label: "Du trafic, mais peu de conversions" },
      { value: "cost", label: "Des leads trop chers" },
      { value: "presence", label: "Pas assez de présence en ligne" },
    ],
  },
];

function recommend(answers: Answers) {
  if (answers.site === "none" || answers.frein === "presence") {
    return {
      title: "Accompagnement tout inclus",
      reason:
        "On pose d’abord un site qui convertit, puis on déploie toute votre acquisition — payé aux résultats.",
      href: "/offre",
      cta: "l’offre tout inclus",
    };
  }
  if (answers.frein === "cost" || answers.ads === "expensive") {
    return answers.ads === "social"
      ? {
          title: "Publicité Meta & TikTok",
          reason:
            "Des leads souvent bien moins chers, avec des créas qui convertissent.",
          href: "/ads/meta-ads",
          cta: "la publicité sociale",
        }
      : {
          title: "Audit Google Ads",
          reason:
            "On audite vos campagnes pour faire baisser votre coût par lead.",
          href: "/ads/audit-google-ads",
          cta: "l’audit Google Ads",
        };
  }
  if (answers.frein === "conversion") {
    return {
      title: "Optimisation & accompagnement",
      reason:
        "Vous avez du trafic : on optimise votre offre, vos pages et vos tunnels pour convertir davantage.",
      href: "/offre",
      cta: "l’accompagnement",
    };
  }
  return {
    title: "Stratégie SEO",
    reason:
      "Construisons une visibilité durable sur Google — avec des objectifs au contrat.",
    href: "/seo/strategie-seo",
    cta: "la stratégie SEO",
  };
}

export function HeroDiagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [siteInput, setSiteInput] = useState("");
  const [done, setDone] = useState(false);

  const current = steps[step];
  const answered = Object.keys(answers).length;
  const siteValid = siteInput.trim().length > 2;
  const rec = done ? recommend(answers) : null;

  function advanceWith(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setDone(true);
  }

  function reset() {
    setAnswers({});
    setSiteInput("");
    setStep(0);
    setDone(false);
  }

  return (
    <div className="flex min-h-[30rem] flex-col bg-ink text-white">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
          Diagnostic express
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* progress */}
        <div className="flex shrink-0 gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`h-1 flex-1 rounded-full ${i < answered ? "bg-poulpe-500" : "bg-white/15"}`}
            />
          ))}
        </div>

        {/* body — keyed for a smooth fade between steps */}
        <div
          key={done ? "result" : `step-${step}`}
          className="flex-1 animate-fade-up pt-6"
        >
          {rec ? (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-poulpe-400">
                Notre recommandation
              </span>
              <h3 className="mt-2 font-grotesk text-2xl font-bold text-white">
                {rec.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {rec.reason}
              </p>
              <Link
                href={rec.href}
                className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-poulpe-500 hover:text-white"
              >
                Découvrir {rec.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="mt-3 flex w-full items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                Recommencer
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-grotesk text-lg font-bold text-white">
                  {current.question}
                </h3>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                  {step + 1}/{steps.length}
                </span>
              </div>

              {current.type === "single" ? (
                <div className="mt-4 space-y-2">
                  {current.options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => advanceWith(current.id, o.value)}
                      className="group flex w-full items-center justify-between gap-3 rounded-md border border-white/15 bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-poulpe-500/70 hover:bg-white/[0.06]"
                    >
                      {o.label}
                      <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-poulpe-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <input
                    autoFocus
                    type="text"
                    inputMode="url"
                    value={siteInput}
                    placeholder="votre-site.fr"
                    onChange={(e) => setSiteInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && siteValid && advanceWith("site", siteInput.trim())
                    }
                    aria-label="Adresse de votre site"
                    className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-poulpe-500"
                  />
                  <button
                    type="button"
                    disabled={!siteValid}
                    onClick={() => advanceWith("site", siteInput.trim())}
                    className="group mt-2.5 flex w-full items-center justify-center gap-2 rounded-md bg-poulpe-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-poulpe-600 disabled:opacity-40"
                  >
                    Continuer
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => advanceWith("site", "none")}
                    className="mt-2 w-full rounded-md border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
                  >
                    Je n’ai pas encore de site
                  </button>
                </div>
              )}

              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Retour
                </button>
              )}
            </>
          )}
        </div>

        {/* UX footer */}
        <div className="mt-6 flex shrink-0 items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            100% gratuit · 2 min
          </span>
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white"
          >
            <Phone className="h-3 w-3" />
            Une question ?
          </a>
        </div>
      </div>
    </div>
  );
}
