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
  | { kind: "link"; label: string; href: string; highlight?: boolean }
  | {
      kind: "mega";
      label: string;
      summary: string;
      icon: IconName;
      leaves: NavLeaf[];
    };

export const mainNav: NavEntry[] = [
  { kind: "link", label: "Offre tout inclus", href: "/offre", highlight: true },
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
      {
        title: "Stratégie SEO",
        desc: "Résultats garantis par contrat",
        href: "/seo/strategie-seo",
        icon: "badge-check",
      },
    ],
  },
  {
    kind: "mega",
    label: "Publicité",
    summary: "Google, Meta, TikTok — des leads rentables",
    icon: "megaphone",
    leaves: [
      {
        title: "Google Ads",
        desc: "Search & Shopping rentables",
        href: "/ads/audit-google-ads",
        icon: "megaphone",
      },
      {
        title: "Publicité Meta",
        desc: "Facebook & Instagram",
        href: "/ads/meta-ads",
        icon: "users",
      },
      {
        title: "Publicité TikTok",
        desc: "Touchez une audience engagée",
        href: "/ads/tiktok-ads",
        icon: "sparkles",
      },
      {
        title: "Génération de leads",
        desc: "Un flux de leads qualifiés",
        href: "/ads/generation-de-leads",
        icon: "target",
      },
    ],
  },
  {
    kind: "mega",
    label: "Stratégie",
    summary: "Conseil & stratégie 360° sur tous vos canaux",
    icon: "trending-up",
    leaves: [
      {
        title: "Conseil stratégique",
        desc: "Un regard expert sur votre marketing",
        href: "/strategie/conseil-strategique",
        icon: "badge-check",
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
