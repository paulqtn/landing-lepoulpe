import type { Metadata } from "next";
import { Configurator, type SystemeKey } from "@/components/Configurator";
import { usages } from "@/lib/catalog";

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
