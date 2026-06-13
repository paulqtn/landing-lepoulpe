import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
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

const heroGuarantees = ["Payé aux résultats", "Objectifs au contrat", "Sortie possible à 1 an"];

const expertises = [
  { n: "01", label: "Référencement (SEO)", href: "/seo/strategie-seo" },
  { n: "02", label: "Publicité — Google, Meta, TikTok", href: "/ads/audit-google-ads" },
  { n: "03", label: "Stratégie & conseil", href: "/strategie/conseil-strategique" },
  { n: "04", label: "Site + croissance, tout inclus", href: "/offre" },
];

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
  { value: 4.9, decimals: 1, suffix: "/5", label: "de satisfaction" },
];

const flow = [
  { n: "01", title: "Acquisition", desc: "On capte une audience qualifiée — SEO, Google, Meta & TikTok Ads." },
  { n: "02", title: "Conversion", desc: "On transforme ce trafic en clients — offres, pages et tunnels optimisés." },
  { n: "03", title: "Croissance", desc: "On pilote à la performance et on accélère, mois après mois." },
];

function Stat({ s }: { s: StatItem }) {
  return (
    <Counter
      value={s.value}
      decimals={s.decimals ?? 0}
      prefix={s.prefix ?? ""}
      suffix={s.suffix ?? ""}
    />
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="bg-paper text-espresso">
        {/* ============================ HERO ============================ */}
        <section className="border-b border-espresso/10">
          <Container className="pb-14 pt-12 sm:pt-16">
            <div className="flex items-center justify-between border-b border-espresso/10 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-espresso/55">
              <span>Le Poulpe — Accélérateur</span>
              <span className="hidden sm:inline">Acquisition · Conversion · Résultats</span>
            </div>

            <div className="grid gap-12 pt-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16 lg:pt-16">
              <div>
                <h1 className="font-serif text-[2.6rem] font-medium leading-[1.02] tracking-tight text-espresso sm:text-6xl lg:text-[5rem]">
                  On transforme votre trafic en{" "}
                  <span className="italic text-clay-600">résultats</span>.
                </h1>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-espresso/70">
                  Le Poulpe est l’accélérateur des entreprises ambitieuses.
                  Spécialistes de l’acquisition et de la conversion : on ne vend
                  pas du marketing, on vend des résultats — avec des garanties.
                </p>

                <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Link
                    href="/offre"
                    className="group inline-flex items-center gap-3 rounded-full bg-espresso py-3.5 pl-6 pr-3.5 text-base font-medium text-paper transition-colors hover:bg-clay-600"
                  >
                    Accélérer mon business
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-paper/15 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                  <a
                    href="#resultats"
                    className="text-base font-medium text-espresso underline decoration-clay-500/40 decoration-2 underline-offset-[6px] transition hover:decoration-clay-500"
                  >
                    Voir nos résultats
                  </a>
                </div>

                <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-espresso/55">
                  {heroGuarantees.map((g) => (
                    <li key={g} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* editorial index */}
              <div className="lg:border-l lg:border-espresso/10 lg:pl-12">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-espresso/45">
                  Nos expertises
                </p>
                <ul className="mt-2">
                  {expertises.map((e) => (
                    <li key={e.label}>
                      <Link
                        href={e.href}
                        className="group flex items-baseline gap-4 border-b border-espresso/10 py-4"
                      >
                        <span className="font-mono text-xs text-espresso/35">{e.n}</span>
                        <span className="flex-1 font-serif text-lg text-espresso transition-colors group-hover:text-clay-700">
                          {e.label}
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-espresso/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* ============================ STATS ============================ */}
        <section className="border-b border-espresso/10">
          <Container>
            <dl className="grid grid-cols-2 sm:grid-cols-4">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-1 py-9 ${i > 0 ? "sm:border-l sm:border-espresso/10 sm:pl-7" : ""}`}
                >
                  <dt className="font-serif text-4xl text-espresso sm:text-[2.6rem]">
                    <Stat s={s} />
                  </dt>
                  <dd className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-espresso/50">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* ============================ METHOD ============================ */}
        <section className="border-b border-espresso/10 py-20 sm:py-28">
          <Container>
            <div className="flex flex-col gap-4 border-b border-espresso/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl leading-[1.05] text-espresso sm:text-5xl">
                De votre trafic
                <br />à votre <span className="italic text-clay-600">croissance</span>.
              </h2>
              <p className="max-w-xs text-sm text-espresso/60">
                Une mécanique d’accélération en trois temps, pilotée à la
                performance.
              </p>
            </div>

            <div className="grid sm:grid-cols-3">
              {flow.map((f, i) => (
                <Reveal key={f.title} delay={i * 90}>
                  <div
                    className={`py-9 sm:py-12 ${i > 0 ? "sm:border-l sm:border-espresso/10 sm:pl-8" : "sm:pr-8"}`}
                  >
                    <span className="font-mono text-sm text-clay-600">{f.n}</span>
                    <h3 className="mt-4 font-serif text-2xl text-espresso">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-espresso/65">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== RESULTS (warm dark) ===================== */}
        <section id="resultats" className="scroll-mt-24 bg-espresso py-20 text-paper sm:py-28">
          <Container>
            <div className="flex flex-col gap-6 border-b border-paper/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay-300">
                  On vend des résultats
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-[1.05] sm:text-5xl">
                  Des chiffres,
                  <br />
                  pas des promesses.
                </h2>
              </div>
              <p className="max-w-xs text-sm text-paper/60">
                On s’engage sur des objectifs mesurables et on assume nos
                garanties.
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
              {resultStats.map((s, i) => (
                <div
                  key={s.label}
                  className={i > 0 ? "sm:border-l sm:border-paper/15 sm:pl-7" : ""}
                >
                  <dt className="font-serif text-4xl sm:text-5xl">
                    <Stat s={s} />
                  </dt>
                  <dd className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/55">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-paper/55">
              {heroGuarantees.map((g) => (
                <li key={g} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay-400" />
                  {g}
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ===================== OFFER ===================== */}
        <section className="border-b border-espresso/10 py-20 sm:py-28">
          <Container>
            <Reveal>
              <div className="grid items-center gap-8 rounded-4xl border border-espresso/15 bg-sand/60 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:gap-12">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay-700">
                    Offre principale
                  </p>
                  <h2 className="mt-3 font-serif text-3xl leading-[1.06] text-espresso sm:text-[2.5rem]">
                    Votre site, et toute votre croissance —{" "}
                    <span className="italic text-clay-600">
                      en location, payée aux résultats
                    </span>
                    .
                  </h2>
                  <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-espresso/55">
                    {["Sans frais de création", "Tout inclus", "Payé aux résultats"].map(
                      (b) => (
                        <li key={b} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
                          {b}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <Link
                  href="/offre"
                  className="group inline-flex items-center gap-3 self-start rounded-full bg-espresso py-3.5 pl-6 pr-3.5 text-base font-medium text-paper transition-colors hover:bg-clay-600 lg:self-center"
                >
                  Découvrir l’offre
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-paper/15 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ===================== À LA CARTE ===================== */}
        <section className="py-20 sm:py-28">
          <Container>
            <div className="border-b border-espresso/10 pb-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-espresso/45">
                À la carte
              </p>
              <h2 className="mt-3 font-serif text-3xl text-espresso sm:text-5xl">
                Ou une expertise précise.
              </h2>
            </div>

            {order.map((cat) => {
              const meta = categoryMeta[cat];
              const pages = landings.filter((l) => l.category === cat);
              return (
                <div
                  key={cat}
                  className="grid gap-5 border-b border-espresso/10 py-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-12"
                >
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay-700">
                      {meta.label}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl text-espresso">{meta.title}</h3>
                    <p className="mt-1 text-sm text-espresso/60">{meta.description}</p>
                  </div>
                  <ul>
                    {pages.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={`/${l.category}/${l.slug}`}
                          className="group flex items-center gap-4 border-t border-espresso/10 py-4 first:border-t-0"
                        >
                          <span className="flex-1 font-serif text-lg text-espresso transition-colors group-hover:text-clay-700">
                            {l.nav.ctaLabel}
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-espresso/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-clay-600" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </Container>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section className="pb-24">
          <Container>
            <div className="rounded-4xl bg-espresso px-6 py-16 text-center text-paper sm:px-12 sm:py-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay-300">
                Prêt à accélérer ?
              </p>
              <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.05] sm:text-6xl">
                On s’engage sur vos <span className="italic text-clay-400">résultats</span>.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-paper/70">
                Étude de projet gratuite. On vous rappelle sous 24h avec un plan
                d’accélération — et nos garanties.
              </p>
              <div className="mt-9 flex justify-center">
                <Link
                  href="/offre"
                  className="group inline-flex items-center gap-3 rounded-full bg-paper py-3.5 pl-6 pr-3.5 text-base font-medium text-espresso transition-colors hover:bg-clay-500 hover:text-paper"
                >
                  Accélérer mon business
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-espresso/10 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
