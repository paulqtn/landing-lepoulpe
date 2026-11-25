import { NextResponse } from "next/server";
import { correspondance, isSystemeDemande } from "@/lib/calculateur/correspondance";
import { chiffrer } from "@/lib/calculateur/engine";
import { getTarifsSite } from "@/lib/admin/prices";

/* ================================================================== */
/*  Estimation PUBLIQUE (configurateur du site).                       */
/*  Applique les correspondances automatiques MGK puis renvoie         */
/*  UNIQUEMENT le prix de vente — jamais les coûts internes.           */
/* ================================================================== */

type Body = {
  usage?: string;
  systeme?: "rail" | "pinces" | "spider" | "conseil";
  cotes?: number[];
  hauteur?: number;
  teinte?: "clair" | "extra-clair" | "fume-1f" | "fume-2f";
  /** Épaisseur explicite (fiches produit) — sinon règle auto. */
  verre?: "66.4" | "88.4" | "1010.4";
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
  if (!isSystemeDemande(b.systeme) || cotes.length === 0 || ![90, 100, 110].includes(hauteur)) {
    return NextResponse.json({ error: "Paramètres incomplets." }, { status: 400 });
  }

  // Correspondance unique choix du client → référence chiffrée (voir correspondance.ts).
  const c = correspondance({ systeme: b.systeme, verre: b.verre, lieu: b.usage, teinte: b.teinte })!;
  const { verre, fixation } = c;

  const escalier = b.usage === "escalier";
  const departement = (b.cp ?? "").trim().slice(0, 2);
  // Tarifs en vigueur : dernière version publiée depuis le back office.
  const tarifs = await getTarifsSite();
  const zoneLocale = tarifs.deptsLocaux.includes(departement);

  const r = chiffrer({
    troncons: cotes.map((longueur) => ({ longueur, escalier })),
    fixation,
    verre,
    teinte: c.teinte,
    hauteurFinie: hauteur,
    couleur: "anodise",
    departement: departement || undefined,
    livraison: "livraison",
  }, tarifs);

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
