import type { ReactNode } from "react";
import Link from "next/link";
import { Ban, DoorOpen, Hand, Lock, Ruler, TrendingUp, type LucideIcon } from "lucide-react";

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
    benefits: string[];
    note: ReactNode;
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
  /* PROPOSITION — les quatre images sont provisoires (recadrages de la
     photo du haut de page) en attendant des photos dédiées. */
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
        kind: "image",
        src: "/escalier-vue.webp",
        alt: "Escalier bois d’un séjour lumineux, protégé par un garde-corps d’escalier en verre",
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
          Droit, tournant ou hélicoïdal : chaque garde-corps en verre est fabriqué sur mesure, d&rsquo;après
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
          t: "Escalier tournant",
          d: "Quart tournant ou double quart : chaque panneau est découpé à l’angle exact pour accompagner le virage et le palier.",
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
          icon: Hand,
          t: "Une main courante continue",
          d: "Elle accompagne la main sur toute la volée, y compris dans les tournants.",
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
      kicker: "Matériaux & durabilité",
      h2: (
        <>
          Un <span className={ACCENT}>verre feuilleté</span> <br className="hidden lg:block" />
          pensé pour l&rsquo;escalier
        </>
      ),
      text: (
        <>
          Nos garde-corps d&rsquo;escalier sont fabriqués en verre feuilleté : deux vitrages assemblés par
          des films intercalaires, qui restent solidaires en cas de choc. Chaque panneau est façonné en
          usine pour suivre exactement la pente de votre escalier.
        </>
      ),
      benefits: ["Verre feuilleté de sécurité", "Découpe au degré près", "Fixation sur limon ou sur marche"],
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
};
