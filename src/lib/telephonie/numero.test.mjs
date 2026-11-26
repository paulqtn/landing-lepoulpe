import test from "node:test";
import assert from "node:assert/strict";
import { cleNumero, dureeLisible, memeNumero, numeroLisible, versE164 } from "./numero.ts";

test("numéros français mis au format international", () => {
  assert.equal(versE164("06 12 34 56 78"), "+33612345678");
  assert.equal(versE164("06.12.34.56.78"), "+33612345678");
  assert.equal(versE164("0033 6 12 34 56 78"), "+33612345678");
  assert.equal(versE164("+33 (0)6 12 34 56 78"), "+33612345678");
  assert.equal(versE164("+33612345678"), "+33612345678");
  assert.equal(versE164("612345678"), "+33612345678");
  assert.equal(versE164("04 94 00 00 00"), "+33494000000");
});
test("numéros étrangers conservés, numéros inexploitables refusés", () => {
  assert.equal(versE164("+32 475 12 34 56"), "+32475123456");
  assert.equal(versE164("0044 20 3890 6606"), "+442038906606");
  assert.equal(versE164(""), null);
  assert.equal(versE164("abc"), null);
  assert.equal(versE164("0612"), null);
  assert.equal(versE164("+1"), null);
});
test("deux écritures du même numéro se reconnaissent", () => {
  assert.equal(memeNumero("06 12 34 56 78", "+33612345678"), true);
  assert.equal(memeNumero("0612345678", "0033612345678"), true);
  assert.equal(memeNumero("0612345678", "0612345679"), false);
  assert.equal(memeNumero("", ""), false);
  assert.equal(cleNumero("+33 6 12 34 56 78"), "612345678");
});
test("affichage", () => {
  assert.equal(numeroLisible("+33612345678"), "06 12 34 56 78");
  assert.equal(numeroLisible("+442038906606"), "+442038906606");
  assert.equal(dureeLisible(45), "45 s");
  assert.equal(dureeLisible(134), "2 min 14");
});
