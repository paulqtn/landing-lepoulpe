import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone, ShieldCheck, Star } from "lucide-react";
import { GoogleG } from "@/components/Illustrations";
import { Container } from "@/components/ui/Container";
import { phoneHref, site } from "@/lib/site";

/* ================================================================== */
/*  Hero des pages internes — même rendu que la homepage : photo en    */
/*  plein cadre, fondu blanc côté texte, copy à gauche.                */
/* ================================================================== */

export type PageHeroImage = {
  src: string;
  alt: string;
  /** Petit label de la pastille en verre dépoli : « Verre · pinces inox ». */
  label: string;
  /** Contexte : « Plage de piscine ». */
  title: string;
};

export function PageHero({
  kicker,
  title,
  intro,
  image,
  estimerHref = "/generateur",
  breadcrumb,
}: {
  kicker: string;
  title: string;
  intro: string;
  image: PageHeroImage;
  estimerHref?: string;
  breadcrumb?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
      {/* desktop : photo plein cadre + fondu blanc côté texte, comme la homepage */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white from-[24%] via-white/75 via-[46%] to-transparent to-[74%]" />
      </div>

      {/* mobile : bande photo pleine en haut, fondue en blanc vers le texte —
          la lecture se fait entièrement sur fond uni */}
      <div className="relative h-72 sm:h-80 lg:hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/55 to-transparent" />
      </div>

      <Container className="relative pb-16 pt-5 lg:pb-24 lg:pt-10">
        {breadcrumb}

        {/* copy */}
        <div className="mt-4 max-w-2xl animate-fade-up lg:mt-6">
          <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
            <span className="h-[3px] w-10 rounded-full bg-amber-500" />
            {kicker}
          </p>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.02] tracking-tight text-inkgreen sm:text-5xl">
            {title}
            <span className="ml-3 inline-flex -rotate-2 items-center whitespace-nowrap rounded-lg bg-amber-500 px-3 py-1.5 align-middle font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pine-950 shadow-md sm:-translate-y-1">
              Direct usine
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600">{intro}</p>

          {/* CTA — mêmes éléments que la homepage */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={estimerHref}
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
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
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
                <strong className="font-bold text-inkgreen">Conforme NF</strong> —
                certifié à la fabrication
              </span>
            </span>
          </div>
        </div>

        {/* pastille contexte en verre dépoli, posée sur la photo (desktop) */}
        <div className="pointer-events-none absolute bottom-6 right-6 hidden rounded-2xl border border-white/25 bg-pine-950/35 px-5 py-3 backdrop-blur-md lg:block">
          <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-pine-100">
            {image.label}
          </span>
          <span className="mt-0.5 block text-sm font-bold text-white">{image.title}</span>
        </div>
      </Container>
    </section>
  );
}
