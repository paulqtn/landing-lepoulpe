import { adminQuery as q, addEvent, getLead } from "./db";
import { getTarifsSite } from "./prices";
import { chiffrageDepuisLead } from "./quotes";

/* ================================================================== */
/*  Marge brute d'une affaire = vente HT − coût d'achat.               */
/*  Elle est figée quand l'affaire passe à « Gagné » : c'est la base   */
/*  des primes des commerciaux, elle ne doit pas bouger ensuite si les */
/*  tarifs changent. Coût d'achat confidentiel : serveur uniquement.   */
/* ================================================================== */

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export type Marge = { venteHt: number | null; coutAchat: number | null; marge: number | null; source: string };

/** Calcule la marge d'une affaire à partir de son devis envoyé et du moteur de prix. */
export async function calculerMarge(leadId: number): Promise<Marge | null> {
  const lead = await getLead(leadId);
  if (!lead) return null;
  const tva = (await getTarifsSite()).tva;

  // Vente HT : le dernier devis envoyé fait foi ; à défaut, l'estimation affichée au client.
  const sent = await q<{ ref: string; total_ht: string }>("SELECT ref, total_ht FROM quotes WHERE lead_id = $1 AND statut = 'envoye' ORDER BY sent_at DESC LIMIT 1", [leadId]);
  const venteHt = sent[0] ? Number(sent[0].total_ht) : lead.estimation_ttc ? r2(Number(lead.estimation_ttc) / (1 + tva)) : null;

  // Coût d'achat : recalculé par le moteur sur la configuration demandée.
  const c = await chiffrageDepuisLead(lead);
  const coutAchat = c ? c.r.coutAchat : null;

  const origine = sent[0] ? `devis ${sent[0].ref}` : "estimation du site";
  if (venteHt === null) return { venteHt: null, coutAchat, marge: null, source: "à saisir : aucun prix de vente connu" };
  if (coutAchat === null) return { venteHt, coutAchat: null, marge: null, source: `à saisir : coût d'achat non calculable (${origine})` };
  return { venteHt, coutAchat, marge: r2(venteHt - coutAchat), source: `calcul automatique (${origine})` };
}

async function enregistrer(leadId: number, m: Marge): Promise<void> {
  await q("UPDATE leads SET vente_ht = $2, cout_achat = $3, marge_brute = $4, marge_source = $5 WHERE id = $1", [leadId, m.venteHt, m.coutAchat, m.marge, m.source]);
}

/** À appeler quand une affaire passe à « Gagné » : fige sa marge si ce n'est pas déjà fait. */
export async function figerMargeAuGain(leadId: number): Promise<void> {
  try {
    const cur = await q<{ marge_source: string | null }>("SELECT marge_source FROM leads WHERE id = $1", [leadId]);
    if (!cur[0] || cur[0].marge_source) return; // déjà figée (ou saisie à la main)
    const m = await calculerMarge(leadId);
    if (!m) return;
    await enregistrer(leadId, m);
    await addEvent(leadId, "info", m.marge === null ? "Affaire signée — marge à saisir pour le calcul de la prime" : "Affaire signée — marge enregistrée pour le calcul de la prime");
  } catch (e) {
    console.error("[marge] calcul impossible :", e);
  }
}

/** Recalcul demandé par un administrateur (remplace la valeur figée). */
export async function recalculerMarge(leadId: number): Promise<Marge | null> {
  const m = await calculerMarge(leadId);
  if (m) await enregistrer(leadId, m);
  return m;
}

/** Saisie manuelle par un administrateur. */
export async function saisirMarge(leadId: number, venteHt: number, coutAchat: number, actor: string): Promise<void> {
  await enregistrer(leadId, { venteHt: r2(venteHt), coutAchat: r2(coutAchat), marge: r2(venteHt - coutAchat), source: `saisie manuelle (${actor})` });
}
