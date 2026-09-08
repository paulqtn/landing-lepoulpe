import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ClipboardList, Wrench } from "lucide-react";
import { Configurator } from "@/components/Configurator";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PageHero, type PageHeroImage } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  allCatalog,
  combosForMaterial,
  combosForUsage,
  getEntry,
  materials,
  usages,
} from "@/lib/catalog";
import { productsForMaterial } from "@/lib/products";
import { site } from "@/lib/site";

/* Visuel du hero — une image fixe par usage ou matériau. */
const HERO_IMAGES: Record<string, PageHeroImage> = {
  piscine: {
    src: "/Miroiterie-Degivry_Toulon-Var_Garde-corps-verre-Piscine.jpeg",
    alt: "Garde-corps en verre sans montants autour d’une piscine à débordement",
    label: "Verre · sans montants",
    title: "Piscine à débordement",
  },
  escalier: {
    src: "/rail-encastre.jpg",
    alt: "Rail aluminium encastré recevant un garde-corps tout verre",
    label: "Verre sur rail",
    title: "Rail encastré",
  },
  balcon: {
    src: "/garde_corps_balcon-nice.jpg",
    alt: "Garde-corps en verre sur un balcon face à la mer à Nice",
    label: "Verre · balcon",
    title: "Balcon à Nice",
  },
  terrasse: {
    src: "/e54c48337b19e03d00d49bb1d8a3bee5.jpg",
    alt: "Garde-corps tout verre sur rail au bord d’une terrasse panoramique",
    label: "Verre sur rail",
    title: "Terrasse panoramique",
  },
  mezzanine: {
    src: "/95d12a34079c6188ea5c76ddbc31ed25.jpg",
    alt: "Ligne tout-verre sur rail le long d’une façade contemporaine",
    label: "Verre sur rail",
    title: "Ligne tout-verre",
  },
  fenetre: {
    src: "/garde-corps-verre-fenetre-2.jpg",
    alt: "Garde-corps de fenêtre en verre à fixations spider",
    label: "Verre · spider",
    title: "Fenêtre sécurisée",
  },
  interieur: {
    src: "/gardecorps-1.jpg",
    alt: "Garde-corps en verre discret devant une baie vitrée",
    label: "Verre · garde-fenêtre",
    title: "Baie vitrée",
  },
  exterieur: {
    src: "/b23604c1f462de8fcbded67ad0f3d41b.jpg",
    alt: "Garde-corps en verre sur rail préservant la vue sur le jardin",
    label: "Verre sur rail",
    title: "Vue dégagée",
  },
  verre: {
    src: "/1713357460128.jpg",
    alt: "Garde-corps en verre sur pinces inox le long d’une plage de piscine",
    label: "Verre · pinces inox",
    title: "Plage de piscine",
  },
  aluminium: {
    src: "/alu.webp",
    alt: "Garde-corps aluminium thermolaqué sur-mesure",
    label: "Aluminium thermolaqué",
    title: "Sur-mesure & kit",
  },
  inox: {
    src: "/inox.jpeg",
    alt: "Garde-corps inox 316 sur-mesure",
    label: "Inox 316",
    title: "Sur-mesure & kit",
  },
};

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return allCatalog.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};
  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    alternates: { canonical: `/garde-corps/${entry.slug}` },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: `${site.url}/garde-corps/${entry.slug}`,
      siteName: site.name,
      title: entry.metaTitle,
      description: entry.metaDescription,
    },
  };
}

