import { NextResponse } from "next/server";
import { chiffrer } from "@/lib/calculateur/engine";
import { DEPTS_LOCAUX } from "@/lib/calculateur/tarifs";

/* ================================================================== */
/*  Estimation PUBLIQUE (configurateur du site).                       */
/*  Applique les correspondances automatiques MGK puis renvoie         */
/*  UNIQUEMENT le prix de vente — jamais les coûts internes.           */
/* ================================================================== */

type Body = {
  usage?: string;
  systeme?: "rail" | "pinces" | "spider";
  cotes?: number[];
  hauteur?: number;
  teinte?: "clair" | "extra-clair" | "fume-1f" | "fume-2f";
  cp?: string;
};

export async function POST(req: Request) {
  let b: Body;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const cotes = (b.cotes ?? []).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 200);
  const hauteur = Number(b.hauteur);
  if (!b.systeme || !["rail", "pinces", "spider"].includes(b.systeme) || cotes.length === 0 || ![90, 100, 110].includes(hauteur)) {
    return NextResponse.json({ error: "Paramètres incomplets." }, { status: 400 });
  }

  // Correspondances automatiques internes.
  const piscine = (b.usage ?? "").includes("piscine");
  const verre = piscine ? ("66.4" as const) : ("88.4" as const);
  const fixation =
    b.systeme === "rail" ? ("GS-19-L" as const)
    : b.systeme === "spider" ? ("GS-02" as const)
    : verre === "66.4" ? ("GS-07-A" as const) : ("GS-07-C" as const);

  const escalier = b.usage === "escalier";
  const departement = (b.cp ?? "").trim().slice(0, 2);
  const zoneLocale = DEPTS_LOCAUX.includes(departement);

  const r = chiffrer({
    troncons: cotes.map((longueur) => ({ longueur, escalier })),
    fixation,
    verre,
    teinte: b.teinte && ["clair", "extra-clair", "fume-1f", "fume-2f"].includes(b.teinte) ? b.teinte : "clair",
    hauteurFinie: hauteur,
    couleur: "anodise",
    departement: departement || undefined,
    livraison: "livraison",
  });

  // Sortie assainie : uniquement ce que le client peut voir.
  return NextResponse.json({
    ttc: r.prixTTC,
    ht: r.prixHT,
    ttcMl: r.ttcMl,
    nbVerres: r.nbVerres,
    hauteurVerre: r.hauteurVerre,
    verre,
    longueurTotale: r.longueurTotale,
    livraisonIncluse: true,
    enlevementPossible: zoneLocale,
  });
}
