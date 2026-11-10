import Link from "next/link";
import { dateFmt, eurFmt, ScoreBadge } from "@/components/admin/ui";
import { listLeads, STATUT_LABELS, STATUTS, type Statut } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/* Pipeline — toutes les affaires, colonne par colonne, montants en tête. */

const COL_COLORS: Record<Statut, string> = {
  nouveau: "border-t-amber-500",
  devis_envoye: "border-t-sky-500",
  relance_1: "border-t-violet-400",
  relance_2: "border-t-violet-500",
  relance_3: "border-t-violet-600",
  a_rappeler: "border-t-orange-500",
  gagne: "border-t-green-500",
  perdu: "border-t-neutral-300",
};

export default async function PipelinePage() {
  const leads = await listLeads({ limit: 500 });
  const cols = STATUTS.map((statut) => {
    const list = leads.filter((l) => l.statut === statut);
    const total = Math.round(list.reduce((t, l) => t + (l.estimation_ttc ? Number(l.estimation_ttc) : 0), 0));
    return { statut, list, total };
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-inkgreen">Pipeline</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cols.map((c) => (
          <section key={c.statut} className={`rounded-2xl border border-neutral-200 border-t-4 bg-white ${COL_COLORS[c.statut]}`}>
            <header className="flex items-baseline justify-between gap-2 px-4 pb-2 pt-3.5">
              <h2 className="text-sm font-extrabold text-inkgreen">{STATUT_LABELS[c.statut]}</h2>
              <p className="text-right">
                <span className="block text-sm font-extrabold tabular-nums text-inkgreen">{c.list.length}</span>
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
                    <span className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{dateFmt.format(new Date(l.created_at)).split(" ").slice(0, 2).join(" ")}</span>
                      {l.estimation_ttc && (
                        <span className="font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
              {c.list.length === 0 && <li className="px-1 pb-2 text-xs text-neutral-300">—</li>}
              {c.list.length > 8 && (
                <li>
                  <Link href={`/commercial/clients?statut=${c.statut}`} className="block px-1 text-xs font-bold text-pine-700 hover:underline">
                    + {c.list.length - 8} autres
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
