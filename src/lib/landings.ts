import type { IconName } from "@/components/Icon";
import type { GeneratorConfig } from "@/lib/generator";

/* ================================================================== */
/*  Landing model — one entry per keyword/ad page                      */
/* ================================================================== */

export type LandingCategory = "seo" | "ads" | "strategie";

export type Landing = {
  slug: string;
  category: LandingCategory;
  categoryLabel: string;
  /** Render the guarantee section high on the page (just after proof). */
  guaranteeFeatured?: boolean;
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

const auditGoogleAds: Landing = {
  slug: "audit-google-ads",
  category: "ads",
  categoryLabel: "Publicité",
  nav: { ctaLabel: "Audit Google Ads" },
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
  category: "ads",
  categoryLabel: "Publicité",
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
/*  4. Publicité — Meta Ads (Facebook & Instagram)                     */
/* ================================================================== */

const metaAds: Landing = {
  slug: "meta-ads",
  category: "ads",
  categoryLabel: "Publicité",
  nav: { ctaLabel: "Publicité Meta" },
  meta: {
    title: "Publicité Meta (Facebook & Instagram) — leads et ventes rentables",
    description:
      "Des campagnes Facebook & Instagram créatives et pilotées au résultat : plus de leads, plus de ventes, un coût d’acquisition maîtrisé. Audit gratuit sous 24h.",
  },
  hero: {
    badge: "Audit Meta Ads offert · sans engagement",
    titleLead: "Transformez Facebook & Instagram en",
    titleAccent: "machine à clients",
    titleRest: ".",
    subtitle:
      "Des campagnes Meta qui captent l’attention et génèrent du business — pas seulement des likes. Créa, ciblage et tracking au service de vos ventes.",
    bullets: [
      "Des créas qui arrêtent le scroll",
      "Un ciblage précis de vos clients",
      "Un coût par lead optimisé",
    ],
    ctaPrimary: "Auditer mes campagnes Meta",
    ctaSecondary: "Voir des résultats",
  },
  proof: {
    rating: "4,8/5",
    ratingLabel: "115+ avis vérifiés",
    clients: "+170 annonceurs Meta accompagnés",
    logosLabel: "Ils scalent sur Meta avec Le Poulpe",
    logos: ["Brûlerie M.", "Vela", "Nuvola", "Kodial", "Maremma", "Atelier B."],
    stats: [
      { value: "−41%", label: "de coût par lead" },
      { value: "×3,2", label: "de ROAS moyen" },
      { value: "+520", label: "leads générés / mois" },
      { value: "4,8/5", label: "de satisfaction" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des campagnes Meta qui rapportent",
    intro: "Créa, audiences et tunnel alignés sur la conversion.",
    cases: [
      {
        client: "Brûlerie M.",
        sector: "E-commerce",
        metric: "×4,1",
        metricLabel: "de ROAS",
        detail:
          "Refonte créative et structuration des campagnes : un ROAS multiplié par plus de 4 en pleine saison.",
        duration: "en 4 mois",
      },
      {
        client: "Vela",
        sector: "Services",
        metric: "−47%",
        metricLabel: "de coût par lead",
        detail:
          "Tunnel de capture et retargeting : deux fois plus de leads qualifiés pour le même budget.",
        duration: "en 3 mois",
      },
      {
        client: "Nuvola",
        sector: "SaaS",
        metric: "+610",
        metricLabel: "leads / mois",
        detail:
          "Des audiences lookalike précises et une créa testée en continu pour un flux régulier de leads.",
        duration: "en 6 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "La publicité Meta, de A à Z",
    intro: "On gère tout : de l’idée créative à l’optimisation au quotidien.",
    items: [
      { icon: "sparkles", title: "Créa qui scrolle-stoppe", desc: "Visuels et vidéos pensés pour capter l’attention dans le feed." },
      { icon: "target", title: "Ciblage & audiences", desc: "Lookalike, intérêts, retargeting : on touche les bonnes personnes." },
      { icon: "click", title: "Tunnel de conversion", desc: "Des pages et formulaires pensés pour transformer le clic en lead." },
      { icon: "gauge", title: "Tracking Pixel & CAPI", desc: "Une mesure fiable malgré iOS, pour optimiser sur la vraie donnée." },
      { icon: "euro", title: "Pilotage au ROAS", desc: "Chaque euro investi est suivi et optimisé pour le retour." },
      { icon: "line-chart", title: "Tests & itérations", desc: "On teste en continu créas et audiences pour faire baisser le coût." },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Un audit Meta offert, sans engagement.",
    text: "On analyse vos campagnes (ou votre potentiel) et on vous montre concrètement comment générer plus de résultats. Aucune obligation ensuite.",
    points: ["100% offert", "Sans engagement", "Analyse confidentielle", "Réponse sous 24h"],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre audit Meta en 3 étapes",
    steps: [
      { title: "Vous décrivez votre situation", desc: "1 minute pour cadrer votre budget et vos objectifs." },
      { title: "On audite votre potentiel", desc: "Nos experts Meta analysent vos campagnes ou votre marché." },
      { title: "On vous rappelle", desc: "Audit + plan d’action pour scaler vos résultats." },
    ],
  },
  testimonials: [
    { quote: "Nos pubs Insta tournaient sans vraie stratégie. En 3 mois, le coût par lead a chuté de moitié.", author: "Inès Lacroix", role: "E-commerce, Brûlerie M." },
    { quote: "Enfin une agence qui comprend la créa ET la donnée. Le ROAS a explosé.", author: "Marc Vidal", role: "Gérant, Vela" },
    { quote: "Un flux de leads régulier et qualifié via Meta. On a pu accélérer sereinement.", author: "Sofia Marchetti", role: "CMO, Nuvola" },
  ],
  faq: [
    { q: "L’audit Meta est-il gratuit ?", a: "Oui, à 100% et sans engagement. Vous repartez avec des recommandations concrètes, que l’on travaille ensemble ou non." },
    { q: "Gérez-vous aussi la création des visuels ?", a: "Oui. Visuels, vidéos et messages : on conçoit des créas natives pensées pour la performance." },
    { q: "Je débute sur Meta, c’est adapté ?", a: "Tout à fait. On estime votre potentiel, on définit le budget de départ et on lance proprement, tracking inclus." },
    { q: "Comment gérez-vous le tracking depuis iOS 14 ?", a: "Via le Pixel et l’API Conversions (CAPI), pour une mesure fiable et une optimisation sur la vraie donnée." },
  ],
  generator: {
    eyebrow: "Diagnostic Meta Ads · 1 min",
    panelBadge: "Audit Meta offert",
    panelTitle: "Votre audit Meta",
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
          { value: "leads", label: "Générer des leads", desc: "Formulaires, devis", icon: "target" },
          { value: "ventes", label: "Vendre en ligne", desc: "E-commerce / ROAS", icon: "euro" },
          { value: "trafic", label: "Trafic & notoriété", desc: "Faire connaître ma marque", icon: "megaphone" },
          { value: "messages", label: "Conversations", desc: "Messenger / Instagram", icon: "users" },
        ],
      },
      {
        kind: "single",
        id: "actif",
        question: "Avez-vous déjà des campagnes Meta ?",
        recapLabel: "Situation",
        columns: 2,
        options: [
          { value: "oui", label: "Oui, actives", icon: "check" },
          { value: "pause", label: "En pause", icon: "clock" },
          { value: "non", label: "Pas encore", icon: "sparkles" },
          { value: "autre", label: "Via une autre agence", icon: "users" },
        ],
      },
    ],
    guarantees: ["Audit 100% gratuit", "Sans engagement", "Réponse sous 24h"],
    leadStep: {
      question: "Où envoyer votre audit Meta ?",
      help: "Analyse par email + un expert vous rappelle sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir mon audit Meta",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Votre audit Meta Ads arrive par email. Un expert vous rappelle sous 24h pour vous présenter le plan d’action.",
    successBullets: [
      "Audit de votre potentiel Meta",
      "Estimation de votre coût par lead",
      "Plan d’action créa & ciblage",
    ],
  },
  finalCta: {
    title: "Prêt à scaler sur Facebook & Instagram ?",
    subtitle:
      "Recevez un audit Meta gratuit et découvrez votre potentiel de leads et de ventes.",
  },
};

/* ================================================================== */
/*  5. Publicité — TikTok Ads                                          */
/* ================================================================== */

const tiktokAds: Landing = {
  slug: "tiktok-ads",
  category: "ads",
  categoryLabel: "Publicité",
  nav: { ctaLabel: "Publicité TikTok" },
  meta: {
    title: "Publicité TikTok Ads — captez l’attention et vendez",
    description:
      "Des campagnes TikTok natives qui captent une audience engagée et qui convertissent. Audit gratuit de votre potentiel sous 24h, sans engagement.",
  },
  hero: {
    badge: "Audit TikTok Ads offert · sans engagement",
    titleLead: "Captez l’attention et",
    titleAccent: "vendez sur TikTok",
    titleRest: ".",
    subtitle:
      "On crée des campagnes TikTok natives qui surfent sur les tendances, captent une audience massive et engagée — et la transforment en clients.",
    bullets: [
      "Des contenus natifs qui performent",
      "Une audience massive et engagée",
      "Un coût d’acquisition compétitif",
    ],
    ctaPrimary: "Auditer mon potentiel TikTok",
    ctaSecondary: "Voir des résultats",
  },
  proof: {
    rating: "4,8/5",
    ratingLabel: "90+ avis vérifiés",
    clients: "+90 marques lancées sur TikTok",
    logosLabel: "Ils cartonnent sur TikTok avec Le Poulpe",
    logos: ["Maremma", "Brûlerie M.", "Vela", "Nuvola", "Kodial", "Atelier B."],
    stats: [
      { value: "×5,3", label: "de portée vs autres réseaux" },
      { value: "−34%", label: "de coût d’acquisition" },
      { value: "+1,2M", label: "de vues générées" },
      { value: "4,8/5", label: "de satisfaction" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Du buzz qui se transforme en ventes",
    intro: "Des campagnes pensées pour la conversion, pas juste pour les vues.",
    cases: [
      {
        client: "Maremma",
        sector: "E-commerce déco",
        metric: "×3,8",
        metricLabel: "de ventes TikTok",
        detail:
          "Une série de vidéos UGC et des Spark Ads qui ont fait décoller les ventes auprès d’une audience jeune.",
        duration: "en 3 mois",
      },
      {
        client: "Brûlerie M.",
        sector: "E-commerce",
        metric: "−38%",
        metricLabel: "de coût d’acquisition",
        detail:
          "Format natif et tendances exploitées au bon moment pour un coût d’acquisition imbattable.",
        duration: "en 2 mois",
      },
      {
        client: "Vela",
        sector: "Services",
        metric: "+1,4M",
        metricLabel: "de vues qualifiées",
        detail:
          "Une mécanique de contenu virale, convertie en leads via un tunnel dédié.",
        duration: "en 5 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "TikTok Ads, fait comme il faut",
    intro: "Le bon contenu, le bon format, au bon moment.",
    items: [
      { icon: "sparkles", title: "Créa native & UGC", desc: "Des vidéos pensées pour TikTok, pas des pubs recyclées." },
      { icon: "trending-up", title: "Surf sur les tendances", desc: "On exploite sons et formats qui marchent, au bon timing." },
      { icon: "target", title: "Ciblage précis", desc: "On touche votre audience idéale au sein d’un réseau massif." },
      { icon: "zap", title: "Spark Ads", desc: "On amplifie les contenus organiques qui performent déjà." },
      { icon: "gauge", title: "Tracking & pixel", desc: "Une mesure fiable pour optimiser sur la conversion réelle." },
      { icon: "line-chart", title: "Optimisation continue", desc: "On itère vite pour faire baisser le coût d’acquisition." },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Un audit TikTok offert, sans engagement.",
    text: "On évalue votre potentiel sur TikTok et on vous montre comment en faire un vrai canal d’acquisition. Aucune obligation ensuite.",
    points: ["100% offert", "Sans engagement", "Analyse confidentielle", "Réponse sous 24h"],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre audit TikTok en 3 étapes",
    steps: [
      { title: "Vous décrivez votre projet", desc: "1 minute pour cadrer votre marque et vos objectifs." },
      { title: "On évalue votre potentiel", desc: "Nos experts TikTok analysent votre marché et vos concurrents." },
      { title: "On vous rappelle", desc: "Audit + idées de contenus pour lancer ou scaler." },
    ],
  },
  testimonials: [
    { quote: "On pensait que TikTok n’était pas pour nous. Résultat : notre meilleur canal d’acquisition cette année.", author: "Camille Renaud", role: "Fondatrice, Studio Maremma" },
    { quote: "Des vidéos qui cartonnent ET qui vendent. L’équipe maîtrise les codes de la plateforme.", author: "Inès Lacroix", role: "E-commerce, Brûlerie M." },
    { quote: "Une vraie mécanique virale, convertie en leads. Bluffant.", author: "Marc Vidal", role: "Gérant, Vela" },
  ],
  faq: [
    { q: "TikTok est-il adapté à mon activité ?", a: "Bien au-delà du divertissement, TikTok touche tous les âges et de nombreux secteurs. L’audit vous dira précisément votre potentiel." },
    { q: "Créez-vous les vidéos ?", a: "Oui. On conçoit des contenus natifs (et on peut travailler avec des créateurs UGC) pensés pour la performance." },
    { q: "Quel budget pour démarrer ?", a: "On définit ensemble un budget de test réaliste selon votre marché. L’audit vous donne une recommandation honnête." },
    { q: "L’audit est-il vraiment gratuit ?", a: "Oui, à 100% et sans engagement. Vous repartez avec des idées concrètes." },
  ],
  generator: {
    eyebrow: "Diagnostic TikTok Ads · 1 min",
    panelBadge: "Audit TikTok offert",
    panelTitle: "Votre potentiel TikTok",
    recapTitle: "Récapitulatif",
    estimateLabel: "Potentiel estimé",
    estimateHint: "Indiquez votre budget pour estimer votre volume de leads.",
    estimate: "sea",
    steps: [
      {
        kind: "single",
        id: "budget",
        question: "Votre budget mensuel envisagé ?",
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
          { value: "ventes", label: "Vendre en ligne", desc: "E-commerce", icon: "euro" },
          { value: "leads", label: "Générer des leads", desc: "Formulaires, inscriptions", icon: "target" },
          { value: "notoriete", label: "Notoriété", desc: "Faire connaître ma marque", icon: "megaphone" },
          { value: "trafic", label: "Trafic", desc: "Visites vers mon site", icon: "click" },
        ],
      },
      {
        kind: "single",
        id: "contenu",
        question: "Avez-vous déjà du contenu vidéo ?",
        recapLabel: "Contenu",
        columns: 2,
        options: [
          { value: "oui", label: "Oui, régulièrement", icon: "check" },
          { value: "peu", label: "Un peu", icon: "clock" },
          { value: "non", label: "Pas encore", icon: "sparkles" },
          { value: "aide", label: "J’ai besoin d’aide", icon: "users" },
        ],
      },
    ],
    guarantees: ["Audit 100% gratuit", "Sans engagement", "Réponse sous 24h"],
    leadStep: {
      question: "Où envoyer votre audit TikTok ?",
      help: "Analyse par email + un expert vous rappelle sous 24h.",
      recapLabel: "Contact",
      submitLabel: "Recevoir mon audit TikTok",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Votre audit TikTok Ads arrive par email. Un expert vous rappelle sous 24h avec des idées de contenus.",
    successBullets: [
      "Évaluation de votre potentiel TikTok",
      "Estimation de votre coût d’acquisition",
      "Idées de contenus qui convertissent",
    ],
  },
  finalCta: {
    title: "Prêt à percer sur TikTok ?",
    subtitle:
      "Recevez un audit TikTok gratuit et découvrez votre potentiel d’acquisition.",
  },
};

/* ================================================================== */
/*  6. Stratégie — Conseil stratégique                                 */
/* ================================================================== */

const conseilStrategique: Landing = {
  slug: "conseil-strategique",
  category: "strategie",
  categoryLabel: "Stratégie",
  nav: { ctaLabel: "Conseil stratégique" },
  meta: {
    title: "Conseil stratégique marketing — une feuille de route claire",
    description:
      "Un regard d’expert sur l’ensemble de votre marketing : audit 360°, priorités chiffrées et feuille de route actionnable. Premier échange stratégique offert.",
  },
  hero: {
    badge: "Échange stratégique offert · sans engagement",
    titleLead: "Une",
    titleAccent: "stratégie marketing claire",
    titleRest: ", enfin.",
    subtitle:
      "Arrêtez d’avancer à l’instinct. On audite l’ensemble de votre marketing, on priorise ce qui compte et on vous livre une feuille de route actionnable.",
    bullets: [
      "Une vision 360° de votre marketing",
      "Des priorités claires et chiffrées",
      "Une feuille de route actionnable",
    ],
    ctaPrimary: "Demander un échange",
    ctaSecondary: "Voir des résultats",
  },
  proof: {
    rating: "4,9/5",
    ratingLabel: "140+ avis vérifiés",
    clients: "+250 entreprises conseillées",
    logosLabel: "Ils avancent avec une stratégie claire",
    logos: ["Nuvola", "Kodial", "Vela", "Maremma", "Brûlerie M.", "Atelier B."],
    stats: [
      { value: "360°", label: "d’expertise marketing" },
      { value: "×2,4", label: "de ROI marketing moyen" },
      { value: "+250", label: "stratégies construites" },
      { value: "4,9/5", label: "de satisfaction" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des décisions qui paient",
    intro: "Une stratégie claire, des résultats mesurables.",
    cases: [
      {
        client: "Nuvola",
        sector: "SaaS",
        metric: "×2,4",
        metricLabel: "de ROI marketing",
        detail:
          "Recentrage sur les canaux rentables et abandon de ce qui ne marchait pas : un marketing enfin rentable.",
        duration: "en 6 mois",
      },
      {
        client: "Kodial",
        sector: "B2B",
        metric: "−30%",
        metricLabel: "de budget gaspillé",
        detail:
          "Un mix de canaux repensé et priorisé : moins de dispersion, beaucoup plus d’impact.",
        duration: "en 3 mois",
      },
      {
        client: "Vela",
        sector: "Services",
        metric: "×3",
        metricLabel: "de leads à budget égal",
        detail:
          "Une feuille de route claire qui a réaligné toute l’équipe sur les bonnes priorités.",
        duration: "en 5 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce que vous obtenez",
    title: "Un regard expert sur tout votre marketing",
    intro: "On prend de la hauteur pour vous faire gagner en clarté et en résultats.",
    items: [
      { icon: "search", title: "Audit 360°", desc: "Un diagnostic complet : acquisition, offre, positionnement, données." },
      { icon: "target", title: "Positionnement", desc: "Un message clair qui vous différencie de la concurrence." },
      { icon: "layers", title: "Mix de canaux", desc: "Les bons canaux pour votre cible, sans vous disperser." },
      { icon: "trending-up", title: "Priorisation", desc: "Ce qui aura le plus d’impact, classé par effort et par gain." },
      { icon: "gauge", title: "KPIs & pilotage", desc: "Les bons indicateurs pour piloter par la donnée." },
      { icon: "badge-check", title: "Feuille de route", desc: "Un plan d’action concret, étape par étape, prêt à exécuter." },
    ],
  },
  guarantee: {
    badge: "Sans risque",
    title: "Un premier échange stratégique offert.",
    text: "On prend le temps de comprendre votre situation et de vous donner un premier éclairage à forte valeur. Sans engagement, sans discours commercial.",
    points: ["Échange offert", "Sans engagement", "Confidentialité totale", "Réponse sous 24h"],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre stratégie en 3 étapes",
    steps: [
      { title: "Vous décrivez votre situation", desc: "Quelques questions pour comprendre vos enjeux et objectifs." },
      { title: "On analyse & on priorise", desc: "Audit 360° de votre marketing et identification des leviers clés." },
      { title: "On vous livre le plan", desc: "Une feuille de route claire, présentée lors d’un échange dédié." },
    ],
  },
  testimonials: [
    { quote: "On a enfin une direction claire. Chaque euro marketing est désormais investi là où il compte vraiment.", author: "Sofia Marchetti", role: "CMO, Nuvola" },
    { quote: "Un regard extérieur expert qui nous a fait gagner un an. Les priorités étaient évidentes après l’audit.", author: "Julien Faure", role: "CEO, Kodial" },
    { quote: "Plus de dispersion. Une stratégie, un plan, des résultats.", author: "Marc Vidal", role: "Gérant, Vela" },
  ],
  faq: [
    { q: "Pour quelles entreprises ?", a: "De l’indépendant ambitieux à la PME en croissance. On adapte la profondeur de la mission à votre stade et vos enjeux." },
    { q: "Le premier échange est-il vraiment offert ?", a: "Oui. C’est un vrai échange à valeur, sans engagement ni discours commercial agressif." },
    { q: "Intervenez-vous sur tous les canaux ?", a: "Oui : SEO, publicité (Google, Meta, TikTok), réseaux sociaux, contenu et conversion. Une vision 360° et indépendante du canal." },
    { q: "Et si je veux ensuite déléguer l’exécution ?", a: "On peut exécuter la feuille de route avec vous, ou outiller vos équipes pour qu’elles la pilotent. Vous choisissez." },
  ],
  generator: {
    eyebrow: "Diagnostic stratégique · 1 min",
    panelBadge: "Échange offert",
    panelTitle: "Votre diagnostic",
    recapTitle: "Récapitulatif",
    estimateLabel: "Diagnostic",
    estimateHint: "",
    estimate: "none",
    steps: [
      {
        kind: "single",
        id: "objectif",
        question: "Votre priorité aujourd’hui ?",
        recapLabel: "Priorité",
        columns: 2,
        options: [
          { value: "croissance", label: "Accélérer ma croissance", icon: "trending-up" },
          { value: "leads", label: "Générer plus de leads", icon: "target" },
          { value: "notoriete", label: "Développer ma notoriété", icon: "megaphone" },
          { value: "structurer", label: "Structurer mon marketing", icon: "layers" },
        ],
      },
      {
        kind: "single",
        id: "taille",
        question: "La taille de votre entreprise ?",
        recapLabel: "Entreprise",
        columns: 2,
        options: [
          { value: "solo", label: "Indépendant", icon: "users" },
          { value: "tpe", label: "TPE (2 à 10)", icon: "store" },
          { value: "pme", label: "PME (10 à 50)", icon: "building" },
          { value: "eti", label: "Plus de 50", icon: "building" },
        ],
      },
      {
        kind: "single",
        id: "defi",
        question: "Votre principal défi ?",
        recapLabel: "Défi",
        columns: 2,
        options: [
          { value: "visibilite", label: "Manque de visibilité", icon: "search" },
          { value: "conversion", label: "Trop peu de conversions", icon: "click" },
          { value: "dispersion", label: "Des actions dispersées", icon: "layers" },
          { value: "strategie", label: "Pas de stratégie claire", icon: "target" },
        ],
      },
    ],
    guarantees: ["Échange 100% offert", "Sans engagement", "Confidentialité totale"],
    leadStep: {
      question: "Où vous recontacter ?",
      help: "Un stratège vous rappelle sous 24h pour un premier échange offert.",
      recapLabel: "Contact",
      submitLabel: "Demander mon échange stratégique",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "Un stratège Le Poulpe vous recontacte sous 24h pour votre échange offert et un premier éclairage.",
    successBullets: [
      "Un échange avec un expert",
      "Un premier diagnostic offert",
      "Des priorités claires pour avancer",
    ],
  },
  finalCta: {
    title: "Et si vous aviez enfin une stratégie claire ?",
    subtitle:
      "Demandez votre échange stratégique offert et repartez avec des priorités actionnables.",
  },
};

/* ================================================================== */
/*  7. SEO — Stratégie SEO (résultats garantis par contrat)            */
/* ================================================================== */

const strategieSeo: Landing = {
  slug: "strategie-seo",
  category: "seo",
  categoryLabel: "SEO",
  guaranteeFeatured: true,
  nav: { ctaLabel: "Stratégie SEO" },
  meta: {
    title: "Stratégie SEO — des résultats garantis par contrat",
    description:
      "Une stratégie SEO avec engagement de résultat : objectifs de positionnement sur vos mots-clés cibles inscrits au contrat, et clause de sortie dès 1 an si non atteints.",
  },
  hero: {
    badge: "Résultats garantis par contrat",
    titleLead: "Une stratégie SEO",
    titleAccent: "avec résultats garantis",
    titleRest: ".",
    subtitle:
      "On s’engage noir sur blanc sur des objectifs de positionnement sur vos mots-clés cibles. Si on ne les atteint pas, une clause de sortie vous libère dès 1 an — au lieu des 3 ans habituels du marché.",
    bullets: [
      "Des objectifs de positionnement définis avec vous",
      "Un engagement écrit sur vos mots-clés cibles",
      "Une clause de sortie dès 1 an si on n’y arrive pas",
    ],
    ctaPrimary: "Construire ma stratégie SEO",
    ctaSecondary: "Voir nos résultats",
  },
  proof: {
    rating: "4,9/5",
    ratingLabel: "120+ avis vérifiés",
    clients: "+250 entreprises accompagnées",
    logosLabel: "Ils ont sécurisé leur visibilité avec Le Poulpe",
    logos: ["Maremma", "Atelier B.", "Nuvola", "Kodial", "Brûlerie M.", "Vela"],
    stats: [
      { value: "+182%", label: "de trafic organique moyen" },
      { value: "Top 3", label: "sur les mots-clés cibles" },
      { value: "1 an", label: "clause de sortie (vs 3 ans)" },
      { value: "100%", label: "d’objectifs inscrits au contrat" },
    ],
  },
  results: {
    eyebrow: "Résultats concrets",
    title: "Des positions tenues, pas seulement promises",
    intro: "Des objectifs contractualisés, et atteints.",
    cases: [
      {
        client: "Studio Maremma",
        sector: "E-commerce déco",
        metric: "+182%",
        metricLabel: "de trafic organique",
        detail:
          "Objectifs de positionnement atteints sur 24 mots-clés cibles, contractualisés dès le départ.",
        duration: "en 8 mois",
      },
      {
        client: "Atelier B.",
        sector: "Artisanat · B2B",
        metric: "Top 3",
        metricLabel: "sur 18 mots-clés cibles",
        detail:
          "Une stratégie de contenu et de netlinking qui a tenu ses engagements, mot-clé par mot-clé.",
        duration: "en 6 mois",
      },
      {
        client: "Nuvola",
        sector: "SaaS",
        metric: "×3,4",
        metricLabel: "de leads organiques",
        detail:
          "Le SEO est devenu leur 1er canal — avec des objectifs de volume sécurisés au contrat.",
        duration: "en 9 mois",
      },
    ],
  },
  benefits: {
    eyebrow: "Ce qui est inclus",
    title: "Une stratégie SEO complète et pilotée",
    intro: "Tout ce qu’il faut pour atteindre — et tenir — vos objectifs.",
    items: [
      { icon: "search", title: "Audit & mots-clés cibles", desc: "On identifie les requêtes rentables et on fixe les objectifs avec vous." },
      { icon: "line-chart", title: "Stratégie de contenu", desc: "Un plan éditorial pensé pour ranker sur vos mots-clés prioritaires." },
      { icon: "layers", title: "Netlinking & autorité", desc: "On renforce la crédibilité de votre domaine aux yeux de Google." },
      { icon: "gauge", title: "SEO technique", desc: "Vitesse, indexation, structure : on lève les freins au classement." },
      { icon: "trending-up", title: "Suivi des positions", desc: "Vos positions sur les mots-clés cibles, suivies en continu." },
      { icon: "badge-check", title: "Objectifs contractuels", desc: "Des engagements écrits, mesurables, avec clause de sortie." },
    ],
  },
  guarantee: {
    badge: "Engagement de résultat",
    title: "On s’engage par contrat. Sinon, vous sortez.",
    text: "On définit ensemble des objectifs de volume et de positionnement sur vos mots-clés cibles, inscrits noir sur blanc dans le contrat. Si on ne les atteint pas, une clause de rétractation vous permet de sortir dès 1 an — au lieu des 3 ans habituels du marché. Notre rémunération dépend de nos résultats : on a tout intérêt à les tenir.",
    points: [
      "Objectifs de positionnement contractualisés",
      "Sur vos mots-clés cibles, définis ensemble",
      "Clause de sortie dès 1 an si non atteints",
      "Aucun engagement caché de 3 ans",
    ],
  },
  process: {
    eyebrow: "Comment ça marche",
    title: "Votre stratégie SEO en 4 étapes",
    steps: [
      { title: "Audit & mots-clés", desc: "On analyse votre marché et on sélectionne vos mots-clés cibles." },
      { title: "Objectifs au contrat", desc: "On fixe ensemble des objectifs mesurables, avec clause de sortie." },
      { title: "Exécution", desc: "Contenu, technique et netlinking déployés pour ranker." },
      { title: "Suivi des positions", desc: "On pilote, on reporte et on tient le cap sur vos objectifs." },
    ],
  },
  testimonials: [
    { quote: "Un engagement de résultat écrit, c’est ce qui nous a décidés. Et les objectifs ont été tenus.", author: "Camille Renaud", role: "Fondatrice, Studio Maremma" },
    { quote: "Enfin une agence qui met ses résultats au contrat. Zéro langue de bois, des positions gagnées.", author: "Thomas Bernard", role: "Gérant, Atelier B." },
    { quote: "La clause de sortie à 1 an a levé tous nos doutes. On est restés, vu les résultats.", author: "Sofia Marchetti", role: "CMO, Nuvola" },
  ],
  faq: [
    { q: "Comment fonctionne la garantie de résultat ?", a: "On définit avec vous des objectifs de positionnement et de volume sur des mots-clés cibles, inscrits au contrat. Ils sont mesurables et suivis en continu." },
    { q: "Que se passe-t-il si les objectifs ne sont pas atteints ?", a: "Une clause de rétractation vous permet de sortir du contrat dès 1 an, au lieu des 3 ans habituels du marché. Vous n’êtes pas prisonnier d’un engagement long." },
    { q: "Qui choisit les mots-clés cibles ?", a: "On les définit ensemble, à partir d’un audit de votre marché et de leur potentiel business. Vous validez avant tout engagement." },
    { q: "Le SEO n’est-il pas trop incertain pour être garanti ?", a: "C’est justement pour ça qu’on contractualise des objectifs réalistes, fondés sur l’audit — et qu’on assume une clause de sortie si on se trompe." },
    { q: "Combien de temps avant les premiers résultats ?", a: "Les premiers mouvements arrivent généralement sous 2 à 4 mois ; les objectifs contractuels sont calibrés sur 6 à 12 mois selon la concurrence." },
  ],
  generator: {
    eyebrow: "Stratégie SEO · 1 min",
    panelBadge: "Objectifs garantis",
    panelTitle: "Votre stratégie SEO",
    recapTitle: "Récapitulatif",
    estimateLabel: "Potentiel estimé",
    estimateHint: "Répondez pour estimer votre potentiel de trafic.",
    estimate: "seo",
    steps: [
      {
        kind: "input",
        id: "site",
        question: "Quel site voulez-vous faire ranker ?",
        help: "On évalue votre visibilité actuelle.",
        recapLabel: "Site",
        inputType: "text",
        prefix: "https://",
        placeholder: "monsite.fr",
      },
      {
        kind: "single",
        id: "objectif",
        question: "Votre objectif principal ?",
        recapLabel: "Objectif",
        columns: 2,
        options: [
          { value: "trafic", label: "Plus de trafic", desc: "Visibilité Google", icon: "trending-up" },
          { value: "leads", label: "Plus de leads", desc: "Générer des contacts", icon: "target" },
          { value: "ventes", label: "Plus de ventes", desc: "E-commerce", icon: "euro" },
          { value: "local", label: "Visibilité locale", desc: "Près de chez moi", icon: "map-pin" },
        ],
      },
      {
        kind: "single",
        id: "trafic",
        question: "Votre trafic mensuel actuel ?",
        help: "Une estimation suffit.",
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
    guarantees: ["Objectifs au contrat", "Clause de sortie à 1 an", "Réponse sous 24h"],
    leadStep: {
      question: "Où envoyer votre stratégie SEO ?",
      help: "Un expert vous rappelle sous 24h pour définir vos objectifs.",
      recapLabel: "Contact",
      submitLabel: "Recevoir ma stratégie SEO",
      consent,
    },
    successTitle: "Demande bien reçue !",
    successText:
      "On prépare votre stratégie SEO et un expert vous rappelle sous 24h pour définir vos objectifs et la garantie.",
    successBullets: [
      "Sélection de vos mots-clés cibles",
      "Objectifs de résultat proposés",
      "Échange avec un expert SEO",
    ],
  },
  finalCta: {
    title: "Et si votre SEO venait avec une garantie ?",
    subtitle:
      "Construisons votre stratégie SEO avec des objectifs au contrat — et une clause de sortie dès 1 an.",
  },
};

/* ================================================================== */
/*  Registry                                                           */
/* ================================================================== */

export const landings: Landing[] = [
  auditSeoGratuit,
  strategieSeo,
  auditGoogleAds,
  metaAds,
  tiktokAds,
  generationDeLeads,
  conseilStrategique,
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
  ads: {
    label: "Publicité",
    title: "Publicité en ligne",
    description: "Google, Meta, TikTok : des leads rentables, dès maintenant.",
  },
  strategie: {
    label: "Stratégie",
    title: "Stratégie & Conseil",
    description: "Une vision claire et un plan d’action sur tous vos canaux.",
  },
};
