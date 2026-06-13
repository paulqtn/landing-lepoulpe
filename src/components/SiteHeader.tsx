"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { mainNav, topBarPerks, type NavEntry } from "@/lib/nav";
import { site } from "@/lib/site";

type MegaEntry = Extract<NavEntry, { kind: "mega" }>;

export function SiteHeader({
  ctaHref = "/seo/audit-seo-gratuit",
  ctaLabel = "Audit marketing gratuit",
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
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

  const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;

  return (
    <>
      {/* ---- top utility bar (bandeau) ---- */}
      <div className="bg-ink text-slate-300">
        <Container className="flex h-11 items-center justify-between text-xs">
          <a
            href={phoneHref}
            className="group -ml-1.5 flex items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 transition-colors hover:bg-white/5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-green-500 text-white shadow-sm ring-1 ring-green-400/40 transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-green-500/25">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="font-semibold tracking-wider text-green-100 transition-colors group-hover:text-white">
              {site.phone}
            </span>
            <span className="relative ml-0.5 flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          </a>
          <ul className="hidden items-center gap-5 sm:flex">
            {topBarPerks.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-poulpe-400" />
                {p}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* ---- main bar (sticky) ---- */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-canvas/85 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link href="/" aria-label="Le Poulpe — accueil" onClick={() => setOpen(null)}>
            <Logo />
          </Link>

          {/* desktop nav */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {mainNav.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.label}
                  href={entry.href}
                  onClick={() => setOpen(null)}
                  className={
                    entry.highlight
                      ? "rounded-full bg-poulpe-50 px-3.5 py-2 text-sm font-bold text-poulpe-700 ring-1 ring-poulpe-100 transition hover:bg-poulpe-100"
                      : "rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:text-poulpe-600"
                  }
                >
                  {entry.label}
                </Link>
              ) : (
                <div
                  key={entry.label}
                  className="relative"
                  onMouseEnter={() => setOpen(entry.label)}
                  onMouseLeave={() => setOpen(null)}
                >
                  <button
                    type="button"
                    aria-expanded={open === entry.label}
                    onClick={() =>
                      setOpen(open === entry.label ? null : entry.label)
                    }
                    className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      open === entry.label
                        ? "text-poulpe-600"
                        : "text-slate-700 hover:text-poulpe-600"
                    }`}
                  >
                    {entry.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        open === entry.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open === entry.label && (
                    <div className="absolute left-0 top-full z-40 pt-3">
                      <MegaPanel
                        entry={entry}
                        ctaHref={ctaHref}
                        onNavigate={() => setOpen(null)}
                      />
                    </div>
                  )}
                </div>
              ),
            )}
          </nav>

          {/* right: CTA + burger */}
          <div className="flex items-center gap-2">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-full bg-poulpe-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-poulpe-500/30 transition-all hover:-translate-y-0.5 hover:bg-poulpe-600 sm:px-5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="sm:hidden">Audit gratuit</span>
              <span className="hidden sm:inline">{ctaLabel}</span>
              <ArrowRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:inline" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg text-ink transition hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>

      {/* ---- mobile drawer ---- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-ink hover:bg-slate-100"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {mainNav.map((entry) =>
                entry.kind === "link" ? (
                  <Link
                    key={entry.label}
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block border-b border-slate-100 px-3 py-4 text-base font-semibold ${
                      entry.highlight ? "text-poulpe-700" : "text-ink"
                    }`}
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <div key={entry.label} className="border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection(
                          mobileSection === entry.label ? null : entry.label,
                        )
                      }
                      aria-expanded={mobileSection === entry.label}
                      className="flex w-full items-center justify-between px-3 py-4 text-base font-semibold text-ink"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon name={entry.icon} className="h-4 w-4 text-poulpe-500" />
                        {entry.label}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform ${
                          mobileSection === entry.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileSection === entry.label && (
                      <div className="space-y-1 pb-3 pl-2">
                        {entry.leaves.map((leaf) => (
                          <Link
                            key={leaf.href}
                            href={leaf.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-poulpe-50"
                          >
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-poulpe-50 text-poulpe-600">
                              <Icon name={leaf.icon} className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-ink">
                                {leaf.title}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {leaf.desc}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="space-y-3 border-t border-slate-100 p-5">
              <a
                href={phoneHref}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-ink"
              >
                <Phone className="h-4 w-4 text-poulpe-500" />
                {site.phone}
              </a>
              <Link
                href={ctaHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-poulpe-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-poulpe-500/30"
              >
                <Sparkles className="h-4 w-4" />
                {ctaLabel}
              </Link>
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-1">
                {topBarPerks.map((p) => (
                  <li key={p} className="flex items-center gap-1 text-xs text-slate-500">
                    <Check className="h-3 w-3 text-poulpe-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MegaPanel({
  entry,
  ctaHref,
  onNavigate,
}: {
  entry: MegaEntry;
  ctaHref: string;
  onNavigate: () => void;
}) {
  const wide = entry.leaves.length > 2;
  return (
    <div
      className={`${
        wide ? "w-[42rem]" : "w-[34rem]"
      } rounded-2xl border border-slate-200 bg-white p-3 shadow-elevated ring-1 ring-slate-900/5`}
    >
      <div className="grid grid-cols-[1.5fr_1fr] gap-3">
        <div>
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {entry.summary}
          </p>
          <div className={wide ? "grid grid-cols-2 gap-1" : "space-y-1"}>
            {entry.leaves.map((leaf) => (
              <Link
                key={leaf.href}
                href={leaf.href}
                onClick={onNavigate}
                className="group/leaf flex items-start gap-3 rounded-xl p-3 transition hover:bg-poulpe-50"
              >
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-poulpe-50 text-poulpe-600 transition group-hover/leaf:bg-poulpe-500 group-hover/leaf:text-white">
                  <Icon name={leaf.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {leaf.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {leaf.desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href={ctaHref}
          onClick={onNavigate}
          className="group/promo relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-ink to-ink-2 p-4 text-white"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-poulpe-500/30 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-poulpe-300">
              <Sparkles className="h-3 w-3" />
              Offert
            </span>
            <p className="mt-3 text-sm font-bold leading-snug">
              Audit marketing gratuit
            </p>
            <p className="mt-1 text-xs text-slate-300">
              On analyse votre potentiel et on vous rappelle sous 24h.
            </p>
          </div>
          <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-poulpe-300">
            Je veux mon audit
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/promo:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
