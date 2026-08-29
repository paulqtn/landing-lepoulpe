import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  HandCoins,
  Phone,
  Ruler,
  Scale,
  ShieldCheck,
  Star,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import { AdvantagesBar } from "@/components/AdvantagesBar";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Configurator } from "@/components/Configurator";
import { HeroGallery, type HeroSlide } from "@/components/HeroGallery";
import { GoogleG, MaterialScene, UsageGlyph } from "@/components/Illustrations";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { materials, usages } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import { products } from "@/lib/products";
import { phoneHref, site } from "@/lib/site";

/** Réalisations mises en avant dans le hero (défilement en fondu) — 100 % verre. */
const heroSlides: HeroSlide[] = [
  {
    src: "/Miroiterie-Degivry_Toulon-Var_Garde-corps-verre-Piscine.jpeg",
    alt: "Garde-corps en verre sans montants autour d’une piscine à débordement face à la mer",
    material: "Verre · sans montants",
    place: "Piscine à débordement",
  },
  {
    src: "/verre.jpeg",
    alt: "Garde-corps en verre sur pinces inox le long d’une promenade face à la mer",
    material: "Verre · pinces inox",
    place: "Front de mer",
  },
  {
    src: "/1713357460128.jpg",
    alt: "Garde-corps en verre sur pinces inox le long d’une terrasse bois de piscine",
    material: "Verre · pinces inox",
    place: "Plage de piscine",
  },
  {
    src: "/module-verre-invisible-sur-mesure-ht-1m15.jpg",
    alt: "Garde-corps en verre autoportant sur pinces autour d’un bassin",
    material: "Verre · autoportant",
    place: "Barrière de bassin",
  },
  {
    src: "/garde-corps-exterieur-terrasse-cables-acier-et-verre.jpg",
    alt: "Garde-corps en verre sur structure aluminium noire, balcon contemporain",
    material: "Verre & aluminium",
    place: "Balcon contemporain",
  },
];

export const metadata: Metadata = {
  title: `Garde-corps en verre sur-mesure & en kit, direct usine | ${site.name}`,
  description:
    "Garde-corps en verre à prix direct usine : tout verre sans poteaux, sur pinces ou verre-aluminium. Sur-mesure au millimètre ou en kit, conforme NF P01-012. Devis en 24h.",
  alternates: { canonical: "/" },
};

const steps = [
  { n: "01", title: "Configurez en 1 min", desc: "Projet, matériau, dimensions : le configurateur estime votre budget immédiatement." },
  { n: "02", title: "Devis détaillé en 24h", desc: "Un conseiller affine et vous envoie un devis poste par poste, gratuit et sans engagement." },
  { n: "03", title: "Fabrication d’usine", desc: "Sur-mesure au millimètre ou kit expédié : contrôle qualité avant chaque départ." },
  { n: "04", title: "Pose ou livraison", desc: "Posé par notre réseau, ou livré prêt à poser sous 10 jours, partout en France." },
];

/**
 * Cards des trois systèmes de garde-corps en verre : photo réelle,
 * positionnement, prix comparables et points forts propres à la fixation.
 */
