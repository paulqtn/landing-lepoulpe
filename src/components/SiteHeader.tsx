"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { usages } from "@/lib/catalog";
import { phoneHref, site } from "@/lib/site";

/** Menu « Type de fixation » — les 3 fiches produit. */
const fixations = [
  {
    slug: "garde-corps-verre-sur-rail",
    name: "Verre sur rail",
    desc: "Rail alu au sol, sans poteaux",
    photo: "/verre-sur-rail.jpg",
    price: 320,
  },
  {
    slug: "garde-corps-verre-sur-pinces",
    name: "Verre sur pinces",
    desc: "Au sol ou sur muret",
    photo: "/pinces-au-sol.jpg",
    price: 250,
  },
  {
    slug: "garde-corps-verre-avec-spider",
    name: "Verre avec spider",
    desc: "Rotules traversantes, pose latérale",
    photo: "/garde-corps-verre-fenetre-2.jpg",
    price: 300,
  },
];

/** Menu « Épaisseur de verre » — les 3 pages verre feuilleté. */
const epaisseurs = [
  { slug: "66-4", label: "66.4", desc: "La base sécurisée — pinces & petites portées" },
  { slug: "88-4", label: "88.4", desc: "Le standard du tout-verre sur rail" },
  { slug: "1010-4", label: "1010.4", desc: "Grandes portées & zones exposées" },
];

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
                      Un garde-corps en verre pour…
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

            {/* Type de fixation */}
            <div className="relative" onMouseEnter={() => setOpen("fix")} onMouseLeave={() => setOpen(null)}>
              <button
                type="button"
                aria-expanded={open === "fix"}
                onClick={() => setOpen(open === "fix" ? null : "fix")}
                className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${open === "fix" ? "text-pine-700" : "text-neutral-800 hover:text-pine-700"}`}
              >
                Type de fixation
                <ChevronDown className={`h-4 w-4 transition-transform ${open === "fix" ? "rotate-180" : ""}`} />
              </button>
              {open === "fix" && (
                <div className="absolute left-0 top-full z-40 pt-3">
                  <div className="w-[32rem] rounded-2xl border border-neutral-200 bg-white p-4 shadow-elevated">
                    <span className="block px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-pine-700">
                      Le même verre, trois fixations
                    </span>
                    <div className="space-y-1.5">
                      {fixations.map((f) => (
                        <Link
                          key={f.slug}
                          href={`/produits/${f.slug}`}
                          onClick={() => setOpen(null)}
                          className="group/fx flex items-center gap-3.5 rounded-xl p-2.5 transition hover:bg-pine-50"
                        >
                          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image src={f.photo} alt="" fill sizes="5rem" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1 text-sm font-bold text-inkgreen group-hover/fx:text-pine-700">
                              {f.name}
                              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover/fx:text-pine-600" />
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-neutral-500">{f.desc}</span>
                          </span>
                          <span className="shrink-0 text-sm font-extrabold tabular-nums text-pine-700">
                            dès {f.price} €<span className="text-[10px] font-semibold text-neutral-400">/ml</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Épaisseur de verre */}
            <div className="relative" onMouseEnter={() => setOpen("verre")} onMouseLeave={() => setOpen(null)}>
              <button
                type="button"
                aria-expanded={open === "verre"}
                onClick={() => setOpen(open === "verre" ? null : "verre")}
                className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${open === "verre" ? "text-pine-700" : "text-neutral-800 hover:text-pine-700"}`}
              >
                Épaisseur de verre
                <ChevronDown className={`h-4 w-4 transition-transform ${open === "verre" ? "rotate-180" : ""}`} />
              </button>
              {open === "verre" && (
                <div className="absolute left-0 top-full z-40 pt-3">
                  <div className="w-[26rem] rounded-2xl border border-neutral-200 bg-white p-4 shadow-elevated">
                    <span className="block px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-pine-700">
                      Verre feuilleté de sécurité
                    </span>
                    <div className="space-y-1">
                      {epaisseurs.map((e) => (
                        <Link
                          key={e.slug}
                          href={`/verre/${e.slug}`}
                          onClick={() => setOpen(null)}
                          className="group/ep flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition hover:bg-pine-50"
                        >
                          <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg border border-pine-200 bg-pine-50 font-mono text-xs font-bold text-pine-700">
                            {e.label}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1 text-sm font-bold text-inkgreen group-hover/ep:text-pine-700">
                              Verre feuilleté {e.label}
                              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover/ep:text-pine-600" />
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-neutral-500">{e.desc}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                { id: "usage", label: "Par usage", items: usages.map((u) => ({ href: `/garde-corps/${u.slug}`, label: u.name })) },
                { id: "fix", label: "Type de fixation", items: fixations.map((f) => ({ href: `/produits/${f.slug}`, label: f.name })) },
                { id: "verre", label: "Épaisseur de verre", items: epaisseurs.map((e) => ({ href: `/verre/${e.slug}`, label: `Verre feuilleté ${e.label}` })) },
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
