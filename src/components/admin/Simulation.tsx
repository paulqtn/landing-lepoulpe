"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Ban, CheckCircle2, Info, Loader2, RotateCcw } from "lucide-react";
import type { SimulationOptions } from "@/lib/simulation/catalog";
import type { ComparisonRow, SimulationResult } from "@/lib/simulation/engine";

/* Écran « Simulation » du back office. Aucune règle de prix ici : chaque
   saisie est envoyée à /api/admin/simulation, seul le serveur calcule. */

const SHIPPING = [
  "Livraison standard",
  "Enlèvement dépôt MGK",
  "Livraison Corse (enlèvement dépôt MGK)",
  "Sans livraison France-France",
];

type Form = {
  lengthMm: string;
  finishedHeightMm: string;
  glassLegacyId: number;
  supportLegacyId: number;
  finish: string;
  shipping: string;
  saleMethod: "Coefficient" | "Taux de marque";
  /** Coefficient (1,70) ou taux de marque en pourcentage (40). */
  saleValue: string;
  vatRate: string;
  targetPanelWidthMm: string;
  gapPanelsMm: string;
  gapEndsEachSideMm: string;
  forcedPanels: string;
  forcedSupports: string;
  forcedCrates: string;
  forcedPallets: string;
  gateCount: string;
  alignmentPins: boolean;
  specialCuts: string;
};

const eur = (n: number | null | undefined, d = 2) =>
  n == null ? "À confirmer" : `${n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d })} €`;
const nb = (n: number | null | undefined, d = 0) =>
  n == null ? "—" : n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number | null | undefined) => (n == null ? "À confirmer" : `${(n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`);

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-400">{hint}</span>}
    </label>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-base font-extrabold text-inkgreen">{title}</h2>
      {children}
    </section>
  );
}

const SEVERITY = {
  blocking: { cls: "border-red-200 bg-red-50 text-red-800", Icon: Ban },
  warning: { cls: "border-amber-500/40 bg-amber-500/10 text-neutral-800", Icon: AlertTriangle },
  info: { cls: "border-sky-200 bg-sky-50 text-sky-900", Icon: Info },
} as const;

const STATUS = {
  READY: { label: "Chiffrage complet", cls: "bg-green-50 text-green-700 ring-green-200", Icon: CheckCircle2 },
  WARNING: { label: "À valider", cls: "bg-amber-500/15 text-amber-700 ring-amber-500/30", Icon: AlertTriangle },
  BLOCKED: { label: "Non chiffrable", cls: "bg-red-50 text-red-700 ring-red-200", Icon: Ban },
} as const;

function initialForm(o: SimulationOptions): Form {
  const d = o.defaults;
  return {
    lengthMm: String(d.lengthMm),
    finishedHeightMm: String(d.finishedHeightMm),
    glassLegacyId: d.glassLegacyId,
    supportLegacyId: d.supportLegacyId,
    finish: d.finish,
    shipping: d.shipping,
    saleMethod: d.saleMethod,
    saleValue: d.saleValue.toFixed(2).replace(".", ","),
    vatRate: String(d.vatRate),
    targetPanelWidthMm: String(d.targetPanelWidthMm),
    gapPanelsMm: String(d.gapPanelsMm),
    gapEndsEachSideMm: String(d.gapEndsEachSideMm),
    forcedPanels: "",
    forcedSupports: "",
    forcedCrates: "",
    forcedPallets: "",
    gateCount: String(d.gateCount),
    alignmentPins: d.alignmentPins,
    specialCuts: String(d.specialCuts),
  };
}