const systemCards: {
  slug: string;
  sysKey: string;
  name: string;
  tagline: string;
  photo: string;
  alt: string;
  badge?: string;
  kitFrom: number;
  poseRange: [number, number];
  points: [string, string][];
  idealFor: string[];
}[] = [
  {
    slug: "garde-corps-verre-sur-rail",
    sysKey: "rail",
    name: "Verre sur rail",
    tagline: "Le plus \u00e9pur\u00e9",
    photo: "/verre-sur-rail.jpg",
    alt: "Garde-corps en verre sur rail aluminium au sol, terrasse bois avec retour d\u2019angle",
    badge: "Le plus demand\u00e9",
    kitFrom: 320,
    poseRange: [500, 800],
    points: [
      ["Aucun montant vertical", "une ligne de verre continue, rien d\u2019autre"],
      ["Rail alu au sol", "encastr\u00e9 ou en applique, angles et retours suivis"],
      ["Tremp\u00e9-feuillet\u00e9", "66.2 \u00e0 88.4 selon hauteur et port\u00e9e"],
    ],
    idealFor: ["Piscine", "Terrasse avec vue", "Balcon design"],
  },
  {
    slug: "garde-corps-verre-sur-pinces",
    sysKey: "pinces",
    name: "Verre sur pinces",
    tagline: "Le classique discret",
    photo: "/pinces-au-sol.jpg",
    alt: "Panneaux de verre sur pinces inox au sol autour d\u2019une piscine",
    badge: "Kit prix discount",
    kitFrom: 250,
    poseRange: [450, 650],
    points: [
      ["Pinces inox 316", "au sol, sur muret ou en fixation lat\u00e9rale"],
      ["Feuillet\u00e9 44.2 / 55.2", "en cas de choc, les \u00e9clats restent en place"],
      ["Pose accessible", "kits pr\u00e9-perc\u00e9s, r\u00e9glage fin \u00e0 l\u2019alignement"],
    ],
    idealFor: ["Muret", "Piscine", "Escalier"],
  },
  {
    slug: "garde-corps-verre-avec-spider",
    sysKey: "spider",
    name: "Verre avec spider",
    tagline: "L\u2019esprit architectural",
    photo: "/garde-corps-verre-fenetre-2.jpg",
    alt: "Garde-corps en verre fix\u00e9 par points en applique de fa\u00e7ade, fen\u00eatre d\u2019angle",
    kitFrom: 300,
    poseRange: [480, 750],
    points: [
      ["Rotules inox traversantes", "le verre semble suspendu devant la dalle"],
      ["Pose lat\u00e9rale", "en nez de dalle ou fa\u00e7ade \u2014 100 % de surface conserv\u00e9e"],
      ["Tremp\u00e9-feuillet\u00e9 perc\u00e9", "per\u00e7ages et fa\u00e7onnage r\u00e9alis\u00e9s en usine"],
    ],
    idealFor: ["Balcon", "Fa\u00e7ade", "Nez de dalle"],
  },
];

/** Mécanismes du prix discount — le « pourquoi c'est moins cher » du direct usine. */
const discountReasons: { icon: typeof HandCoins; title: string; desc: string }[] = [
  { icon: HandCoins, title: "Zéro intermédiaire", desc: "Du façonnage à votre chantier : aucune marge de grossiste ni de revendeur." },
  { icon: Warehouse, title: "Stocks & direct usine", desc: "Dimensions courantes en stock, sur-mesure lancé dès la commande." },
  { icon: Ruler, title: "Découpe incluse", desc: "Longueurs, hauteurs, angles et retours au millimètre — sans supplément caché." },
  { icon: Truck, title: "Livraison rapide", desc: "Expédition partout en France métropolitaine, sous 10 jours depuis nos stocks." },
];

/** Points du bloc sur-mesure — la découpe d'usine, argument clé du site. */
const surMesurePoints: [string, string][] = [
  ["Longueurs & hauteurs au millimètre", "chaque travée façonnée à la cote exacte"],
  ["Angles au degré près", "escaliers et pentes suivis parfaitement"],
  ["Retours & découpes spéciales", "angles rentrants, biseaux, décalages"],
  ["Alignement soigné", "travées calepinées pour une ligne continue"],
];

/** Avantages du bandeau défilant — volontairement distincts des arguments du hero. */
const advantages = [
  "Zéro intermédiaire",
  "Verre feuilleté sécurisé",
  "Livré partout en France en 10 jours",
  "Découpe sur mesure : longueurs, hauteurs, angles",
  "Pinces & visserie inox 316",
  "Kits pré-percés, prêts à poser",
  "Conseil technique par nos experts",
];

