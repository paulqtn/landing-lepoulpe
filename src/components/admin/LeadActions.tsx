"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, CalendarClock, Loader2, Send, StickyNote } from "lucide-react";
import { STATUT_LABELS, STATUTS, type Statut } from "@/lib/admin/statuts";

/* Panneau d'actions commercial sur une fiche lead. */

export function LeadActions({
  leadId,
  statut,
  relances,
  nextRelanceAt,
  hasEstimation,
  team,
  assignedTo,
}: {
  leadId: number;
  statut: Statut;
  relances: number;
  nextRelanceAt: string | null;
  hasEstimation: boolean;
  team: string[];
  assignedTo: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [relanceDate, setRelanceDate] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function call(path: string, init?: RequestInit) {
    start(async () => {
      setMsg(null);
      const res = await fetch(path, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg((data as { error?: string }).error ?? "Erreur");
      router.refresh();
    });
  }

  const patch = (body: Record<string, unknown>) =>
    call(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  return (
    <div className="space-y-5">
      {/* statut */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Statut</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUTS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => patch({ statut: s })}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                statut === s
                  ? "bg-pine-700 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
              }`}
            >
              {STATUT_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      {/* assignation */}
      {team.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Commercial</h2>
          <select
            defaultValue={assignedTo ?? ""}
            disabled={pending}
            onChange={(e) => patch({ assigned_to: e.target.value })}
            className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-semibold text-inkgreen outline-none focus:border-pine-500"
          >
            <option value="">Non assigné</option>
            {team.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </section>
      )}

      {/* emails */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Emails</h2>
        <div className="mt-3 space-y-2.5">
          <button
            type="button"
            disabled={pending || !hasEstimation}
            onClick={() => call(`/api/admin/leads/${leadId}/send-devis`, { method: "POST" })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {hasEstimation ? "Envoyer / renvoyer le devis" : "Pas d'estimation à envoyer"}
          </button>
          <button
            type="button"
            disabled={pending || relances >= 3}
            onClick={() => call(`/api/admin/leads/${leadId}/relance`, { method: "POST" })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
          >
            <BellPlus className="h-4 w-4" />
            {relances >= 3 ? "Séquence terminée (3 relances)" : `Envoyer la relance ${relances + 1} maintenant`}
          </button>
          {msg && <p className="text-xs font-semibold text-red-600">{msg}</p>}
        </div>
      </section>

      {/* relance programmée */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <CalendarClock className="h-3.5 w-3.5" />
          Relance automatique
        </h2>
        <p className="mt-2 text-xs text-neutral-500">
          {nextRelanceAt
            ? `Prochaine relance prévue le ${new Date(nextRelanceAt).toLocaleDateString("fr-FR")}.`
            : "Aucune relance programmée."}
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="date"
            value={relanceDate}
            onChange={(e) => setRelanceDate(e.target.value)}
            className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500"
          />
          <button
            type="button"
            disabled={pending || !relanceDate}
            onClick={() => patch({ next_relance_at: new Date(`${relanceDate}T08:00:00`).toISOString() })}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
          >
            Programmer
          </button>
          {nextRelanceAt && (
            <button
              type="button"
              disabled={pending}
              onClick={() => patch({ next_relance_at: null })}
              className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-500 transition hover:border-red-300 hover:text-red-600"
            >
              Annuler
            </button>
          )}
        </div>
      </section>

      {/* note */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <StickyNote className="h-3.5 w-3.5" />
          Note commerciale
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Compte-rendu d'appel, contexte, objection…"
          className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500"
        />
        <button
          type="button"
          disabled={pending || !note.trim()}
          onClick={() => {
            patch({ note });
            setNote("");
          }}
          className="mt-2 rounded-full bg-pine-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
        >
          Ajouter la note
        </button>
      </section>
    </div>
  );
}
