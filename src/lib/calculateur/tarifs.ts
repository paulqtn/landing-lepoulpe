/* ================================================================== */
/*  CALCULATEUR INTERNE MGK — tarifs d'achat confidentiels.            */
/*  Ce module ne doit être importé que côté serveur (API /chiffrage).  */
/*  Source : RECAP TARIFS GARDE-CORPS 2026 (23.02.2026) + règles MGK.  */
/* ================================================================== */

export type Epaisseur = "66.4" | "88.4" | "1010.4";
export type Teinte = "clair" | "extra-clair" | "fume-1f" | "fume-2f" | "autre";
/** Usinage : droit / droit percé / découpe spéciale / découpe + perçage. */
export type Usinage = 0 | 1 | 2 | 3;

/** €/m² d'achat — [droit, droit+perçage, découpe, découpe+perçage]. */
export const TARIFS_VERRE: Record<Epaisseur, Record<Exclude<Teinte, "autre">, [number, number, number, number]>> = {
  "66.4": {
    clair: [60, 65, 70, 72],
    "extra-clair": [80, 85, 90, 96],
    "fume-1f": [66, 71, 76, 79],
    "fume-2f": [71, 76, 81, 85],
  },
  "88.4": {
    clair: [75, 80, 85, 90],
    "extra-clair": [100, 105, 110, 120],
    "fume-1f": [82, 87, 92, 98],
    "fume-2f": [87, 92, 97, 104],
  },
  "1010.4": {
    clair: [85, 90, 95, 102],
    "extra-clair": [110, 115, 120, 132],
    "fume-1f": [92, 98, 102, 111],
    "fume-2f": [98, 103, 108, 117],
  },
};

/** kg/m² : 2,5 kg par mm de verre, intercalaires non comptés. */
export const POIDS_M2: Record<Epaisseur, number> = { "66.4": 30, "88.4": 40, "1010.4": 50 };

export type SystemeKey =
  | "GS-19-L" | "GS-16" | "GS-17" | "GS-03-G" | "GS-12-L" | "GS-13-E" | "GS-13-E-CINTRE"
  | "GS-05" | "GS-06" | "GS-06-A" | "GS-07" | "GS-07-A" | "GS-07-B" | "GS-07-C"
  | "GS-10" | "GS-02";

/** [prix anodisé, prix RAL standard] ; thermolaque => +20 % en RAL hors standard. */
type Composant = {
  ref: string;
  label: string;
  prix: [number, number];
  thermolaque?: boolean;
};

export type SystemeDef = {
  key: SystemeKey;
  label: string;
  famille: "rail" | "grosse-pince" | "petite-pince" | "gs10" | "spider";
  /** Écart hauteur verre vs hauteur finie, en cm (française −3, anglaise +…). */
  deltaHauteur: number;
  /** Longueur de barre pour les rails (m). */
  barre?: number;
  rail?: Composant;
  /** Enjoliveur / cache / parclose vendu en barres de 3 m, longueur = rail ×2. */
  habillage?: Composant;
  /** Consommables par barre de rail de 3 m (quantités ajustées au prorata). */
  parBarre?: { comp: Composant; qte: number }[];
  /** Pince / spider unitaire. */
  piece?: Composant;
  /** Consommables par pièce (spider : tige + écrou). */
  parPiece?: { comp: Composant; qte: number }[];
};

const TIGE_M10: Composant = { ref: "M27-48-A", label: "Tige filetée M10", prix: [0.3, 0.3] };
const ECROU_M10: Composant = { ref: "M27-52-A", label: "Écrou + rondelle M10", prix: [0.1, 0.1] };
const JOINT_EXT: Composant = { ref: "MC-500", label: "Joint vitrage EXT", prix: [0.47, 0.47] };
const JOINT_INT: Composant = { ref: "MC-501-B", label: "Joint vitrage INT", prix: [1.25, 1.25] };
const JOINT_ENJ: Composant = { ref: "MC-106", label: "Joint d'enjoliveur", prix: [0.61, 0.61] };

