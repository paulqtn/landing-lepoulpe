import { comboContent } from "./content/combos-content";
import type { MaterialSlug } from "./pricing";

/* ================================================================== */
/*  Catalogue SEO : matériaux × usages                                 */
/*  1 entrée = 1 page /garde-corps/[slug]                              */
/* ================================================================== */

export type QA = { q: string; a: string };
export type Feature = { title: string; desc: string };

export type CatalogEntry = {
  slug: string;
  kind: "material" | "usage" | "combo";
  material?: MaterialSlug;
  usage?: string;
  /** Libellé court pour liens et menus. */
  name: string;
  title: string;
  /** H1 SEO de la page quand il diffère du titre court (title reste utilisé
      pour le fil d'Ariane et les titres des sections générateur). */
  h1?: string;
  /** Sert metaTitle tel quel, sans le suffixe « | Marque » du gabarit global. */
  metaTitleIsAbsolute?: true;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  benefits: Feature[];
  technical: Feature[];
  faq: QA[];
};

/* ------------------------------- Matériaux ------------------------ */

type MaterialSeed = CatalogEntry & { material: MaterialSlug };

export const materials: MaterialSeed[] = [
  {
    slug: "verre",
    kind: "material",
    material: "verre",
    name: "Verre",
    title: "Garde-corps en verre",
    metaTitle: "Garde-corps en verre — sur-mesure & kit, direct usine",
    metaDescription:
      "Garde-corps en verre feuilleté sur-mesure ou en kit, en direct usine. Vue dégagée, conformité NF P01-012, devis détaillé en 24h.",
    intro:
      "Une sécurité totale sans jamais bloquer la vue : verre feuilleté sur-mesure, fixations discrètes, conforme NF.",
    benefits: [
      { title: "Vue totalement dégagée", desc: "Aucun montant vertical : la transparence du verre préserve le paysage et la lumière." },
      { title: "Sécurité feuilletée", desc: "Verre feuilleté (44.2, 55.2, 66.2…) : en cas de casse, le film retient les morceaux." },
      { title: "Élégance durable", desc: "Un rendu haut de gamme qui valorise immédiatement le bien, sans vieillir." },
      { title: "Entretien simple", desc: "Un nettoyage à la raclette suffit — pas de peinture, pas de traitement." },
    ],
    technical: [
      { title: "Verre feuilleté obligatoire", desc: "Jamais de simple vitrage : feuilleté 44.2 minimum, trempé-feuilleté pour les versions autoportantes." },
      { title: "Trois familles de fixation", desc: "Profilé alu en pince au sol (autoportant), pinces inox sur poteaux, ou poteaux + main courante." },
      { title: "Conforme NF P01-012", desc: "Hauteur ≥ 1,00 m et résistance aux efforts validée selon NF P01-013." },
    ],
    faq: [
      { q: "Le verre d’un garde-corps peut-il casser ?", a: "Le verre feuilleté est composé de plusieurs couches liées par des films PVB : en cas de choc violent, il se fissure mais reste en place, sans chute de morceaux. C’est précisément pour cela qu’il est obligatoire en garde-corps." },
      { q: "Quel prix pour un garde-corps en verre ?", a: "Comptez en fourniture 250 à 450 €/ml en kit, et 450 à 800 €/ml avec pose, selon l’épaisseur du verre et le type de fixation. Le devis détaillé est gratuit et envoyé sous 24h." },
      { q: "Faut-il un entretien particulier ?", a: "Non : un nettoyage classique des vitres suffit. Les profilés aluminium et les pinces inox ne demandent aucun traitement." },
      { q: "Peut-on poser un kit verre soi-même ?", a: "Oui, nos kits sont livrés pré-percés avec notice et visserie. La pose demande un niveau, un perforateur et de la rigueur sur les niveaux — ou notre réseau de poseurs s’en charge." },
    ],
  },
  {
    slug: "aluminium",
    kind: "material",
    material: "aluminium",
    name: "Aluminium",
    title: "Garde-corps en aluminium",
    metaTitle: "Garde-corps aluminium — sur-mesure & kit, direct usine",
    metaDescription:
      "Garde-corps en aluminium thermolaqué, sur-mesure ou en kit. Léger, zéro entretien, toutes teintes RAL. Devis détaillé gratuit en 24h.",
    intro:
      "Léger, moderne, zéro entretien : le meilleur rapport qualité/prix, thermolaqué dans la teinte RAL de votre choix.",
    benefits: [
      { title: "Zéro entretien", desc: "Le thermolaquage protège définitivement : ni rouille, ni peinture à refaire." },
      { title: "Toutes teintes RAL", desc: "Anthracite, noir, blanc ou couleur sur-mesure pour s’accorder à vos menuiseries." },
      { title: "Léger et rigide", desc: "Facile à manipuler à la pose, tout en respectant les efforts exigés par la norme." },
      { title: "Budget maîtrisé", desc: "Le matériau le plus accessible de la gamme, en kit comme en sur-mesure." },
    ],
    technical: [
      { title: "Thermolaquage qualité", desc: "Laquage poudre polymérisé au four : tenue UV et bord de mer, garantie longue durée." },
      { title: "Remplissages au choix", desc: "Barreaudage vertical (espacement ≤ 11 cm), tôle perforée, lisses ou vitrage." },
      { title: "Conforme NF P01-012", desc: "Sections et fixations dimensionnées pour la résistance exigée par la norme." },
    ],
    faq: [
      { q: "L’aluminium est-il assez solide pour un garde-corps ?", a: "Oui : correctement dimensionné (sections, entraxes de poteaux, fixations), un garde-corps aluminium répond aux efforts exigés par les normes NF P01-012 / NF P01-013, en usage privé comme collectif." },
      { q: "Quel prix pour un garde-corps aluminium ?", a: "En fourniture, comptez 150 à 300 €/ml en kit et 300 à 550 €/ml avec pose, selon le remplissage choisi. C’est le matériau le plus économique de la gamme." },
      { q: "Le laquage tient-il en extérieur ?", a: "Le thermolaquage est prévu pour l’extérieur : tenue aux UV, aux chocs et aux embruns. Un simple lavage à l’eau savonneuse suffit." },
      { q: "Peut-on l’associer à du verre ?", a: "Oui : structure aluminium + remplissage en verre feuilleté est une combinaison très demandée — la rigidité de l’alu, la transparence du verre." },
    ],
  },
  {
    slug: "inox",
    kind: "material",
    material: "inox",
    name: "Inox",
    title: "Garde-corps en inox",
    metaTitle: "Garde-corps inox 304 & 316 — sur-mesure & kit",
    metaDescription:
      "Garde-corps inox brossé 304 ou 316 (piscine, bord de mer) : câbles, barres ou verre. Sur-mesure ou kit, devis détaillé gratuit en 24h.",
    intro:
      "Intemporel, quasi indestructible : câbles, barres ou verre — inox 304 intérieur, 316 piscine et bord de mer.",
    benefits: [
      { title: "Durabilité extrême", desc: "L’inox ne rouille pas, ne se déforme pas et garde son éclat des décennies." },
      { title: "Style contemporain", desc: "Câbles, barres ou verre : des lignes fines et techniques, très architecturales." },
      { title: "Adapté aux milieux agressifs", desc: "En nuance 316/316L, il résiste au chlore des piscines et aux embruns marins." },
      { title: "Finitions premium", desc: "Brossé ou poli miroir, avec une visserie et des fixations assorties." },
    ],
    technical: [
      { title: "304 ou 316 selon l’exposition", desc: "304 en intérieur ; 316/316L obligatoire piscine et bord de mer (< 10 km de la côte)." },
      { title: "Câbles : tension et entraxe", desc: "Câbles Ø 4-6 mm avec tendeurs, espacement conforme à la zone de sécurité de la norme." },
      { title: "Conforme NF P01-012", desc: "Main courante à 1,00 m minimum, remplissage sécurisé sur les 45 premiers centimètres." },
    ],
    faq: [
      { q: "Inox 304 ou 316 : lequel choisir ?", a: "Le 304 convient à l’intérieur et aux extérieurs standards. Autour d’une piscine ou à moins de 10 km de la mer, le 316 (ou 316L) s’impose : sa teneur en molybdène résiste au chlore et au sel." },
      { q: "Les câbles inox sont-ils autorisés ?", a: "Oui, à condition de respecter la norme : zone basse de 45 cm sécurisée et espacements limités pour empêcher le passage d’un enfant. Nos kits câbles sont dimensionnés en conséquence." },
      { q: "Quel prix pour un garde-corps inox ?", a: "En fourniture, comptez 180 à 350 €/ml en kit et 350 à 600 €/ml posé, selon le remplissage (câbles, barres, verre) et la nuance choisie." },
      { q: "L’inox demande-t-il de l’entretien ?", a: "Très peu : un nettoyage à l’eau claire et un produit passivant une à deux fois par an en zone marine suffisent à conserver son éclat." },
    ],
  },
];

