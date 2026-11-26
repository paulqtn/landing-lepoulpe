import { requireMenu, voitTout } from "@/lib/admin/auth";
import Link from "next/link";
import { dateFmt, eurFmt, ScoreBadge } from "@/components/admin/ui";
import { niveauInfo } from "@/lib/admin/niveaux";
import { STATUT_LABELS, STATUTS, type Statut, pipeline, pipelineApercu } from "@/lib/admin/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vue Kanban" };

/* Vue Kanban — toutes les affaires, colonne par colonne, montants en tête. */

const COL_COLORS: Record<Statut, string> = {
  nouveau: "border-t-amber-500",
  devis_envoye: "border-t-sky-500",
  relance_1: "border-t-violet-400",
  relance_2: "border-t-violet-500",
  relance_3: "border-t-violet-600",
  a_rappeler: "border-t-orange-500",
  en_discussion: "border-t-teal-500",
  en_reflexion: "border-t-indigo-500",
  devis_a_modifier: "border-t-rose-500",
  gagne: "border-t-green-500",
  perdu: "border-t-neutral-300",
};

/** Jours écoulés depuis la dernière activité connue (à défaut, depuis la demande). */
const sansAction = (l: { last_activity_at: string | null; created_at: string }) => Math.max(0, Math.floor((Date.now() - Number(new Date(l.last_activity_at ?? l.created_at))) / 86400_000));

export default async function PipelinePage() {
  const me = await requireMenu("pipeline");
  const moi = voitTout(me) ? undefined : me.name; // un commercial ne voit que ses affaires
  // Totaux calculés en base sur toutes les demandes ; seules les cartes affichées sont chargées.
  const [totaux, leads] = await Promise.all([pipeline(moi), pipelineApercu(8, moi)]);
  const cols = STATUTS.map((statut) => {
    const t = totaux.find((x) => x.statut === statut);
    return { statut, list: leads.filter((l) => l.statut === statut), n: t?.n ?? 0, total: Math.round(t?.total ?? 0) };
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-inkgreen">Vue Kanban</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cols.map((c) => (
          <section key={c.statut} className={`rounded-2xl border border-neutral-200 border-t-4 bg-white ${COL_COLORS[c.statut]}`}>
            <header className="flex items-baseline justify-between gap-2 px-4 pb-2 pt-3.5">
              <h2 className="text-sm font-extrabold text-inkgreen">{STATUT_LABELS[c.statut]}</h2>
              <p className="text-right">
                <span className="block text-sm font-extrabold tabular-nums text-inkgreen">{c.n}</span>
                {c.total > 0 && <span className="block text-[11px] tabular-nums text-neutral-400">{eurFmt.format(c.total)} €</span>}
              </p>
            </header>
            <ul className="space-y-2 px-3 pb-3">
              {c.list.slice(0, 8).map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/commercial/clients/${l.id}`}
                    className="block rounded-xl border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-card"
                  >
                    <span className="flex items-center gap-2">
                      <ScoreBadge score={l.score} />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-inkgreen">{l.name}</span>
                    </span>
                    {niveauInfo(l.niveau) && <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${niveauInfo(l.niveau)!.cls}`}>{l.niveau} · {niveauInfo(l.niveau)!.label}</span>}
                    <span className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                      <span title={`Demande du ${dateFmt.format(new Date(l.created_at))}`}>{sansAction(l) === 0 ? "actif aujourd'hui" : `${sansAction(l)} j sans action`}</span>
                      {l.estimation_ttc && (
                        <span className="font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
              {c.list.length === 0 && <li className="px-1 pb-2 text-xs text-neutral-300">—</li>}
              {c.n > c.list.length && (
                <li>
                  <Link href={`/commercial/clients?statut=${c.statut}`} className="block px-1 text-xs font-bold text-pine-700 hover:underline">
                    + {c.n - c.list.length} autres
                  </Link>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
