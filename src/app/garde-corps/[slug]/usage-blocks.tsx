import type { ReactNode } from "react";
import Link from "next/link";
import {
  Anchor,
  Ban,
  BrickWall,
  DoorOpen,
  Gem,
  Layers,
  Lock,
  MoveHorizontal,
  PanelBottom,
  Ruler,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/* ================================================================== */
/*  Contenu des trois blocs placés sous le générateur sur les pages    */
/*  par usage. La mise en page est commune (page.tsx) ; chaque usage   */
/*  n'apporte ici que ses textes, ses images et ses liens.             */
/*                                                                      */
/*    1. vue     — le visuel d'abord (comparateur avant/après ou photo) */
/*       formes  — (facultatif) trois cartes illustrées, juste après    */
/*    2. norme   — les repères réglementaires, photo en regard          */
/*    3. matiere — la photo produit, puis l'essentiel sur les matériaux */
/*                                                                      */
/*  Une page sans entrée ici garde les blocs génériques du gabarit.     */
/* ================================================================== */

type Img = { src: string; alt: string };
type Cta = { label: string; href: string };

export type UsageBlocks = {
  vue: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    media:
      | { kind: "compare"; before: Img; after: Img; caption: string }
      | { kind: "image"; src: string; alt: string; caption?: string };
    /** Trois points distincts, sans pictos. */
    points: { t: string; d: string }[];
    cta: Cta;
  };
  /** Facultatif : trois cartes illustrées (ex. formes d'escalier). */
  formes?: {
    h2: ReactNode;
    intro: ReactNode;
    cards: { t: string; d: string; point: string; img: string; alt: string }[];
    cta: Cta;
  };
  norme: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    /** Ce que la norme regarde — formulé sans promesse de conformité. */
    items: { icon: LucideIcon; t: string; d: string }[];
    note: ReactNode;
    photo: Img;
    cta: Cta;
  };
  matiere: {
    kicker: string;
    h2: ReactNode;
    text: ReactNode;
    /** Une ligne de bénéfices, écrite une seule fois dans le HTML. */
    benefits?: string[];
    note?: ReactNode;
    /** Variante « chiffre clé » : remplace la ligne de bénéfices et la note. */
    proof?: {
      stat: { value: string; label: string };
      highlight: { icon: LucideIcon; t: string; d: ReactNode };
      features: { icon: LucideIcon; t: string; d: string }[];
      footnote: string;
    };
    /** Photo produit : paysage court en mobile, portrait en desktop. */
    photoPaysage: string;
    photoPortrait: string;
    alt: string;
    cta: Cta;
  };
  faqTitle: string;
};

const ACCENT = "whitespace-nowrap text-pine-600";
const NOTE_LINK = "font-semibold text-pine-700 underline decoration-pine-300 underline-offset-2 hover:text-pine-600";

/* ---- éléments communs aux pages régies par la NF P01-012 ---- */

/** Images provisoires d'une page : recadrages de sa photo de haut de page,
 *  en attendant des photos dédiées (voir public/usage-<slug>-*.webp). */
const provisoire = (slug: string) => ({
  vue: `/usage-${slug}-vue.webp`,
  norme: `/usage-${slug}-norme.webp`,
  paysage: `/usage-${slug}-detail-paysage.webp`,
  portrait: `/usage-${slug}-detail-portrait.webp`,
});

const NOTE_P01012 = (
  <>
    La norme NF&nbsp;P01-012 a été révisée en 2024. Les cotes de votre garde-corps sont établies selon la
    version en vigueur et vérifiées avec vous au moment du devis.
  </>
);

const NOTE_EPAISSEURS = (
  <>
    Trois épaisseurs au choix selon la fixation retenue :{" "}
    <Link href="/verre/66-4" className={NOTE_LINK}>
      66.4
    </Link>
    ,{" "}
    <Link href="/verre/88-4" className={NOTE_LINK}>
      88.4
    </Link>{" "}
    et{" "}
    <Link href="/verre/1010-4" className={NOTE_LINK}>
      1010.4
    </Link>
    .
  </>
);

const STAT_600 = { value: "600 N/m", label: "Charge horizontale de référence en habitation*" };
const FOOTNOTE_EUROCODE = "*Selon l’Eurocode 1 (EN 1991-1-1) et son Annexe Nationale.";