export default async function CatalogPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  // Maillage interne : pages liées selon le type d'entrée.
  const related =
    entry.kind === "material"
      ? combosForMaterial(entry.material!)
      : entry.kind === "usage"
        ? combosForUsage(entry.usage!)
        : [
            ...materials.filter((m) => m.slug !== entry.material).map((m) => getEntry(`${m.slug}-${entry.usage}`)!),
            getEntry(entry.material!)!,
            getEntry(entry.usage!)!,
          ];

  const kits = entry.material ? productsForMaterial(entry.material).slice(0, 3) : [];

  // Générateur intégré : l'usage de la page est figé, son étape disparaît du parcours.
  const usageLock =
    entry.kind === "usage" ? entry.slug
    : entry.kind === "combo" && entry.material === "verre" ? entry.usage
    : undefined;
  const usageName = usageLock ? usages.find((u) => u.slug === usageLock)?.name : undefined;
  const hasGenerator = Boolean(usageLock && usageName);
  const estimerHref = hasGenerator ? "#estimation" : "/devis";

  const heroImage =
    HERO_IMAGES[entry.kind === "combo" ? (entry.material === "verre" ? entry.usage! : entry.material!) : entry.slug] ??
    HERO_IMAGES.verre;
  const kicker =
    entry.kind === "usage" ? "Garde-corps par usage"
    : entry.kind === "combo" ? "Garde-corps sur-mesure"
    : "Garde-corps par matériau";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: site.url },
          { "@type": "ListItem", position: 2, name: "Garde-corps", item: `${site.url}/garde-corps` },
          { "@type": "ListItem", position: 3, name: entry.title, item: `${site.url}/garde-corps/${entry.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: entry.faq.map((f) => ({
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
        kicker={kicker}
        title={entry.title}
        intro={entry.intro}
        image={heroImage}
        estimerHref={estimerHref}
        breadcrumb={
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/garde-corps" className="hover:text-pine-700">Garde-corps</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">{entry.name}</span>
          </nav>
        }
      />

      {/* générateur — l'usage de la page est figé, l'étape correspondante est retirée */}
      {hasGenerator && (
        <section id="estimation" className="border-b border-neutral-200 bg-white py-14 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Devis express</p>
              <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Votre {entry.title.toLowerCase()}, chiffré en 1 minute.
              </h2>
              <p className="mx-auto mt-3 max-w-xl leading-relaxed text-neutral-500">
                Votre projet <strong className="font-semibold text-inkgreen">{usageName!.toLowerCase()}</strong> est déjà
                pris en compte — répondez au reste,{" "}
                <strong className="font-semibold text-inkgreen">votre tarif exact s’affiche à la fin</strong>.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-5xl">
              <Configurator
                lock={{ usage: usageLock }}
                lockNote={`Projet ${usageName!.toLowerCase()}`}
                source={`configurateur-${entry.slug}`}
              />
            </div>
          </Container>
        </section>
      )}

      {/* bénéfices */}
      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Pourquoi ce choix ?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {entry.benefits.map((b, i) => (
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

      {/* technique */}
      <section className="border-y border-neutral-200 bg-mist py-16 sm:py-24">
        <Container>
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-pine-600" />
            <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Côté technique</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {entry.technical.map((t, i) => (
              <Reveal key={t.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6">
                  <span className="font-mono text-xs font-bold text-pine-600">0{i + 1}</span>
                  <h3 className="mt-2 text-base font-extrabold text-inkgreen">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* kits associés */}
      {kits.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Nos kits adaptés</h2>
              <Link href="/produits" className="group inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                Toute la gamme
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {kits.map((p) => (
                <Link
                  key={p.slug}
                  href={`/produits/${p.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                >
                  <h3 className="text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">{p.name}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">{p.specs[0]} · {p.specs[1]}</p>
                  <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
                    <span className="text-lg font-extrabold text-pine-700">
                      dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-pine-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      <section className={`py-16 sm:py-24 ${kits.length > 0 ? "border-t border-neutral-200 bg-mist" : ""}`}>
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">Questions fréquentes</h2>
          <div className="mt-8 max-w-3xl">
            <FaqAccordion faq={entry.faq} />
          </div>
        </Container>
      </section>

      {/* maillage interne */}
      <section className="border-t border-neutral-200 py-16 sm:py-20">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">À explorer aussi</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {related.filter(Boolean).map((r) => (
              <Link
                key={r.slug}
                href={`/garde-corps/${r.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
              >
                {r.title}
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-pine-600" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA final */}
      <section className="pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-14 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-extrabold leading-[1.05] sm:text-4xl">
                Votre {entry.title.toLowerCase()}, estimé en 1 minute.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pine-100/75">
                Estimation immédiate, devis détaillé sous 24h — gratuit et sans engagement.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href={estimerHref}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white py-4 pl-7 pr-6 text-base font-bold text-pine-800 transition-all hover:-translate-y-0.5"
                >
                  <ClipboardList className="h-5 w-5" />
                  Estimer mon projet
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
