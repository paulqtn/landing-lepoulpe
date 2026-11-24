import { adminQuery as q, dbConfigured } from "./db";
import { audit } from "./auth";
import { TARIFS_DEFAUT, type TarifsSite } from "@/lib/calculateur/tarifs";
import { catalog as CATALOGUE_DEFAUT } from "@/lib/simulation/catalog";
import type { Catalog } from "@/lib/simulation/engine";

/* ================================================================== */
/*  Tarifs administrables. Chaque publication crée une VERSION en base */
/*  (table price_versions) ; les moteurs lisent la dernière version,   */
/*  avec un cache court. Sans version publiée — ou si la base ne       */
/*  répond pas — ce sont les valeurs d'origine du code qui servent :   */
/*  le site ne casse jamais. Confidentiel : serveur uniquement.        */
/* ================================================================== */

export type Engine = "site" | "simulation";
export const ENGINES: Engine[] = ["site", "simulation"];
export const ENGINE_LABELS: Record<Engine, string> = {
  site: "Générateur du site et calculateur interne",
  simulation: "Simulation (calculateur MGK 2026)",
};

type Data = Record<string, unknown>;
const DEFAULTS: Record<Engine, Data> = {
  site: TARIFS_DEFAUT as unknown as Data,
  simulation: CATALOGUE_DEFAUT as unknown as Data,
};

const TTL_MS = 60_000;
const cache = new Map<Engine, { at: number; data: Data; version: number | null }>();

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Complète une version enregistrée avec les clés apparues depuis dans le code. */
function fill(stored: unknown, base: unknown): unknown {
  if (Array.isArray(base)) return Array.isArray(stored) ? stored : clone(base);
  if (base && typeof base === "object") {
    const out: Data = stored && typeof stored === "object" && !Array.isArray(stored) ? { ...(stored as Data) } : {};
    for (const [k, v] of Object.entries(base as Data)) out[k] = k in out ? fill(out[k], v) : clone(v);
    return out;
  }
  return stored === undefined ? base : stored;
}

async function load(engine: Engine): Promise<{ data: Data; version: number | null }> {
  const hit = cache.get(engine);
  if (hit && Date.now() - hit.at < TTL_MS) return hit;
  let entry = { at: Date.now(), data: DEFAULTS[engine], version: null as number | null };
  if (dbConfigured) {
    try {
      const rows = await q<{ id: number; data: Data }>("SELECT id, data FROM price_versions WHERE engine = $1 ORDER BY id DESC LIMIT 1", [engine]);
      if (rows[0]) entry = { at: Date.now(), data: fill(rows[0].data, DEFAULTS[engine]) as Data, version: rows[0].id };
    } catch (e) {
      console.error("[tarifs] lecture impossible, valeurs d'origine utilisées :", e);
      if (hit) return hit; // dernière version connue plutôt que les valeurs d'origine
    }
  }
  cache.set(engine, entry);
  return entry;
}

/** Tarifs en vigueur du générateur public et du calculateur interne. */
export async function getTarifsSite(): Promise<TarifsSite> {
  return (await load("site")).data as unknown as TarifsSite;
}

/** Catalogue en vigueur de la Simulation. */
export async function getCatalogueSimulation(): Promise<Catalog> {
  return (await load("simulation")).data as unknown as Catalog;
}

export async function currentVersion(engine: Engine): Promise<{ data: Data; version: number | null }> {
  cache.delete(engine);
  return load(engine);
}

/* ------------------------- Champs modifiables ------------------------ */

export type PriceRow = {
  /** Chemin dans le jeu de données, segments séparés par « / ». */
  path: string;
  label: string;
  value: number | null;
  unit: string;
  /** Vide autorisé = « À confirmer » (prix indisponible). */
  nullable?: boolean;
  /** Valeur d'origine du code, pour repérer ce qui a été modifié. */
  original: number | null;
};
export type PriceSection = { title: string; hint?: string; rows: PriceRow[] };

const get = (data: unknown, path: string): unknown =>
  path.split("/").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Data)[k] : undefined), data);

