"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2 } from "lucide-react";

/* Marge d'une affaire — visible des rôles d'administration uniquement. */
const eur = (v: string | null) => (v === null ? "—" : `${Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
const inputCls = "w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-inkgreen outline-none focus:border-pine-500";

export function MargeActions({ leadId, venteHt, coutAchat, marge, source, gagne }: { leadId: number; venteHt: string | null; coutAchat: string | null; marge: string | null; source: string | null; gagne: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState(venteHt ? String(Number(venteHt)).replace(".", ",") : "");
  const [c, setC] = useState(coutAchat ? String(Number(coutAchat)).replace(".", ",") : "");
  const [msg, setMsg] = useState<string | null>(null);
  const n = (s: string) => Number(s.replace(/\s/g, "").replace(",", "."));

  async function call(body: unknown) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/leads/${leadId}/marge`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.ok) router.refresh();
    else setMsg(data.error ?? "Action impossible.");
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">
        <Coins className="h-4 w-4 text-pine-600" />
        Marge de l&rsquo;affaire <span className="text-amber-600">interne</span>
      </h2>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-600">Vente HT</dt><dd className="font-bold tabular-nums text-inkgreen">{eur(venteHt)}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-600">Coût d&rsquo;achat</dt><dd className="font-bold tabular-nums text-inkgreen">{eur(coutAchat)}</dd></div>
        <div className="flex justify-between border-t border-neutral-100 pt-1.5"><dt className="font-bold text-inkgreen">Marge brute</dt><dd className={`font-extrabold tabular-nums ${marge === null ? "text-amber-600" : "text-pine-700"}`}>{marge === null ? "à saisir" : eur(marge)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-neutral-600">
        {source ?? (gagne ? "Pas encore calculée." : "Elle sera figée quand l'affaire passera à « Signé ».")} Elle sert de base à la prime du commercial.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input aria-label="Vente HT" className={inputCls} inputMode="decimal" placeholder="Vente HT" value={v} onChange={(e) => setV(e.target.value)} />
        <input aria-label="Coût d'achat" className={inputCls} inputMode="decimal" placeholder="Coût d'achat" value={c} onChange={(e) => setC(e.target.value)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={busy || v.trim() === "" || c.trim() === "" || !Number.isFinite(n(v)) || !Number.isFinite(n(c))} onClick={() => call({ venteHt: n(v), coutAchat: n(c) })} className="flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Enregistrer ces montants
        </button>
        <button type="button" disabled={busy} onClick={() => call({ action: "recalculer" })} className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
          Recalculer automatiquement
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
    </section>
  );
}