export default function Home() {
  return (
    <main>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-mist to-pine-50/50">
        {/* fond en couches */}
        <div className="pointer-events-none absolute inset-0">
          {/* halo ambré derrière le visuel : chaleur et profondeur */}
          <div className="absolute -right-20 -top-24 h-[34rem] w-[34rem] rounded-full bg-amber-500/[0.18] blur-[110px]" />
          <div className="absolute -left-32 top-10 h-[30rem] w-[30rem] rounded-full bg-pine-200/50 blur-[100px]" />
          <div className="absolute bottom-[-6rem] left-1/3 h-72 w-[28rem] rounded-full bg-amber-500/[0.07] blur-[90px]" />
          <div className="absolute inset-0 bg-lightgrid [mask-image:radial-gradient(ellipse_75%_65%_at_45%_20%,#000_35%,transparent_80%)]" />
        </div>

        <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:py-24">
          {/* copy */}
          <div className="animate-fade-up">
            <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
              <span className="h-[3px] w-10 rounded-full bg-amber-500" />
              Spécialiste garde-corps
            </p>
            <h1 className="mt-5 text-balance text-[2.7rem] font-extrabold leading-[1.0] tracking-tight text-inkgreen sm:text-6xl">
              Garde-corps
              <br />
              <em className="italic text-pine-600">en verre.</em>
              <span className="ml-3 inline-flex -rotate-2 items-center whitespace-nowrap rounded-lg bg-amber-500 px-3 py-1.5 align-middle font-mono text-[11px] font-bold not-italic uppercase tracking-[0.14em] text-pine-950 shadow-md sm:ml-4 sm:-translate-y-1 sm:text-xs">
                Direct usine
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600">
              <strong className="font-semibold text-inkgreen">Sur-mesure au millimètre ou en kit</strong>,
              à des prix ultra compétitifs.
            </p>

            {/* CTA — élément dominant du hero */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/devis"
                className="group inline-flex h-16 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-pine-700 px-8 text-base font-bold text-white shadow-xl shadow-pine-900/25 transition-all hover:-translate-y-0.5 hover:bg-pine-600 hover:shadow-2xl hover:shadow-pine-900/30"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="h-4 w-4" />
                </span>
                Estimer un tarif
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={phoneHref}
                className="group inline-flex h-16 items-center justify-center gap-3 whitespace-nowrap rounded-full border-2 border-pine-700/15 bg-white pl-3 pr-6 transition-all hover:-translate-y-0.5 hover:border-pine-700/30"
              >
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-700 text-white">
                  <Phone className="h-4 w-4 group-hover:animate-wiggle" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-green-700">
                    Conseiller disponible
                  </span>
                  <span className="block text-[0.95rem] font-bold tracking-wide text-inkgreen">
                    {site.phone}
                  </span>
                </span>
              </a>
            </div>

            {/* ligne de confiance — visible mais secondaire */}
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-neutral-200/80 pt-6">
              <span className="flex items-center gap-2.5">
                <GoogleG className="h-5 w-5 shrink-0" />
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-inkgreen">5,0</span>
                </span>
                <span className="text-sm text-neutral-500">sur Google</span>
              </span>

              <span className="hidden h-5 w-px bg-neutral-200 sm:block" />

              <span className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-pine-600" />
                <span className="text-sm text-neutral-600">
                  <strong className="font-bold text-inkgreen">Conformes NF P01-012</strong> —
                  certifiées à la fabrication
                </span>
              </span>
            </div>
          </div>

          {/* nos réalisations */}
          <div className="animate-fade-up [animation-delay:150ms]">
            <HeroGallery slides={heroSlides} />
          </div>
        </Container>
      </section>

      {/* ================== BANDEAU AVANTAGES ================== */}
      <AdvantagesBar items={advantages} />

      {/* ================== CONFIGURATEUR EXPRESS ================== */}
      <section className="border-b border-neutral-200 bg-mist py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Devis express</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
              Un seul produit&nbsp;: le vôtre. Configurez-le étape par étape.
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-neutral-500">
              Une question à la fois — votre projet, le système, les dimensions — et
              le devis détaillé arrive sous 24h.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-5xl">
            <Configurator />
          </div>
        </Container>
      </section>

      {/* ==================== SYSTÈMES (gamme verre) ==================== */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Comparer les systèmes</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Trois systèmes, un même verre sécurisé.
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-neutral-500">
                <strong className="font-semibold text-inkgreen">À chaque projet son système de fixation</strong> —
                comparez les prix et les points forts, et choisissez en un coup d’œil.
              </p>
            </div>
            <Link href="/garde-corps" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Tout le catalogue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {systemCards.map((m, i) => (
              <Reveal key={m.name} delay={i * 80}>
                <Link
                  href={`/produits/${m.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-pine-300 hover:shadow-elevated"
                >
                  {/* photo + identité */}
                  <div className="relative h-60 overflow-hidden sm:h-64">
                    <Image
                      src={m.photo}
                      alt={m.alt}
                      fill
                      sizes="(min-width: 1024px) 24rem, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-pine-950/90 via-pine-950/35 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500 shadow-sm backdrop-blur">
                      0{i + 1}
                    </span>
                    <div className="absolute inset-x-5 bottom-4">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-100/90">
                        {m.tagline}
                      </p>
                      <h3 className="mt-1 text-2xl font-extrabold leading-none text-white">{m.name}</h3>
                    </div>
                  </div>

                  {/* prix — mêmes repères sur les 3 cards pour comparer */}
                  <div className="flex min-h-[6.25rem] items-center justify-between gap-4 border-b border-neutral-100 bg-mist/50 px-6 py-4">
                    <p>
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-neutral-400">dès</span>
                        <span className="text-[1.75rem] font-extrabold tabular-nums tracking-tight text-inkgreen">
                          {m.kitFrom}&nbsp;€
                        </span>
                        <span className="text-sm font-bold text-neutral-400">/ml</span>
                      </span>
                      {m.badge && (
                        <span className="mt-1.5 flex w-fit items-center rounded-full bg-amber-500 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-pine-950 shadow-sm">
                          {m.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-right">
                      <span className="block text-base font-extrabold tabular-nums text-neutral-600">
                        {m.poseRange[0]} – {m.poseRange[1]}&nbsp;€
                        <span className="text-xs font-semibold text-neutral-400">/ml</span>
                      </span>
                      <span className="block text-[11px] font-medium text-neutral-500">avec pose incluse</span>
                    </p>
                  </div>

                  {/* points forts propres au système */}
                  <ul className="flex-1 space-y-3 px-6 py-5">
                    {m.points.map(([b, d]) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm leading-snug">
                        <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700 ring-1 ring-pine-100/70">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-neutral-500">
                          <strong className="font-bold text-inkgreen">{b}</strong> — {d}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* usages types */}
                  <div className="px-6 pb-5">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      Idéal pour
                    </p>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {m.idealFor.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-neutral-200/80"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex items-center justify-between border-t border-neutral-100 px-6 py-4">
                    <span className="text-sm font-bold text-pine-700">Voir la fiche produit</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-pine-50 text-pine-700 transition-colors duration-300 group-hover:bg-pine-700 group-hover:text-white">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* aide au choix */}
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-mist/60 px-6 py-5 sm:flex-row sm:items-center">
              <p className="flex items-center gap-3.5 text-sm leading-snug text-neutral-600">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-pine-700 shadow-card ring-1 ring-neutral-200/60">
                  <Scale className="h-5 w-5" />
                </span>
                <span>
                  <strong className="font-bold text-inkgreen">Quel verre choisir&nbsp;?</strong> Feuilleté, trempé,
                  44.2 ou 55.2 — notre guide décortique épaisseurs, normes et usages.
                </span>
              </p>
              <Link
                href="/guides/quel-verre-garde-corps"
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-pine-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-pine-900/15 transition-all hover:-translate-y-0.5 hover:bg-pine-600"
              >
                Lire le guide du verre
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ==================== PRIX DISCOUNT (direct usine) ==================== */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-14 text-white shadow-panel sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pine-500/20 blur-3xl" />

              <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500">Direct usine</p>
                  <h2 className="mt-2 text-balance text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl">
                    Le prix discount, sans rogner sur le verre.
                  </h2>
                  <p className="mt-4 max-w-lg leading-relaxed text-pine-100/75">
                    Le même verre feuilleté certifié, sans les marges d’intermédiaires :
                    voilà tout le secret. Fabrication et stocks en direct, découpe incluse.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {discountReasons.map((r) => (
                      <div key={r.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
                          <r.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-3 text-sm font-extrabold text-white">{r.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-pine-100/70">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* circuit court vs circuit classique */}
                <div className="rounded-2xl border border-white/10 bg-black/25 p-6 sm:p-7">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-300">
                    Circuit classique
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {["Usine", "Grossiste", "Revendeur", "Vous"].map((step, i) => (
                      <span key={step} className="flex items-center gap-2">
                        <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-pine-100/70">
                          {step}
                        </span>
                        {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-pine-100/40" />}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs text-pine-100/50">3 marges empilées avant votre devis.</p>

                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                    Chez nous
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-pine-950 shadow-md shadow-amber-500/20">
                      Usine
                    </span>
                    <ArrowRight className="h-4 w-4 text-amber-500" />
                    <span className="rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-pine-950 shadow-md shadow-amber-500/20">
                      Vous
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-pine-100/70">Un seul prix : celui de la fabrication.</p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/devis"
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-white py-3.5 pl-6 pr-5 text-sm font-bold text-pine-800 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5"
                    >
                      Estimer mon garde-corps
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href={phoneHref}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-6 py-3.5 text-sm font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/15"
                    >
                      <Phone className="h-4 w-4" />
                      {site.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      {/* ========================== USAGES =========================== */}
      <section className="border-y border-neutral-200 bg-mist py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Par usage</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Un garde-corps en verre pour chaque configuration.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              Chaque situation a ses règles et ses bonnes solutions — on les détaille page par page.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usages.map((u, i) => (
              <Reveal key={u.slug} delay={i * 50}>
                <Link
                  href={`/garde-corps/${u.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-pine-50 text-pine-700 ring-1 ring-pine-100/60 transition-colors duration-300 group-hover:bg-pine-700 group-hover:text-white">
                      <UsageGlyph usage={u.slug} className="h-6 w-6" />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pine-600" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">
                    {u.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{u.benefits[0].desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ======================= SUR-MESURE USINE ======================= */}
      <section className="py-20 sm:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Atelier de découpe</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
              Le sur-mesure au millimètre, vraiment.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-neutral-600">
              Chaque panneau est façonné à vos cotes en usine : envoyez vos mesures,
              le verre arrive prêt à poser, aligné d’un bout à l’autre.
            </p>

            <ul className="mt-7 space-y-4">
              {surMesurePoints.map(([b, d]) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-700 text-white shadow-sm">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-[0.95rem] leading-snug text-neutral-500">
                    <strong className="font-bold text-inkgreen">{b}</strong> — {d}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-neutral-200/80 bg-mist/60 p-5 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm leading-relaxed text-neutral-600">
                <strong className="font-bold text-inkgreen">Un doute sur la prise de cotes&nbsp;?</strong>{" "}
                Nos conseillers vérifient chaque dimension avec vous avant de lancer la fabrication.
              </p>
              <a
                href={phoneHref}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-inkgreen shadow-card transition-all hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4 text-pine-600" />
                {site.phone}
              </a>
            </div>
          </div>

          {/* photo annotée : les cotes prises en charge */}
          <Reveal delay={120}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-pine-200/50 via-transparent to-amber-500/10" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10">
                <Image
                  src="/rail-encastre.jpg"
                  alt="Garde-corps tout verre sur rail encastré, terrasse face à la mer"
                  fill
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-pine-950/70 to-transparent" />
                {/* cotes flottantes */}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-inkgreen shadow-sm backdrop-blur">
                  H · 1 000 mm
                </span>
                <span className="absolute right-4 top-1/3 rounded-full bg-white/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-inkgreen shadow-sm backdrop-blur">
                  ∠ au degré près
                </span>
                <span className="absolute bottom-4 left-4 rounded-full bg-amber-500 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pine-950 shadow-md">
                  L · au millimètre
                </span>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ====================== PRODUITS PHARES ====================== */}
      <section className="border-t border-neutral-200 bg-mist py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Kits en direct usine</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Les kits verre les plus demandés.
              </h2>
            </div>
            <Link href="/produits" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Toute la gamme
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.filter((p) => p.material === "verre").slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/produits/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-elevated"
                >
                  <div className="relative h-24 border-b border-neutral-100">
                    <MaterialScene material={p.material} className="h-full" />
                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-pine-950 shadow-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      {p.material}
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug text-inkgreen transition-colors group-hover:text-pine-700">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">
                      {p.specs[0]} · {p.specs[1]}
                    </p>
                    <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-3.5">
                      <span className="text-lg font-extrabold text-pine-700">
                        dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-pine-700">
                        Voir
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== ÉTAPES =========================== */}
      <section className="py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Comment ça marche</p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
            De l’estimation à la pose, en 4 étapes.
          </h2>

          <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-11 hidden border-t-2 border-dashed border-pine-200 lg:block" />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <div className="relative h-full rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                  <span className="relative z-10 grid h-11 w-11 place-items-center rounded-xl bg-pine-700 font-mono text-sm font-bold text-white shadow-md shadow-pine-900/20">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-inkgreen">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== GUIDES =========================== */}
      <section className="border-y border-neutral-200 bg-mist py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Guides &amp; conseils</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Bien choisir, en connaissance de cause.
              </h2>
            </div>
            <Link href="/guides" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Tous les guides
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.slice(0, 3).map((g, i) => (
              <Reveal key={g.slug} delay={i * 70}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-elevated"
                >
                  <span className="absolute inset-x-0 top-0 h-1 -translate-y-full bg-pine-600 transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="flex items-center justify-between">
                    <span className="rounded-full bg-pine-50 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-pine-700">
                      Guide expert
                    </span>
                    <span className="font-mono text-xs text-neutral-300">0{i + 1}</span>
                  </span>
                  <h3 className="mt-3 flex-1 text-lg font-extrabold leading-snug text-inkgreen transition-colors group-hover:text-pine-700">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{g.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                    Lire le guide
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================== FAQ ============================ */}
      <section className="py-20 sm:py-28">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: materials[0].faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Questions fréquentes</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
              Le garde-corps en verre, en 4 réponses.
            </h2>
            <div className="mt-8">
              <FaqAccordion faq={materials[0].faq} />
            </div>
          </div>

          <div className="lg:pt-24">
            <div className="rounded-2xl border border-neutral-200/80 bg-mist/60 p-6">
              <p className="text-base font-extrabold text-inkgreen">Une question plus précise&nbsp;?</p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                Normes, épaisseur de verre, fixation sur votre support : un conseiller
                vous répond directement.
              </p>
              <div className="mt-5 space-y-2.5">
                <a
                  href={phoneHref}
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-inkgreen shadow-card transition-all hover:-translate-y-0.5"
                >
                  <Phone className="h-4 w-4 text-pine-600" />
                  {site.phone}
                </a>
                <Link
                  href="/guides"
                  className="flex items-center justify-center gap-2 rounded-full border border-pine-700/15 bg-transparent px-5 py-3 text-sm font-bold text-pine-700 transition-all hover:border-pine-700/30"
                >
                  Parcourir tous les guides
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================= CTA FINAL ========================= */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-16 text-white shadow-panel sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-pine-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-200 ring-1 ring-white/10">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    Dernière étape
                  </span>
                  <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.03] text-white sm:text-5xl">
                    Votre devis personnalisé,
                    <br />
                    <em className="italic text-pine-200">en 24 h chrono.</em>
                  </h2>
                  <p className="mt-5 max-w-lg leading-relaxed text-pine-100/75">
                    Configurez votre projet en ligne en 1 minute. Notre équipe vous
                    renvoie un devis détaillé, sans engagement.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
                    {["Devis sous 24h", "Garantie conformité", "Livraison France"].map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm font-semibold text-pine-100">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-green-500/20 text-green-400">
                          <Check className="h-3 w-3" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/devis"
                      className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-white py-4 pl-7 pr-6 text-base font-bold text-pine-800 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5"
                    >
                      <ClipboardList className="h-5 w-5 shrink-0" />
                      Estimer mon projet en 1 min
                      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href={phoneHref}
                      className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-white/10 px-7 py-4 text-base font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/15"
                    >
                      <Phone className="h-5 w-5 shrink-0" />
                      ou {site.phone}
                    </a>
                  </div>
                </div>

                {/* mini-devis empilé */}
                <div className="relative hidden lg:block">
                  <div className="absolute inset-x-6 -bottom-4 top-8 rotate-3 rounded-2xl bg-white/10" />
                  <div className="relative rotate-2 overflow-hidden rounded-2xl bg-white shadow-panel">
                    <div className="group relative h-20 border-b border-neutral-100">
                      <MaterialScene material="verre" className="h-full" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Votre devis</p>
                        <span className="rounded-full bg-pine-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-pine-700">Validé</span>
                      </div>
                      <div className="mt-4 space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-inkgreen">Garde-corps tout verre</span>
                          <span className="font-bold tabular-nums text-inkgreen">1 950 €</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>5 ml · verre feuilleté 66.2</span>
                          <span>TVA 10 %</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-pine-900 px-4 py-3">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-pine-200">Total TTC</span>
                        <span className="text-xl font-extrabold tabular-nums text-white">2 145 €</span>
                      </div>
                    </div>
                  </div>
                  <span className="absolute -left-4 bottom-6 z-10 inline-flex -rotate-3 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950 shadow-lg">
                    <Zap className="h-3 w-3" />
                    Devis immédiat
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
