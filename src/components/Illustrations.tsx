import type { MaterialSlug } from "@/lib/pricing";

/* ================================================================== */
/*  Illustrations SVG produit — pas de photos : on dessine les         */
/*  garde-corps (verre / alu / inox) avec de la profondeur.            */
/* ================================================================== */

/** Scène garde-corps en verre : panneaux feuilletés + pinces + reflet. */
function SceneVerre() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef7f1" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="sv-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9ecf5" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#eaf4f8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#cfe6ef" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="sv-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e1d8" />
          <stop offset="1" stopColor="#d8d2c6" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sv-sky)" />
      {/* horizon doux */}
      <circle cx="330" cy="40" r="26" fill="#f6e7c8" opacity="0.8" />
      <path d="M0 150 Q 90 132 200 146 T 400 142 V 220 H 0 Z" fill="url(#sv-floor)" />
      {/* profilé bas */}
      <rect x="24" y="150" width="352" height="16" rx="3" fill="#33413a" />
      <rect x="24" y="150" width="352" height="4" rx="2" fill="#4d5d54" />
      {/* panneaux de verre */}
      {[30, 148, 266].map((x) => (
        <g key={x}>
          <rect x={x} y="52" width="106" height="100" rx="3" fill="url(#sv-glass)" stroke="#b7d3de" strokeWidth="1.5" />
          <path d={`M${x + 12} 140 L${x + 52} 60 L${x + 66} 60 L${x + 26} 140 Z`} fill="#ffffff" opacity="0.55" />
          <path d={`M${x + 70} 140 L${x + 96} 88 L${x + 102} 88 L${x + 76} 140 Z`} fill="#ffffff" opacity="0.35" />
        </g>
      ))}
      {/* main courante */}
      <rect x="22" y="44" width="356" height="10" rx="5" fill="#3a4a41" />
      <rect x="22" y="44" width="356" height="3.5" rx="1.75" fill="#5d6f65" />
      {/* ombre au sol */}
      <ellipse cx="200" cy="176" rx="170" ry="9" fill="#3a4a41" opacity="0.10" />
    </svg>
  );
}

/** Scène garde-corps aluminium : barreaudage vertical anthracite. */
function SceneAlu() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f3" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="sa-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2e353b" />
          <stop offset="0.5" stopColor="#454f57" />
          <stop offset="1" stopColor="#232a2f" />
        </linearGradient>
        <linearGradient id="sa-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e4db" />
          <stop offset="1" stopColor="#dcd5c9" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sa-sky)" />
      <path d="M0 152 Q 110 138 220 148 T 400 144 V 220 H 0 Z" fill="url(#sa-floor)" />
      {/* lisse basse */}
      <rect x="26" y="138" width="348" height="10" rx="3" fill="url(#sa-bar)" />
      {/* barreaudage */}
      {Array.from({ length: 13 }).map((_, i) => (
        <rect key={i} x={40 + i * 26} y="56" width="8" height="86" rx="2" fill="url(#sa-bar)" />
      ))}
      {/* poteaux */}
      <rect x="26" y="46" width="12" height="108" rx="3" fill="url(#sa-bar)" />
      <rect x="362" y="46" width="12" height="108" rx="3" fill="url(#sa-bar)" />
      {/* main courante rectangulaire */}
      <rect x="20" y="40" width="360" height="12" rx="3" fill="#2e353b" />
      <rect x="20" y="40" width="360" height="4" rx="2" fill="#525c64" />
      <ellipse cx="200" cy="170" rx="175" ry="9" fill="#2e353b" opacity="0.10" />
    </svg>
  );
}

