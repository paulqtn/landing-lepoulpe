import type { IconName } from "@/components/Icon";
import type { GeneratorConfig } from "@/lib/generator";

/* ================================================================== */
/*  Landing model — one entry per keyword/ad page                      */
/* ================================================================== */

export type LandingCategory = "seo" | "sea";

export type Landing = {
  slug: string;
  category: LandingCategory;
  categoryLabel: string;
  nav: { ctaLabel: string };
  meta: { title: string; description: string };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    titleRest?: string;
    subtitle: string;
    bullets: string[];
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  proof: {
    rating: string;
    ratingLabel: string;
    clients: string;
    logosLabel: string;
    logos: string[];
    stats: { value: string; label: string }[];
  };
  results: {
    eyebrow: string;
    title: string;
    intro: string;
    cases: {
      client: string;
      sector: string;
      metric: string;
      metricLabel: string;
      detail: string;
      duration: string;
    }[];
  };
  benefits: {
    eyebrow: string;
    title: string;
    intro?: string;
    items: { icon: IconName; title: string; desc: string }[];
  };
  guarantee: { badge: string; title: string; text: string; points: string[] };
  process: { eyebrow: string; title: string; steps: { title: string; desc: string }[] };
  testimonials: { quote: string; author: string; role: string }[];
  faq: { q: string; a: string }[];
  generator: GeneratorConfig;
  finalCta: { title: string; subtitle: string };
};

/* Shared snippets ------------------------------------------------- */

const consent =
  "J’accepte d’être recontacté par Le Poulpe au sujet de ma demande. Pas de spam, jamais.";

/* ================================================================== */
/*  1. SEO — Audit SEO gratuit (flagship)                              */
/* ================================================================== */