const TEINTES: Record<string, string> = { clair: "Clair", "extra-clair": "Extra clair", "fume-1f": "Fumé 1 face", "fume-2f": "Fumé 2 faces" };
const USINAGES = ["droit", "droit + perçage", "découpe", "découpe + perçage"];
const FINISH: Record<string, string> = { ANODISE: "anodisé", RAL_STANDARD: "RAL standard", AUTRE_COULEUR: "autre couleur" };

type CompLike = { ref?: string; label?: string; prix?: [number, number] };

export function describe(engine: Engine, data: Data): PriceSection[] {
  const base = DEFAULTS[engine];
  const row = (path: string, label: string, unit: string, nullable = false): PriceRow => {
    const v = get(data, path);
    const o = get(base, path);
    return { path, label, unit, nullable, value: typeof v === "number" ? v : null, original: typeof o === "number" ? o : null };
  };
  const sections: PriceSection[] = [];

  if (engine === "site") {
    const d = data as unknown as TarifsSite;
    sections.push({
      title: "Paramètres généraux",
      rows: [
        row("coefDefaut", "Coefficient de vente", "×"),
        row("tva", "TVA", "taux"),
        row("prixCaisse", "Caisse bois", "€"),
        row("majorationRalAutre", "Majoration RAL hors standard", "×"),
        row("transport/turquie/franchise", "Turquie → France : verres offerts par caisse", "verres"),
        row("transport/turquie/parVerre", "Turquie → France : prix par verre au-delà", "€"),
        row("transport/turquie/plafond", "Turquie → France : plafond par caisse", "€"),
        row("transport/france/base", "France → client : base par envoi (0 à 5 ml)", "€"),
        row("transport/france/palier", "France → client : palier par tranche de 5 ml", "€"),
        row("transport/france/supplementRail", "France → client : supplément rail", "€"),
      ],
    });
    for (const ep of Object.keys(d.verre)) {
      const rows: PriceRow[] = [row(`poidsM2/${ep}`, "Poids", "kg/m²")];
      for (const teinte of Object.keys(d.verre[ep as keyof typeof d.verre])) {
        USINAGES.forEach((u, i) => rows.push(row(`verre/${ep}/${teinte}/${i}`, `${TEINTES[teinte] ?? teinte} — ${u}`, "€/m²")));
      }
      sections.push({ title: `Verre ${ep}`, hint: "Prix d'achat au m².", rows });
    }
    for (const [key, sys] of Object.entries(d.systemes)) {
      const rows: PriceRow[] = [];
      const comp = (path: string, c: CompLike | undefined, suffix = "") => {
        if (!c?.prix) return;
        const name = `${c.label ?? c.ref ?? "Composant"}${suffix}`;
        rows.push(row(`${path}/prix/0`, `${name} — anodisé`, "€"), row(`${path}/prix/1`, `${name} — RAL standard`, "€"));
      };
      comp(`systemes/${key}/rail`, sys.rail);
      comp(`systemes/${key}/habillage`, sys.habillage);
      (sys.parBarre ?? []).forEach((x, i) => comp(`systemes/${key}/parBarre/${i}/comp`, x.comp, ` (×${x.qte} par barre)`));
      comp(`systemes/${key}/piece`, sys.piece);
      (sys.parPiece ?? []).forEach((x, i) => comp(`systemes/${key}/parPiece/${i}/comp`, x.comp, ` (×${x.qte} par pièce)`));
      sections.push({ title: sys.label, rows });
    }
  } else {
    const d = data as unknown as Catalog & { glasses: { legacyLabel: string }[] };
    sections.push({
      title: "Paramètres",
      rows: Object.keys(d.parameters).map((k) => row(`parameters/${k}/value`, PARAM_LABELS[k] ?? k, PARAM_UNITS[k] ?? "")),
    });
    sections.push({
      title: "Verres — prix d'achat au m²",
      rows: d.glasses.map((g, i) => row(`glasses/${i}/purchasePricePerM2`, g.legacyLabel.replace(" Feuilleté Trempé Tous bord polis", ""), "€/m²")),
    });
    d.supports.forEach((s, i) => {
      const rows: PriceRow[] = [];
      for (const f of Object.keys(FINISH)) {
        const p = s.pricing[f as keyof typeof s.pricing];
        if (p.mode === "MULTIPLIER_RAL") continue; // calculé : RAL standard × coefficient « autre couleur »
        rows.push(row(`supports/${i}/pricing/${f}/amount`, `Prix d'achat — ${FINISH[f]}`, "€", true));
      }
      if (typeof s.perPanel === "number") rows.push(row(`supports/${i}/perPanel`, "Quantité par vitrage", "pièces"));
      if (typeof s.perLinearMeter === "number") rows.push(row(`supports/${i}/perLinearMeter`, "Quantité par mètre linéaire", "pièces"));
      rows.push(row(`supports/${i}/fixedAccessoriesPerUnit`, "Accessoires par pièce", "€"));
      sections.push({
        title: s.legacyLabel,
        hint: Object.values(s.pricing).some((p) => p.mode === "MULTIPLIER_RAL") ? "Autre couleur = RAL standard × coefficient « autre couleur »." : undefined,
        rows,
      });
    });
  }
  return sections;
}

