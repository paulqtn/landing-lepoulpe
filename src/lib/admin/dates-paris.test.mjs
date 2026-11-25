/* Tests des dates d'envoi à l'heure de Paris. Lancement : npm test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { dateParis, finDeJourneeParis } from "./dates-paris.ts";

const paris = (d) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" }).format(d);

test("hiver : 9 h à Paris = 8 h UTC, deux jours plus tard", () => {
  const d = dateParis(new Date("2026-11-25T15:30:00Z"), 2, 9);
  assert.equal(d.toISOString(), "2026-11-27T08:00:00.000Z");
  assert.equal(paris(d), "27/11/2026 09:00");
});

test("été : 9 h à Paris = 7 h UTC", () => {
  assert.equal(dateParis(new Date("2026-07-10T10:00:00Z"), 3, 9).toISOString(), "2026-07-13T07:00:00.000Z");
});

test("le jour compte à l'heure de Paris, pas en UTC", () => {
  // 23 h 30 UTC le 25 = 0 h 30 le 26 à Paris : J+1 tombe le 27
  assert.equal(paris(dateParis(new Date("2026-11-25T23:30:00Z"), 1, 14)), "27/11/2026 14:00");
});

test("passages à l'heure d'été et d'hiver", () => {
  assert.equal(paris(dateParis(new Date("2027-03-26T10:00:00Z"), 3, 10)), "29/03/2027 10:00"); // après le 28 mars 2027
  assert.equal(paris(dateParis(new Date("2026-10-23T10:00:00Z"), 3, 18)), "26/10/2026 18:00"); // après le 25 octobre 2026
});

test("toutes les heures de 0 à 23 tombent juste", () => {
  for (let h = 0; h < 24; h++) assert.equal(paris(dateParis(new Date("2026-12-01T12:00:00Z"), 5, h)), `06/12/2026 ${String(h).padStart(2, "0")}:00`);
});

test("fin de journée à Paris", () => {
  assert.equal(paris(finDeJourneeParis(new Date("2026-11-25T07:00:00Z"))), "25/11/2026 23:59");
});
