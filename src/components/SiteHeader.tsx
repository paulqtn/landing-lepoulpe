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
                aria-expanded={open === "mat"}
                onClick={() => setOpen(open === "mat" ? null : "mat")}
                className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${open === "mat" ? "text-pine-700" : "text-neutral-800 hover:text-pine-700"}`}
              >
                Nos garde-corps
                <ChevronDown className={`h-4 w-4 transition-transform ${open === "mat" ? "rotate-180" : ""}`} />
              </button>
              {open === "mat" && (
                <div className="absolute left-0 top-full z-40 pt-3">
                  <div className="w-[40rem] rounded-2xl border border-neutral-200 bg-white p-4 shadow-elevated">
                    <div className="flex items-center justify-between px-2 pb-3">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-pine-700">Nos garde-corps</span>
                      <span className="font-mono text-[11px] text-neutral-400">3 matériaux · kit &amp; sur-mesure</span>
                    </div>
                    <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
                      <div className="space-y-1">
                        {materials.map((m) => (
                          <Link
                            key={m.slug}
                            href={`/garde-corps/${m.slug}`}
                            onClick={() => setOpen(null)}
                            className="group/it flex items-start gap-3 rounded-xl p-3 transition hover:bg-pine-50"
                          >
                            <Swatch material={m.slug} />
                            <span className="min-w-0">
                              <span className="flex items-center gap-1 text-sm font-bold text-inkgreen group-hover/it:text-pine-700">
                                {m.title}
                                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover/it:text-pine-600" />
                              </span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">{m.benefits[0].desc}</span>
                              <span className="mt-1.5 flex gap-1.5">
                                {["Kit", "Sur-mesure"].map((t) => (
                                  <span key={t} className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold text-neutral-600">{t}</span>
                                ))}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/produits/${featured.slug}`}
                        onClick={() => setOpen(null)}
                        className="group/feat flex flex-col rounded-xl border border-neutral-200 p-4 transition hover:border-pine-300"
                      >
                        <span className="w-fit rounded-full bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950">
                          Best-seller
                        </span>
                        <span className="mt-3 text-sm font-bold text-inkgreen">{featured.name}</span>
                        <span className="mt-1 flex-1 text-xs leading-relaxed text-neutral-500">{featured.specs[0]} · {featured.specs[2]}</span>
                        <span className="mt-3 flex items-baseline justify-between">
                          <span className="text-lg font-extrabold text-pine-700">dès {featured.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span></span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-pine-700">
                            Voir la fiche <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/feat:translate-x-0.5" />
                          </span>
                        </span>
                      </Link>
                    </div>
                    <Link
                      href="/devis"
                      onClick={() => setOpen(null)}
                      className="group/cta mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-pine-600"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Configurer mon garde-corps en 1 min
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Par usage */}
            <div className="relative" onMouseEnter={() => setOpen("usage")} onMouseLeave={() => setOpen(null)}>
              <button
                type="button"
                aria-expanded={open === "usage"}
                onClick={() => setOpen(open === "usage" ? null : "usage")}
                className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${open === "usage" ? "text-pine-700" : "text-neutral-800 hover:text-pine-700"}`}
              >
                Par usage
                <ChevronDown className={`h-4 w-4 transition-transform ${open === "usage" ? "rotate-180" : ""}`} />
              </button>
              {open === "usage" && (
                <div className="absolute left-0 top-full z-40 pt-3">
                  <div className="w-[26rem] rounded-2xl border border-neutral-200 bg-white p-4 shadow-elevated">
                    <span className="block px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-pine-700">
                      Un garde-corps pour…
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {usages.map((u) => (
                        <Link
                          key={u.slug}
                          href={`/garde-corps/${u.slug}`}
                          onClick={() => setOpen(null)}
                          className="group/us flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-pine-50 hover:text-pine-700"
                        >
                          {u.name}
                          <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover/us:text-pine-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/produits" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-neutral-800 transition hover:text-pine-700">
              Kits &amp; produits
            </Link>
            <Link href="/guides" className="rounded-lg px-3.5 py-2 text-sm font-semibold text-neutral-800 transition hover:text-pine-700">
              Guides
            </Link>
          </nav>

          {/* CTA + burger */}
          <div className="flex items-center gap-2">
            <Link
              href="/devis"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-amber-500 py-2 pl-4 pr-2 text-sm font-bold text-pine-950 shadow-md shadow-amber-500/30 ring-1 ring-inset ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/40 sm:pl-5"
            >
              {/* reflet qui balaie le bouton au survol */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Estimer un tarif en direct</span>
              <span className="sm:hidden">Devis 1 min</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-950 text-amber-500 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg text-inkgreen transition hover:bg-neutral-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ---- drawer mobile ---- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-pine-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-5">
              <span className="text-base font-extrabold text-inkgreen">{site.name}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-inkgreen hover:bg-neutral-100"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {[
                { id: "mat", label: "Nos garde-corps", items: materials.map((m) => ({ href: `/garde-corps/${m.slug}`, label: m.title })) },
                { id: "usage", label: "Par usage", items: usages.map((u) => ({ href: `/garde-corps/${u.slug}`, label: u.name })) },
              ].map((section) => (
                <div key={section.id} className="border-b border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setMobileSection(mobileSection === section.id ? null : section.id)}
                    aria-expanded={mobileSection === section.id}
                    className="flex w-full items-center justify-between px-2 py-4 text-base font-bold text-inkgreen"
                  >
                    {section.label}
                    <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform ${mobileSection === section.id ? "rotate-180" : ""}`} />
                  </button>
                  {mobileSection === section.id && (
                    <div className="space-y-1 pb-3">
                      {section.items.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-pine-50 hover:text-pine-700"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/produits" onClick={() => setMobileOpen(false)} className="block border-b border-neutral-100 px-2 py-4 text-base font-bold text-inkgreen">
                Kits &amp; produits
              </Link>
              <Link href="/guides" onClick={() => setMobileOpen(false)} className="block border-b border-neutral-100 px-2 py-4 text-base font-bold text-inkgreen">
                Guides
              </Link>
            </div>
            <div className="space-y-3 border-t border-neutral-100 p-5">
              <a href={phoneHref} className="flex items-center justify-center gap-2 rounded-xl bg-mist px-4 py-3 text-sm font-bold text-inkgreen">
                <Phone className="h-4 w-4 text-pine-600" />
                {site.phone}
              </a>
              <Link
                href="/devis"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 text-sm font-bold text-pine-950 shadow-md shadow-amber-500/30 ring-1 ring-inset ring-white/40"
              >
                <ClipboardList className="h-4 w-4" />
                Estimer mon projet en 1 min
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