export const USAGE_BLOCKS: Record<string, UsageBlocks> = {
  /* ------------------------------ PISCINE ------------------------------ */
  piscine: {
    vue: {
      kicker: "Transparence & design",
      h2: "Sécurisez votre piscine sans gâcher la vue",
      intro: (
        <>
          Une barrière de piscine en verre protège les abords du bassin sans les cacher : l&rsquo;eau, la
          terrasse et le jardin restent visibles, comme avant.
        </>
      ),
      media: {
        kind: "compare",
        caption: "Faites glisser pour comparer : la même piscine, avant et après.",
        before: {
          src: "/comparateur-piscine-avant.webp",
          alt: "Piscine sans barrière de protection, vue depuis la terrasse",
        },
        after: {
          src: "/comparateur-piscine-apres.webp",
          alt: "La même piscine entourée d’une barrière de piscine en verre, prise du même angle",
        },
      },
      points: [
        {
          t: "La vue reste entière",
          d: "Depuis la maison comme depuis la terrasse, le regard porte jusqu’au bassin, sans barreaux ni grillage.",
        },
        {
          t: "Le décor n’est pas coupé",
          d: "Une barrière en verre pour piscine s’efface devant la pierre, le bois ou la végétation, dans un extérieur contemporain comme traditionnel.",
        },
        {
          t: "Un tracé à vos mesures",
          d: "Longueurs, angles et type de fixation sont définis selon votre bassin et ses abords.",
        },
      ],
      cta: { label: "Configurer ma barrière de piscine", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Barrière de piscine <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P90-306</span>
        </>
      ),
      intro: (
        <>
          Toute piscine privée enterrée ou semi-enterrée doit être équipée d&rsquo;un dispositif de
          sécurité normalisé. Pour une barrière, la référence est la norme NF&nbsp;P90-306 : elle vise à
          empêcher un enfant de moins de 5 ans d&rsquo;accéder seul au bassin.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "Une hauteur de 1,10 m minimum",
          d: "La hauteur de protection est évaluée depuis chaque point d’appui accessible : sol, marche ou muret à proximité de la piscine.",
        },
        {
          icon: DoorOpen,
          t: "Un portillon intégré et sécurisé",
          d: "Entièrement vitré, le portillon s’intègre harmonieusement à la barrière. Il doit rester fermé et verrouillé après chaque passage.",
        },
        {
          icon: Lock,
          t: "Un verrouillage adapté à la sécurité des enfants",
          d: "Le système de fermeture doit résister aux tentatives d’ouverture des enfants de moins de 5 ans, pour une protection renforcée.",
        },
        {
          icon: Ban,
          t: "Une conception limitant l’escalade",
          d: "La surface lisse et continue du verre limite les prises. Aucun mobilier, jardinière ou autre point d’appui ne doit faciliter le franchissement.",
        },
      ],
      note: (
        <>
          La conformité s&rsquo;apprécie sur l&rsquo;installation complète (implantation, pose, portillon,
          abords), pas sur les panneaux seuls. Nous faisons le point avec vous au moment du devis.
        </>
      ),
      photo: {
        src: "/barriere-piscine-nf.webp",
        alt: "Barrière de piscine en verre sur pinces inox, avec portillon, autour d’un bassin",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=piscine" },
    },
    matiere: {
      kicker: "Matériaux & durabilité",
      h2: (
        <>
          Une visserie <span className={ACCENT}>inox 316</span> <br className="hidden lg:block" />
          pensée pour durer
        </>
      ),
      text: (
        <>
          Nos barrières de piscine en verre intègrent une visserie en inox 316, reconnu pour sa
          résistance renforcée à la corrosion. Un choix particulièrement adapté aux environnements
          humides et aux abords des piscines, qui associe durabilité et finition soignée.
        </>
      ),
      benefits: [
        "Résistance renforcée à la corrosion",
        "Adapté aux environnements piscine",
        "Finition discrète et élégante",
      ],
      note: (
        <>
          Comme tout inox, il n&rsquo;est pas inaltérable : un rinçage occasionnel à l&rsquo;eau claire
          aide à préserver son aspect.
        </>
      ),
      photoPaysage: "/inox-316-piscine-paysage.webp",
      photoPortrait: "/inox-316-piscine-portrait.webp",
      alt: "Fixation d’une barrière de piscine en verre au bord du bassin, visserie en inox 316",
      cta: { label: "Configurer ma barrière", href: "/generateur?usage=piscine" },
    },
    faqTitle: "Questions fréquentes sur les barrières de piscine en verre",
  },

  /* ------------------------------ ESCALIER ----------------------------- */
  /* Les images des blocs norme et matière sont provisoires (recadrages de
     la photo du haut de page) en attendant des photos dédiées. */
  escalier: {
    vue: {
      kicker: "Lumière & design",
      h2: "Sécurisez votre escalier sans perdre la lumière",
      intro: (
        <>
          Un garde-corps d&rsquo;escalier en verre protège la montée sans cloisonner la pièce : la lumière
          traverse et l&rsquo;escalier reste visible, comme un élément du décor.
        </>
      ),
      media: {
        kind: "compare",
        caption: "Faites glisser pour comparer : le même escalier, rampe pleine puis garde-corps en verre.",
        before: {
          src: "/comparateur-escalier-avant.webp",
          alt: "Escalier fermé par une rampe pleine maçonnée, dans un séjour lumineux",
        },
        after: {
          src: "/comparateur-escalier-apres.webp",
          alt: "Le même escalier ouvert sur le séjour, protégé par un garde-corps d’escalier en verre",
        },
      },
      points: [
        {
          t: "La lumière circule",
          d: "Séjour, entrée ou cage d’escalier : le verre laisse passer le jour là où des barreaux le découpent.",
        },
        {
          t: "L’escalier reste en vue",
          d: "Marches, limon et matériaux ne disparaissent plus derrière une rampe pleine.",
        },
        {
          t: "Une découpe à votre pente",
          d: "Chaque panneau est taillé en parallélogramme, au degré près, d’après vos cotes.",
        },
      ],
      cta: { label: "Configurer mon garde-corps d’escalier", href: "#estimation" },
    },
    formes: {
      h2: (
        <>
          Adapté à <span className={ACCENT}>toutes les formes</span> d&rsquo;escalier
        </>
      ),
      intro: (
        <>
          Droit, quart tournant ou hélicoïdal : chaque garde-corps en verre est fabriqué sur mesure, d&rsquo;après
          les cotes de votre escalier, en intérieur comme en extérieur.
        </>
      ),
      cards: [
        {
          t: "Escalier droit",
          d: "Une seule volée, une seule pente : les panneaux s’alignent d’un bout à l’autre, sans rupture.",
          point: "Protection continue sur toute la longueur",
          img: "/escalier-droit.svg",
          alt: "Schéma d’un escalier droit équipé d’un garde-corps en verre",
        },
        {
          t: "Escalier quart tournant",
          d: "Un quart de tour, ou deux : chaque panneau est découpé à l’angle exact pour accompagner le virage et le palier.",
          point: "Changement d’angle géré au degré près",
          img: "/escalier-tournant.svg",
          alt: "Schéma d’un escalier quart tournant avec palier, équipé d’un garde-corps en verre",
        },
        {
          t: "Escalier hélicoïdal",
          d: "Pour une courbe, les panneaux sont définis d’après un gabarit relevé sur votre escalier, marche après marche.",
          point: "Une protection qui suit la courbe",
          img: "/escalier-helicoidal.svg",
          alt: "Schéma d’un escalier hélicoïdal équipé d’un garde-corps en verre",
        },
      ],
      cta: { label: "Devis rapide en ligne", href: "/generateur?usage=escalier" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps d&rsquo;escalier <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Dès qu&rsquo;une chute de plus d&rsquo;un mètre est possible, l&rsquo;escalier doit être protégé. La
          norme NF&nbsp;P01-012 fixe les dimensions à respecter : hauteur, remplissage et continuité de la
          protection.
        </>
      ),
      items: [
        {
          icon: TrendingUp,
          t: "0,90 m minimum dans la volée",
          d: "Sur la partie en pente, la hauteur se mesure à la verticale du nez de marche.",
        },
        {
          icon: Ruler,
          t: "1,00 m sur les paliers",
          d: "Palier, arrivée d’étage ou trémie : les parties horizontales demandent une hauteur de protection plus élevée.",
        },
        {
          icon: Ban,
          t: "Un remplissage qui ne se grimpe pas",
          d: "Un vitrage plein et lisse n’offre ni barreau ni lisse horizontale sur lesquels prendre appui.",
        },
        {
          icon: MoveHorizontal,
          t: "Un vitrage continu",
          d: "Les panneaux se suivent sans interruption sur toute la volée, y compris dans les tournants. La main courante est proposée en option.",
        },
      ],
      note: (
        <>
          La norme NF&nbsp;P01-012 a été révisée en 2024. Les cotes de votre garde-corps sont établies selon
          la version en vigueur et vérifiées avec vous au moment du devis.
        </>
      ),
      photo: {
        src: "/escalier-norme.webp",
        alt: "Garde-corps d’escalier en verre suivant la pente d’une volée droite",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=escalier" },
    },
    matiere: {
      kicker: "Résistance & sécurité",
      h2: (
        <>
          La transparence du verre. <br className="hidden sm:block" />
          La <span className={ACCENT}>résistance</span> d&rsquo;un véritable{" "}
          <span className="whitespace-nowrap">garde-corps.</span>
        </>
      ),
      text: (
        <>
          Derrière son apparence légère, le verre feuilleté de sécurité est conçu pour répondre aux
          contraintes mécaniques d&rsquo;un escalier et offrir une protection fiable contre les chutes.
        </>
      ),
      proof: {
        stat: { value: "600 N/m", label: "Charge horizontale de référence en habitation*" },
        highlight: {
          icon: Layers,
          t: "Verre feuilleté de sécurité",
          d: "Plusieurs feuilles de verre assemblées par un intercalaire, qui retient les fragments en cas de casse.",
        },
        features: [
          {
            icon: ShieldCheck,
            t: "Protection antichute",
            d: "Une conception pensée pour répondre aux exigences de sécurité en vigueur.",
          },
          {
            icon: Gem,
            t: "Haute résistance",
            d: "Un ensemble vitrage et fixations dimensionné pour durer.",
          },
        ],
        footnote: "*Selon l’Eurocode 1 (EN 1991-1-1) et son Annexe Nationale.",
      },
      note: (
        <>
          Trois épaisseurs au choix selon la fixation retenue :{" "}
          <Link href="/verre/66-4" className={NOTE_LINK}>
            66.4
          </Link>
          ,{" "}
          <Link href="/verre/88-4" className={NOTE_LINK}>
            88.4
          </Link>{" "}
          et{" "}
          <Link href="/verre/1010-4" className={NOTE_LINK}>
            1010.4
          </Link>
          .
        </>
      ),
      photoPaysage: "/escalier-detail-paysage.webp",
      photoPortrait: "/escalier-detail-portrait.webp",
      alt: "Détail d’un garde-corps d’escalier en verre feuilleté fixé sur le limon",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=escalier" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps d’escalier en verre",
  },
  /* ------------------------------ BALCON ------------------------------- */
  balcon: {
    vue: {
      kicker: "Vue & façade",
      h2: "Sécurisez votre balcon sans fermer la vue",
      intro: (
        <>
          Un garde-corps de balcon en verre protège du vide sans barrer le paysage : la vue reste dégagée
          depuis la pièce, et la façade garde une ligne nette côté rue.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("balcon").vue,
        alt: "Balcon ouvert sur la campagne, protégé par un garde-corps de balcon en verre",
      },
      points: [
        {
          t: "La vue reste ouverte",
          d: "Assis ou debout, plus aucun barreau à hauteur de regard : le paysage entre jusque dans la pièce.",
        },
        {
          t: "La façade s’allège",
          d: "Vu de la rue, le vitrage dessine une ligne fine et continue, en construction neuve comme en rénovation.",
        },
        {
          t: "Toute la surface reste utile",
          d: "Posé sur la dalle ou en nez de dalle, le garde-corps est implanté selon la place dont vous disposez.",
        },
      ],
      cta: { label: "Configurer mon garde-corps de balcon", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps de balcon <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Dès qu&rsquo;une chute de plus d&rsquo;un mètre est possible, le balcon doit être protégé. La norme
          NF&nbsp;P01-012 encadre cette protection : hauteur, remplissage et tenue à la poussée.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "1,00 m de hauteur minimum",
          d: "La hauteur se mesure depuis le sol fini du balcon, revêtement compris.",
        },
        {
          icon: PanelBottom,
          t: "Une zone basse sans vide",
          d: "Sur les 45 premiers centimètres, le remplissage doit rester plein ou très serré : un vitrage toute hauteur y répond naturellement.",
        },
        {
          icon: Ban,
          t: "Aucun appui pour grimper",
          d: "Une surface lisse et continue ne laisse ni lisse ni barreau horizontal à escalader.",
        },
        {
          icon: Anchor,
          t: "Une fixation reprise dans la structure",
          d: "Les ancrages se font dans la dalle ou le nez de dalle, jamais dans le seul revêtement.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("balcon").norme,
        alt: "Garde-corps de balcon en verre toute hauteur, fixé en rive de dalle",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=balcon" },
    },
    matiere: {
      kicker: "Résistance & sécurité",
      h2: (
        <>
          Un vitrage discret, <br className="hidden sm:block" />
          <span className={ACCENT}>dimensionné</span> pour la poussée.
        </>
      ),
      text: (
        <>
          Un balcon se vit accoudé : le garde-corps doit reprendre l&rsquo;appui de plusieurs personnes sans
          fléchir. Le verre feuilleté et ses fixations sont dimensionnés en conséquence, d&rsquo;après la
          configuration de votre balcon.
        </>
      ),
      proof: {
        stat: STAT_600,
        highlight: {
          icon: Layers,
          t: "Verre feuilleté de sécurité",
          d: "Deux vitrages assemblés par des films intercalaires : en cas de casse, l’ensemble reste en place.",
        },
        features: [
          {
            icon: ShieldCheck,
            t: "Visserie inox 316",
            d: "Une visserie prévue pour l’exposition permanente d’un balcon : pluie, gel, air marin.",
          },
          {
            icon: Gem,
            t: "Pose française ou anglaise",
            d: "Sur la dalle, ou en applique contre le nez de dalle pour libérer la surface.",
          },
        ],
        footnote: FOOTNOTE_EUROCODE,
      },
      note: NOTE_EPAISSEURS,
      photoPaysage: provisoire("balcon").paysage,
      photoPortrait: provisoire("balcon").portrait,
      alt: "Détail d’un garde-corps de balcon en verre feuilleté et de sa fixation basse",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=balcon" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps de balcon en verre",
  },

  /* ------------------------------ TERRASSE ----------------------------- */
  terrasse: {
    vue: {
      kicker: "Panorama & design",
      h2: "Sécurisez votre terrasse sans perdre le panorama",
      intro: (
        <>
          Un garde-corps de terrasse en verre protège le bord sans le souligner : depuis la table comme
          depuis le salon de jardin, le regard file jusqu&rsquo;à l&rsquo;horizon.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("terrasse").vue,
        alt: "Toit-terrasse aménagé avec vue sur la ville, protégé par un garde-corps de terrasse en verre",
      },
      points: [
        {
          t: "Le panorama reste entier",
          d: "Jardin, ville ou mer : rien ne vient découper la vue à hauteur de regard, même assis.",
        },
        {
          t: "Un abri discret",
          d: "Un vitrage plein atténue le vent sur la terrasse, sans dresser d’écran opaque.",
        },
        {
          t: "De grandes longueurs, angles compris",
          d: "Terrasses en L ou en U, retours et grands linéaires sont fabriqués d’après vos cotes.",
        },
      ],
      cta: { label: "Configurer mon garde-corps de terrasse", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps de terrasse <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Terrasse surélevée, toit-terrasse accessible ou plage dominant le jardin : dès qu&rsquo;une chute de
          plus d&rsquo;un mètre est possible, une protection s&rsquo;impose. La norme NF&nbsp;P01-012 en fixe
          les dimensions.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "1,00 m de hauteur minimum",
          d: "Mesurée depuis le sol fini de la terrasse : dalle, carrelage ou lames posées.",
        },
        {
          icon: BrickWall,
          t: "Muret et acrotère pris en compte",
          d: "Un muret, un acrotère ou une jardinière en bord de terrasse modifient la hauteur à prévoir : nous l’intégrons à l’étude.",
        },
        {
          icon: PanelBottom,
          t: "Un remplissage sans vide",
          d: "Sur toute sa hauteur, le vitrage ne laisse ni jour ni appui, y compris en partie basse.",
        },
        {
          icon: Anchor,
          t: "Une fixation adaptée au support",
          d: "Dalle béton, structure bois ou acier : les ancrages reprennent les efforts dans la structure, pas dans le revêtement.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("terrasse").norme,
        alt: "Garde-corps de terrasse en verre en bordure d’un toit-terrasse",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=terrasse" },
    },
    matiere: {
      kicker: "Pose & durabilité",
      h2: (
        <>
          Une pose pensée pour <br className="hidden lg:block" />
          <span className={ACCENT}>votre support</span>
        </>
      ),
      text: (
        <>
          Dalle béton, terrasse bois ou toiture accessible : la fixation ne se choisit pas au hasard. Nous
          retenons le système adapté à votre support — rail au sol, pinces ou pose en applique — avec une
          visserie en inox 316, prévue pour l&rsquo;exposition permanente.
        </>
      ),
      benefits: ["Fixation étudiée selon le support", "Écoulement des eaux respecté", "Visserie inox 316"],
      note: (
        <>
          Sur une terrasse étanchée, la fixation est étudiée pour préserver l&rsquo;étanchéité :
          précisez-le dans votre demande.
        </>
      ),
      photoPaysage: provisoire("terrasse").paysage,
      photoPortrait: provisoire("terrasse").portrait,
      alt: "Détail d’un garde-corps de terrasse en verre et de sa fixation au sol",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=terrasse" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps de terrasse en verre",
  },

  /* ------------------------------ MEZZANINE ---------------------------- */
  mezzanine: {
    vue: {
      kicker: "Lumière & volume",
      h2: "Sécurisez votre mezzanine sans cloisonner l’espace",
      intro: (
        <>
          Un garde-corps de mezzanine en verre protège la trémie sans fermer le volume : la lumière circule
          entre les niveaux et la pièce garde toute sa hauteur.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("mezzanine").vue,
        alt: "Mezzanine ouverte sur un séjour lumineux, protégée par un garde-corps de mezzanine en verre",
      },
      points: [
        {
          t: "Le volume reste lisible",
          d: "Depuis le séjour, la mezzanine se devine au lieu de disparaître derrière une cloison ou des barreaux.",
        },
        {
          t: "La lumière passe d’un niveau à l’autre",
          d: "Le vitrage laisse filer le jour des baies vers l’étage, et inversement.",
        },
        {
          t: "Dans la continuité de l’escalier",
          d: "Garde-corps d’étage et rampant d’escalier se prolongent dans une même ligne.",
        },
      ],
      cta: { label: "Configurer mon garde-corps de mezzanine", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps de mezzanine <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          La norme NF&nbsp;P01-012 s&rsquo;applique en intérieur comme en extérieur : dès qu&rsquo;une chute de
          plus d&rsquo;un mètre est possible, la mezzanine doit être protégée sur toute sa rive.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "1,00 m de hauteur minimum",
          d: "Mesurée depuis le sol fini de la mezzanine, parquet ou revêtement compris.",
        },
        {
          icon: PanelBottom,
          t: "Une zone basse sans vide",
          d: "Le remplissage reste plein en partie basse : un vitrage toute hauteur ne laisse aucun passage.",
        },
        {
          icon: Ban,
          t: "Rien à escalader",
          d: "Ni lisse ni barreau horizontal. Un point à surveiller aussi côté mobilier : lit ou bureau placé contre le garde-corps.",
        },
        {
          icon: Anchor,
          t: "Une fixation reprise dans la structure",
          d: "Sur plancher bois, les ancrages se font dans les solives ou la rive de trémie, pas dans le seul parquet.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("mezzanine").norme,
        alt: "Garde-corps de mezzanine en verre toute hauteur, en rive de plancher",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=mezzanine" },
    },
    matiere: {
      kicker: "Résistance & sécurité",
      h2: (
        <>
          Fin en apparence, <br className="hidden sm:block" />
          <span className={ACCENT}>dimensionné</span> pour l&rsquo;appui.
        </>
      ),
      text: (
        <>
          En mezzanine, on s&rsquo;accoude au garde-corps pour regarder en bas. Le verre feuilleté et ses
          fixations sont dimensionnés pour reprendre cet appui, d&rsquo;après votre trémie et la nature de
          votre plancher.
        </>
      ),
      proof: {
        stat: STAT_600,
        highlight: {
          icon: Layers,
          t: "Verre feuilleté de sécurité",
          d: "En cas de casse, les films intercalaires maintiennent le vitrage en place au-dessus du niveau inférieur.",
        },
        features: [
          {
            icon: ShieldCheck,
            t: "Fixation en rive ou sur plancher",
            d: "En applique contre la trémie pour gagner de la surface, ou posée sur le sol.",
          },
          {
            icon: Gem,
            t: "Verre clair ou extra-clair",
            d: "En option, l’extra-clair supprime la légère teinte verte du verre standard.",
          },
        ],
        footnote: FOOTNOTE_EUROCODE,
      },
      note: NOTE_EPAISSEURS,
      photoPaysage: provisoire("mezzanine").paysage,
      photoPortrait: provisoire("mezzanine").portrait,
      alt: "Détail d’un garde-corps de mezzanine en verre feuilleté au-dessus d’un séjour",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=mezzanine" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps de mezzanine en verre",
  },

  /* ------------------------------ FENÊTRE ------------------------------ */
  fenetre: {
    vue: {
      kicker: "Lumière & discrétion",
      h2: "Sécurisez vos fenêtres sans assombrir la pièce",
      intro: (
        <>
          Un garde-corps de fenêtre en verre protège une allège basse ou une porte-fenêtre sans barrer
          l&rsquo;ouverture : la lumière entre en entier et la façade reste nette.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("fenetre").vue,
        alt: "Façade contemporaine dont les fenêtres sont protégées par des garde-corps de fenêtre en verre",
      },
      points: [
        {
          t: "Toute la lumière",
          d: "Pas de barreaudage devant la vitre : le jour entre sur toute la hauteur de la baie.",
        },
        {
          t: "Une façade sans surcharge",
          d: "Vu de l’extérieur, le vitrage se confond avec la menuiserie et laisse la façade lisible.",
        },
        {
          t: "À la cote de chaque baie",
          d: "Chaque ouverture est mesurée et fabriquée séparément, au millimètre.",
        },
      ],
      cta: { label: "Configurer mon garde-corps de fenêtre", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps de fenêtre <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Une fenêtre dont l&rsquo;allège est basse, ou une porte-fenêtre sans balcon, doit être protégée dès
          qu&rsquo;une chute de plus d&rsquo;un mètre est possible. La norme NF&nbsp;P01-012 précise la hauteur
          et le remplissage attendus.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "Une allège sous 0,90 m appelle une protection",
          d: "En dessous de cette hauteur, la fenêtre doit recevoir une barre d’appui ou un garde-corps.",
        },
        {
          icon: TrendingUp,
          t: "1,00 m de hauteur de protection",
          d: "Allège et garde-corps doivent atteindre ensemble cette cote, mesurée depuis le sol intérieur.",
        },
        {
          icon: PanelBottom,
          t: "Un remplissage sans vide",
          d: "Un panneau vitré toute largeur ferme l’ouverture sans laisser de jour en partie basse.",
        },
        {
          icon: BrickWall,
          t: "Une fixation dans la maçonnerie",
          d: "En tableau ou en façade, les ancrages se font dans le mur, jamais dans la menuiserie.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("fenetre").norme,
        alt: "Fenêtre à allège basse protégée par un garde-corps de fenêtre en verre",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=fenetre" },
    },
    matiere: {
      kicker: "Pose & durabilité",
      h2: (
        <>
          Une fixation <span className={ACCENT}>dans le mur</span>, <br className="hidden lg:block" />
          pas dans la menuiserie
        </>
      ),
      text: (
        <>
          Nos garde-corps de fenêtre en verre se fixent en tableau, dans l&rsquo;épaisseur du mur, ou en
          applique sur la façade. Les ancrages sont choisis selon le support — brique, béton ou pierre — et
          la visserie en inox 316 est prévue pour rester dehors.
        </>
      ),
      benefits: ["Pose en tableau ou en façade", "Visserie inox 316", "Verre feuilleté de sécurité"],
      note: <>Le type de cheville dépend du mur : nous le déterminons d&rsquo;après vos photos et vos cotes.</>,
      photoPaysage: provisoire("fenetre").paysage,
      photoPortrait: provisoire("fenetre").portrait,
      alt: "Détail d’un garde-corps de fenêtre en verre fixé dans le tableau de la baie",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=fenetre" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps de fenêtre en verre",
  },

  /* ------------------------------ INTÉRIEUR ---------------------------- */
  interieur: {
    vue: {
      kicker: "Lumière & architecture",
      h2: "Sécurisez vos espaces intérieurs sans les cloisonner",
      intro: (
        <>
          Palier, trémie, coursive ou étage ouvert : un garde-corps intérieur en verre délimite le vide sans
          dresser de cloison, et laisse la lumière passer d&rsquo;une pièce à l&rsquo;autre.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("interieur").vue,
        alt: "Coursive intérieure ouverte sur un grand volume, protégée par un garde-corps intérieur en verre",
      },
      points: [
        {
          t: "L’espace reste ouvert",
          d: "Le regard traverse : les volumes paraissent plus grands qu’avec un muret ou un barreaudage.",
        },
        {
          t: "Un même langage partout",
          d: "Escalier, palier et mezzanine reçoivent le même vitrage, pour une circulation cohérente.",
        },
        {
          t: "Une fixation qui se fait oublier",
          d: "Rail encastré dans le sol ou pinces discrètes : le choix de la fixation décide du rendu.",
        },
      ],
      cta: { label: "Configurer mon garde-corps intérieur", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps intérieur <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Les règles sont les mêmes en intérieur qu&rsquo;en extérieur : dès qu&rsquo;une chute de plus
          d&rsquo;un mètre est possible, la norme NF&nbsp;P01-012 fixe la hauteur et le remplissage de la
          protection.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "1,00 m sur les parties horizontales",
          d: "Palier, coursive ou étage : la hauteur se mesure depuis le sol fini.",
        },
        {
          icon: TrendingUp,
          t: "0,90 m dans l’escalier",
          d: "Sur la partie en pente, la hauteur se mesure à la verticale du nez de marche.",
        },
        {
          icon: PanelBottom,
          t: "Une zone basse sans vide",
          d: "Le remplissage reste plein en partie basse : un vitrage toute hauteur y répond d’emblée.",
        },
        {
          icon: Anchor,
          t: "Une fixation reprise dans la structure",
          d: "Dalle, chape ou plancher bois : les ancrages vont chercher la structure, pas le seul revêtement.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("interieur").norme,
        alt: "Garde-corps intérieur en verre le long d’une coursive",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=interieur" },
    },
    matiere: {
      kicker: "Matériaux & finitions",
      h2: (
        <>
          Un <span className={ACCENT}>verre feuilleté</span>, <br className="hidden lg:block" />
          clair ou extra-clair
        </>
      ),
      text: (
        <>
          Nos garde-corps intérieurs sont réalisés en verre feuilleté de sécurité : deux vitrages assemblés
          par des films intercalaires, qui restent solidaires en cas de choc. À l&rsquo;abri des intempéries,
          vitrage et fixations conservent durablement leur aspect.
        </>
      ),
      benefits: ["Verre feuilleté de sécurité", "Extra-clair en option", "Entretien d’une simple vitre"],
      note: NOTE_EPAISSEURS,
      photoPaysage: provisoire("interieur").paysage,
      photoPortrait: provisoire("interieur").portrait,
      alt: "Détail d’un garde-corps intérieur en verre feuilleté et de sa fixation au sol",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=interieur" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps intérieurs en verre",
  },

  /* ------------------------------ EXTÉRIEUR ---------------------------- */
  exterieur: {
    vue: {
      kicker: "Vue & extérieurs",
      h2: "Sécurisez vos extérieurs sans couper le paysage",
      intro: (
        <>
          Terrasse, escalier de jardin, muret ou toiture accessible : un garde-corps extérieur en verre
          protège chaque dénivelé sans dresser d&rsquo;écran entre la maison et le jardin.
        </>
      ),
      media: {
        kind: "image",
        src: provisoire("exterieur").vue,
        alt: "Terrasse et escalier extérieurs d’une maison, protégés par un garde-corps extérieur en verre",
      },
      points: [
        {
          t: "Le jardin reste en vue",
          d: "Depuis la maison, le jardin et ceux qui s’y trouvent restent visibles derrière le vitrage.",
        },
        {
          t: "Une seule ligne pour tout l’extérieur",
          d: "Terrasse, escalier et muret reçoivent le même garde-corps, pour un ensemble cohérent.",
        },
        {
          t: "Adapté à chaque support",
          d: "Sur dalle, sur muret ou en applique : la fixation est choisie selon l’ouvrage existant.",
        },
      ],
      cta: { label: "Configurer mon garde-corps extérieur", href: "#estimation" },
    },
    norme: {
      kicker: "Sécurité & réglementation",
      h2: (
        <>
          Garde-corps extérieur <br className="sm:hidden" />
          en verre et norme <span className={ACCENT}>NF P01-012</span>
        </>
      ),
      intro: (
        <>
          Dehors, les dénivelés se multiplient : terrasse surélevée, escalier, muret de soutènement. Dès
          qu&rsquo;une chute de plus d&rsquo;un mètre est possible, la norme NF&nbsp;P01-012 fixe les
          dimensions de la protection.
        </>
      ),
      items: [
        {
          icon: Ruler,
          t: "1,00 m de hauteur minimum",
          d: "Sur les parties horizontales, la hauteur se mesure depuis le sol fini.",
        },
        {
          icon: TrendingUp,
          t: "0,90 m dans un escalier",
          d: "Sur la partie en pente, la hauteur se mesure à la verticale du nez de marche.",
        },
        {
          icon: BrickWall,
          t: "Sur muret, la hauteur se complète",
          d: "Muret et garde-corps doivent atteindre ensemble la cote de protection.",
        },
        {
          icon: Anchor,
          t: "Un ancrage adapté au support",
          d: "Sur béton, les fixations sont scellées pour reprendre les efforts sans fragiliser la dalle ou le muret.",
        },
      ],
      note: NOTE_P01012,
      photo: {
        src: provisoire("exterieur").norme,
        alt: "Garde-corps extérieur en verre le long d’un escalier de jardin",
      },
      cta: { label: "Obtenir mon devis", href: "/generateur?usage=exterieur" },
    },
    matiere: {
      kicker: "Matériaux & durabilité",
      h2: (
        <>
          Une visserie <span className={ACCENT}>inox 316</span> <br className="hidden lg:block" />
          pour rester dehors
        </>
      ),
      text: (
        <>
          Pluie, gel, soleil : un garde-corps extérieur est exposé toute l&rsquo;année. Le verre feuilleté ne
          craint pas les UV, et toute notre visserie est en inox 316, reconnu pour sa résistance renforcée à
          la corrosion.
        </>
      ),
      benefits: ["Résistance renforcée à la corrosion", "Verre insensible aux UV", "Entretien à l’eau claire"],
      note: (
        <>
          Comme tout inox, il n&rsquo;est pas inaltérable : en bord de mer, un rinçage régulier à l&rsquo;eau
          claire aide à préserver son aspect.
        </>
      ),
      photoPaysage: provisoire("exterieur").paysage,
      photoPortrait: provisoire("exterieur").portrait,
      alt: "Détail d’un garde-corps extérieur en verre et de sa visserie en inox 316",
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=exterieur" },
    },
    faqTitle: "Questions fréquentes sur les garde-corps extérieurs en verre",
  },
};
