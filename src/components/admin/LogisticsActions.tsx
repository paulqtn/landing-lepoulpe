"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PackagePlus, Plus, Truck } from "lucide-react";

/* Boutons et mini-formulaires du pôle gestion : chaque action poste sur
   /api/admin/logistics puis rafraîchit la page serveur. En mode démo,
   l'API répond { demo: true } et on l'explique sans rien casser. */

async function post(payload: Record<string, unknown>): Promise<{ ok: boolean; demo?: boolean }> {
  try {
    const r = await fetch("/api/admin/logistics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await r.json()) as { ok: boolean; demo?: boolean };
  } catch {
    return { ok: false };
  }
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  async function run(payload: Record<string, unknown>, okNote = "") {
    setBusy(true);
    const r = await post(payload);
    setBusy(false);
    if (r.demo) setNote("Mode démo : écritures désactivées");
    else if (!r.ok) setNote("Échec — réessayez");
    else {
      setNote(okNote);
      router.refresh();
    }
    if (!r.ok) setTimeout(() => setNote(""), 3500);
  }
  return { busy, note, run };
}

const BTN = "inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40";
const GHOST = "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40";

export function AdvanceButton({ kind, id, nextLabel }: { kind: "order" | "shipment"; id: number; nextLabel: string }) {
  const { busy, note, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      {note && <span className="text-[11px] font-semibold text-amber-700">{note}</span>}
      <button
        type="button"
        disabled={busy}
        onClick={() => run({ action: kind === "order" ? "order_advance" : "shipment_advance", id })}
        className={BTN}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
        {nextLabel}
      </button>
    </span>
  );
}

export function StockMoveForm({ itemId, unite }: { itemId: number; unite: string }) {
  const { busy, note, run } = useAction();
  const [qty, setQty] = useState("");
  const n = parseFloat(qty.replace(",", "."));
  const valid = Number.isFinite(n) && n > 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      {note && <span className="text-[11px] font-semibold text-amber-700">{note}</span>}
      <input
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        inputMode="decimal"
        placeholder="10"
        aria-label="Quantité"
        className="w-14 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-center text-xs font-bold text-inkgreen outline-none focus:border-pine-500"
      />
      <span className="text-[10px] font-semibold text-neutral-400">{unite}</span>
      <button type="button" disabled={busy || !valid} onClick={() => { run({ action: "stock_move", itemId, delta: n, motif: "Réception" }); setQty(""); }} className={BTN} title="Entrée de stock">
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button type="button" disabled={busy || !valid} onClick={() => { run({ action: "stock_move", itemId, delta: -n, motif: "Sortie manuelle" }); setQty(""); }} className={GHOST} title="Sortie de stock">
        −
      </button>
    </span>
  );
}

export function ShipmentCreateForm() {
  const { busy, note, run } = useAction();
  const [f, setF] = useState({ transporteur: "", departement: "", datePrevue: "" });
  const valid = f.transporteur.trim().length > 1 && f.departement.trim().length >= 2;
  const input = "rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-inkgreen outline-none placeholder:text-neutral-400 focus:border-pine-500";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input value={f.transporteur} onChange={(e) => setF((s) => ({ ...s, transporteur: e.target.value }))} placeholder="Transporteur" className={`${input} w-32`} />
      <input value={f.departement} onChange={(e) => setF((s) => ({ ...s, departement: e.target.value }))} placeholder="Dép. (83)" className={`${input} w-20`} />
      <input value={f.datePrevue} onChange={(e) => setF((s) => ({ ...s, datePrevue: e.target.value }))} type="date" className={input} />
      <button
        type="button"
        disabled={busy || !valid}
        onClick={() => { run({ action: "shipment_create", ...f }); setF({ transporteur: "", departement: "", datePrevue: "" }); }}
        className={BTN}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
        Planifier
      </button>
      {note && <span className="text-[11px] font-semibold text-amber-700">{note}</span>}
    </div>
  );
}

export function AssignShipmentSelect({ orderId, current, options }: { orderId: number; current: number | null; options: { id: number; ref: string }[] }) {
  const { busy, note, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      {note && <span className="text-[11px] font-semibold text-amber-700">{note}</span>}
      <select
        disabled={busy}
        value={current ?? ""}
        onChange={(e) => run({ action: "order_assign", id: orderId, shipmentId: e.target.value || null })}
        aria-label="Rattacher à une expédition"
        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-bold text-neutral-600 outline-none focus:border-pine-500"
      >
        <option value="">— tournée —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.ref}</option>
        ))}
      </select>
    </span>
  );
}

export function CreateOrderButton({ leadId }: { leadId: number }) {
  const { busy, note, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => run({ action: "order_create", leadId }, "Commande créée — voir le pôle Gestion")}
        className={BTN}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
        Créer la commande atelier
      </button>
      {note && <span className="text-[11px] font-semibold text-pine-700">{note}</span>}
    </span>
  );
}