/* -------------------------------- Usages -------------------------- */

type UsageSeed = CatalogEntry & { usage: string };

export const usages: UsageSeed[] = [
  {
    slug: "piscine",
    kind: "usage",
    usage: "piscine",
    name: "Piscine",
    title: "Barrière de piscine en verre",
    metaTitle: "Barrière de piscine en verre sur-mesure",
    metaDescription:
      "Barrière de piscine en verre sur-mesure, en direct usine : sécurisez le bassin sans gâcher la vue. Repères NF P90-306, visserie inox 316. Devis gratuit.",
    intro:
      "Sécurité, résistance au chlore et transparence totale sur le bassin : verre autoportant, visserie inox 316.",
    benefits: [
      { title: "Vue sur le bassin", desc: "Surveillez la baignade sans obstacle visuel, notamment avec le verre autoportant." },
      { title: "Matériaux anti-chlore", desc: "Inox 316 et aluminium thermolaqué : aucun risque de corrosion en ambiance piscine." },
      { title: "Sécurité des abords", desc: "Une délimitation physique claire des zones en hauteur autour de la plage de piscine." },
      { title: "Esthétique de plage", desc: "Des lignes épurées qui valorisent la terrasse et le bassin." },
    ],
    technical: [
      { title: "Visserie inox 316 exigée", desc: "Autour d’un bassin, toute la boulonnerie doit être en 316 pour résister au chlore." },
      { title: "Barrière normée ≠ garde-corps", desc: "Si l’ouvrage fait office de barrière de protection piscine, la norme NF P90-306 s’applique en plus." },
      { title: "Fixation sur plage ou muret", desc: "Profilé autoportant en pince sur dalle, ou poteaux sur muret selon la configuration." },
    ],
    faq: [
      { q: "Pourquoi choisir une barrière de piscine en verre ?", a: "Une barrière de piscine en verre permet de sécuriser votre bassin tout en conservant une vue totalement dégagée sur l’eau et le jardin. Contrairement aux clôtures traditionnelles, le verre offre une transparence maximale et s’intègre harmonieusement à votre extérieur. C’est une solution élégante, durable et adaptée aux piscines contemporaines comme aux bassins traditionnels." },
      { q: "Une barrière de piscine en verre est-elle conforme à la norme NF P90-306 ?", a: "Une barrière de piscine en verre peut répondre à la norme NF P90-306 lorsqu’elle est conçue et installée conformément à ses exigences. Cette norme encadre notamment la hauteur, la résistance, les accès et la sécurité des enfants de moins de 5 ans. Nous pouvons vous fournir tout le matériel pour répondre à cette norme." },
      { q: "Une barrière de piscine en verre est-elle suffisamment solide ?", a: "Oui, une barrière de piscine en verre correctement dimensionnée offre une protection résistante grâce à un vitrage de sécurité adapté et des fixations robustes. Le système doit résister aux sollicitations prévues par la norme NF P90-306. Le verre constitue également une surface lisse qui limite les prises permettant aux jeunes enfants de l’escalader." },
      { q: "Quel est le prix d’une barrière de piscine en verre sur mesure ?", a: "Le prix d’une barrière de piscine en verre dépend de la longueur à sécuriser, du vitrage, du système de fixation et de la présence d’un portillon. Les solutions sur rail, sur pinces inox ou à fixations ponctuelles présentent des budgets différents. Notre configurateur en ligne vous permet d’obtenir une estimation personnalisée en quelques clics, gratuitement et sans engagement." },
      { q: "Peut-on installer une barrière en verre autour d’une piscine existante ?", a: "Oui, une barrière de piscine en verre sur mesure peut être installée autour d’un bassin existant, notamment sur une terrasse carrelée ou une plage de piscine en béton. Les fixations doivent être ancrées dans un support structurel suffisamment résistant. L’implantation est étudiée selon les dimensions du bassin, les accès et les contraintes de sécurité." },
      { q: "Une barrière de piscine en verre résiste-t-elle au chlore et aux intempéries ?", a: "Oui, le verre est parfaitement adapté aux environnements extérieurs et humides. Nos barrières de piscine en verre intègrent une visserie en inox 316 et des fixations en aluminium anodisé, apprécié pour sa résistance renforcée à la corrosion. Un nettoyage régulier du vitrage et un rinçage occasionnel des éléments métalliques permettent de préserver durablement leur aspect, notamment autour des piscines traitées au chlore ou au sel." },
    ],
  },
  {
    slug: "escalier",
    kind: "usage",
    usage: "escalier",
    name: "Escalier",
    title: "Garde-corps et rampe d’escalier",
    metaTitle: "Garde-corps escalier — rampant verre, inox, alu",
    metaDescription:
      "Garde-corps rampant d’escalier en verre, inox ou aluminium, sur-mesure au degré près. Conforme NF P01-012. Devis gratuit en 24h.",
    intro:
      "Fabriqué au degré près : verre en parallélogramme, espacements conformes, main courante en option.",
    benefits: [
      { title: "Sur-mesure au degré près", desc: "Chaque volée est différente : nous fabriquons d’après vos cotes et votre pente exacte." },
      { title: "Espacements conformes", desc: "L’écart entre deux panneaux respecte la limite fixée par la norme, y compris dans les tournants ; la main courante est en option." },
      { title: "Lumière traversante", desc: "En verre, l’escalier reste baigné de lumière — idéal dans un séjour ou une cage sombre." },
      { title: "Montée sécurisée", desc: "Remplissages conformes : pas d’effet d’échelle, espacements contrôlés." },
    ],
    technical: [
      { title: "Hauteur en rampant", desc: "90 cm minimum mesurés verticalement depuis le nez de marche (1,00 m sur les paliers)." },
      { title: "Découpes en parallélogramme", desc: "En verre, chaque panneau suit la pente : découpe et façonnage au degré près en usine." },
      { title: "Fixation latérale ou sur marche", desc: "À l’anglaise sur limon, ou à la française sur les marches selon l’escalier." },
    ],
    faq: [
      { q: "Pourquoi choisir un garde-corps en verre pour son escalier ?", a: "Un garde-corps d’escalier en verre permet de sécuriser votre montée tout en conservant un maximum de lumière et de transparence. Contrairement aux rampes traditionnelles à barreaux, le verre met en valeur les marches et les matériaux de votre escalier. C’est une solution moderne et élégante, parfaitement adaptée aux escaliers intérieurs comme extérieurs." },
      { q: "Quelle est la hauteur réglementaire d’un garde-corps d’escalier en verre ?", a: "La norme NF P01-012 encadre les dimensions des garde-corps et rampes d’escalier. En règle générale, la hauteur de protection est de 90 cm minimum dans la partie rampante, mesurée à la verticale du nez de marche, et de 1 mètre sur les paliers. Les exigences précises dépendent de la configuration et de l’usage de l’escalier." },
      { q: "Un garde-corps d’escalier en verre est-il suffisamment solide ?", a: "Oui, un garde-corps d’escalier en verre correctement dimensionné est conçu pour résister aux efforts et aux chocs prévus par les normes applicables. Le verre feuilleté de sécurité contribue à maintenir les fragments en cas de bris. Associé à des fixations adaptées à la structure, il assure une protection fiable sans compromettre la transparence de votre escalier." },
      { q: "Peut-on installer un garde-corps en verre sur un escalier tournant ?", a: "Oui, un garde-corps en verre sur mesure peut s’adapter à un escalier droit, quart tournant, double quart tournant ou hélicoïdal. Chaque panneau est fabriqué selon la pente et les dimensions de votre escalier. Pour les configurations complexes, un relevé de cotes précis ou un gabarit permet d’étudier une solution adaptée aux angles et aux changements de direction." },
      { q: "Comment fixer un garde-corps en verre sur un escalier ?", a: "Un garde-corps d’escalier en verre peut être fixé sur les marches ou sur le côté du limon, selon la structure et le rendu souhaité. Plusieurs solutions existent : rail aluminium, pinces à verre ou fixations ponctuelles. Le système est choisi en fonction des dimensions du vitrage, du support et des exigences de sécurité, avec une main courante lorsque celle-ci est nécessaire." },
      { q: "Quel est le prix d’un garde-corps d’escalier en verre sur mesure ?", a: "Le prix d’un garde-corps en verre pour escalier dépend de la longueur, du nombre de panneaux, de la pente, du type de vitrage et du système de fixation. Un escalier droit est généralement plus simple à équiper qu’un escalier tournant nécessitant des découpes spécifiques. Notre configurateur en ligne vous permet d’obtenir une première estimation personnalisée, gratuitement et sans engagement." },
    ],
  },
  {
    slug: "balcon",
    kind: "usage",
    usage: "balcon",
    name: "Balcon",
    title: "Garde-corps de balcon",
    h1: "Garde-corps en verre pour balcon",
    metaTitle: "Garde-corps en verre pour balcon sur mesure | Direct usine",
    metaTitleIsAbsolute: true,
    metaDescription:
      "Garde-corps en verre pour balcon sur mesure : fixations sur dalle ou en nez de dalle, vue dégagée et estimation gratuite en 1 minute.",
    intro:
      "Sécurisez votre balcon sans masquer la vue grâce à un garde-corps en verre sur mesure. Une solution robuste, élégante et adaptée à votre projet, en neuf comme en rénovation.",
    benefits: [
      { title: "Sécurité en hauteur", desc: "Dimensionné pour la poussée normative — l’ouvrage qui ne pardonne aucune approximation." },
      { title: "Façade valorisée", desc: "Le garde-corps signe l’esthétique de la façade : verre épuré ou alu graphique." },
      { title: "Pose française ou anglaise", desc: "Sur la dalle ou en applique pour préserver la surface utile du balcon." },
      { title: "Résistance aux intempéries", desc: "Matériaux et visseries prévus pour l’exposition permanente." },
    ],
    technical: [
      { title: "1,00 m minimum", desc: "Hauteur normative depuis le sol fini du balcon, zone basse 45 cm sécurisée." },
      { title: "Fixation en nez de dalle", desc: "La pose à l’anglaise libère 100 % de la surface du balcon et affine la ligne de façade." },
      { title: "Étanchéité préservée", desc: "Platines et scellements chimiques adaptés pour ne pas compromettre l’étanchéité de la dalle." },
    ],
    faq: [
      { q: "Un garde-corps en verre est-il suffisamment solide pour un balcon ?", a: "Oui, un garde-corps en verre adapté à un balcon est conçu pour résister aux efforts d’appui, aux chocs et aux intempéries. Tous nos garde-corps en verre pour balcon sont conformes aux normes françaises et offrent une résistance allant jusqu’à 500 kg/m² selon le type de fixation choisi." },
      { q: "Quelle fixation choisir pour un garde-corps de balcon en verre ?", a: "Deux types de pose sont particulièrement adaptés : la pose à la française, fixée sur le dessus de la dalle, et la pose à l’anglaise, fixée contre son nez. Selon le projet, le vitrage peut être maintenu par un rail en aluminium, des pinces à verre ou des points d’accroche (spiders). Le choix dépend de la structure du balcon et du rendu esthétique recherché." },
      { q: "Quel est le prix d’un garde-corps en verre pour balcon ?", a: "Le prix d’un garde-corps de balcon en verre sur mesure varie selon la longueur, le type de vitrage, les fixations et la configuration du chantier. Une installation sur rail ou par fixations ponctuelles ne représente pas le même budget. Comptez pour votre projet environ 300 € par mètre linéaire à partir de 10 m." },
      { q: "Un garde-corps de balcon en verre est-il facile à entretenir ?", a: "Oui, le verre est un matériau facile à entretenir et adapté à une utilisation extérieure. Un nettoyage régulier à l’eau tiède avec un produit doux suffit généralement à éliminer les traces de pluie, la poussière et les salissures. Il est également recommandé de vérifier périodiquement l’état des fixations et des joints." },
      { q: "Peut-on remplacer un ancien garde-corps de balcon par du verre ?", a: "Oui, il est possible de remplacer un garde-corps métallique, en aluminium ou à barreaux par un modèle en verre sur mesure. Cette rénovation modernise la façade et libère la vue depuis le balcon. Il faut toutefois vérifier l’état et la capacité du support. En copropriété, une autorisation de l’assemblée générale peut être nécessaire, ainsi qu’une formalité d’urbanisme selon votre PLU." },
    ],
  },
  {
    slug: "terrasse",
    kind: "usage",
    usage: "terrasse",
    name: "Terrasse",
    title: "Garde-corps de terrasse",
    metaTitle: "Garde-corps terrasse — verre, alu, inox | direct usine",
    metaDescription:
      "Garde-corps de terrasse sur-mesure ou en kit : verre panoramique, alu thermolaqué, inox. Conforme NF P01-012, devis détaillé en 24h.",
    intro:
      "Dès 1 m de hauteur de chute, le garde-corps s’impose. Le verre préserve votre panorama, l’alu votre budget.",
    benefits: [
      { title: "Panorama préservé", desc: "En verre ou câbles inox, la vue reste intacte depuis la terrasse comme depuis le jardin." },
      { title: "Grandes longueurs", desc: "Kits modulaires et fabrication sur-mesure pour les linéaires importants, angles compris." },
      { title: "Support bois, béton ou acier", desc: "Fixations étudiées pour lambourdes, dalle béton ou structure métallique." },
      { title: "Confort d’usage", desc: "Un espace enfin sécurisé pour les enfants, sans sensation d’enfermement." },
    ],
    technical: [
      { title: "Fixation selon support", desc: "Platines sur dalle, tirefonds structurels sur bois, contre-plaques sous solives si nécessaire." },
      { title: "Autoportant sur dalle", desc: "Le profilé en pince (verre) évite les poteaux et se pose directement sur dalle béton." },
      { title: "Drainage et dilatation", desc: "Conception qui respecte l’écoulement des eaux et la dilatation des grandes longueurs." },
    ],
    faq: [
      { q: "Pourquoi choisir un garde-corps en verre pour sa terrasse ?", a: "Un garde-corps en verre pour terrasse permet de sécuriser votre espace extérieur tout en conservant une vue panoramique dégagée. Contrairement aux garde-corps à barreaux, le verre laisse passer la lumière et s’intègre parfaitement aux terrasses modernes, surélevées ou aux toits-terrasses. Une solution élégante qui allie transparence, sécurité et design contemporain." },
      { q: "Un garde-corps en verre pour terrasse est-il vraiment solide ?", a: "Oui, un garde-corps en verre correctement dimensionné est conçu pour résister aux efforts d’appui et aux chocs prévus par les normes françaises. Le verre feuilleté de sécurité, associé à des fixations robustes, assure une protection adaptée contre les chutes. La résistance repose sur l’ensemble du système : vitrage, fixations et structure porteuse." },
      { q: "Quel est le prix d’un garde-corps en verre pour terrasse ?", a: "Le prix d’un garde-corps en verre pour terrasse dépend des dimensions, du type de vitrage et du système de fixation choisi : rail aluminium, pinces ou fixations ponctuelles. Chaque projet étant différent, notre configurateur en ligne vous permet d’obtenir une estimation personnalisée, gratuite et sans engagement pour votre garde-corps en verre sur mesure." },
      { q: "Quelle est la hauteur réglementaire d’un garde-corps en verre pour terrasse ?", a: "Pour une terrasse en étage d’un bâtiment d’habitation, la hauteur minimale réglementaire est généralement de 1 mètre, mesurée depuis le sol fini. La norme NF P01-012 encadre les dimensions et les exigences de sécurité des garde-corps. Certaines configurations, notamment en présence de murets ou d’éléments servant d’appui, nécessitent une étude particulière." },
      { q: "Peut-on installer un garde-corps en verre sans poteaux ni main courante ?", a: "Oui, un garde-corps de terrasse tout verre peut être installé sans poteaux apparents ni main courante, avec un système de fixation adapté et validé pour cette configuration. Les panneaux de verre sont notamment maintenus par un rail en aluminium fixé à la structure. Cette solution minimaliste maximise la transparence et préserve la vue depuis votre terrasse." },
      { q: "Comment fixer un garde-corps en verre sur une terrasse ?", a: "Un garde-corps en verre pour terrasse peut être fixé à l’aide d’un rail aluminium, de pinces à verre ou de fixations ponctuelles. Selon la configuration, la pose peut être réalisée sur le dessus de la dalle (pose à la française) ou sur son côté (pose à l’anglaise). Le système doit être choisi en fonction du support et des contraintes de résistance." },
    ],
  },
  {
    slug: "mezzanine",
    kind: "usage",
    usage: "mezzanine",
    name: "Mezzanine",
    title: "Garde-corps de mezzanine",
    h1: "Garde-corps en verre pour mezzanine",
    metaTitle: "Garde-corps mezzanine — verre, inox, alu intérieur",
    metaDescription:
      "Sécurisez votre mezzanine avec style : garde-corps verre, inox ou alu, fixation plancher ou trémie. Conforme NF P01-012, devis en 24h.",
    intro:
      "Préservez la lumière et la sensation de hauteur de votre intérieur avec un garde-corps en verre sur mesure. Une protection discrète pour votre mezzanine, adaptée à la configuration de votre plancher.",
    benefits: [
      { title: "Lumière préservée", desc: "Le verre laisse circuler la lumière entre les niveaux — la mezzanine reste aérienne." },
      { title: "Esprit déco assumé", desc: "Câbles inox esprit loft, verre minimaliste ou alu noir mat architectural." },
      { title: "Sécurité des enfants", desc: "Remplissages conformes, sans point d’escalade, pour dormir tranquille." },
      { title: "Intégration à l’escalier", desc: "Continuité parfaite entre rampant d’escalier et garde-corps d’étage." },
    ],
    technical: [
      { title: "Fixation plancher ou trémie", desc: "À la française sur le plancher ou à l’anglaise en rive de trémie pour gagner de la surface." },
      { title: "Reprise dans la structure", desc: "Sur plancher bois, les fixations reprennent dans les solives — pas uniquement dans le parquet." },
      { title: "1,00 m + zone basse 45 cm", desc: "La norme s’applique en intérieur comme en extérieur dès 1 m de hauteur de chute." },
    ],
    faq: [
      { q: "Pourquoi choisir un garde-corps en verre pour sa mezzanine ?", a: "Un garde-corps en verre pour mezzanine permet de sécuriser votre espace en hauteur tout en préservant la lumière et la sensation de volume. Contrairement à un muret ou à des barreaux, le verre offre une transparence maximale et conserve la vue sur le séjour. C’est une solution moderne, idéale pour les mezzanines ouvertes et les intérieurs avec une grande hauteur sous plafond." },
      { q: "Comment fixer un garde-corps en verre sur une mezzanine en bois ?", a: "Un garde-corps en verre peut être installé sur une mezzanine en bois, à condition de fixer le système dans les éléments porteurs de la structure, comme les solives ou la poutre de rive. Selon la configuration, une pose sur le plancher ou en applique latérale est possible. Cette dernière permet également de préserver davantage de surface utile sur la mezzanine." },
      { q: "Quelle est la hauteur réglementaire d’un garde-corps de mezzanine ?", a: "Pour une mezzanine d’habitation, un garde-corps en verre doit généralement atteindre une hauteur minimale de 1 mètre, mesurée depuis le sol fini. La norme NF P01-012 encadre les exigences de sécurité, de hauteur et de résistance des protections contre les chutes. Certaines configurations, notamment en présence de meubles ou d’éléments servant d’appui, nécessitent une attention particulière." },
      { q: "Peut-on installer un garde-corps de mezzanine sans poteaux ni main courante ?", a: "Oui, certains systèmes de garde-corps tout verre permettent une installation sans poteaux apparents ni main courante, sous réserve d’être adaptés et validés pour cette configuration. Les panneaux sont maintenus par un rail ou des fixations spécifiques. Ce design minimaliste préserve la transparence, laisse circuler la lumière entre les étages et met en valeur l’architecture intérieure." },
      { q: "Comment raccorder un garde-corps en verre de mezzanine à un escalier ?", a: "Un garde-corps en verre sur mesure peut assurer une continuité esthétique entre la mezzanine et l’escalier. Les panneaux sont adaptés aux dimensions du plancher, aux angles et à la pente de l’escalier. Selon les contraintes techniques, différents systèmes de fixation peuvent être associés pour obtenir un ensemble harmonieux tout en respectant les exigences de sécurité propres à chaque zone." },
    ],
  },
  {
    slug: "fenetre",
    kind: "usage",
    usage: "fenetre",
    name: "Fenêtre",
    title: "Garde-corps de fenêtre & barre d’appui",
    metaTitle: "Garde-corps fenêtre — barre d’appui verre, alu, inox",
    metaDescription:
      "Barres d’appui et garde-corps de fenêtre en verre, alu ou inox pour vos ouvertures. Conforme NF P01-012, sur-mesure, devis en 24h.",
    intro:
      "Obligatoire dès que l’allège est trop basse : barre d’appui ou garde-corps discret, posé en tableau ou façade.",
    benefits: [
      { title: "Conformité des allèges", desc: "Sécurise les fenêtres dont l’allège est inférieure à 90 cm — une obligation trop souvent oubliée." },
      { title: "Discrétion maximale", desc: "Vitrage toute largeur ou fine lisse inox : la lumière et la vue avant tout." },
      { title: "Pose en tableau ou façade", desc: "Fixation dans l’épaisseur du mur ou en applique extérieure selon la menuiserie." },
      { title: "Sur-mesure au millimètre", desc: "Chaque baie est différente : fabrication à la cote exacte de vos ouvertures." },
    ],
    technical: [
      { title: "Allège < 90 cm = protection", desc: "Le Code de la construction impose une protection jusqu’à 1,00 m avec barre d’appui et élément de maintien." },
      { title: "Verre en applique", desc: "Un châssis vitré fixé en façade protège sans priver de lumière — idéal portes-fenêtres." },
      { title: "Scellement en tableau", desc: "Platines contre les tableaux maçonnés avec chevilles adaptées au support (brique, béton, pierre)." },
    ],
    faq: [
      { q: "Quand un garde-corps de fenêtre est-il obligatoire ?", a: "Dès que l’allège (hauteur sous la fenêtre) est inférieure à 90 cm avec une hauteur de chute d’un mètre ou plus : une protection d’au moins 1,00 m s’impose (barre d’appui + soubassement ou vitrage de protection)." },
      { q: "Qu’est-ce qu’une barre d’appui ?", a: "Une lisse horizontale fixée à environ 1 m, complétée d’un remplissage bas. En version contemporaine, un panneau de verre feuilleté toute largeur la remplace élégamment." },
      { q: "Peut-on poser sans percer la menuiserie ?", a: "Oui : la fixation se fait dans la maçonnerie (tableau ou façade), jamais dans la menuiserie elle-même." },
      { q: "Quel matériau pour rester discret ?", a: "Le verre feuilleté en applique est le plus invisible ; l’inox brossé en lisse fine est la solution classique ; l’alu laqué s’accorde à vos menuiseries." },
    ],
  },
  {
    slug: "interieur",
    kind: "usage",
    usage: "interieur",
    name: "Intérieur",
    title: "Garde-corps intérieur",
    metaTitle: "Garde-corps intérieur — verre, inox, alu design",
    metaDescription:
      "Garde-corps intérieur design pour escalier, mezzanine ou trémie : verre, inox ou alu noir mat. Sur-mesure, conforme, devis en 24h.",
    intro:
      "Un élément d’architecture : il structure l’espace et signe le style, du minimalisme verre à l’esprit atelier.",
    benefits: [
      { title: "Un geste déco fort", desc: "Verre invisible, alu noir mat esprit verrière ou inox loft : le style au service de la sécurité." },
      { title: "Lumière traversante", desc: "Les remplissages vitrés font circuler la lumière entre les pièces et les niveaux." },
      { title: "Sans entretien", desc: "Pas d’UV ni d’intempéries : les finitions intérieures restent neuves très longtemps." },
      { title: "Continuité des espaces", desc: "Escalier, palier, mezzanine : un même langage sur toute la circulation verticale." },
    ],
    technical: [
      { title: "Mêmes normes qu’en extérieur", desc: "NF P01-012 dès 1 m de chute : hauteur 1,00 m (90 cm en rampant), zone basse sécurisée." },
      { title: "Fixations invisibles", desc: "Profilé encastré dans la chape ou pinces discrètes : le rendu épuré se joue à la fixation." },
      { title: "Verre extra-clair en option", desc: "Pour une transparence absolue sans la teinte verte du verre standard." },
    ],
    faq: [
      { q: "Les normes s’appliquent-elles en intérieur ?", a: "Oui, exactement les mêmes : dès un mètre de hauteur de chute, la NF P01-012 impose 1,00 m de hauteur et une zone basse sécurisée, en maison comme en appartement." },
      { q: "Quel style pour un intérieur contemporain ?", a: "Le verre en profilé encastré (invisible), l’aluminium noir mat façon verrière d’atelier, ou l’inox câbles esprit loft : trois signatures très différentes, toutes conformes." },
      { q: "Le verre intérieur est-il différent ?", a: "Il reste feuilleté (sécurité oblige) mais peut être extra-clair, dépoli ou même teinté selon l’effet recherché." },
      { q: "Proposez-vous la pose en rénovation ?", a: "Oui : le sur-mesure d’usine est justement pensé pour s’adapter à l’existant — trémies hors d’équerre comprises." },
    ],
  },
  {
    slug: "exterieur",
    kind: "usage",
    usage: "exterieur",
    name: "Extérieur",
    title: "Garde-corps extérieur",
    metaTitle: "Garde-corps extérieur — verre, alu, inox durables",
    metaDescription:
      "Garde-corps extérieur toutes configurations : balcon, terrasse, escalier, muret. Matériaux anti-corrosion, conforme NF P01-012, devis 24h.",
    intro:
      "UV, pluie, gel, embruns : alu thermolaqué, inox 316 et verre feuilleté, conçus pour durer sans entretien.",
    benefits: [
      { title: "Résistance totale aux intempéries", desc: "Thermolaquage, inox marine et verre feuilleté : conçus pour l’exposition permanente." },
      { title: "Toutes configurations", desc: "Balcon, terrasse, escalier extérieur, muret, toiture-terrasse : une réponse par situation." },
      { title: "Zéro entretien", desc: "Aucune peinture ni lasure à refaire — un lavage à l’eau suffit." },
      { title: "Valeur ajoutée au bien", desc: "Une façade et des extérieurs sécurisés et design valorisent immédiatement la maison." },
    ],
    technical: [
      { title: "Visserie et platines inox", desc: "Toute la boulonnerie extérieure est en inox A2, ou A4/316 en bord de mer." },
      { title: "Scellement chimique", desc: "Sur béton, le scellement chimique garantit la tenue aux efforts normatifs sans éclater la dalle." },
      { title: "Dilatation maîtrisée", desc: "Les grands linéaires intègrent les jeux de dilatation nécessaires aux écarts de température." },
    ],
    faq: [
      { q: "Quel matériau vieillit le mieux dehors ?", a: "Les trois sont prévus pour l’extérieur : l’aluminium thermolaqué et l’inox (316 en zone marine) sont insensibles à la corrosion ; le verre feuilleté est, lui, insensible aux UV. Le choix se fait sur le style et le budget." },
      { q: "Faut-il un traitement anti-corrosion ?", a: "Non : le thermolaquage de l’alu et la nuance d’inox adaptée rendent tout traitement inutile. C’est l’avantage décisif sur l’acier ou le bois." },
      { q: "Résiste-t-il au vent ?", a: "Oui : les garde-corps sont dimensionnés pour les efforts normatifs, et en zone très ventée (littoral, étage élevé), nous adaptons épaisseurs de verre et entraxes de fixation." },
      { q: "Peut-on poser sur un muret ?", a: "Oui, c’est une configuration classique : platines sur muret avec scellement chimique, hauteur totale (muret + garde-corps) portée à 1,00 m minimum." },
    ],
  },
];

