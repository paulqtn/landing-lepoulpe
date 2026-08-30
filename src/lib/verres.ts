import type { QA } from "./catalog";

/* ================================================================== */
/*  Épaisseurs de verre feuilleté — 1 entrée = 1 page /verre/[slug].   */
/*  Notation X.X.n : deux faces en mm + nombre de films PVB.           */
/* ================================================================== */

export type VerreSpec = {
  slug: string;
  /** Notation commerciale : « 88.4 ». */
  label: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** Prix fourniture indicatif « dès X €/ml ». */
  priceFrom: number;
  /** Caractéristiques clefs affichées en grille. */
  caracteristiques: { label: string; value: string }[];
  /** Points forts. */
  benefits: { title: string; desc: string }[];
  /** Compatibilité avec les 3 fixations (slug fiche produit → note). */
  fixations: { slug: string; name: string; note: string }[];
  faq: QA[];
};

export const verres: VerreSpec[] = [
  {
    slug: "66-6",
    label: "66.6",
    title: "Verre feuilleté 66.6 pour garde-corps",
    metaTitle: "Verre feuilleté 66.6 — garde-corps en verre",
    metaDescription:
      "Verre feuilleté 66.6 (2 × 6 mm) pour garde-corps : composition, poids, fixations compatibles et prix au ml. Découpe sur mesure en direct usine.",
    intro:
      "Le 66.6 associe deux verres de 6 mm et six films PVB : c'est l'entrée de la gamme sécurité pour garde-corps, idéale sur pinces ou entre fixations rapprochées. Léger à manipuler, il reste conforme NF P01-012 dans les configurations à entraxes serrés.",
    priceFrom: 250,
    caracteristiques: [
      { label: "Composition", value: "2 × 6 mm + 6 films PVB" },
      { label: "Épaisseur totale", value: "≈ 14,3 mm" },
      { label: "Poids", value: "≈ 31 kg/m²" },
      { label: "Finition", value: "Trempé-feuilleté, bords polis" },
    ],
    benefits: [
      { title: "Le plus léger de la gamme", desc: "Panneaux faciles à manipuler à la pose, notamment en kit autoconstruction." },
      { title: "Sécurité feuilletée", desc: "Six films PVB : en cas de choc, le verre se fissure mais reste en place." },
      { title: "Budget maîtrisé", desc: "L'épaisseur la plus accessible pour un garde-corps conforme, à entraxes adaptés." },
    ],
    fixations: [
      { slug: "garde-corps-verre-sur-pinces", name: "Verre sur pinces", note: "Le duo idéal — entraxes serrés, pose simple" },
      { slug: "garde-corps-verre-avec-spider", name: "Verre avec spider", note: "Possible en configuration rapprochée" },
      { slug: "garde-corps-verre-sur-rail", name: "Verre sur rail", note: "Réservé aux petites hauteurs — préférez le 88.4" },
    ],
    faq: [
      { q: "Que signifie 66.6 ?", a: "Deux faces de verre de 6 mm assemblées par six films PVB de 0,38 mm : environ 14,3 mm d'épaisseur totale. Les films retiennent les morceaux en cas de casse — c'est ce qui rend le feuilleté obligatoire en garde-corps." },
      { q: "Le 66.6 suffit-il pour un garde-corps ?", a: "Oui dans les configurations à fixations rapprochées (pinces, spiders à entraxes serrés) et hauteurs standard. Pour un tout-verre sur rail sans poteaux, une épaisseur supérieure (88.4, voire 10.10.4) est généralement requise." },
      { q: "Quel prix pour du 66.6 ?", a: "Comptez dès 250 €/ml en fourniture, découpe sur mesure incluse. Le devis détaillé, gratuit, arrive sous 24h." },
    ],
  },
  {
    slug: "88-4",
    label: "88.4",
    title: "Verre feuilleté 88.4 pour garde-corps",
    metaTitle: "Verre feuilleté 88.4 — garde-corps en verre",
    metaDescription:
      "Verre feuilleté 88.4 (2 × 8 mm) pour garde-corps : le standard du tout-verre sur rail. Composition, poids, fixations compatibles, prix au ml direct usine.",
    intro:
      "Deux verres de 8 mm et quatre films PVB : le 88.4 est le standard du garde-corps tout verre. Assez rigide pour le rail sans poteaux en hauteur 1,00 m, il offre le meilleur équilibre entre portée, poids et budget — notre épaisseur la plus vendue.",
    priceFrom: 300,
    caracteristiques: [
      { label: "Composition", value: "2 × 8 mm + 4 films PVB" },
      { label: "Épaisseur totale", value: "≈ 17,5 mm" },
      { label: "Poids", value: "≈ 40 kg/m²" },
      { label: "Finition", value: "Trempé-feuilleté, bords polis" },
    ],
    benefits: [
      { title: "Le standard du sur rail", desc: "Rigidité adaptée au tout-verre autoportant en hauteur 1,00 m, aux entraxes courants." },
      { title: "Équilibre poids / portée", desc: "Maniable à la pose tout en encaissant les efforts de la norme NF P01-013." },
      { title: "Le plus demandé", desc: "L'épaisseur de référence de nos ateliers — délais courts, stock permanent." },
    ],
    fixations: [
      { slug: "garde-corps-verre-sur-rail", name: "Verre sur rail", note: "Le duo de référence — tout-verre 1,00 m" },
      { slug: "garde-corps-verre-sur-pinces", name: "Verre sur pinces", note: "Grande marge de sécurité, entraxes élargis" },
      { slug: "garde-corps-verre-avec-spider", name: "Verre avec spider", note: "Parfait en nez de dalle et façade" },
    ],
    faq: [
      { q: "Que signifie 88.4 ?", a: "Deux faces de verre de 8 mm assemblées par quatre films PVB : environ 17,5 mm d'épaisseur totale, pour 40 kg/m². C'est l'épaisseur de référence des garde-corps tout verre sur rail." },
      { q: "Pourquoi le 88.4 est-il le plus courant ?", a: "Il tient l'autoportance sur rail en hauteur standard sans surcharge : plus rigide que le 66.6, nettement plus léger et économique que le 10.10.4. Le meilleur compromis pour la plupart des projets." },
      { q: "Quel prix pour du 88.4 ?", a: "Comptez dès 300 €/ml en fourniture, découpe sur mesure incluse. Devis détaillé gratuit sous 24h." },
    ],
  },
  {
    slug: "10-10-4",
    label: "10.10.4",
    title: "Verre feuilleté 10.10.4 pour garde-corps",
    metaTitle: "Verre feuilleté 10.10.4 — garde-corps en verre",
    metaDescription:
      "Verre feuilleté 10.10.4 (2 × 10 mm) pour garde-corps : grandes portées, hauteur 1,10 m, zones exposées. Composition, poids et prix au ml direct usine.",
    intro:
      "Deux verres de 10 mm et quatre films PVB : le 10.10.4 est notre épaisseur haute performance. Grandes portées entre fixations, hauteur 1,10 m, zones ventées ou usage intensif : quand le projet sort du standard, c'est lui qui prend le relais.",
    priceFrom: 360,
    caracteristiques: [
      { label: "Composition", value: "2 × 10 mm + 4 films PVB" },
      { label: "Épaisseur totale", value: "≈ 21,5 mm" },
      { label: "Poids", value: "≈ 51 kg/m²" },
      { label: "Finition", value: "Trempé-feuilleté, bords polis" },
    ],
    benefits: [
      { title: "Grandes portées", desc: "Espacez les fixations ou passez en hauteur 1,10 m sans compromis de rigidité." },
      { title: "Zones exposées", desc: "Vent, front de mer, usage collectif : la réserve de résistance qui rassure." },
      { title: "Rendu massif", desc: "Un chant de 21,5 mm poli : la présence visuelle du verre épais, très haut de gamme." },
    ],
    fixations: [
      { slug: "garde-corps-verre-sur-rail", name: "Verre sur rail", note: "Autoportant exigeant — 1,10 m, zones ventées" },
      { slug: "garde-corps-verre-avec-spider", name: "Verre avec spider", note: "Portées maximales entre rotules" },
      { slug: "garde-corps-verre-sur-pinces", name: "Verre sur pinces", note: "Possible — vérifier la capacité des pinces" },
    ],
    faq: [
      { q: "Que signifie 10.10.4 ?", a: "Deux faces de verre de 10 mm assemblées par quatre films PVB : environ 21,5 mm d'épaisseur totale, pour 51 kg/m². C'est l'épaisseur haute performance de la gamme garde-corps." },
      { q: "Quand choisir le 10.10.4 ?", a: "Dès que le projet sort du standard : hauteur 1,10 m sur rail, grandes portées entre spiders, zone très ventée ou front de mer, usage collectif. Nos conseillers valident le dimensionnement au devis." },
      { q: "Quel prix pour du 10.10.4 ?", a: "Comptez dès 360 €/ml en fourniture, découpe sur mesure incluse. Devis détaillé gratuit sous 24h." },
    ],
  },
];

export function getVerre(slug: string): VerreSpec | undefined {
  return verres.find((v) => v.slug === slug);
}
