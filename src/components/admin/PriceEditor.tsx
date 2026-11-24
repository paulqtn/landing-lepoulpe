"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Loader2, RotateCcw } from "lucide-react";

/* Édition des tarifs : on modifie, on teste l'effet sur des chiffrages types,
   puis on publie une nouvelle version (avec motif). Rien n'est appliqué
   tant que la publication n'est pas confirmée. */

type Row = { path: string; label: string; value: number | null; unit: string; nullable?: boolean; original: number | null };
type Section = { title: string; hint?: string; rows: Row[] };
type Scenario = { label: string; achat: number | null; venteHT: number | null; venteTTC: number | null };
type Change = { path: string; label: string; before: number | null; after: number | null };
type Version = { id: number; created_at: string; created_by: string | null; note: string; changes: Change[] | null };

const fmt = (n: number | null) => (n === null ? "À confirmer" : n.toLocaleString("fr-FR", { maximumFractionDigits: 4 }));
const eur = (n: number | null) => (n === null ? "À confirmer" : `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
const toStr = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));
const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function PriceEditor({
  engine, sections, scenarios, versions, currentVersion,
}: { engine: string; sections: Section[]; scenarios: Scenario[]; versions: Version[]; currentVersion: number | null }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState<{ changes: Change[]; before: Scenario[]; after: Scenario[] } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [filter, setFilter] = useState("");

  const all = useMemo(() => sections.flatMap((s) => s.rows), [sections]);
  const parse = (r: Row, raw: string): { ok: boolean; value: number | null } => {
    const t = raw.trim().replace(/\s/g, "").replace(",", ".");
    if (t === "") return { ok: Boolean(r.nullable), value: null };
    const n = Number(t);
    return { ok: Number.isFinite(n) && n >= 0, value: n };
  };
  const edits = all
    .filter((r) => r.path in values)
    .map((r) => ({ row: r, ...parse(r, values[r.path]) }))
    .filter((e) => !e.ok || e.value !== e.row.value);
  const invalid = edits.filter((e) => !e.ok);
  const payload = edits.filter((e) => e.ok).map((e) => ({ path: e.row.path, value: e.value }));

  async function call(action: string, extra: Record<string, unknown>) {
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ engine, action, ...extra }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Action impossible." });
        return null;
      }
      return data;
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    const data = await call("preview", { edits: payload });
    if (data) setPreview(data);
  }

  async function publish() {
    const data = await call("publish", { edits: payload, note });
    setConfirming(false);
    if (!data) return;
    setValues({});
    setNote("");
    setPreview(null);
    setMsg({ ok: true, text: `Version n°${data.id} publiée : ${data.changes.length} valeur(s) modifiée(s). Elle s'applique aux prochains calculs, sous une minute.` });
    router.refresh();
  }

  async function restore(versionId: number, label: string) {
    if (!window.confirm(`Revenir à ${label} ? Une nouvelle version sera publiée avec ces valeurs ; l'historique est conservé.`)) return;
    const data = await call("restore", { versionId });
    if (!data) return;
    setValues({});
    setPreview(null);
    setMsg({ ok: true, text: `Retour à ${label} effectué.` });
    router.refresh();
  }

  const needle = filter.trim().toLowerCase();
  const shown = sections
    .map((s) => ({ ...s, rows: needle ? s.rows.filter((r) => `${s.title} ${r.label}`.toLowerCase().includes(needle)) : s.rows }))
    .filter((s) => s.rows.length > 0);

  return (
    <div className="space-y-6">
      {msg && (
        <p role="status" className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${msg.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Chiffrages de référence — tarifs en vigueur</h2>
        <p className="mt-1 text-xs text-neutral-400">{currentVersion ? `Version publiée n°${currentVersion}.` : "Valeurs d'origine (aucune version publiée)."}</p>
        <ScenarioTable before={scenarios} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-inkgreen">Valeurs</h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrer (ex. GS-19, 88.4, caisse)…"
            className="w-64 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-pine-500"
          />
        </div>
        <div className="mt-4 space-y-2">
          {shown.map((s, i) => {
            const touched = s.rows.filter((r) => edits.some((e) => e.row.path === r.path)).length;
            return (
              <details key={s.title} open={Boolean(needle) || i === 0} className="rounded-xl border border-neutral-200">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-bold text-inkgreen">
                  <span>{s.title}</span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {touched > 0 && <span className="mr-2 rounded-full bg-amber-500 px-2 py-0.5 text-pine-950">{touched} modifié{touched > 1 ? "s" : ""}</span>}
                    {s.rows.length} valeur{s.rows.length > 1 ? "s" : ""}
                  </span>
                </summary>
                <div className="border-t border-neutral-100 px-4 py-3">
                  {s.hint && <p className="mb-2 text-xs text-neutral-400">{s.hint}</p>}
                  <ul className="grid gap-x-6 gap-y-2 lg:grid-cols-2">
                    {s.rows.map((r) => {
                      const raw = r.path in values ? values[r.path] : toStr(r.value);
                      const p = parse(r, raw);
                      const changed = r.path in values && (!p.ok || p.value !== r.value);
                      return (
                        <li key={r.path} className="flex items-center gap-3">
                          <label htmlFor={r.path} className="min-w-0 flex-1 text-sm text-neutral-700">
                            {r.label}
                            {r.original !== r.value && <span className="ml-1.5 text-[10px] font-bold uppercase text-amber-600" title={`Valeur d'origine : ${fmt(r.original)}`}>modifié</span>}
                          </label>
                          <input
                            id={r.path}
                            inputMode="decimal"
                            value={raw}
                            placeholder={r.nullable ? "à confirmer" : ""}
                            onChange={(e) => setValues((v) => ({ ...v, [r.path]: e.target.value }))}
                            className={`w-28 rounded-lg border px-2.5 py-1.5 text-right text-sm font-semibold tabular-nums text-inkgreen outline-none transition focus:ring-4 focus:ring-pine-500/10 ${
                              !p.ok ? "border-red-400 bg-red-50" : changed ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 bg-white"
                            }`}
                          />
                          <span className="w-14 shrink-0 text-xs text-neutral-400">{r.unit}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })}
          {shown.length === 0 && <p className="py-4 text-center text-sm text-neutral-400">Aucune valeur ne correspond.</p>}
        </div>
      </section>

      <section className="sticky bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-bold text-inkgreen">
            {edits.length === 0 ? "Aucune modification en cours." : `${edits.length} modification${edits.length > 1 ? "s" : ""} en cours${invalid.length ? ` — ${invalid.length} invalide${invalid.length > 1 ? "s" : ""}` : ""}`}
          </p>
          <span className="flex-1" />
          {edits.length > 0 && (
            <button type="button" onClick={() => { setValues({}); setPreview(null); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-amber-500/15 hover:text-pine-950">
              <RotateCcw className="h-3.5 w-3.5" />
              Annuler
            </button>
          )}
          <button
            type="button"
            disabled={busy !== null || payload.length === 0 || invalid.length > 0}
            onClick={test}
            className="flex items-center gap-2 rounded-full border border-pine-700 px-5 py-2 text-sm font-bold text-pine-700 transition hover:bg-pine-50 disabled:opacity-40"
          >
            {busy === "preview" && <Loader2 className="h-4 w-4 animate-spin" />}
            Tester l&rsquo;effet
          </button>
        </div>

        {preview && (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <h3 className="text-sm font-extrabold text-inkgreen">Effet sur les chiffrages de référence</h3>
            <ScenarioTable before={preview.before} after={preview.after} />
            <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-neutral-600">
              {preview.changes.map((c) => (
                <li key={c.path}>
                  {c.label} : <span className="tabular-nums">{fmt(c.before)}</span> → <strong className="tabular-nums text-inkgreen">{fmt(c.after)}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Motif de la modification (obligatoire)"
                className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3.5 py-2 text-sm outline-none transition focus:border-pine-500"
              />
              {!confirming ? (
                <button type="button" disabled={note.trim().length < 3 || busy !== null} onClick={() => setConfirming(true)} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
                  Publier…
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-600">Confirmer la publication de {preview.changes.length} valeur(s) ?</span>
                  <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600">Non</button>
                  <button type="button" disabled={busy !== null} onClick={publish} className="flex items-center gap-2 rounded-full bg-pine-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
                    {busy === "publish" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Oui, publier
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <History className="h-4 w-4 text-pine-600" />
          Historique des versions
        </h2>
        {versions.length === 0 ? (
          <p className="text-sm text-neutral-400">Aucune version publiée : ce sont les valeurs d&rsquo;origine qui s&rsquo;appliquent.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {versions.map((v, i) => (
              <li key={v.id} className="py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-sm font-bold text-inkgreen">Version n°{v.id}</span>
                  {i === 0 && <span className="rounded-full bg-pine-700 px-2 py-0.5 text-[10px] font-bold text-white">En vigueur</span>}
                  <span className="text-xs text-neutral-400">{dateFmt.format(new Date(v.created_at))} · {v.created_by ?? "—"}</span>
                  <span className="flex-1" />
                  {i > 0 && (
                    <button type="button" disabled={busy !== null} onClick={() => restore(v.id, `la version n°${v.id}`)} className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-bold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40">
                      Revenir à cette version
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-700">{v.note}</p>
                {v.changes && v.changes.length > 0 && (
                  <details className="mt-1 text-xs text-neutral-500">
                    <summary className="cursor-pointer font-semibold text-pine-700">{v.changes.length} valeur(s) modifiée(s)</summary>
                    <ul className="mt-1 space-y-0.5">
                      {v.changes.slice(0, 200).map((c) => <li key={c.path}>{c.label} : {fmt(c.before)} → {fmt(c.after)}</li>)}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
        {versions.length > 0 && (
          <button type="button" disabled={busy !== null} onClick={() => restore(0, "aux valeurs d'origine")} className="mt-3 text-xs font-bold text-neutral-500 underline-offset-2 hover:text-pine-700 hover:underline disabled:opacity-40">
            Revenir aux valeurs d&rsquo;origine
          </button>
        )}
      </section>
    </div>
  );
}

function ScenarioTable({ before, after }: { before: Scenario[]; after?: Scenario[] }) {
  const cell = (b: number | null, a: number | null | undefined) =>
    a === undefined || a === b ? (
      <span>{eur(b)}</span>
    ) : (
      <span>
        <span className="text-neutral-400 line-through">{eur(b)}</span> <strong className="text-pine-700">{eur(a)}</strong>
      </span>
    );
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            <th className="py-2 pr-3">Cas type</th>
            <th className="px-2 text-right">Achat HT</th>
            <th className="px-2 text-right">Vente HT</th>
            <th className="pl-2 text-right">Vente TTC</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 tabular-nums">
          {before.map((b, i) => (
            <tr key={b.label}>
              <td className="py-2 pr-3 text-neutral-700">{b.label}</td>
              <td className="px-2 text-right">{cell(b.achat, after?.[i]?.achat)}</td>
              <td className="px-2 text-right">{cell(b.venteHT, after?.[i]?.venteHT)}</td>
              <td className="pl-2 text-right">{cell(b.venteTTC, after?.[i]?.venteTTC)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
