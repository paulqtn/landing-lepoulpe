/* Tests de la règle de prime des commerciaux. Lancement : npm test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { COMP_DEFAUT as C, bonusCA, primeMois } from "./prime.ts";

test("bonus : rien sous 110 000 € de CA HT", () => {
  for (const ca of [0, 50000, 109999.99]) assert.deepEqual(bonusCA(ca, C), { tranches: 0, bonus: 0 });
});

test("bonus : 150 € dès 110 000 €, puis 150 € par tranche de 10 000 €", () => {
  const attendu = { 110000: 150, 115000: 150, 119999.99: 150, 120000: 300, 129999: 300, 130000: 450, 200000: 1500 };
  for (const [ca, bonus] of Object.entries(attendu)) assert.equal(bonusCA(Number(ca), C).bonus, bonus, `CA ${ca}`);
});

test("commission : 4 % de la marge brute, dès le premier euro et sans plafond", () => {
  assert.deepEqual(primeMois(10000, 30000, C), { commission: 400, bonus: 0, total: 400 });
  assert.deepEqual(primeMois(45000, 110000, C), { commission: 1800, bonus: 150, total: 1950 });
  assert.deepEqual(primeMois(52000, 126000, C), { commission: 2080, bonus: 300, total: 2380 });
  assert.equal(primeMois(1234.56, 0, C).commission, 49.38);
});

test("paramètres modifiables", () => {
  const c = { tauxMarge: 5, seuilCA: 50000, bonusParTranche: 200, tranche: 5000 };
  assert.deepEqual(primeMois(20000, 61000, c), { commission: 1000, bonus: 600, total: 1600 });
});
