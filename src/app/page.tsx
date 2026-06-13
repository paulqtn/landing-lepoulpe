import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Icon } from "@/components/Icon";
import { SiteHeader } from "@/components/SiteHeader";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Spotlight } from "@/components/ui/Spotlight";
import { categoryMeta, landings, type LandingCategory } from "@/lib/landings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.legalName} — accélérateur de croissance`,
  description:
    "Accélérateur spécialisé en acquisition et conversion. On transforme votre trafic en chiffre d’affaires — et on s’engage sur vos résultats, avec des garanties.",
  alternates: { canonical: "/" },
};

const order: LandingCategory[] = ["seo", "ads", "strategie"];

type StatItem = {
  prefix?: string;
  suffix?: string;
  value: number;
  decimals?: number;
  label: string;
};

const heroStats: StatItem[] = [
  { prefix: "+", value: 250, label: "entreprises accélérées" },
  { prefix: "×", value: 2.8, decimals: 1, label: "de CA en moyenne" },
  { prefix: "+", value: 120, suffix: " %", label: "de leads en plus" },
  { value: 24, suffix: " h", label: "pour un premier retour" },
];

const resultStats: StatItem[] = [
  { prefix: "+", value: 250, label: "entreprises accélérées" },
  { prefix: "×", value: 2.8, decimals: 1, label: "de chiffre d’affaires" },
  { value: 1.4, decimals: 1, suffix: " M", label: "de leads générés" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "de satisfaction client" },
];

const flow: { icon: "target" | "click" | "trophy"; title: string; desc: string }[] = [
  { icon: "target", title: "Acquisition", desc: "On capte une audience qualifiée : SEO, Google, Meta & TikTok Ads." },
  { icon: "click", title: "Conversion", desc: "On transforme ce trafic en clients : offres, pages et tunnels optimisés." },
  { icon: "trophy", title: "Croissance", desc: "On pilote à la performance et on accélère, mois après mois." },
];

const heroGuarantees = ["Payé aux résultats", "Objectifs au contrat", "Sortie possible à 1 an"];

