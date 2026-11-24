import type { Lead } from "./db";
import { getSetting } from "./settings";

/* ================================================================== */
/*  Rémunération des commerciaux — payés à la commission.              */
/*  COMMISSION_PCT : % du CA signé (défaut 5).                         */
/*  OBJECTIF_MENSUEL : CA signé/mois qui déclenche la prime (30 000 €).*/
/*  PRIME_OBJECTIF : montant de la prime à l'objectif (défaut 500 €).  */
/* ================================================================== */

export type CompSettings = { commissionPct: number; objectifMensuel: number; primeObjectif: number };

const ENV_DEFAULTS: CompSettings = {
  commissionPct: Number(process.env.COMMISSION_PCT ?? 5),
  objectifMensuel: Number(process.env.OBJECTIF_MENSUEL ?? 30000),
  primeObjectif: Number(process.env.PRIME_OBJECTIF ?? 500),
};

/** Réglages modifiables dans le back office (table settings, clé « commissions »). */
export async function getCompSettings(): Promise<CompSettings> {
  const stored = await getSetting<Partial<CompSettings>>("commissions");
  const n = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d);
  return {
    commissionPct: n(stored?.commissionPct, ENV_DEFAULTS.commissionPct),
    objectifMensuel: n(stored?.objectifMensuel, ENV_DEFAULTS.objectifMensuel),
    primeObjectif: n(stored?.primeObjectif, ENV_DEFAULTS.primeObjectif),
  };
}

export type RepStats = {
  rep: string;
  caMois: number;
  commissionMois: number;
  pctObjectif: number;
  resteObjectif: number;
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

/** Statistiques précises d'un commercial, à partir de ses leads attribués. */
export function repStats(leads: Lead[], rep: string, c: CompSettings): RepStats {
  const miens = leads.filter((l) => l.assigned_to === rep);
  const gagnes = miens.filter((l) => l.statut === "gagne");
  const perdus = miens.filter((l) => l.statut === "perdu");
  const enCours = miens.filter((l) => !["gagne", "perdu"].includes(l.statut));
  const gagnesMois = gagnes.filter((l) => sameMonth(l.won_at ?? l.created_at));
  const caMois = Math.round(gagnesMois.reduce((s, l) => s + num(l.estimation_ttc), 0));
  const caTotal = Math.round(gagnes.reduce((s, l) => s + num(l.estimation_ttc), 0));
  const clos = gagnes.length + perdus.length;
  const avecEstim = gagnes.filter((l) => l.estimation_ttc);
  return {
    rep,
    caMois,
    commissionMois: Math.round((caMois * c.commissionPct) / 100),
    pctObjectif: c.objectifMensuel > 0 ? Math.min(100, Math.round((caMois / c.objectifMensuel) * 100)) : 0,
    resteObjectif: Math.max(0, c.objectifMensuel - caMois),
    caTotal,
    signees: gagnes.length,
    perdues: perdus.length,
    enCours: enCours.length,
    enCoursTTC: Math.round(enCours.reduce((s, l) => s + num(l.estimation_ttc), 0)),
    tauxSignature: clos > 0 ? Math.round((gagnes.length / clos) * 100) : null,
    panierMoyen: avecEstim.length ? Math.round(avecEstim.reduce((s, l) => s + num(l.estimation_ttc), 0) / avecEstim.length) : 0,
  };
}
