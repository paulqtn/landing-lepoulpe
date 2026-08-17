import type { QA } from "./catalog";
import { guidesData } from "./content/guides-data";

/* Guides SEO — 1 entrée = 1 page /guides/[slug].
   Le contenu est rédigé par la flotte éditoriale (workflow gc-content) et
   vit dans src/lib/content/guides-data.ts — 20 guides couvrant les séries
   normes & réglementation, prix & achat, pose & technique, matériaux. */

export type GuideSection = { heading: string; body: string };

export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  sections: GuideSection[];
  faq: QA[];
};

export const guides: Guide[] = guidesData;

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
