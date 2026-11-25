import { adminQuery as q, addEvent, type Lead } from "./db";
import { audit } from "./auth";
import { currentVersion, getTarifsSite } from "./prices";
import { COEF_PLANCHER, COEF_PLEIN, NIVEAUX_PRIX } from "./niveaux-prix";
import { correspondance } from "@/lib/calculateur/correspondance";
import { chiffrer } from "@/lib/calculateur/engine";

/* ================================================================== */
/*  Devis détaillés : une ou plusieurs propositions, chacune en lignes */
/*  (désignation, quantité, prix HT, TVA). Un devis naît en brouillon  */
/*  — généré automatiquement à partir de la demande — et ne part chez  */
/*  le client qu'après validation manuelle. Une fois envoyé, il est    */
/*  figé (snapshot) : on crée une nouvelle version pour le modifier.   */
/*  Tous les totaux sont recalculés ici, côté serveur.                 */
/* ================================================================== */

export const QUOTE_IMAGE_KEYS = ["rail", "pinces", "spider"] as const;
export type QuoteImage = (typeof QUOTE_IMAGE_KEYS)[number];
export type QuoteLine = {
  description: string;
  qty: number;
  unitPriceHt: number;
  vatRate: number;
  /** Unité affichée après la quantité (ex. « ml »). */
  unit?: string;
  /** Visuel du système de fixation affiché sur le devis. */
  image?: QuoteImage | null;
  /** Total HT exact de la ligne, posé par le chiffrage (évite l'écart d'arrondi quantité × prix au mètre). */
  totalHt?: number;
  /** Total HT de la même ligne au plein tarif : l'écart est la remise affichée au client. */
  normalHt?: number;
};
export type QuoteOption = { label: string; title: string; lines: QuoteLine[] };
export type QuoteClient = { name: string; email: string; phone: string; address: string };
export type QuoteStatut = "brouillon" | "envoye" | "annule";

export type Quote = {
  id: number;
  ref: string;
  created_at: string;
  updated_at: string;
  lead_id: number | null;
  statut: QuoteStatut;
  origine: string;
  created_by: string | null;
  updated_by: string | null;
  client: QuoteClient;
  options: QuoteOption[];
  total_ht: string;
  total_ttc: string;
  price_version: number | null;
  /** Niveau de prix choisi (coefficient) ; null = prix du site ou saisie libre. */
  coef?: string | null;
  sent_at: string | null;
  sent_by: string | null;
  sent_to: string | null;
  snapshot: unknown;
};

export const VAT_RATES = [0.2, 0.1, 0.055, 0];
export const QUOTE_STATUT_LABELS: Record<QuoteStatut, string> = { brouillon: "À valider", envoye: "Envoyé", annule: "Annulé" };

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export type OptionTotals = { ht: number; tva: { rate: number; base: number; amount: number }[]; tvaTotal: number; ttc: number; remise: number };

/**
 * Total HT d'une ligne. Le total exact posé par le chiffrage n'est retenu que s'il correspond
 * bien à quantité × prix unitaire, au centime d'arrondi près : modifier la ligne l'annule.
 */
export function lineTotal(l: QuoteLine): number {
  const calcule = r2(l.qty * l.unitPriceHt);
  return typeof l.totalHt === "number" && Math.abs(l.totalHt - calcule) <= 0.005 * l.qty + 0.011 ? r2(l.totalHt) : calcule;
}
/** Remise d'une ligne par rapport au plein tarif (0 si aucune, ou si la ligne a été modifiée). */
export function lineRemise(l: QuoteLine): number {
  if (typeof l.totalHt !== "number" || typeof l.normalHt !== "number" || lineTotal(l) !== r2(l.totalHt)) return 0;
  return Math.max(0, r2(l.normalHt - lineTotal(l)));
}

export function optionTotals(o: QuoteOption): OptionTotals {
  const byRate = new Map<number, number>();
  for (const l of o.lines) byRate.set(l.vatRate, r2((byRate.get(l.vatRate) ?? 0) + lineTotal(l)));
  const tva = [...byRate.entries()].sort((a, b) => b[0] - a[0]).map(([rate, base]) => ({ rate, base, amount: r2(base * rate) }));
  const ht = r2(tva.reduce((s, t) => s + t.base, 0));
  const tvaTotal = r2(tva.reduce((s, t) => s + t.amount, 0));
  return { ht, tva, tvaTotal, ttc: r2(ht + tvaTotal), remise: r2(o.lines.reduce((s, l) => s + lineRemise(l), 0)) };
}

/** Nettoie et borne ce qui vient de l'écran — aucun total n'est repris du navigateur. */
/**
 * `ref` : propositions déjà enregistrées. Le total exact et le plein tarif d'une ligne ne viennent
 * jamais de l'écran ; ils sont repris de la ligne enregistrée tant que quantité et prix sont inchangés.
 */
