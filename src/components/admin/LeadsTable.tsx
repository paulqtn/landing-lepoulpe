"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellPlus, Loader2, UserRound } from "lucide-react";
import { ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { STATUT_LABELS, STATUTS, type Statut } from "@/lib/admin/statuts";

export type LeadRow = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  source: string | null;
  estimation_ttc: string | null;
  statut: Statut;
  score: "A" | "B" | "C";
  score_points: number;
  next_relance_at: string | null;
  assigned_to: string | null;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const eurFmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function LeadsTable({ leads, team }: { leads: LeadRow[]; team: string[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = (id: number) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allChecked = sel.size === leads.length && leads.length > 0;

  function bulk(action: string, value?: string) {
    start(async () => {
      setMsg(null);
      const res = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...sel], action, value }),
      });
      const data = (await res.json().catch(() => ({}))) as { traites?: number; erreurs?: string[] };
      setMsg(res.ok ? `${data.traites ?? 0} traité(s)${data.erreurs?.length ? ` · ${data.erreurs.length} erreur(s)` : ""}` : "Erreur");
      setSel(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {sel.size > 0 && (
        <div className="sticky top-20 z-10 flex flex-wrap items-center gap-2.5 rounded-2xl border border-pine-200 bg-pine-50 px-4 py-3 shadow-card">
          <span className="text-sm font-bold text-inkgreen">{sel.size} sélectionné(s)</span>
          <select
            defaultValue=""
            disabled={pending}
            onChange={(e) => e.target.value && bulk("statut", e.target.value)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700"
          >
            <option value="">Changer le statut…</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>{STATUT_LABELS[s]}</option>
            ))}
          </select>
          {team.length > 0 && (
            <select
              defaultValue=""
              disabled={pending}
              onChange={(e) => e.target.value && bulk("assign", e.target.value)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700"
            >
              <option value="">Assigner à…</option>
              {team.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => bulk("relance")}
            className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellPlus className="h-3.5 w-3.5" />}
            Relancer maintenant
          </button>
          {msg && <span className="text-xs font-semibold text-neutral-500">{msg}</span>}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => setSel(allChecked ? new Set() : new Set(leads.map((l) => l.id)))}
                  className="h-4 w-4 accent-pine-600"
                />
              </th>
              <th className="px-2 py-3">Score</th>
              <th className="px-4 py-3">Contact</th>
              <th className="hidden px-4 py-3 md:table-cell">Source</th>
              <th className="hidden px-4 py-3 sm:table-cell">Estimation</th>
              <th className="px-4 py-3">Statut</th>
              <th className="hidden px-4 py-3 lg:table-cell">Suivi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map((l) => (
              <tr key={l.id} className={`transition ${sel.has(l.id) ? "bg-amber-500/[0.08]" : "hover:bg-amber-500/[0.05]"}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} className="h-4 w-4 accent-pine-600" />
                </td>
                <td className="px-2 py-3">
                  <ScoreBadge score={l.score} points={l.score_points} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-bold text-inkgreen hover:text-pine-700">
                    {l.name}
                  </Link>
                  <p className="text-xs text-neutral-400">
                    {l.email} · {l.phone} · {dateFmt.format(new Date(l.created_at))}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-xs text-neutral-500 md:table-cell">{l.source ?? "site"}</td>
                <td className="hidden px-4 py-3 font-bold tabular-nums text-pine-700 sm:table-cell">
                  {l.estimation_ttc ? `${eurFmt.format(Number(l.estimation_ttc))} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatutBadge statut={l.statut} />
                </td>
                <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell">
                  {l.assigned_to && (
                    <span className="mr-2 inline-flex items-center gap-1 font-semibold text-inkgreen">
                      <UserRound className="h-3 w-3" />
                      {l.assigned_to}
                    </span>
                  )}
                  {l.next_relance_at ? `relance ${dateFmt.format(new Date(l.next_relance_at))}` : ""}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Aucune demande ne correspond.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
