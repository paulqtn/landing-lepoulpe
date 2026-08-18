"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ClipboardList,
  Menu,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { materials, usages } from "@/lib/catalog";
import { products } from "@/lib/products";
import { phoneHref, site } from "@/lib/site";

/** Petit échantillon visuel de matériau (verre / alu / inox). */
function Swatch({ material }: { material: string }) {
  if (material === "verre")
    return (
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-pine-200 bg-pine-50">
        <span className="h-6 w-6 rounded-sm border border-pine-300/70 bg-white/60 shadow-inner" />
        <span className="absolute -left-1 top-0 h-14 w-2 rotate-12 bg-white/70" />
      </span>
    );
  if (material === "aluminium")
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-neutral-100">
        <span className="flex gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-6 w-[4px] rounded-full bg-neutral-700" />
          ))}
        </span>
      </span>
    );
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-gradient-to-b from-neutral-100 to-neutral-200">
      <span className="flex flex-col gap-[4px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[3px] w-6 rounded-full bg-neutral-500" />
        ))}
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const featured = products.find((p) => p.badge === "Best-seller") ?? products[0];

  return (
    <>
      {/* ---- bandeau utilitaire ---- */}
      <div className="relative bg-gradient-to-r from-pine-950 via-pine-900 to-pine-950 text-pine-100">
        {/* halo ambré discret + liseré signature */}
        <div className="pointer-events-none absolute inset-y-0 right-1/4 w-1/2 bg-amber-500/[0.07] blur-2xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="relative mx-auto flex h-11 w-full max-w-7xl items-center justify-between px-5 text-xs sm:px-8">
          <a
            href={phoneHref}
            className="group -ml-1.5 flex items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 transition-colors hover:bg-white/5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/15 transition-all duration-300 group-hover:scale-105 group-hover:bg-green-500 group-hover:ring-4 group-hover:ring-green-500/25">
              <Phone className="h-3.5 w-3.5 group-hover:animate-wiggle" />
            </span>
            <span className="font-semibold tracking-wider text-green-100 transition-colors group-hover:text-white">
              {site.phone}
            </span>
            <span className="relative ml-0.5 flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          </a>
          <div className="hidden items-center gap-6 sm:flex">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5 text-amber-500" />
              Devis en 1 min
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-amber-500" />
              Livraison partout en France
            </span>
          </div>
        </div>
      </div>

      {/* ---- barre principale ---- */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label={`${site.name} — accueil`} onClick={() => setOpen(null)} className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-700 text-white">
              {/* glyphe garde-corps */}
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M3 8h18" />
                <path d="M5 8v10M9.5 8v10M14.5 8v10M19 8v10" />
                <path d="M3 18h18" strokeOpacity="0.5" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-inkgreen">{site.name}</span>
              <span className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-pine-600">
                Sur-mesure &amp; kit · direct usine
              </span>
            </span>
          </Link>

          {/* nav desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {/* Nos garde-corps */}
            <div className="relative" onMouseEnter={() => setOpen("mat")} onMouseLeave={() => setOpen(null)}>
              <button
                type="button"
                aria-експanded={open === "mat"}
                onClick={() => setOpen(open === "mat" ? null : "mat")}
                className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${open === "mat" ? "text-pine-700" : "text-neutral-800 hover:text-pine-700"}`}
              >
                Nos garde-corps
                <ChevronDown className={`h-4 w-4 transition-transform ${open === "mat" ? "rotate-180" : ""}`} />
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
