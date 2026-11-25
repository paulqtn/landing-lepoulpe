/* Niveaux de prix d'un devis : le commercial choisit l'un des trois coefficients
   appliqués au coût d'achat calculé par le moteur. Le plus bas sert de prix plancher. */

export const NIVEAUX_PRIX = [
  { coef: 1.7, label: "Plein tarif", aide: "prix normal" },
  { coef: 1.6, label: "Remise", aide: "geste commercial" },
  { coef: 1.5, label: "Remise exceptionnelle", aide: "prix plancher" },
] as const;

export const COEF_PLEIN = 1.7;
export const COEF_PLANCHER = 1.5;
export const coefAutorise = (c: unknown): c is number => NIVEAUX_PRIX.some((n) => n.coef === c);
