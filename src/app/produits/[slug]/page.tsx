import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList, Phone, Ruler, ShieldCheck, Truck, Warehouse } from "lucide-react";
import { MaterialScene } from "@/components/Illustrations";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import { Container } from "@/components/ui/Container";
import { getEntry } from "@/lib/catalog";
import { getProduct, products } from "@/lib/products";
import { phoneHref, site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

/** Fiches « fixation » : le mini-configurateur connaît leur système. */
const FICHE_SYSTEME: Record<string, "rail" | "pinces" | "spider"> = {
  "garde-corps-verre-sur-rail": "rail",
  "garde-corps-verre-sur-pinces": "pinces",
  "garde-corps-verre-avec-spider": "spider",
};

const trustBadges = [
  { icon: Truck, title: "Livraison partout en France", desc: "Depuis nos stocks, où que vous soyez." },
  { icon: Ruler, title: "Découpe sur mesure incluse", desc: "Longueurs, hauteurs et angles au millimètre." },
  { icon: ShieldCheck, title: "Conforme NF P01-012", desc: "Verre feuilleté de sécurité, efforts NF P01-013." },
  { icon: Warehouse, title: "Direct usine", desc: "Zéro intermédiaire : le prix de la fabrication." },
];

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

  const systeme = FICHE_SYSTEME[p.slug];
  const media = p.photos?.length ? p.photos : p.photo ? [p.photo] : [];
  const [firstSentence, ...restSentences] = p.desc.split(". ");
  const oneLiner = p.tagline ?? `${firstSentence}.`;
  const descSuite = p.tagline ? p.desc : restSentences.join(". ");
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
        <Container className="py-10 sm:py-14">
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/produits" className="hover:text-pine-700">Produits</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">{p.name}</span>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            {/* ---------- photo sticky + réassurance ---------- */}
            <div className="lg:sticky lg:top-28">
              {media.length > 0 ? (
                <ProductGallery media={media} alt={p.name} badge={p.badge} />
              ) : (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-pine-950 shadow-panel ring-1 ring-pine-950/10">
                  <MaterialScene material={p.material} className="h-full" />
                  {p.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950 shadow-lg">
                      {p.badge}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                {trustBadges.map((b) => (
                  <div key={b.title} className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-50 text-pine-700">
                      <b.icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2.5 text-sm font-extrabold leading-tight text-inkgreen">{b.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- contenu + configurateur ---------- */}
            <div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">{p.name}</h1>
              <p className="mt-2.5 leading-relaxed text-neutral-600">{oneLiner}</p>

              <div className="mt-5">
                {systeme ? (
                  <>
                    <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                      Configurez, le tarif suit
                    </p>
                    <ProductConfigurator systeme={systeme} />
                  </>
                ) : (
                  <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-card">
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
                  </div>
                )}
              </div>

              {/* description + caractéristiques complètes */}
              {descSuite && <p className="mt-7 text-sm leading-relaxed text-neutral-600">{descSuite}</p>}
              <div className="mt-5 rounded-2xl border border-neutral-200/80 bg-white p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Caractéristiques complètes
                </p>
                <ul className="mt-3 space-y-2">
                  {p.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-sm text-neutral-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
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
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
              >
                <span className="relative block h-32">
                  {o.photo ? (
                    <Image src={o.photo} alt="" fill sizes="24rem" className="object-cover" />
                  ) : (
                    <MaterialScene material={o.material} className="h-full" />
                  )}
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">{o.name}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">{o.specs[0]}</p>
                  <span className="mt-4 border-t border-neutral-100 pt-4 text-lg font-extrabold text-pine-700">
                    dès {o.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
