/**
 * Central site configuration.
 *
 * Keeping brand, navigation and shared copy here means every future
 * landing page can pull from a single source of truth.
 */

export const site = {
  name: "Le Poulpe",
  legalName: "Agence Le Poulpe",
  tagline: "Votre partenaire digital 360°",
  description:
    "Le Poulpe est une agence web 360° : sites vitrines, landing pages qui convertissent, SEO, publicité en ligne et réseaux sociaux. Une équipe, une stratégie, des résultats.",
  url: "https://www.agencelepoulpe.fr",
  email: "contact@agencelepoulpe.fr",
  phone: "06 27 22 17 87",
  location: "France",
} as const;

/** Anchor navigation for the single landing page. */
export const nav = [
  { label: "Services", href: "#services" },
  { label: "Notre approche", href: "#approche" },
  { label: "Méthode", href: "#methode" },
  { label: "Avis", href: "#avis" },
  { label: "FAQ", href: "#faq" },
] as const;

export const stats = [
  { value: "+120", label: "projets livrés" },
  { value: "98%", label: "clients satisfaits" },
  { value: "×3", label: "trafic moyen généré" },
  { value: "360°", label: "d’expertise digitale" },
] as const;

export const process = [
  {
    step: "01",
    title: "Découverte",
    description:
      "On plonge dans votre univers : objectifs, cibles, concurrence. Tout commence par une vraie écoute.",
  },
  {
    step: "02",
    title: "Stratégie",
    description:
      "On construit une feuille de route sur-mesure et priorisée, pensée pour vos résultats business.",
  },
  {
    step: "03",
    title: "Création",
    description:
      "Design, contenus et développement : on déploie chaque tentacule avec exigence et rapidité.",
  },
  {
    step: "04",
    title: "Croissance",
    description:
      "On mesure, on optimise et on fait grandir votre présence digitale mois après mois.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "Notre nouvelle landing page convertit deux fois mieux que l’ancien site. L’équipe a tout compris du premier coup.",
    author: "Camille Renaud",
    role: "Fondatrice, Studio Maremma",
  },
  {
    quote:
      "Approche 360° très efficace : site, SEO et publicité enfin alignés. On a triplé nos demandes de devis.",
    author: "Thomas Bernard",
    role: "Dirigeant, Atelier B.",
  },
  {
    quote:
      "Réactifs, créatifs et transparents. Le Poulpe est devenu un vrai prolongement de notre équipe marketing.",
    author: "Sofia Marchetti",
    role: "Responsable marketing, Nuvola",
  },
] as const;

export const faq = [
  {
    question: "En combien de temps ma landing page est-elle en ligne ?",
    answer:
      "Pour une landing page, comptez en moyenne 1 à 2 semaines entre le brief et la mise en ligne. Un site vitrine complet demande généralement 3 à 5 semaines selon le périmètre.",
  },
  {
    question: "Que signifie « agence 360° » concrètement ?",
    answer:
      "Cela veut dire que nous couvrons l’ensemble de votre présence digitale : création de site, landing pages, référencement naturel (SEO), publicité (SEA), réseaux sociaux et maintenance. Un seul interlocuteur, une stratégie cohérente.",
  },
  {
    question: "Travaillez-vous avec des petites entreprises ?",
    answer:
      "Oui. De l’indépendant à la PME en croissance, nous adaptons le périmètre et le budget à votre stade. Chaque projet démarre par un échange gratuit pour cadrer vos priorités.",
  },
  {
    question: "Proposez-vous un suivi après la mise en ligne ?",
    answer:
      "Absolument. Maintenance, sécurité, mises à jour et optimisation continue : nous restons à vos côtés pour faire performer votre site dans la durée.",
  },
] as const;
