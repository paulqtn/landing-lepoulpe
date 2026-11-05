import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Configurator, type SystemeKey } from "@/components/Configurator";
import { usages } from "@/lib/catalog";
import { phoneHref, site } from "@/lib/site";

/* ================================================================== */
/*  Générateur plein écran — le tunnel de devis, sans distraction ni   */
/*  scroll de page : sidebar d'étapes pleine hauteur à gauche, volet   */
/*  de contenu à droite. L'usage (ou l'épaisseur) arrive pré-réglé     */
/*  selon la page d'origine via ?usage= / ?verre=.                     */
/* ================================================================== */

export const metadata: Metadata = {
  title: "Estimez votre garde-corps en verre — tarif immédiat",
  description:
    "Configurez votre garde-corps en verre en 1 minute : projet, fixation, dimensions — votre tarif exact direct usine s'affiche à la fin. Gratuit et sans engagement.",
  alternates: { canonical: "/generateur" },
};

export default async function GenerateurPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const usage = usages.some((u) => u.slug === sp.usage) ? sp.usage : undefined;
  const usageName = usage ? usages.find((u) => u.slug === usage)?.name : undefined;
  const verre = sp.verre && ["66.4", "88.4", "1010.4"].includes(sp.verre) ? (sp.verre as "66.4" | "88.4" | "1010.4") : undefined;
  const sys = sp.sys && ["rail", "pinces", "spider"].includes(sp.sys) ? (sp.sys as SystemeKey) : undefined;
  const len = Number(sp.len);
  const hauteur = sp.h && ["90", "100", "110"].includes(sp.h) ? sp.h : undefined;

  const source = usage ? `generateur-${usage}` : verre ? `generateur-verre-${verre}` : "generateur";

  const note = usage
    ? `Votre projet ${usageName?.toLowerCase()} est déjà pris en compte — votre tarif exact s’affiche à la fin.`
    : verre
      ? `L’épaisseur ${verre} est déjà réglée — votre tarif exact s’affiche à la fin.`
      : "Une question à la fois — votre tarif exact s’affiche à la fin, en 1 minute.";

  return (
    <div className="funnel-lock fixed inset-0 z-[100] flex flex-col overscroll-contain bg-white">
      {/* barre mobile : logo + téléphone (en desktop, la sidebar s'en charge) */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200/70 bg-white px-4 sm:px-6 lg:hidden">
        <Link href="/" aria-label={`${site.name} — retour à l'accueil`} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-pine-700 text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M3 8h18" />
              <path d="M5 8v10M9.5 8v10M14.5 8v10M19 8v10" />
              <path d="M3 18h18" strokeOpacity="0.5" />
            </svg>
          </span>
          <span className="text-sm font-extrabold tracking-tight text-inkgreen">{site.name}</span>
        </Link>
        <a href={phoneHref} className="group flex items-center gap-2 text-sm font-bold text-inkgreen transition-colors hover:text-pine-700">
          <Phone className="h-4 w-4 text-pine-600 group-hover:animate-wiggle" />
          <span>{site.phone}</span>
          <span className="relative flex h-1.5 w-1.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
        </a>
      </div>

      <div className="min-h-0 flex-1">
        <Configurator
          fullscreen
          note={note}
          lock={{ usage, verre }}
          defaults={{
            systeme: sys,
            cotes: Number.isFinite(len) && len > 0 && len <= 200 ? [len] : undefined,
            hauteur,
          }}
          source={source}
        />
      </div>
    </div>
  );
}
