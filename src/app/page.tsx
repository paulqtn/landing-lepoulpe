import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Star } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { HeroDiagnostic } from "@/components/HeroDiagnostic";
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

const advantages = [
  "Contrat avec engagement",
  "Payé aux résultats",
  "Stratégie 100% sur-mesure",
];

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

function Marker() {
  return <span className="h-1.5 w-1.5 shrink-0 bg-poulpe-500" />;
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="bg-white text-neutral-900">
        {/* ============================ HERO ============================ */}
        <section className="border-b border-neutral-200">
          <div className="border-b border-neutral-200">
            <Container>
              <div className="flex items-center justify-between py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                <span className="hidden sm:inline">Le Poulpe — Accélérateur</span>
                <span className="flex items-center gap-1.5">
                  <span>Acquisition</span>
                  <span className="text-poulpe-500">·</span>
                  <span>Conversion</span>
                  <span className="text-poulpe-500">·</span>
                  <span>Résultats</span>
                </span>
              </div>
            </Container>
          </div>

          <Container>
            <div className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
              <div className="lg:col-span-6">
                <h1 className="font-grotesk text-[2.4rem] font-bold leading-[1.0] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.4rem]">
                  Nous boostons votre{" "}
                  <span className="text-poulpe-500">acquisition client</span>.
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600">
                  Accompagnement stratégique et opérationnel pour acquérir plus de
                  clients et augmenter votre taux de conversion.
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-[18px] w-[18px] fill-poulpe-500 text-poulpe-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600">
                    <span className="font-bold text-neutral-900">5/5</span>
                    <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                      sur Google
                    </span>
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link
                    href="/offre"
                    className="group inline-flex items-center gap-3 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500"
                  >
                    Accélérer mon business
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="#resultats"
                    className="text-sm font-semibold text-neutral-900 underline decoration-poulpe-500 decoration-2 underline-offset-4"
                  >
                    Voir les résultats
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 lg:col-start-8">
                <HeroDiagnostic />
              </div>
            </div>

          </Container>

          <div className="border-t border-neutral-200">
            <Container>
              <div className="grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {advantages.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-3 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
                  >
                    <Check className="h-5 w-5 shrink-0 text-poulpe-500" />
                    <span className="text-sm font-semibold text-neutral-900">{a}</span>
                  </div>
                ))}
              </div>
            </Container>
          </div>
        </section>

        {/* ============================ STATS ============================ */}
        <section className="border-b border-neutral-200">
          <Container>
            <dl className="grid grid-cols-2 md:grid-cols-4">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-10 ${i > 0 ? "md:border-l md:border-neutral-200 md:pl-8" : ""}`}
                >
                  <dt className="font-grotesk text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
                    <Stat s={s} />
                  </dt>
                  <dd className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* ============================ METHOD ============================ */}
        <section className="border-b border-neutral-200 py-20 sm:py-28">
          <Container>
            <div className="grid gap-6 border-b border-neutral-200 pb-10 lg:grid-cols-12">
              <h2 className="font-grotesk text-3xl font-bold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl lg:col-span-7">
                De votre trafic à votre croissance.
              </h2>
              <p className="text-neutral-600 lg:col-span-4 lg:col-start-9 lg:self-end">
                Une mécanique d’accélération en trois temps, pilotée à la
                performance.
              </p>
            </div>

            <div className="grid md:grid-cols-3">
              {flow.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div
                    className={`py-10 ${i > 0 ? "md:border-l md:border-neutral-200 md:pl-8" : "md:pr-8"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-poulpe-500">{f.n}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                        Étape
                      </span>
                    </div>
                    <h3 className="mt-6 font-grotesk text-2xl font-bold text-neutral-900">
                      {f.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-neutral-600">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ===================== RESULTS (high contrast) ===================== */}
        <section id="resultats" className="scroll-mt-24 bg-ink py-20 text-white sm:py-28">
          <Container>
            <div className="grid gap-6 border-b border-white/15 pb-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-400">
                  On vend des résultats
                </p>
                <h2 className="mt-3 font-grotesk text-3xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
                  Des chiffres, pas des promesses.
                </h2>
              </div>
              <p className="text-white/60 lg:col-span-4 lg:col-start-9 lg:self-end">
                On s’engage sur des objectifs mesurables et on assume nos
                garanties.
              </p>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-y-12 md:grid-cols-4">
              {resultStats.map((s, i) => (
                <div
                  key={s.label}
                  className={i > 0 ? "md:border-l md:border-white/15 md:pl-8" : ""}
                >
                  <dt className="font-grotesk text-5xl font-bold tracking-tight sm:text-6xl">
                    <Stat s={s} />
                  </dt>
                  <dd className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white/55">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* ===================== OFFER ===================== */}
        <section className="border-b border-neutral-200 py-20 sm:py-28">
          <Container>
            <Reveal>
              <div className="grid items-center gap-8 border border-neutral-900 p-8 sm:p-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-500">
                    Offre principale
                  </p>
                  <h2 className="mt-3 font-grotesk text-3xl font-bold leading-[1.04] tracking-tight text-neutral-900 sm:text-[2.6rem]">
                    Votre site + toute votre croissance, en location tout inclus.
                  </h2>
                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                    {["Sans frais de création", "Tout inclus", "Payé aux résultats"].map(
                      (b) => (
                        <span key={b} className="flex items-center gap-2">
                          <Marker />
                          {b}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <Link
                    href="/offre"
                    className="group inline-flex items-center gap-3 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500"
                  >
                    Découvrir l’offre
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ===================== À LA CARTE ===================== */}
        <section className="py-20 sm:py-28">
          <Container>
            <div className="border-b border-neutral-200 pb-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                À la carte
              </p>
              <h2 className="mt-3 font-grotesk text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Ou une expertise précise.
              </h2>
            </div>

            {order.map((cat) => {
              const meta = categoryMeta[cat];
              const pages = landings.filter((l) => l.category === cat);
              return (
                <div
                  key={cat}
                  className="grid gap-5 border-b border-neutral-200 py-10 lg:grid-cols-12 lg:gap-10"
                >
                  <div className="lg:col-span-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-500">
                      {meta.label}
                    </span>
                    <h3 className="mt-2 font-grotesk text-2xl font-bold text-neutral-900">
                      {meta.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">{meta.description}</p>
                  </div>
                  <ul className="lg:col-span-8">
                    {pages.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={`/${l.category}/${l.slug}`}
                          className="group flex items-center gap-4 border-t border-neutral-200 py-4 first:border-t-0"
                        >
                          <span className="font-mono text-xs text-neutral-400">
                            {l.categoryLabel}
                          </span>
                          <span className="flex-1 font-grotesk text-lg font-medium text-neutral-900 transition-colors group-hover:text-poulpe-500">
                            {l.nav.ctaLabel}
                          </span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-poulpe-500" />
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
            <div className="bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-24">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-400">
                Prêt à accélérer ?
              </p>
              <h2 className="mx-auto mt-5 max-w-3xl font-grotesk text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
                On s’engage sur vos <span className="text-poulpe-500">résultats</span>.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-white/65">
                Étude de projet gratuite. On vous rappelle sous 24h avec un plan
                d’accélération — et nos garanties.
              </p>
              <div className="mt-9 flex justify-center">
                <Link
                  href="/offre"
                  className="group inline-flex items-center gap-3 rounded-md bg-poulpe-500 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-neutral-900"
                >
                  Accélérer mon business
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