const PARAM_LABELS: Record<string, string> = {
  P_AutreCouleur: "Coefficient « autre couleur » (sur le prix RAL)",
  P_Barre: "Longueur d'une barre de rail",
  P_Caisse: "Caisse bois",
  P_Decoupe: "Découpe spéciale (achat)",
  P_FC_Base: "France → client : base par palette",
  P_FC_Incr: "France → client : palier par tranche",
  P_FC_MaxVitrages: "France → client : vitrages max du tableau par palette",
  P_FC_Rail: "France → client : supplément rail par palette",
  P_FC_Tolerance: "France → client : tolérance 1 palette",
  P_FC_Tranche: "France → client : vitrages par tranche",
  P_Pion: "Pion d'alignement (vente)",
  P_PoidsMax: "Poids cible par caisse (alerte)",
  P_PoidsSeuil: "Poids à partir duquel plusieurs caisses",
  P_Portillon: "Portillon (vente)",
  P_ReducRail: "Réduction de hauteur du verre sur rail",
  P_TF_Franchise: "Turquie → France : vitrages offerts par caisse",
  P_TF_Plafond: "Turquie → France : plafond par caisse",
  P_TF_Tarif: "Turquie → France : prix par vitrage au-delà",
};
const PARAM_UNITS: Record<string, string> = {
  P_AutreCouleur: "×", P_Barre: "m", P_Caisse: "€", P_Decoupe: "€", P_FC_Base: "€", P_FC_Incr: "€", P_FC_MaxVitrages: "vitrages",
  P_FC_Rail: "€", P_FC_Tolerance: "vitrages", P_FC_Tranche: "vitrages", P_Pion: "€", P_PoidsMax: "kg", P_PoidsSeuil: "kg",
  P_Portillon: "€", P_ReducRail: "mm", P_TF_Franchise: "vitrages", P_TF_Plafond: "€", P_TF_Tarif: "€",
};

/* ----------------------- Application des modifications ---------------- */

export type PriceEdit = { path: string; value: number | null };
export type AppliedChange = { path: string; label: string; before: number | null; after: number | null };