export function sanitizeOptions(raw: unknown, ref: QuoteOption[] = []): { options: QuoteOption[]; error?: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { options: [], error: "Le devis doit contenir au moins une proposition." };
  if (raw.length > 6) return { options: [], error: "Six propositions au maximum." };
  const options: QuoteOption[] = [];
  for (const o of raw as Record<string, unknown>[]) {
    const lines: QuoteLine[] = [];
    for (const l of (Array.isArray(o?.lines) ? o.lines : []) as Record<string, unknown>[]) {
      const description = String(l?.description ?? "").trim().slice(0, 1500);
      const qty = Number(l?.qty);
      const unitPriceHt = Number(l?.unitPriceHt);
      const vatRate = Number(l?.vatRate);
      if (!description) return { options: [], error: "Chaque ligne doit avoir une désignation." };
      if (!Number.isFinite(qty) || qty <= 0 || qty > 100000) return { options: [], error: `Quantité invalide : « ${description.split("\n")[0]} ».` };
      if (!Number.isFinite(unitPriceHt) || unitPriceHt < 0 || unitPriceHt > 10_000_000) return { options: [], error: `Prix invalide : « ${description.split("\n")[0]} ».` };
      if (!VAT_RATES.includes(vatRate)) return { options: [], error: `TVA invalide : « ${description.split("\n")[0]} ».` };
      const unit = String(l?.unit ?? "").trim().slice(0, 8);
      const image = QUOTE_IMAGE_KEYS.find((k) => k === l?.image) ?? null;
      const garde = ref[options.length]?.lines[lines.length];
      const inchange = garde && garde.qty === r2(qty) && garde.unitPriceHt === r2(unitPriceHt);
      lines.push({
        description, qty: r2(qty), unitPriceHt: r2(unitPriceHt), vatRate, ...(unit ? { unit } : {}), ...(image ? { image } : {}),
        ...(inchange && typeof garde.totalHt === "number" ? { totalHt: garde.totalHt } : {}),
        ...(inchange && typeof garde.normalHt === "number" ? { normalHt: garde.normalHt } : {}),
      });
    }
    if (lines.length === 0) return { options: [], error: "Chaque proposition doit contenir au moins une ligne." };
    if (lines.length > 40) return { options: [], error: "Quarante lignes au maximum par proposition." };
    options.push({ label: String(o?.label ?? "").trim().slice(0, 60), title: String(o?.title ?? "").trim().slice(0, 160) || "Proposition", lines });
  }
  return { options };
}

export function sanitizeClient(raw: unknown): QuoteClient {
  const c = (raw ?? {}) as Record<string, unknown>;
  const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  return { name: s(c.name, 120), email: s(c.email, 200).toLowerCase(), phone: s(c.phone, 40), address: s(c.address, 400) };
}

/* -------------------- Brouillon automatique depuis une demande -------------------- */

const TEINTES: Record<string, string> = { clair: "clair", "extra-clair": "extra clair", "fume-1f": "fumé une face", "fume-2f": "fumé deux faces" };
const USAGES: Record<string, string> = {
  piscine: "piscine", escalier: "escalier", balcon: "balcon", terrasse: "terrasse", mezzanine: "mezzanine", fenetre: "fenêtre", interieur: "intérieur", exterieur: "extérieur",
};

/** Chiffrage d'une demande par le moteur du site, avec les tarifs en vigueur ; null si elle est incomplète. */
export async function chiffrageDepuisLead(lead: Lead, coefficient?: number) {
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const cotes = (Array.isArray(a.cotes) ? a.cotes : []).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 200).slice(0, 6);
  const hauteur = Number(a.hauteur);
  const lieu = String(a.lieu ?? a.usage ?? "");
  const c = correspondance({ systeme: a.systeme, verre: a.verre, epaisseur: a.epaisseur, lieu, teinte: a.teinte });
  if (cotes.length === 0 || !Number.isFinite(hauteur) || hauteur <= 0 || !c) return null;
  const { fixation, verre, teinte, systeme } = c;

  const r = chiffrer(
    {
      troncons: cotes.map((longueur) => ({ longueur, escalier: lieu === "escalier" })),
      fixation,
      verre,
      teinte,
      hauteurFinie: hauteur,
      couleur: "anodise",
      departement: typeof a.codePostal === "string" ? a.codePostal.slice(0, 2) : undefined,
      livraison: "livraison",
      ...(coefficient ? { coefficient } : {}),
    },
    await getTarifsSite(),
  );
  return { r, cotes, lieu, systeme, verre, teinte, parDefaut: c.parDefaut };
}