const auditSeoGratuit: Landing = {
  slug: "audit-seo-gratuit",
  category: "seo",
  categoryLabel: "SEO",
  nav: { ctaLabel: "Audit SEO gratuit" },
  meta: {
    title: "Audit SEO gratuit — analysez votre visibilité Google",
    description:
      "Recevez un audit SEO personnalisé et 100% gratuit de votre site : potentiel de trafic, mots-clés à fort impact et plan d’action priorisé. Réponse sous 24h.",
  },
  hero: {
    badge: "Audit SEO offert · résultats sous 24h",
    titleLead: "Votre site mérite la",
    titleAccent: "1ʳᵉ page de Google",
    titleRest: ".",
    subtitle:
      "Recevez un audit SEO complet et 100% gratuit : on identifie précisément pourquoi vous n’êtes pas (encore) en tête, et le plan d’action concret pour y arriver.",
    bullets: [
      "Analyse de votre visibilité actuelle sur Google",
      "Mots-clés à fort potentiel identifiés pour vous",
      "Plan d’action priorisé, prêt à exécuter",
    ],
    ctaPrimary: "Recevoir mon audit gratuit",
    ctaSecondary: "Voir des résultats clients",
  },
  proof: {
    rating: "4,9/5",
    ratingLabel: "120+ avis vérifiés",
    clients: "+250 entreprises accompagnées",
    logosLabel: "Ils ont boosté leur visibilité avec Le Poulpe",
    logos: ["Maremma", "Atelier B.", "Nuvola", "Kodial", "Brûlerie M.", "Vela"],
    stats: [
      { value: "+182%", label: "de trafic organique en moyenne" },
      { value: "Top 3", label: "sur les mots-clés ciblés" },
      { value: "×3,4", label: "de leads générés en 6 mois" },
      { value: "94%", label: "de clients qui renouvellent" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des positions gagnées, des leads en plus",
    intro:
      "Quelques résultats réels obtenus pour nos clients, dans des secteurs variés.",
    cases: [
      {
        client: "Studio Maremma",
        sector: "E-commerce déco",
        metric: "+182%",
        metricLabel: "de trafic organique",
        detail:
          "Refonte de l’arborescence et 24 pages optimisées : un trafic qui convertit, sans dépendre de la publicité.",
        duration: "en 6 mois",
      },
      {
        client: "Atelier B.",
        sector: "Artisanat · B2B",
        metric: "Top 3",
        metricLabel: "sur 18 mots-clés",
        detail:
          "Une stratégie de contenu ciblée qui place l’atelier devant ses concurrents sur ses requêtes les plus rentables.",
        duration: "en 4 mois",
      },
      {
        client: "Nuvola",
        sector: "SaaS",
        metric: "×3,4",
        metricLabel: "de leads entrants",
        detail:
          "Le SEO est devenu leur 1er canal d’acquisition, avec un coût par lead divisé par 5 face à la publicité.",
        duration: "en 8 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "Un audit qui va droit au but",
    intro:
      "Pas un rapport automatique de 40 pages illisible. Des constats clairs et des actions concrètes.",
    items: [
      {
        icon: "search",
        title: "Analyse de visibilité",
        desc: "Votre positionnement réel sur Google, vos mots-clés et ceux que vous laissez à vos concurrents.",
      },
      {
        icon: "gauge",
        title: "Score technique",
        desc: "Vitesse, mobile, indexation, Core Web Vitals : ce qui freine votre référencement.",
      },
      {
        icon: "target",
        title: "Mots-clés à fort potentiel",
        desc: "Les requêtes qui rapportent vraiment, classées par rapport effort / impact.",
      },
      {
        icon: "users",
        title: "Analyse concurrentielle",
        desc: "Pourquoi vos concurrents passent devant — et exactement comment les dépasser.",
      },
      {
        icon: "line-chart",
        title: "Plan d’action priorisé",
        desc: "Une feuille de route claire : quoi faire, dans quel ordre, pour quel gain.",
      },
      {
        icon: "badge-check",
        title: "Échange avec un expert",
        desc: "30 minutes avec un consultant SEO pour répondre à toutes vos questions.",
      },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Un audit gratuit, vraiment gratuit.",
    text: "Pas de carte bancaire, pas d’engagement, pas de discours commercial agressif. Vous repartez avec de la valeur exploitable, que l’on travaille ensemble ou non.",
    points: [
      "100% offert",
      "Sans engagement",
      "Données confidentielles",
      "Réponse sous 24h ouvrées",
    ],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre audit en 3 étapes simples",
    steps: [
      {
        title: "Vous remplissez le formulaire",
        desc: "1 minute, 3 questions. On récupère l’essentiel pour analyser votre site.",
      },
      {
        title: "On analyse votre site",
        desc: "Nos experts et nos outils passent votre visibilité au crible sous 24h.",
      },
      {
        title: "On vous rappelle",
        desc: "Vous recevez l’audit puis un échange pour prioriser les actions à fort impact.",
      },
    ],
  },
  testimonials: [
    {
      quote:
        "On se savait mal référencés, mais pas à quel point. L’audit a immédiatement montré les priorités. 6 mois plus tard, on est en 1ʳᵉ page.",
      author: "Camille Renaud",
      role: "Fondatrice, Studio Maremma",
    },
    {
      quote:
        "Audit ultra clair, zéro blabla. On a appliqué le plan, le trafic a suivi. Exactement ce qu’il nous fallait.",
      author: "Thomas Bernard",
      role: "Gérant, Atelier B.",
    },
    {
      quote:
        "Le SEO est devenu notre premier canal de leads. C’est le meilleur ROI de toutes nos actions marketing.",
      author: "Sofia Marchetti",
      role: "CMO, Nuvola",
    },
  ],
  faq: [
    {
      q: "L’audit est-il vraiment gratuit ?",
      a: "Oui, à 100%. Aucune carte bancaire, aucun engagement. C’est notre façon de démontrer notre valeur avant même de travailler ensemble.",
    },
    {
      q: "Combien de temps pour recevoir l’audit ?",
      a: "Sous 24h ouvrées. Vous recevez l’analyse par email, puis un expert vous rappelle pour en discuter.",
    },
    {
      q: "Que contient précisément l’audit ?",
      a: "Votre visibilité actuelle, vos mots-clés à potentiel, l’analyse technique de votre site, l’étude de vos concurrents et un plan d’action priorisé.",
    },
    {
      q: "Vais-je être harcelé commercialement ?",
      a: "Non. Un seul appel pour vous présenter l’audit. Vous décidez ensuite si vous souhaitez aller plus loin, sans aucune pression.",
    },
    {
      q: "Le SEO fonctionne-t-il dans mon secteur ?",
      a: "Dans la quasi-totalité des secteurs, oui. L’audit vous dira précisément quel est votre potentiel sur votre marché.",
    },
  ],
  generator: {
    eyebrow: "Diagnostic SEO · 1 min",
    panelBadge: "Audit 100% offert",
    panelTitle: "Votre audit SEO",
    recapTitle: "Récapitulatif",
    estimateLabel: "Potentiel estimé",
    estimateHint: "Répondez aux questions pour estimer votre potentiel de trafic.",
    estimate: "seo",
    steps: [
      {
        kind: "input",
        id: "site",
        question: "Quel site souhaitez-vous auditer ?",
        help: "On analyse votre visibilité actuelle sur Google.",
        recapLabel: "Site",
        inputType: "text",
        prefix: "https://",
        placeholder: "monsite.fr",
      },
      {
        kind: "single",
        id: "objectif",
        question: "Quel est votre objectif n°1 ?",
        help: "Pour prioriser les bonnes recommandations.",
        recapLabel: "Objectif",
        columns: 2,
        options: [
          { value: "trafic", label: "Plus de trafic", desc: "Être visible sur Google", icon: "trending-up" },
          { value: "leads", label: "Plus de leads", desc: "Générer des contacts", icon: "target" },
          { value: "ventes", label: "Plus de ventes", desc: "E-commerce / conversions", icon: "euro" },
          { value: "local", label: "Visibilité locale", desc: "Des clients près de chez moi", icon: "map-pin" },
        ],
      },
      {
        kind: "single",
        id: "trafic",
        question: "Votre trafic mensuel actuel ?",
        help: "Une estimation suffit, on affine ensuite.",
        recapLabel: "Trafic actuel",
        columns: 2,
        options: [
          { value: "lt1k", label: "Moins de 1 000 visiteurs", weight: 500 },
          { value: "1k5k", label: "1 000 à 5 000", weight: 3000 },
          { value: "5k20k", label: "5 000 à 20 000", weight: 12000 },
          { value: "gt20k", label: "Plus de 20 000", weight: 30000 },
        ],
      },
    ],
    guarantees: ["Audit 100% gratuit", "Sans engagement", "Réponse sous 24h ouvrées"],
    leadStep: {
      question: "Où envoyer votre audit SEO ?",
      help: "Vous le recevez par email, et un expert vous rappelle sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir mon audit gratuit",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Votre audit SEO personnalisé arrive dans votre boîte mail. Un expert vous rappelle sous 24h pour en discuter.",
    successBullets: [
      "Audit détaillé de votre visibilité",
      "Plan d’action priorisé",
      "Échange avec un expert SEO",
    ],
  },
  finalCta: {
    title: "Et si vous arrêtiez de laisser vos clients à vos concurrents ?",
    subtitle:
      "Recevez votre audit SEO gratuit et découvrez votre potentiel de trafic dès aujourd’hui.",
  },
};

/* ================================================================== */
/*  2. SEA — Audit SEA gratuit                                         */
/* ================================================================== */

const auditSeaGratuit: Landing = {
  slug: "audit-sea-gratuit",
  category: "sea",
  categoryLabel: "SEA",
  nav: { ctaLabel: "Audit SEA gratuit" },
  meta: {
    title: "Audit Google Ads gratuit — arrêtez de gaspiller votre budget",
    description:
      "Audit SEA gratuit de vos campagnes : on identifie les euros gaspillés et les leviers pour baisser votre coût par lead. Réponse sous 24h, sans engagement.",
  },
  hero: {
    badge: "Audit Google Ads offert · sans engagement",
    titleLead: "Vos campagnes Ads",
    titleAccent: "brûlent-elles votre budget",
    titleRest: "?",
    subtitle:
      "Recevez un audit gratuit de vos campagnes (ou de votre potentiel). On repère les euros gaspillés et les leviers concrets pour faire baisser votre coût par lead.",
    bullets: [
      "Analyse de vos campagnes actuelles",
      "Estimation de votre coût par lead",
      "Plan d’optimisation concret et chiffré",
    ],
    ctaPrimary: "Auditer mes campagnes",
    ctaSecondary: "Voir des résultats",
  },
  proof: {
    rating: "4,8/5",
    ratingLabel: "110+ avis vérifiés",
    clients: "+180 annonceurs accompagnés",
    logosLabel: "Ils pilotent leur acquisition avec Le Poulpe",
    logos: ["Kodial", "Brûlerie M.", "Vela", "Nuvola", "Maremma", "Atelier B."],
    stats: [
      { value: "−38%", label: "de coût par lead en moyenne" },
      { value: "×2,7", label: "de conversions à budget égal" },
      { value: "+410", label: "leads générés / mois" },
      { value: "4,8/5", label: "de satisfaction client" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Plus de leads, pour moins cher",
    intro: "Des campagnes restructurées et pilotées au résultat.",
    cases: [
      {
        client: "Kodial",
        sector: "B2B · SaaS",
        metric: "−52%",
        metricLabel: "de coût par lead",
        detail:
          "Restructuration des campagnes et tracking propre : moitié moins cher pour deux fois plus de leads qualifiés.",
        duration: "en 3 mois",
      },
      {
        client: "Brûlerie M.",
        sector: "E-commerce",
        metric: "×3,1",
        metricLabel: "de ventes via Ads",
        detail:
          "ROAS passé de 1,8 à 5,4 grâce à une refonte des audiences, des annonces et du flux produit.",
        duration: "en 5 mois",
      },
      {
        client: "Vela",
        sector: "Services",
        metric: "+340",
        metricLabel: "leads / mois",
        detail:
          "Une machine à leads prévisible, pilotée au coût par acquisition cible, mois après mois.",
        duration: "en 6 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "Un audit Ads sans complaisance",
    intro:
      "On vous montre concrètement où part votre budget — et comment en tirer beaucoup plus.",
    items: [
      { icon: "megaphone", title: "Audit de vos campagnes", desc: "Structure, enchères, ciblage : ce qui marche et ce qui gaspille." },
      { icon: "euro", title: "Analyse du coût par lead", desc: "Combien vous coûte réellement un client, et comment le réduire." },
      { icon: "click", title: "Qualité des annonces", desc: "Quality Score, extensions, A/B tests : vos annonces passées au crible." },
      { icon: "target", title: "Ciblage & audiences", desc: "Touchez les bonnes personnes au bon moment, sans gaspiller d’impressions." },
      { icon: "gauge", title: "Tracking & conversions", desc: "Mesurez ce qui compte vraiment et arrêtez de piloter à l’aveugle." },
      { icon: "line-chart", title: "Plan d’optimisation", desc: "Les actions prioritaires pour plus de leads à budget constant." },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Un audit Ads offert, sans engagement.",
    text: "On vous montre précisément où part votre budget et ce que l’on peut améliorer. Aucune obligation de travailler ensemble ensuite.",
    points: ["100% offert", "Sans engagement", "Analyse confidentielle", "Réponse sous 24h"],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre audit Ads en 3 étapes",
    steps: [
      { title: "Vous décrivez votre situation", desc: "1 minute pour cadrer votre budget et vos objectifs." },
      { title: "On audite votre potentiel", desc: "Nos experts Google Ads analysent vos campagnes ou votre marché." },
      { title: "On vous rappelle", desc: "Audit + plan d’optimisation pour faire baisser votre coût par lead." },
    ],
  },
  testimonials: [
    { quote: "On gaspillait la moitié de notre budget sans le savoir. L’audit a tout changé : deux fois plus de leads, pour moins cher.", author: "Julien Faure", role: "CEO, Kodial" },
    { quote: "Enfin des campagnes pilotées au résultat. Le ROAS a triplé en quelques mois.", author: "Inès Lacroix", role: "E-commerce, Brûlerie M." },
    { quote: "Un flux de leads régulier et prévisible. On peut enfin planifier notre croissance.", author: "Marc Vidal", role: "Gérant, Vela" },
  ],
  faq: [
    { q: "L’audit Ads est-il gratuit ?", a: "Oui, totalement. Aucune carte bancaire ni engagement. Vous repartez avec des recommandations concrètes." },
    { q: "Je n’ai pas encore de campagnes, c’est possible ?", a: "Absolument. On estime alors votre potentiel : budget conseillé, coût par lead réaliste et volume attendu sur votre marché." },
    { q: "Sous quel délai ai-je un retour ?", a: "Sous 24h ouvrées. Un expert Google Ads vous rappelle pour vous présenter l’analyse." },
    { q: "Travaillez-vous Google et Meta ?", a: "Oui : Google Ads, Meta (Facebook/Instagram) et LinkedIn Ads selon votre cible et vos objectifs." },
    { q: "Quel budget minimum conseillez-vous ?", a: "Cela dépend de votre secteur et de votre coût par lead. L’audit vous donne une recommandation précise et honnête." },
  ],
  generator: {
    eyebrow: "Diagnostic Google Ads · 1 min",
    panelBadge: "Audit Ads offert",
    panelTitle: "Votre audit SEA",
    recapTitle: "Récapitulatif",
    estimateLabel: "Potentiel estimé",
    estimateHint: "Indiquez votre budget pour estimer votre volume de leads.",
    estimate: "sea",
    steps: [
      {
        kind: "single",
        id: "budget",
        question: "Votre budget publicitaire mensuel ?",
        help: "Investissement média, hors honoraires.",
        recapLabel: "Budget / mois",
        columns: 2,
        options: [
          { value: "b500", label: "Moins de 1 000 €", weight: 500 },
          { value: "b1k", label: "1 000 à 3 000 €", weight: 2000 },
          { value: "b3k", label: "3 000 à 8 000 €", weight: 5000 },
          { value: "b8k", label: "Plus de 8 000 €", weight: 10000 },
        ],
      },
      {
        kind: "single",
        id: "objectif",
        question: "Votre objectif principal ?",
        recapLabel: "Objectif",
        columns: 2,
        options: [
          { value: "leads", label: "Générer des leads", desc: "Formulaires, demandes de devis", icon: "target" },
          { value: "calls", label: "Recevoir des appels", desc: "Contacts téléphoniques", icon: "phone" },
          { value: "ventes", label: "Vendre en ligne", desc: "E-commerce / ROAS", icon: "euro" },
          { value: "notoriete", label: "Gagner en notoriété", desc: "Visibilité de marque", icon: "megaphone" },
        ],
      },
      {
        kind: "single",
        id: "plateforme",
        question: "Sur quelles plateformes ?",
        recapLabel: "Plateformes",
        columns: 2,
        options: [
          { value: "google", label: "Google Ads", icon: "search" },
          { value: "meta", label: "Meta (Facebook/Insta)", icon: "users" },
          { value: "linkedin", label: "LinkedIn Ads", icon: "building" },
          { value: "unsure", label: "Je ne sais pas encore", icon: "sparkles" },
        ],
      },
    ],
    guarantees: ["Audit 100% gratuit", "Sans engagement", "Réponse sous 24h"],
    leadStep: {
      question: "Où envoyer votre audit Ads ?",
      help: "Analyse par email + un expert vous rappelle sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir mon audit SEA",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Votre audit Google Ads arrive par email. Un expert vous rappelle sous 24h pour vous présenter le plan d’optimisation.",
    successBullets: [
      "Audit de votre potentiel publicitaire",
      "Estimation de votre coût par lead",
      "Plan d’optimisation chiffré",
    ],
  },
  finalCta: {
    title: "Arrêtez de gaspiller votre budget publicitaire.",
    subtitle:
      "Recevez un audit SEA gratuit et découvrez combien vous pourriez économiser dès ce mois-ci.",
  },
};

/* ================================================================== */
/*  3. SEA — Génération de leads                                       */
/* ================================================================== */

const generationDeLeads: Landing = {
  slug: "generation-de-leads",
  category: "sea",
  categoryLabel: "SEA",
  nav: { ctaLabel: "Générer des leads" },
  meta: {
    title: "Génération de leads — un flux de contacts qualifiés chaque mois",
    description:
      "On construit votre machine à leads : publicité, landing pages et suivi. Des contacts qualifiés, un coût par lead maîtrisé. Estimez votre potentiel gratuitement.",
  },
  hero: {
    badge: "Stratégie d’acquisition · sans engagement",
    titleLead: "Un flux de",
    titleAccent: "leads qualifiés",
    titleRest: ", chaque mois.",
    subtitle:
      "On construit votre machine à leads de A à Z : publicité, landing pages et suivi. Vous recevez des contacts qualifiés, pas seulement des clics.",
    bullets: [
      "Des leads qualifiés, pas du trafic vide",
      "Un coût par lead maîtrisé et prévisible",
      "Des landing pages pensées pour convertir",
    ],
    ctaPrimary: "Estimer mes leads",
    ctaSecondary: "Voir des résultats",
  },
  proof: {
    rating: "4,9/5",
    ratingLabel: "130+ avis vérifiés",
    clients: "+200 entreprises accompagnées",
    logosLabel: "Ils génèrent leurs leads avec Le Poulpe",
    logos: ["Vela", "Kodial", "Nuvola", "Maremma", "Brûlerie M.", "Atelier B."],
    stats: [
      { value: "+410", label: "leads qualifiés / mois" },
      { value: "−38%", label: "de coût par lead" },
      { value: "×3,4", label: "de taux de conversion" },
      { value: "72h", label: "pour lancer vos campagnes" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des machines à leads qui tournent",
    intro: "Acquisition prévisible, pilotée au coût par lead.",
    cases: [
      {
        client: "Vela",
        sector: "Services",
        metric: "+340",
        metricLabel: "leads / mois",
        detail:
          "Tunnel complet — publicité + landing pages dédiées — pour un flux de demandes régulier et prévisible.",
        duration: "en 6 mois",
      },
      {
        client: "Kodial",
        sector: "B2B · SaaS",
        metric: "−52%",
        metricLabel: "de coût par lead",
        detail:
          "Des landing pages par mot-clé et un suivi rigoureux : deux fois plus de leads pour le même budget.",
        duration: "en 3 mois",
      },
      {
        client: "Nuvola",
        sector: "SaaS",
        metric: "×3,4",
        metricLabel: "de taux de conversion",
        detail:
          "Une page par intention de recherche : le bon message, pour la bonne personne, au bon moment.",
        duration: "en 4 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "Une machine à leads complète",
    intro: "De la première impression publicitaire au contact dans votre CRM.",
    items: [
      { icon: "megaphone", title: "Campagnes qui ciblent juste", desc: "On va chercher les personnes en intention d’achat, là où elles sont." },
      { icon: "rocket", title: "Landing pages qui convertissent", desc: "Une page par intention : message, preuve et appel à l’action alignés." },
      { icon: "target", title: "Des leads qualifiés", desc: "On qualifie en amont pour ne vous transmettre que des contacts pertinents." },
      { icon: "euro", title: "Coût par lead maîtrisé", desc: "Un budget piloté à la performance, optimisé semaine après semaine." },
      { icon: "gauge", title: "Tracking de bout en bout", desc: "Chaque euro est suivi, du clic au lead, pour des décisions fondées sur la donnée." },
      { icon: "badge-check", title: "Optimisation continue", desc: "On itère en permanence pour faire baisser le coût et monter la qualité." },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Vous estimez votre potentiel, gratuitement.",
    text: "On vous donne une estimation honnête du volume de leads et du coût par lead atteignables sur votre marché — avant tout engagement.",
    points: ["Estimation gratuite", "Sans engagement", "Données confidentielles", "Réponse sous 24h"],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre machine à leads en 3 étapes",
    steps: [
      { title: "On cadre votre objectif", desc: "Budget, cible et volume de leads visé : on définit le plan." },
      { title: "On lance l’acquisition", desc: "Campagnes + landing pages dédiées, en ligne sous 72h." },
      { title: "On optimise en continu", desc: "On pilote au coût par lead et on améliore les résultats chaque semaine." },
    ],
  },
  testimonials: [
    { quote: "On a enfin un flux de leads régulier. Plus de creux, plus de stress : on sait combien on investit et ce que ça rapporte.", author: "Marc Vidal", role: "Gérant, Vela" },
    { quote: "Les landing pages par mot-clé ont fait exploser nos conversions. Le bon message au bon moment, ça change tout.", author: "Sofia Marchetti", role: "CMO, Nuvola" },
    { quote: "Coût par lead divisé par deux en trois mois. L’approche orientée données fait toute la différence.", author: "Julien Faure", role: "CEO, Kodial" },
  ],
  faq: [
    { q: "Qu’appelez-vous un lead « qualifié » ?", a: "Un contact qui correspond à votre cible et qui a manifesté une intention concrète (devis, démo, appel). On qualifie en amont pour vous éviter de perdre du temps." },
    { q: "Sous quel délai puis-je avoir des leads ?", a: "Les campagnes sont généralement en ligne sous 72h. Les premiers leads arrivent dans les jours qui suivent le lancement." },
    { q: "Qui s’occupe des landing pages ?", a: "Nous. On crée une page par intention de recherche, optimisée pour la conversion — c’est notre spécialité." },
    { q: "Les leads m’appartiennent-ils ?", a: "Évidemment. Tous les contacts sont à vous, transmis en temps réel par email ou directement dans votre CRM." },
    { q: "Y a-t-il un engagement de durée ?", a: "On commence par estimer votre potentiel gratuitement. Ensuite, on privilégie des collaborations souples, sans engagement long imposé." },
  ],
  generator: {
    eyebrow: "Estimation de leads · 1 min",
    panelBadge: "Estimation offerte",
    panelTitle: "Votre potentiel",
    recapTitle: "Récapitulatif",
    estimateLabel: "Leads estimés",
    estimateHint: "Indiquez votre budget pour estimer votre volume de leads.",
    estimate: "sea",
    steps: [
      {
        kind: "single",
        id: "budget",
        question: "Quel budget mensuel envisagez-vous ?",
        help: "Investissement média, hors honoraires.",
        recapLabel: "Budget / mois",
        columns: 2,
        options: [
          { value: "b500", label: "Moins de 1 000 €", weight: 500 },
          { value: "b1k", label: "1 000 à 3 000 €", weight: 2000 },
          { value: "b3k", label: "3 000 à 8 000 €", weight: 5000 },
          { value: "b8k", label: "Plus de 8 000 €", weight: 10000 },
        ],
      },
      {
        kind: "single",
        id: "secteur",
        question: "Dans quel secteur évoluez-vous ?",
        recapLabel: "Secteur",
        columns: 2,
        options: [
          { value: "ecommerce", label: "E-commerce", icon: "store" },
          { value: "b2b", label: "Services B2B", icon: "building" },
          { value: "local", label: "Commerce local", icon: "map-pin" },
          { value: "autre", label: "Autre", icon: "layers" },
        ],
      },
      {
        kind: "single",
        id: "delai",
        question: "Sous quel délai voulez-vous des résultats ?",
        recapLabel: "Délai",
        columns: 2,
        options: [
          { value: "asap", label: "Le plus vite possible", icon: "rocket" },
          { value: "1-3m", label: "Dans 1 à 3 mois", icon: "clock" },
          { value: "flex", label: "Je suis flexible", icon: "sparkles" },
        ],
      },
    ],
    guarantees: ["Estimation 100% gratuite", "Sans engagement", "Réponse sous 24h"],
    leadStep: {
      question: "Où envoyer votre estimation ?",
      help: "Estimation détaillée par email + un échange avec un expert sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir mon estimation",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Votre estimation personnalisée arrive par email. Un expert acquisition vous rappelle sous 24h.",
    successBullets: [
      "Estimation de votre volume de leads",
      "Coût par lead réaliste sur votre marché",
      "Plan d’acquisition sur-mesure",
    ],
  },
  finalCta: {
    title: "Prêt à recevoir des leads qualifiés chaque mois ?",
    subtitle:
      "Estimez gratuitement votre volume de leads et votre coût par lead sur votre marché.",
  },
};

/* ================================================================== */
/*  Registry                                                           */
/* ================================================================== */

export const landings: Landing[] = [
  auditSeoGratuit,
  auditSeaGratuit,
  generationDeLeads,
];

export function getLanding(
  category: string,
  slug: string,
): Landing | undefined {
  return landings.find((l) => l.category === category && l.slug === slug);
}

export const categoryMeta: Record<
  LandingCategory,
  { label: string; title: string; description: string }
> = {
  seo: {
    label: "SEO",
    title: "Référencement naturel",
    description: "Gagnez en visibilité sur Google, durablement.",
  },
  sea: {
    label: "SEA",
    title: "Publicité & acquisition",
    description: "Générez des leads rentables, dès maintenant.",
  },
};
