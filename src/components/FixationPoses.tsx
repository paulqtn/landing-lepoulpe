"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Image as ImageGlyph, PencilRuler } from "lucide-react";

/* ================================================================== */
/*  Sélecteur de pose (française / anglaise) — cartes accordéon à      */
/*  gauche, panneau d'illustrations synchronisé à droite : la vue en   */
/*  situation et le détail technique changent ensemble au clic.        */
/* ================================================================== */

export type FixationPose = {
  /** Numéro affiché : « 01 ». */
  num: string;
  title: string;
  /** Sous-titre court de la carte : « Fixation sur le dessus de la dalle ». */
  sub: string;
  /** Description de la carte dépliée. */
  text: string;
  points: string[];
  /** La photo en situation, et son étiquette posée sur l'image.
      Sans src, un placeholder tient la place en attendant le visuel. */
  vue: { src?: string; alt: string; chip: string };
  /** L'illustration technique du système — placeholder tant que src manque. */
  detail: { src?: string; alt: string };
};

export function FixationPoses({
  poses,
  panelSub,
}: {
  poses: FixationPose[];
  /** Sous-titre du panneau : « Vue sur balcon et détail technique ». */
  panelSub: string;
}) {
  const [active, setActive] = useState(0);
  const pose = poses[active];

  return (
    <div className="mt-9 grid gap-6 sm:mt-12 lg:grid-cols-[0.46fr_1fr] lg:items-start lg:gap-8">
      {/* cartes de sélection — la carte active est dépliée */}
      <div className="space-y-4">
        {poses.map((po, i) => {
          const open = i === active;
          return (
            <button
              key={po.title}
              type="button"
              onClick={() => setActive(i)}
              aria-expanded={open}
              className={`block w-full rounded-2xl bg-white p-5 text-left ring-1 transition-all ${
                open ? "shadow-panel ring-pine-600/30" : "ring-pine-950/10 hover:-translate-y-0.5 hover:ring-pine-600/25"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pine-700/10 font-mono text-[13px] font-bold text-pine-700">
                  {po.num}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-extrabold tracking-tight text-inkgreen">{po.title}</span>
                  <span className="mt-0.5 block text-[12.5px] text-neutral-500">{po.sub}</span>
                </span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ring-neutral-200">
                  <ChevronDown
                    className={`h-4 w-4 text-pine-700 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </span>
              </span>

              {open && (
                <span className="mt-4 block border-t border-neutral-100 pt-4">
                  <span className="block text-sm leading-relaxed text-neutral-600">{po.text}</span>
                  <span className="mt-3.5 block space-y-2">
                    {po.points.map((pt) => (
                      <span key={pt} className="flex items-start gap-2.5">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600/15 text-green-700">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-sm leading-snug text-neutral-700">{pt}</span>
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* panneau d'illustrations synchronisé */}
      <div aria-live="polite" className="rounded-[1.75rem] bg-white p-5 shadow-panel ring-1 ring-pine-950/10 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-inkgreen sm:text-xl">{pose.title}</h3>
            <p className="mt-0.5 text-[13px] text-neutral-500">{panelSub}</p>
          </div>
          <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Illustrations
          </span>
        </div>

        {/* key sur la pose : l'animation d'apparition rejoue à chaque bascule */}
        <div key={pose.title} className="mt-4 grid animate-fade-up gap-3 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-pine-950/10 sm:aspect-[1.08]">
            {pose.vue.src ? (
              <Image src={pose.vue.src} alt={pose.vue.alt} fill sizes="(min-width: 1152px) 26rem, 100vw" className="object-cover" />
            ) : (
              <span className="absolute inset-2 grid place-items-center rounded-lg border-2 border-dashed border-neutral-300 bg-mist">
                <span className="flex flex-col items-center gap-2 px-6 text-center">
                  <ImageGlyph className="h-6 w-6 text-neutral-400" strokeWidth={1.6} />
                  <span className="text-[12px] font-semibold leading-snug text-neutral-500">
                    Votre photo « vue du balcon » arrive ici
                  </span>
                </span>
              </span>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-inkgreen shadow-sm">
              {pose.num} · Vue du balcon
            </span>
            <span className="absolute bottom-3 left-3 right-3 w-fit rounded-lg bg-pine-950/70 px-3 py-1.5 text-[12px] font-bold leading-snug text-white backdrop-blur-sm">
              {pose.vue.chip}
            </span>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white ring-1 ring-pine-950/10 sm:aspect-[1.08]">
            {pose.detail.src ? (
              <Image src={pose.detail.src} alt={pose.detail.alt} fill sizes="(min-width: 1152px) 26rem, 100vw" className="object-cover" />
            ) : (
              <span className="absolute inset-2 grid place-items-center rounded-lg border-2 border-dashed border-neutral-300 bg-mist">
                <span className="flex flex-col items-center gap-2 px-6 text-center">
                  <PencilRuler className="h-6 w-6 text-neutral-400" strokeWidth={1.6} />
                  <span className="text-[12px] font-semibold leading-snug text-neutral-500">
                    Votre schéma technique légendé arrive ici
                  </span>
                </span>
              </span>
            )}
          </div>
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-500">
          Visuels fournis pour la {pose.title.toLowerCase()} · illustration de principe, non plan de fabrication.
        </p>
      </div>
    </div>
  );
}