/** Même correspondance que le générateur public, avec les tarifs en vigueur. */
export async function draftOptionsFromLead(lead: Lead, coefficient?: number): Promise<QuoteOption[]> {
  const c = await chiffrageDepuisLead(lead, coefficient);
  // Remise affichée au client : écart avec le plein tarif.
  const plein = coefficient && coefficient < COEF_PLEIN ? await chiffrageDepuisLead(lead, COEF_PLEIN) : null;
  const remise = c && plein ? r2(plein.r.prixHT - c.r.prixHT) : 0;
  if (!c) {
    // Demande incomplète : une ligne à compléter, reprise de l'estimation s'il y en a une.
    const ttc = lead.estimation_ttc ? Number(lead.estimation_ttc) : 0;
    return [{ label: "Notre proposition", title: "Garde-corps en verre sur mesure", lines: [{ description: "Garde-corps en verre sur mesure\nÀ préciser avec le client", qty: 1, unitPriceHt: r2(ttc / 1.2), vatRate: 0.2 }] }];
  }
  const { r, cotes, lieu, systeme, verre, teinte, parDefaut } = c;

  // Une seule ligne « garde-corps en verre + système de fixation », au prix par
  // mètre linéaire, livraison comprise : le détail des coûts par poste reste interne.
  const troncons = cotes.map((c) => `${String(c).replace(".", ",")} m`).join(" + ");
  const ml = r.longueurTotale;
  const SYSTEMES = {
    rail: { titre: "Garde-corps en verre sur rail", fixation: "rail de sol aluminium, finition anodisée", accessoires: "enjoliveurs, joints, embouts et visserie de fixation" },
    pinces: { titre: "Garde-corps en verre sur pinces", fixation: "pinces de sol aluminium, finition anodisée", accessoires: "visserie de fixation" },
    spider: { titre: "Garde-corps en verre sur fixations ponctuelles", fixation: "fixations ponctuelles (spider), finition anodisée", accessoires: "tiges filetées, écrous et rondelles" },
  } as const;
  const sys = SYSTEMES[systeme];

  return [
    {
      label: "Notre proposition",
      title: `Garde-corps en verre${USAGES[lieu] ? ` — ${USAGES[lieu]}` : ""}`,
      lines: [
        {
          description: [
            sys.titre,
            `Vitrage : verre feuilleté trempé ${verre}, bords polis`,
            `Couleur du verre : ${TEINTES[teinte]}`,
            `Fixation : ${sys.fixation}${parDefaut ? " (proposée par défaut, à confirmer avec vous)" : ""}`,
            `${r.nbVerres} vitrage${r.nbVerres > 1 ? "s" : ""} sur mesure — hauteur du verre ${r.hauteurVerre} cm`,
            `Longueur : ${troncons}${cotes.length > 1 ? ` (${String(ml).replace(".", ",")} ml)` : ""}`,
            `Accessoires inclus : ${sys.accessoires}`,
            "Conditionnement en caisse bois et livraison en France métropolitaine inclus",
          ].join("\n"),
          qty: ml,
          unit: "ml",
          // Prix au mètre arrondi au centime ; le total de la ligne est celui du moteur, au centime près.
          unitPriceHt: r2(r.prixHT / ml),
          totalHt: r.prixHT,
          ...(remise > 0 && plein ? { normalHt: plein.r.prixHT } : {}),
          vatRate: 0.2,
          image: systeme,
        },
      ],
    },
  ];
}

/** Prix du projet d'une demande à chacun des niveaux autorisés ; null si la demande est incomplète. */
export async function prixParNiveau(lead: Lead): Promise<{ coef: number; label: string; aide: string; ht: number; ttc: number }[] | null> {
  const out = [];
  for (const n of NIVEAUX_PRIX) {
    const c = await chiffrageDepuisLead(lead, n.coef);
    if (!c) return null;
    out.push({ ...n, ht: c.r.prixHT, ttc: c.r.prixTTC });
  }
  return out;
}

/** Prix plancher HT du projet (coefficient le plus bas autorisé) ; null si la demande est incomplète. */
export async function plancherHt(lead: Lead): Promise<number | null> {
  const c = await chiffrageDepuisLead(lead, COEF_PLANCHER);
  return c ? c.r.prixHT : null;
}

/**
 * Refus si la proposition principale d'un devis passe sous le prix plancher du projet.
 * Les administrateurs ne sont pas limités.
 */
