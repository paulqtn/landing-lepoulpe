import type { IconName } from "@/components/Icon";
import type { GeneratorConfig } from "@/lib/generator";
import type { Landing } from "@/lib/landings";

/* L'offre principale : site + croissance, tout inclus, en location,
   payée aux résultats. Page dédiée /offre. */

export type Offer = {
  meta: Landing["meta"];
  hero: Landing["hero"];
  proof: Landing["proof"];
  included: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { icon: IconName; title: string; desc: string }[];
  };
  rental: {
    eyebrow: string;
    title: string;
    intro: string;
    pillars: { icon: IconName; title: string; desc: string }[];
    note: string;
  };
  comparison: {
    eyebrow: string;
    title: string;
    columns: string[];
    rows: { label: string; values: (boolean | string)[] }[];
  };
  results: Landing["results"];
  process: Landing["process"];
  guarantee: Landing["guarantee"];
  testimonials: Landing["testimonials"];
  faq: Landing["faq"];
  generator: GeneratorConfig;
  finalCta: Landing["finalCta"];
};

const consent =
  "J’accepte d’être recontacté par Le Poulpe au sujet de mon projet. Pas de spam, jamais.";

export const offer: Offer = {
  meta: {
    title: "Site clé en main + croissance — tout inclus, payé aux résultats",
    description:
      "On crée votre site, on gère votre SEO, vos publicités et votre stratégie. Tout inclus, en location, payé aux résultats. Étudions votre projet gratuitement.",
  },
  hero: {
    badge: "Offre tout inclus · payée aux résultats",
    titleLead: "On construit, on gère et on",
    titleAccent: "propulse votre business",
    titleRest: ".",
    subtitle:
      "Site, SEO, publicité et stratégie : une équipe complète déploie toutes ses tentacules sur votre croissance. En location tout inclus, payée à vos résultats — sans gros budget de départ.",
    bullets: [
      "Un site sur-mesure, créé et hébergé pour vous",
      "SEO, publicité et stratégie gérés de A à Z",
      "Payé aux résultats, sans frais de création",
    ],
    ctaPrimary: "Étudier mon projet",
    ctaSecondary: "Comment ça marche",
  },
  proof: {
    rating: "4,9/5",
    ratingLabel: "150+ avis vérifiés",
    clients: "+80 business propulsés clé en main",
    logosLabel: "Ils nous ont confié toute leur croissance",
    logos: ["Vela", "Nuvola", "Brûlerie M.", "Kodial", "Maremma", "Atelier B."],
    stats: [
      { value: "×2,8", label: "de chiffre d’affaires moyen" },
      { value: "0 €", label: "de frais de création" },
      { value: "72h", label: "pour démarrer" },
      { value: "94%", label: "de clients qui restent" },
    ],
  },
  included: {
    eyebrow: "Tout inclus",
    title: "Une équipe marketing complète, un seul abonnement",
    intro:
      "On s’occupe de tout ce qui fait grandir votre business. Vous, vous gérez votre métier.",
    items: [
      { icon: "monitor", title: "Site sur-mesure", desc: "Conçu, développé et hébergé pour vous — pensé pour convertir." },
      { icon: "shield-check", title: "Hébergement & maintenance", desc: "Sécurité, mises à jour, performance : zéro souci technique." },
      { icon: "search", title: "Référencement (SEO)", desc: "Une visibilité durable sur Google, sans dépendre de la pub." },
      { icon: "megaphone", title: "Publicité (Google, Meta, TikTok)", desc: "Des campagnes pilotées au résultat sur les bons canaux." },
      { icon: "trending-up", title: "Stratégie & conseil", desc: "Un plan de croissance et un accompagnement continu." },
      { icon: "target", title: "Optimisation de l’offre", desc: "On affine votre offre et vos tunnels pour vendre plus." },
      { icon: "gauge", title: "Reporting transparent", desc: "Vos résultats suivis et expliqués chaque mois." },
      { icon: "users", title: "Un interlocuteur unique", desc: "Votre service marketing externalisé, dédié à vos résultats." },
    ],
  },
  rental: {
    eyebrow: "Le modèle",
    title: "Votre croissance en location, payée aux résultats",
    intro:
      "Pas de gros chèque pour un site qui dort. Un abonnement mensuel tout compris, aligné sur vos résultats.",
    pillars: [
      { icon: "euro", title: "Sans gros budget initial", desc: "On crée votre site sans frais de création à sortir. Vous démarrez léger." },
      { icon: "layers", title: "Tout dans un seul abonnement", desc: "Site, SEO, publicité et stratégie réunis. Un loyer mensuel, zéro surprise." },
      { icon: "trophy", title: "Indexé sur vos résultats", desc: "Notre rémunération est liée à votre croissance. On gagne quand vous gagnez." },
    ],
    note: "Le site et les services restent actifs pendant toute la durée de la location. Vous gardez vos leads et vos résultats, et vous restez libre.",
  },
  comparison: {
    eyebrow: "Pourquoi nous",
    title: "Le meilleur des deux mondes",
    columns: ["Le Poulpe", "Agence classique", "Freelance", "En interne"],
    rows: [
      { label: "Site créé & hébergé", values: [true, "€€ à l’avance", "ponctuel", false] },
      { label: "SEO + Publicité + Stratégie", values: [true, "à la carte", "1 expertise", "recrutement"] },
      { label: "Sans gros budget initial", values: [true, false, "variable", false] },
      { label: "Payé aux résultats", values: [true, false, false, false] },
      { label: "Un seul interlocuteur", values: [true, "variable", true, false] },
      { label: "Opérationnel en 72h", values: [true, "semaines", "variable", "mois"] },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des business qui décollent",
    intro: "On ne vend pas un site. On vend de la croissance.",
    cases: [
      { client: "Vela", sector: "Services", metric: "×2,9", metricLabel: "de chiffre d’affaires", detail: "Nouveau site, SEO et publicité réunis : un flux de clients régulier en moins de 6 mois.", duration: "en 6 mois" },
      { client: "Brûlerie M.", sector: "E-commerce", metric: "×3,4", metricLabel: "de ventes en ligne", detail: "Boutique refondue et acquisition multicanale pilotée au résultat. Sans frais de création.", duration: "en 5 mois" },
      { client: "Kodial", sector: "B2B", metric: "+38", metricLabel: "leads qualifiés / mois", detail: "De zéro présence digitale à une machine à leads prévisible, tout inclus.", duration: "en 4 mois" },
    ],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "De votre projet à votre croissance, en 4 étapes",
    steps: [
      { title: "On étudie votre projet", desc: "Audit gratuit de votre activité, votre marché et vos objectifs." },
      { title: "On construit votre machine", desc: "Site, offre et tunnels créés sur-mesure — sans frais de création." },
      { title: "On lance l’acquisition", desc: "SEO et publicité activés sur les bons canaux, en quelques jours." },
      { title: "On propulse & on optimise", desc: "On pilote vos résultats chaque mois et on accélère la croissance." },
    ],
  },
  guarantee: {
    badge: "Risque inversé",
    title: "On se rémunère sur vos résultats.",
    text: "Pas de frais de création, un abonnement aligné sur votre croissance, et un engagement souple. Notre intérêt, c’est que ça marche pour vous — sinon on n’a pas fait notre travail.",
    points: ["Sans frais de création", "Payé aux résultats", "Engagement souple", "Vous gardez vos leads"],
  },
  testimonials: [
    { quote: "Ils ont tout pris en main : site, pub, SEO. En 6 mois, on a presque triplé notre activité sans avancer un budget de création.", author: "Marc Vidal", role: "Gérant, Vela" },
    { quote: "Le modèle aux résultats a tout changé : ils sont aussi investis que nous. C’est un vrai partenaire de croissance.", author: "Inès Lacroix", role: "Fondatrice, Brûlerie M." },
    { quote: "Comme avoir un service marketing complet, sans le coût d’une équipe interne. Bluffant d’efficacité.", author: "Julien Faure", role: "CEO, Kodial" },
  ],
  faq: [
    { q: "Comment fonctionne le paiement aux résultats ?", a: "Pas de frais de création : vous réglez un abonnement mensuel tout compris, et notre rémunération est en partie indexée sur les résultats générés. Notre intérêt est aligné avec le vôtre." },
    { q: "Qu’est-ce que la « location » du site ?", a: "Plutôt que d’acheter un site (souvent plusieurs milliers d’euros), vous le louez : il est créé, hébergé et maintenu par nous, et reste actif pendant toute la durée de la collaboration." },
    { q: "À qui appartiennent mes leads et mes résultats ?", a: "Ils sont à vous, à 100%. Vous récupérez tous vos contacts et vos données en temps réel." },
    { q: "Et si je veux arrêter ?", a: "L’engagement est souple. On en discute en toute transparence dès le départ : pas de piège, pas de clause cachée." },
    { q: "Pour quel type d’entreprise ?", a: "Indépendants, TPE et PME ambitieuses qui veulent déléguer toute leur croissance digitale à une équipe experte, sans monter un service marketing en interne." },
  ],
  generator: {
    eyebrow: "Votre projet · 1 min",
    panelBadge: "Offre tout inclus",
    panelTitle: "Votre projet",
    recapTitle: "Récapitulatif",
    estimateLabel: "",
    estimateHint: "",
    estimate: "none",
    steps: [
      {
        kind: "single",
        id: "site",
        question: "Votre site aujourd’hui ?",
        recapLabel: "Projet",
        columns: 2,
        options: [
          { value: "aucun", label: "Je n’ai pas de site", icon: "sparkles" },
          { value: "refonte", label: "Un site à refondre", icon: "monitor" },
          { value: "peu", label: "Un site qui ne rapporte pas", icon: "trending-up" },
          { value: "ecommerce", label: "Une boutique en ligne", icon: "store" },
        ],
      },
      {
        kind: "single",
        id: "secteur",
        question: "Votre secteur d’activité ?",
        recapLabel: "Secteur",
        columns: 2,
        options: [
          { value: "services", label: "Services / B2B", icon: "building" },
          { value: "commerce", label: "Commerce / E-commerce", icon: "store" },
          { value: "local", label: "Activité locale", icon: "map-pin" },
          { value: "autre", label: "Autre", icon: "layers" },
        ],
      },
      {
        kind: "single",
        id: "ambition",
        question: "Votre ambition ?",
        recapLabel: "Ambition",
        columns: 2,
        options: [
          { value: "leads", label: "Plus de clients", icon: "target" },
          { value: "ca", label: "Augmenter mon CA", icon: "trending-up" },
          { value: "lancer", label: "Lancer mon activité", icon: "rocket" },
          { value: "dominer", label: "Dominer mon marché", icon: "trophy" },
        ],
      },
    ],
    guarantees: ["Sans frais de création", "Payé aux résultats", "Sans engagement long"],
    leadStep: {
      question: "Où vous envoyer votre proposition ?",
      help: "Un expert étudie votre projet et vous rappelle sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir ma proposition",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "On étudie votre projet et un expert vous rappelle sous 24h avec une proposition tout inclus sur-mesure.",
    successBullets: [
      "Étude gratuite de votre projet",
      "Proposition tout inclus sur-mesure",
      "Échange avec un expert croissance",
    ],
  },
  finalCta: {
    title: "Prêt à confier votre croissance à une équipe experte ?",
    subtitle:
      "Étude de projet gratuite. On vous rappelle sous 24h avec une proposition tout inclus, payée aux résultats.",
  },
};