/** Applique des modifications sur une copie ; seuls les champs décrits par describe() sont acceptés. */
export function applyEdits(engine: Engine, data: Data, edits: PriceEdit[]): { data: Data; changes: AppliedChange[]; error?: string } {
  const next = clone(data);
  const allowed = new Map(describe(engine, data).flatMap((s) => s.rows.map((r) => [r.path, { ...r, section: s.title }] as const)));
  const changes: AppliedChange[] = [];
  for (const e of edits) {
    const meta = allowed.get(e.path);
    if (!meta) return { data, changes: [], error: `Champ non modifiable : ${e.path}` };
    if (e.value === null && !meta.nullable) return { data, changes: [], error: `${meta.section} — ${meta.label} : une valeur est obligatoire.` };
    if (e.value !== null && (!Number.isFinite(e.value) || e.value < 0 || e.value > 1_000_000))
      return { data, changes: [], error: `${meta.section} — ${meta.label} : valeur invalide.` };
    if (e.value === meta.value) continue;
    const keys = e.path.split("/");
    const last = keys.pop()!;
    const parent = keys.reduce<Data>((o, k) => o[k] as Data, next);
    parent[last] = e.value;
    // Prix de finition de la Simulation : vide = indisponible, valeur = prix fixe.
    if (engine === "simulation" && last === "amount") parent.mode = e.value === null ? "UNAVAILABLE" : "FIXED";
    changes.push({ path: e.path, label: `${meta.section} — ${meta.label}`, before: meta.value, after: e.value });
  }
  return { data: next, changes };
}

export type PriceVersion = { id: number; created_at: string; created_by: string | null; note: string; changes: AppliedChange[] | null };

export async function listVersions(engine: Engine, limit = 30): Promise<PriceVersion[]> {
  if (!dbConfigured) return [];
  return q<PriceVersion>("SELECT id, created_at, created_by, note, changes FROM price_versions WHERE engine = $1 ORDER BY id DESC LIMIT $2", [engine, limit]);
}

export async function publish(engine: Engine, edits: PriceEdit[], note: string, actor: string): Promise<{ ok: boolean; error?: string; id?: number; changes?: AppliedChange[] }> {
  const cur = await currentVersion(engine);
  const res = applyEdits(engine, cur.data, edits);
  if (res.error) return { ok: false, error: res.error };
  if (!res.changes.length) return { ok: false, error: "Aucune valeur n'a changé." };
  const rows = await q<{ id: number }>(
    "INSERT INTO price_versions (engine, created_by, note, changes, data) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [engine, actor, note, JSON.stringify(res.changes), JSON.stringify(res.data)],
  );
  cache.delete(engine);
  await audit(actor, "tarifs_publication", `price_versions:${engine}`, rows[0].id, undefined, { note, changes: res.changes });
  return { ok: true, id: rows[0].id, changes: res.changes };
}

/** Retour arrière : republie le contenu d'une ancienne version (ou les valeurs d'origine avec id = 0). */
export async function restore(engine: Engine, versionId: number, actor: string): Promise<{ ok: boolean; error?: string }> {
  let data: Data;
  let note: string;
  if (versionId === 0) {
    data = clone(DEFAULTS[engine]);
    note = "Retour aux valeurs d'origine";
  } else {
    const rows = await q<{ data: Data }>("SELECT data FROM price_versions WHERE id = $1 AND engine = $2", [versionId, engine]);
    if (!rows[0]) return { ok: false, error: "Version introuvable." };
    data = fill(rows[0].data, DEFAULTS[engine]) as Data;
    note = `Retour à la version n°${versionId}`;
  }
  const cur = await currentVersion(engine);
  const before = new Map(describe(engine, cur.data).flatMap((s) => s.rows.map((r) => [r.path, { v: r.value, label: `${s.title} — ${r.label}` }] as const)));
  const changes: AppliedChange[] = describe(engine, data)
    .flatMap((s) => s.rows)
    .filter((r) => before.get(r.path)?.v !== r.value)
    .map((r) => ({ path: r.path, label: before.get(r.path)?.label ?? r.label, before: before.get(r.path)?.v ?? null, after: r.value }));
  if (!changes.length) return { ok: false, error: "Cette version est identique aux tarifs en vigueur." };
  const rows = await q<{ id: number }>(
    "INSERT INTO price_versions (engine, created_by, note, changes, data) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [engine, actor, note, JSON.stringify(changes), JSON.stringify(data)],
  );
  cache.delete(engine);
  await audit(actor, "tarifs_retour_arriere", `price_versions:${engine}`, rows[0].id, undefined, { note, changes });
  return { ok: true };
}