const sectors = [
  "E-commerce",
  "SaaS & Tech",
  "Services B2B",
  "Immobilier",
  "Santé",
  "Artisanat",
  "Restauration",
  "Startups",
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ============================ HERO ============================ */}
        <section id="top" className="relative overflow-hidden">
          {/* animated backdrop */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-aurora absolute -left-[12%] top-[-12%] h-[42rem] w-[42rem] rounded-full bg-poulpe-300/40 blur-[120px]" />
            <div className="animate-aurora absolute right-[-14%] top-[4%] h-[34rem] w-[34rem] rounded-full bg-flame/30 blur-[120px] [animation-delay:-6s]" />
            <div className="animate-aurora absolute bottom-[-25%] left-1/3 h-[32rem] w-[32rem] rounded-full bg-poulpe-200/45 blur-[120px] [animation-delay:-12s]" />
            <div className="absolute inset-0 bg-dotgrid-light [mask-image:radial-gradient(ellipse_72%_60%_at_50%_12%,#000_30%,transparent_75%)]" />
            <div className="absolute inset-0 bg-noise opacity-[0.04]" />
          </div>

          <Spotlight>
            <Container className="flex flex-col items-center pb-20 pt-14 text-center sm:pt-20 lg:pt-24">
              <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-poulpe-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-poulpe-700 shadow-sm backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-poulpe-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-poulpe-500" />
                </span>
                Accélérateur de croissance · acquisition & conversion
              </div>

              <h1 className="animate-fade-up mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[0.98] tracking-tight text-ink [animation-delay:80ms] sm:text-6xl lg:text-7xl">
                On transforme votre trafic en{" "}
                <span className="text-shine">chiffre d’affaires.</span>
              </h1>

              <p className="animate-fade-up mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 [animation-delay:160ms] sm:text-xl">
                Le Poulpe est l’accélérateur des entreprises ambitieuses.
                Spécialistes de l’acquisition et de la conversion, on ne vend pas
                du marketing — on vend des résultats, avec des garanties.
              </p>

              <div className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-2.5 [animation-delay:220ms]">
                {heroGuarantees.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
                  >
                    <Check className="h-4 w-4 text-poulpe-500" />
                    {g}
                  </span>
                ))}
              </div>

              <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 [animation-delay:300ms] sm:flex-row">
                <Link
                  href="/offre"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-poulpe-500 px-8 py-4 text-base font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-poulpe-600"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Zap className="h-5 w-5" />
                  Accélérer mon business
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#resultats"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-7 py-4 text-base font-semibold text-ink shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-poulpe-300"
                >
                  Voir nos résultats
                </a>
              </div>

              {/* animated counters */}
              <div className="animate-fade-up mt-14 grid w-full max-w-3xl grid-cols-2 gap-3 [animation-delay:380ms] sm:grid-cols-4">
                {heroStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-card backdrop-blur"
                  >
                    <div className="text-3xl font-extrabold text-ink sm:text-4xl">
                      <Counter
                        value={s.value}
                        decimals={s.decimals ?? 0}
                        prefix={s.prefix ?? ""}
                        suffix={s.suffix ?? ""}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </Container>
          </Spotlight>

          {/* marquee */}
          <div className="border-y border-slate-100 bg-white/60 py-5 backdrop-blur">
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
              <div className="animate-marquee flex w-max gap-4 pr-4">
                {[...sectors, ...sectors].map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-poulpe-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== ACCELERATION FLOW ===================== */}
        <section className="py-20 sm:py-28">
          <Container>
            <SectionHeading
              eyebrow="Notre système"
              title={
                <>
                  De votre trafic à <span className="text-gradient">votre croissance</span>
                </>
              }
              intro="Une mécanique d’accélération en trois temps, pilotée à la performance."
            />

            <div className="relative mt-16 grid gap-6 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-poulpe-200 via-poulpe-400 to-poulpe-200 md:block" />
              {flow.map((f, i) => (
                <Reveal key={f.title} delay={i * 110}>
                  <div className="group relative h-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated">
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                      <span className="animate-pulse-glow absolute inset-2 rounded-3xl bg-poulpe-500/15" />
                      <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                        <Icon name={f.icon} className="h-7 w-7" />
                      </span>
                      <span className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-ink">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== RESULTS (dark wow) ===================== */}
        <section id="resultats" className="scroll-mt-24 py-12 sm:py-16">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ink via-ink-2 to-ink px-6 py-16 shadow-panel sm:px-12 sm:py-20">
                <div className="pointer-events-none absolute inset-0">
                  <div className="animate-aurora absolute -left-[6%] top-[-25%] h-72 w-72 rounded-full bg-poulpe-500/30 blur-3xl" />
                  <div className="animate-aurora absolute bottom-[-35%] right-[-6%] h-80 w-80 rounded-full bg-flame/20 blur-3xl [animation-delay:-8s]" />
                  <div className="absolute inset-0 bg-dotgrid-dark opacity-40" />
                  <div className="absolute inset-0 bg-noise opacity-[0.05]" />
                </div>

                <div className="relative text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-poulpe-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    On vend des résultats
                  </span>
                  <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-extrabold text-white sm:text-5xl">
                    Des chiffres, pas des promesses.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-pretty text-slate-300">
                    On s’engage sur des objectifs mesurables et on assume nos
                    garanties. Voilà ce que ça donne.
                  </p>

                  <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {resultStats.map((s) => (
                      <div key={s.label}>
                        <p className="text-4xl font-extrabold text-white sm:text-5xl">
                          <Counter
                            value={s.value}
                            decimals={s.decimals ?? 0}
                            prefix={s.prefix ?? ""}
                            suffix={s.suffix ?? ""}
                          />
                        </p>
                        <p className="mt-1.5 text-sm text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex flex-wrap justify-center gap-2.5">
                    {heroGuarantees.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-200"
                      >
                        <Check className="h-4 w-4 text-poulpe-400" />
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ===================== FEATURED OFFER ===================== */}
        <section className="py-10">
          <Container>
            <Reveal>
              <Spotlight className="overflow-hidden rounded-4xl shadow-panel">
                <div className="relative bg-gradient-to-br from-ink via-ink-2 to-ink p-8 sm:p-10">
                  <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-40" />
                  <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-poulpe-300">
                        <Sparkles className="h-3 w-3" /> Offre principale
                      </span>
                      <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-[1.8rem]">
                        Votre site + toute votre croissance, en location tout inclus.
                      </h2>
                      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                        {["Sans frais de création", "Tout inclus", "Payé aux résultats"].map(
                          (b) => (
                            <li
                              key={b}
                              className="flex items-center gap-2 text-sm font-medium text-slate-200"
                            >
                              <Check className="h-4 w-4 text-poulpe-400" /> {b}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <Link
                      href="/offre"
                      className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-full bg-poulpe-500 px-7 py-4 text-base font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-poulpe-600"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      Découvrir l’offre
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          </Container>
        </section>

        {/* ===================== À LA CARTE ===================== */}
        <Container className="pt-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
            À la carte
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Besoin d’une expertise précise ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Chaque levier est aussi disponible séparément. Choisissez votre objectif.
          </p>
        </Container>

        {order.map((cat) => {
          const meta = categoryMeta[cat];
          const pages = landings.filter((l) => l.category === cat);
          return (
            <section key={cat} className="py-10 sm:py-12">
              <Container>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
                    {meta.label}
                  </span>
                  <h3 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
                    {meta.title}
                  </h3>
                  <p className="mt-1 text-slate-600">{meta.description}</p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {pages.map((l, i) => (
                    <Reveal key={l.slug} delay={i * 70}>
                      <Link
                        href={`/${l.category}/${l.slug}`}
                        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-poulpe-200 hover:shadow-elevated"
                      >
                        <span className="absolute inset-x-0 top-0 h-1 -translate-y-full bg-gradient-to-r from-poulpe-500 to-flame transition-transform duration-300 group-hover:translate-y-0" />
                        <span className="w-fit rounded-full bg-poulpe-50 px-3 py-1 text-xs font-semibold text-poulpe-700">
                          {l.categoryLabel}
                        </span>
                        <h4 className="mt-4 text-xl font-bold text-ink">{l.nav.ctaLabel}</h4>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                          {l.meta.description}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-poulpe-600">
                          Voir la page
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </Container>
            </section>
          );
        })}

        {/* ===================== FINAL CTA ===================== */}
        <section className="py-16 sm:py-24">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-poulpe-500 via-poulpe-500 to-poulpe-600 px-6 py-16 text-center shadow-glow sm:px-12 sm:py-20">
                <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06]" />
                <div className="pointer-events-none absolute -top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
                <div className="relative mx-auto max-w-2xl">
                  <h2 className="text-balance text-3xl font-extrabold text-white sm:text-5xl">
                    Prêt à accélérer ?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-white/90">
                    Étude de projet gratuite. On vous rappelle sous 24h avec un plan
                    d’accélération — et nos garanties.
                  </p>
                  <div className="mt-9 flex justify-center">
                    <Link
                      href="/offre"
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-poulpe-700 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-poulpe-500/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      Accélérer mon business
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
