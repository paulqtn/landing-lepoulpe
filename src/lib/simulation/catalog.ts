/* ================================================================== */
/*  SIMULATION MGK — catalogue 2026 (verres, supports, paramètres).    */
/*  Tarifs d'achat confidentiels : ce module ne doit être importé que  */
/*  côté serveur (page /commercial/simulation et son API).             */
/*  Source : Calculateur_Garde_corps_MGK_IA.xlsx, onglet               */
/*  « Ne pas toucher » — tarifs non vérifiés hors classeur.            */
/* ================================================================== */

import data from "./catalogue-mgk-2026.json";
import type { Catalog, FinishKey, SaleMethod, ShippingMode, SimulationInput } from "./engine";

export const catalog = data as unknown as Catalog;

export const FINISH_LABELS: Record<FinishKey, string> = {
  ANODISE: "Anodisé",
  RAL_STANDARD: "Couleur standard RAL 7016, 9010, 9005",
  AUTRE_COULEUR: "Autre couleur",
};

const d = data.defaultInput;

export const DEFAULT_INPUT: SimulationInput = {
  lengthMm: d.lengthMm,
  finishedHeightMm: d.finishedHeightMm,
  glassLegacyId: d.glassLegacyId,
  supportLegacyId: data.supports.find((s) => s.legacyLabel === d.supportLegacyLabel)!.legacyId,
  finish: "ANODISE",
  shipping: d.shipping as ShippingMode,
  saleMethod: d.saleMethod as SaleMethod,
  saleValue: d.saleValue,
  vatRate: d.vatRate,
  targetPanelWidthMm: d.targetPanelWidthMm,
  gapPanelsMm: d.gapPanelsMm,
  gapEndsEachSideMm: d.gapEndsEachSideMm,
  forcedPanels: null,
  forcedSupports: null,
  forcedCrates: null,
  forcedPallets: null,
  gateCount: d.gateCount,
  alignmentPins: d.alignmentPins,
  specialCuts: d.specialCuts,
};

export type SimulationOptions = {
  glasses: { id: number; thickness: string; appearance: string; processing: string }[];
  supports: { id: number; label: string; category: "Rail" | "Pince"; auditStatus: string; compatible: string }[];
  finishes: { key: FinishKey; label: string }[];
  defaults: SimulationInput;
  source: string;
};

const PROCESSING: Record<string, string> = {
  DROIT: "Droit",
  "DROIT AVEC PERÇAGE": "Droit avec perçage",
  "EN DECOUPE ET PERÇAGE": "Découpe et perçage",
};

/** Listes de choix pour l'écran — libellés uniquement, aucun prix. */
export function simulationOptions(): SimulationOptions {
  return {
    glasses: catalog.glasses.map((g) => {
      const m = g.legacyLabel.match(/Verre (.+?) (?:66\.4|88\.4|1010\.4) .*\( (.+) \)$/);
      return {
        id: g.legacyId,
        thickness: g.thickness,
        appearance: m?.[1] ?? g.legacyLabel,
        processing: PROCESSING[m?.[2] ?? ""] ?? m?.[2] ?? "",
      };
    }),
    supports: catalog.supports.map((s) => ({
      id: s.legacyId,
      label: s.legacyLabel,
      category: s.category,
      auditStatus: s.auditStatus,
      compatible: s.compatibleGlassThickness,
    })),
    finishes: (Object.keys(FINISH_LABELS) as FinishKey[]).map((key) => ({ key, label: FINISH_LABELS[key] })),
    defaults: DEFAULT_INPUT,
    source: data.sourceBasis,
  };
}
