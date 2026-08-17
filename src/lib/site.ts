/**
 * Configuration centrale du site Garde-Corps Pro.
 * Le nom de marque est un working name — modifiable ici en un seul endroit.
 */

export const site = {
  name: "Garde-Corps Pro",
  legalName: "Garde-Corps Pro",
  tagline: "Garde-corps en direct usine",
  description:
    "Garde-corps en verre, aluminium et inox — sur-mesure ou en kit, en direct usine. Piscine, escalier, balcon, terrasse. Devis détaillé en 24h.",
  url: "https://www.garde-corps-pro.fr",
  email: "contact@garde-corps-pro.fr",
  phone: "06 27 22 17 87",
  location: "France",
} as const;

export const phoneHref = `tel:${site.phone.replace(/\s/g, "")}`;

/** Réassurance du bandeau supérieur. */
export const topPerks = ["Devis en 24h", "Fabrication sur-mesure", "Livraison partout en France"];

/** Réassurance générique (héros, configurateur, footer). */
export const guarantees = [
  "Devis 100 % gratuit",
  "Sans engagement",
  "Conforme NF P01-012",
];
