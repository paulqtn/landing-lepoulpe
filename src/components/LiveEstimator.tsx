"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus, Zap } from "lucide-react";
import { guarantees } from "@/lib/site";

/* ================================================================== */
/*  Configurateur express de la page d'accueil.                        */
/*  Un seul produit — le garde-corps en verre — configuré en direct :  */
/*  système, longueur, hauteur, formule → estimation instantanée.      */
/*  Le CTA transmet la configuration au tunnel /devis (pré-rempli).    */
/* ================================================================== */

export type SystemKey = "sans-poteaux" | "pinces" | "verre-alu";
type Formule = "kit" | "pose";

const systems: {
  key: SystemKey;
  name: string;
  hint: string;
  photo: string;
  ranges: Record<Formule, [number, number]>;
}[] = [
  {
    key: "sans-poteaux",
    name: "Tout verre, sans poteaux",
    hint: "Profilé alu au sol",
    photo: "/verre-sur-rail.jpg",
    ranges: { kit: [320, 450], pose: [500, 800] },
  },
  {
    key: "pinces",
    name: "Verre sur pinces",
    hint: "Au sol ou sur muret",
    photo: "/pinces-au-sol.jpg",
    ranges: { kit: [250, 380], pose: [450, 650] },
  },
  {
    key: "verre-alu",
    name: "Verre & aluminium",
    hint: "Poteaux toutes teintes RAL",
    photo: "/miroiterie_avignonnaise_garde-corps_verre-52.jpg.webp",
    ranges: { kit: [200, 320], pose: [380, 600] },
  },
];

const fmt = new Intl.NumberFormat("fr-FR");
const round10 = (n: number) => Math.round(n / 10) * 10;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
      {children}
    </p>
  );
}

export function LiveEstimator() {
  const [system, setSystem] = useState<SystemKey>("sans-poteaux");
  const [length, setLength] = useState(6);
  const [height, setHeight] = useState<"100" | "110">("100");
  const [formule, setFormule] = useState<Formule>("kit");

  const sys = systems.find((s) => s.key === system)!;
  const [low, high] = useMemo(() => {
    const [l, h] = sys.ranges[formule];
    return [round10(l * length), round10(h * length)];
  }, [sys, formule, length]);

  const devisHref = `/devis?sys=${system}&len=${length}&h=${height}&pose=${formule}`;
  const lengthLabel = Number.isInteger(length) ? `${length}` : length.toFixed(1).replace(".", ",");

  return (
    <div className="relative">
      {/* sticker */}
      <span className="absolute -top-4 left-4 z-10 inline-flex rotate-[-3deg] items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-pine-950 shadow-md sm:-left-3">
        <Zap className="h-3.5 w-3.5" />
        Prix en direct
      </span>

      <div className="grid overflow-hidden rounded-[2rem] bg-white shadow-panel ring-1 ring-pine-950/10 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ---------------- réglages ---------------- */}
        <div className="p-6 sm:p-9">
          {/* système */}
          <Label>1 · Votre système</Label>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {systems.map((s) => {
              const on = system === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSystem(s.key)}
                  className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                    on
                      ? "border-pine-600 ring-2 ring-pine-600"
                      : "border-neutral-200 hover:-translate-y-0.5 hover:border-pine-300"
                  }`}
                >
                  <span className="relative block h-20">
                    <Image
                      src={s.photo}
                      alt=""
                      fill
                      sizes="14rem"
                      className="object-cover"
                    />
                    {on && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-pine-600 text-white shadow-md">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="block px-3 py-2.5">
                    <span className={`block text-[13px] font-bold leading-tight ${on ? "text-pine-700" : "text-inkgreen"}`}>
                      {s.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-neutral-500">{s.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* longueur */}
          <div className="mt-7 flex items-end justify-between gap-4">
            <Label>2 · Longueur à équiper</Label>
            <p className="font-mono text-sm font-bold tabular-nums text-inkgreen">
              {lengthLabel}&nbsp;<span className="text-neutral-400">ml</span>
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLength((v) => Math.max(1, Math.round((v - 0.5) * 2) / 2))}
              aria-label="Réduire la longueur"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              aria-label="Longueur à équiper en mètres linéaires"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-pine-600"
            />
            <button
              type="button"
              onClick={() => setLength((v) => Math.min(25, Math.round((v + 0.5) * 2) / 2))}
              aria-label="Augmenter la longueur"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Additionnez vos côtés — angles et retours sont pris en charge.
          </p>

          {/* hauteur + formule */}
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <Label>3 · Hauteur</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "100", label: "1,00 m", hint: "norme standard" },
                    { v: "110", label: "1,10 m", hint: "piscine / confort" },
                  ] as const
                ).map((h) => {
                  const on = height === h.v;
                  return (
                    <button
                      key={h.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setHeight(h.v)}
                      className={`rounded-xl border px-3 py-3 text-center transition ${
                        on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 hover:border-pine-300"
                      }`}
                    >
                      <span className="block text-sm font-bold text-inkgreen">{h.label}</span>
                      <span className="block text-[11px] text-neutral-500">{h.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>4 · Formule</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    { v: "kit", label: "Kit à poser", hint: "livré pré-percé" },
                    { v: "pose", label: "Avec pose", hint: "par notre réseau" },
                  ] as const
                ).map((f) => {
                  const on = formule === f.v;
                  return (
                    <button
                      key={f.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setFormule(f.v)}
                      className={`rounded-xl border px-3 py-3 text-center transition ${
                        on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 hover:border-pine-300"
                      }`}
                    >
                      <span className="block text-sm font-bold text-inkgreen">{f.label}</span>
                      <span className="block text-[11px] text-neutral-500">{f.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- estimation live ---------------- */}
        <div className="relative flex flex-col bg-pine-900 p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pine-300">Votre estimation</p>
            <p className="mt-3 text-sm font-semibold text-pine-100/85">
              {sys.name} · {lengthLabel} ml · H {height === "100" ? "1,00" : "1,10"} m
            </p>

            <p key={`${low}-${high}`} className="mt-4 animate-scale-in text-4xl font-extrabold tabular-nums tracking-tight text-white sm:text-[2.6rem] sm:leading-none">
              {fmt.format(low)} – {fmt.format(high)}&nbsp;<span className="text-2xl">€</span>
            </p>
            <p className="mt-2 text-xs text-pine-100/60">
              {formule === "kit" ? "Fourniture seule, en kit pré-percé" : "Fourniture et pose incluses"} —
              estimation indicative, affinée en devis.
            </p>
          </div>

          <div className="relative mt-auto pt-7">
            <Link
              href={devisHref}
              className="group relative flex items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full bg-amber-500 px-6 py-4 text-base font-bold text-pine-950 shadow-xl shadow-black/25 ring-1 ring-inset ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-amber-600"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              Recevoir ce devis en 24h
              <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
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
      </div>
    </div>
  );
}
