import Link from "next/link";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";

const COLORS: Record<Statut, string> = {
  nouveau: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  devis_envoye: "bg-sky-50 text-sky-700 ring-sky-200",
  relance_1: "bg-violet-50 text-violet-700 ring-violet-200",
  relance_2: "bg-violet-100 text-violet-800 ring-violet-300",
  relance_3: "bg-violet-200 text-violet-900 ring-violet-400",
  a_rappeler: "bg-orange-50 text-orange-700 ring-orange-200",
  en_discussion: "bg-teal-50 text-teal-700 ring-teal-200",
  en_reflexion: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  devis_a_modifier: "bg-rose-50 text-rose-700 ring-rose-200",
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

export const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
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

/* ------------------------------------------------------------------ */
/*  Éléments communs aux listes du back office : mêmes onglets, même   */
/*  état vide d'une page à l'autre.                                    */
/* ------------------------------------------------------------------ */

export type Onglet = { href: string; label: string; n?: number; on: boolean; /** Compteur mis en avant (ambre) quand il n'est pas nul. */ alerte?: boolean };

/** Onglets en tête d'une carte : le choix principal d'une liste (à qui sont les éléments affichés). */
export function Onglets({ items, label }: { items: Onglet[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3">
      {items.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          aria-current={p.on ? "page" : undefined}
          className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-bold transition ${p.on ? "border-pine-700 text-pine-800" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-inkgreen"}`}
        >
          {p.label}
          {p.n !== undefined && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${p.on ? "bg-pine-700 text-white" : p.alerte && p.n > 0 ? "bg-amber-500/20 text-amber-800" : "bg-mist text-neutral-600"}`}>{p.n}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/** État vide d'une liste : ce qui se passe, et ce qu'on peut faire ensuite. */
export function EtatVide({ icon, titre, texte, children, encadre = true }: { icon: React.ReactNode; titre: string; texte?: string; children?: React.ReactNode; encadre?: boolean }) {
  return (
    <div className={`px-6 py-14 text-center ${encadre ? "rounded-2xl border border-dashed border-neutral-300 bg-white" : ""}`}>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-neutral-500">{icon}</span>
      <p className="mt-4 text-base font-extrabold text-inkgreen">{titre}</p>
      {texte && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{texte}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  );
}

export const boutonPrincipalCls = "inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600";
export const boutonSecondaireCls = "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700";
