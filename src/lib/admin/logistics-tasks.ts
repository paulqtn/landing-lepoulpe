import { adminQuery as q, dbConfigured } from "./db";
import { listShipments, listStock, ORDER_LABELS, type Order, type OrderStatut } from "./logistics";
import { getSetting } from "./settings";

/* ================================================================== */
/*  Tâches du logisticien. Le point de départ de chaque affaire est la */
/*  date à laquelle le commercial l'a validée (passage à « Gagné »,    */
/*  colonne leads.won_at). Chaque étape a une échéance = date de       */
/*  validation + un délai en jours, réglable dans le back office.      */
/* ================================================================== */

export type Delais = { lancement: number; decoupe: number; faconnage: number; pret: number; expedition: number };

/** Jours après la validation commerciale auxquels chaque étape doit être faite. */
export const DELAIS_DEFAUT: Delais = { lancement: 1, decoupe: 3, faconnage: 6, pret: 8, expedition: 10 };

export const DELAIS_LABELS: Record<keyof Delais, string> = {
  lancement: "Lancer la commande à l'atelier",
  decoupe: "Démarrer la découpe",
  faconnage: "Passer au façonnage",
  pret: "Commande prête à expédier",
  expedition: "Départ de l'expédition",
};

export async function getDelais(): Promise<Delais> {
  const stored = (await getSetting<Partial<Delais>>("logistique")) ?? {};
  const out = { ...DELAIS_DEFAUT };
  for (const k of Object.keys(out) as (keyof Delais)[]) {
    const v = stored[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 365) out[k] = v;
  }
  return out;
}

export type Task = {
  id: string;
  kind: "lancer" | "avancer" | "affecter" | "tournee";
  /** Ce qu'il y a à faire. */
  action: string;
  ref: string;
  client: string;
  detail: string;
  /** Date de validation par le commercial (ISO). */
  valideLe: string | null;
  /** Échéance de la tâche (ISO, jour). */
  echeance: string;
  /** Jours de retard (> 0), 0 = aujourd'hui, < 0 = à venir. */
  retard: number;
  leadId?: number;
  orderId?: number;
  shipmentId?: number;
  nextLabel?: string;
};