export async function refusPlancher(lead: Lead | null, options: QuoteOption[], admin: boolean): Promise<string | null> {
  if (admin || !lead || options.length === 0) return null;
  const plancher = await plancherHt(lead);
  if (plancher === null) return null;
  const ht = optionTotals(options[0]).ht;
  if (ht >= plancher - 0.5) return null;
  const f = (x: number) => x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Prix sous le plancher : ${f(ht)} € HT pour un minimum de ${f(plancher)} € HT (remise exceptionnelle ×${String(COEF_PLANCHER).replace(".", ",")}). Si le projet a changé, corrigez-le dans « Chiffrage » ; sinon demandez à un administrateur.`;
}

/* ------------------------------ Accès base ------------------------------ */

async function nextRef(): Promise<string> {
  const rows = await q<{ n: string }>("SELECT nextval('quote_ref_seq')::text AS n");
  return `D-${new Date().getFullYear()}-${String(rows[0].n).padStart(4, "0")}`;
}

export async function getQuote(id: number): Promise<Quote | null> {
  if (!Number.isInteger(id)) return null;
  const rows = await q<Quote>("SELECT * FROM quotes WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function quotesForLead(leadId: number): Promise<Quote[]> {
  return q<Quote>("SELECT * FROM quotes WHERE lead_id = $1 ORDER BY id DESC", [leadId]);
}

export async function listQuotes(opts: { statut?: QuoteStatut; limit?: number } = {}): Promise<Quote[]> {
  const vals: unknown[] = [];
  let where = "";
  if (opts.statut) {
    vals.push(opts.statut);
    where = "WHERE statut = $1";
  }
  vals.push(Math.min(opts.limit ?? 50, 500));
  return q<Quote>(`SELECT * FROM quotes ${where} ORDER BY id DESC LIMIT $${vals.length}`, vals);
}

async function insertQuote(input: { leadId: number | null; client: QuoteClient; options: QuoteOption[]; origine: string; actor: string | null }): Promise<Quote> {
  const t = optionTotals(input.options[0]);
  const version = (await currentVersion("site")).version;
  const rows = await q<Quote>(
    `INSERT INTO quotes (ref, lead_id, origine, created_by, updated_by, client, options, total_ht, total_ttc, price_version)
     VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [await nextRef(), input.leadId, input.origine, input.actor, JSON.stringify(input.client), JSON.stringify(input.options), t.ht, t.ttc, version],
  );
  return rows[0];
}

/** Brouillon du devis d'une demande : renvoie celui qui existe, sinon le génère. */
export async function ensureDraftForLead(lead: Lead, actor: string | null, origine: "automatique" | "manuel"): Promise<Quote> {
  const existing = await q<Quote>("SELECT * FROM quotes WHERE lead_id = $1 AND statut = 'brouillon' ORDER BY id DESC LIMIT 1", [lead.id]);
  if (existing[0]) return existing[0];
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const address = [a.adresse, a.codePostal, a.ville].filter((v) => typeof v === "string" && v).join(" ");
  const quote = await insertQuote({
    leadId: lead.id,
    client: { name: lead.name, email: lead.email, phone: lead.phone, address },
    options: await draftOptionsFromLead(lead),
    origine,
    actor,
  });
  await addEvent(lead.id, "info", `Brouillon de devis ${quote.ref} généré (${origine}) — à valider avant envoi`);
  return quote;
}

export async function updateQuote(id: number, client: QuoteClient, options: QuoteOption[], actor: string): Promise<{ ok: boolean; error?: string }> {
  const cur = await getQuote(id);
  if (!cur) return { ok: false, error: "Devis introuvable." };
  if (cur.statut !== "brouillon") return { ok: false, error: "Ce devis a déjà été envoyé : créez une nouvelle version pour le modifier." };
  const t = optionTotals(options[0]);
  await q("UPDATE quotes SET client = $2, options = $3, total_ht = $4, total_ttc = $5, updated_at = now(), updated_by = $6 WHERE id = $1 AND statut = 'brouillon'", [
    id, JSON.stringify(client), JSON.stringify(options), t.ht, t.ttc, actor,
  ]);
  await audit(actor, "devis_modification", "quote", id, { options: cur.options, client: cur.client }, { options, client });
  return { ok: true };
}

/** Nouvelle version modifiable d'un devis déjà envoyé (l'original reste intact). */
export async function duplicateQuote(id: number, actor: string): Promise<Quote | null> {
  const cur = await getQuote(id);
  if (!cur) return null;
  const quote = await insertQuote({ leadId: cur.lead_id, client: cur.client, options: cur.options, origine: `copie de ${cur.ref}`, actor });
  if (cur.lead_id) await addEvent(cur.lead_id, "info", `Nouvelle version de devis ${quote.ref} créée à partir de ${cur.ref}`);
  return quote;
}

/** Marque le devis comme envoyé et fige son contenu. */
export async function markSent(id: number, actor: string, to: string, snapshot: unknown): Promise<void> {
  await q("UPDATE quotes SET statut = 'envoye', sent_at = now(), sent_by = $2, sent_to = $3, snapshot = $4, updated_at = now() WHERE id = $1 AND statut = 'brouillon'", [
    id, actor, to, JSON.stringify(snapshot),
  ]);
  await audit(actor, "devis_envoi", "quote", id, undefined, { to });
}
