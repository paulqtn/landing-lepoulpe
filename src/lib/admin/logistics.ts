import { adminQuery as q, dbConfigured, listLeads, type Lead } from "./db";

/* ================================================================== */
/*  Pôle GESTION — commandes atelier, stock matière, expéditions.      */
/*  Même philosophie que le CRM : Postgres quand il est là, un jeu de  */
/*  données démo cohérent sinon (lectures servies, écritures no-op).   */
/* ================================================================== */

/* ------------------------------ Types ------------------------------ */

export const ORDER_STATUTS = ["a_preparer", "decoupe", "faconnage", "pret", "expedie", "livre"] as const;
export type OrderStatut = (typeof ORDER_STATUTS)[number];
export const ORDER_LABELS: Record<OrderStatut, string> = {
  a_preparer: "À préparer",
  decoupe: "Découpe",
  faconnage: "Façonnage",
  pret: "Prêt à expédier",
  expedie: "Expédié",
  livre: "Livré",
};

export const SHIPMENT_STATUTS = ["planifiee", "chargee", "en_route", "livree"] as const;
export type ShipmentStatut = (typeof SHIPMENT_STATUTS)[number];
export const SHIPMENT_LABELS: Record<ShipmentStatut, string> = {
  planifiee: "Planifiée",
  chargee: "Chargée",
  en_route: "En route",
  livree: "Livrée",
};

export type Order = {
  id: number;
  created_at: string;
  updated_at: string;
  ref: string;
  lead_id: number | null;
  client: string;
  statut: OrderStatut;
  ml: string | null;
  nb_verres: number | null;
  hauteur: string | null;
  verre: string | null;
  systeme: string | null;
  montant_ttc: string | null;
  departement: string | null;
  shipment_id: number | null;
};

export type StockItem = {
  id: number;
  sku: string;
  label: string;
  categorie: string;
  unite: string;
  qty: string;
  seuil: string;
  /** Quantité réservée par les commandes en atelier (calculée). */
  engage: number;
  /** qty − engagé : ce qu'il restera une fois l'atelier servi. */
  previsionnel: number;
};

export type Shipment = {
  id: number;
  created_at: string;
  ref: string;
  transporteur: string | null;
  departement: string | null;
  date_prevue: string | null;
  statut: ShipmentStatut;
  /** Commandes rattachées (ref + client), pour l'affichage. */
  orders: { id: number; ref: string; client: string }[];
};

/* --------------------------- Jeu de démo --------------------------- */

const h = 3600_000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const day = (inDays: number) => new Date(Date.now() + inDays * 24 * h).toISOString().slice(0, 10);

const DEMO_ORDERS: Order[] = [
  { id: 1, created_at: iso(26 * h), updated_at: iso(3 * h), ref: "CMD-1041", lead_id: 1, client: "Démo — Claire Fontaine", statut: "decoupe", ml: "5", nb_verres: 4, hauteur: "110", verre: "66.4", systeme: "rail", montant_ttc: "2890", departement: "83", shipment_id: null },
  { id: 2, created_at: iso(20 * h), updated_at: iso(20 * h), ref: "CMD-1042", lead_id: 2, client: "Démo — Marc Olivier", statut: "a_preparer", ml: "4", nb_verres: 3, hauteur: "100", verre: "88.4", systeme: "pinces", montant_ttc: "1710", departement: "69", shipment_id: null },
  { id: 3, created_at: iso(5 * 24 * h), updated_at: iso(8 * h), ref: "CMD-1038", lead_id: null, client: "Démo — SARL Terrasses du Sud", statut: "pret", ml: "12,5", nb_verres: 9, hauteur: "100", verre: "88.4", systeme: "rail", montant_ttc: "6240", departement: "83", shipment_id: 1 },
  { id: 4, created_at: iso(8 * 24 * h), updated_at: iso(30 * h), ref: "CMD-1036", lead_id: null, client: "Démo — Hôtel Bellevue", statut: "expedie", ml: "18", nb_verres: 13, hauteur: "110", verre: "1010.4", systeme: "spider", montant_ttc: "11480", departement: "69", shipment_id: 2 },
  { id: 5, created_at: iso(14 * 24 * h), updated_at: iso(6 * 24 * h), ref: "CMD-1031", lead_id: null, client: "Démo — M. Lambert", statut: "livre", ml: "3,5", nb_verres: 3, hauteur: "100", verre: "88.4", systeme: "pinces", montant_ttc: "1890", departement: "13", shipment_id: 3 },
];

