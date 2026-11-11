import { eurFmt } from "@/components/admin/ui";
import { currentRep } from "@/lib/admin/auth";
import { COMMISSION_PCT, OBJECTIF_MENSUEL, repStats } from "@/lib/admin/compens";
import { listLeads } from "@/lib/admin/db";
import { USAGE_LABELS } from "@/lib/admin/statuts";
import { getTeam } from "@/lib/admin/team";
import { globalStats, ORDER_LABELS } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* Statistiques — la performance par commercial d'abord, puis les stats
   secondaires (volumes, sources, usages, production). */

function Spark({ data }: { data: { d: string; n: number }[] }) {
  const W = 600, H = 110, max = Math.max(1, ...data.map((p) => p.n));
  const bw = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full">
      {data.map((p, i) => {
        const h = Math.max(2, (p.n / max) * (H - 14));
        return (
          <rect key={p.d} x={i * bw + 1.5} y={H - h} width={bw - 3} height={h} rx={2.5}
            className={i === data.length - 1 ? "fill-amber-500" : "fill-pine-600/80"}>
            <title>{`${p.d} : ${p.n}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function HBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 shrink-0 truncate text-xs font-semibold text-neutral-500">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-pine-600" style={{ width: `${Math.max(3, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
      <span className="w-12 shrink-0 text-right text-sm font-extrabold tabular-nums text-inkgreen">{value}</span>
    </div>
  );
}

function Panel({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-extrabold text-inkgreen">{title}</h2>
      <div className="mt-4">{children}</div>
      {note && <p className="mt-3 text-[11px] text-neutral-400">{note}</p>}
    </section>
  );
}

export default async function StatsPage() {
  const [rep, leads, g] = await Promise.all([currentRep(), listLeads({ limit: 1000 }), globalStats()]);
  const team = getTeam();
  const reps = [...new Set([...team, ...leads.map((l) => l.assigned_to).filter((x): x is string => Boolean(x))])];
  const perReps = reps.map((r) => repStats(leads, r)).sort((a, b) => b.caMois - a.caMois);
  const funnelMax = Math.max(1, ...g.funnel.map((f) => f.n));
  const srcMax = Math.max(1, ...g.sources.map((x) => x.n));
  const usgMax = Math.max(1, ...g.usages.map((x) => x.n));
  const ordMax = Math.max(1, ...g.ordersParStatut.map((o) => o.n));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-inkgreen">Statistiques</h1>

      {/* ------------------ la performance par commercial ------------------ */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Performance par commercial</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Commission {COMMISSION_PCT} % du CA signé · prime à {eurFmt.format(OBJECTIF_MENSUEL)} € signés dans le mois.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                <th className="py-2 pr-3">Commercial</th>
                <th className="py-2 pr-3 text-right">CA mois</th>
                <th className="py-2 pr-3 text-right">Commission</th>
                <th className="py-2 pr-3 text-right">Objectif</th>
                <th className="py-2 pr-3 text-right">Signées</th>
                <th className="py-2 pr-3 text-right">Taux sign.</th>
                <th className="py-2 pr-3 text-right">En cours (€)</th>
                <th className="py-2 text-right">Panier moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {perReps.map((p) => (
                <tr key={p.rep} className={p.rep === rep ? "bg-pine-50/60" : undefined}>
                  <td className="py-3 pr-3 font-bold text-inkgreen">
                    {p.rep}
                    {p.rep === rep && <span className="ml-1.5 rounded-full bg-pine-700 px-1.5 py-0.5 text-[9px] font-bold text-white">vous</span>}
                  </td>
                  <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-inkgreen">{eurFmt.format(p.caMois)} €</td>
                  <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-amber-600">{eurFmt.format(p.commissionMois)} €</td>
                  <td className="py-3 pr-3 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                        <span className="block h-full rounded-full bg-amber-500" style={{ width: `${p.pctObjectif}%` }} />
                      </span>
                      <span className="w-9 text-right text-xs font-bold tabular-nums text-neutral-500">{p.pctObjectif} %</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{p.signees} <span className="text-neutral-300">/ {p.perdues}p</span></td>
                  <td className="py-3 pr-3 text-right font-bold tabular-nums">{p.tauxSignature !== null ? `${p.tauxSignature} %` : "—"}</td>
                  <td className="py-3 pr-3 text-right tabular-nums text-neutral-600">{eurFmt.format(p.enCoursTTC)} €</td>
                  <td className="py-3 text-right tabular-nums text-neutral-600">{eurFmt.format(p.panierMoyen)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Demandes sur 30 jours", value: String(g.parJour.reduce((s, p) => s + p.n, 0)) },
          { label: "Taux de conversion global", value: `${g.tauxConversion} %` },
          { label: "Pipeline en cours (TTC)", value: `${eurFmt.format(g.pipelineTTC)} €` },
          { label: "Panier moyen estimé", value: `${eurFmt.format(g.panierMoyen)} €` },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-2xl font-extrabold tabular-nums text-inkgreen">{k.value}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-600">{k.label}</p>
          </div>
        ))}
      </div>

      <Panel title="Volume de demandes — 30 derniers jours" note="Le jour courant est en ambre.">
        <Spark data={g.parJour} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Entonnoir de conversion">
          <div className="space-y-2.5">{g.funnel.map((f) => <HBar key={f.label} label={f.label} value={f.n} max={funnelMax} />)}</div>
        </Panel>
        <Panel title="Scores des demandes" note="A : à appeler en priorité — B : à relancer — C : à nourrir.">
          <div className="space-y-2.5">
            {(["A", "B", "C"] as const).map((x) => (
              <HBar key={x} label={`Score ${x}`} value={g.scores[x]} max={Math.max(1, g.scores.A + g.scores.B + g.scores.C)} />
            ))}
          </div>
        </Panel>
        <Panel title="Meilleures sources" note="D'où viennent les demandes — et lesquelles signent.">
          <div className="space-y-2.5">
            {g.sources.map((x) => (
              <HBar key={x.source} label={`${x.source}${x.gagnes ? ` · ${x.gagnes} gagnée${x.gagnes > 1 ? "s" : ""}` : ""}`} value={x.n} max={srcMax} />
            ))}
            {g.sources.length === 0 && <p className="text-sm text-neutral-400">Pas encore de données.</p>}
          </div>
        </Panel>
        <Panel title="Projets par usage">
          <div className="space-y-2.5">
            {g.usages.map((u) => (
              <HBar key={u.usage} label={USAGE_LABELS[u.usage] ?? u.usage} value={u.n} max={usgMax} />
            ))}
            {g.usages.length === 0 && <p className="text-sm text-neutral-400">Pas encore de données.</p>}
          </div>
        </Panel>
      </div>

      <Panel
        title="Production & logistique"
        note={`Délai moyen atelier → expédition : ${g.delaiMoyenJours !== null ? `${g.delaiMoyenJours} j` : "—"} · ${g.stockAlertes} alerte${g.stockAlertes > 1 ? "s" : ""} stock (détail dans le futur espace Logistique).`}
      >
        <div className="space-y-2.5">
          {g.ordersParStatut.map((o) => (
            <HBar key={o.statut} label={`${ORDER_LABELS[o.statut]}${o.montant ? ` · ${eurFmt.format(o.montant)} €` : ""}`} value={o.n} max={ordMax} />
          ))}
        </div>
      </Panel>
    </div>
  );
}
