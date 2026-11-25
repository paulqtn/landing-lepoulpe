import { COEFS_DEFAUT, type CoefsPrix, validerCoefs } from "./niveaux-prix";
import { getSetting } from "./settings";

/** Coefficients en vigueur (paramètre « niveaux_prix », valeurs de départ sinon). */
export async function getCoefsPrix(): Promise<CoefsPrix> {
  const { value } = validerCoefs(await getSetting<CoefsPrix>("niveaux_prix"));
  return value ?? COEFS_DEFAUT;
}