const DAY = 86400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const SYS: Record<string, string> = { rail: "rail", pinces: "pinces", spider: "spider" };
const orderDetail = (o: Pick<Order, "ml" | "nb_verres" | "hauteur" | "verre" | "systeme" | "departement">) =>
  [
    o.ml ? `${String(o.ml).replace(".", ",")} ml` : null,
    o.nb_verres ? `${o.nb_verres} verres` : null,
    o.verre ? `verre ${o.verre}` : null,
    o.hauteur ? `h ${o.hauteur} cm` : null,
    o.systeme ? SYS[o.systeme] ?? o.systeme : null,
    o.departement ? `dépt ${o.departement}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

type OrderRow = Order & { won_at: string | null };
type WonLead = { id: number; name: string; won_at: string | null; created_at: string; answers: Record<string, unknown> | null };

export type LogisticsBoard = {
  tasks: Task[];
  stockAlertes: { label: string; qty: number; seuil: number; previsionnel: number; unite: string }[];
  delais: Delais;
  compteurs: { enCours: number; pretes: number; aLancer: number };
};

export async function logisticsBoard(): Promise<LogisticsBoard> {
  const delais = await getDelais();
  if (!dbConfigured) return { tasks: [], stockAlertes: [], delais, compteurs: { enCours: 0, pretes: 0, aLancer: 0 } };

  const [orders, wonLeads, shipments, stock] = await Promise.all([
    q<OrderRow>(
      `SELECT o.*, l.won_at FROM orders o LEFT JOIN leads l ON l.id = o.lead_id
       WHERE o.statut IN ('a_preparer', 'decoupe', 'faconnage', 'pret') ORDER BY COALESCE(l.won_at, o.created_at) ASC LIMIT 500`,
    ),
    q<WonLead>(
      `SELECT l.id, l.name, l.won_at, l.created_at, l.answers FROM leads l
       WHERE l.statut = 'gagne' AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.lead_id = l.id)
       ORDER BY COALESCE(l.won_at, l.created_at) ASC LIMIT 500`,
    ),
    listShipments(),
    listStock(),
  ]);

  const today = startOfDay(new Date());
  const due = (from: string | Date | null, days: number) => {
    const base = startOfDay(new Date(from ?? Date.now())) + days * DAY;
    return { echeance: new Date(base).toISOString(), retard: Math.round((today - base) / DAY) };
  };
  const tasks: Task[] = [];

  // 1. Affaires validées par le commercial, pas encore lancées à l'atelier.
  for (const l of wonLeads) {
    const a = l.answers ?? {};
    const cotes = Array.isArray(a.cotes) ? (a.cotes as unknown[]).map(Number).filter((n) => Number.isFinite(n)) : [];
    const ml = cotes.reduce((s, c) => s + c, 0);
    const valide = l.won_at ?? l.created_at;
    tasks.push({
      id: `lead-${l.id}`,
      kind: "lancer",
      action: "Lancer la commande à l'atelier",
      ref: `Affaire n°${l.id}`,
      client: l.name,
      detail: orderDetail({
        ml: ml ? String(ml) : null,
        nb_verres: null,
        hauteur: typeof a.hauteur === "string" ? a.hauteur : null,
        verre: typeof a.verre === "string" ? a.verre : typeof a.epaisseur === "string" ? a.epaisseur : null,
        systeme: typeof a.systeme === "string" ? a.systeme : null,
        departement: typeof a.codePostal === "string" ? a.codePostal.slice(0, 2) : null,
      }),
      valideLe: new Date(valide).toISOString(),
      leadId: l.id,
      ...due(valide, delais.lancement),
    });
  }

  // 2. Commandes en atelier : l'étape suivante, à son échéance.
  const STEP: Record<Exclude<OrderStatut, "expedie" | "livre">, { action: string; delai: keyof Delais; next: OrderStatut }> = {
    a_preparer: { action: "Démarrer la découpe", delai: "decoupe", next: "decoupe" },
    decoupe: { action: "Passer au façonnage", delai: "faconnage", next: "faconnage" },
    faconnage: { action: "Terminer : prêt à expédier", delai: "pret", next: "pret" },
    pret: { action: "Affecter à une expédition", delai: "expedition", next: "expedie" },
  };
  for (const o of orders) {
    const step = STEP[o.statut as keyof typeof STEP];
    if (!step) continue;
    if (o.statut === "pret" && o.shipment_id) continue; // suivie par sa tournée (point 3)
    const valide = o.won_at ?? o.created_at;
    tasks.push({
      id: `order-${o.id}`,
      kind: o.statut === "pret" ? "affecter" : "avancer",
      action: step.action,
      ref: o.ref,
      client: o.client,
      detail: orderDetail(o),
      valideLe: new Date(valide).toISOString(),
      orderId: o.id,
      nextLabel: ORDER_LABELS[step.next],
      ...due(valide, delais[step.delai]),
    });
  }

  // 3. Tournées à charger ou à faire partir.
  for (const s of shipments) {
    if (s.statut === "livree" || s.orders.length === 0) continue;
    const base = s.date_prevue ? startOfDay(new Date(s.date_prevue)) : today;
    tasks.push({
      id: `ship-${s.id}`,
      kind: "tournee",
      action: s.statut === "planifiee" ? "Charger la tournée" : s.statut === "chargee" ? "Faire partir la tournée" : "Confirmer la livraison",
      ref: s.ref,
      client: s.orders.map((o) => o.client).join(", "),
      detail: [s.transporteur, s.departement ? `dépt ${s.departement}` : null, `${s.orders.length} commande${s.orders.length > 1 ? "s" : ""}`].filter(Boolean).join(" · "),
      valideLe: null,
      shipmentId: s.id,
      nextLabel: s.statut === "planifiee" ? "Chargée" : s.statut === "chargee" ? "En route" : "Livrée",
      echeance: new Date(base).toISOString(),
      retard: Math.round((today - base) / DAY),
    });
  }

  // Les plus en retard d'abord, puis les validations les plus anciennes.
  tasks.sort((a, b) => b.retard - a.retard || (a.valideLe ?? "").localeCompare(b.valideLe ?? ""));

  return {
    tasks,
    delais,
    stockAlertes: stock
      .filter((it) => Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0)
      .map((it) => ({ label: it.label, qty: Number(it.qty), seuil: Number(it.seuil), previsionnel: it.previsionnel, unite: it.unite })),
    compteurs: { enCours: orders.filter((o) => o.statut !== "pret").length, pretes: orders.filter((o) => o.statut === "pret").length, aLancer: wonLeads.length },
  };
}