/* ------------------------------ Combos ----------------------------- */

/** Note technique spécifique à chaque couple matériau × usage. */
const comboNotes: Record<MaterialSlug, Record<string, string>> = {
  verre: {
    piscine: "Verre feuilleté trempé autoportant en profilé pince : aucune ossature verticale, vue totale sur le bassin, visserie 316.",
    escalier: "Panneaux feuilletés découpés en parallélogramme au degré près, fixés par pinces ou en applique sur limon.",
    balcon: "Verre 55.2 en nez de dalle (pose à l'anglaise) pour une façade épurée et 100 % de surface conservée.",
    terrasse: "Profilé aluminium en pince sur dalle : pose rapide, rendu panoramique sans poteaux.",
    mezzanine: "Verre extra-clair en pinces inox : la trémie disparaît visuellement, la lumière circule entre les niveaux.",
    fenetre: "Châssis vitré feuilleté posé en applique de façade : protection d'allège quasi invisible.",
    interieur: "Profilé encastré dans la chape pour un verre toute hauteur sans fixation apparente.",
    exterieur: "Feuilleté 44.2 à 66.2 selon exposition au vent, joints et cales EPDM pour la dilatation.",
  },
  aluminium: {
    piscine: "Thermolaquage insensible au chlore et visserie 316 : la solution budget des plages de piscine.",
    escalier: "Kit rampant à lisses réglables en pente de 25° à 45°, main courante alu assortie.",
    balcon: "Barreaudage vertical ≤ 11 cm ou tôle ajourée : conformité et intimité côté rue.",
    terrasse: "Modules de 1,5 à 2 m raccordables : les grands linéaires à budget maîtrisé, angles standard ou sur-mesure.",
    mezzanine: "Alu noir mat esprit verrière d'atelier : le style loft à prix contenu.",
    fenetre: "Lisse et barreaudage laqués à la teinte exacte de vos menuiseries (RAL identique).",
    interieur: "Profils fins laqués mat, sans entretien et légers à poser sur plancher bois.",
    exterieur: "Thermolaquage classe marine en option pour le littoral, platines et visserie inox.",
  },
  inox: {
    piscine: "Inox 316L impératif : poteaux, câbles et visserie résistent au chlore et aux projections.",
    escalier: "Câbles rampants tendus entre poteaux 316 ou 304, main courante Ø 42 mm continue.",
    balcon: "Barres horizontales Ø 12 mm ou remplissage verre : la ligne fine qui affine la façade.",
    terrasse: "Câbles tendus quasi invisibles à distance : le panorama sans le prix du tout-verre.",
    mezzanine: "Esprit loft : poteaux brossés et câbles fins, parfaits sur plancher bois ou métal.",
    fenetre: "Lisse d'appui Ø 42 mm en 304 brossé, scellée en tableau : le classique indémodable.",
    interieur: "304 brossé au toucher doux, associable au bois et au noir mat.",
    exterieur: "316 en bord de mer (< 10 km), passivation annuelle conseillée en exposition directe.",
  },
};

