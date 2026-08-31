import type { MaterialSlug } from "./pricing";
import { productsData } from "./content/products-data";

/* Fiches produit — kits standard. 1 entrée = 1 page /produits/[slug].
   La gamme (12 kits) est définie dans src/lib/content/products-data.ts. */

export type Product = {
  slug: string;
  name: string;
  material: MaterialSlug;
  usages: string[];
  /** Prix fourniture "dès X €/ml". */
  priceFrom: number;
  /** Accroche d'une ligne pour la fiche produit. */
  tagline?: string;
  desc: string;
  specs: string[];
  badge?: string;
  /** Photo réelle (public/) — MaterialScene en repli. */
  photo?: string;
  /** Galerie : photos et vidéos (.mp4) supplémentaires. */
  photos?: string[];
};

export const products: Product[] = productsData;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsForMaterial(material: MaterialSlug): Product[] {
  return products.filter((p) => p.material === material);
}
