"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/* ================================================================== */
/*  Lecteur YouTube léger : la page ne charge qu'une miniature et un   */
/*  bouton lecture — l'iframe (youtube-nocookie) n'arrive qu'au clic,  */
/*  avec lecture automatique à l'horodatage demandé.                   */
/* ================================================================== */

export function YouTubeLite({
  id,
  start = 0,
  title,
}: {
  /** Identifiant de la vidéo : « 1k9-IwHHs14 ». */
  id: string;
  /** Démarrage en secondes. */
  start?: number;
  /** Titre lu par les lecteurs d'écran et affiché par YouTube. */
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [thumbOk, setThumbOk] = useState(true);

  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-pine-800 to-pine-950 shadow-panel ring-1 ring-pine-950/10">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?start=${start}&autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Lire la vidéo : ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          {thumbOk && (
            // Miniature servie par YouTube — simple <img> : pas d'optimisation
            // Next à configurer pour un domaine externe, et rien d'autre à charger.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt=""
              loading="lazy"
              onError={() => setThumbOk(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute inset-0 bg-pine-950/25 transition group-hover:bg-pine-950/35" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-pine-700 shadow-elevated transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
            <Play className="h-7 w-7 translate-x-0.5 fill-current sm:h-8 sm:w-8" strokeWidth={0} />
          </span>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-pine-950/60 px-4 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm">
            Regarder la vidéo
          </span>
        </button>
      )}
    </div>
  );
}
