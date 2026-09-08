import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList } from "lucide-react";
import { Configurator } from "@/components/Configurator";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PageHero, type PageHeroImage } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getProduct } from "@/lib/products";
import { getVerre, verres } from "@/lib/verres";
import { site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

/* Visuel du hero — une image fixe par épaisseur. */
const HERO_IMAGES: Record<string, PageHeroImage> = {
  "66-4": {
    src: "/pinces-au-sol.jpg",
    alt: "Garde-corps en verre 66.4 sur pinces inox au bord d’une piscine",
    label: "Verre 66.4 · pinces",
    title: "Barrière de piscine",
  },
  "88-4": {
    src: "/verre-sur-rail.jpg",
    alt: "Garde-corps tout verre 88.4 sur rail le long d’une terrasse bois",
    label: "Verre 88.4 · rail",
    title: "Terrasse bois",
  },
  "1010-4": {
    src: "/module-verre-invisible-sur-mesure-ht-1m15.jpg",
    alt: "Garde-corps en verre 1010.4 autoportant autour d’un bassin",
    label: "Verre 1010.4 · autoportant",
    title: "Barrière de bassin",
  },
};

export function generateStaticParams() {
  return verres.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getVerre(slug);
  if (!v) return {};
  return {
    title: v.metaTitle,
    description: v.metaDescription,
    alternates: { canonical: `/verre/${v.slug}` },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: `${site.url}/verre/${v.slug}`,
      siteName: site.name,
      title: v.metaTitle,
      description: v.metaDescription,
    },
  };
}

export default async function VerrePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const v = getVerre(slug);
  if (!v) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          { "@type": "ListItem", position: 2, name: "Épaisseurs de verre", item: `${site.url}/verre/88-4` },
          { "@type": "ListItem", position: 3, name: v.title, item: `${site.url}/verre/${v.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: v.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero — même modèle que la homepage, une image fixe */}
      <PageHero
        kicker="Épaisseur de verre"
        title={v.title}
        intro={v.intro}
        image={HERO_IMAGES[v.slug] ?? HERO_IMAGES["88-4"]}
        breadcrumb={
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">Verre {v.label}</span>
          </nav>
        }
      />

      {/* générateur — l'épaisseur de la page est figée et transmise au moteur */}
      <section id="estimation" className="border-b border-neutral-200 bg-white py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Devis express</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
              Votre garde-corps en {v.label}, chiffré en 1 minute.
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-neutral-500">
              L’épaisseur <strong className="font-semibold text-inkgreen">{v.label}</strong> est déjà réglée — répondez
              au reste, <strong className="font-semibold text-inkgreen">votre tarif exact s’affiche à la fin</strong>.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-5xl">
            <Configurator lock={{ verre: v.label as "66.4" | "88.4" | "1010.4" }} source={`configurateur-verre-${v.slug}`} />
          </div>
        </Container>
      </section>

      {/* points forts */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Pourquoi le {v.label} ?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* fiche technique */}
            <Reveal>
              <div className="h-full rounded-2xl border border-pine-200 bg-pine-50/50 p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-700">
                    Fiche technique
                  </p>
                  <p className="text-base font-extrabold tabular-nums text-inkgreen">
                    dès {v.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                  </p>
                </div>
                <dl className="mt-4 space-y-2.5">
                  {v.caracteristiques.map((c) => (
                    <div key={c.label} className="flex items-baseline justify-between gap-3 border-b border-pine-100 pb-2.5 last:border-0 last:pb-0">
                      <dt className="text-xs font-semibold text-neutral-500">{c.label}</dt>
                      <dd className="text-right text-xs font-bold text-inkgreen">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
            {v.benefits.map((b, i) => (
              <Reveal key={b.title} delay={(i + 1) * 60}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-50 text-pine-700">
                    <Check className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-inkgreen">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* fixations compatibles */}
      <section className="border-y border-neutral-200 bg-mist py-16 sm:py-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
            Avec quelle fixation ?
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {v.fixations.map((f, i) => {
              const p = getProduct(f.slug);
              return (
                <Reveal key={f.slug} delay={i * 60}>
                  <Link
                    href={`/produits/${f.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                  >
                    <span className="font-mono text-xs font-bold text-pine-600">0{i + 1}</span>
                    <h3 className="mt-2 text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">
                      {f.name}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-neutral-500">{f.note}</p>
                    <span className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                      {p && (
                        <span className="text-base font-extrabold text-pine-700">
                          dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs font-bold text-pine-700">
                        Voir la fiche
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Questions fréquentes</h2>
          <div className="mt-8 max-w-3xl">
            <FaqAccordion faq={v.faq} />
          </div>
        </Container>
      </section>

      {/* autres épaisseurs + CTA */}
      <section className="pb-20">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Autres épaisseurs</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {verres.filter((o) => o.slug !== v.slug).map((o) => (
              <Link
                key={o.slug}
                href={`/verre/${o.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
              >
                Verre feuilleté {o.label}
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-pine-600" />
              </Link>
            ))}
          </div>

          <Reveal>
            <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-14 text-center text-white shadow-panel sm:px-12">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="text-balance text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl">
                  Votre garde-corps en {v.label}, estimé en 1 minute.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-pine-100/75">
                  Découpe sur mesure incluse — devis détaillé sous 24h, gratuit et sans engagement.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="#estimation"
                    className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white py-4 pl-7 pr-6 text-base font-bold text-pine-800 transition-all hover:-translate-y-0.5"
                  >
                    <ClipboardList className="h-5 w-5 shrink-0" />
                    Estimer mon projet
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
