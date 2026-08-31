/* ================================================================== */
/*  CALCULATEUR INTERNE MGK — moteur de chiffrage fourniture.          */
/*  Implémente les règles internes : calepinage, hauteurs par système, */
/*  tarifs verre, supports, consommables, caisses, transports, ×coef.  */
/*  Serveur uniquement.                                                */
/* ================================================================== */

import {
  COEF_DEFAUT,
  DEPTS_LOCAUX,
  PRIX_CAISSE,
  POIDS_M2,
  SYSTEMES,
  TARIFS_VERRE,
  TVA,
  franceFrance,
  turquieFrance,
  type Epaisseur,
  type SystemeKey,
  type Teinte,
} from "./tarifs";

export type TronconInput = {
  /** Longueur en mètres (pour un escalier : longueur en plan). */
  longueur: number;
  escalier?: boolean;
};

export type ChiffrageInput = {
  client?: string;
  projet?: string;
  departement?: string;
  troncons: TronconInput[];
  /** Nombre d'angles ; défaut : nombre de tronçons − 1. */
  angles?: number;
  departMur?: boolean;
  finMur?: boolean;
  fixation: SystemeKey;
  /** GS-10 : pinces partagées aux inter-verres (N+1 au lieu de 2N). */
  gs10Partage?: boolean;
  verre: Epaisseur;
  teinte: Teinte;
  /** Hauteur finie en cm. */
  hauteurFinie: number;
  /** Pente escalier en degrés ; défaut 35. */
  penteEscalier?: number;
  couleur: "anodise" | "ral-standard" | "ral-autre";
  livraison: "livraison" | "enlevement" | "inconnu";
  coefficient?: number;
};

export type LigneCout = { label: string; detail: string; montant: number };

export type PanneauGroupe = {
  troncon: number;
  nb: number;
  largeurMm: number;
  hauteurCm: number;
  escalier: boolean;
  surfaceUnit: number;
};