const DEMO_STOCK: Omit<StockItem, "engage" | "previsionnel">[] = [
  { id: 1, sku: "VER-664", label: "Verre feuilleté 66.4", categorie: "verre", unite: "m²", qty: "120", seuil: "60" },
  { id: 2, sku: "VER-884", label: "Verre feuilleté 88.4", categorie: "verre", unite: "m²", qty: "84", seuil: "100" },
  { id: 3, sku: "VER-1010", label: "Verre feuilleté 1010.4", categorie: "verre", unite: "m²", qty: "46", seuil: "30" },
  { id: 4, sku: "FIX-RAIL", label: "Rail aluminium GS-19", categorie: "fixation", unite: "ml", qty: "170", seuil: "80" },
  { id: 5, sku: "FIX-PINCE", label: "Pinces inox GS-07", categorie: "fixation", unite: "u", qty: "60", seuil: "120" },
  { id: 6, sku: "FIX-SPIDER", label: "Boutons spider GS-02", categorie: "fixation", unite: "u", qty: "96", seuil: "40" },
];

const DEMO_SHIPMENTS: Omit<Shipment, "orders">[] = [
  { id: 1, created_at: iso(10 * h), ref: "EXP-204", transporteur: "Chronotrans", departement: "83", date_prevue: day(2), statut: "planifiee" },
  { id: 2, created_at: iso(32 * h), ref: "EXP-203", transporteur: "Geodis", departement: "69", date_prevue: day(0), statut: "en_route" },
  { id: 3, created_at: iso(7 * 24 * h), ref: "EXP-201", transporteur: "Chronotrans", departement: "13", date_prevue: day(-5), statut: "livree" },
];

/* ------------------------- Aides matière ------------------------- */

/** Besoin matière d'une commande, par SKU (approximation d'atelier). */
function besoins(o: Order): Record<string, number> {
  const ml = parseFloat(String(o.ml ?? "0").replace(",", ".")) || 0;
  const hM = (Number(o.hauteur) || 100) / 100;
  const out: Record<string, number> = {};
  const verreSku = o.verre === "66.4" ? "VER-664" : o.verre === "1010.4" ? "VER-1010" : "VER-884";
  out[verreSku] = Math.round(ml * hM * 10) / 10;
  if (o.systeme === "rail") out["FIX-RAIL"] = ml;
  else if (o.systeme === "pinces") out["FIX-PINCE"] = Math.ceil(ml * 2.5);
  else if (o.systeme === "spider") out["FIX-SPIDER"] = (o.nb_verres ?? Math.ceil(ml / 1.5)) * 4;
  return out;
}

const ACTIFS: OrderStatut[] = ["a_preparer", "decoupe", "faconnage", "pret"];

function withForecast(items: Omit<StockItem, "engage" | "previsionnel">[], orders: Order[]): StockItem[] {
  const engage: Record<string, number> = {};
  for (const o of orders) {
    if (!ACTIFS.includes(o.statut)) continue;
    for (const [sku, n] of Object.entries(besoins(o))) engage[sku] = (engage[sku] ?? 0) + n;
  }
  return items.map((it) => {
    const e = Math.round((engage[it.sku] ?? 0) * 10) / 10;
    return { ...it, engage: e, previsionnel: Math.round((Number(it.qty) - e) * 10) / 10 };
  });
}

/* --------------------------- Commandes --------------------------- */

