/* Tests de parité Excel du moteur de simulation MGK.
   Lancement : npm test (lanceur de tests intégré à Node, aucune dépendance).
   Les valeurs attendues viennent du bloc `testCases` du catalogue fourni :
   ne jamais les modifier pour faire passer un test. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { simulate, compareSystems, excelRound, resolveSupportPrice } from "./engine.ts";

const catalog = JSON.parse(readFileSync(new URL("./catalogue-mgk-2026.json", import.meta.url), "utf8"));
const supportId = (prefix) => catalog.supports.find((s) => s.legacyLabel.startsWith(prefix)).legacyId;

const BASE = {
  lengthMm: 7000,
  finishedHeightMm: 1100,
  glassLegacyId: 13,
  supportLegacyId: supportId("GS-07-A"),
  finish: "ANODISE",
  shipping: "Livraison standard",
  saleMethod: "Coefficient",
  saleValue: 1.7,
  vatRate: 0.2,
  targetPanelWidthMm: 1000,
  gapPanelsMm: 15,
  gapEndsEachSideMm: 25,
  forcedPanels: null,
  forcedSupports: null,
  forcedCrates: null,
  forcedPallets: null,
  gateCount: 0,
  alignmentPins: false,
  specialCuts: 0,
};
const run = (patch = {}) => simulate({ ...BASE, ...patch }, catalog);

const close = (actual, expected, label) => {
  if (expected === null) return assert.equal(actual, null, label);
  assert.ok(actual !== null && Math.abs(actual - expected) < 1e-6, `${label} : attendu ${expected}, obtenu ${actual}`);
};

/** Compare un résultat aux champs d'un cas de référence du JSON. */
function checkCase(name, r) {
  const e = catalog.testCases[name];
  const g = r.geometry, q = r.quantities, p = r.purchase, s = r.sale;
  close(g.lengthM, e.ml, "ml");
  close(g.panelsAutomatic, e.n_auto, "n_auto");
  close(g.panels, e.n, "n");
  close(g.panelWidthMm, e.width, "largeur");
  close(g.glassHeightMm, e.hglass, "hauteur verre");
  close(g.glassAreaM2, e.area, "surface");
  close(g.glassWeightKg, e.weight, "poids");
  close(q.crates, e.caisses, "caisses");
  close(q.panelsPerCrate, e.n_by_c, "vitrages/caisse");
  close(q.pallets, e.palettes, "palettes");
  close(q.panelsPerPallet, e.n_by_p, "vitrages/palette");
  close(q.supports, e.support_qty, "qté supports");
  close(p.glass, e.glassbuy, "achat verre");
  close(p.supports, e.supportbuy, "achat supports");
  close(p.crates, e.caissesbuy, "achat caisses");
  close(p.turkeyToFrance, e.turkey, "Turquie→France");
  close(p.franceToCustomer, e.france, "France→client");
  close(p.specialCuts, e.cutsbuy, "découpes");
  close(p.totalHt, e.cost, "coût total");
  close(s.appliedCoefficient, e.coefficient, "coefficient");
  close(s.guardrailHt, e.sell_ht_base, "vente GC HT");
  close(s.gateHt + s.pinsHt, e.options_ht, "options HT");
  close(s.totalHt, e.sell_ht_total, "vente HT totale");
  close(s.totalTtc, e.sell_ttc, "vente TTC");
  close(s.perMeterHt, e.ht_ml, "HT/ml");
}

const CASES = {
  default_excel: {},
  rail_gs19_7m: { supportLegacyId: supportId("GS-19-L") },
  without_france_delivery_plus_options: { shipping: "Enlèvement dépôt MGK", gateCount: 1, alignmentPins: true },
  three_meter: { lengthMm: 3000 },
  override_panels_five: { forcedPanels: 5 },
  twenty_three_panels_auto_shipping: { lengthMm: 23500, forcedPanels: 23 },
  twenty_two_panels_tolerance: { lengthMm: 22000, forcedPanels: 22 },
  target_margin_40pct: { saleMethod: "Taux de marque", saleValue: 0.4 },
  spider_7m: { glassLegacyId: 2, supportLegacyId: supportId("GS-02") },
  gs16_ral_unavailable: { supportLegacyId: supportId("GS-16"), finish: "RAL_STANDARD" },
  gs03g_other_fixed: { supportLegacyId: supportId("GS-03-G"), finish: "AUTRE_COULEUR" },
};

