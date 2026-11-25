"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

function useSave() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function save(key: string, value: unknown) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) {
      setMsg({ ok: true, text: "Enregistré — appliqué sous une minute." });
      router.refresh();
    } else setMsg({ ok: false, text: data.error ?? "Enregistrement impossible." });
  }
  return { busy, msg, save };
}

function Footer({ busy, msg }: { busy: boolean; msg: { ok: boolean; text: string } | null }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="submit" disabled={busy} className="flex items-center gap-2 rounded-full bg-pine-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </button>
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}

export function CommissionsForm({ initial }: { initial: { tauxMarge: number; seuilCA: number; bonusParTranche: number; tranche: number } }) {
  const [v, setV] = useState({ tauxMarge: String(initial.tauxMarge), seuilCA: String(initial.seuilCA), bonusParTranche: String(initial.bonusParTranche), tranche: String(initial.tranche) });
  const { busy, msg, save } = useSave();
  const n = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));
  const fields = [
    ["tauxMarge", "Commission (% de la marge brute)"],
    ["seuilCA", "Seuil du bonus (€ de CA HT par mois)"],
    ["bonusParTranche", "Bonus par tranche (€)"],
    ["tranche", "Taille d'une tranche (€ de CA HT)"],
  ] as const;
  return (
    <form onSubmit={(e) => { e.preventDefault(); save("commissions", { tauxMarge: n(v.tauxMarge), seuilCA: n(v.seuilCA), bonusParTranche: n(v.bonusParTranche), tranche: n(v.tranche) }); }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map(([k, label]) => (
          <label key={k} className="block">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
            <input className={inputCls} inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        Exemple avec ces valeurs : {n(v.seuilCA).toLocaleString("fr-FR")} € de CA HT dans le mois → 1 bonus ; {(n(v.seuilCA) + n(v.tranche)).toLocaleString("fr-FR")} € → 2 bonus ; {(n(v.seuilCA) + 2 * n(v.tranche)).toLocaleString("fr-FR")} € → 3 bonus. La commission sur la marge s&rsquo;applique dès le premier euro.
      </p>
      <Footer busy={busy} msg={msg} />
    </form>
  );
}

export function NiveauxPrixForm({ initial, coefSite }: { initial: { plein: number; remise: number; exceptionnelle: number }; coefSite: number }) {
  const [v, setV] = useState({ plein: String(initial.plein).replace(".", ","), remise: String(initial.remise).replace(".", ","), exceptionnelle: String(initial.exceptionnelle).replace(".", ",") });
  const { busy, msg, save } = useSave();
  const n = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));
  const fields = [
    ["plein", "Plein tarif", "prix normal d'un devis"],
    ["remise", "Remise", "geste commercial"],
    ["exceptionnelle", "Remise exceptionnelle", "prix plancher : rien ne part en dessous"],
  ] as const;
  const ecart = Number.isFinite(n(v.plein)) && n(v.plein) > 0 ? Math.round((coefSite / n(v.plein) - 1) * 1000) / 10 : 0;
  return (
    <form onSubmit={(e) => { e.preventDefault(); save("niveaux_prix", { plein: n(v.plein), remise: n(v.remise), exceptionnelle: n(v.exceptionnelle) }); }}>
      <div className="grid gap-4 sm:grid-cols-3">
        {fields.map(([k, label, aide]) => (
          <label key={k} className="block">
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-400">×</span>
              <input className={inputCls} inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
            </span>
            <span className="mt-1 block text-xs text-neutral-400">{aide}</span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Prix de vente = coût d&rsquo;achat × coefficient. Le site public affiche ses prix au coefficient <strong>×{String(coefSite).replace(".", ",")}</strong>
        {ecart !== 0 && <> ({ecart > 0 ? `${String(ecart).replace(".", ",")} % au-dessus` : `${String(-ecart).replace(".", ",")} % en dessous`} du plein tarif)</>} : il se règle dans l&rsquo;onglet « Générateur du site », ligne du coefficient.
      </p>
      <Footer busy={busy} msg={msg} />
    </form>
  );
}

export function SocieteForm({ fields, initial }: { fields: { key: string; label: string; multiline: boolean }[]; initial: Record<string, string> }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave();
  return (
    <form onSubmit={(e) => { e.preventDefault(); save("societe", v); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={`block ${f.multiline ? "sm:col-span-2" : ""}`}>
            <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{f.label}</span>
            {f.multiline ? (
              <textarea className={inputCls} rows={3} value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
            ) : (
              <input className={inputCls} value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
            )}
          </label>
        ))}
      </div>
      <Footer busy={busy} msg={msg} />
    </form>
  );
}

export function DelaisForm({ fields, initial }: { fields: { key: string; label: string }[]; initial: Record<string, number> }) {
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(Object.entries(initial).map(([k, x]) => [k, String(x)])));
  const { busy, msg, save } = useSave();
  return (
    <form onSubmit={(e) => { e.preventDefault(); save("logistique", Object.fromEntries(fields.map((f) => [f.key, Number(v[f.key])]))); }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-500">{f.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-400">J+</span>
              <input className={inputCls} inputMode="numeric" value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
            </span>
          </label>
        ))}
      </div>
      <Footer busy={busy} msg={msg} />
    </form>
  );
}
