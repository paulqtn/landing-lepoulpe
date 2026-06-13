import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { categoryMeta, landings, type LandingCategory } from "@/lib/landings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.legalName} — landing pages qui convertissent`,
  description:
    "Des landing pages de conversion par mot-clé (SEO & SEA) avec capture de leads. Recevez un audit gratuit et un rappel sous 24h.",
  alternates: { canonical: "/" },
};

const order: LandingCategory[] = ["seo", "ads", "strategie"];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* hero */}
        <section className="relative overflow-hidden pb-10 pt-12 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-12%] h-80 w-[44rem] -translate-x-1/2 rounded-full bg-poulpe-200/45 blur-3xl" />
            <div className="absolute inset-0 bg-dotgrid-light [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,#000_40%,transparent_100%)]" />
          </div>
          <Container className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-poulpe-700 shadow-sm ring-1 ring-poulpe-100">
              <Sparkles className="h-3.5 w-3.5 text-poulpe-500" />
              Offre tout inclus · payée aux résultats
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              On construit, on gère et on{" "}
              <span className="text-gradient">propulse votre business</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-600">
              Site, SEO, publicité et stratégie réunis dans une seule offre tout
              inclus — en location, payée à vos résultats. Vous gérez votre métier,
              on s’occupe de votre croissance.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/offre" size="lg">
                Découvrir l’offre
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/seo/audit-seo-gratuit" variant="secondary" size="lg">
                Audit gratuit
              </ButtonLink>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-poulpe-500 text-poulpe-500" />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-500">
                4,9/5 · +250 entreprises accompagnées
              </p>
            </div>
          </Container>
        </section>

        {/* featured offer */}
        <section className="py-10">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-ink via-ink-2 to-ink p-8 shadow-panel sm:p-10">
                <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-40" />
                <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-poulpe-500/25 blur-3xl" />
                <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-poulpe-300">
                      <Sparkles className="h-3 w-3" /> Offre principale
                    </span>
                    <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-[1.75rem]">
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
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-poulpe-500 px-7 py-4 text-base font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-poulpe-600"
                  >
                    Découvrir l’offre
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* à la carte */}
        <Container className="pt-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
            À la carte
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Besoin d’une expertise précise ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Chaque expertise est aussi disponible séparément. Choisissez votre
            objectif.
          </p>
        </Container>

        {/* categories */}
        {order.map((cat) => {
          const meta = categoryMeta[cat];
          const pages = landings.filter((l) => l.category === cat);
          return (
            <section key={cat} className="py-12 sm:py-16">
              <Container>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
                    {meta.label}
                  </span>
                  <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
                    {meta.title}
                  </h2>
                  <p className="mt-1 text-slate-600">{meta.description}</p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                  {pages.map((l, i) => (
                    <Reveal key={l.slug} delay={i * 70}>
                      <Link
                        href={`/${l.category}/${l.slug}`}
                        className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-poulpe-200 hover:shadow-elevated"
                      >
                        <span className="w-fit rounded-full bg-poulpe-50 px-3 py-1 text-xs font-semibold text-poulpe-700">
                          {l.categoryLabel}
                        </span>
                        <h3 className="mt-4 text-xl font-bold text-ink">
                          {l.nav.ctaLabel}
                        </h3>
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

        {/* final CTA */}
        <section className="py-12 sm:py-20">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-poulpe-500 via-poulpe-500 to-poulpe-600 px-6 py-16 text-center shadow-glow sm:px-12">
                <div className="pointer-events-none absolute -top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
                <div className="relative mx-auto max-w-2xl">
                  <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
                    Pas sûr par où commencer ?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-white/90">
                    Commencez par un audit gratuit. On identifie vos priorités et
                    on vous rappelle sous 24h, sans engagement.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/seo/audit-seo-gratuit"
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-poulpe-700 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5"
                    >
                      Démarrer mon audit gratuit
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