test("tous les cas de référence du catalogue sont couverts", () => {
  assert.deepEqual(Object.keys(CASES).sort(), Object.keys(catalog.testCases).sort());
});

for (const [name, patch] of Object.entries(CASES)) {
  test(`parité Excel — ${name}`, () => checkCase(name, run(patch)));
}

test("cas par défaut : marges et affichage au centime", () => {
  const r = run();
  assert.equal(r.status, "READY");
  close(r.margins.grossEuro, 763.868, "marge brute");
  close(r.margins.brandRate, 0.411764705882, "taux de marque");
  close(r.margins.marginOnCostRate, 0.7, "taux de marge");
  close(r.margins.effectiveCoefficient, 1.7, "coef effectif");
  assert.equal(r.sale.totalHt.toFixed(2), "1855.11");
  assert.equal(r.sale.totalTtc.toFixed(2), "2226.13");
});

test("catalogue complet : 39 verres, 16 supports, 18 paramètres", () => {
  assert.equal(catalog.glasses.length, 39);
  assert.equal(catalog.supports.length, 16);
  assert.equal(Object.keys(catalog.parameters).length, 18);
});

test("chaque verre : achat = surface réelle × prix au m², poids = surface × kg/m²", () => {
  for (const g of catalog.glasses) {
    const r = run({ glassLegacyId: g.legacyId });
    close(r.purchase.glass, 7.546 * g.purchasePricePerM2, `verre ${g.legacyId}`);
    close(r.geometry.glassWeightKg, 7.546 * g.kgPerM2, `poids ${g.legacyId}`);
  }
});

test("chaque support : quantité et prix selon sa règle et sa finition", () => {
  for (const s of catalog.supports) {
    for (const finish of ["ANODISE", "RAL_STANDARD", "AUTRE_COULEUR"]) {
      const r = run({ supportLegacyId: s.legacyId, finish });
      const qty = s.category === "Rail" ? 3 : s.perPanel ? s.perPanel * 7 : Math.ceil(7 * s.perLinearMeter);
      assert.equal(r.quantities.supports, qty, `${s.legacyLabel} qté`);
      const p = s.pricing[finish];
      if (p.mode === "UNAVAILABLE") {
        assert.equal(r.purchase.supports, null);
        assert.equal(r.sale.totalHt, null);
        assert.equal(r.status, "BLOCKED");
      } else {
        // Le montant figé du JSON doit coïncider avec le prix résolu (y compris RAL × 1,20).
        close(resolveSupportPrice(s, finish, catalog), p.amount, `${s.legacyLabel} ${finish}`);
        close(r.purchase.supports, qty * (p.amount + s.fixedAccessoriesPerUnit), `${s.legacyLabel} total`);
      }
    }
  }
});

test("exceptions tarifaires : GS-03-G autre couleur = 340 € fixe, GS-16/17 RAL bloqués", () => {
  const gs03 = catalog.supports.find((s) => s.legacyLabel.startsWith("GS-03-G"));
  assert.equal(resolveSupportPrice(gs03, "AUTRE_COULEUR", catalog), 340);
  for (const ref of ["GS-16", "GS-17"]) {
    for (const finish of ["RAL_STANDARD", "AUTRE_COULEUR"]) {
      const r = run({ supportLegacyId: supportId(ref), finish });
      assert.equal(r.status, "BLOCKED");
      assert.ok(r.warnings.some((x) => x.code === "PRICE_UNAVAILABLE"));
      assert.ok(r.purchase.glass > 0, "les autres postes restent connus");
    }
  }
});

test("arrondi Excel : 0,5 vers le haut", () => {
  assert.equal(excelRound(2.5, 0), 3);
  assert.equal(excelRound(3.5, 0), 4);
  assert.equal(excelRound(2.4999, 0), 2);
  // quotient exactement X,5 : (L − 50 + 15) / 1015 = 2,5 → 3 vitrages
  assert.equal(run({ lengthMm: 2.5 * 1015 + 35 }).geometry.panelsAutomatic, 3);
  // quotient entier
  assert.equal(run({ lengthMm: 4 * 1015 + 35 }).geometry.panelsAutomatic, 4);
  // minimum 1 vitrage
  assert.equal(run({ lengthMm: 300 }).geometry.panelsAutomatic, 1);
});

