/**
 * Tarification indicative €/ml (fourniture) — sert au configurateur et aux
 * bandeaux de prix des pages catalogue. Fourchettes volontairement larges,
 * affinées en devis.
 */

export type MaterialSlug = "verre" | "aluminium" | "inox";
export type Pose = "kit" | "pose";

export const priceRanges: Record<MaterialSlug, Record<Pose, [number, number]>> = {
  verre: { kit: [250, 450], pose: [450, 800] },
  aluminium: { kit: [150, 300], pose: [300, 550] },
  inox: { kit: [180, 350], pose: [350, 600] },
};

const fmt = new Intl.NumberFormat("fr-FR");

export function estimate(
  material: MaterialSlug,
  pose: Pose,
  meters: number,
): { low: string; high: string } {
  const [l, h] = priceRanges[material][pose];
  const round10 = (n: number) => Math.round(n / 10) * 10;
  return { low: fmt.format(round10(l * meters)), high: fmt.format(round10(h * meters)) };
}

export function perMl(material: MaterialSlug, pose: Pose): string {
  const [l, h] = priceRanges[material][pose];
  return `${fmt.format(l)} – ${fmt.format(h)} €/ml`;
}
