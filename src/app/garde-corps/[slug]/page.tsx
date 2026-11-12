import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Ban, Check, ClipboardList, DoorOpen, Lock, Ruler, Wrench } from "lucide-react";
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

/* Les trois blocs piscine sous le générateur partagent ces recettes :
   même surtitre, même H2, même bouton — seule la composition change. */
const PISCINE_KICKER = "font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700";
const PISCINE_H2 = "text-balance text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-inkgreen sm:text-4xl";
const PISCINE_CTA =
  "group flex items-center justify-center gap-2.5 rounded-full bg-pine-700 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-pine-900/20 transition-all hover:-translate-y-0.5 hover:bg-pine-600 sm:inline-flex";

/* Bloc piscine 1 — transparence : trois points distincts, sans pictos. */
const VUE_PISCINE: { t: string; d: string }[] = [
  {
    t: "La vue reste entière",
    d: "Depuis la maison comme depuis la terrasse, le regard porte jusqu’au bassin, sans barreaux ni grillage.",
  },
  {
    t: "Le décor n’est pas coupé",
    d: "Une barrière en verre pour piscine s’efface devant la pierre, le bois ou la végétation, dans un extérieur contemporain comme traditionnel.",
  },
  {
    t: "Un tracé à vos mesures",
    d: "Longueurs, angles et type de fixation sont définis selon votre bassin et ses abords.",
  },
];

/* Bloc piscine 2 — NF P90-306 : ce que la norme regarde, formulé sans
   promesse de conformité (elle s'apprécie sur l'installation complète). */
const NORME_PISCINE: { icon: typeof Ruler; t: string; d: string }[] = [
  {
    icon: Ruler,
    t: "Une hauteur de 1,10 m minimum",
    d: "La hauteur de protection est évaluée depuis chaque point d’appui accessible : sol, marche ou muret à proximité de la piscine.",
  },
  {
    icon: DoorOpen,
    t: "Un portillon intégré et sécurisé",
    d: "Entièrement vitré, le portillon s’intègre harmonieusement à la barrière. Il doit rester fermé et verrouillé après chaque passage.",
  },
  {
    icon: Lock,
    t: "Un verrouillage adapté à la sécurité des enfants",
    d: "Le système de fermeture doit résister aux tentatives d’ouverture des enfants de moins de 5 ans, pour une protection renforcée.",
  },
  {
    icon: Ban,
    t: "Une conception limitant l’escalade",
    d: "La surface lisse et continue du verre limite les prises. Aucun mobilier, jardinière ou autre point d’appui ne doit faciliter le franchissement.",
  },
];

