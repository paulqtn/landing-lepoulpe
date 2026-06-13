"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";

const levers = [
  {
    n: "01",
    tab: "Référencement",
    kicker: "SEO",
    title: "Une visibilité durable sur Google",
    desc: "On vous place sur les requêtes qui rapportent — avec des objectifs inscrits au contrat.",
    bullets: ["Audit & mots-clés cibles", "Contenu et SEO technique", "Netlinking & autorité"],
    metric: "+182%",
    metricLabel: "de trafic organique",
    href: "/seo/strategie-seo",
  },
  {
    n: "02",
    tab: "Publicité",
    kicker: "Google · Meta · TikTok",
    title: "Des campagnes pilotées au résultat",
    desc: "On capte une audience qualifiée et on optimise chaque euro investi.",
    bullets: ["Ciblage & audiences", "Créas qui convertissent", "Pilotage au coût par lead"],
    metric: "−41%",
    metricLabel: "de coût par lead",
    href: "/ads/audit-google-ads",
  },
  {
    n: "03",
    tab: "Conversion",
    kicker: "Site & tunnels",
    title: "Transformer le trafic en clients",
    desc: "On optimise votre offre, vos pages et vos tunnels pour convertir davantage.",
    bullets: ["Pages pensées pour convertir", "Offre & tunnels optimisés", "Tests & itérations"],
    metric: "×2,8",
    metricLabel: "de taux de conversion",
    href: "/offre",
  },
  {
    n: "04",
    tab: "Stratégie",
    kicker: "Conseil & pilotage",
    title: "Une stratégie orientée résultats",
    desc: "On définit le bon mix de leviers, on priorise et on pilote à la performance.",
    bullets: ["Plan d’acquisition sur-mesure", "Priorisation par impact", "Reporting transparent"],
    metric: "360°",
    metricLabel: "d’accompagnement",
    href: "/strategie/conseil-strategique",
  },
];

export function AcquisitionLevers() {
  const [active, setActive] = useState(0);
  const l = levers[active];

  return (
    <section className="border-b border-neutral-200 bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-6 border-b border-neutral-200 pb-10 lg:grid-cols-12">
          <h2 className="font-grotesk text-3xl font-bold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl lg:col-span-7">
            Comment on booste votre acquisition.
          </h2>
          <p className="text-neutral-600 lg:col-span-4 lg:col-start-9 lg:self-end">
            On orchestre les bons leviers, ensemble, pour des résultats
            mesurables.
          </p>
        </div>

        <div className="grid lg:grid-cols-12">
          {/* tabs */}
          <div className="lg:col-span-4 lg:border-r lg:border-neutral-200 lg:pr-8">
            {levers.map((lev, i) => {
              const on = i === active;
              return (
                <button
                  key={lev.tab}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`group flex w-full items-center justify-between gap-3 border-b border-neutral-200 py-5 text-left transition-colors ${
                    on ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs">{lev.n}</span>
                    <span className="font-grotesk text-lg font-bold">{lev.tab}</span>
                  </span>
                  <ArrowRight
                    className={`h-4 w-4 transition ${
                      on ? "text-poulpe-500" : "text-transparent group-hover:text-neutral-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* panel */}
          <div className="pt-8 lg:col-span-7 lg:col-start-6 lg:pl-10 lg:pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-500">
              {l.kicker}
            </span>
            <h3 className="mt-2 font-grotesk text-2xl font-bold text-neutral-900 sm:text-3xl">
              {l.title}
            </h3>
            <p className="mt-3 max-w-xl leading-relaxed text-neutral-600">{l.desc}</p>

            <ul className="mt-6 space-y-2.5">
              {l.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-neutral-800">
                  <Check className="h-4 w-4 shrink-0 text-poulpe-500" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-end justify-between gap-4 border-t border-neutral-200 pt-6">
              <p className="text-sm text-neutral-600">
                <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Exemple de résultat
                </span>
                <span className="font-bold text-neutral-900">{l.metric}</span>{" "}
                {l.metricLabel}
              </p>
              <Link
                href={l.href}
                className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500"
              >
                En savoir plus
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
