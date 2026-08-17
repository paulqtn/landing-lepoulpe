/* Version temporaire — les 4 guides fondateurs ; la série complète (20 guides)
   rédigée par la flotte éditoriale arrive au prochain push. */

import type { Guide } from "../guides";

export const guidesData: Guide[] = [
  {
    slug: "hauteur-garde-corps-norme",
    title: "Hauteur réglementaire d’un garde-corps : ce que dit la norme",
    metaTitle: "Hauteur garde-corps : norme NF P01-012 expliquée",
    metaDescription:
      "1 m, 90 cm en escalier, zone basse de 45 cm : toutes les hauteurs réglementaires d'un garde-corps selon la NF P01-012, cas par cas.",
    excerpt: "1,00 m, 90 cm en rampant, zone basse de 45 cm : les hauteurs à respecter, cas par cas.",
    sections: [
      {
        heading: "La règle générale : 1,00 m minimum",
        body: "La norme NF P01-012 fixe la hauteur minimale d’un garde-corps à 1,00 m, mesurée depuis la zone de stationnement normal (le sol fini) jusqu’au sommet de la main courante. Cette hauteur vaut pour les balcons, terrasses, mezzanines, paliers et toutes les zones horizontales présentant une hauteur de chute d’un mètre ou plus. Un cas particulier : si le garde-corps est très épais (au moins 50 cm d’épaisseur totale, comme un muret couronné), la hauteur peut être abaissée à 80 cm, l’épaisseur empêchant le basculement.",
      },
      {
        heading: "En escalier : 90 cm en rampant",
        body: "Sur la partie rampante d’un escalier, la hauteur minimale passe à 90 cm, mesurée verticalement depuis le nez de marche. Dès que l’on revient sur un palier ou une circulation horizontale, on repasse à 1,00 m. C’est pour cela qu’une rampe bien conçue « remonte » visuellement à l’arrivée de la volée.",
      },
      {
        heading: "La zone de sécurité basse : 45 cm",
        body: "Les 45 premiers centimètres du garde-corps doivent être infranchissables : soit pleins (verre, tôle, muret), soit à barreaudage vertical dont l’espacement ne dépasse pas 11 cm. Objectif : empêcher un jeune enfant de passer au travers ou d’y prendre appui pour escalader. Au-dessus de cette zone, les espacements horizontaux sont limités à 18 cm.",
      },
      {
        heading: "Éviter l’effet d’échelle",
        body: "La norme proscrit tout élément facilitant l’escalade dans la zone comprise entre 45 et 70 cm : lisses horizontales saillantes, ornements, traverses intermédiaires. Les remplissages à câbles ou barres horizontales restent possibles, mais leur conception doit limiter l’appui de pied — c’est un point que nous validons systématiquement sur nos configurations.",
      },
      {
        heading: "Qui est concerné, et quels risques ?",
        body: "La norme s’applique aux bâtiments d’habitation neufs et, de fait, à toute rénovation sérieuse : en cas d’accident, la responsabilité du propriétaire (ou du poseur) est engagée si l’ouvrage n’est pas conforme. Les assurances s’appuient sur la NF P01-012 pour évaluer la conformité. Tous nos garde-corps, kits comme sur-mesure, sont conçus pour la respecter.",
      },
    ],
    faq: [
      { q: "1 m se mesure depuis où exactement ?", a: "Depuis la surface de stationnement normal — le sol fini sur lequel on se tient — jusqu’au sommet de la main courante. Sur un muret, on additionne muret + garde-corps." },
      { q: "Puis-je faire plus haut que la norme ?", a: "Oui, la norme fixe des minima. 1,10 m est courant en garde-corps vitré, et c’est le minimum si l’ouvrage sert aussi de barrière de piscine (NF P90-306)." },
      { q: "Et pour une fenêtre ?", a: "Si l’allège est inférieure à 90 cm, une protection portée à 1,00 m s’impose (barre d’appui avec remplissage). Voir notre guide dédié aux garde-corps de fenêtre." },
    ],
  },
  {
    slug: "quel-materiau-garde-corps",
    title: "Verre, aluminium ou inox : quel matériau pour votre garde-corps ?",
    metaTitle: "Verre, alu ou inox : quel garde-corps choisir ?",
    metaDescription:
      "Comparatif complet verre / aluminium / inox pour garde-corps : prix au ml, entretien, style, durabilité, usages recommandés.",
    excerpt: "Prix, entretien, style, durabilité : le comparatif complet pour choisir sans se tromper.",
    sections: [
      {
        heading: "Le verre : la vue avant tout",
        body: "Le garde-corps vitré s’impose dès que le paysage compte : terrasse avec vue, plage de piscine, balcon. Le verre feuilleté (44.2 minimum, 55.2 en autoportant) est sécuritaire par construction : en cas de casse, les films PVB retiennent les morceaux. Comptez 250 à 450 €/ml en kit. Son seul entretien : un coup de raclette. Sa limite : le budget, supérieur à l’aluminium, et le nettoyage plus fréquent si l’on est exigeant sur la transparence.",
      },
      {
        heading: "L’aluminium : le rapport qualité/prix",
        body: "Thermolaqué dans n’importe quelle teinte RAL, l’aluminium est léger, rigide, insensible à la corrosion et le plus abordable de la gamme (150 à 300 €/ml en kit). Barreaudage, tôle ajourée ou remplissage vitré : il couvre tous les styles, du classique au contemporain. C’est le choix rationnel pour les grands linéaires et les budgets maîtrisés.",
      },
      {
        heading: "L’inox : la durabilité architecturale",
        body: "Câbles tendus, barres horizontales ou pinces à verre : l’inox signe les projets d’architecte. En nuance 304 pour l’intérieur, 316/316L autour des piscines et en bord de mer, il traverse les décennies sans broncher. Comptez 180 à 350 €/ml en kit. Sa ligne fine préserve les vues presque autant que le verre, pour un budget intermédiaire.",
      },
      {
        heading: "Les combinaisons gagnantes",
        body: "Les matériaux se marient : structure aluminium + remplissage verre (rigidité + transparence à prix contenu), poteaux inox + verre en pinces (le classique premium), main courante inox sur verre autoportant (confort de préhension). Le sur-mesure d’usine permet exactement ces assemblages.",
      },
      {
        heading: "Notre grille de décision rapide",
        body: "Vue exceptionnelle ou piscine : verre (ou inox câbles en second choix). Budget serré, grande longueur, teinte assortie aux menuiseries : aluminium. Bord de mer, esprit loft ou exigence de durabilité maximale : inox 316. Hésitation ? Le configurateur vous oriente en 1 minute, et un conseiller affine gratuitement.",
      },
    ],
    faq: [
      { q: "Quel est le matériau le moins cher ?", a: "L’aluminium, de 150 à 300 €/ml en kit fourniture. L’inox est intermédiaire, le verre le plus haut de gamme — mais l’écart se réduit sur les versions structure alu + vitrage." },
      { q: "Quel matériau près de la mer ?", a: "Inox 316/316L ou aluminium avec thermolaquage classe marine. Le verre feuilleté est insensible au sel — c’est sa quincaillerie qui doit être en 316." },
      { q: "Peut-on mélanger les matériaux ?", a: "Oui, c’est même recommandé : alu + verre, inox + verre, inox + câbles… Nos gammes sont conçues pour composer." },
    ],
  },
  {
    slug: "kit-ou-sur-mesure",
    title: "Garde-corps en kit ou sur-mesure : que choisir ?",
    metaTitle: "Garde-corps : kit ou sur-mesure ? Le vrai comparatif",
    metaDescription:
      "Kit à poser soi-même ou fabrication sur-mesure posée : prix, délais, cas d'usage — comment choisir la bonne formule pour votre garde-corps.",
    excerpt: "Prix, délais, complexité du chantier : la bonne formule selon votre projet.",
    sections: [
      {
        heading: "Le kit : rapide et économique",
        body: "Un kit est un garde-corps pré-dimensionné, livré avec notice, gabarits et visserie, recoupable pour s’ajuster. Il excelle sur les configurations simples : linéaire droit, escalier droit standard, trémie rectangulaire. L’économie est double — prix de fourniture réduit et pose réalisable soi-même par un bon bricoleur (perforateur, niveau, clé dynamométrique).",
      },
      {
        heading: "Le sur-mesure : la réponse exacte",
        body: "Angles hors 90°, escaliers tournants, murets irréguliers, grandes hauteurs de verre, teinte RAL précise : dès que le chantier sort du standard, le sur-mesure s’impose. Chaque élément est fabriqué d’après votre relevé de cotes (que nous vous guidons à réaliser, ou que notre poseur effectue), pour un ajustement au millimètre et un rendu sans compromis.",
      },
      {
        heading: "Les prix comparés",
        body: "À matériau égal, comptez environ 20 à 35 % d’écart entre le kit et le sur-mesure en fourniture. Avec pose, l’écart total est plus marqué : un kit auto-posé évite la main-d’œuvre (300 à 500 € la journée de pose en moyenne). Notre conseil : ne choisissez pas le kit uniquement pour le prix si votre configuration est complexe — les reprises coûtent plus cher que le sur-mesure initial.",
      },
      {
        heading: "Délais et logistique",
        body: "Kit standard : expédition rapide, livraison partout en France sur palette. Sur-mesure : comptez la fabrication d’usine en plus (quelques semaines selon la charge et la finition), avec un contrôle qualité avant départ. Dans les deux cas, le devis détaillé est envoyé sous 24h.",
      },
      {
        heading: "Notre recommandation honnête",
        body: "70 % des projets simples (terrasse droite, balcon standard, trémie rectangulaire) sont parfaitement servis par un kit. Pour le reste — et pour tous les escaliers tournants — le sur-mesure est un investissement qui se voit et se revend. Le configurateur vous oriente, et un conseiller tranche gratuitement les cas limites sur photos.",
      },
    ],
    faq: [
      { q: "Un kit est-il aussi conforme qu’un sur-mesure ?", a: "Oui : nos kits sont dimensionnés pour la NF P01-012 au même titre que le sur-mesure. La conformité finale dépend en revanche de la qualité de la pose — d’où l’importance de suivre la notice et les couples de serrage." },
      { q: "Puis-je recouper un kit moi-même ?", a: "Les modules aluminium et les mains courantes se recoupent à la scie à métaux ou à l’onglet. Le verre, lui, ne se recoupe jamais sur chantier : il se commande à la cote." },
      { q: "Proposez-vous la pose des kits ?", a: "Oui : kit + pose par notre réseau est une formule courante, qui reste plus économique que le sur-mesure posé sur les configurations simples." },
    ],
  },
  {
    slug: "prix-garde-corps",
    title: "Prix d’un garde-corps en 2026 : le guide complet",
    metaTitle: "Prix garde-corps 2026 : verre, alu, inox au ml",
    metaDescription:
      "Combien coûte un garde-corps en 2026 ? Prix au mètre linéaire par matériau (verre, alu, inox), kit vs posé, et les postes qui font varier la facture.",
    excerpt: "Les vrais prix au mètre linéaire, matériau par matériau, kit et posé.",
    sections: [
      {
        heading: "Les fourchettes au mètre linéaire",
        body: "En fourniture kit : aluminium 150 à 300 €/ml, inox 180 à 350 €/ml, verre 250 à 450 €/ml. Avec pose professionnelle : aluminium 300 à 550 €/ml, inox 350 à 600 €/ml, verre 450 à 800 €/ml. Ces fourchettes couvrent la grande majorité des configurations résidentielles ; les projets d’exception (verre 88.4 toute hauteur, inox poli miroir) peuvent les dépasser.",
      },
      {
        heading: "Ce qui fait varier le prix",
        body: "Cinq postes pèsent sur la facture : le matériau et sa finition (RAL spécifique, 316L, verre extra-clair), le type de remplissage (barreaudage < tôle < câbles < verre), la fixation (française simple, anglaise plus technique, autoportant premium), la complexité (angles, pentes, tournants) et l’accès au chantier (étage, échafaudage). Un devis sérieux détaille chacun de ces postes — méfiez-vous des prix au ml « tout compris » sans visite ni photos.",
      },
      {
        heading: "Kit auto-posé : l’économie réelle",
        body: "Poser soi-même un kit économise la main-d’œuvre, soit 300 à 500 € par journée de pose selon les régions. Sur un linéaire de 6 m simple, l’économie atteint couramment 800 à 1 200 €. Condition : un support sain, de l’outillage correct et le respect scrupuleux de la notice — la conformité de l’ouvrage en dépend.",
      },
      {
        heading: "Les pièges à éviter",
        body: "Trois pièges classiques : le verre non feuilleté (illégal en garde-corps, même s’il est trempé), l’inox 304 vendu pour du bord de mer (il piquera en quelques mois), et les fixations sous-dimensionnées sur plancher bois. Un prix anormalement bas cache presque toujours l’un des trois. Exigez la mention de la norme, la composition du verre et la nuance d’inox sur le devis.",
      },
      {
        heading: "Obtenir un prix fiable en 24h",
        body: "Notre configurateur donne une estimation immédiate à partir de votre linéaire, du matériau et de la formule kit ou posé. Un conseiller la transforme ensuite en devis détaillé — postes séparés, fourniture et pose distinctes — sous 24h, gratuitement et sans engagement. C’est le moyen le plus rapide d’avoir un chiffre sérieux sans visite préalable.",
      },
    ],
    faq: [
      { q: "Quel budget pour 5 m de garde-corps en verre ?", a: "En kit autoportant : 1 250 à 2 250 € de fourniture. Posé par un professionnel : 2 250 à 4 000 € selon la fixation et l’accès. Le devis 24h affine selon votre configuration exacte." },
      { q: "La pose est-elle éligible à une TVA réduite ?", a: "En rénovation d’un logement de plus de 2 ans, la fourniture posée par une entreprise relève en général de la TVA à 10 % — un avantage non négligeable face à l’achat seul à 20 %. Votre devis le précise." },
      { q: "Le sur-mesure est-il beaucoup plus cher ?", a: "Comptez 20 à 35 % de plus que le kit équivalent en fourniture. Sur les configurations complexes, il est en réalité plus économique que des kits adaptés à coups de reprises." },
    ],
  },
];