/* Bloc piscine 3 — inox 316 : une ligne de bénéfices, rien de plus. */
const INOX_PISCINE = [
  "Résistance renforcée à la corrosion",
  "Adapté aux environnements piscine",
  "Finition discrète et élégante",
];

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

      {/* ---- piscine 1 : transparence & design — le visuel d'abord ---- */}
      {entry.slug === "piscine" && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>Transparence &amp; design</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>Sécurisez votre piscine sans gâcher la vue</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                Une barrière de piscine en verre protège les abords du bassin sans les cacher : l&rsquo;eau, la
                terrasse et le jardin restent visibles, comme avant.
              </p>
            </header>

            {/* le comparateur, élément dominant — bord à bord en mobile */}
            <BeforeAfterSlider
              className="-mx-5 mt-8 sm:mx-0 sm:mt-12"
              frameClassName="sm:rounded-[1.75rem] sm:shadow-panel sm:ring-1 sm:ring-pine-950/10"
              caption="Faites glisser pour comparer : la même piscine, avant et après."
              before={{
                src: "/comparateur-piscine-avant.webp",
                alt: "Piscine sans barrière de protection, vue depuis la terrasse",
              }}
              after={{
                src: "/comparateur-piscine-apres.webp",
                alt: "La même piscine entourée d’une barrière de piscine en verre, prise du même angle",
              }}
            />

            {/* contenu secondaire : trois lignes sobres, un filet pour seule déco */}
            <ul className="mt-10 grid sm:mt-14 sm:grid-cols-3 sm:gap-x-10">
              {VUE_PISCINE.map((v) => (
                <li key={v.t} className="border-t border-pine-900/10 py-4 sm:pb-0 sm:pt-5">
                  <p className="text-[0.95rem] font-extrabold tracking-tight text-inkgreen">{v.t}</p>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-neutral-600">{v.d}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-center sm:mt-12">
              <Link href="#estimation" className={PISCINE_CTA}>
                Configurer ma barrière de piscine
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ---- piscine 2 : norme NF P90-306 — repères clairs, photo en regard ---- */}
      {entry.slug === "piscine" && (
        <section className="border-b border-neutral-200 bg-mist/60 py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <p className={PISCINE_KICKER}>Sécurité &amp; réglementation</p>
              <h2 className={`mt-2 ${PISCINE_H2}`}>
                Barrière de piscine <br className="sm:hidden" />
                en verre et norme <span className="whitespace-nowrap text-pine-600">NF P90-306</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-neutral-600 lg:max-w-2xl">
                Toute piscine privée enterrée ou semi-enterrée doit être équipée d&rsquo;un dispositif de
                sécurité normalisé. Pour une barrière, la référence est la norme NF&nbsp;P90-306 : elle vise à
                empêcher un enfant de moins de 5 ans d&rsquo;accéder seul au bassin.
              </p>
            </header>

            <div className="mt-8 grid gap-8 sm:mt-12 lg:grid-cols-[1fr_0.92fr] lg:items-stretch lg:gap-14">
              {/* la barrière en situation — avant la liste en mobile, en regard en desktop */}
              <Reveal className="lg:order-2">
                <div className="relative aspect-[3/2] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 lg:aspect-auto lg:h-full lg:min-h-[26rem]">
                  <Image
                    src="/barriere-piscine-nf.webp"
                    alt="Barrière de piscine en verre sur pinces inox, avec portillon, autour d’un bassin"
                    fill
                    sizes="(min-width: 1024px) 32rem, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <div className="lg:order-1">
                {/* les quatre points que regarde la norme — toujours visibles, sans cartes */}
                <ul className="divide-y divide-pine-900/10 border-y border-pine-900/10">
                  {NORME_PISCINE.map((item) => (
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
                  La conformité s&rsquo;apprécie sur l&rsquo;installation complète (implantation, pose, portillon,
                  abords), pas sur les panneaux seuls. Nous faisons le point avec vous au moment du devis.
                </p>

                {/* même bouton que les deux autres blocs piscine */}
                <div className="mt-6">
                  <Link href="/generateur?usage=piscine" className={PISCINE_CTA}>
                    Obtenir mon devis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---- piscine 3 : matériaux & durabilité — la photo produit, puis l'essentiel ---- */}
      {entry.slug === "piscine" && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <div className="grid gap-7 lg:grid-cols-[0.92fr_1fr] lg:items-stretch lg:gap-14">
              {/* la pince au bord du bassin — paysage court en mobile, portrait en desktop */}
              <Reveal>
                <div className="relative aspect-[2/1] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10 lg:aspect-auto lg:h-full lg:min-h-[30rem]">
                  <Image
                    src="/inox-316-piscine-paysage.webp"
                    alt="Fixation d’une barrière de piscine en verre au bord du bassin, visserie en inox 316"
                    fill
                    sizes="100vw"
                    className="object-cover lg:hidden"
                  />
                  <Image
                    src="/inox-316-piscine-portrait.webp"
                    alt="Fixation d’une barrière de piscine en verre au bord du bassin, visserie en inox 316"
                    fill
                    sizes="(min-width: 1024px) 36rem, 1px"
                    className="hidden object-cover lg:block"
                  />
                </div>
              </Reveal>

              {/* min-w-0 : le bandeau défilant ne doit pas élargir la colonne */}
              <div className="min-w-0 lg:self-center">
                <p className={`flex items-center gap-4 ${PISCINE_KICKER}`}>
                  Matériaux &amp; durabilité
                  <span className="h-px flex-1 bg-pine-900/15" aria-hidden="true" />
                </p>
                <h2 className={`mt-3 ${PISCINE_H2}`}>
                  Une visserie <span className="whitespace-nowrap text-pine-600">inox 316</span>{" "}
                  <br className="hidden lg:block" />
                  pensée pour durer
                </h2>
                <p className="mt-4 text-pretty leading-relaxed text-neutral-600">
                  Nos barrières de piscine en verre intègrent une visserie en inox 316, reconnu pour sa
                  résistance renforcée à la corrosion. Un choix particulièrement adapté aux environnements
                  humides et aux abords des piscines, qui associe durabilité et finition soignée.
                </p>

                {/* Les trois bénéfices, écrits UNE seule fois dans le HTML.
                    Mobile : ils défilent — la seconde moitié de la boucle est
                    décorative (libellés en attribut, rendus en CSS, donc
                    absents du texte de la page). Tablette : ligne fixe.
                    Desktop : liste filetée. */}
                <div className="mt-6 overflow-hidden border-y border-pine-900/10 py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none] sm:[mask-image:none] lg:mt-7 lg:py-0">
                  <div className="flex w-max animate-marquee items-center motion-reduce:w-auto motion-reduce:animate-none sm:w-auto sm:animate-none lg:block">
                    <ul className="flex items-center motion-reduce:flex-col motion-reduce:items-start motion-reduce:gap-y-1.5 sm:flex-wrap sm:gap-y-1.5 lg:block lg:divide-y lg:divide-pine-900/10">
                      {INOX_PISCINE.map((b) => (
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
                      {INOX_PISCINE.map((b) => (
                        <span key={b} className="flex items-center gap-3 whitespace-nowrap pr-7 text-[13px] font-semibold text-pine-800">
                          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500" />
                          <span data-label={b} className="after:content-[attr(data-label)]" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-pretty text-[13px] leading-relaxed text-neutral-500 lg:mt-5">
                  Comme tout inox, il n&rsquo;est pas inaltérable : un rinçage occasionnel à l&rsquo;eau claire
                  aide à préserver son aspect.
                </p>

                <div className="mt-7">
                  <Link href="/generateur?usage=piscine" className={PISCINE_CTA}>
                    Configurer ma barrière
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
      {entry.slug !== "piscine" && (
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
      {entry.slug !== "piscine" && (
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
            {entry.slug === "piscine"
              ? "Questions fréquentes sur les barrières de piscine en verre"
              : "Questions fréquentes"}
          </h2>
          <div className="mt-8 max-w-3xl">
            <FaqAccordion faq={entry.faq} />
          </div>
        </Container>
      </section>

      {/* Fin de page. Piscine : directement l'appel au devis (les liens par
          usage sont déjà dans le footer). Autres pages : liens « À explorer
          aussi », puis l'appel au devis. */}
      {entry.slug !== "piscine" && (
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
