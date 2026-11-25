/* Règle de prime des commerciaux — calcul pur, sans dépendance (testé par npm test). */

export type CompSettings = { tauxMarge: number; seuilCA: number; bonusParTranche: number; tranche: number };

export const COMP_DEFAUT: CompSettings = { tauxMarge: 4, seuilCA: 110000, bonusParTranche: 150, tranche: 10000 };

/** Bonus du mois : une tranche dès le seuil de CA HT atteint, puis une par tranche supplémentaire. */
export function bonusCA(caHt: number, c: CompSettings): { tranches: number; bonus: number } {
  if (!(c.tranche > 0) || caHt < c.seuilCA) return { tranches: 0, bonus: 0 };
  const tranches = 1 + Math.floor((caHt - c.seuilCA + 1e-6) / c.tranche);
  return { tranches, bonus: tranches * c.bonusParTranche };
}

/** Prime du mois = pourcentage de la marge brute + bonus de CA. */
export function primeMois(margeBrute: number, caHt: number, c: CompSettings): { commission: number; bonus: number; total: number } {
  const commission = Math.round(margeBrute * c.tauxMarge) / 100;
  const { bonus } = bonusCA(caHt, c);
  return { commission, bonus, total: Math.round((commission + bonus) * 100) / 100 };
}
