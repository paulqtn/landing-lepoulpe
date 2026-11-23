/* ================================================================== */
/*  SIMULATION MGK — moteur de chiffrage « parité Excel ».             */
/*  Fonction pure, déterministe, sans dépendance : reproduit le        */
/*  classeur Calculateur_Garde_corps_MGK_IA.xlsx (un tronçon droit =   */
/*  un calcul). Confidentiel : à n'exécuter que côté serveur.          */
/*  Aucun import ici : le fichier est aussi chargé tel quel par les    */
/*  tests (node --test).                                               */
/* ================================================================== */

export type FinishKey = "ANODISE" | "RAL_STANDARD" | "AUTRE_COULEUR";
export type PricingMode = "FIXED" | "MULTIPLIER_RAL" | "UNAVAILABLE";

export type CatalogGlass = {
  legacyId: number;
  legacyLabel: string;
  thickness: string;
  purchasePricePerM2: number;
  kgPerM2: number;
};

export type CatalogSupport = {
  legacyId: number;
  legacyLabel: string;
  category: "Rail" | "Pince";
  perPanel: number | null;
  perLinearMeter: number | null;
  pricing: Record<FinishKey, { mode: PricingMode; amount: number | null }>;
  fixedAccessoriesPerUnit: number;
  auditStatus: string;
  auditNote: string;
  compatibleGlassThickness: string;
};

export type Catalog = {
  glasses: CatalogGlass[];
  supports: CatalogSupport[];
  parameters: Record<string, { value: number }>;
};

export const SHIPPING_MODES = [
  "Livraison standard",
  "Enlèvement dépôt MGK",
  "Livraison Corse (enlèvement dépôt MGK)",
  "Sans livraison France-France",
] as const;
export type ShippingMode = (typeof SHIPPING_MODES)[number];

export type SaleMethod = "Coefficient" | "Taux de marque";

export type SimulationInput = {
  lengthMm: number;
  finishedHeightMm: number;
  glassLegacyId: number;
  supportLegacyId: number;
  finish: FinishKey;
  shipping: ShippingMode;
  saleMethod: SaleMethod;
  /** Coefficient (ex. 1,70) ou taux de marque en fraction (ex. 0,40). */
  saleValue: number;
  vatRate: number;
  targetPanelWidthMm: number;
  gapPanelsMm: number;
  gapEndsEachSideMm: number;
  forcedPanels: number | null;
  forcedSupports: number | null;
  forcedCrates: number | null;
  forcedPallets: number | null;
  gateCount: number;
  alignmentPins: boolean;
  specialCuts: number;
};

export type Severity = "info" | "warning" | "blocking";
export type SimulationWarning = { code: string; severity: Severity; message: string; field?: string };

export type SimulationResult = {
  status: "READY" | "WARNING" | "BLOCKED";
  warnings: SimulationWarning[];
  glassLabel: string | null;
  support: {
    legacyId: number;
    label: string;
    category: "Rail" | "Pince";
    auditStatus: string;
    auditNote: string;
    compatibleGlassThickness: string;
  } | null;
  geometry: {
    lengthM: number;
    glassHeightMm: number;
    panelsAutomatic: number;
    panels: number;
    panelWidthMm: number;
    glassAreaM2: number;
    glassWeightKg: number;
  } | null;
  quantities: {
    supportsAutomatic: number;
    supports: number;
    cratesAutomatic: number;
    crates: number;
    panelsPerCrate: number;
    palletsAutomatic: number;
    pallets: number;
    panelsPerPallet: number;
  } | null;
  purchase: {
    glassUnitPerM2: number;
    glass: number;
    supportUnit: number | null;
    supportAccessoriesUnit: number;
    supports: number | null;
    crates: number;
    turkeyToFrance: number;
    franceToCustomer: number;
    specialCuts: number;
    totalHt: number | null;
  } | null;
  sale: {
    appliedCoefficient: number | null;
    guardrailHt: number | null;
    gateHt: number;
    pinCount: number;
    pinsHt: number;
    totalHt: number | null;
    vatRate: number;
    totalTtc: number | null;
    perMeterHt: number | null;
    perMeterTtc: number | null;
  } | null;
  margins: {
    grossEuro: number | null;
    brandRate: number | null;
    marginOnCostRate: number | null;
    effectiveCoefficient: number | null;
  } | null;
};

