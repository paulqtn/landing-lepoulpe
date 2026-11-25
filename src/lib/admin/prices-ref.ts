import { chiffrer } from "@/lib/calculateur/engine";
import type { TarifsSite } from "@/lib/calculateur/tarifs";
import { DEFAULT_INPUT } from "@/lib/simulation/catalog";
import { simulate, type Catalog } from "@/lib/simulation/engine";
import type { Engine } from "./prices";

/* Scénarios de référence : permettent de voir l'effet d'un changement de
   tarif sur un chiffrage type AVANT de le publier. */

export type RefScenario = { label: string; achat: number | null; venteHT: number | null; venteTTC: number | null };

export function referenceScenarios(engine: Engine, data: unknown): RefScenario[] {
  if (engine === "site") {
    const t = data as TarifsSite;
    const run = (label: string, fixation: "GS-07-C" | "GS-19-L" | "GS-02", verre: "66.4" | "88.4", longueur: number) => {
      const r = chiffrer({ troncons: [{ longueur }], fixation, verre, teinte: "clair", hauteurFinie: 110, couleur: "anodise", livraison: "livraison" }, t);
      return { label, achat: r.coutAchat, venteHT: r.prixHT, venteTTC: r.prixTTC };
    };
    return [
      run("Piscine 7 m — pinces GS-07-C, verre 66.4 clair", "GS-07-C", "66.4", 7),
      run("Terrasse 5 m — rail GS-19-L, verre 88.4 clair", "GS-19-L", "88.4", 5),
      run("Balcon 4 m — spider GS-02, verre 88.4 clair", "GS-02", "88.4", 4),
    ];
  }
  const c = data as Catalog;
  const run = (label: string, patch: Partial<typeof DEFAULT_INPUT>) => {
    const r = simulate({ ...DEFAULT_INPUT, ...patch }, c);
    return { label, achat: r.purchase?.totalHt ?? null, venteHT: r.sale?.totalHt ?? null, venteTTC: r.sale?.totalTtc ?? null };
  };
  const id = (prefix: string) => c.supports.find((s) => s.legacyLabel.startsWith(prefix))?.legacyId ?? DEFAULT_INPUT.supportLegacyId;
  return [
    run("7 m — pinces GS-07-A, verre 66.4 clair (cas Excel)", {}),
    run("7 m — rail GS-19-L, verre 66.4 clair", { supportLegacyId: id("GS-19-L") }),
    run("7 m — spider GS-02, verre 88.4 clair percé", { supportLegacyId: id("GS-02"), glassLegacyId: 2 }),
  ];
}
