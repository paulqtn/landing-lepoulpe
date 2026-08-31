import { NextResponse } from "next/server";
import { chiffrer, type ChiffrageInput } from "@/lib/calculateur/engine";
import { SYSTEMES } from "@/lib/calculateur/tarifs";

/* Chiffrage interne MGK — le moteur et les tarifs restent côté serveur.
   Accès protégé par code (variable d'environnement CALC_ACCESS_CODE). */

const CODE = process.env.CALC_ACCESS_CODE ?? "MGK-2026";

export async function POST(req: Request) {
  let body: { code?: string; input?: Partial<ChiffrageInput> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if ((body.code ?? "") !== CODE) {
    return NextResponse.json({ error: "Code d'accès invalide." }, { status: 401 });
  }

  const i = body.input;
  if (
    !i ||
    !Array.isArray(i.troncons) ||
    i.troncons.length === 0 ||
    i.troncons.some((t) => !t || !(Number(t.longueur) > 0)) ||
    !i.fixation ||
    !(i.fixation in SYSTEMES) ||
    !i.verre ||
    !["66.4", "88.4", "1010.4"].includes(i.verre) ||
    !(Number(i.hauteurFinie) > 0)
  ) {
    return NextResponse.json({ error: "Paramètres incomplets (tronçons, fixation, verre, hauteur)." }, { status: 400 });
  }

  try {
    const result = chiffrer({
      client: i.client,
      projet: i.projet,
      departement: i.departement,
      troncons: i.troncons.map((t) => ({ longueur: Number(t.longueur), escalier: !!t.escalier })),
      angles: i.angles !== undefined ? Math.max(0, Number(i.angles)) : undefined,
      departMur: !!i.departMur,
      finMur: !!i.finMur,
      fixation: i.fixation,
      gs10Partage: !!i.gs10Partage,
      verre: i.verre,
      teinte: (i.teinte as ChiffrageInput["teinte"]) ?? "clair",
      hauteurFinie: Number(i.hauteurFinie),
      penteEscalier: i.penteEscalier ? Number(i.penteEscalier) : undefined,
      couleur: (i.couleur as ChiffrageInput["couleur"]) ?? "anodise",
      livraison: (i.livraison as ChiffrageInput["livraison"]) ?? "inconnu",
      coefficient: i.coefficient ? Number(i.coefficient) : undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: `Erreur de calcul : ${e instanceof Error ? e.message : "inconnue"}` }, { status: 500 });
  }
}
