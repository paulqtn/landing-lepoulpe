import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone, ShieldCheck, Star } from "lucide-react";
import { GoogleG } from "@/components/Illustrations";
import { Container } from "@/components/ui/Container";
import { phoneHref, site } from "@/lib/site";

/* ================================================================== */
/*  Hero des pages internes — même modèle que la homepage, avec une    */
/*  seule image fixe à droite (le carrousel reste réservé à la home).  */
/* ================================================================== */

export type PageHeroImage = {
  src: string;
  alt: string;
  /** Petit label de la barre en verre dépoli : « Verre · pinces inox ». */
  label: string;
  /** Contexte : « Plage de piscine ». */
  title: string;
};

export function PageHero({
  kicker,
  title,
  intro,
  image,
  estimerHref = "#estimation",
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
    <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-white via-mist to-pine-50/50">
      {/* fond en couches — identique à la homepage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-24 h-[34rem] w-[34rem] rounded-full bg-amber-500/[0.18] blur-[110px]" />
        <div className="absolute -left-32 top-10 h-[30rem] w-[30rem] rounded-full bg-pine-200/50 blur-[100px]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-[28rem] rounded-full bg-amber-500/[0.07] blur-[90px]" />
        <div className="absolute inset-0 bg-lightgrid [mask-image:radial-gradient(ellipse_75%_65%_at_45%_20%,#000_35%,transparent_80%)]" />
      </div>

      <Container className="relative pb-14 pt-8 lg:pb-20 lg:pt-10">
        {breadcrumb}

        <div className="mt-6 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* copy */}
          <div className="animate-fade-up">
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
            <p className="mt-6 max-w-xl leading-relaxed text-neutral-600">{intro}</p>

            {/* CTA — mêmes éléments que la homepage */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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

            {/* ligne de confiance */}
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
                  <strong className="font-bold text-inkgreen">Conforme NF</strong> —
                  certifié à la fabrication
                </span>
              </span>
            </div>
          </div>

          {/* visuel — une seule image fixe, habillée comme la galerie du hero */}
          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-pine-200/50 via-transparent to-amber-500/10" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-pine-950 shadow-panel ring-1 ring-pine-950/10 lg:aspect-[8/7]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 42rem, 100vw"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:px-5">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-pine-200">
                    {image.label}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-bold text-white">{image.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
