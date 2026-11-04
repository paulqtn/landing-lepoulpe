"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/* Effet loupe : au survol, l'image zoome à l'endroit du curseur —
   on balade la souris comme une loupe pour inspecter la fixation. */

export function ZoomImage({
  src,
  alt,
  sizes,
  zoom = 2.2,
}: {
  src: string;
  alt: string;
  sizes?: string;
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");
  const [active, setActive] = useState(false);

  function move(e: React.PointerEvent) {
    if (e.pointerType === "touch") return; // au doigt, un tap navigue : pas de zoom fantôme
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerEnter={(e) => {
        if (e.pointerType === "touch") return;
        move(e);
        setActive(true);
      }}
      onPointerLeave={() => setActive(false)}
      className="relative h-full w-full cursor-zoom-in overflow-hidden"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-300 ease-out"
        style={{ transformOrigin: origin, transform: active ? `scale(${zoom})` : "scale(1)" }}
      />
    </div>
  );
}
