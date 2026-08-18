"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type HeroSlide = {
  src: string;
  alt: string;
  /** Matériau affiché dans la barre : "Verre". */
  material: string;
  /** Contexte affiché dans la barre : "Piscine · Var". */
  place: string;
};

/**
 * Galerie du hero : une grande photo qui occupe le bloc, les suivantes
 * s'enchaînent en fondu. Barre en verre dépoli en bas avec le matériau,
 * le contexte et les indicateurs de progression (cliquables).
 */
export function HeroGallery({
  slides,
  interval = 5000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(true);

  // Coupe le défilement automatique si l'utilisateur préfère moins d'animations.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAuto(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!auto || paused) return;
    const t = setTimeout(() => setIndex((v) => (v + 1) % slides.length), interval);
    return () => clearTimeout(t);
  }, [index, paused, auto, interval, slides.length]);

  const current = slides[index];

  return (
    <div
      className="group/gal relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* liseré décoratif */}
      <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-pine-200/50 via-transparent to-amber-500/10" />

      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-pine-950 shadow-panel ring-1 ring-pine-950/10 lg:aspect-[6/5]">
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 46rem, 100vw"
            className={`object-cover transition-opacity duration-[1200ms] ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* dégradé de lisibilité */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-transparent" />

        {/* barre d'info + progression */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:px-5">
          <span key={current.src} className="min-w-0 animate-fade-up leading-tight">
            <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-pine-200">
              {current.material}
            </span>
            <span className="mt-0.5 block truncate text-sm font-bold text-white">
              {current.place}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Voir la réalisation ${i + 1} sur ${slides.length}`}
                aria-current={i === index}
                className="group/dot py-2"
              >
                <span
                  className={`block h-1 overflow-hidden rounded-full bg-white/30 transition-all duration-300 ${
                    i === index ? "w-10" : "w-4 group-hover/dot:bg-white/60"
                  }`}
                >
                  {i === index && (
                    <span
                      key={`${index}-${paused}-${auto}`}
                      className="block h-full rounded-full bg-white"
                      style={
                        auto && !paused
                          ? { animation: `progress ${interval}ms linear forwards` }
                          : { width: "100%" }
                      }
                    />
                  )}
                </span>
              </button>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
