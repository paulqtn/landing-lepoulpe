import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ClipboardList, Image as ImageGlyph, Lightbulb, ShieldCheck, Wrench } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Configurator } from "@/components/Configurator";
import { FixationPoses } from "@/components/FixationPoses";
import { YouTubeLite } from "@/components/YouTubeLite";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PageHero, type PageHeroImage } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import {
  allCatalog,
  catalogPath,
  combosForMaterial,
  combosForUsage,
  getEntry,
  materials,
  usages,
} from "@/lib/catalog";
import { productsForMaterial } from "@/lib/products";
import { site } from "@/lib/site";
import { USAGE_BLOCKS } from "./usage-blocks";

/* Les trois blocs par usage sous le générateur (contenu : usage-blocks.tsx)
   partagent ces recettes : même surtitre, même H2, même bouton — seule la
   composition change. */
const PISCINE_KICKER = "font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700";
const PISCINE_H2 = "text-balance text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-inkgreen sm:text-4xl";
const PISCINE_CTA =
  "group flex items-center justify-center gap-2.5 rounded-full bg-pine-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-pine-900/20 transition-all hover:-translate-y-0.5 hover:bg-pine-600 sm:inline-flex";

/* Bloc piscine : réalisations en photos réelles. */
const REALISATIONS_PISCINE: { src: string; alt: string; tag: string; title: string }[] = [
  {
    src: "/realisation-piscine-1.webp",
    alt: "Barrière de piscine en verre autoportant autour d’une piscine à débordement",
    tag: "Verre autoportant",
    title: "Piscine à débordement",
  },
  {
    src: "/realisation-piscine-2.webp",
    alt: "Garde-corps en verre sur pinces inox le long d’une plage de piscine",
    tag: "Verre · pinces inox",
    title: "Plage de piscine",
  },
  {
    src: "/realisation-piscine-3.webp",
    alt: "Barrière de bassin en verre autoportant, hauteur 1,15 m",
    tag: "Autoportant · h 1,15 m",
    title: "Barrière de bassin",
  },
];

