import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getEntry } from "@/lib/catalog";
import { getProduct, products } from "@/lib/products";
import { phoneHref, site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.name} — dès ${p.priceFrom} €/ml`,
    description: `${p.desc} Prix direct usine dès ${p.priceFrom} €/ml, devis détaillé en 24h.`,
    alternates: { canonical: `/produits/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const materialEntry = getEntry(p.material);
  const others = products.filter((x) => x.material === p.material && x.slug !== p.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.desc,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: p.priceFrom,
      offerCount: 1,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-12 sm:py-16">
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/produits" className="hover:text-pine-700">Produits</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">{p.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              {p.badge && (
                <span className="mb-4 inline-block rounded-full bg-amber-500 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950">
                  {p.badge}
                </span>
              )}
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">{p.name}</h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-600">{p.desc}</p>
              <ul className="mt-7 space-y-2.5">
                {p.specs.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700">
                    <Check className="h-4 w-4 shrink-0 text-pine-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-fit rounded-3xl border border-neutral-200 bg-white p-7 shadow-card">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Prix direct usine</p>
              <p className="mt-2 text-4xl font-extrabold text-pine-700">
                dès {p.priceFrom} €<span className="text-base font-bold text-neutral-400">/ml</span>
              </p>
              <p className="mt-1.5 text-xs text-neutral-400">Fourniture, hors pose — affiné selon vos dimensions.</p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/devis"
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-6 py-4 text-base font-bold text-white transition-all hover:bg-pine-600"
                >
                  <ClipboardList className="h-5 w-5" />
                  Estimer avec mes dimensions
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={phoneHref}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-mist px-6 py-3.5 text-sm font-bold text-inkgreen transition hover:bg-pine-50"
                >
                  <Phone className="h-4 w-4 text-pine-600" />
                  Un conseil ? {site.phone}
                </a>
              </div>
              <ul className="mt-5 space-y-1.5 border-t border-neutral-100 pt-4">
                {["Devis détaillé sous 24h", "Livraison partout en France", "Conforme NF P01-012"].map((g) => (
                  <li key={g} className="flex items-center gap-2 text-xs text-neutral-500">
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-extrabold text-inkgreen">Dans la même gamme</h2>
            {materialEntry && (
              <Link href={`/garde-corps/${materialEntry.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                Tout savoir sur le {materialEntry.name.toLowerCase()}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/produits/${o.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
              >
                <h3 className="text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">{o.name}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">{o.specs[0]}</p>
                <span className="mt-4 border-t border-neutral-100 pt-4 text-lg font-extrabold text-pine-700">
                  dès {o.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