/** ROUND d'Excel pour les positifs (0,5 vers le haut), tolérant aux flottants. */
export function excelRound(x: number, digits: number): number {
  const f = 10 ** digits;
  return (Math.sign(x) * Math.round(Math.abs(x) * f + 1e-9)) / f;
}

/** Prix d'achat unitaire d'un support pour une finition ; null = « À CONFIRMER ». */
export function resolveSupportPrice(support: CatalogSupport, finish: FinishKey, catalog: Catalog): number | null {
  const p = support.pricing[finish];
  if (!p || p.mode === "UNAVAILABLE") return null;
  if (p.mode === "FIXED") return typeof p.amount === "number" ? p.amount : null;
  // MULTIPLIER_RAL : prix RAL standard × P_AutreCouleur (jamais la valeur figée).
  const ral = support.pricing.RAL_STANDARD;
  if (!ral || ral.mode !== "FIXED" || typeof ral.amount !== "number") return null;
  return ral.amount * catalog.parameters.P_AutreCouleur.value;
}

const isPosInt = (n: number) => Number.isInteger(n) && n >= 1;
const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const fr = (n: number, d = 0) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

function blocked(warnings: SimulationWarning[], partial: Partial<SimulationResult> = {}): SimulationResult {
  return {
    status: "BLOCKED",
    warnings,
    glassLabel: null,
    support: null,
    geometry: null,
    quantities: null,
    purchase: null,
    sale: null,
    margins: null,
    ...partial,
  };
}

