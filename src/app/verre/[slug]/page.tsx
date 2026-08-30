import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList, Layers, Phone } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getProduct } from "@/lib/products";
import { getVerre, verres } from "@/lib/verres";
import { phoneHref, site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

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

      {/* hero */}
      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-12 sm:py-16">
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">Verre {v.label}</span>
          </nav>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                <Layers className="h-4 w-4" />
                Épaisseur de verre
              </p>
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight text-inkgreen sm:text-5xl">
                {v.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-600">{v.intro}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/devis"
                  className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-pine-700 py-3.5 pl-6 pr-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pine-600"
                >
                  <ClipboardList className="h-4 w-4 shrink-0" />
                  Estimer mon projet en 1 min
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={phoneHref}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3.5 text-sm font-bold text-inkgreen shadow-card transition-all hover:-translate-y-0.5"
                >
                  <Phone className="h-4 w-4 shrink-0 text-pine-600" />
                  {site.phone}
                </a>
              </div>
            </div>

            {/* fiche technique */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-700">
                  Fiche technique
                </p>
                <p className="text-lg font-extrabold tabular-nums text-inkgreen">
                  dès {v.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                </p>
              </div>
              <dl className="mt-4 space-y-3">
                {v.caracteristiques.map((c) => (
                  <div key={c.label} className="flex items-baseline justify-between gap-4 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm font-semibold text-neutral-500">{c.label}</dt>
                    <dd className="text-right text-sm font-bold text-inkgreen">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* points forts */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Pourquoi le {v.label} ?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {v.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 60}>
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
                    href="/devis"
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