/** Scène garde-corps inox : poteaux brossés + câbles tendus. */
function SceneInox() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="si-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef3f2" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="si-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa7a6" />
          <stop offset="0.35" stopColor="#e6edec" />
          <stop offset="0.65" stopColor="#b9c4c3" />
          <stop offset="1" stopColor="#7f8c8b" />
        </linearGradient>
        <linearGradient id="si-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4e6e2" />
          <stop offset="1" stopColor="#d3d6d0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#si-sky)" />
      <path d="M0 154 Q 120 140 240 150 T 400 146 V 220 H 0 Z" fill="url(#si-floor)" />
      {/* câbles */}
      {[68, 84, 100, 116, 132].map((y) => (
        <g key={y}>
          <rect x="30" y={y} width="340" height="2.6" rx="1.3" fill="#aab6b5" />
          <rect x="30" y={y} width="340" height="1" rx="0.5" fill="#dfe7e6" />
        </g>
      ))}
      {/* tendeurs */}
      {[68, 100, 132].map((y) => (
        <rect key={y} x="330" y={y - 2} width="14" height="6" rx="3" fill="#7f8c8b" />
      ))}
      {/* poteaux */}
      {[36, 196, 356].map((x) => (
        <g key={x}>
          <rect x={x} y="48" width="10" height="104" rx="4" fill="url(#si-post)" />
          <rect x={x - 5} y="150" width="20" height="6" rx="2" fill="#8b9897" />
        </g>
      ))}
      {/* main courante ronde */}
      <rect x="24" y="42" width="352" height="11" rx="5.5" fill="url(#si-post)" />
      <ellipse cx="200" cy="172" rx="172" ry="9" fill="#5d6b6a" opacity="0.12" />
    </svg>
  );
}

/** Conteneur de scène avec fond et hover. */
export function MaterialScene({
  material,
  className = "",
}: {
  material: MaterialSlug;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {material === "verre" ? <SceneVerre /> : material === "aluminium" ? <SceneAlu /> : <SceneInox />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphes d'usage (24×24, trait currentColor)                        */
/* ------------------------------------------------------------------ */

const glyphs: Record<string, React.ReactNode> = {
  piscine: (
    <>
      <path d="M3 15c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0" />
      <path d="M3 19c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0" />
      <path d="M8 15V6.5A2.5 2.5 0 0 1 10.5 4H11M16 15V6.5A2.5 2.5 0 0 0 13.5 4H13" />
      <path d="M8 8h8M8 11.5h8" />
    </>
  ),
  escalier: (
    <>
      <path d="M4 20h4v-4h4v-4h4V8h4" />
      <path d="M4 20V10l10-7" />
    </>
  ),
  balcon: (
    <>
      <path d="M4 11h16" />
      <path d="M6 11v6M10 11v6M14 11v6M18 11v6" />
      <path d="M3 17h18" />
      <path d="M8 11V6a4 4 0 0 1 8 0v5" opacity="0.55" />
    </>
  ),
  terrasse: (
    <>
      <path d="M3 16h18M3 19.5h18" />
      <path d="M5 16v3.5M12 16v3.5M19 16v3.5" opacity="0.55" />
      <path d="M12 12V4M12 4l-4.5 4.5M12 4l4.5 4.5" />
    </>
  ),
  mezzanine: (
    <>
      <path d="M3 10h13" />
      <path d="M5 10v5M9 10v5M13 10v5" />
      <path d="M3 15h13" />
      <path d="M16 20V4h5" opacity="0.55" />
    </>
  ),
  fenetre: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M5 12h14M12 4v8" />
      <path d="M5 16h14" strokeWidth="2.4" />
    </>
  ),
  interieur: (
    <>
      <path d="M4 20V9.5L12 4l8 5.5V20" />
      <path d="M8 20v-5h8v5" opacity="0.55" />
      <path d="M8 12h8" />
    </>
  ),
  exterieur: (
    <>
      <circle cx="17" cy="7" r="2.6" />
      <path d="M17 2.5v1.4M21.5 7h-1.4M20.2 3.8l-1 1M20.2 10.2l-1-1" opacity="0.7" />
      <path d="M3 16h13M4.5 16v4M8.5 16v4M12.5 16v4" />
      <path d="M3 20h13" />
    </>
  ),
};

export function UsageGlyph({ usage, className = "" }: { usage: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {glyphs[usage] ?? glyphs.exterieur}
    </svg>
  );
}

/** Logo « G » Google multicolore (avis). */
export function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
