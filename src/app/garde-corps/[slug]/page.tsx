import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Ban, Check, ChevronDown, ClipboardList, DoorOpen, Lock, Ruler, Wrench } from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
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

/* Bloc piscine : les exigences NF P90-306, en cards déroulantes. */
const NORME_PISCINE: { icon: typeof Ruler; t: string; d: string }[] = [
  {
    icon: Ruler,
    t: "Hauteur 1m10",
    d: "La norme exige 1,10 m minimum entre deux points d’appui : nos panneaux sont façonnés à cette hauteur, au millimètre près.",
  },
  {
    icon: DoorOpen,
    t: "Portillon en verre",
    d: "Un portillon assorti à la barrière, à fermeture et verrouillage automatiques : l’accès ne reste jamais ouvert derrière vous.",
  },
  {
    icon: Lock,
    t: "Accès sécurisé",
    d: "Le déverrouillage demande une double action, pensée pour résister aux manipulations d’un enfant de moins de 5 ans.",
  },
  {
    icon: Ban,
    t: "Aucun point d’appui pour escalader",
    d: "Le verre feuilleté lisse n’offre ni prise ni marche : impossible d’escalader la barrière, contrairement aux clôtures à barreaux.",
  },
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
                Votre {entry.title.toLowerCase()}, chiffré{/^barrière/i.test(entry.title) ? "e" : ""} en 1 minute.
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-5xl">
              <Configurator lock={{ usage: usageLock }} source={`configurateur-${entry.slug}`} />
            </div>
          </Container>
        </section>
      )}

      {/* ---- piscine : transparence & design, comparateur avant/après ---- */}
      {entry.slug === "piscine" && (
        <section className="border-b border-neutral-200 bg-white py-16 sm:py-24">
          <Container>
            <header className="mx-auto max-w-2xl text-center lg:max-w-5xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
                Transparence &amp; design
              </p>
              <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Sécurisez votre piscine sans gâcher la vue
              </h2>
              {/* desktop : deux lignes équilibrées, sur la largeur du comparateur */}
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-neutral-600 lg:max-w-none lg:text-balance">
                Protéger les abords de votre bassin ne signifie pas renoncer à son esthétique. Avec une
                barrière de piscine en verre, profitez d&rsquo;une protection discrète qui préserve la vue
                sur l&rsquo;eau et s&rsquo;intègre naturellement à votre terrasse ou à votre jardin.
              </p>
            </header>

            {/* le comparateur, élément dominant — glissez la poignée */}
            <BeforeAfterSlider
              className="mt-10"
              before={{
                src: "/comparateur-piscine-avant.webp",
                alt: "Piscine sans barrière de protection, vue depuis la terrasse",
              }}
              after={{
                src: "/comparateur-piscine-apres.webp",
                alt: "La même piscine sécurisée par une barrière de piscine en verre, prise du même angle",
              }}
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-inkgreen">
                  Une barrière de piscine en verre qui se fait oublier
                </h3>
                <p className="mt-3 leading-relaxed text-neutral-600">
                  Contrairement aux clôtures traditionnelles, une barrière de piscine en verre préserve la
                  perspective sur votre bassin et les espaces extérieurs. Ses panneaux forment une
                  protection de piscine en verre visuellement légère, idéale pour sécuriser une piscine
                  tout en conservant l&rsquo;harmonie de votre aménagement.
                </p>
                <Link
                  href="#estimation"
                  className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-pine-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pine-900/20 transition-all hover:-translate-y-0.5 hover:bg-pine-600"
                >
                  Configurer ma barrière de piscine
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <ul className="space-y-5">
                {[
                  ["Une vue dégagée sur votre piscine", "Profitez d’une séparation transparente qui préserve la perspective sur le bassin."],
                  ["Une intégration élégante à votre extérieur", "Le verre s’associe naturellement aux terrasses contemporaines comme aux jardins plus traditionnels."],
                  ["Une solution adaptée à votre projet", "Dimensions, implantation et systèmes de fixation sont étudiés en fonction de votre piscine et de ses abords."],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-700 text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span>
                      <span className="block text-[0.95rem] font-extrabold text-inkgreen">{t}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-neutral-600">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* ---- piscine : la conformité NF P90-306, en texte + image ---- */}
      {entry.slug === "piscine" && (
        <section className="border-b border-neutral-200 bg-mist/60 py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Barrière de piscine en verre conforme{" "}
                <span className="whitespace-nowrap text-pine-600">NF P90-306</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-neutral-600">
                Notre garde-corps en verre est conçu pour répondre à la norme NF P90-306 visant à
                sécuriser votre piscine.
              </p>
              <Link
                href="/generateur?usage=piscine"
                className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-amber-500 py-3 pl-7 pr-3 text-sm font-bold text-pine-950 shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-600"
              >
                Obtenir mon devis
                <span className="grid h-8 w-8 place-items-center rounded-full bg-pine-950 text-amber-500 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <div className="mt-12 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
              {/* exigences de la norme — cards déroulantes, une seule ouverte
                  à la fois (name natif) : l'image d'en face ne bouge pas */}
              <div className="space-y-3.5">
                {NORME_PISCINE.map((item, i) => (
                  <details
                    key={item.t}
                    name="norme-piscine"
                    open={i === 0}
                    className="group rounded-2xl border border-neutral-200 bg-white shadow-card transition-colors open:border-pine-300"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700">
                          <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        </span>
                        <span className="text-[0.95rem] font-extrabold text-inkgreen">{item.t}</span>
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600 sm:pl-[4.65rem]">
                      {item.d}
                    </p>
                  </details>
                ))}
              </div>

              {/* la barrière en situation */}
              <Reveal delay={120}>
                <div className="relative">
                  <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-pine-200/50 via-transparent to-amber-500/10" />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10">
                    <Image
                      src="/barriere-piscine-nf.webp"
                      alt="Barrière de piscine en verre sur pinces inox avec portillon, conforme NF P90-306"
                      fill
                      sizes="(min-width: 1024px) 40rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </Reveal>
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
