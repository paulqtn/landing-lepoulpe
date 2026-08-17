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
      "Le garde-corps en verre offre une sécurité totale sans jamais bloquer la vue. Verre feuilleté 44.2 à 88.4 selon la configuration, fixations invisibles ou profilé aluminium en pince : un rendu épuré, conforme à la norme NF P01-012.",
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
      "Léger, moderne et sans entretien, le garde-corps aluminium est le meilleur rapport qualité/prix du marché. Thermolaqué dans la teinte RAL de votre choix, il traverse les années sans peinture ni corrosion.",
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
      "Intemporel et quasi indestructible, le garde-corps inox s’adapte à tous les styles : câbles tendus, barres horizontales ou remplissage verre. Inox 304 en intérieur, 316 autour des piscines et en bord de mer.",
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
    title: "Garde-corps de piscine",
    metaTitle: "Garde-corps piscine — verre, inox, alu | direct usine",
    metaDescription:
      "Sécurisez les abords de votre piscine sans sacrifier la vue : garde-corps verre autoportant, inox 316 ou aluminium. Devis gratuit en 24h.",
    intro:
      "Autour d’un bassin, le garde-corps doit conjuguer sécurité, résistance au chlore et transparence. Verre feuilleté autoportant pour une vue totale, inox 316 pour la durabilité, aluminium thermolaqué pour le budget.",
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
      { q: "Un garde-corps suffit-il pour sécuriser ma piscine ?", a: "Un garde-corps sécurise une zone en hauteur (plage surélevée, terrasse dominant le bassin). S’il sert de barrière de protection de la piscine elle-même, il doit en plus répondre à la norme NF P90-306 (hauteur, portillon, résistance)." },
      { q: "Quel matériau autour d’une piscine ?", a: "Le verre feuilleté (vue et absence de corrosion) et l’inox 316 (résistance au chlore) sont les deux références. L’aluminium thermolaqué est l’option économique, également sans corrosion." },
      { q: "Le verre ne chauffe-t-il pas au soleil ?", a: "Le verre monte en température mais reste manipulable ; contrairement au métal foncé, il ne provoque pas de brûlure au contact bref. L’essentiel du confort se joue sur la plage elle-même." },
      { q: "Quelle hauteur autour d’une piscine ?", a: "En garde-corps de zone en hauteur : 1,00 m minimum (NF P01-012). En barrière de piscine NF P90-306 : 1,10 m minimum depuis le sol." },
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
      "Un garde-corps d’escalier se fabrique au degré près : pente relevée, verre découpé en parallélogramme ou lisses rampantes, main courante continue. Sur-mesure intégral, conforme à la norme.",
    benefits: [
      { title: "Sur-mesure au degré près", desc: "Chaque volée est différente : nous fabriquons d’après vos cotes et votre pente exacte." },
      { title: "Main courante continue", desc: "Une préhension confortable et conforme sur toute la volée, y compris les tournants." },
      { title: "Lumière traversante", desc: "En verre, l’escalier reste baigné de lumière — idéal dans un séjour ou une cage sombre." },
      { title: "Montée sécurisée", desc: "Remplissages conformes : pas d’effet d’échelle, espacements contrôlés." },
    ],
    technical: [
      { title: "Hauteur en rampant", desc: "90 cm minimum mesurés verticalement depuis le nez de marche (1,00 m sur les paliers)." },
      { title: "Découpes en parallélogramme", desc: "En verre, chaque panneau suit la pente : découpe et façonnage au degré près en usine." },
      { title: "Fixation latérale ou sur marche", desc: "À l’anglaise sur limon, ou à la française sur les marches selon l’escalier." },
    ],
    faq: [
      { q: "Quelle hauteur pour une rampe d’escalier ?", a: "La norme NF P01-012 impose 90 cm minimum en partie rampante (mesurés à la verticale du nez de marche) et 1,00 m sur les paliers et parties horizontales." },
      { q: "Peut-on mettre du verre dans un escalier ?", a: "Oui, en feuilleté 44.2 minimum. Les panneaux sont découpés en parallélogramme pour épouser la pente, fixés par pinces sur poteaux ou en applique sur le limon." },
      { q: "Faites-vous les escaliers tournants ?", a: "Oui : quart tournant, double quart, hélicoïdal. Le sur-mesure d’après relevé de cotes (gabarit si nécessaire) est justement notre spécialité." },
      { q: "Kit ou sur-mesure pour un escalier ?", a: "L’escalier droit standard peut se traiter en kit rampant réglable. Dès qu’il y a des tournants ou des angles spécifiques, le sur-mesure s’impose." },
    ],
  },
  {
    slug: "balcon",
    kind: "usage",
    usage: "balcon",
    name: "Balcon",
    title: "Garde-corps de balcon",
    metaTitle: "Garde-corps balcon — verre, alu, inox | sur-mesure",
    metaDescription:
      "Remplacez ou créez votre garde-corps de balcon : verre, aluminium ou inox, pose française ou anglaise. Conforme NF P01-012, devis en 24h.",
    intro:
      "Le balcon est l’usage roi du garde-corps : hauteur de chute réelle, exposition aux intempéries et exigence esthétique côté rue. Fixation sur dalle ou en nez de dalle, remplissage verre, tôle ou barreaudage.",
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
      { q: "Quelle hauteur pour un garde-corps de balcon ?", a: "1,00 m minimum depuis le sol fini, avec une zone de sécurité pleine ou à barreaudage serré sur les 45 premiers centimètres (NF P01-012)." },
      { q: "Peut-on remplacer un garde-corps existant ?", a: "Oui, c’est un chantier courant : dépose de l’ancien ouvrage, reprise des fixations et pose du nouveau. En copropriété, l’accord du syndic est nécessaire (aspect de façade)." },
      { q: "Pose française ou anglaise : quelle différence ?", a: "Française : fixé sur le dessus de la dalle. Anglaise : fixé en applique contre le nez de dalle, ce qui libère la surface du balcon et donne une ligne plus fine vue de la rue." },
      { q: "Quel matériau pour un balcon exposé ?", a: "Les trois conviennent : verre feuilleté (vue), aluminium thermolaqué (budget/entretien), inox 316 en bord de mer. Le choix se joue sur l’esthétique et l’exposition." },
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
      "Terrasse surélevée, toit-terrasse ou plage bois : dès 1 m de hauteur de chute, le garde-corps s’impose. Le verre préserve le panorama, l’aluminium habille de grandes longueurs à budget maîtrisé.",
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
      { q: "À partir de quelle hauteur un garde-corps est-il obligatoire ?", a: "La règle usuelle retient 1 m de hauteur de chute (et dès 45 cm, la prudence l’impose). Sur une terrasse surélevée ou un toit-terrasse accessible, le garde-corps normatif est incontournable." },
      { q: "Peut-on fixer sur une terrasse bois ?", a: "Oui, à condition de reprendre les efforts dans la structure (solives, muralière) et pas seulement dans les lames. Nos platines et tirefonds structurels sont prévus pour." },
      { q: "Verre ou aluminium pour une terrasse ?", a: "Verre si la vue est le critère n°1 ; aluminium pour les grands linéaires à budget maîtrisé ; les deux se combinent (structure alu + remplissage verre)." },
      { q: "Gérez-vous les angles et les pentes ?", a: "Oui : angles à 90° ou sur-mesure, terrasses en L ou U, et adaptation aux légères pentes de drainage. C’est l’intérêt du sur-mesure d’usine." },
    ],
  },
  {
    slug: "mezzanine",
    kind: "usage",
    usage: "mezzanine",
    name: "Mezzanine",
    title: "Garde-corps de mezzanine",
    metaTitle: "Garde-corps mezzanine — verre, inox, alu intérieur",
    metaDescription:
      "Sécurisez votre mezzanine avec style : garde-corps verre, inox ou alu, fixation plancher ou trémie. Conforme NF P01-012, devis en 24h.",
    intro:
      "En mezzanine, le garde-corps sécurise la trémie tout en participant pleinement à la décoration intérieure. Verre pour la lumière, inox pour l’esprit loft, aluminium pour la sobriété.",
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
      { q: "La norme s’applique-t-elle en intérieur ?", a: "Oui : dès qu’il y a une hauteur de chute d’un mètre ou plus, la NF P01-012 s’applique, mezzanines comprises — hauteur 1,00 m et zone basse sécurisée." },
      { q: "Quel garde-corps pour un petit espace ?", a: "Le verre en pinces ou le câble inox : des sections minimales qui ne mangent pas l’espace visuel et laissent passer la lumière." },
      { q: "Peut-on fixer sur un plancher bois ?", a: "Oui, en reprenant les efforts dans les solives via tirefonds structurels ou contre-plaques. Nous validons la fixation d’après vos photos et cotes." },
      { q: "Kit possible en mezzanine ?", a: "Oui pour les trémies droites standard. Pour les retours en angle et les liaisons avec l’escalier, le sur-mesure garantit un rendu parfait." },
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
      "Fenêtre à soubassement bas, porte-fenêtre à l’étage : la barre d’appui ou le garde-corps de fenêtre est obligatoire dès que l’allège est trop basse. Discret, sur-mesure, posé en tableau ou en façade.",
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
      "À l’intérieur, le garde-corps devient un élément d’architecture : il structure l’espace, guide la lumière et signe le style de la maison — du minimalisme verre à l’esprit atelier.",
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
      "UV, pluie, gel, embruns : dehors, le garde-corps ne pardonne pas les matériaux médiocres. Aluminium thermolaqué, inox 316 et verre feuilleté sont conçus pour durer sans entretien.",
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

export const combos: CatalogEntry[] = materials.flatMap((m) => usages.map((u) => buildCombo(m, u)));

/* ------------------------------ Accès ------------------------------ */

export const allCatalog: CatalogEntry[] = [...materials, ...usages, ...combos];

export function getEntry(slug: string): CatalogEntry | undefined {
  return allCatalog.find((e) => e.slug === slug);
}

export function combosForMaterial(material: MaterialSlug): CatalogEntry[] {
  return combos.filter((c) => c.material === material);
}

export function combosForUsage(usage: string): CatalogEntry[] {
  return combos.filter((c) => c.usage === usage);
}