test("pions : N − 1, donc 0 pour un seul vitrage ; hors coefficient", () => {
  assert.equal(run({ lengthMm: 1000, alignmentPins: true }).sale.pinCount, 0);
  const r = run({ alignmentPins: true, gateCount: 2 });
  assert.equal(r.sale.pinCount, 6);
  close(r.sale.pinsHt, 52.5, "pions");
  close(r.sale.gateHt, 1250, "portillons");
  close(r.sale.totalHt, r.sale.guardrailHt + 1302.5, "options hors coefficient");
});

test("Turquie → France : 5 / 6 / 20 vitrages par caisse → 0 / 30 / 450 €", () => {
  const t = (n) => run({ lengthMm: n * 1000, forcedPanels: n, forcedCrates: 1 }).purchase.turkeyToFrance;
  assert.equal(t(5), 0);
  assert.equal(t(6), 30);
  assert.equal(t(20), 450);
  assert.equal(t(30), 450);
  // deux caisses : moyenne arrondie au supérieur × nombre de caisses
  assert.equal(run({ lengthMm: 13000, forcedPanels: 13, forcedCrates: 2 }).purchase.turkeyToFrance, 2 * 60);
});

test("caisses : 1 jusqu'à 1 299,99 kg (alerte dès 1 000), plusieurs à partir de 1 300", () => {
  // verre 1010.4 (50 kg/m²), hauteur 2 000 mm, 1 vitrage sans jeux : poids = L(m) × 100 kg
  const byWeight = (kg) =>
    run({ glassLegacyId: 25, supportLegacyId: supportId("GS-06-A"), finishedHeightMm: 2000, lengthMm: kg * 10, forcedPanels: 1, gapEndsEachSideMm: 0 });
  const codes = (r) => r.warnings.map((x) => x.code);
  let r = byWeight(999.99);
  assert.equal(r.quantities.crates, 1);
  assert.ok(!codes(r).includes("WEIGHT_SINGLE_CRATE"));
  r = byWeight(1000);
  assert.equal(r.quantities.crates, 1);
  assert.ok(codes(r).includes("WEIGHT_SINGLE_CRATE"));
  r = byWeight(1299.99);
  assert.equal(r.quantities.crates, 1);
  assert.ok(codes(r).includes("WEIGHT_SINGLE_CRATE"));
  r = byWeight(1300);
  assert.equal(r.quantities.crates, 2);
  assert.ok(codes(r).includes("WEIGHT_MULTI_CRATES"));
  assert.equal(byWeight(2000).quantities.crates, 2);
  assert.equal(byWeight(2000.01).quantities.crates, 3);
});

test("France → client : tranches par palette, tolérance 22, supplément rail", () => {
  const f = (n, patch = {}) => run({ lengthMm: n * 1000, forcedPanels: n, ...patch });
  const expected = { 5: 200, 6: 250, 10: 250, 11: 300, 15: 300, 16: 350, 20: 350, 21: 350, 22: 350, 23: 600 };
  for (const [n, eur] of Object.entries(expected)) assert.equal(f(Number(n)).purchase.franceToCustomer, eur, `${n} vitrages`);
  assert.equal(f(22).quantities.pallets, 1);
  assert.equal(f(23).quantities.pallets, 2);
  assert.equal(f(23).quantities.panelsPerPallet, 12);
  // 1 palette forcée au-delà de 22 : plafonné à la dernière tranche + alerte
  const capped = f(30, { forcedPallets: 1 });
  assert.equal(capped.purchase.franceToCustomer, 350);
  assert.ok(capped.warnings.some((x) => x.code === "PALLET_FORCED_CAP"));
  // rail : +100 € par palette et verre −30 mm
  const rail = f(7, { supportLegacyId: supportId("GS-19-L") });
  assert.equal(rail.purchase.franceToCustomer, 350);
  assert.equal(rail.geometry.glassHeightMm, 1070);
});

test("enlèvement : France à 0, Turquie conservée", () => {
  for (const shipping of ["Enlèvement dépôt MGK", "Livraison Corse (enlèvement dépôt MGK)", "Sans livraison France-France"]) {
    const r = run({ shipping });
    assert.equal(r.purchase.franceToCustomer, 0);
    assert.equal(r.purchase.turkeyToFrance, 60);
  }
});

test("méthodes de vente : taux de marque 40 % et 100 %, coefficient < 1", () => {
  close(run({ saleMethod: "Taux de marque", saleValue: 0.4 }).sale.appliedCoefficient, 1 / 0.6, "coef 40 %");
  const r = run({ saleMethod: "Taux de marque", saleValue: 1 });
  assert.equal(r.status, "BLOCKED");
  assert.equal(r.sale.totalHt, null);
  assert.ok(r.purchase.totalHt > 0);
  const low = run({ saleValue: 0.9 });
  assert.ok(low.warnings.some((x) => x.code === "BELOW_COST"));
  assert.ok(low.margins.grossEuro < 0);
});

