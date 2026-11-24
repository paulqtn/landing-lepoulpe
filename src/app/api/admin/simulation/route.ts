import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getCatalogueSimulation } from "@/lib/admin/prices";
import { DEFAULT_INPUT } from "@/lib/simulation/catalog";
import { compareSystems, simulate, type SimulationInput } from "@/lib/simulation/engine";

/* Simulation MGK — calcul serveur uniquement : le moteur et les tarifs
   d'achat ne quittent jamais le serveur, et l'accès est réservé au
   back office (cookie de session). */

const num = (v: unknown): number => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : NaN);
const forced = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : num(v));

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  let body: { input?: Record<string, unknown>; keepForcedSupports?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const i = body.input;
  if (!i || typeof i !== "object") return NextResponse.json({ error: "Saisie manquante." }, { status: 400 });

  // Toute saisie est reconstruite ici : aucun montant venant du navigateur n'est repris.
  const input: SimulationInput = {
    lengthMm: num(i.lengthMm),
    finishedHeightMm: num(i.finishedHeightMm),
    glassLegacyId: num(i.glassLegacyId),
    supportLegacyId: num(i.supportLegacyId),
    finish: (["ANODISE", "RAL_STANDARD", "AUTRE_COULEUR"] as const).find((f) => f === i.finish) ?? DEFAULT_INPUT.finish,
    shipping: String(i.shipping ?? "") as SimulationInput["shipping"],
    saleMethod: i.saleMethod === "Taux de marque" ? "Taux de marque" : "Coefficient",
    saleValue: num(i.saleValue),
    vatRate: num(i.vatRate),
    targetPanelWidthMm: num(i.targetPanelWidthMm),
    gapPanelsMm: num(i.gapPanelsMm),
    gapEndsEachSideMm: num(i.gapEndsEachSideMm),
    forcedPanels: forced(i.forcedPanels),
    forcedSupports: forced(i.forcedSupports),
    forcedCrates: forced(i.forcedCrates),
    forcedPallets: forced(i.forcedPallets),
    gateCount: num(i.gateCount),
    alignmentPins: i.alignmentPins === true,
    specialCuts: num(i.specialCuts),
  };

  const catalog = await getCatalogueSimulation();
  const result = simulate(input, catalog);
  const comparison = result.geometry ? compareSystems(input, catalog, body.keepForcedSupports !== false) : [];
  // La saisie normalisée est renvoyée pour pouvoir être enregistrée telle quelle.
  return NextResponse.json({ result, comparison, input });
}
