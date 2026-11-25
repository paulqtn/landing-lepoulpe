/* Tests de la correspondance « choix du client » → référence chiffrée. Lancement : npm test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { correspondance } from "./correspondance.ts";

test("pinces → GS-07-C, quelle que soit l'épaisseur", () => {
  for (const verre of ["66.4", "88.4", "1010.4"]) assert.equal(correspondance({ systeme: "pinces", verre }).fixation, "GS-07-C");
  assert.equal(correspondance({ systeme: "pinces", lieu: "piscine" }).fixation, "GS-07-C");
});

test("rail → GS-19-L, spider → GS-02", () => {
  assert.equal(correspondance({ systeme: "rail" }).fixation, "GS-19-L");
  assert.equal(correspondance({ systeme: "spider" }).fixation, "GS-02");
});

test("« à me conseiller » → rail GS-19-L par défaut", () => {
  const c = correspondance({ systeme: "conseil", lieu: "terrasse" });
  assert.deepEqual([c.fixation, c.systeme, c.parDefaut], ["GS-19-L", "rail", true]);
});

test("épaisseur et teinte du verre choisies sont conservées", () => {
  const c = correspondance({ systeme: "rail", verre: "1010.4", teinte: "fume-2f" });
  assert.deepEqual([c.verre, c.teinte], ["1010.4", "fume-2f"]);
  assert.equal(correspondance({ systeme: "pinces", epaisseur: "66.4" }).verre, "66.4");
  assert.equal(correspondance({ systeme: "pinces", lieu: "piscine" }).verre, "66.4");
  assert.equal(correspondance({ systeme: "pinces", lieu: "balcon" }).verre, "88.4");
  assert.equal(correspondance({ systeme: "rail", teinte: "inconnue" }).teinte, "clair");
});

test("système inconnu → pas de chiffrage", () => {
  assert.equal(correspondance({ systeme: "autre" }), null);
  assert.equal(correspondance({ systeme: undefined }), null);
});
