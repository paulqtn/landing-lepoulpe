import type { Lead } from "./db";
import { getSetting } from "./settings";

/* ================================================================== */
/*  Rémunération variable des commerciaux, par mois civil :            */
/*   - commission = un pourcentage de la MARGE BRUTE des affaires      */
/*     gagnées dans le mois (4 % par défaut) ;                         */
/*   - bonus = dès que le CA HT gagné dans le mois atteint le seuil    */
/*     (110 000 €), un montant fixe (150 €), puis le même montant à    */
/*     chaque tranche supplémentaire (10 000 €).                       */
/*  Tous les paramètres se règlent dans le back office.                */
/* ================================================================== */

export { COMP_DEFAUT, bonusCA, type CompSettings } from "./prime";
import { COMP_DEFAUT, bonusCA, type CompSettings } from "./prime";

/** Réglages modifiables dans le back office (table settings, clé « commissions »). */
export async function getCompSettings(): Promise<CompSettings> {
  const stored = await getSetting<Partial<CompSettings>>("commissions");
  const n = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d);
  return {
    tauxMarge: n(stored?.tauxMarge, COMP_DEFAUT.tauxMarge),
    seuilCA: n(stored?.seuilCA, COMP_DEFAUT.seuilCA),
    bonusParTranche: n(stored?.bonusParTranche, COMP_DEFAUT.bonusParTranche),
    tranche: n(stored?.tranche, COMP_DEFAUT.tranche) || COMP_DEFAUT.tranche,
  };
}

export type RepStats = {
  rep: string;
  /** CA HT des affaires gagnées dans le mois. */
  caMois: number;
  /** Marge brute des affaires gagnées dans le mois (affaires dont la marge est connue). */
  margeMois: number;
  /** Affaires gagnées dans le mois dont la marge reste à saisir. */
  margesManquantes: number;
  commissionMois: number;
  bonusMois: number;
  tranchesBonus: number;
  primeMois: number;
  pctObjectif: number;
  resteObjectif: number;
  /** CA HT qu'il manque pour la prochaine tranche de bonus. */
  resteProchaineTranche: number;
  caTotal: number;
  signees: number;
  perdues: number;
  enCours: number;
  enCoursTTC: number;
  tauxSignature: number | null;
  panierMoyen: number;
};

const num = (v: string | null) => (v ? Number(v) : 0);

function sameMonth(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** Vente HT d'une affaire : la valeur figée au gain, sinon l'estimation TTC ramenée en HT (TVA 20 %). */
const venteHt = (l: Lead) => (l.vente_ht ? Number(l.vente_ht) : l.estimation_ttc ? Number(l.estimation_ttc) / 1.2 : 0);

/** Statistiques précises d'un commercial, à partir de ses leads attribués. */
export function repStats(leads: Lead[], rep: string, c: CompSettings): RepStats {
  const miens = leads.filter((l) => l.assigned_to === rep);
  const gagnes = miens.filter((l) => l.statut === "gagne");
  const perdus = miens.filter((l) => l.statut === "perdu");
  const enCours = miens.filter((l) => !["gagne", "perdu"].includes(l.statut));
  const gagnesMois = gagnes.filter((l) => sameMonth(l.won_at ?? l.created_at));
  const caExact = gagnesMois.reduce((s, l) => s + venteHt(l), 0);
  const margeExacte = gagnesMois.reduce((s, l) => s + (l.marge_brute != null ? Number(l.marge_brute) : 0), 0);
  const commissionMois = Math.round(((margeExacte * c.tauxMarge) / 100) * 100) / 100;
  const { tranches, bonus } = bonusCA(caExact, c);
  const caMois = Math.round(caExact);
  const caTotal = Math.round(gagnes.reduce((s, l) => s + venteHt(l), 0));
  const clos = gagnes.length + perdus.length;
  const prochain = caExact < c.seuilCA ? c.seuilCA : c.seuilCA + tranches * c.tranche;
  return {
    rep,
    caMois,
    margeMois: Math.round(margeExacte),
    margesManquantes: gagnesMois.filter((l) => l.marge_brute == null).length,
    commissionMois,
    bonusMois: bonus,
    tranchesBonus: tranches,
    primeMois: Math.round((commissionMois + bonus) * 100) / 100,
    pctObjectif: c.seuilCA > 0 ? Math.min(100, Math.round((caExact / c.seuilCA) * 100)) : 0,
    resteObjectif: Math.max(0, Math.round(c.seuilCA - caExact)),
    resteProchaineTranche: Math.max(0, Math.round(prochain - caExact)),
    caTotal,
    signees: gagnes.length,
    perdues: perdus.length,
    enCours: enCours.length,
    enCoursTTC: Math.round(enCours.reduce((s, l) => s + num(l.estimation_ttc), 0)),
    tauxSignature: clos > 0 ? Math.round((gagnes.length / clos) * 100) : null,
    panierMoyen: gagnes.length ? Math.round(gagnes.reduce((s, l) => s + venteHt(l), 0) / gagnes.length) : 0,
  };
}