export async function listOrders(): Promise<Order[]> {
  if (!dbConfigured) return DEMO_ORDERS.map((o) => ({ ...o }));
  return q<Order>(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`);
}

export async function createOrderFromLead(lead: Lead): Promise<{ ok: boolean; ref?: string }> {
  if (!dbConfigured) return { ok: false };
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const cotes = Array.isArray(a.cotes) ? (a.cotes as number[]) : [];
  const ml = cotes.reduce((s, c) => s + (Number(c) || 0), 0);
  const ref = `CMD-${1000 + lead.id}`;
  const dep = typeof a.codePostal === "string" ? a.codePostal.slice(0, 2) : null;
  await q(
    `INSERT INTO orders (ref, lead_id, client, ml, nb_verres, hauteur, verre, systeme, montant_ttc, departement)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (ref) DO NOTHING`,
    [ref, lead.id, lead.name, ml || null, ml ? Math.ceil(ml / 1.5) : null, (a.hauteur as string) ?? null,
     (a.verre as string) ?? (a.epaisseur as string) ?? "88.4", (a.systeme as string) ?? null,
     lead.estimation_ttc, dep],
  );
  return { ok: true, ref };
}

export async function advanceOrder(id: number): Promise<{ ok: boolean }> {
  if (!dbConfigured) return { ok: false };
  const rows = await q<{ statut: OrderStatut }>(`SELECT statut FROM orders WHERE id=$1`, [id]);
  const cur = rows[0]?.statut;
  if (!cur) return { ok: false };
  const idx = ORDER_STATUTS.indexOf(cur);
  if (idx < 0 || idx >= ORDER_STATUTS.length - 1) return { ok: false };
  const next = ORDER_STATUTS[idx + 1];
  await q(`UPDATE orders SET statut=$2, updated_at=now() WHERE id=$1`, [id, next]);
  // Sortie de stock automatique au passage en découpe : la matière est consommée.
  if (next === "decoupe") {
    const o = (await q<Order>(`SELECT * FROM orders WHERE id=$1`, [id]))[0];
    if (o) {
      for (const [sku, n] of Object.entries(besoins(o))) {
        const item = (await q<{ id: number }>(`SELECT id FROM stock_items WHERE sku=$1`, [sku]))[0];
        if (item) {
          await q(`UPDATE stock_items SET qty = qty - $2 WHERE id=$1`, [item.id, n]);
          await q(`INSERT INTO stock_moves (item_id, delta, motif) VALUES ($1,$2,$3)`, [item.id, -n, `Découpe ${o.ref}`]);
        }
      }
    }
  }
  return { ok: true };
}

/* ----------------------------- Stock ----------------------------- */

const STOCK_SEED = DEMO_STOCK.map(({ sku, label, categorie, unite, qty, seuil }) => ({ sku, label, categorie, unite, qty, seuil }));

export async function listStock(): Promise<StockItem[]> {
  if (!dbConfigured) return withForecast(DEMO_STOCK, DEMO_ORDERS);
  let items = await q<Omit<StockItem, "engage" | "previsionnel">>(`SELECT * FROM stock_items ORDER BY categorie, sku`);
  if (items.length === 0) {
    // Référentiel de départ : les 6 matières du site, ajustables ensuite.
    for (const s of STOCK_SEED) {
      await q(`INSERT INTO stock_items (sku,label,categorie,unite,qty,seuil) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (sku) DO NOTHING`,
        [s.sku, s.label, s.categorie, s.unite, s.qty, s.seuil]);
    }
    items = await q(`SELECT * FROM stock_items ORDER BY categorie, sku`);
  }
  const orders = await listOrders();
  return withForecast(items, orders);
}

export async function moveStock(itemId: number, delta: number, motif: string): Promise<{ ok: boolean }> {
  if (!dbConfigured) return { ok: false };
  if (!Number.isFinite(delta) || delta === 0) return { ok: false };
  await q(`UPDATE stock_items SET qty = qty + $2 WHERE id=$1`, [itemId, delta]);
  await q(`INSERT INTO stock_moves (item_id, delta, motif) VALUES ($1,$2,$3)`, [itemId, delta, motif || null]);
  return { ok: true };
}

/* -------------------------- Expéditions -------------------------- */

export async function listShipments(): Promise<Shipment[]> {
  const attach = (ships: Omit<Shipment, "orders">[], orders: Order[]): Shipment[] =>
    ships.map((s) => ({
      ...s,
      orders: orders.filter((o) => o.shipment_id === s.id).map((o) => ({ id: o.id, ref: o.ref, client: o.client })),
    }));
  if (!dbConfigured) return attach(DEMO_SHIPMENTS, DEMO_ORDERS);
  const [ships, orders] = await Promise.all([
    q<Omit<Shipment, "orders">>(`SELECT * FROM shipments ORDER BY date_prevue NULLS LAST, created_at DESC LIMIT 100`),
    listOrders(),
  ]);
  return attach(ships, orders);
}

export async function createShipment(input: { transporteur: string; departement: string; datePrevue: string }): Promise<{ ok: boolean }> {
  if (!dbConfigured) return { ok: false };
  const n = await q<{ c: string }>(`SELECT count(*) c FROM shipments`);
  const ref = `EXP-${200 + Number(n[0]?.c ?? 0) + 1}`;
  await q(`INSERT INTO shipments (ref, transporteur, departement, date_prevue) VALUES ($1,$2,$3,$4)`,
    [ref, input.transporteur || null, input.departement || null, input.datePrevue || null]);
  return { ok: true };
}

export async function advanceShipment(id: number): Promise<{ ok: boolean }> {
  if (!dbConfigured) return { ok: false };
  const rows = await q<{ statut: ShipmentStatut }>(`SELECT statut FROM shipments WHERE id=$1`, [id]);
  const cur = rows[0]?.statut;
  if (!cur) return { ok: false };
  const idx = SHIPMENT_STATUTS.indexOf(cur);
  if (idx < 0 || idx >= SHIPMENT_STATUTS.length - 1) return { ok: false };
  const next = SHIPMENT_STATUTS[idx + 1];
  await q(`UPDATE shipments SET statut=$2 WHERE id=$1`, [id, next]);
  // Les commandes de la tournée suivent : chargée → expédié, livrée → livré.
  if (next === "en_route") await q(`UPDATE orders SET statut='expedie', updated_at=now() WHERE shipment_id=$1 AND statut='pret'`, [id]);
  if (next === "livree") await q(`UPDATE orders SET statut='livre', updated_at=now() WHERE shipment_id=$1 AND statut IN ('pret','expedie')`, [id]);
  return { ok: true };
}

export async function assignOrderToShipment(orderId: number, shipmentId: number | null): Promise<{ ok: boolean }> {
  if (!dbConfigured) return { ok: false };
  await q(`UPDATE orders SET shipment_id=$2, updated_at=now() WHERE id=$1`, [orderId, shipmentId]);
  return { ok: true };
}

/* ------------------------- Statistiques ------------------------- */

export type GlobalStats = {
  parJour: { d: string; n: number }[];
  funnel: { label: string; n: number }[];
  tauxConversion: number;
  sources: { source: string; n: number; gagnes: number }[];
  usages: { usage: string; n: number }[];
  scores: { A: number; B: number; C: number };
  pipelineTTC: number;
  caGagne: number;
  panierMoyen: number;
  ordersParStatut: { statut: OrderStatut; n: number; montant: number }[];
  delaiMoyenJours: number | null;
  stockAlertes: number;
};

export async function globalStats(): Promise<GlobalStats> {
  const [leads, orders, stock] = await Promise.all([
    listLeads({ limit: 2000 }),
    listOrders(),
    listStock(),
  ]);

  // Volume par jour (30 jours), trous comblés.
  const parJour: { d: string; n: number }[] = [];
  const counts: Record<string, number> = {};
  for (const l of leads) counts[l.created_at.slice(0, 10)] = (counts[l.created_at.slice(0, 10)] ?? 0) + 1;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * h).toISOString().slice(0, 10);
    parJour.push({ d, n: counts[d] ?? 0 });
  }
  // En démo (3 leads), une série lisible plutôt qu'un graphe vide.
  if (!dbConfigured) {
    parJour.forEach((p, i) => { p.n = Math.max(0, Math.round(2.5 + 2 * Math.sin(i / 3.1) + (i % 7 === 5 ? 2 : 0))); });
  }

  const by = (f: (l: Lead) => boolean) => leads.filter(f).length;
  const enCours = by((l) => !["gagne", "perdu", "nouveau"].includes(l.statut));
  const funnel = [
    { label: "Demandes reçues", n: leads.length },
    { label: "Traitées / devis envoyés", n: enCours + by((l) => l.statut === "gagne" || l.statut === "perdu") },
    { label: "Gagnées", n: by((l) => l.statut === "gagne") },
  ];
  const tauxConversion = leads.length ? Math.round((funnel[2].n / leads.length) * 100) : 0;

  const srcMap: Record<string, { n: number; gagnes: number }> = {};
  for (const l of leads) {
    const s = l.source ?? "site";
    srcMap[s] = srcMap[s] ?? { n: 0, gagnes: 0 };
    srcMap[s].n++;
    if (l.statut === "gagne") srcMap[s].gagnes++;
  }
  const sources = Object.entries(srcMap).map(([source, v]) => ({ source, ...v })).sort((a, b) => b.n - a.n).slice(0, 6);

  const usgMap: Record<string, number> = {};
  for (const l of leads) {
    const u = ((l.answers ?? {}) as Record<string, unknown>).lieu;
    if (typeof u === "string") usgMap[u] = (usgMap[u] ?? 0) + 1;
  }
  const usages = Object.entries(usgMap).map(([usage, n]) => ({ usage, n })).sort((a, b) => b.n - a.n).slice(0, 6);

  const scores = { A: by((l) => l.score === "A"), B: by((l) => l.score === "B"), C: by((l) => l.score === "C") };

  const num = (v: string | null) => (v ? Number(v) : 0);
  const actifs = leads.filter((l) => !["gagne", "perdu"].includes(l.statut) && l.estimation_ttc);
  const pipelineTTC = Math.round(actifs.reduce((s, l) => s + num(l.estimation_ttc), 0));
  const gagnes = leads.filter((l) => l.statut === "gagne" && l.estimation_ttc);
  const caGagne = Math.round(gagnes.reduce((s, l) => s + num(l.estimation_ttc), 0)) + (!dbConfigured ? 21500 : 0);
  const avecEstim = leads.filter((l) => l.estimation_ttc);
  const panierMoyen = avecEstim.length ? Math.round(avecEstim.reduce((s, l) => s + num(l.estimation_ttc), 0) / avecEstim.length) : 0;

  const ordersParStatut = ORDER_STATUTS.map((statut) => {
    const list = orders.filter((o) => o.statut === statut);
    return { statut, n: list.length, montant: Math.round(list.reduce((s, o) => s + num(o.montant_ttc), 0)) };
  });

  const expediees = orders.filter((o) => ["expedie", "livre"].includes(o.statut));
  const delaiMoyenJours = expediees.length
    ? Math.round(expediees.reduce((s, o) => s + (Number(new Date(o.updated_at)) - Number(new Date(o.created_at))) / (24 * h), 0) / expediees.length * 10) / 10
    : null;

  const stockAlertes = stock.filter((it) => Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0).length;

  return { parJour, funnel, tauxConversion, sources, usages, scores, pipelineTTC, caGagne, panierMoyen, ordersParStatut, delaiMoyenJours, stockAlertes };
}

/** Démo : le hub gestion sait dire que les écritures sont désactivées. */
export const logisticsWritable = dbConfigured;
