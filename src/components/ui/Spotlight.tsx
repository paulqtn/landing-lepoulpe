"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wraps content with a soft radial glow that follows the cursor.
 * Pure CSS variables — no re-renders on mouse move.
 */
export function Spotlight({
  children,
  className = "",
  glow = "rgb(252 96 36 / 0.13)",
  radius = 480,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity"
        style={{
          background: `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 30%), ${glow}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