export type ChiffrageResult = {
  entree: ChiffrageInput & { angles: number; penteEscalier: number; coefficient: number };
  systeme: string;
  familleRail: boolean;
  hauteurVerre: number;
  panneaux: PanneauGroupe[];
  nbVerres: number;
  surfaceTotale: number;
  poidsTotal: number;
  usinage: string;
  prixVerreM2: number;
  nbCaisses: number;
  supportsDetail: string;
  lignes: LigneCout[];
  coutAchat: number;
  logistique: { turquie: number; caisses: number; france: number };
  prixHT: number;
  prixTTC: number;
  htMl: number;
  ttcMl: number;
  longueurTotale: number;
  alertes: string[];
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Prix d'un composant selon la finition, +20 % sur le thermolaqué hors RAL standard. */
function prixComposant(
  prix: [number, number],
  thermolaque: boolean | undefined,
  couleur: ChiffrageInput["couleur"],
): number {
  if (couleur === "anodise") return prix[0];
  if (couleur === "ral-standard") return prix[1];
  return thermolaque ? r2(prix[1] * 1.2) : prix[1];
}

export function chiffrer(input: ChiffrageInput): ChiffrageResult {
  const alertes: string[] = [];
  const coef = input.coefficient && input.coefficient > 0 ? input.coefficient : COEF_DEFAUT;
  const pente = input.penteEscalier && input.penteEscalier > 0 ? input.penteEscalier : 35;
  const angles = input.angles ?? Math.max(0, input.troncons.length - 1);
  const sys = SYSTEMES[input.fixation];
  const estRail = sys.famille === "rail";

  /* ---------- teinte : hors grille => tarif double face fumé ---------- */
  let teinteEffective: Exclude<Teinte, "autre"> = input.teinte === "autre" ? "fume-2f" : input.teinte;
  if (input.teinte === "autre") {
    alertes.push("Teinte hors grille : tarif DOUBLE FACE FUMÉ appliqué par défaut.");
  }

  /* ---------- GS-13-E cintré : RAL uniquement ---------- */
  let couleur = input.couleur;
  if (input.fixation === "GS-13-E-CINTRE" && couleur === "anodise") {
    couleur = "ral-standard";
    alertes.push("GS-13-E cintré : non disponible en anodisé — tarif RAL appliqué.");
  }

  /* ---------- pinces vs épaisseur ---------- */
  if (sys.famille === "petite-pince") {
    const est66 = input.fixation === "GS-07" || input.fixation === "GS-07-A";
    if (est66 && input.verre !== "66.4")
      alertes.push(`${input.fixation} est une pince 6+6 : incompatible avec du ${input.verre} — vérifier le choix de pince.`);
    if (!est66 && input.verre === "66.4")
      alertes.push(`${input.fixation} est une pince 8+8 montée avec du 66.4 — GS-07/GS-07-A serait plus adapté.`);
    if (input.verre === "1010.4")
      alertes.push("Verre 1010.4 sur pinces : aucune pince 10+10 au tarif — capacité à valider au cas par cas.");
  }

  /* ---------- hauteur réelle de verre ---------- */
  const hauteurVerre = input.hauteurFinie + sys.deltaHauteur;

  /* ---------- calepinage ---------- */
  const cosP = Math.cos((pente * Math.PI) / 180);
  const panneaux: PanneauGroupe[] = [];
  let nbVerres = 0;
  let surfaceTotale = 0;
  let aEscalier = false;

  input.troncons.forEach((t, i) => {
    const escalier = !!t.escalier;
    if (escalier) aEscalier = true;
    // Longueur réelle à équiper (rampant pour un escalier).
    const lin = escalier ? t.longueur / cosP : t.longueur;
    const linMm = lin * 1000;
    // ~1 panneau par mètre linéaire.
    const n = Math.max(1, Math.round(lin));
    // Jeux : inter-verres 15 mm ; angles 20 mm (10 mm sur chaque tronçon adjacent) ;
    // départ/fin contre mur 20 mm.
    let jeux = (n - 1) * 15;
    if (i > 0) jeux += 10;
    if (i < input.troncons.length - 1 && angles > 0) jeux += 10;
    if (i === 0 && input.departMur) jeux += 20;
    if (i === input.troncons.length - 1 && input.finMur) jeux += 20;
    const largeurMm = Math.round((linMm - jeux) / n);
    const surfaceUnit = (largeurMm / 1000) * (hauteurVerre / 100);
    panneaux.push({ troncon: i + 1, nb: n, largeurMm, hauteurCm: hauteurVerre, escalier, surfaceUnit });
    nbVerres += n;
    surfaceTotale += n * surfaceUnit;
  });
  surfaceTotale = r2(surfaceTotale);

  /* ---------- usinage du verre ---------- */
  const spider = sys.famille === "spider";
  let usinageIdx: 0 | 1 | 2 | 3;
  let usinageLabel: string;
  if (aEscalier && spider) { usinageIdx = 3; usinageLabel = "Découpe spéciale + perçage"; }
  else if (aEscalier) { usinageIdx = 2; usinageLabel = "Découpe spéciale (trapèze)"; }
  else if (spider) { usinageIdx = 1; usinageLabel = "Droit avec perçage"; }
  else { usinageIdx = 0; usinageLabel = "Droit"; }

  const prixVerreM2 = TARIFS_VERRE[input.verre][teinteEffective][usinageIdx];
  const coutVerre = r2(surfaceTotale * prixVerreM2);

  /* ---------- poids & caisses ---------- */
  const poidsTotal = r2(surfaceTotale * POIDS_M2[input.verre]);
  let nbCaisses: number;
  if (poidsTotal <= 1000) nbCaisses = 1;
  else if (poidsTotal < 1300) {
    nbCaisses = 1;
    alertes.push(`ALERTE CONDITIONNEMENT — poids estimé de la caisse : ${Math.round(poidsTotal)} kg. Nombre de caisses à valider au cas par cas.`);
  } else {
    nbCaisses = Math.ceil(poidsTotal / 1000);
  }
  const coutCaisses = nbCaisses * PRIX_CAISSE;

  /* ---------- supports ---------- */
  const lignes: LigneCout[] = [];
  lignes.push({
    label: `Verre ${input.verre} ${teinteEffective === "fume-1f" ? "fumé 1 face" : teinteEffective === "fume-2f" ? "fumé 2 faces" : teinteEffective} — ${usinageLabel.toLowerCase()}`,
    detail: `${surfaceTotale.toFixed(2)} m² × ${prixVerreM2} €/m²`,
    montant: coutVerre,
  });

  let supportsDetail = "";
  let coutSupports = 0;

  if (estRail) {
    const barre = sys.barre ?? 3;
    // Barres entières par tronçon (un angle coupe le rail).
    let nbBarres = 0;
    input.troncons.forEach((t) => {
      const lin = t.escalier ? t.longueur / cosP : t.longueur;
      const b = Math.ceil(lin / barre - 1e-9);
      const depassement = lin - (b - 1) * barre;
      if (b > 1 || lin > barre) {
        const sur = lin % barre;
        if (sur > 0 && sur <= 0.5) {
          alertes.push(`ALERTE OPTIMISATION RAIL — tronçon ${t.longueur} m : dépassement de ${Math.round(sur * 100)} cm au-delà de ${b - 1} barre(s). Possibilité éventuelle de tricher grâce au cache/capot, à valider.`);
        }
      }
      void depassement;
      nbBarres += b;
    });
    const longueurRail = nbBarres * barre;
    const pRail = prixComposant(sys.rail!.prix, sys.rail!.thermolaque, couleur);
    coutSupports += nbBarres * pRail;
    lignes.push({ label: sys.rail!.label, detail: `${nbBarres} barre(s) × ${pRail.toFixed(2)} €`, montant: r2(nbBarres * pRail) });

    if (sys.habillage) {
      // Enjoliveurs / caches : longueur de rail achetée × 2, en barres de 3 m.
      const nbHab = Math.ceil((longueurRail * 2) / 3 - 1e-9);
      const pHab = prixComposant(sys.habillage.prix, sys.habillage.thermolaque, couleur);
      coutSupports += nbHab * pHab;
      lignes.push({ label: sys.habillage.label, detail: `${nbHab} barre(s) (rail ×2) × ${pHab.toFixed(2)} €`, montant: r2(nbHab * pHab) });
    }

    // Consommables au prorata de la longueur de barre (embouts : 2 par barre, fixes).
    const ratio = barre / 3;
    for (const { comp, qte } of sys.parBarre ?? []) {
      const parBarre = comp.label.startsWith("Embout") ? qte : Math.ceil(qte * ratio);
      const q = nbBarres * parBarre;
      const p = prixComposant(comp.prix, comp.thermolaque, couleur);
      coutSupports += q * p;
      lignes.push({ label: comp.label, detail: `${q} × ${p.toFixed(2)} €`, montant: r2(q * p) });
    }
    supportsDetail = `${nbBarres} barre(s) de rail ${barre} m + consommables`;
  } else {
    // Pinces / spiders : quantité selon la largeur réelle des panneaux.
    let totalPieces = 0;
    panneaux.forEach((g) => {
      const wM = g.largeurMm / 1000;
      let parVerre: number;
      // « Proche de 1 m » : 2 grosses / 3 petites ; au-delà, proportionnel
      // aux entraxes de référence (60 cm / 50 cm).
      if (sys.famille === "grosse-pince") parVerre = Math.max(2, Math.ceil(wM / 0.6 - 1e-9));
      else if (sys.famille === "petite-pince") parVerre = Math.max(3, Math.round(wM / 0.5) + 1);
      else if (sys.famille === "spider") parVerre = 4;
      else parVerre = 2; // GS-10 standard
      totalPieces += g.nb * parVerre;
    });
    if (sys.famille === "gs10" && input.gs10Partage) {
      // Pinces partagées : N+1 par tronçon.
      totalPieces = panneaux.reduce((acc, g) => acc + g.nb + 1, 0);
    }
    const pPiece = prixComposant(sys.piece!.prix, sys.piece!.thermolaque, couleur);
    coutSupports += totalPieces * pPiece;
    lignes.push({ label: sys.piece!.label, detail: `${totalPieces} × ${pPiece.toFixed(2)} €`, montant: r2(totalPieces * pPiece) });
    for (const { comp, qte } of sys.parPiece ?? []) {
      const q = totalPieces * qte;
      const p = prixComposant(comp.prix, comp.thermolaque, couleur);
      coutSupports += q * p;
      lignes.push({ label: comp.label, detail: `${q} × ${p.toFixed(2)} €`, montant: r2(q * p) });
    }
    supportsDetail = `${totalPieces} × ${sys.key}`;
  }
  coutSupports = r2(coutSupports);

  /* ---------- transports ---------- */
  // Turquie → France : par caisse, selon le nombre de verres par caisse.
  const parCaisse = Math.ceil(nbVerres / nbCaisses);
  let coutTurquie = 0;
  let restants = nbVerres;
  for (let c = 0; c < nbCaisses; c++) {
    const dansCaisse = Math.min(parCaisse, restants);
    coutTurquie += turquieFrance(dansCaisse);
    restants -= dansCaisse;
  }

  const longueurTotale = r2(input.troncons.reduce((a, t) => a + t.longueur, 0));
  const deptLocal = DEPTS_LOCAUX.includes((input.departement ?? "").trim());
  let coutFrance = 0;
  let livraisonLabel: string;
  if (input.livraison === "enlevement") {
    livraisonLabel = "Enlèvement (0 €)";
  } else if (deptLocal && input.livraison === "inconnu") {
    livraisonLabel = `Département ${input.departement} (zone locale) — à préciser`;
    alertes.push(`Département ${input.departement} en zone locale MGK : mode livraison/enlèvement à confirmer avant de finaliser (transport non chiffré).`);
  } else {
    coutFrance = franceFrance(longueurTotale, estRail);
    livraisonLabel = `Livraison dept ${input.departement || "?"} — ${estRail ? "avec" : "sans"} rail`;
  }

  /* ---------- totaux ---------- */
  lignes.push({ label: "Caisse(s) bois", detail: `${nbCaisses} × ${PRIX_CAISSE} €`, montant: coutCaisses });
  lignes.push({ label: "Transport Turquie → France", detail: `${nbCaisses} caisse(s), ${nbVerres} verres`, montant: r2(coutTurquie) });
  lignes.push({ label: "Transport France → client", detail: livraisonLabel, montant: r2(coutFrance) });

  const coutAchat = r2(coutVerre + coutSupports + coutCaisses + coutTurquie + coutFrance);
  const prixHT = r2(coutAchat * coef);
  const prixTTC = r2(prixHT * (1 + TVA));

  return {
    entree: { ...input, angles, penteEscalier: pente, coefficient: coef },
    systeme: sys.label,
    familleRail: estRail,
    hauteurVerre,
    panneaux,
    nbVerres,
    surfaceTotale,
    poidsTotal,
    usinage: usinageLabel,
    prixVerreM2,
    nbCaisses,
    supportsDetail,
    lignes,
    coutAchat,
    logistique: { turquie: r2(coutTurquie), caisses: coutCaisses, france: r2(coutFrance) },
    prixHT,
    prixTTC,
    htMl: r2(prixHT / longueurTotale),
    ttcMl: r2(prixTTC / longueurTotale),
    longueurTotale,
    alertes,
  };
}
