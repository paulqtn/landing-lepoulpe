import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ClipboardList, Phone, Ruler, ShieldCheck, Star, Truck, Warehouse } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { GoogleG, MaterialScene } from "@/components/Illustrations";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { getEntry, usages, type QA } from "@/lib/catalog";
import { getProduct, products } from "@/lib/products";
import { verres } from "@/lib/verres";
import { phoneHref, site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

/** Fiches « fixation » : le mini-configurateur connaît leur système. */
const FICHE_SYSTEME: Record<string, "rail" | "pinces" | "spider"> = {
  "garde-corps-verre-sur-rail": "rail",
  "garde-corps-verre-sur-pinces": "pinces",
  "garde-corps-verre-avec-spider": "spider",
};

/* Contenu vente + SXO propre à chaque fixation. */
const FICHE_CONTENT: Record<
  "rail" | "pinces" | "spider",
  { kw: string; inclusFix: string; verreConseil: string; faq: QA[] }
> = {
  rail: {
    kw: "sur rail",
    inclusFix: "Rail aluminium, habillages et cales de réglage",
    verreConseil:
      "Sur rail, le verre travaille seul, encastré en pied : le 88.4 est la référence en 1,00 m, le 1010.4 prend le relais en 1,10 m ou en zone ventée.",
    faq: [
      {
        q: "Quel est le prix d'un garde-corps en verre sur rail ?",
        a: "Comptez dès 320 €/ml en fourniture, découpe sur mesure et livraison incluses. Le prix exact dépend de vos longueurs, de la hauteur et de l'épaisseur du verre : renseignez-les dans le configurateur ci-dessus et votre tarif s'affiche immédiatement, sans engagement.",
      },
      {
        q: "Faut-il percer le verre pour un garde-corps sur rail ?",
        a: "Non. Les panneaux viennent se caler dans le profilé aluminium à la pose, sans aucun perçage. On règle l'aplomb directement dans le rail, on verrouille, puis on clipse les habillages : c'est ce qui rend le système si simple à poser soi-même.",
      },
      {
        q: "Un garde-corps tout verre sur rail est-il conforme aux normes ?",
        a: "Oui : verre feuilleté trempé conforme NF P01-012, dimensionné pour reprendre les efforts de la NF P01-013. En 1,00 m de hauteur avec du 88.4, vous êtes dans la configuration de référence du tout-verre résidentiel.",
      },
      {
        q: "Peut-on poser un garde-corps en verre sur rail soi-même ?",
        a: "Oui, c'est la fixation la plus simple des trois : le rail se visse au sol ou en nez de dalle, les verres s'y insèrent et se règlent sans perçage. Chaque kit part avec sa visserie, ses joints et sa notice — et un technicien vérifie vos cotes avant fabrication.",
      },
    ],
  },
  pinces: {
    kw: "sur pinces",
    inclusFix: "Pinces à verre inox et leur visserie",
    verreConseil:
      "Sur pinces, les points d'appui rapprochés autorisent le 66.4 dans la plupart des projets — le 88.4 apporte la marge des grandes portées ou des zones exposées.",
    faq: [
      {
        q: "Quel est le prix d'un garde-corps en verre sur pinces ?",
        a: "C'est la fixation la plus économique de la gamme : dès 250 €/ml en fourniture, découpe sur mesure et livraison incluses. Configurez vos dimensions ci-dessus pour obtenir votre tarif exact, immédiatement et sans engagement.",
      },
      {
        q: "Combien de pinces à verre faut-il prévoir ?",
        a: "La règle usuelle : une pince tous les 50 à 60 cm, avec un minimum de 2 à 3 pinces par panneau selon sa largeur. Inutile de compter vous-même : nous calculons le nombre exact de pinces pour vos longueurs, et elles sont comprises dans le tarif.",
      },
      {
        q: "Sur quel support fixer des pinces à verre ?",
        a: "Béton, muret, structure métallique ou nez de dalle : les pinces se posent à la française (sur le dessus du support) ou à l'anglaise (en applique latérale). Le verre est maintenu par serrage, sans perçage du panneau.",
      },
      {
        q: "Quelle épaisseur de verre avec des pinces ?",
        a: "Le 66.4 (2 × 6 mm) suffit dans la plupart des configurations à entraxes serrés — c'est le duo le plus économique. Passez au 88.4 pour davantage de marge, en zone ventée ou sur de plus grandes portées.",
      },
    ],
  },
  spider: {
    kw: "avec spider",
    inclusFix: "Rotules spider inox, verre percé d'usine",
    verreConseil:
      "Entre rotules, la rigidité vient de l'épaisseur : 88.4 en configuration standard, 1010.4 pour maximiser les portées ou tenir 1,10 m en zone exposée.",
    faq: [
      {
        q: "Qu'est-ce qu'un garde-corps en verre avec spider ?",
        a: "Un garde-corps où chaque panneau est tenu par des fixations inox ponctuelles traversantes — les rotules « spider » — vissées dans la structure. Résultat : un vitrage qui semble flotter, très utilisé en nez de dalle, façade et architecture contemporaine.",
      },
      {
        q: "Quel est le prix d'un garde-corps en verre avec spider ?",
        a: "Dès 300 €/ml en fourniture : perçage du verre, rotules, découpe sur mesure et livraison inclus. Renseignez vos dimensions dans le configurateur ci-dessus, votre tarif s'affiche immédiatement et sans engagement.",
      },
      {
        q: "Le perçage du verre est-il compris ?",
        a: "Oui. Les panneaux partent d'usine percés aux entraxes exacts de vos fixations — 4 points par verre en règle générale. À la pose, il ne reste qu'à visser les rotules : aucun usinage sur chantier.",
      },
      {
        q: "Quelle épaisseur de verre avec des spiders ?",
        a: "Le 88.4 est la valeur sûre en 1,00 m de hauteur. En zone très ventée, en 1,10 m ou pour écarter au maximum les points de fixation, le 1010.4 apporte la rigidité nécessaire.",
      },
    ],
  },
};

/* « Et ensuite ? » — le même parcours rassurant pour les trois fiches. */
const nextSteps = [
  { when: "Maintenant", what: "votre tarif s'affiche ci-dessus et s'ajuste en direct, sans engagement." },
  { when: "Sous 24h", what: "un technicien vérifie vos cotes et vous envoie le devis détaillé, gratuit." },
  { when: "En 10 jours", what: "fabrication sur mesure, puis livraison partout en France." },
];

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
  const fiche = systeme ? FICHE_CONTENT[systeme] : undefined;
  const media = p.photos?.length ? p.photos : p.photo ? [p.photo] : [];
  const imagesLd = media.filter((m) => !/\.(mp4|webm)$/i.test(m)).map((m) => `${site.url}${m}`);
  const [firstSentence, ...restSentences] = p.desc.split(". ");
  const oneLiner = p.tagline ?? `${firstSentence}.`;
  const descSuite = p.tagline ? p.desc : restSentences.join(". ");
  const materialEntry = getEntry(p.material);
  const others = products.filter((x) => x.material === p.material && x.slug !== p.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: p.name,
        description: p.desc,
        ...(imagesLd.length ? { image: imagesLd } : {}),
        brand: { "@type": "Brand", name: site.name },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          lowPrice: p.priceFrom,
          offerCount: 1,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          { "@type": "ListItem", position: 2, name: "Produits", item: `${site.url}/produits` },
          { "@type": "ListItem", position: 3, name: p.name, item: `${site.url}/produits/${p.slug}` },
        ],
      },
      ...(fiche
        ? [
            {
              "@type": "FAQPage",
              mainEntity: fiche.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
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

                    {/* preuve sociale — juste sous le tarif */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3">
                      <GoogleG className="h-4 w-4 shrink-0" />
                      <span className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-inkgreen">5,0 sur Google</span>
                      <span className="text-sm text-neutral-500">· avis de nos clients</span>
                    </div>

                    {/* ce que le tarif comprend — lève l'objection prix */}
                    <div className="mt-4 rounded-2xl border border-neutral-200/80 bg-white p-5">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">
                        Tout est compris
                      </p>
                      <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                        {[
                          "Découpe du verre au millimètre",
                          fiche!.inclusFix,
                          "Livraison partout en France",
                          "Cotes vérifiées par un technicien",
                        ].map((s) => (
                          <li key={s} className="flex items-start gap-2 text-sm text-neutral-600">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                            {s}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3.5 border-t border-neutral-100 pt-3 text-xs leading-relaxed text-neutral-400">
                        Pose non comprise : le tarif est 100 % fourniture, notice de pose fournie avec chaque kit.
                      </p>
                    </div>

                    {/* et ensuite — lève la peur de s'engager */}
                    <div className="mt-4 rounded-2xl border border-pine-100 bg-pine-50/60 p-5">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600">
                        Et ensuite ?
                      </p>
                      <ol className="mt-3 space-y-3">
                        {nextSteps.map((s, i) => (
                          <li key={s.when} className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-700 font-mono text-[10px] font-bold text-white">
                              {i + 1}
                            </span>
                            <p className="text-sm leading-snug text-neutral-600">
                              <strong className="font-extrabold text-inkgreen">{s.when}</strong> — {s.what}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
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

      {/* ---------- SXO : bien choisir, questions, maillage ---------- */}
      {fiche && (
        <section className="border-b border-neutral-200 py-14 sm:py-20">
          <Container>
            {/* quelle épaisseur — maillage /verre/* */}
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Bien choisir son verre</p>
              <h2 className="mt-3 text-balance text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
                Quelle épaisseur pour un garde-corps en verre {fiche.kw} ?
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-600">{fiche.verreConseil}</p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {verres.map((v, i) => {
                const note = v.fixations.find((f) => f.slug === p.slug)?.note;
                return (
                  <Reveal key={v.slug} delay={i * 60}>
                    <Link
                      href={`/verre/${v.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-2xl font-extrabold tabular-nums text-inkgreen transition-colors group-hover:text-pine-700">
                          {v.label}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                          {v.caracteristiques[0].value}
                        </span>
                      </span>
                      {note && <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">{note}</p>}
                      <span className="mt-4 flex items-center gap-1 border-t border-neutral-100 pt-4 text-xs font-bold text-pine-700">
                        Tout savoir sur le {v.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            {/* FAQ ciblée fixation */}
            <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Questions fréquentes</p>
                <h2 className="mt-3 text-balance text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
                  Le garde-corps en verre {fiche.kw}, en clair
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Prix, pose, normes : les réponses de l'atelier. Une question plus précise ?{" "}
                  <a href={phoneHref} className="font-bold text-pine-700 hover:underline">
                    {site.phone}
                  </a>
                  , un technicien vous répond.
                </p>
              </div>
              <FaqAccordion faq={fiche.faq} />
            </div>

            {/* maillage par usage */}
            <div className="mt-14 rounded-2xl border border-neutral-200 bg-mist p-6 sm:p-7">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                Le verre {fiche.kw}, pour quel projet ?
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {usages.map((u) => (
                  <Link
                    key={u.slug}
                    href={`/garde-corps/verre-${u.slug}`}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
                  >
                    Garde-corps verre {u.name.toLowerCase()}
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-pine-600" />
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

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