export function Simulation({ options }: { options: SimulationOptions }) {
  const [form, setForm] = useState<Form>(() => initialForm(options));
  const [keepForced, setKeepForced] = useState(true);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"detail" | "calepinage" | "comparatif">("detail");
  const [family, setFamily] = useState<"Tous" | "Rail" | "Pince">("Tous");
  const [sortBySale, setSortBySale] = useState(false);
  const seq = useRef(0);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  /* ---- vitrage : épaisseur → aspect → façonnage, uniquement les références listées ---- */
  const glass = options.glasses.find((g) => g.id === form.glassLegacyId) ?? options.glasses[0];
  const thicknesses = useMemo(() => [...new Set(options.glasses.map((g) => g.thickness))], [options.glasses]);
  const appearances = useMemo(
    () => [...new Set(options.glasses.filter((g) => g.thickness === glass.thickness).map((g) => g.appearance))],
    [options.glasses, glass.thickness],
  );
  const processings = options.glasses.filter((g) => g.thickness === glass.thickness && g.appearance === glass.appearance);
  const pickGlass = (thickness: string, appearance: string, processing: string) => {
    const pool = options.glasses.filter((g) => g.thickness === thickness);
    const same = pool.filter((g) => g.appearance === appearance);
    const list = same.length ? same : pool;
    set("glassLegacyId", (list.find((g) => g.processing === processing) ?? list[0]).id);
  };

  /* ---- calcul serveur à chaque saisie (léger délai) ---- */
  useEffect(() => {
    const id = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const n = (s: string) => s.trim().replace(/\s/g, "").replace(",", ".");
      const rawSale = Number(n(form.saleValue).replace("%", ""));
      try {
        const res = await fetch("/api/admin/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keepForcedSupports: keepForced,
            input: {
              ...form,
              lengthMm: n(form.lengthMm),
              finishedHeightMm: n(form.finishedHeightMm),
              targetPanelWidthMm: n(form.targetPanelWidthMm),
              gapPanelsMm: n(form.gapPanelsMm),
              gapEndsEachSideMm: n(form.gapEndsEachSideMm),
              gateCount: n(form.gateCount),
              specialCuts: n(form.specialCuts),
              vatRate: Number(form.vatRate),
              saleValue: form.saleMethod === "Taux de marque" ? rawSale / 100 : rawSale,
            },
          }),
        });
        if (id !== seq.current) return;
        if (res.status === 401) throw new Error("Session expirée — rechargez la page pour vous reconnecter.");
        if (!res.ok) throw new Error("Le calcul n'a pas pu être effectué.");
        const data = await res.json();
        setResult(data.result);
        setComparison(data.comparison ?? []);
        setError(null);
      } catch (e) {
        if (id !== seq.current) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [form, keepForced]);

  const r = result;
  const g = r?.geometry;
  const q = r?.quantities;
  const p = r?.purchase;
  const s = r?.sale;
  const st = r ? STATUS[r.status] : null;
  const isRail = r?.support?.category === "Rail";
  const supportUnitLabel = isRail ? "barre(s) de 3 m" : "pièce(s)";

  const selectedSale = comparison.find((c) => c.selected)?.result.sale?.totalHt ?? null;
  const rows = useMemo(() => {
    const list = comparison.filter((c) => family === "Tous" || c.category === family);
    if (!sortBySale) return list;
    return [...list].sort((a, b) => (a.result.sale?.totalHt ?? Infinity) - (b.result.sale?.totalHt ?? Infinity));
  }, [comparison, family, sortBySale]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ============================ SAISIE ============================ */}
        <div className="space-y-5">
          <Card title="Dimensions du tronçon">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Longueur (mm)" hint={g ? `= ${nb(g.lengthM, 2)} ml — partie fixe, hors portillon` : "Partie fixe, hors portillon"}>
                <input className={inputCls} inputMode="decimal" value={form.lengthMm} onChange={(e) => set("lengthMm", e.target.value)} />
              </Field>
              <Field label="Hauteur finie (mm)" hint={g ? `Hauteur du verre : ${nb(g.glassHeightMm)} mm${isRail ? " (rail : −30 mm)" : ""}` : undefined}>
                <input className={inputCls} inputMode="decimal" value={form.finishedHeightMm} onChange={(e) => set("finishedHeightMm", e.target.value)} />
              </Field>
            </div>
            <details className="mt-4 text-sm text-neutral-600">
              <summary className="cursor-pointer font-semibold text-pine-700">Repères de hauteur (indicatifs)</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                <li>Pinces ou rail à la française : 1 010 mm en habitation (vitrage 1 010 mm en pinces, 980 mm en rail).</li>
                <li>Rail à l&rsquo;anglaise, encastré ou Spider : 1 250 mm. Spider en escalier : 1 900 mm.</li>
                <li>Piscine : 1 100 mm, verre 66.4 clair, pinces GS-07-A, portillon 700 mm à compter à part.</li>
              </ul>
              <p className="mt-2 text-xs text-neutral-400">
                Aides de saisie uniquement : elles n&rsquo;entrent dans aucun calcul et ne valent pas vérification de conformité.
              </p>
            </details>
          </Card>

          <Card title="Vitrage">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Épaisseur">
                <select className={inputCls} value={glass.thickness} onChange={(e) => pickGlass(e.target.value, glass.appearance, glass.processing)}>
                  {thicknesses.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Aspect">
                <select className={inputCls} value={glass.appearance} onChange={(e) => pickGlass(glass.thickness, e.target.value, glass.processing)}>
                  {appearances.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Façonnage">
                <select className={inputCls} value={glass.id} onChange={(e) => set("glassLegacyId", Number(e.target.value))}>
                  {processings.map((x) => <option key={x.id} value={x.id}>{x.processing}</option>)}
                </select>
              </Field>
            </div>
            <p className="mt-3 text-xs text-neutral-400">Référence n°{glass.id} — feuilleté trempé, tous bords polis.</p>
          </Card>

          <Card title="Fixation et finition">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Modèle de support">
                <select className={inputCls} value={form.supportLegacyId} onChange={(e) => set("supportLegacyId", Number(e.target.value))}>
                  {(["Rail", "Pince"] as const).map((cat) => (
                    <optgroup key={cat} label={cat === "Rail" ? "Rails" : "Pinces et Spider"}>
                      {options.supports.filter((x) => x.category === cat).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Finition">
                <select className={inputCls} value={form.finish} onChange={(e) => set("finish", e.target.value)}>
                  {options.finishes.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </Field>
            </div>
          </Card>

          <Card title="Livraison et options">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Livraison France → client" hint="Le transport Turquie → France est toujours compté.">
                <select className={inputCls} value={form.shipping} onChange={(e) => set("shipping", e.target.value)}>
                  {SHIPPING.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="Portillons" hint="Vendu à part, hors coefficient.">
                <input className={inputCls} inputMode="numeric" value={form.gateCount} onChange={(e) => set("gateCount", e.target.value)} />
              </Field>
              <Field label="Découpes spéciales / biseaux" hint="Comptées à l'achat, coefficient appliqué.">
                <input className={inputCls} inputMode="numeric" value={form.specialCuts} onChange={(e) => set("specialCuts", e.target.value)} />
              </Field>
              <label className="flex items-center gap-2.5 self-center text-sm font-semibold text-inkgreen">
                <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={form.alignmentPins} onChange={(e) => set("alignmentPins", e.target.checked)} />
                Pions d&rsquo;alignement (un par jonction)
              </label>
            </div>
          </Card>

          <Card title="Prix de vente">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Méthode">
                <select
                  className={inputCls}
                  value={form.saleMethod}
                  onChange={(e) => {
                    const m = e.target.value as Form["saleMethod"];
                    setForm((f) => ({ ...f, saleMethod: m, saleValue: m === "Coefficient" ? "1,70" : "40" }));
                  }}
                >
                  <option>Coefficient</option>
                  <option>Taux de marque</option>
                </select>
              </Field>
              <Field
                label={form.saleMethod === "Coefficient" ? "Coefficient" : "Taux de marque (%)"}
                hint={form.saleMethod === "Coefficient" ? "Vente = coût × coefficient." : "Vente = coût / (1 − taux) : 40 % → ×1,6667, pas ×1,40."}
              >
                <input className={inputCls} inputMode="decimal" value={form.saleValue} onChange={(e) => set("saleValue", e.target.value)} />
              </Field>
              <Field label="TVA">
                <select className={inputCls} value={form.vatRate} onChange={(e) => set("vatRate", e.target.value)}>
                  <option value="0.2">20 %</option>
                  <option value="0.1">10 %</option>
                </select>
              </Field>
            </div>
          </Card>

          <details className="rounded-2xl border border-neutral-200 bg-white p-5">
            <summary className="cursor-pointer text-base font-extrabold text-inkgreen">Calepinage et forçages</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Largeur cible vitrage (mm)">
                <input className={inputCls} inputMode="decimal" value={form.targetPanelWidthMm} onChange={(e) => set("targetPanelWidthMm", e.target.value)} />
              </Field>
              <Field label="Jeu entre vitrages (mm)">
                <input className={inputCls} inputMode="decimal" value={form.gapPanelsMm} onChange={(e) => set("gapPanelsMm", e.target.value)} />
              </Field>
              <Field label="Jeu d'extrémité par côté (mm)">
                <input className={inputCls} inputMode="decimal" value={form.gapEndsEachSideMm} onChange={(e) => set("gapEndsEachSideMm", e.target.value)} />
              </Field>
            </div>
            <p className="mb-3 mt-5 text-xs text-neutral-500">
              Forçages : laisser vide pour le calcul automatique. Une valeur forcée est à valider avec Yann.
            </p>
            <div className="grid gap-4 sm:grid-cols-4">
              {(
                [
                  ["forcedPanels", "Vitrages", q && g ? g.panelsAutomatic : null],
                  ["forcedSupports", "Supports", q?.supportsAutomatic ?? null],
                  ["forcedCrates", "Caisses", q?.cratesAutomatic ?? null],
                  ["forcedPallets", "Palettes", q?.palletsAutomatic ?? null],
                ] as const
              ).map(([k, label, auto]) => (
                <Field key={k} label={label} hint={auto != null ? `Auto : ${auto}` : undefined}>
                  <input className={inputCls} inputMode="numeric" placeholder="auto" value={form[k]} onChange={(e) => set(k, e.target.value)} />
                </Field>
              ))}
            </div>
          </details>
        </div>

        {/* ============================ RÉSULTAT ============================ */}
        <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              {st ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${st.cls}`}>
                  <st.Icon className="h-3.5 w-3.5" />
                  {st.label}
                </span>
              ) : <span />}
              <span className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-pine-600" aria-label="Calcul en cours" />}
                <button
                  type="button"
                  onClick={() => setForm(initialForm(options))}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-amber-500/15 hover:text-pine-950"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Réinitialiser
                </button>
              </span>
            </div>

            {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">Prix de vente HT</p>
            <p className="text-3xl font-extrabold tabular-nums text-pine-700">{eur(s?.totalHt)}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Prix de vente TTC</dt>
                <dd className="font-bold tabular-nums text-inkgreen">{eur(s?.totalTtc)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Prix HT au ml</dt>
                <dd className="font-bold tabular-nums text-inkgreen">{eur(s?.perMeterHt)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-neutral-100 pt-2">
                <dt className="text-neutral-500">Achat total HT <span className="text-[10px] font-bold uppercase text-amber-600">interne</span></dt>
                <dd className="font-bold tabular-nums text-inkgreen">{eur(p?.totalHt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">Marge brute (hors options)</dt>
                <dd className="font-bold tabular-nums text-inkgreen">{eur(r?.margins?.grossEuro)}</dd>
              </div>
            </dl>
            {g && q && (
              <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                {g.panels} vitrage{g.panels > 1 ? "s" : ""} de {nb(g.panelWidthMm, 1)} mm · {q.supports} {supportUnitLabel} · {q.crates} caisse
                {q.crates > 1 ? "s" : ""} · {q.pallets} palette{q.pallets > 1 ? "s" : ""}
              </p>
            )}
            <p className="mt-2 text-xs font-semibold text-neutral-500">Fourniture seule — pose non comprise.</p>
          </div>

          {r && r.warnings.length > 0 && (
            <ul className="space-y-2">
              {r.warnings.map((w, i) => {
                const sv = SEVERITY[w.severity];
                return (
                  <li key={`${w.code}-${i}`} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${sv.cls}`}>
                    <sv.Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{w.message}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      {/* ============================ ONGLETS ============================ */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div role="tablist" className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["detail", "Détail du calcul"],
              ["calepinage", "Calepinage"],
              ["comparatif", "Comparatif des 16 systèmes"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              type="button"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                tab === k ? "bg-pine-700 text-white" : "text-neutral-700 hover:bg-amber-500/15 hover:text-pine-950"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!g || !q || !p || !s ? (
          <p className="text-sm text-neutral-400">Corrigez la saisie pour afficher le détail.</p>
        ) : tab === "detail" ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-inkgreen">Coût d&rsquo;achat HT <span className="text-[10px] font-bold uppercase text-amber-600">interne</span></h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  {(
                    [
                      ["Verre", `${nb(g.glassAreaM2, 3)} m² × ${nb(p.glassUnitPerM2)} €/m²`, p.glass],
                      [
                        "Supports",
                        p.supportUnit == null
                          ? `${q.supports} ${supportUnitLabel} — prix à confirmer`
                          : `${q.supports} × ${nb(p.supportUnit, 2)} €${p.supportAccessoriesUnit ? ` + ${nb(p.supportAccessoriesUnit, 2)} € d'accessoires` : ""}`,
                        p.supports,
                      ],
                      ["Caisses bois", `${q.crates} caisse${q.crates > 1 ? "s" : ""} (${q.panelsPerCrate} vitrages/caisse)`, p.crates],
                      ["Transport Turquie → France", `${nb(g.glassWeightKg)} kg de verre`, p.turkeyToFrance],
                      ["Livraison France → client", `${q.pallets} palette${q.pallets > 1 ? "s" : ""} (${q.panelsPerPallet} vitrages/palette)`, p.franceToCustomer],
                      ["Découpes spéciales", "", p.specialCuts],
                    ] as const
                  ).map(([label, detail, amount]) => (
                    <tr key={label}>
                      <td className="py-2 pr-3">
                        <span className="font-semibold text-inkgreen">{label}</span>
                        {detail && <span className="block text-xs text-neutral-400">{detail}</span>}
                      </td>
                      <td className="py-2 text-right font-bold tabular-nums text-inkgreen">{eur(amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2.5 font-extrabold text-inkgreen">Achat total HT</td>
                    <td className="py-2.5 text-right text-base font-extrabold tabular-nums text-pine-700">{eur(p.totalHt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-inkgreen">Prix de vente</h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  {(
                    [
                      ["Coefficient appliqué", s.appliedCoefficient == null ? "À confirmer" : `× ${nb(s.appliedCoefficient, 4)}`],
                      ["Garde-corps HT", eur(s.guardrailHt)],
                      ["Portillons HT (hors coefficient)", eur(s.gateHt)],
                      [`Pions d'alignement HT (${s.pinCount})`, eur(s.pinsHt)],
                      ["Total HT", eur(s.totalHt)],
                      [`Total TTC (TVA ${s.vatRate * 100} %)`, eur(s.totalTtc)],
                      ["HT / ml", eur(s.perMeterHt)],
                      ["TTC / ml", eur(s.perMeterTtc)],
                    ] as const
                  ).map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-2 pr-3 text-neutral-600">{label}</td>
                      <td className="py-2 text-right font-bold tabular-nums text-inkgreen">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="mb-2 mt-6 text-sm font-extrabold text-inkgreen">Contrôle de marge <span className="font-normal text-neutral-400">(garde-corps seul, hors options)</span></h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  <tr><td className="py-2 text-neutral-600">Marge brute</td><td className="py-2 text-right font-bold tabular-nums text-inkgreen">{eur(r?.margins?.grossEuro)}</td></tr>
                  <tr><td className="py-2 text-neutral-600" title="Marge ÷ prix de vente">Taux de marque <span className="text-xs text-neutral-400">(marge ÷ vente)</span></td><td className="py-2 text-right font-bold tabular-nums text-inkgreen">{pct(r?.margins?.brandRate)}</td></tr>
                  <tr><td className="py-2 text-neutral-600" title="Marge ÷ coût d'achat">Taux de marge <span className="text-xs text-neutral-400">(marge ÷ coût)</span></td><td className="py-2 text-right font-bold tabular-nums text-inkgreen">{pct(r?.margins?.marginOnCostRate)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === "calepinage" ? (
          <Calepinage
            lengthMm={g.lengthM * 1000}
            panels={g.panels}
            panelWidthMm={g.panelWidthMm}
            glassHeightMm={g.glassHeightMm}
            gapMm={Number(form.gapPanelsMm.replace(",", ".")) || 0}
            endGapMm={Number(form.gapEndsEachSideMm.replace(",", ".")) || 0}
            panelsAutomatic={g.panelsAutomatic}
          />
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <label className="flex items-center gap-2 font-semibold text-inkgreen">
                Famille
                <select className="rounded-lg border border-neutral-200 px-2 py-1 text-sm" value={family} onChange={(e) => setFamily(e.target.value as typeof family)}>
                  <option>Tous</option>
                  <option>Rail</option>
                  <option>Pince</option>
                </select>
              </label>
              <label className="flex items-center gap-2 font-semibold text-inkgreen">
                <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={sortBySale} onChange={(e) => setSortBySale(e.target.checked)} />
                Trier par prix de vente HT
              </label>
              <label className="flex items-center gap-2 font-semibold text-inkgreen">
                <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={keepForced} onChange={(e) => setKeepForced(e.target.checked)} />
                Reproduire le forçage des supports sur toutes les lignes (comme l&rsquo;Excel)
              </label>
            </div>
            {keepForced && form.forcedSupports.trim() !== "" && (
              <p className="mb-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-neutral-800">
                Le nombre de supports forcé ({form.forcedSupports}) s&rsquo;applique à toutes les lignes, rails comme pinces. Décochez pour comparer avec les quantités propres à chaque modèle.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[104rem] whitespace-nowrap text-right text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-neutral-200 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    <th className="sticky left-0 bg-white py-2 pr-3 text-left">Modèle</th>
                    <th className="px-2">H. verre</th>
                    <th className="px-2">Surface</th>
                    <th className="px-2">Poids</th>
                    <th className="px-2">Caisses</th>
                    <th className="px-2">Achat verre</th>
                    <th className="px-2">Qté sup.</th>
                    <th className="px-2">PU sup.</th>
                    <th className="px-2">Achat sup.</th>
                    <th className="px-2">Caisses €</th>
                    <th className="px-2">TR → FR</th>
                    <th className="px-2">FR → client</th>
                    <th className="px-2">Découpes</th>
                    <th className="px-2">Achat total</th>
                    <th className="px-2">Vente HT</th>
                    <th className="px-2">Vente TTC</th>
                    <th className="px-2">HT/ml</th>
                    <th className="px-2">TTC/ml</th>
                    <th className="px-2">Écart</th>
                    <th className="pl-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {rows.map((c) => {
                    const cr = c.result;
                    const diff = cr.sale?.totalHt != null && selectedSale != null ? cr.sale.totalHt - selectedSale : null;
                    const bg = c.selected ? "bg-pine-50" : "bg-white";
                    return (
                      <tr key={c.supportLegacyId} className={c.selected ? "bg-pine-50" : undefined}>
                        <td className={`sticky left-0 ${bg} py-2 pr-3 text-left`}>
                          <span className="block font-bold text-inkgreen">{c.label}</span>
                          <span className="text-[10px] text-neutral-400">
                            {c.category} · verre {c.compatibleGlassThickness.toLowerCase()} ·{" "}
                            <span className={c.auditStatus === "Oui" ? "text-green-700" : "font-bold text-amber-700"}>
                              {c.auditStatus === "Oui" ? "tarif validé" : c.auditStatus === "Hypothèse" ? "règle à confirmer" : c.auditStatus === "Non" ? "non audité" : c.auditStatus.toLowerCase()}
                            </span>
                          </span>
                        </td>
                        <td className="px-2">{nb(cr.geometry?.glassHeightMm)}</td>
                        <td className="px-2">{nb(cr.geometry?.glassAreaM2, 3)}</td>
                        <td className="px-2">{nb(cr.geometry?.glassWeightKg)} kg</td>
                        <td className="px-2">{nb(cr.quantities?.crates)}</td>
                        <td className="px-2">{eur(cr.purchase?.glass)}</td>
                        <td className="px-2">{nb(cr.quantities?.supports)}</td>
                        <td className="px-2">{eur(cr.purchase?.supportUnit)}</td>
                        <td className="px-2">{eur(cr.purchase?.supports)}</td>
                        <td className="px-2">{eur(cr.purchase?.crates, 0)}</td>
                        <td className="px-2">{eur(cr.purchase?.turkeyToFrance, 0)}</td>
                        <td className="px-2">{eur(cr.purchase?.franceToCustomer, 0)}</td>
                        <td className="px-2">{eur(cr.purchase?.specialCuts, 0)}</td>
                        <td className="px-2 font-bold text-inkgreen">{eur(cr.purchase?.totalHt)}</td>
                        <td className="px-2 font-extrabold text-pine-700">{eur(cr.sale?.totalHt)}</td>
                        <td className="px-2">{eur(cr.sale?.totalTtc)}</td>
                        <td className="px-2">{eur(cr.sale?.perMeterHt)}</td>
                        <td className="px-2">{eur(cr.sale?.perMeterTtc)}</td>
                        <td className={`px-2 ${diff != null && diff < 0 ? "text-green-700" : ""}`}>
                          {c.selected || diff == null ? "—" : Math.abs(diff) < 0.005 ? "=" : `${diff > 0 ? "+" : "−"}${eur(Math.abs(diff), 0)}`}
                        </td>
                        <td className="pl-2">
                          {c.selected ? (
                            <span className="rounded-full bg-pine-700 px-2 py-1 text-[10px] font-bold text-white">Sélectionné</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => set("supportLegacyId", c.supportLegacyId)}
                              className="rounded-lg border border-neutral-200 px-2 py-1 text-[11px] font-bold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/15"
                            >
                              Choisir
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Chaque ligne est un recalcul complet du projet avec ce support, hors portillon et pions ; les découpes spéciales restent incluses.
            </p>
          </div>
        )}
      </section>

      <p className="text-xs text-neutral-400">Tarifs : {options.source}.</p>
    </div>
  );
}

/* Schéma indicatif du tronçon — pas un plan de fabrication. */
function Calepinage(props: {
  lengthMm: number;
  panels: number;
  panelWidthMm: number;
  glassHeightMm: number;
  gapMm: number;
  endGapMm: number;
  panelsAutomatic: number;
}) {
  const { lengthMm, panels, panelWidthMm, glassHeightMm, gapMm, endGapMm, panelsAutomatic } = props;
  const W = 1000;
  const k = W / lengthMm;
  const H = Math.max(60, Math.min(260, glassHeightMm * k));
  const shown = Math.min(panels, 60);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 50}`} className="w-full" role="img" aria-label={`Tronçon de ${lengthMm} mm : ${panels} vitrages de ${panelWidthMm.toFixed(1)} mm`}>
        <line x1="0" y1={H + 12} x2={W} y2={H + 12} stroke="#0d1f17" strokeWidth="2" />
        {Array.from({ length: shown }, (_, i) => {
          const x = (endGapMm + i * (panelWidthMm + gapMm)) * k;
          return <rect key={i} x={x} y={8} width={Math.max(1, panelWidthMm * k)} height={H} fill="#175a3b" fillOpacity="0.14" stroke="#175a3b" strokeWidth="1.5" rx="2" />;
        })}
        <line x1="0" y1={H + 30} x2={W} y2={H + 30} stroke="#737373" strokeWidth="1" />
        <line x1="0" y1={H + 24} x2="0" y2={H + 36} stroke="#737373" />
        <line x1={W} y1={H + 24} x2={W} y2={H + 36} stroke="#737373" />
        <text x={W / 2} y={H + 46} textAnchor="middle" fontSize="13" fill="#404040">
          {lengthMm.toLocaleString("fr-FR")} mm
        </text>
      </svg>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        {(
          [
            ["Vitrages", panels === panelsAutomatic ? `${panels} (auto)` : `${panels} retenus — auto : ${panelsAutomatic}`],
            ["Largeur d'un vitrage", `${panelWidthMm.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mm`],
            ["Hauteur du verre", `${glassHeightMm.toLocaleString("fr-FR")} mm`],
            ["Jeux", `${gapMm} mm entre vitrages · ${endGapMm} mm par extrémité`],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</dt>
            <dd className="mt-0.5 font-bold text-inkgreen">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-neutral-400">Représentation indicative — tous les vitrages ont la même largeur. Ce n&rsquo;est pas un plan de fabrication.</p>
    </div>
  );
}
