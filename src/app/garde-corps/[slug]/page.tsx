import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check, ClipboardList, Wrench } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Configurator } from "@/components/Configurator";
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
    alt: "Balcon avec garde-corps en verre, vue dégagée",
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
    title: entry.metaTitle,
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

            <div className="mt-6 text-center sm:mt-12">
              <Link href={blocks.vue.cta.href} className={PISCINE_CTA}>
                {blocks.vue.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
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

      {/* ---- bloc 2 : la norme — repères clairs, photo en regard ---- */}
      {blocks && (
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
      {blocks && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div className="grid gap-7 lg:grid-cols-[0.92fr_1fr] lg:items-stretch lg:gap-14">
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

                {/* Les trois bénéfices, écrits UNE seule fois dans le HTML.
                    Mobile : ils défilent — la seconde moitié de la boucle est
                    décorative (libellés en attribut, rendus en CSS, donc
                    absents du texte de la page). Tablette : ligne fixe.
                    Desktop : liste filetée. */}
                <div className="mt-6 overflow-hidden border-y border-pine-900/10 py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none] sm:[mask-image:none] lg:mt-7 lg:py-0">
                  <div className="flex w-max animate-marquee items-center motion-reduce:w-auto motion-reduce:animate-none sm:w-auto sm:animate-none lg:block">
                    <ul className="flex items-center motion-reduce:flex-col motion-reduce:items-start motion-reduce:gap-y-1.5 sm:flex-wrap sm:gap-y-1.5 lg:block lg:divide-y lg:divide-pine-900/10">
                      {blocks.matiere.benefits.map((b) => (
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
                      {blocks.matiere.benefits.map((b) => (
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

      {/* Fin de page. Pages à blocs dédiés : directement l'appel au devis (les
          liens par usage sont déjà dans le footer). Autres pages : liens
          « À explorer aussi », puis l'appel au devis. */}
      {!blocks && (
      <section className="border-t border-neutral-200 py-16 sm:py-20">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">À explorer aussi</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {related.filter(Boolean).map((r) => (
              <Link
                key={r.slug}
                href={catalogPath(r.slug)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
              >
                {r.title}
                <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-pine-600" />
              </Link>
            ))}
          </div>
        </Container>
      </section>
      )}

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