/* Visuel du hero — une image fixe par usage ou matériau. */
const HERO_IMAGES: Record<string, PageHeroImage> = {
  piscine: {
    src: "/hero-usage-piscine.webp",
    alt: "Garde-corps en verre autour de la piscine d’un mas provençal",
    label: "Verre · piscine",
    title: "Plage de piscine",
  },
  escalier: {
    src: "/hero-usage-escalier.webp",
    alt: "Escalier sécurisé par un garde-corps en verre",
    label: "Verre · escalier",
    title: "Escalier sécurisé",
  },
  balcon: {
    src: "/hero-usage-balcon.webp",
    alt: "Garde-corps en verre transparent installé sur un balcon d’appartement",
    label: "Verre · balcon",
    title: "Balcon panoramique",
  },
  terrasse: {
    src: "/hero-usage-terrasse.webp",
    alt: "Terrasse bordée d’un garde-corps tout verre",
    label: "Verre · terrasse",
    title: "Terrasse panoramique",
  },
  mezzanine: {
    src: "/hero-usage-mezzanine.webp",
    alt: "Mezzanine ouverte protégée par un garde-corps en verre",
    label: "Verre · mezzanine",
    title: "Mezzanine ouverte",
  },
  fenetre: {
    src: "/hero-usage-fenetre.webp",
    alt: "Garde-corps de fenêtre en verre sécurisant une baie",
    label: "Verre · fenêtre",
    title: "Fenêtre sécurisée",
  },
  interieur: {
    src: "/hero-usage-interieur.webp",
    alt: "Garde-corps en verre bordant une mezzanine intérieure",
    label: "Verre · intérieur",
    title: "Balustrade intérieure",
  },
  exterieur: {
    src: "/hero-usage-exterieur.webp",
    alt: "Garde-corps en verre en extérieur, vue sur le jardin",
    label: "Verre · extérieur",
    title: "Jardin & extérieurs",
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
    title: entry.metaTitleIsAbsolute ? { absolute: entry.metaTitle } : entry.metaTitle,
    description: entry.metaDescription,
    alternates: { canonical: catalogPath(entry.slug) },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: `${site.url}${catalogPath(entry.slug)}`,
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

  const kits = entry.material ? productsForMaterial(entry.material).slice(0, 3) : [];

  // Blocs dédiés sous le générateur (piscine, escalier…) — sinon, blocs génériques.
  const blocks = USAGE_BLOCKS[entry.slug];

  // Générateur intégré : l'usage de la page est figé, son étape disparaît du parcours.
  const usageLock =
    entry.kind === "usage" ? entry.slug
    : entry.kind === "combo" && entry.material === "verre" ? entry.usage
    : undefined;
  const usageName = usageLock ? usages.find((u) => u.slug === usageLock)?.name : undefined;
  const hasGenerator = Boolean(usageLock && usageName);
  const estimerHref = usageLock ? `/generateur?usage=${usageLock}` : "/generateur";

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
          { "@type": "ListItem", position: 3, name: entry.title, item: `${site.url}${catalogPath(entry.slug)}` },
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
        title={entry.h1 ?? entry.title}
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
                Votre {entry.title.toLowerCase()}, chiffré{/^barrière/i.test(entry.title) ? "e" : ""} en 1 minute.
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-5xl">
              <Configurator lock={{ usage: usageLock }} source={`configurateur-${entry.slug}`} />
            </div>
          </Container>
        </section>
      )}

      {/* ---- bloc 1 : le visuel d'abord (comparateur avant/après ou photo) ---- */}
      {blocks && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>{blocks.vue.kicker}</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.vue.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.vue.intro}
              </p>
            </header>

            {/* le visuel, élément dominant — bord à bord en mobile */}
            {blocks.vue.media.kind === "compare" ? (
              <BeforeAfterSlider
                className="-mx-5 mt-8 sm:mx-0 sm:mt-12"
                frameClassName="sm:rounded-[1.75rem] sm:shadow-panel sm:ring-1 sm:ring-pine-950/10"
                caption={blocks.vue.media.caption}
                before={blocks.vue.media.before}
                after={blocks.vue.media.after}
                ariaLabel={blocks.vue.media.ariaLabel}
              />
            ) : (
              <figure className="-mx-5 mt-8 sm:mx-0 sm:mt-12">
                <div className="relative aspect-[16/9] overflow-hidden sm:rounded-[1.75rem] sm:shadow-panel sm:ring-1 sm:ring-pine-950/10">
                  <Image
                    src={blocks.vue.media.src}
                    alt={blocks.vue.media.alt}
                    fill
                    sizes="(min-width: 1152px) 68rem, 100vw"
                    className="object-cover"
                  />
                </div>
                {blocks.vue.media.caption && (
                  <figcaption className="mt-3 px-5 text-center text-[13px] text-neutral-500 sm:px-0">
                    {blocks.vue.media.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* contenu secondaire : trois lignes sobres, un filet pour seule déco */}
            <ul className="mt-10 grid sm:mt-14 sm:grid-cols-3 sm:gap-x-10">
              {blocks.vue.points.map((v) => (
                <li key={v.t} className="border-t border-pine-900/10 py-4 sm:pb-0 sm:pt-5">
                  <p className="text-[0.95rem] font-extrabold tracking-tight text-inkgreen">{v.t}</p>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-neutral-600">{v.d}</p>
                </li>
              ))}
            </ul>

            {blocks.vue.footnote && (
              <p className="mx-auto mt-7 max-w-3xl text-pretty text-center text-sm leading-relaxed text-neutral-500 sm:mt-10">
                {blocks.vue.footnote}
              </p>
            )}

            <div className="mt-6 text-center sm:mt-12">
              <Link href={blocks.vue.cta.href} className={PISCINE_CTA}>
                {blocks.vue.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ---- solidité : accordéon sécurité, photo badgée, normes et CTA ---- */}
      {blocks?.solidite && (
        <section className="border-b border-neutral-200 bg-mist/60 py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-3xl text-center">
              <p className={`${PISCINE_KICKER} flex items-center justify-center gap-3`}>
                <span className="h-px w-8 bg-pine-600/40" aria-hidden />
                {blocks.solidite.kicker}
                <span className="h-px w-8 bg-pine-600/40" aria-hidden />
              </p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.solidite.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.solidite.intro}
              </p>
            </header>

            {/* items-start + ratio figé : la photo garde sa taille quand un
                accordéon se déplie. imageRight inverse les colonnes en desktop. */}
            <div
              className={`mt-10 grid gap-8 sm:mt-14 lg:items-start lg:gap-12 ${
                blocks.solidite.imageRight ? "lg:grid-cols-[1fr_0.92fr]" : "lg:grid-cols-[0.92fr_1fr]"
              }`}
            >
              {/* la photo, badge de réassurance posé dessus */}
              <Reveal className={blocks.solidite.imageRight ? "lg:order-2" : undefined}>
                <div className="relative aspect-square overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 sm:aspect-[4/3] lg:aspect-[0.9]">
                  <Image
                    src={blocks.solidite.photo.src}
                    alt={blocks.solidite.photo.alt}
                    fill
                    sizes="(min-width: 1152px) 32rem, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute left-3 top-3 flex max-w-[13.5rem] items-center gap-2.5 rounded-xl bg-white/95 px-3 py-2.5 shadow-card sm:left-4 sm:top-4 sm:max-w-[16rem] sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-700 text-white sm:h-10 sm:w-10 sm:rounded-xl">
                      <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="text-[12px] font-extrabold leading-snug text-inkgreen sm:text-[13.5px]">
                      {blocks.solidite.photo.badge}
                    </span>
                  </div>
                </div>
              </Reveal>

              {/* accordéon exclusif + normes + CTA */}
              <div>
                <div className="space-y-3">
                  {blocks.solidite.items.map((item, i) => (
                    <details
                      key={item.t}
                      name="solidite"
                      open={i === 0}
                      className="group rounded-2xl bg-white ring-1 ring-pine-950/10 transition-colors open:bg-pine-700/[0.06] open:ring-pine-700/15"
                    >
                      <summary className="flex cursor-pointer select-none items-center gap-3.5 px-5 py-4 [&::-webkit-details-marker]:hidden">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pine-700/10 text-pine-700">
                          <item.icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="flex-1 text-[15.5px] font-extrabold tracking-tight text-inkgreen sm:text-[16.5px]">
                          {item.t}
                        </span>
                        <ChevronDown className="h-5 w-5 shrink-0 text-pine-700 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="flex items-start gap-5 px-5 pb-5">
                        <p className="flex-1 text-sm leading-relaxed text-neutral-600">{item.d}</p>
                        {item.img && (
                          <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg ring-1 ring-pine-950/10 sm:block">
                            <Image src={item.img.src} alt={item.img.alt} fill sizes="9rem" className="object-cover" />
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>

                {/* l'appel au devis, coches de réassurance facultatives en regard */}
                <div className="mt-7 flex flex-col items-center gap-4 border-t border-neutral-200 pt-7 sm:flex-row sm:gap-6">
                  <Link href={blocks.solidite.cta.href} className={`${PISCINE_CTA} shrink-0 whitespace-nowrap`}>
                    {blocks.solidite.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  {blocks.solidite.cta.checks && blocks.solidite.cta.checks.length > 0 && (
                    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                      {blocks.solidite.cta.checks.map((c) => (
                        <li key={c} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
                          <Check className="h-4 w-4 text-pine-700" strokeWidth={3} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---- valeur : l'argumentaire valorisation, photo à gauche ---- */}
      {blocks?.valeur && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            {/* en-tête pleine largeur : le titre garde ses deux lignes à toutes les tailles */}
            <div className="max-w-3xl">
              <p className={`${PISCINE_KICKER} flex items-center gap-3`}>
                {blocks.valeur.kicker}
                <span className="h-px w-10 bg-pine-600/40" aria-hidden />
              </p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.valeur.h2}</h2>
              <p className="mt-4 text-pretty leading-relaxed text-neutral-600">{blocks.valeur.intro}</p>
            </div>

            {/* photo à gauche, cartes + CTA à droite, calés au centre l'un de l'autre.
                Mobile : titre → photo → cartes → CTA, dans l'ordre naturel. */}
            <div className="mt-9 grid gap-8 sm:mt-12 lg:grid-cols-[0.5fr_1fr] lg:items-center lg:gap-12">
              <Reveal>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 sm:aspect-[16/10] lg:aspect-[0.78]">
                  {blocks.valeur.photo.src ? (
                    <Image
                      src={blocks.valeur.photo.src}
                      alt={blocks.valeur.photo.alt}
                      fill
                      sizes="(min-width: 1152px) 24rem, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-2 grid place-items-center rounded-[1.25rem] border-2 border-dashed border-neutral-300 bg-mist">
                      <span className="flex flex-col items-center gap-2 px-8 text-center">
                        <ImageGlyph className="h-6 w-6 text-neutral-400" strokeWidth={1.6} />
                        <span className="text-[12px] font-semibold leading-snug text-neutral-500">
                          Votre photo de mezzanine arrive ici
                        </span>
                      </span>
                    </span>
                  )}
                </div>
              </Reveal>

              <div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {blocks.valeur.cards.map((card) => (
                    <div key={card.d} className="rounded-2xl bg-mist/70 p-4">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-600/10 text-pine-700">
                        <card.icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <p className="mt-3 text-[15px] font-extrabold leading-snug tracking-tight text-inkgreen">{card.t}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-600">{card.d}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Link href={blocks.valeur.cta.href} className={`${PISCINE_CTA} shrink-0 whitespace-nowrap`}>
                    {blocks.valeur.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <ul className="flex flex-wrap items-center gap-y-2">
                    {blocks.valeur.points.map((pt) => (
                      <li
                        key={pt.label}
                        className="flex items-center gap-2 border-l border-neutral-200 px-3.5 text-[13.5px] font-semibold text-neutral-700 first:border-0 first:pl-0"
                      >
                        <pt.icon className="h-4 w-4 shrink-0 text-pine-700" strokeWidth={2} />
                        {pt.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---- durabilité : l'argumentaire robustesse, photo et médaillon en regard ---- */}
      {blocks?.durable && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-pine-700/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pine-700">
                  <ShieldCheck className="h-4 w-4" />
                  {blocks.durable.badge}
                </span>
                <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-inkgreen sm:text-4xl">
                  {blocks.durable.h2}
                </h2>
                <p className="mt-5 max-w-lg text-pretty leading-relaxed text-neutral-600">{blocks.durable.intro}</p>

                <ul className="mt-4 divide-y divide-neutral-200">
                  {blocks.durable.items.map((item) => (
                    <li key={item.t} className="flex items-start gap-4 py-5">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-pine-700/10 text-pine-700">
                        <item.icon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="font-extrabold tracking-tight text-inkgreen">{item.t}</p>
                        <p className="mt-1 max-w-md text-[15px] leading-relaxed text-neutral-600">{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal>
                <div className="relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 lg:aspect-[1.02]">
                    <Image
                      src={blocks.durable.photo.src}
                      alt={blocks.durable.photo.alt}
                      fill
                      sizes="(min-width: 1152px) 36rem, 100vw"
                      className="object-cover"
                      style={blocks.durable.photo.position ? { objectPosition: blocks.durable.photo.position } : undefined}
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* ---- bloc facultatif : trois cartes illustrées (formes d'escalier…) ---- */}
      {blocks?.formes && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <h2 className={PISCINE_H2}>{blocks.formes.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.formes.intro}
              </p>
            </header>

            <ul className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
              {blocks.formes.cards.map((c, i) => (
                <li key={c.t}>
                  <Reveal delay={i * 80} className="h-full">
                    {/* texte en haut, schéma calé en bas : les trois cartes s'alignent */}
                    <article className="flex h-full flex-col rounded-[1.75rem] bg-mist p-6 sm:p-7">
                      <h3 className="text-lg font-extrabold tracking-tight text-inkgreen">{c.t}</h3>
                      <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600">{c.d}</p>
                      <p className="mt-3 flex items-start gap-2 text-sm font-bold leading-snug text-pine-700">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        {c.point}
                      </p>
                      <div className="mt-auto pt-6">
                        <Image
                          src={c.img}
                          alt={c.alt}
                          width={320}
                          height={240}
                          className="mx-auto h-auto w-full max-w-[15rem] md:max-w-[17rem]"
                        />
                      </div>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center sm:mt-12">
              <Link href={blocks.formes.cta.href} className={PISCINE_CTA}>
                {blocks.formes.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ---- fixations : sélecteur de pose, illustrations synchronisées ---- */}
      {blocks?.fixations && (
        <section className="border-b border-neutral-200 bg-mist/60 py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>{blocks.fixations.kicker}</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.fixations.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.fixations.intro}
              </p>
            </header>

            <FixationPoses poses={blocks.fixations.poses} panelSub={blocks.fixations.panelSub} />
          </Container>
        </section>
      )}

      {/* ---- vidéo : la pose en images, lecteur chargé au clic (position haute) ---- */}
      {blocks?.video && !blocks.video.beforeFaq && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>{blocks.video.kicker}</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.video.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.video.intro}
              </p>
            </header>
            <div className="mx-auto mt-8 max-w-4xl sm:mt-12">
              <YouTubeLite id={blocks.video.youtubeId} start={blocks.video.start} title={blocks.video.title} />
            </div>
          </Container>
        </section>
      )}

      {/* ---- réalisations : la preuve par l'exemple (position haute) ---- */}
      {blocks?.realisations && !blocks.realisations.beforeFaq && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                  {blocks.realisations.kicker}
                </p>
                <h2 className="mt-2 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                  {blocks.realisations.h2}
                </h2>
              </div>
              <Link
                href={blocks.realisations.cta.href}
                className="group inline-flex items-center gap-2 text-sm font-bold text-pine-700 transition-colors hover:text-pine-600"
              >
                {blocks.realisations.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blocks.realisations.items.map((r, i) => (
                <Reveal key={r.src} delay={i * 70}>
                  <figure className="group relative overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-pine-950/10">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={r.src}
                        alt={r.alt}
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-pine-950/45 px-4 py-2.5 backdrop-blur-md">
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-pine-200">
                        {r.tag}
                      </span>
                      <span className="block truncate text-sm font-bold text-white">{r.title}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---- bloc 2 : la norme — repères clairs, photo en regard ---- */}
      {blocks?.norme && (
        <section className="border-b border-neutral-200 bg-mist/60 py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>{blocks.norme.kicker}</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.norme.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.norme.intro}
              </p>
            </header>

            <div className="mt-8 grid gap-8 sm:mt-12 lg:grid-cols-[1fr_0.92fr] lg:items-stretch lg:gap-14">
              {/* la barrière en situation — avant la liste en mobile, en regard en desktop */}
              <Reveal className="lg:order-2">
                <div className="relative aspect-[3/2] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 lg:aspect-auto lg:h-full lg:min-h-[26rem]">
                  <Image
                    src={blocks.norme.photo.src}
                    alt={blocks.norme.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 32rem, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="lg:order-1">
                {/* les quatre points que regarde la norme — toujours visibles, sans cartes */}
                <ul className="divide-y divide-pine-900/10 border-y border-pine-900/10">
                  {blocks.norme.items.map((item) => (
                    <li key={item.t} className="flex items-start gap-3.5 py-4 sm:gap-4 sm:py-5">
                      <span className="grid h-9 w-9 shrink-0 sm:h-10 sm:w-10 place-items-center rounded-full bg-white text-pine-700 ring-1 ring-pine-900/10">
                        <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="text-[0.95rem] font-extrabold tracking-tight text-inkgreen">{item.t}</h3>
                        <p className="mt-1 text-pretty text-sm leading-relaxed text-neutral-600">{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-pretty text-[13px] leading-relaxed text-neutral-500">
                  {blocks.norme.note}
                </p>

                {/* même bouton que les deux autres blocs */}
                <div className="mt-6">
                  <Link href={blocks.norme.cta.href} className={PISCINE_CTA}>
                    {blocks.norme.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---- bloc 3 : matériaux & durabilité — la photo produit, puis l'essentiel ---- */}
      {blocks?.matiere && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div
              className={`grid gap-7 lg:items-stretch lg:gap-14 ${
                blocks.matiere.proof ? "lg:grid-cols-[0.72fr_1fr]" : "lg:grid-cols-[0.92fr_1fr]"
              }`}
            >
              {/* la photo produit — paysage court en mobile, portrait en desktop */}
              <Reveal>
                <div className="relative aspect-[2/1] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 lg:aspect-auto lg:h-full lg:min-h-[30rem]">
                  <Image
                    src={blocks.matiere.photoPaysage}
                    alt={blocks.matiere.alt}
                    fill
                    sizes="100vw"
                    className="object-cover lg:hidden"
                  />
                  <Image
                    src={blocks.matiere.photoPortrait}
                    alt={blocks.matiere.alt}
                    fill
                    sizes="(min-width: 1024px) 36rem, 1px"
                    className="hidden object-cover lg:block"
                  />
                </div>
              </Reveal>

              {/* min-w-0 : le bandeau défilant ne doit pas élargir la colonne */}
              <div className="min-w-0 lg:self-center">
                <p className={`flex items-center gap-4 ${PISCINE_KICKER}`}>
                  {blocks.matiere.kicker}
                  <span className="h-px flex-1 bg-pine-900/15" aria-hidden="true" />
                </p>
                <h2 className={`mt-3 ${PISCINE_H2}`}>{blocks.matiere.h2}</h2>
                <p className="mt-4 text-pretty leading-relaxed text-neutral-600">{blocks.matiere.text}</p>

                {blocks.matiere.proof ? (
                  <>
                    {/* variante « chiffre clé » : la charge de référence, puis ce qui fait la résistance.
                        Mobile : un seul fil — le chiffre entre deux filets, puis trois points
                        de même forme. À partir de sm : chiffre et verre feuilleté dans un encadré. */}
                    <div className="mt-6 sm:grid sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7 sm:rounded-2xl sm:bg-mist sm:p-6">
                      <p className="flex items-center gap-4 border-y border-pine-900/10 py-5 sm:block sm:border-0 sm:py-0">
                        <span className="block shrink-0 text-[2.5rem] font-extrabold leading-none tracking-tight text-pine-700 sm:text-5xl">
                          {blocks.matiere.proof.stat.value}
                        </span>
                        <span className="block text-[13px] leading-snug text-neutral-700 sm:mt-2 sm:max-w-[13rem] sm:text-sm">
                          {blocks.matiere.proof.stat.label}
                        </span>
                      </p>
                      <div className="flex items-start gap-3.5 border-b border-pine-900/10 py-4 sm:border-b-0 sm:border-l sm:py-0 sm:pl-7">
                        <blocks.matiere.proof.highlight.icon className="mt-0.5 h-7 w-7 shrink-0 text-pine-700" strokeWidth={1.5} />
                        <div>
                          <h3 className="text-[0.95rem] font-extrabold tracking-tight text-inkgreen">
                            {blocks.matiere.proof.highlight.t}
                          </h3>
                          <p className="mt-1 text-pretty text-[13px] leading-relaxed text-neutral-600">
                            {blocks.matiere.proof.highlight.d}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul className="sm:mt-5 sm:grid sm:grid-cols-2 sm:divide-x sm:divide-pine-900/10">
                      {blocks.matiere.proof.features.map((f) => (
                        <li
                          key={f.t}
                          className="flex items-start gap-3.5 border-b border-pine-900/10 py-4 last:border-b-0 sm:border-b-0 sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                        >
                          <f.icon className="mt-0.5 h-7 w-7 shrink-0 text-pine-700" strokeWidth={1.5} />
                          <div>
                            <h3 className="text-[0.95rem] font-extrabold tracking-tight text-inkgreen">{f.t}</h3>
                            <p className="mt-1 text-pretty text-[13px] leading-relaxed text-neutral-600">{f.d}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {blocks.matiere.note && (
                      <p className="mt-1 text-pretty text-[13px] leading-relaxed text-neutral-500 sm:mt-5">{blocks.matiere.note}</p>
                    )}

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <Link href={blocks.matiere.cta.href} className={`${PISCINE_CTA} shrink-0 whitespace-nowrap`}>
                        {blocks.matiere.cta.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <p className="text-pretty text-xs italic leading-snug text-neutral-500 sm:max-w-[15rem] sm:text-right">
                        {blocks.matiere.proof.footnote}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Les trois bénéfices, écrits UNE seule fois dans le HTML.
                        Mobile : ils défilent — la seconde moitié de la boucle est
                        décorative (libellés en attribut, rendus en CSS, donc
                        absents du texte de la page). Tablette : ligne fixe.
                        Desktop : liste filetée. */}
                    <div className="mt-6 overflow-hidden border-y border-pine-900/10 py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none] sm:[mask-image:none] lg:mt-7 lg:py-0">
                      <div className="flex w-max animate-marquee items-center motion-reduce:w-auto motion-reduce:animate-none sm:w-auto sm:animate-none lg:block">
                        <ul className="flex items-center motion-reduce:flex-col motion-reduce:items-start motion-reduce:gap-y-1.5 sm:flex-wrap sm:gap-y-1.5 lg:block lg:divide-y lg:divide-pine-900/10">
                          {(blocks.matiere.benefits ?? []).map((b) => (
                            <li
                              key={b}
                              className="flex items-center gap-3 whitespace-nowrap pr-7 text-[13px] font-semibold text-pine-800 lg:gap-3.5 lg:py-3.5 lg:pr-0 lg:text-[0.95rem] lg:text-inkgreen"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500" aria-hidden="true" />
                              {b}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center motion-reduce:hidden sm:hidden" aria-hidden="true">
                          {(blocks.matiere.benefits ?? []).map((b) => (
                            <span key={b} className="flex items-center gap-3 whitespace-nowrap pr-7 text-[13px] font-semibold text-pine-800">
                              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500" />
                              <span data-label={b} className="after:content-[attr(data-label)]" />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-pretty text-[13px] leading-relaxed text-neutral-500 lg:mt-5">
                      {blocks.matiere.note}
                    </p>

                    <div className="mt-7">
                      <Link href={blocks.matiere.cta.href} className={PISCINE_CTA}>
                        {blocks.matiere.cta.label}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---- piscine : nos réalisations ---- */}
      {entry.slug === "piscine" && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                  Sur le terrain
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                  Nos réalisations
                </h2>
              </div>
              <Link
                href="/generateur?usage=piscine"
                className="group inline-flex items-center gap-2 text-sm font-bold text-pine-700 transition-colors hover:text-pine-600"
              >
                Estimer la mienne
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {REALISATIONS_PISCINE.map((r, i) => (
                <Reveal key={r.src} delay={i * 70}>
                  <figure className="group relative overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-pine-950/10">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={r.src}
                        alt={r.alt}
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-pine-950/45 px-4 py-2.5 backdrop-blur-md">
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-pine-200">
                        {r.tag}
                      </span>
                      <span className="block truncate text-sm font-bold text-white">{r.title}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* bénéfices — remplacés sur piscine par les blocs norme + réalisations */}
      {!blocks && (
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
      )}

      {/* technique — idem : retiré sur piscine */}
      {!blocks && (
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
      )}

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

      {/* ---- vidéo : variante placée juste avant la FAQ ---- */}
      {blocks?.video?.beforeFaq && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>{blocks.video.kicker}</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>{blocks.video.h2}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                {blocks.video.intro}
              </p>
            </header>
            <div className="mx-auto mt-8 max-w-4xl sm:mt-12">
              <YouTubeLite id={blocks.video.youtubeId} start={blocks.video.start} title={blocks.video.title} />
            </div>
          </Container>
        </section>
      )}

      {/* ---- réalisations : variante placée juste avant la FAQ ---- */}
      {blocks?.realisations?.beforeFaq && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                  {blocks.realisations.kicker}
                </p>
                <h2 className="mt-2 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                  {blocks.realisations.h2}
                </h2>
              </div>
              <Link
                href={blocks.realisations.cta.href}
                className="group inline-flex items-center gap-2 text-sm font-bold text-pine-700 transition-colors hover:text-pine-600"
              >
                {blocks.realisations.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blocks.realisations.items.map((r, i) => (
                <Reveal key={r.src} delay={i * 70}>
                  <figure className="group relative overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-pine-950/10">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={r.src}
                        alt={r.alt}
                        fill
                        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-pine-950/45 px-4 py-2.5 backdrop-blur-md">
                      <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-pine-200">
                        {r.tag}
                      </span>
                      <span className="block truncate text-sm font-bold text-white">{r.title}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      <section className={`py-16 sm:py-24 ${kits.length > 0 ? "border-t border-neutral-200 bg-mist" : ""}`}>
        <Container>
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
            {blocks?.faqTitle ?? "Questions fréquentes"}
          </h2>
          <div className="mt-8 max-w-3xl">
            <FaqAccordion faq={entry.faq} />
          </div>
        </Container>
      </section>

      {/* CTA final */}
      <section className="pb-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-14 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
            <div className="relative mx-auto max-w-2xl">
              {/* text-white explicite : la règle de base des titres (vert foncé)
                  l'emportait sur la couleur héritée du panneau */}
              <h2 className="text-balance text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl">
                Votre {entry.title.toLowerCase()}, estimé{/^barrière/i.test(entry.title) ? "e" : ""} en 1 minute.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-pine-100/75">
                Estimation immédiate, devis détaillé sous 24h
                <br />
                gratuit et sans engagement.
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
