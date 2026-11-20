import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import type { FixationPose } from "@/components/FixationPoses";
import {
  Anchor,
  Ban,
  BrickWall,
  DoorOpen,
  Gem,
  Hand,
  HousePlus,
  Layers,
  Lock,
  MoveHorizontal,
  PanelBottom,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/* Pictogramme « hauteur d'allège » : une cote verticale à double flèche,
   bornée en haut et en bas — fidèle à la maquette du bloc fenêtre. */
function HauteurAllegeIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 4h10M7 20h10" />
      <path d="M12 7v10" />
      <path d="M9.5 9.5L12 7l2.5 2.5M9.5 14.5L12 17l2.5-2.5" />
    </svg>
  );
}

/* Pictogramme « fenêtre » : un cadre à croisillons. */
function FenetreCroisillonsIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

/* Pictogramme « pièces » : une petite pile de pièces de monnaie. */
function PiecesIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="6" rx="7" ry="2.6" />
      <path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" />
      <path d="M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
    </svg>
  );
}

/* Pictogramme maison « main courante » : une lisse posée sur deux montants
   — lucide n'a pas d'équivalent parlant. Même signature que ses icônes. */
/* Pictogramme « fixation au sol » : goujon à tête ronde sur sa platine. */
function FixationSolIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="6.2" r="2.4" />
      <path d="M12 8.6v5.9" />
      <rect x="3.8" y="14.5" width="16.4" height="4.2" rx="1.3" />
      <path d="M7.4 16.6h.01M16.6 16.6h.01" />
    </svg>
  );
}

/* Pictogramme « durable » : bouclier à feuille. */
function BouclierFeuilleIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3l7 2.8v5.1c0 4.4-2.9 7.6-7 9.1-4.1-1.5-7-4.7-7-9.1V5.8L12 3z" />
      <path d="M9.1 14.3c.2-3 2.3-4.9 5.8-5-.1 3.1-2.2 5.1-5.8 5z" />
      <path d="M9.6 13.9l4.3-3.8" />
    </svg>
  );
}

function MainCouranteIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="19" height="4.5" rx="2.25" />
      <path d="M7 10.5V19M17 10.5V19" />
    </svg>
  );
}

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
      | {
          kind: "compare";
          before: Img;
          after: Img;
          caption: string;
          /** Intitulé du curseur pour les lecteurs d'écran. */
          ariaLabel?: string;
        }
      | { kind: "image"; src: string; alt: string; caption?: string };
    /** Trois points distincts, sans pictos. */
    points: { t: string; d: string }[];
    /** Facultatif : courte note éditoriale sous les points, avant le CTA. */
    footnote?: ReactNode;
    cta: Cta;
  };
  /** Facultatif : trois cartes illustrées (ex. formes d'escalier). */
  formes?: {
    h2: ReactNode;
    intro: ReactNode;
    cards: { t: string; d: string; point: string; img: string; alt: string }[];
    cta: Cta;
  };
  /** Facultatif : sélecteur de pose interactif — cartes accordéon à gauche,
      panneau d'illustrations (vue + détail technique) synchronisé à droite. */
  fixations?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    poses: FixationPose[];
    /** Sous-titre du panneau d'illustrations. */
    panelSub: string;
  };
  /** Facultatif : l'argumentaire solidité — photo badgée à gauche, accordéon
      exclusif à droite, rangée des normes et CTA à coches. */
  solidite?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    /** true : la photo passe à droite du contenu en desktop. */
    imageRight?: true;
    photo: Img & { badge: string };
    items: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      t: string;
      d: ReactNode;
      /** Petit visuel facultatif à droite du texte déplié. */
      img?: Img;
    }[];
    cta: Cta & { checks?: string[] };
  };
  /** Facultatif : dimensions & pose — en-tête aligné à gauche, accordéon
      exclusif, photo à droite, CTA à points et note normative. */
  dimensions?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    items: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      t: string;
      d: ReactNode;
    }[];
    photo: Img;
    cta: Cta;
    points: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      label: string;
    }[];
    /** Note en italique à droite du CTA. */
    note: ReactNode;
  };
  /** Facultatif : le système de fixation — photo à gauche, deux modes de pose
      schématisés, note sur le support et CTA. */
  systeme?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    photo: Img;
    modes: {
      /** Le schéma fourni en image, affiché dans sa carte à bord gris. */
      img: Img;
      t: string;
      d: string;
    }[];
    support: {
      /** L'icône fournie en image, posée sur une tuile blanche. */
      img: Img;
      d: ReactNode;
    };
    cta: Cta;
  };
  /** Facultatif : l'argumentaire valorisation — photo à gauche, trois cartes
      de bénéfices et CTA à points de réassurance. */
  valeur?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    /** Sans src, un placeholder tient la place en attendant le visuel. */
    photo: { src?: string; alt: string };
    cards: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      t: ReactNode;
      d: string;
    }[];
    cta: Cta;
    points: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      label: string;
    }[];
  };
  /** Facultatif : galerie de réalisations — cards photo à étiquette. */
  realisations?: {
    kicker: string;
    h2: ReactNode;
    cta: Cta;
    /** true : le bloc se place juste avant la FAQ au lieu de sa position haute. */
    beforeFaq?: true;
    items: { src: string; alt: string; tag: string; title: string }[];
  };
  /** Facultatif : une vidéo YouTube intégrée (façade légère, iframe au clic). */
  video?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    youtubeId: string;
    /** Démarrage en secondes. */
    start?: number;
    /** Titre accessible de la vidéo. */
    title: string;
    /** true : le bloc se place juste avant la FAQ au lieu de sa position haute. */
    beforeFaq?: true;
  };
  /** Facultatif : l'argumentaire robustesse — photo en regard, médaillon de détail. */
  durable?: {
    badge: string;
    h2: ReactNode;
    intro: ReactNode;
    items: {
      icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
      t: string;
      d: ReactNode;
    }[];
    photo: Img & { position?: string };
  };
  /** Facultatif : une page peut s'en passer (ex. balcon). */
  norme?: {
    kicker: string;
    h2: ReactNode;
    intro: ReactNode;
    /** Ce que la norme regarde — formulé sans promesse de conformité. */
    items: { icon: LucideIcon; t: string; d: string }[];
    note: ReactNode;
    photo: Img;
    cta: Cta;
  };
  /** Facultatif : une page peut s'en passer (ex. balcon). */
  matiere?: {
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
        ariaLabel: "Comparer la piscine avant et après la pose de la barrière en verre",
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
          Une fixation en <span className={ACCENT}>aluminium anodisé</span> <br className="hidden lg:block" />
          pensée pour durer
        </>
      ),
      text: (
        <>
          Nos barrières de piscine en verre intègrent des pinces et rails en aluminium anodisé, reconnus
          pour leur excellente résistance à la corrosion. Un choix particulièrement adapté aux
          environnements humides et aux abords des piscines, qui associe durabilité et finition soignée.
        </>
      ),
      benefits: [
        "Résistance durable à la corrosion",
        "Adapté aux environnements piscine",
        "Finition discrète et élégante",
      ],
      note: (
        <>
          L&rsquo;anodisation protège l&rsquo;aluminium, qui ne rouille pas : un simple rinçage à l&rsquo;eau
          claire suffit à l&rsquo;entretenir. La visserie, elle, est en inox 316.
        </>
      ),
      photoPaysage: "/fixation-alu-piscine-paysage.webp",
      photoPortrait: "/fixation-alu-piscine-portrait.webp",
      alt: "Pince de fixation en aluminium anodisé d’une barrière de piscine en verre, au bord du bassin",
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
          d: "Une seule volée, une seule pente : les panneaux s’alignent d’un bout à l’autre, à intervalle régulier.",
          point: "Protection sur toute la longueur de la volée",
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
          norme NF&nbsp;P01-012 fixe les dimensions à respecter : hauteur, remplissage et espacements de la
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
          t: "Un espacement maîtrisé entre panneaux",
          d: "L’écart entre deux panneaux de verre respecte la limite fixée par la norme, sur toute la volée comme dans les tournants. La main courante est proposée en option.",
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
        alt: "Un enfant monte sereinement un escalier protégé par un garde-corps en verre toute hauteur",
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
        kind: "compare",
        caption: "Faites glisser pour comparer : le même balcon, garde-corps plein puis garde-corps en verre.",
        before: {
          src: "/comparateur-balcon-avant.webp",
          alt: "Balcon fermé par un garde-corps métallique plein qui masque le paysage",
        },
        after: {
          src: "/comparateur-balcon-apres.webp",
          alt: "Le même balcon protégé par un garde-corps de balcon en verre, la vue sur les collines entièrement dégagée",
        },
      },
      points: [
        {
          t: "La vue reste ouverte",
          d: "Assis ou debout, plus aucun barreau à hauteur de regard : le paysage entre jusque dans la pièce.",
        },
        {
          t: "La façade s’allège",
          d: "Vu de la rue, le vitrage dessine une ligne fine et régulière, en construction neuve comme en rénovation.",
        },
        {
          t: "Toute la surface reste utile",
          d: "Posé sur la dalle ou en nez de dalle, le garde-corps est implanté selon la place dont vous disposez.",
        },
      ],
      footnote: (
        <>
          Sur un balcon d&rsquo;appartement, chaque centimètre compte. Un garde-corps vitré permet de
          préserver la luminosité et la sensation d&rsquo;espace, même sur un balcon étroit. Il constitue
          aussi une solution élégante pour remplacer une ancienne rambarde métallique ou un garde-corps
          plein, tout en modernisant la façade.
        </>
      ),
      cta: { label: "Configurer mon garde-corps de balcon", href: "#estimation" },
    },
    video: {
      kicker: "Pose & installation",
      h2: "Une pose simple",
      intro: (
        <>
          Rail fixé, vitrage glissé, cales de réglage : la pose d&rsquo;un garde-corps en verre est à la
          portée d&rsquo;un bon bricoleur. La preuve en images.
        </>
      ),
      youtubeId: "EXIJ5lMdFtM",
      title: "Pose d’un garde-corps en verre : la vidéo d’installation",
    },
    realisations: {
      kicker: "Sur le terrain",
      h2: "Ils ont installé nos garde-corps en verre sur leur balcon",
      cta: { label: "Estimer le mien", href: "/generateur?usage=balcon" },
      items: [
        {
          src: "/pose-anglaise-balcon.webp",
          alt: "Garde-corps en verre posé en nez de dalle sur un balcon face à la mer",
          tag: "Nez de dalle",
          title: "Balcon face à la mer",
        },
        {
          src: "/usage-balcon-vue.webp",
          alt: "Garde-corps en verre sur rail posé sur la dalle d’un balcon ouvert sur la campagne",
          tag: "Pose sur dalle",
          title: "Balcon sur la campagne",
        },
        {
          src: "/ancien-heroes-balcon.webp",
          alt: "Grand balcon filant protégé par un garde-corps en verre toute longueur, vue sur les collines",
          tag: "Grande longueur",
          title: "Balcon filant sur les collines",
        },
      ],
    },
    durable: {
      badge: "Garde-corps en verre",
      h2: (
        <>
          Un garde-corps en verre <br className="hidden sm:block" />
          <span className="relative inline-block whitespace-nowrap">
            conçu pour durer
            <svg
              viewBox="0 0 220 12"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
              className="absolute -bottom-1.5 left-0 h-2.5 w-full text-pine-600/70"
            >
              <path d="M4 9c62-6 152-6 212-3" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </>
      ),
      intro: (
        <>
          Un garde-corps en verre robuste, sûr et durable, qui résiste à l&rsquo;usage quotidien de votre
          balcon et aux conditions extérieures, saison après saison.
        </>
      ),
      items: [
        {
          icon: Hand,
          t: "Appui confortable",
          d: "Arêtes et finitions prévues pour éviter une sensation « coupante » au contact.",
        },
        {
          icon: ShieldCheck,
          t: "Résistance anti-chute",
          d: (
            <>
              Un verre épais (88.4 ou plus) avec des fixations robustes, supportant jusqu&rsquo;à
              500&nbsp;kg par m².
            </>
          ),
        },
        {
          icon: MainCouranteIcon,
          t: "Option main courante",
          d: "Possible si vous souhaitez une prise en main plus marquée, sans alourdir visuellement l’ensemble.",
        },
      ],
      photo: {
        src: "/balcon-durable.webp",
        alt: "Un homme accoudé au garde-corps en verre de son balcon, la vue dégagée sur les collines",
      },
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
        kind: "compare",
        caption: "Faites glisser pour comparer : la même terrasse, garde-corps à tôle pleine puis garde-corps en verre.",
        before: {
          src: "/comparateur-terrasse-avant.webp",
          alt: "Toit-terrasse fermé par un garde-corps métallique à panneaux pleins qui coupe la vue sur la ville",
        },
        after: {
          src: "/comparateur-terrasse-apres.webp",
          alt: "La même terrasse protégée par un garde-corps de terrasse en verre, le panorama urbain entièrement dégagé",
        },
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
    solidite: {
      kicker: "Solidité & sécurité",
      h2: (
        <>
          Un garde-corps de terrasse en verre <br className="hidden sm:block" />
          <span className={ACCENT}>conçu pour durer</span>
        </>
      ),
      intro:
        "Une protection fiable et résistante qui sécurise votre terrasse tout en préservant la vue.",
      photo: {
        src: "/terrasse-solidite.webp",
        alt: "Un homme accoudé au garde-corps en verre de sa terrasse, la ville au couchant devant lui",
        badge: "Conçu pour résister aux efforts du quotidien",
      },
      items: [
        {
          icon: Layers,
          t: "Un verre de sécurité haute résistance",
          d: "Un vitrage feuilleté trempé spécialement conçu pour les garde-corps. Il résiste aux chocs et, en cas de bris, ses intercalaires maintiennent les fragments de verre pour préserver la sécurité.",
        },
        {
          icon: FixationSolIcon,
          t: "Des fixations robustes et adaptées à votre terrasse",
          d: "Rail aluminium posé sur la dalle, pinces ou points traversants : la fixation est choisie selon votre support — dalle béton, bois ou acier — et dimensionnée pour reprendre les efforts d’appui.",
        },
        {
          icon: ShieldCheck,
          t: "Conforme aux normes NF P01-012 et NF P01-013",
          d: "La NF P01-012 fixe les exigences de dimensions et de résistance, la NF P01-013 décrit les essais qui les valident. Nos garde-corps sont conçus pour y répondre, du vitrage aux fixations.",
        },
        {
          icon: BouclierFeuilleIcon,
          t: "Une solution durable, fiable et sans entretien complexe",
          d: "Verre feuilleté et visserie inox prévus pour l’extérieur : un nettoyage à l’eau suffit, sans peinture ni traitement, saison après saison.",
        },
      ],
      cta: {
        label: "Obtenir mon devis gratuit",
        href: "/generateur?usage=terrasse",
        checks: ["Sur mesure", "Gratuit", "Sans engagement"],
      },
    },
    video: {
      kicker: "Pose & installation",
      h2: "Une pose simple",
      intro: (
        <>
          Rail fixé, vitrage glissé, cales de réglage : la pose d&rsquo;un garde-corps de terrasse en verre
          est à la portée d&rsquo;un bon bricoleur. La preuve en images.
        </>
      ),
      youtubeId: "EXIJ5lMdFtM",
      title: "Pose d’un garde-corps en verre : la vidéo d’installation",
      beforeFaq: true,
    },
    realisations: {
      kicker: "Sur le terrain",
      h2: "Ils ont installé nos garde-corps en verre sur leur terrasse",
      cta: { label: "Estimer la mienne", href: "/generateur?usage=terrasse" },
      beforeFaq: true,
      items: [
        {
          src: "/comparateur-terrasse-apres.webp",
          alt: "Toit-terrasse protégé par un garde-corps en verre, panorama urbain dégagé",
          tag: "Toit-terrasse",
          title: "Toit-terrasse sur la ville",
        },
        {
          src: "/comparateur-exterieur-apres.webp",
          alt: "Terrasse de chalet sécurisée par un garde-corps en verre face aux montagnes",
          tag: "Terrasse de montagne",
          title: "Face aux sommets",
        },
        {
          src: "/ancien-heroes-balcon.webp",
          alt: "Grande terrasse filante bordée d’un garde-corps en verre toute longueur, vue sur la campagne",
          tag: "Grande longueur",
          title: "Terrasse filante sur la campagne",
        },
      ],
    },
    faqTitle: "Questions fréquentes sur les garde-corps en verre pour terrasse",
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
        kind: "compare",
        caption:
          "Faites glisser pour comparer : la même mezzanine, muret plein puis garde-corps en verre.",
        before: {
          src: "/comparateur-mezzanine-avant.webp",
          alt: "Mezzanine fermée par un muret plein qui cloisonne le séjour en double hauteur et bloque la lumière",
        },
        after: {
          src: "/comparateur-mezzanine-apres.webp",
          alt: "La même mezzanine protégée par un garde-corps de mezzanine en verre, le volume ouvert et la lumière traversante",
        },
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
    solidite: {
      kicker: "Solidité & sécurité",
      h2: (
        <>
          La sécurité d&rsquo;un <span className={ACCENT}>véritable garde-corps</span>
        </>
      ),
      intro:
        "Sur une mezzanine, la protection contre les chutes est essentielle. Verre de sécurité, résistance à l’appui et fixations robustes : chaque élément est pensé pour sécuriser votre espace en hauteur, sans compromettre sa transparence.",
      imageRight: true,
      photo: {
        src: "/mezzanine-norme.webp",
        alt: "Garde-corps de mezzanine en verre toute hauteur fixé en rive de plancher, vu depuis le séjour en contrebas",
        badge: "Conçu pour résister aux efforts du quotidien",
      },
      items: [
        {
          icon: Layers,
          t: "Un verre conçu pour résister aux chocs",
          d: "Le verre feuilleté de sécurité associe plusieurs feuilles de verre à des intercalaires résistants. En cas de bris, ces derniers contribuent à retenir les fragments et à limiter les risques. Une solution adaptée à la protection des espaces en hauteur.",
        },
        {
          icon: Hand,
          t: "Une résistance pensée pour l’appui",
          d: "S’accouder au-dessus du séjour, poser les mains sur le vitrage : un garde-corps de mezzanine doit être dimensionné pour supporter les efforts prévus par les normes applicables. Sa résistance dépend de l’ensemble du système, et pas uniquement de l’épaisseur du verre.",
        },
        {
          icon: FixationSolIcon,
          t: "Des fixations ancrées dans la structure",
          d: "Sur une mezzanine en bois, béton ou métal, les fixations doivent transmettre les efforts à la structure porteuse. Les ancrages sont adaptés au support pour assurer la stabilité du garde-corps, sans reposer uniquement sur le parquet ou le revêtement de sol.",
        },
        {
          icon: ShieldCheck,
          t: "Une protection contre les chutes encadrée par les normes",
          d: "Nos garde-corps en verre pour mezzanine répondent aux exigences des normes NF P01-012 — hauteur de sécurité, résistance mécanique, prévention du franchissement — et NF P01-013, qui encadre les méthodes d’essai. Ils offrent une résistance allant jusqu’à 500 kg par m².",
        },
      ],
      cta: {
        label: "Obtenir mon devis gratuit",
        href: "/generateur?usage=mezzanine",
      },
    },
    valeur: {
      kicker: "Valorisation de votre intérieur",
      h2: (
        <>
          Bien plus qu&rsquo;un garde-corps, <br className="hidden sm:block" />
          une vraie <span className={ACCENT}>valeur ajoutée</span> pour votre intérieur.
        </>
      ),
      intro:
        "Un garde-corps en verre pour mezzanine est un véritable choix architectural. Ses lignes épurées et sa transparence apportent une finition haut de gamme qui modernise votre intérieur et renforce l’attrait de votre bien.",
      photo: {
        src: "/mezzanine-valorisation.webp",
        alt: "Mezzanine en bois protégée par un garde-corps en verre, lumière traversante sous la verrière",
      },
      cards: [
        {
          icon: Gem,
          t: (
            <>
              Un intérieur au <br className="hidden sm:block" />
              standing plus élevé
            </>
          ),
          d: "Une finition contemporaine et minimaliste qui met en valeur vos matériaux et votre décoration.",
        },
        {
          icon: Sparkles,
          t: (
            <>
              Un design <br className="hidden sm:block" />
              intemporel et durable
            </>
          ),
          d: "Élégant et facile à entretenir, le verre conserve son aspect soigné au fil des années.",
        },
        {
          icon: HousePlus,
          t: (
            <>
              Un atout pour <br className="hidden sm:block" />
              l&rsquo;attractivité de votre bien
            </>
          ),
          d: "Une mezzanine bien aménagée et sécurisée valorise votre intérieur, au quotidien comme lors d’une éventuelle revente.",
        },
      ],
      cta: { label: "Valoriser ma mezzanine", href: "/generateur?usage=mezzanine" },
      points: [
        { icon: Tag, label: "Estimation gratuite" },
        { icon: Ruler, label: "Sur mesure" },
        { icon: ShieldCheck, label: "Sans engagement" },
      ],
    },
    realisations: {
      kicker: "Sur le terrain",
      h2: "Ils ont installé nos garde-corps en verre sur leur mezzanine",
      cta: { label: "Estimer le mien", href: "/generateur?usage=mezzanine" },
      beforeFaq: true,
      items: [
        {
          src: "/usage-mezzanine-vue.webp",
          alt: "Garde-corps en verre pour mezzanine surplombant un séjour avec cheminée",
          tag: "Verre toute hauteur",
          title: "Mezzanine sur le séjour",
        },
        {
          src: "/comparateur-interieur-apres.webp",
          alt: "Coursive d’étage protégée par un garde-corps de mezzanine en verre, ouverte sur le salon",
          tag: "Coursive d’étage",
          title: "Coursive ouverte sur le salon",
        },
        {
          src: "/comparateur-mezzanine-apres.webp",
          alt: "Ancien muret plein remplacé par un garde-corps en verre sur une mezzanine en rénovation",
          tag: "Rénovation",
          title: "Un muret remplacé par le verre",
        },
      ],
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
        kind: "compare",
        caption:
          "Faites glisser pour comparer : la même fenêtre, barreaudage métallique puis garde-corps en verre.",
        before: {
          src: "/comparateur-fenetre-avant.webp",
          alt: "Porte-fenêtre protégée par un barreaudage métallique qui raye la vue et charge la façade",
        },
        after: {
          src: "/comparateur-fenetre-apres.webp",
          alt: "La même porte-fenêtre protégée par un garde-corps de fenêtre en verre sur points inox, la baie entièrement dégagée",
        },
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
    dimensions: {
      kicker: "Dimensions & pose",
      h2: (
        <>
          Une protection discrète, pensée <br className="hidden sm:block" />
          <span className="rounded-lg bg-green-600/15 px-2 py-0.5 [box-decoration-break:clone]">
            pour vos fenêtres en étage
          </span>
        </>
      ),
      intro:
        "Fenêtre à allège basse ou porte-fenêtre sans balcon : chaque ouverture demande une protection adaptée. Hauteur à atteindre, fonctionnement des ouvrants et type de fixation sont étudiés pour sécuriser la baie sans alourdir la façade.",
      items: [
        {
          icon: HauteurAllegeIcon,
          t: "Une hauteur de protection calculée selon l’allège",
          d: "Quand l’allège est inférieure à 90 cm, la protection doit généralement atteindre 1 mètre depuis le sol intérieur. Le vitrage est donc dimensionné en fonction de la hauteur existante sous la fenêtre, afin d’obtenir la protection nécessaire sans surdimensionner l’ensemble.",
        },
        {
          icon: FenetreCroisillonsIcon,
          t: "Une ouverture de fenêtre préservée",
          d: "Le garde-corps se fixe devant la baie sans gêner les ouvrants : fenêtre à la française, oscillo-battante ou coulissante continue de s’ouvrir en grand.",
        },
        {
          icon: BrickWall,
          t: "Une fixation adaptée au support",
          d: "En façade, en tableau ou au sol selon la configuration : les ancrages sont choisis d’après la nature du mur — béton, brique, pierre ou ossature — et son état.",
        },
        {
          icon: Sparkle,
          t: "Un rendu discret côté façade",
          d: "Vitrage sans cadre et fixations fines : vue de la rue, la protection se fait oublier et laisse la menuiserie dessiner la façade.",
        },
      ],
      photo: {
        src: "/fenetre-dimensions.webp",
        alt: "Garde-corps de fenêtre en verre d’un mètre de hauteur devant une porte-fenêtre, cote de protection annotée",
      },
      cta: { label: "Obtenir mon devis gratuit", href: "/generateur?usage=fenetre" },
      points: [
        { icon: Scissors, label: "Sur mesure" },
        { icon: PiecesIcon, label: "Gratuit" },
        { icon: ShieldCheck, label: "Sans engagement" },
      ],
      note: (
        <>
          Sécurité&nbsp;: conception du garde-corps selon les exigences applicables de la norme
          NF&nbsp;P01-012.
        </>
      ),
    },
    systeme: {
      kicker: "Le système de fixation",
      h2: (
        <>
          La sécurité se joue <br className="hidden sm:block" />
          sur les <span className={ACCENT}>côtés</span>.
        </>
      ),
      intro:
        "Deux profilés verticaux maintiennent le verre, avec des ancrages dans la maçonnerie — pas dans la menuiserie. Une fixation pensée pour votre ouverture.",
      photo: {
        src: "/comparateur-fenetre-apres.webp",
        alt: "Garde-corps de fenêtre en verre maintenu par deux profils verticaux ancrés dans la maçonnerie",
      },
      modes: [
        {
          img: { src: "/pose-tableau.webp", alt: "Schéma de la pose en tableau : profils ancrés dans les côtés du mur" },
          t: "Pose en tableau",
          d: "Dans les côtés du mur",
        },
        {
          img: { src: "/pose-facade.webp", alt: "Schéma de la pose en façade : platines vissées sur la face du mur" },
          t: "Pose en façade",
          d: "Sur la face du mur, en applique",
        },
      ],
      support: {
        img: { src: "/ancrage.webp", alt: "Pictogramme d’un empilement de briques" },
        d: "Le choix des ancrages dépend du support : béton, brique ou pierre. Il est vérifié selon vos photos et vos cotes.",
      },
      cta: { label: "Configurer mon garde-corps", href: "/generateur?usage=fenetre" },
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
          t: "Un remplissage plein",
          d: "Un panneau vitré toute largeur protège l’ouverture, plein jusqu’en partie basse.",
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
        kind: "compare",
        caption:
          "Faites glisser pour comparer : la même coursive, allège maçonnée pleine puis garde-corps en verre.",
        before: {
          src: "/comparateur-interieur-avant.webp",
          alt: "Coursive d’étage fermée par une allège maçonnée pleine qui alourdit le séjour en double hauteur",
        },
        after: {
          src: "/comparateur-interieur-apres.webp",
          alt: "La même coursive protégée par un garde-corps intérieur en verre, l’étage ouvert sur le séjour",
        },
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
          t: "Une zone basse pleine",
          d: "Le remplissage reste plein en partie basse : des panneaux vitrés toute hauteur y répondent d’emblée.",
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
        kind: "compare",
        caption:
          "Faites glisser pour comparer : la même terrasse de montagne, barreaudage métallique puis garde-corps en verre.",
        before: {
          src: "/comparateur-exterieur-avant.webp",
          alt: "Terrasse de chalet face aux montagnes, fermée par un garde-corps à barreaux métalliques qui hachure le paysage",
        },
        after: {
          src: "/comparateur-exterieur-apres.webp",
          alt: "La même terrasse protégée par un garde-corps extérieur en verre, le panorama de montagne intact",
        },
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

/* ================================================================== */
/*  ARCHIVES — blocs retirés des pages mais conservés prêts à servir.  */
/*  Pour réactiver celui-ci : ajouter « fixations: BALCON_FIXATIONS_   */
/*  ARCHIVE » dans l'entrée balcon ci-dessus. Le composant             */
/*  (FixationPoses) et le visuel /pose-francaise-balcon.webp restent   */
/*  dans le repo.                                                      */
/* ================================================================== */

export const BALCON_FIXATIONS_ARCHIVE: NonNullable<UsageBlocks["fixations"]> = {
  kicker: "Systèmes de fixation",
  h2: "Une fixation adaptée à votre balcon",
  intro: (
    <>
      Choisissez votre type de pose pour découvrir le rendu sur balcon et le détail du système de
      fixation.
    </>
  ),
  poses: [
    {
      num: "01",
      title: "Pose à la française",
      sub: "Fixation sur le dessus de la dalle",
      text: "Les éléments de fixation sont ancrés verticalement dans le béton, au niveau du bord de dalle. Le vitrage est maintenu par des supports et dissimulé par un habillage en aluminium.",
      points: [
        "Pose sur la face supérieure de la dalle",
        "Sabots de maintien et ancrages verticaux",
        "Finition extérieure discrète",
      ],
      image: {
        src: "/pose-francaise-balcon.webp",
        alt: "Pose à la française : garde-corps en verre sur rail en butée de dalle, et coupe technique légendée du rail aluminium ancré dans la dalle",
      },
    },
    {
      num: "02",
      title: "Pose à l’anglaise",
      sub: "Fixation sur le chant extérieur de la dalle",
      text: "Les fixations traversent le vitrage et s’ancrent horizontalement dans le chant de la dalle. Le verre file devant le nez de dalle, sans rien poser sur le sol du balcon.",
      points: [
        "Préserve toute la largeur du balcon",
        "Rendu épuré et contemporain",
        "Particulièrement apprécié en rénovation",
      ],
      /* src volontairement absent : placeholder en attendant le visuel dédié. */
      image: {
        alt: "Pose à l’anglaise : garde-corps en verre fixé contre le nez de dalle, et coupe technique légendée des fixations traversantes",
      },
    },
  ],
  panelSub: "Vue sur balcon et détail technique",
};