export function simulate(input: SimulationInput, catalog: Catalog): SimulationResult {
  const P = (k: string) => catalog.parameters[k].value;
  const w: SimulationWarning[] = [];
  const block = (code: string, message: string, field?: string) => w.push({ code, severity: "blocking", message, field });
  const warn = (code: string, message: string, field?: string) => w.push({ code, severity: "warning", message, field });
  const info = (code: string, message: string, field?: string) => w.push({ code, severity: "info", message, field });

  /* ---------- validations de saisie ---------- */
  const glass = catalog.glasses.find((g) => g.legacyId === input.glassLegacyId);
  const support = catalog.supports.find((s) => s.legacyId === input.supportLegacyId);
  if (!glass) block("GLASS_UNKNOWN", "Référence de verre introuvable.", "glassLegacyId");
  if (!support) block("SUPPORT_UNKNOWN", "Modèle de support introuvable.", "supportLegacyId");
  if (!isNum(input.lengthMm) || input.lengthMm <= 0) block("LENGTH", "La longueur du tronçon doit être supérieure à 0.", "lengthMm");
  if (!isNum(input.finishedHeightMm) || input.finishedHeightMm <= 100)
    block("HEIGHT", "La hauteur finie doit être supérieure à 100 mm.", "finishedHeightMm");
  if (!isNum(input.targetPanelWidthMm) || input.targetPanelWidthMm <= 0)
    block("TARGET_WIDTH", "La largeur cible d'un vitrage doit être supérieure à 0.", "targetPanelWidthMm");
  if (!isNum(input.gapPanelsMm) || input.gapPanelsMm < 0) block("GAP", "Le jeu entre vitrages ne peut pas être négatif.", "gapPanelsMm");
  if (!isNum(input.gapEndsEachSideMm) || input.gapEndsEachSideMm < 0)
    block("END_GAP", "Le jeu d'extrémité ne peut pas être négatif.", "gapEndsEachSideMm");
  (
    [
      ["forcedPanels", "Nombre de vitrages forcé"],
      ["forcedSupports", "Nombre de supports forcé"],
      ["forcedCrates", "Nombre de caisses forcé"],
      ["forcedPallets", "Nombre de palettes forcé"],
    ] as const
  ).forEach(([k, label]) => {
    const v = input[k];
    if (v !== null && !isPosInt(v)) block("FORCED_INVALID", `${label} : entier supérieur ou égal à 1, ou vide.`, k);
  });
  if (!Number.isInteger(input.gateCount) || input.gateCount < 0)
    block("GATES", "Le nombre de portillons doit être un entier positif ou nul.", "gateCount");
  if (!Number.isInteger(input.specialCuts) || input.specialCuts < 0)
    block("CUTS", "Le nombre de découpes spéciales doit être un entier positif ou nul.", "specialCuts");
  if (!isNum(input.saleValue) || input.saleValue <= 0) block("SALE_VALUE", "La valeur commerciale doit être supérieure à 0.", "saleValue");
  if (input.vatRate !== 0.1 && input.vatRate !== 0.2) block("VAT", "TVA : 10 % ou 20 % uniquement.", "vatRate");
  if (!SHIPPING_MODES.includes(input.shipping)) block("SHIPPING", "Mode de livraison inconnu.", "shipping");

  if (w.length || !glass || !support) return blocked(w);

  const supportInfo = {
    legacyId: support.legacyId,
    label: support.legacyLabel,
    category: support.category,
    auditStatus: support.auditStatus,
    auditNote: support.auditNote,
    compatibleGlassThickness: support.compatibleGlassThickness,
  };

  /* ---------- 6.1 / 6.2 calepinage ---------- */
  const L = input.lengthMm;
  const lengthM = L / 1000;
  const isRail = support.category === "Rail";
  const glassHeightMm = isRail ? input.finishedHeightMm - P("P_ReducRail") : input.finishedHeightMm;
  const rawPanels = (L - 2 * input.gapEndsEachSideMm + input.gapPanelsMm) / (input.targetPanelWidthMm + input.gapPanelsMm);
  const panelsAutomatic = Math.max(1, excelRound(rawPanels, 0));
  const panels = input.forcedPanels ?? panelsAutomatic;
  const panelWidthMm = (L - 2 * input.gapEndsEachSideMm - (panels - 1) * input.gapPanelsMm) / panels;

  if (glassHeightMm <= 0) block("GLASS_HEIGHT", "La hauteur du verre obtenue est nulle ou négative.", "finishedHeightMm");
  if (panelWidthMm <= 0)
    block("PANEL_WIDTH", "Calepinage impossible : la largeur réelle d'un vitrage est nulle ou négative (jeux ou nombre de vitrages trop grands).", "forcedPanels");
  if (w.length) return blocked(w, { glassLabel: glass.legacyLabel, support: supportInfo });

  const glassAreaM2 = panels * (panelWidthMm / 1000) * (glassHeightMm / 1000);
  const glassWeightKg = glassAreaM2 * glass.kgPerM2;

  /* ---------- 6.3 caisses et palettes ---------- */
  const cratesAutomatic = glassWeightKg < P("P_PoidsSeuil") ? 1 : Math.ceil(glassWeightKg / P("P_PoidsMax"));
  const crates = input.forcedCrates ?? cratesAutomatic;
  const panelsPerCrate = Math.ceil(panels / crates);
  const palletsAutomatic = panels <= P("P_FC_Tolerance") ? 1 : Math.ceil(panels / P("P_FC_MaxVitrages"));
  const pallets = input.forcedPallets ?? palletsAutomatic;
  const panelsPerPallet = Math.ceil(panels / pallets);

  /* ---------- 6.4 quantité de supports ---------- */
  let supportsAutomatic: number;
  if (isRail) supportsAutomatic = Math.ceil(excelRound(lengthM / P("P_Barre"), 6));
  else if (support.perPanel != null && support.perPanel > 0) supportsAutomatic = support.perPanel * panels;
  else supportsAutomatic = Math.ceil(excelRound(lengthM * (support.perLinearMeter ?? 0), 6));
  const supports = input.forcedSupports ?? supportsAutomatic;

  /* ---------- 6.5 achats ---------- */
  const glassBuy = glassAreaM2 * glass.purchasePricePerM2;
  const supportUnit = resolveSupportPrice(support, input.finish, catalog);
  const accessoriesUnit = support.fixedAccessoriesPerUnit ?? 0;
  const supportsBuy = supportUnit == null ? null : supports * (supportUnit + accessoriesUnit);
  const cratesBuy = crates * P("P_Caisse");

  /* ---------- 6.6 Turquie → France (toujours calculé) ---------- */
  const turkeyToFrance =
    crates * Math.min(P("P_TF_Plafond"), Math.max(0, panelsPerCrate - P("P_TF_Franchise")) * P("P_TF_Tarif"));

  /* ---------- 6.7 France → client ---------- */
  const tier = Math.min(P("P_FC_MaxVitrages") / P("P_FC_Tranche"), Math.ceil(panelsPerPallet / P("P_FC_Tranche")));
  const deliveryPerPallet = P("P_FC_Base") + P("P_FC_Incr") * (tier - 1) + (isRail ? P("P_FC_Rail") : 0);
  const standard = input.shipping === "Livraison standard";
  const franceToCustomer = standard ? pallets * deliveryPerPallet : 0;

  /* ---------- 6.8 coût, coefficient, options, TTC ---------- */
  const cutsBuy = input.specialCuts * P("P_Decoupe");
  const totalBuy = supportsBuy == null ? null : glassBuy + supportsBuy + cratesBuy + turkeyToFrance + franceToCustomer + cutsBuy;

  const appliedCoefficient =
    input.saleMethod === "Coefficient" ? input.saleValue : input.saleValue < 1 ? 1 / (1 - input.saleValue) : null;
  const guardrailHt = totalBuy != null && appliedCoefficient != null ? totalBuy * appliedCoefficient : null;
  const gateHt = input.gateCount * P("P_Portillon");
  const pinCount = input.alignmentPins ? Math.max(0, panels - 1) : 0;
  const pinsHt = pinCount * P("P_Pion");
  const totalHt = guardrailHt == null ? null : guardrailHt + gateHt + pinsHt;
  const totalTtc = totalHt == null ? null : totalHt * (1 + input.vatRate);

  /* ---------- 6.9 marges (garde-corps seul, hors options) ---------- */
  const grossEuro = guardrailHt != null && totalBuy != null ? guardrailHt - totalBuy : null;
  const margins = {
    grossEuro,
    brandRate: grossEuro != null && guardrailHt ? grossEuro / guardrailHt : null,
    marginOnCostRate: grossEuro != null && totalBuy ? grossEuro / totalBuy : null,
    effectiveCoefficient: guardrailHt != null && totalBuy ? guardrailHt / totalBuy : null,
  };

  /* ---------- alertes ---------- */
  if (supportUnit == null)
    block(
      "PRICE_UNAVAILABLE",
      "Prix non disponible pour cette finition : demander les composants exacts à Yann / fournisseur (aucune valeur inventée).",
      "finish",
    );
  if (input.saleMethod === "Taux de marque" && appliedCoefficient == null)
    block("BRAND_RATE", "Le taux de marque doit être strictement inférieur à 100 %.", "saleValue");

  if (support.compatibleGlassThickness !== "Tous" && support.compatibleGlassThickness !== glass.thickness)
    warn("THICKNESS", `Ce support est prévu pour du verre ${support.compatibleGlassThickness} : vérifier le choix du verre.`, "glassLegacyId");
  if (support.legacyLabel.startsWith("GS-02") && !glass.legacyLabel.toUpperCase().includes("PERÇAGE"))
    warn("SPIDER_DRILL", "Spider : le verre est percé — choisir « avec perçage » ou « découpe et perçage ».", "glassLegacyId");
  if (support.auditStatus !== "Oui" && support.auditStatus !== "Hypothèse") warn("AUDIT", support.auditNote, "supportLegacyId");
  else if (support.auditStatus === "Hypothèse") info("AUDIT_HYPOTHESIS", `Règle à confirmer — ${support.auditNote}`, "supportLegacyId");

  if (input.forcedCrates == null) {
    if (glassWeightKg >= P("P_PoidsMax") && glassWeightKg < P("P_PoidsSeuil"))
      warn(
        "WEIGHT_SINGLE_CRATE",
        `Alerte logistique : ${fr(glassWeightKg)} kg de verre (entre ${P("P_PoidsMax")} et ${P("P_PoidsSeuil") - 1} kg) — valider la faisabilité en 1 caisse avec Yann.`,
      );
    else if (glassWeightKg >= P("P_PoidsSeuil")) info("WEIGHT_MULTI_CRATES", `Poids > ${P("P_PoidsSeuil")} kg : plusieurs caisses prévues.`);
  } else if (glassWeightKg / crates >= P("P_PoidsMax")) {
    warn("WEIGHT_FORCED", `Caisses forcées : ${fr(glassWeightKg / crates)} kg de verre par caisse — faisabilité à valider avec Yann.`, "forcedCrates");
  }

  if (standard) {
    if (pallets > 1)
      warn("PALLETS_MULTI", `${pallets} palettes de ${panelsPerPallet} vitrages : chaque palette est facturée selon le tableau (hypothèse à valider avec Yann).`);
    else if (panels > P("P_FC_Tolerance"))
      warn("PALLET_FORCED_CAP", `1 palette forcée pour ${panels} vitrages : tarif plafonné à la dernière tranche (16-20) — valider la configuration.`, "forcedPallets");
    else if (panels >= P("P_FC_MaxVitrages") - 1)
      warn("PALLET_TOLERANCE", "Projet autour de 20-22 vitrages : confirmer avec Yann (1 palette si tolérance ~5 %).");
  }

  if (input.saleMethod === "Coefficient" && input.saleValue < 1) warn("BELOW_COST", "Coefficient < 1 : vente sous le coût.", "saleValue");
  if (input.specialCuts > 0 && glass.legacyLabel.toUpperCase().includes("DECOUPE"))
    warn("CUTS_DOUBLE", "Verre « découpe et perçage » + découpes spéciales : vérifier qu'il n'y a pas de double comptage.", "specialCuts");

  const forced: [string, number | null, number, string][] = [
    ["vitrages", input.forcedPanels, panelsAutomatic, "forcedPanels"],
    ["supports", input.forcedSupports, supportsAutomatic, "forcedSupports"],
    ["caisses", input.forcedCrates, cratesAutomatic, "forcedCrates"],
    ["palettes", input.forcedPallets, palletsAutomatic, "forcedPallets"],
  ];
  forced.forEach(([label, v, auto, field]) => {
    if (v != null && v !== auto) info("FORCED", `Forçage ${label} : ${auto} en automatique → ${v} retenu.`, field);
  });

  const hasBlocking = w.some((x) => x.severity === "blocking");
  const hasWarning = w.some((x) => x.severity === "warning");

  return {
    status: hasBlocking ? "BLOCKED" : hasWarning ? "WARNING" : "READY",
    warnings: w,
    glassLabel: glass.legacyLabel,
    support: supportInfo,
    geometry: { lengthM, glassHeightMm, panelsAutomatic, panels, panelWidthMm, glassAreaM2, glassWeightKg },
    quantities: { supportsAutomatic, supports, cratesAutomatic, crates, panelsPerCrate, palletsAutomatic, pallets, panelsPerPallet },
    purchase: {
      glassUnitPerM2: glass.purchasePricePerM2,
      glass: glassBuy,
      supportUnit,
      supportAccessoriesUnit: accessoriesUnit,
      supports: supportsBuy,
      crates: cratesBuy,
      turkeyToFrance,
      franceToCustomer,
      specialCuts: cutsBuy,
      totalHt: totalBuy,
    },
    sale: {
      appliedCoefficient,
      guardrailHt,
      gateHt,
      pinCount,
      pinsHt,
      totalHt,
      vatRate: input.vatRate,
      totalTtc,
      perMeterHt: totalHt == null ? null : totalHt / lengthM,
      perMeterTtc: totalTtc == null ? null : totalTtc / lengthM,
    },
    margins,
  };
}

export type ComparisonRow = {
  supportLegacyId: number;
  label: string;
  category: "Rail" | "Pince";
  auditStatus: string;
  compatibleGlassThickness: string;
  selected: boolean;
  result: SimulationResult;
};

/**
 * Comparatif des systèmes : le même projet recalculé intégralement pour
 * chaque support, hors options de vente (portillon / pions), découpes incluses.
 * `keepForcedSupports` = comportement Excel (le forçage B84 s'applique à
 * toutes les lignes) ; sinon quantités automatiques propres à chaque modèle.
 */
export function compareSystems(input: SimulationInput, catalog: Catalog, keepForcedSupports: boolean): ComparisonRow[] {
  return catalog.supports.map((s) => ({
    supportLegacyId: s.legacyId,
    label: s.legacyLabel,
    category: s.category,
    auditStatus: s.auditStatus,
    compatibleGlassThickness: s.compatibleGlassThickness,
    selected: s.legacyId === input.supportLegacyId,
    result: simulate(
      {
        ...input,
        supportLegacyId: s.legacyId,
        forcedSupports: keepForcedSupports ? input.forcedSupports : null,
        gateCount: 0,
        alignmentPins: false,
      },
      catalog,
    ),
  }));
}