test("forçages : supports, caisses, palettes ; null n'est jamais 0", () => {
  const r = run({ forcedSupports: 10, forcedCrates: 2, forcedPallets: 2 });
  assert.equal(r.quantities.supports, 10);
  assert.equal(r.quantities.supportsAutomatic, 21);
  close(r.purchase.supports, 108.8, "supports forcés");
  assert.equal(r.purchase.crates, 200);
  assert.equal(r.quantities.panelsPerCrate, 4);
  assert.equal(r.purchase.turkeyToFrance, 0);
  assert.equal(r.purchase.franceToCustomer, 400);
  assert.equal(run({ forcedPanels: 0 }).status, "BLOCKED");
  assert.equal(run({ forcedSupports: 2.5 }).status, "BLOCKED");
});

test("saisies invalides : blocage", () => {
  for (const patch of [
    { lengthMm: 0 }, { finishedHeightMm: 100 }, { targetPanelWidthMm: 0 }, { gapPanelsMm: -1 },
    { gapEndsEachSideMm: -1 }, { gateCount: -1 }, { specialCuts: 1.5 }, { saleValue: 0 },
    { vatRate: 0.055 }, { glassLegacyId: 99 }, { supportLegacyId: 99 }, { forcedPanels: 500 },
  ]) {
    assert.equal(run(patch).status, "BLOCKED", JSON.stringify(patch));
  }
});

test("avertissements de compatibilité", () => {
  const codes = (patch) => run(patch).warnings.map((x) => x.code);
  assert.ok(codes({ glassLegacyId: 1 }).includes("THICKNESS")); // 88.4 + GS-07-A
  assert.ok(codes({ supportLegacyId: supportId("GS-02") }).includes("SPIDER_DRILL")); // 66.4 non percé
  assert.ok(codes({ supportLegacyId: supportId("GS-02") }).includes("THICKNESS"));
  assert.ok(!codes({ glassLegacyId: 2, supportLegacyId: supportId("GS-02") }).includes("SPIDER_DRILL"));
  assert.ok(codes({ supportLegacyId: supportId("MC-211") }).includes("AUDIT"));
  assert.ok(codes({ supportLegacyId: supportId("GS-05") }).includes("AUDIT_HYPOTHESIS"));
  assert.ok(codes({ glassLegacyId: 15, specialCuts: 2 }).includes("CUTS_DOUBLE"));
  assert.ok(!codes({ specialCuts: 2 }).includes("CUTS_DOUBLE"));
});

test("découpes spéciales : à l'achat, donc multipliées par le coefficient", () => {
  const r = run({ specialCuts: 3 });
  assert.equal(r.purchase.specialCuts, 30);
  close(r.sale.guardrailHt, (1091.24 + 30) * 1.7, "vente avec découpes");
});

test("comparatif : 16 lignes recalculées, hors options, « À confirmer » jamais 0", () => {
  const input = { ...BASE, finish: "RAL_STANDARD", gateCount: 1, alignmentPins: true, specialCuts: 2, forcedSupports: 12 };
  const excel = compareSystems(input, catalog, true);
  const auto = compareSystems(input, catalog, false);
  assert.equal(excel.length, 16);
  assert.equal(excel.filter((x) => x.selected).length, 1);
  for (const row of excel) {
    assert.equal(row.result.quantities.supports, 12, "forçage global reproduit");
    assert.equal(row.result.sale.gateHt, 0);
    assert.equal(row.result.sale.pinsHt, 0);
    assert.equal(row.result.purchase.specialCuts, 20);
    assert.equal(row.result.geometry.glassHeightMm, row.category === "Rail" ? 1070 : 1100);
  }
  for (const row of auto) {
    const s = catalog.supports.find((x) => x.legacyId === row.supportLegacyId);
    const qty = s.category === "Rail" ? 3 : s.perPanel ? s.perPanel * 7 : Math.ceil(7 * s.perLinearMeter);
    assert.equal(row.result.quantities.supports, qty);
  }
  for (const ref of ["GS-16", "GS-17"]) {
    const row = auto.find((x) => x.label.startsWith(ref));
    assert.equal(row.result.sale.totalHt, null);
    assert.equal(row.result.purchase.franceToCustomer, 350, "supplément rail conservé");
  }
});
