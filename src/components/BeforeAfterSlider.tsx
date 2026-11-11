"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";

/* ================================================================== */
/*  Comparateur avant/après — curseur central déplaçable à la souris,  */
/*  au doigt et au clavier (role slider). Aucune dépendance : l'image  */
/*  « avant » est rognée via clip-path, les deux restent plein cadre,  */
/*  donc cadrage et proportions identiques des deux côtés.             */
/* ================================================================== */

type Img = { src: string; alt: string };

export function BeforeAfterSlider({
  before,
  after,
  caption,
  className = "",
  frameClassName = "rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10",
}: {
  before: Img;
  after: Img;
  /** Légende discrète sous le cadre (figcaption). */
  caption?: string;
  className?: string;
  /** Habillage du cadre (arrondi, ombre) — le ratio 16/9 reste fixe. */
  frameClassName?: string;
}) {
  const [pos, setPos] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function setFromClientX(clientX: number) {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(96, Math.max(4, Math.round(pct * 10) / 10)));
  }

  /* Glisser : on écoute la fenêtre le temps du drag — fiable souris
     comme tactile, où que le pointeur sorte du cadre. */
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    dragging.current = true;
    setFromClientX(e.clientX);
    const move = (ev: PointerEvent) => {
      if (dragging.current) setFromClientX(ev.clientX);
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setPos((p) => Math.max(4, p - step));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setPos((p) => Math.min(96, p + step));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setPos((p) => Math.max(4, p - 10));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setPos((p) => Math.min(96, p + 10));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPos(4);
    } else if (e.key === "End") {
      e.preventDefault();
      setPos(96);
    }
  }

  return (
    <figure className={className}>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        className={`relative aspect-[16/9] cursor-ew-resize touch-pan-y select-none overflow-hidden ${frameClassName}`}
      >
        {/* après — pleine surface */}
        <Image src={after.src} alt={after.alt} fill sizes="(min-width: 1152px) 68rem, 100vw" draggable={false} className="object-cover" />
        {/* avant — même cadre, rogné au niveau du curseur */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-hidden="true">
          <Image src={before.src} alt="" fill sizes="(min-width: 1152px) 68rem, 100vw" draggable={false} className="object-cover" />
        </div>
        {/* l'alt de l'avant reste indexable même si son calque est décoratif */}
        <span className="sr-only">{before.alt}</span>

        {/* étiquettes */}
        <span
          className={`absolute left-3 top-3 rounded-full sm:left-4 sm:top-4 bg-pine-950/55 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-opacity duration-200 ${pos < 18 ? "opacity-0" : "opacity-100"}`}
        >
          Avant
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full sm:right-4 sm:top-4 bg-pine-950/55 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-opacity duration-200 ${pos > 82 ? "opacity-0" : "opacity-100"}`}
        >
          Après
        </span>

        {/* ligne de séparation + poignée (le vrai contrôle, focusable) */}
        <div className="pointer-events-none absolute inset-y-0 w-[2.5px] -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(6,32,23,0.35)]" style={{ left: `${pos}%` }} />
        <button
          type="button"
          role="slider"
          aria-label="Comparer la piscine avant et après la pose de la barrière en verre"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)} % de la vue « avant » affichée`}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-full bg-white text-pine-700 shadow-elevated ring-1 ring-pine-950/10 transition-transform before:absolute before:-inset-3 before:rounded-full hover:scale-105 focus-visible:rounded-full! motion-reduce:transition-none"
          style={{ left: `${pos}%` }}
        >
          <ChevronsLeftRight className="h-5 w-5" strokeWidth={2.2} />
        </button>
      </div>
      {caption && (
        <figcaption className="mt-3 px-5 text-center text-[13px] text-neutral-500 sm:px-0">{caption}</figcaption>
      )}
    </figure>
  );
}
