/* Niveaux de prix d'un devis : le commercial choisit l'un des trois coefficients appliqués au
   coût d'achat calculé par le moteur. Le plus bas sert de prix plancher. Les coefficients se
   règlent dans Tarifs et paramètres → Paramètres ; ce fichier porte les valeurs de départ et
   les règles de validation (aucune dépendance : utilisable par l'écran et le serveur). */

export type CoefsPrix = { plein: number; remise: number; exceptionnelle: number };
export const COEFS_DEFAUT: CoefsPrix = { plein: 1.7, remise: 1.6, exceptionnelle: 1.5 };

export type NiveauPrix = { coef: number; label: string; aide: string };
export const niveauxDepuis = (c: CoefsPrix): NiveauPrix[] => [
  { coef: c.plein, label: "Plein tarif", aide: "prix normal" },
  { coef: c.remise, label: "Remise", aide: "geste commercial" },
  { coef: c.exceptionnelle, label: "Remise exceptionnelle", aide: "prix plancher" },
];

/** Contrôle d'une grille saisie : deux décimales, décroissante, au-dessus du coût d'achat. */
export function validerCoefs(raw: unknown): { value?: CoefsPrix; error?: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const lire = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? Math.round(x * 100) / 100 : NaN);
  const c = { plein: lire(r.plein), remise: lire(r.remise), exceptionnelle: lire(r.exceptionnelle) };
  if (Object.values(c).some((x) => Number.isNaN(x))) return { error: "Indiquez les trois coefficients." };
  if (c.exceptionnelle <= 1) return { error: "Un coefficient de 1 ou moins vend au prix d'achat ou à perte : le plancher doit être supérieur à 1." };
  if (c.plein > 5) return { error: "Coefficient trop élevé (5 au maximum)." };
  if (!(c.plein > c.remise && c.remise > c.exceptionnelle)) return { error: "Les coefficients doivent être décroissants : plein tarif > remise > remise exceptionnelle." };
  return { value: c };
}

export const coefTexte = (c: number) => `×${String(c).replace(".", ",")}`;
