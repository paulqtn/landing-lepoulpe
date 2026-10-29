import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";

const COLORS: Record<Statut, string> = {
  nouveau: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  devis_envoye: "bg-sky-50 text-sky-700 ring-sky-200",
  relance_1: "bg-violet-50 text-violet-700 ring-violet-200",
  relance_2: "bg-violet-100 text-violet-800 ring-violet-300",
  relance_3: "bg-violet-200 text-violet-900 ring-violet-400",
  a_rappeler: "bg-orange-50 text-orange-700 ring-orange-200",
  gagne: "bg-green-50 text-green-700 ring-green-200",
  perdu: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

export function StatutBadge({ statut }: { statut: Statut }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${COLORS[statut] ?? COLORS.nouveau}`}>
      {STATUT_LABELS[statut] ?? statut}
    </span>
  );
}

export const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const eurFmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

const SCORE_COLORS: Record<"A" | "B" | "C", string> = {
  A: "bg-green-600 text-white",
  B: "bg-amber-500 text-pine-950",
  C: "bg-neutral-200 text-neutral-600",
};

export function ScoreBadge({ score, points }: { score: "A" | "B" | "C"; points?: number }) {
  return (
    <span
      title={points !== undefined ? `${points} points` : undefined}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-extrabold ${SCORE_COLORS[score]}`}
    >
      {score}
    </span>
  );
}
