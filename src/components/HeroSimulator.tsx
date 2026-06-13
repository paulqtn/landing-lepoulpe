"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/**
 * Interactive acquisition simulator: a budget slider that estimates the
 * monthly leads in real time, then routes to the offer. More useful & engaging
 * than a plain form.
 */
export function HeroSimulator() {
  const [budget, setBudget] = useState(2000);

  const low = round5(budget / 35);
  const high = round5(budget / 22);

  return (
    <div className="border border-neutral-900 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-900 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">
          Simulateur d’acquisition
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          1 min
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Budget marketing / mois
          </span>
          <span className="font-grotesk text-lg font-bold tabular-nums text-neutral-900">
            {fmt(budget)} €
          </span>
        </div>

        <input
          type="range"
          min={500}
          max={10000}
          step={250}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Budget marketing mensuel"
          className="mt-3 w-full accent-poulpe-500"
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400">
          <span>500 €</span>
          <span>10 000 €</span>
        </div>

        <div className="mt-6 border-t border-neutral-200 pt-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
            Leads estimés / mois
          </span>
          <p className="mt-1.5 font-grotesk text-4xl font-bold tabular-nums text-neutral-900">
            ≈ {fmt(low)}
            <span className="text-neutral-300"> – </span>
            {fmt(high)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-500">
            Estimation selon votre marché et votre coût par lead.
          </p>
        </div>

        <Link
          href="/offre"
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500"
        >
          Recevoir mon plan détaillé
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">
          Estimation indicative · sans engagement
        </p>
      </div>
    </div>
  );
}
