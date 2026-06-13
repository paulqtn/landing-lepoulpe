import { site } from "@/lib/site";

/** The octopus mark — inherits `currentColor` so it adapts to any surface. */
export function OctopusMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M15 28c-1 4-4.5 5.5-7 4.5" />
        <path d="M20 30c-1 4.5-2.5 6.5-2.5 9" />
        <path d="M28 30c1 4.5 2.5 6.5 2.5 9" />
        <path d="M33 28c1 4 4.5 5.5 7 4.5" />
        <path d="M24 31v8" />
      </g>
      <path
        d="M24 9c-7 0-12 5-12 12v5.5c0 2.8 2.4 4.5 5.4 4.5h13.2c3 0 5.4-1.7 5.4-4.5V21c0-7-5-12-12-12Z"
        fill="currentColor"
      />
      <circle cx="19.5" cy="20.5" r="2.3" fill="#fff" />
      <circle cx="28.5" cy="20.5" r="2.3" fill="#fff" />
    </svg>
  );
}

/** Full logo: octopus mark inside a brand-colored tile + wordmark. */
export function Logo({
  className = "",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-poulpe-500 text-white shadow-sm">
        <OctopusMark className="h-6 w-6" />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            {site.name}
          </span>
          <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-poulpe-600">
            Accélérateur
          </span>
        </span>
      )}
    </span>
  );
}