function buildCombo(m: MaterialSeed, u: UsageSeed): CatalogEntry {
  // Contenu rédigé sur-mesure par la flotte éditoriale, si disponible.
  const oc = comboContent[`${m.slug}-${u.slug}`];
  if (oc) {
    return {
      slug: `${m.slug}-${u.slug}`,
      kind: "combo",
      material: m.material,
      usage: u.slug,
      name: `${m.name} · ${u.name}`,
      ...oc,
    };
  }
  const matLabel = m.slug === "verre" ? "en verre" : m.slug === "aluminium" ? "en aluminium" : "en inox";
  const usageLabel =
    u.slug === "escalier" ? "d’escalier"
    : u.slug === "piscine" ? "de piscine"
    : u.slug === "balcon" ? "de balcon"
    : u.slug === "terrasse" ? "de terrasse"
    : u.slug === "mezzanine" ? "de mezzanine"
    : u.slug === "fenetre" ? "de fenêtre"
    : u.slug === "interieur" ? "intérieur"
    : "extérieur";
  const title = `Garde-corps ${matLabel} ${u.slug === "interieur" || u.slug === "exterieur" ? usageLabel : `pour ${u.name.toLowerCase()}`}`;
  return {
    slug: `${m.slug}-${u.slug}`,
    kind: "combo",
    material: m.material,
    usage: u.slug,
    name: `${m.name} · ${u.name}`,
    title,
    metaTitle: `${title} — sur-mesure & kit | devis 24h`,
    metaDescription: `${title} : ${comboNotes[m.material][u.slug].slice(0, 110)}… Devis détaillé gratuit en 24h.`,
    intro: `${comboNotes[m.material][u.slug]} Fabrication en direct usine, sur-mesure au millimètre ou en kit, conforme NF P01-012.`,
    benefits: [m.benefits[0], m.benefits[1], u.benefits[0], u.benefits[1]],
    technical: [
      { title: "La bonne configuration", desc: comboNotes[m.material][u.slug] },
      m.technical[0],
      u.technical[0],
    ],
    faq: [m.faq[1], u.faq[0], m.faq[0], u.faq[1] ? { q: u.faq[1].q, a: u.faq[1].a } : m.faq[2]].filter(Boolean) as QA[],
  };
}

