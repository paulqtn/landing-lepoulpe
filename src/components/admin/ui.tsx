import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Compteur } from "@/components/admin/Compteur";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";

const COLORS: Record<Statut, string> = {
  nouveau: "bg-amber-500/15 text-amber-800 ring-amber-500/30",
  devis_envoye: "bg-sky-50 text-sky-700 ring-sky-200",
  relance_1: "bg-violet-50 text-violet-700 ring-violet-200",
  relance_2: "bg-violet-100 text-violet-800 ring-violet-300",
  relance_3: "bg-violet-200 text-violet-900 ring-violet-400",
  a_rappeler: "bg-orange-50 text-orange-700 ring-orange-200",
  en_discussion: "bg-teal-50 text-teal-700 ring-teal-200",
  en_reflexion: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  devis_a_modifier: "bg-rose-50 text-rose-700 ring-rose-200",
  gagne: "bg-green-50 text-green-700 ring-green-200",
  perdu: "bg-neutral-100 text-neutral-600 ring-neutral-200",
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
          className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-bold transition ${p.on ? "border-pine-700 text-pine-800" : "border-transparent text-neutral-600 hover:border-neutral-300 hover:text-inkgreen"}`}
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
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-neutral-600">{icon}</span>
      <p className="mt-4 text-base font-extrabold text-inkgreen">{titre}</p>
      {texte && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{texte}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  );
}

export const boutonPrincipalCls = "inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600";
export const boutonSecondaireCls = "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700";

/* ------------------------------------------------------------------ */
/*  Briques de page communes à tout le back office : même en-tête,     */
/*  mêmes cartes, mêmes tuiles de chiffres, d'un écran à l'autre.      */
/* ------------------------------------------------------------------ */

export type Ton = "pine" | "ambre" | "vert" | "rouge" | "neutre";
const TONS: Record<Ton, { pastille: string; compteur: string; chiffre: string }> = {
  pine: { pastille: "bg-pine-50 text-pine-700", compteur: "bg-pine-50 text-pine-700", chiffre: "text-inkgreen" },
  ambre: { pastille: "bg-amber-500/15 text-amber-800", compteur: "bg-amber-500/15 text-amber-800", chiffre: "text-amber-700" },
  vert: { pastille: "bg-green-50 text-green-700", compteur: "bg-green-50 text-green-700", chiffre: "text-green-700" },
  rouge: { pastille: "bg-red-50 text-red-600", compteur: "bg-red-50 text-red-700", chiffre: "text-red-600" },
  neutre: { pastille: "bg-mist text-neutral-600", compteur: "bg-mist text-neutral-600", chiffre: "text-inkgreen" },
};

/** En-tête de page : titre, phrase d'explication, et à droite l'action principale s'il y en a une. */
export function EnTete({ titre, sous, children }: { titre: React.ReactNode; sous?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-inkgreen">{titre}</h1>
        {sous && <p className="mt-1 max-w-3xl text-sm text-neutral-600">{sous}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** Carte de section : pictogramme, titre, compteur éventuel, action à droite. */
export function Carte({ icon: Icon, titre, sous, n, ton = "pine", action, children, className = "", id }: { icon: LucideIcon; titre: React.ReactNode; sous?: React.ReactNode; n?: number; ton?: Ton; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  const t = TONS[ton];
  return (
    <section id={id} className={`rounded-2xl border border-neutral-200 bg-white p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="flex min-w-0 items-center gap-2.5 text-base font-extrabold text-inkgreen">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${t.pastille}`}><Icon className="h-4 w-4" /></span>
          {titre}
          {n !== undefined && <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${n > 0 ? t.compteur : "bg-mist text-neutral-600"}`}>{n}</span>}
        </h2>
        {action}
      </div>
      {sous && <p className="mt-1.5 text-xs text-neutral-600">{sous}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Tuile de chiffre clé : pictogramme, nombre qui monte, libellé. */
export function Tuile({ icon: Icon, valeur, suffixe, label, aide, ton = "pine" }: { icon: LucideIcon; valeur: number; suffixe?: string; label: string; aide?: string; ton?: Ton }) {
  const t = TONS[ton];
  return (
    <li className="mgk-tuile flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.pastille}`}><Icon className="h-5 w-5" /></span>
      <span className="min-w-0">
        <span className={`block text-2xl font-extrabold leading-tight ${valeur > 0 ? t.chiffre : "text-inkgreen"}`}><Compteur valeur={valeur} suffixe={suffixe} /></span>
        <span className="block text-sm font-bold text-neutral-800">{label}</span>
        {aide && <span className="block text-xs text-neutral-600">{aide}</span>}
      </span>
    </li>
  );
}

/** Liste vide à l'intérieur d'une carte : une ligne calme, avec son pictogramme. */
export function Rien({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 rounded-xl bg-mist/60 px-4 py-3.5 text-sm text-neutral-600">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-neutral-600"><Icon className="h-4 w-4" /></span>
      <span>{children}</span>
    </p>
  );
}

/** Pastille d'état (avancement d'une commande, échéance…). */
export const pastilleCls = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset";

/** Pictogramme d'un titre de section (même pastille que dans <Carte>), pour les composants qui écrivent leur propre titre. */
export const pictoCls = "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700";
/** Titre d'un bloc de la fiche client et des formulaires denses. */
export const titreBlocCls = "flex items-center gap-2 text-sm font-extrabold text-inkgreen";
