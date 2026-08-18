"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Clock, Zap } from "lucide-react";
import { MaterialScene } from "@/components/Illustrations";
import type { MaterialSlug } from "@/lib/pricing";

export type ShowcaseItem = {
  material: MaterialSlug;
  /** Libellé court de la vignette : "Verre". */
  label: string;
  /** Titre affiché sur l'image : "Garde-corps en verre". */
  title: string;
  priceFrom: number;
  href: string;
  /** Chemin public de la photo, ou null tant qu'elle n'est pas déposée. */
  src: string | null;
  alt: string;
};

/**
 * Vitrine produit du hero : grande photo + vignettes verre / alu / inox.
 * Tant qu'une photo n'est pas présente dans public/images/hero/, un
 * emplacement stylé s'affiche à sa place (avec le nom de fichier attendu).
 */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const it = items[active];

  return (
    <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:150ms]">
      {/* cartes fantômes pour la profondeur */}
      <div className="absolute inset-x-4 -bottom-3 top-6 -rotate-2 rounded-3xl bg-pine-800/10" />
      <div className="absolute inset-x-8 -bottom-6 top-12 -rotate-3 rounded-3xl bg-pine-800/5" />

      {/* sticker */}
      <span className="absolute -top-4 right-6 z-20 inline-flex rotate-[3deg] animate-float items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-pine-950 shadow-lg shadow-amber-600/30">
        <Zap className="h-3.5 w-3.5" />
        Devis en 24 h chrono
      </span>

      <div className="relative z-10 overflow-hidden rounded-3xl bg-white shadow-elevated ring-1 ring-neutral-900/5">
        {/* grande image */}
        <div className="group relative aspect-[4/3]">
          {it.src ? (
            <Image
              src={it.src}
              alt={it.alt}
              fill
              priority={active === 0}
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <>
              {/* fond illustré en attendant la photo */}
              <MaterialScene material={it.material} className="h-full" />
              <div className="absolute inset-0 grid place-items-center bg-mist/40">
                <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-pine-300/80 bg-white/85 px-6 py-5 text-center shadow-sm backdrop-blur-sm">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-50 text-pine-700">
                    <Camera className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-inkgreen">Photo produit à venir</span>
                  <code className="rounded-md bg-mist px-2 py-1 font-mono text-[10px] text-neutral-500">
                    /images/hero/{it.material}.jpg
                  </code>
                </div>
              </div>
            </>
          )}

          {/* chip matériau */}
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pine-800 shadow-sm backdrop-blur">
            {it.label}
          </span>

          {/* bandeau info produit */}
          <Link
            href={it.href}
            className="group/bar absolute inset-x-3 bottom-3 flex items-center justify-between gap-4 rounded-2xl bg-pine-950/85 px-5 py-3.5 shadow-lg backdrop-blur transition-colors hover:bg-pine-900/90"
          >
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold text-white">{it.title}</span>
              <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.14em] text-pine-200">
                Sur-mesure &amp; kit · NF P01-012
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2.5">
              <span className="text-base font-extrabold text-white">
                dès {it.priceFrom} €<span className="text-xs font-semibold text-pine-200">/ml</span>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-pine-800 transition-transform group-hover/bar:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </div>

        {/* vignettes */}
        <div className="grid grid-cols-3 gap-2.5 border-t border-neutral-100 bg-white p-3">
          {items.map((x, i) => {
            const on = i === active;
            return (
              <button
                key={x.material}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                aria-label={`Voir le garde-corps ${x.label.toLowerCase()}`}
                className={`group/thumb overflow-hidden rounded-xl border text-left transition-all ${
                  on
                    ? "border-pine-600 ring-2 ring-pine-600/80"
                    : "border-neutral-200 opacity-80 hover:-translate-y-0.5 hover:opacity-100"
                }`}
              >
                <span className="relative block h-14 overflow-hidden sm:h-16">
                  {x.src ? (
                    <Image src={x.src} alt="" fill sizes="10rem" className="object-cover" />
                  ) : (
                    <MaterialScene material={x.material} className="h-full" />
                  )}
                </span>
                <span
                  className={`flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${
                    on ? "bg-pine-700 text-white" : "bg-white text-inkgreen"
                  }`}
                >
                  {x.label}
                  <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-amber-500" : "bg-neutral-200"}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* chip flottante */}
      <span className="absolute -left-3 bottom-16 z-20 inline-flex -rotate-2 items-center gap-2 rounded-xl border border-neutral-100 bg-white py-2 pl-2.5 pr-3.5 shadow-elevated">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-pine-50 text-pine-700">
          <Clock className="h-4 w-4" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-xs font-bold text-inkgreen">Réponse &lt; 24h</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-400">
            gratuit · sans engagement
          </span>
        </span>
      </span>
    </div>
  );
}
