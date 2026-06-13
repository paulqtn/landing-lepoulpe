import type { IconName } from "@/components/Icon";

/* Navigation principale (méga-menu). Pour ajouter une sous-catégorie,
   ajoutez une "leaf" ; pour une grande catégorie, une entrée "mega". */

export type NavLeaf = {
  title: string;
  desc: string;
  href: string;
  icon: IconName;
};

export type NavEntry =
  | { kind: "link"; label: string; href: string }
  | {
      kind: "mega";
      label: string;
      summary: string;
      icon: IconName;
      leaves: NavLeaf[];
    };

export const mainNav: NavEntry[] = [
  {
    kind: "mega",
    label: "SEO",
    summary: "Référencement naturel — visibilité durable sur Google",
    icon: "search",
    leaves: [
      {
        title: "Audit SEO gratuit",
        desc: "Analysez votre visibilité sur Google",
        href: "/seo/audit-seo-gratuit",
        icon: "search",
      },
    ],
  },
  {
    kind: "mega",
    label: "Publicité (SEA)",
    summary: "Acquisition payante & génération de leads",
    icon: "megaphone",
    leaves: [
      {
        title: "Audit Google Ads",
        desc: "Arrêtez de gaspiller votre budget",
        href: "/sea/audit-sea-gratuit",
        icon: "megaphone",
      },
      {
        title: "Génération de leads",
        desc: "Un flux de leads qualifiés chaque mois",
        href: "/sea/generation-de-leads",
        icon: "target",
      },
    ],
  },
  { kind: "link", label: "L’agence", href: "/agence" },
];

/** Réassurance affichée dans le bandeau utilitaire. */
export const topBarPerks = [
  "Audit marketing offert",
  "Conseil sans engagement",
  "Réponse sous 24h",
];
