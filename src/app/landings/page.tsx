import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { categoryMeta, landings, type LandingCategory } from "@/lib/landings";

export const metadata: Metadata = {
  title: "Nos landing pages qui convertissent",
  description:
    "L’ensemble des landing pages Le Poulpe, par intention de recherche : SEO et SEA. Chaque page capture des leads qualifiés.",
};

const order: LandingCategory[] = ["seo", "sea"];

export default function LandingsHub() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-canvas/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between sm:h-[4.5rem]">
          <Link href="/" aria-label="Le Poulpe — accueil">
            <Logo />
          </Link>
          <ButtonLink href="/seo/audit-seo-gratuit">Audit gratuit</ButtonLink>
        </Container>
      </header>

      <main className="pt-28 sm:pt-36">
        {/* hero */}
        <section className="relative overflow-hidden pb-8">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-10%] h-80 w-[40rem] -translate-x-1/2 rounded-full bg-poulpe-200/40 blur-3xl" />
            <div className="absolute inset-0 bg-dotgrid-light [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
          </div>
          <Container className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-poulpe-700 shadow-sm ring-1 ring-poulpe-100">
              <Sparkles className="h-3.5 w-3.5 text-poulpe-500" />
              Landing pages · une par intention de recherche
            </span>
            <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl">
              Des pages pensées pour <span className="text-gradient">convertir</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-slate-600">
              Chaque landing capture des leads qualifiés que nous rappelons sous
              24h. Choisissez votre objectif.
            </p>
          </Container>
        </section>

        {/* categories */}
        {order.map((cat) => {
          const meta = categoryMeta[cat];
          const pages = landings.filter((l) => l.category === cat);
          return (
            <section key={cat} className="py-12 sm:py-16">
              <Container>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-poulpe-700">
                      {meta.label}
                    </span>
                    <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
                      {meta.title}
                    </h2>
                    <p className="mt-1 text-slate-600">{meta.description}</p>
                  </div>
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

        <div className="h-8" />
      </main>
      <LandingFooter />
    </>
  );
}
