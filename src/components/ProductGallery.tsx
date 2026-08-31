"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

/* ================================================================== */
/*  Galerie produit : grand visuel + vignettes cliquables.             */
/*  Accepte photos et vidéos (.mp4 / .webm) dans le même tableau.      */
/* ================================================================== */

const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src);

export function ProductGallery({ media, alt, badge }: { media: string[]; alt: string; badge?: string }) {
  const [index, setIndex] = useState(0);
  const current = media[index] ?? media[0];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-pine-950 shadow-panel ring-1 ring-pine-950/10">
        {isVideo(current) ? (
          <video
            key={current}
            src={current}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          media.filter((m) => !isVideo(m)).map((src) => (
            <Image
              key={src}
              src={src}
              alt={alt}
              fill
              priority={src === media[0]}
              sizes="(min-width: 1024px) 40rem, 100vw"
              className={`object-cover transition-opacity duration-500 ${src === current ? "opacity-100" : "opacity-0"}`}
            />
          ))
        )}
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-amber-500 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950 shadow-lg">
            {badge}
          </span>
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {media.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir le visuel ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl transition ${i === index ? "ring-2 ring-pine-600 ring-offset-2" : "opacity-70 ring-1 ring-neutral-200 hover:opacity-100"}`}
            >
              {isVideo(src) ? (
                <span className="grid h-full w-full place-items-center bg-pine-950 text-white">
                  <Play className="h-6 w-6" />
                </span>
              ) : (
                <Image src={src} alt="" fill sizes="10rem" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