export const SYSTEMES: Record<SystemeKey, SystemeDef> = {
  "GS-19-L": {
    key: "GS-19-L", label: "GS-19-L — rail de sol réglable", famille: "rail", deltaHauteur: -3, barre: 3,
    rail: { ref: "MC-409", label: "Kit profil de sol réglable 3 m", prix: [229.41, 229.41], thermolaque: true },
    habillage: { ref: "MC-112-A", label: "Enjoliveur droit 3 m", prix: [13.2, 19.2], thermolaque: true },
    parBarre: [
      { comp: { ref: "MC-402-A", label: "Profil de drainage", prix: [1.66, 1.66] }, qte: 10 },
      { comp: { ref: "MC-607-D", label: "Embout de finition", prix: [1.51, 2.5], thermolaque: true }, qte: 2 },
      { comp: JOINT_ENJ, qte: 10 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-16": {
    key: "GS-16", label: "GS-16 — rail à l'anglaise", famille: "rail", deltaHauteur: 12, barre: 3,
    rail: { ref: "MC-406", label: "Rail en applique 3 m", prix: [355.7, 391.27], thermolaque: true },
    parBarre: [
      { comp: JOINT_EXT, qte: 10 },
      { comp: JOINT_INT, qte: 10 },
      { comp: { ref: "MC-607", label: "Embout de finition", prix: [1.51, 2.5], thermolaque: true }, qte: 2 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-17": {
    key: "GS-17", label: "GS-17 — rail déporté sur dalle", famille: "rail", deltaHauteur: -3, barre: 3,
    rail: { ref: "MC-407", label: "Rail déporté 3 m", prix: [269.61, 310.05], thermolaque: true },
    habillage: { ref: "MC-103-L", label: "Cache rail déporté 3 m", prix: [9.35, 13.6], thermolaque: true },
    parBarre: [
      { comp: JOINT_EXT, qte: 10 },
      { comp: JOINT_INT, qte: 10 },
      { comp: { ref: "MC-607-A", label: "Embout rail déporté", prix: [2, 3], thermolaque: true }, qte: 2 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-03-G": {
    key: "GS-03-G", label: "GS-03-G — rail encastré", famille: "rail", deltaHauteur: -3, barre: 3,
    rail: { ref: "MC-100-A-L", label: "Profil de sol encastré 3 m", prix: [262.52, 262.52], thermolaque: true },
    habillage: { ref: "MC-102-A", label: "Enjoliveur profil encastré 3 m", prix: [5.5, 8], thermolaque: true },
    parBarre: [
      { comp: JOINT_ENJ, qte: 10 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-12-L": {
    key: "GS-12-L", label: "GS-12-L — profil de sol sur dalle", famille: "rail", deltaHauteur: -3, barre: 3,
    rail: { ref: "MC-402-B", label: "Profil de sol sur dalle 3 m", prix: [171.7, 197.45], thermolaque: true },
    habillage: { ref: "MC-103-H", label: "Parclose 3 m", prix: [3.3, 4.8], thermolaque: true },
    parBarre: [
      { comp: JOINT_EXT, qte: 10 },
      { comp: { ref: "MC-603", label: "Embout de finition", prix: [1.51, 2.5], thermolaque: true }, qte: 2 },
      { comp: { ref: "M27-48-B", label: "Tige filetée M08", prix: [0.3, 0.3] }, qte: 15 },
      { comp: { ref: "M27-52-C", label: "Écrou + rondelle M08", prix: [0.1, 0.1] }, qte: 15 },
    ],
  },
  "GS-13-E": {
    key: "GS-13-E", label: "GS-13-E — rail sur dalle", famille: "rail", deltaHauteur: -3, barre: 3,
    rail: { ref: "MC-403-B", label: "Rail sur dalle 3 m", prix: [171.7, 197.46], thermolaque: true },
    parBarre: [
      { comp: JOINT_EXT, qte: 10 },
      { comp: JOINT_INT, qte: 10 },
      { comp: { ref: "MC-604-B", label: "Embout de finition", prix: [1.51, 2.5], thermolaque: true }, qte: 2 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-13-E-CINTRE": {
    key: "GS-13-E-CINTRE", label: "GS-13-E cintré — rail cintré 2,40 m", famille: "rail", deltaHauteur: -3, barre: 2.4,
    rail: { ref: "MC-403-B", label: "Rail cintré 2,40 m", prix: [445.05, 445.05], thermolaque: true },
    parBarre: [
      { comp: JOINT_EXT, qte: 10 },
      { comp: JOINT_INT, qte: 10 },
      { comp: { ref: "MC-604-B", label: "Embout de finition", prix: [2.5, 2.5], thermolaque: true }, qte: 2 },
      { comp: TIGE_M10, qte: 15 },
      { comp: ECROU_M10, qte: 15 },
    ],
  },
  "GS-05": {
    key: "GS-05", label: "GS-05 — pince de sol ronde", famille: "grosse-pince", deltaHauteur: -3,
    piece: { ref: "MC-210", label: "Pince de sol ronde (fix. béton fournies)", prix: [35.48, 40.8], thermolaque: true },
  },
  "GS-06": {
    key: "GS-06", label: "GS-06 — pince de sol carrée", famille: "grosse-pince", deltaHauteur: -3,
    piece: { ref: "MC-210-A", label: "Pince de sol carrée (fix. béton fournies)", prix: [35.48, 40.8], thermolaque: true },
  },
  "GS-06-A": {
    key: "GS-06-A", label: "GS-06-A — pince de sol carrée 360°", famille: "grosse-pince", deltaHauteur: -3,
    piece: { ref: "MC-210-B", label: "Pince de sol carrée réglable 360°", prix: [37.84, 43.51], thermolaque: true },
  },
  "GS-07": {
    key: "GS-07", label: "GS-07 — pince ronde 6+6", famille: "petite-pince", deltaHauteur: -3,
    piece: { ref: "MC-209", label: "Pince ronde 6+6 (fix. béton fournies)", prix: [10.88, 12.51], thermolaque: true },
  },
  "GS-07-A": {
    key: "GS-07-A", label: "GS-07-A — pince carrée 6+6", famille: "petite-pince", deltaHauteur: -3,
    piece: { ref: "MC-209-C", label: "Pince carrée 6+6 (fix. béton fournies)", prix: [10.88, 12.51], thermolaque: true },
  },
  "GS-07-B": {
    key: "GS-07-B", label: "GS-07-B — pince ronde 8+8", famille: "petite-pince", deltaHauteur: -3,
    piece: { ref: "MC-209-D", label: "Pince ronde 8+8 (fix. béton fournies)", prix: [16.56, 19.04], thermolaque: true },
  },
  "GS-07-C": {
    key: "GS-07-C", label: "GS-07-C — pince carrée 8+8", famille: "petite-pince", deltaHauteur: -3,
    piece: { ref: "MC-209-E", label: "Pince carrée 8+8 (fix. béton fournies)", prix: [16.56, 19.04], thermolaque: true },
  },
  "GS-10": {
    key: "GS-10", label: "GS-10 — pince à l'anglaise", famille: "gs10", deltaHauteur: 20,
    piece: { ref: "MC-211", label: "Pince / adaptateur à l'anglaise (fix. fournies)", prix: [35, 40.25], thermolaque: true },
  },
  "GS-02": {
    key: "GS-02", label: "GS-02 — spider Ø50", famille: "spider", deltaHauteur: 25,
    piece: { ref: "MC-200-G", label: "Point de fixation Ø50 (8+8)", prix: [14.19, 16.32], thermolaque: true },
    parPiece: [
      { comp: { ref: "M27-48-A", label: "Tige M10", prix: [0.3, 0.3] }, qte: 1 },
      { comp: { ref: "M27-52-A", label: "Écrou + rondelle", prix: [0.3, 0.3] }, qte: 1 },
    ],
  },
};

/** Caisse bois. */
export const PRIX_CAISSE = 100;

/** Transport Turquie → France, par caisse selon le nombre de verres. */
export function turquieFrance(nbVerres: number): number {
  if (nbVerres <= 5) return 0;
  return Math.min(450, (nbVerres - 5) * 30);
}

/** Transport France → France par tranches de 20 ml. */
export function franceFrance(ml: number, avecRail: boolean): number {
  const base = avecRail ? 300 : 200;
  let total = 0;
  let restant = ml;
  while (restant > 0) {
    const tranche = Math.min(20, restant);
    if (tranche <= 5) total += base;
    else if (tranche <= 10) total += base + 50;
    else if (tranche <= 15) total += base + 100;
    else total += base + 150;
    restant -= tranche;
  }
  return total;
}

/** Départements en zone locale MGK (livraison à définir au cas par cas). */
export const DEPTS_LOCAUX = ["83", "06", "13", "04"];

export const COEF_DEFAUT = 1.75;
export const TVA = 0.2;
