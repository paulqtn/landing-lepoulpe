/* Généré par la flotte de rédaction (workflow gc-content) — ne pas éditer à la main. */

import type { Feature, QA } from "../catalog";
import { combosVerre } from "./combos-verre";
import { combosAluminium } from "./combos-aluminium";
import { combosInox } from "./combos-inox";

export type ComboContent = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  benefits: Feature[];
  technical: Feature[];
  faq: QA[];
};

export const comboContent: Record<string, ComboContent> = {
  ...combosVerre,
  ...combosAluminium,
  ...combosInox,
};
