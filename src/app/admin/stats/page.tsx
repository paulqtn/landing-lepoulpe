import { eurFmt } from "@/components/admin/ui";
import { USAGE_LABELS } from "@/lib/admin/statuts";
import { globalStats, ORDER_LABELS } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* ------------------------- mini-graphes SVG ------------------------- */

function Spark({ data }: { data: { d: string; n: number }[] }) {
  const W = 600, H = 110, max = Math.max(1, ...data.map((p) => p.n));
  const bw = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full">
      {data.map((p, i) => {
        const h = Math.max(2, (p.n / max) * (H - 14));
        return (
          <rect
            key={p.d}
            x={i * bw + 1.5}
            y={H - h}
            width={bw - 3}
            height={h}
            rx={2.5}
            className={i === data.length - 1 ? "fill-amber-500" : "fill-pine-600/80"}
          >
            <title>{`${p.d} : ${p.n}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

function HBar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-xs font-semibold text-neutral-500">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-pine-600" style={{ width: `${Math.max(3, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right text-sm font-extrabold tabular-nums text-inkgreen">
        {value.toLocaleString("fr-FR")}{suffix ?? ""}
      </span>
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

/* ------------------------------- page ------------------------------- */

const SOURCE_LABELS: Record<string, string> = {
  "configurateur-devis": "Générateur (site)",
  "rappel-generateur": "Demandes de rappel",
  "fiche-produit": "Fiches produit",
};

function sourceLabel(s: string): string {
  if (SOURCE_LABELS[s]) return SOURCE_LABELS[s];
  if (s.startsWith("generateur-verre-")) return `Tunnel verre ${s.replace("generateur-verre-", "")}`;
  if (s.startsWith("generateur-")) return `Tunnel ${s.replace("generateur-", "")}`;
  if (s.startsWith("configurateur-")) return `Page ${s.replace("configurateur-", "").replace("verre-", "verre ")}`;
  return s;
}

export default async function AdminStats() {
  const g = await globalStats();
  const totalMois = g.parJour.reduce((s, p) => s + p.n, 0);
  const funnelMax = Math.max(1, ...g.funnel.map((f) => f.n));
  const srcMax = Math.max(1, ...g.sources.map((s) => s.n));
  const usgMax = Math.max(1, ...g.usages.map((u) => u.n));
  const scoreTotal = Math.max(1, g.scores.A + g.scores.B + g.scores.C);
  const ordMax = Math.max(1, ...g.ordersParStatut.map((o) => o.n));

  const big = [
    { label: "Demandes sur 30 jours", value: String(totalMois) },
    { label: "Taux de conversion", value: `${g.tauxConversion} %` },
    { label: "Pipeline en cours (TTC)", value: `${eurFmt.format(g.pipelineTTC)} €` },
    { label: "CA gagné (TTC)", value: `${eurFmt.format(g.caGagne)} €` },
    { label: "Panier moyen estimé", value: `${eurFmt.format(g.panierMoyen)} €` },
    { label: "Délai atelier → expédition", value: g.delaiMoyenJours !== null ? `${g.delaiMoyenJours} j` : "—" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-inkgreen">Statistiques</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {big.map((k) => (
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
          <div className="space-y-2.5">
            {g.funnel.map((f) => <HBar key={f.label} label={f.label} value={f.n} max={funnelMax} />)}
          </div>
        </Panel>

        <Panel title="Scores des demandes" note="A : à appeler en priorité — B : à relancer — C : à nourrir.">
          <div className="space-y-2.5">
            {(["A", "B", "C"] as const).map((s) => (
              <HBar key={s} label={`Score ${s}`} value={g.scores[s]} max={scoreTotal} />
            ))}
          </div>
        </Panel>

        <Panel title="Meilleures sources" note="D'où viennent les demandes — et lesquelles signent.">
          <div className="space-y-2.5">
            {g.sources.map((s) => (
              <HBar key={s.source} label={`${sourceLabel(s.source)}${s.gagnes ? ` · ${s.gagnes} gagnée${s.gagnes > 1 ? "s" : ""}` : ""}`} value={s.n} max={srcMax} />
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
        note={`${g.stockAlertes} référence${g.stockAlertes > 1 ? "s" : ""} de stock en alerte — détail dans le pôle Gestion.`}
      >
        <div className="space-y-2.5">
          {g.ordersParStatut.map((o) => (
            <HBar
              key={o.statut}
              label={`${ORDER_LABELS[o.statut]}${o.montant ? ` · ${eurFmt.format(o.montant)} €` : ""}`}
              value={o.n}
              max={ordMax}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}