/* Catalogue recentré sur le verre : les pages matériaux (verre, aluminium,
   inox) et leurs combinaisons ne sont plus publiées — anciennes URL
   redirigées en 301 dans next.config.ts. Les données matériaux restent
   comme source de contenu (FAQ homepage, regroupement des kits). */
export const combos: CatalogEntry[] = [];

/* ------------------------------ Accès ------------------------------ */

export const allCatalog: CatalogEntry[] = [...usages];

/* URL publique d'une entrée. Le slug interne reste la clé (usage du
   générateur, données) ; seules quelques pages ont une adresse dédiée,
   alignée sur leur mot-clé. Les anciennes adresses sont redirigées dans
   next.config.ts — garder les deux listes synchronisées. */
const CUSTOM_PATHS: Record<string, string> = {
  piscine: "/barriere-piscine-verre",
};

export function catalogPath(slug: string): string {
  return CUSTOM_PATHS[slug] ?? `/garde-corps/${slug}`;
}

export function getEntry(slug: string): CatalogEntry | undefined {
  return allCatalog.find((e) => e.slug === slug);
}

export function combosForMaterial(material: MaterialSlug): CatalogEntry[] {
  return combos.filter((c) => c.material === material);
}

export function combosForUsage(usage: string): CatalogEntry[] {
  return combos.filter((c) => c.usage === usage);
}
