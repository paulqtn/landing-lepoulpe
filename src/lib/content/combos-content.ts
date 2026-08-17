/* Version temporaire autonome — le contenu rédigé par la flotte (combos-verre/aluminium/inox)
   arrive au prochain push ; en attendant, les pages combo utilisent le contenu composé du catalogue. */

import type { Feature, QA } from "../catalog";

export type ComboContent = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  benefits: Feature[];
  technical: Feature[];
  faq: QA[];
};

export const comboContent: Record<string, ComboContent> = {};
