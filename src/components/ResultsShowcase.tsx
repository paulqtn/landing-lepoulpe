import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const principle = [
  {
    title: "Objectifs chiffrés",
    desc: "On fixe ensemble des cibles précises : leads, chiffre d’affaires, positions.",
  },
  {
    title: "Engagement au contrat",
    desc: "Ces objectifs sont inscrits noir sur blanc dans votre contrat.",
  },
  {
    title: "Atteints, ou vous êtes libre",
    desc: "Non tenus ? Vous pouvez rompre le contrat, sans pénalité.",
  },
];

type Kpi = {
  label: string;
  note?: string;
  trend: string;
  down: boolean;
  points: number[];
};

const kpis: Kpi[] = [
  { label: "Trafic organique", trend: "Hausse", down: false, points: [20, 34, 30, 52, 68, 90] },
  { label: "Taux de conversion", trend: "Hausse", down: false, points: [28, 42, 40, 58, 72, 88] },
  { label: "Coût d’acquisition client", trend: "Baisse", down: true, points: [90, 80, 84, 60, 46, 26] },
  { label: "Coût par lead", trend: "Baisse", down: true, points: [86, 74, 78, 54, 42, 28] },
  { label: "Coût par vente", note: "e-commerce", trend: "Baisse", down: true, points: [92, 82, 72, 58, 44, 30] },
];

function Spark({ points }: { points: number[] }) {
  const W = 112;
  const H = 40;
  const pad = 4;
  const n = points.length;
  const coords = points.map((p, i) => {
    const x = (i / (n - 1)) * (W - pad * 2) + pad;
    const y = H - pad - (p / 100) * (H - pad * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = coords[n - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-10 w-28 shrink-0" aria-hidden>
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="2.5" fill="currentColor" />
    </svg>
  );
}

const cases = [
  {
    sector: "E-commerce",
    duration: "6 mois",
    metric: "×3,4",
    metricLabel: "de ventes en ligne",
    detail:
      "Refonte de la boutique et acquisition multicanale : un chiffre d’affaires multiplié, sans dépendre d’un seul levier.",
    actions: ["Refonte du site", "SEO", "Google Ads", "Meta Ads"],
  },
  {
    sector: "Services B2B",
    duration: "5 mois",
    metric: "+212%",
    metricLabel: "de demandes de devis",
    detail:
      "Contenu stratégique et campagnes ciblées pour un flux régulier de leads qualifiés.",
    actions: ["SEO", "Landing pages", "Google Ads", "Tunnel de conversion"],
  },
  {
    sector: "Artisan local",
    duration: "3 mois",
    metric: "−48%",
    metricLabel: "de coût par lead",
    detail:
      "Campagnes restructurées et pages locales optimisées : deux fois plus de contacts, à budget égal.",
    actions: ["Google Ads", "SEO local", "Tracking", "Optimisation CRO"],
  },
];

export function ResultsShowcase() {
  return (
    <section className="border-b border-neutral-200 bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-6 border-b border-neutral-200 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-500">
              Notre engagement
            </span>
            <h2 className="mt-3 font-grotesk text-3xl font-bold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl">
              On s’engage sur vos <span className="text-poulpe-500">objectifs</span>.
            </h2>
          </div>
          <p className="text-neutral-600 lg:col-span-4 lg:col-start-9 lg:self-end">
            Des cibles chiffrées — leads, chiffre d’affaires, positions —
            inscrites au contrat. Pas du SEO ou des ads « pour faire ».
          </p>
        </div>

        {/* engagement infographic — dark panel: principle + KPI trends */}
        <Reveal className="mt-12">
          <div className="relative overflow-hidden bg-ink text-white">
            <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-25" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* principle */}
              <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-poulpe-400">
                  Le principe
                </span>
                <ul className="mt-6 space-y-6">
                  {principle.map((p, i) => (
                    <li key={p.title} className="flex gap-4">
                      <span className="font-grotesk text-lg font-bold leading-none text-poulpe-400">
                        0{i + 1}
                      </span>
                      <div>
                        <h3 className="font-grotesk text-base font-bold text-white">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-white/55">
                          {p.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* KPI trends */}
              <div className="flex flex-col p-6 sm:p-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Les KPI sur lesquels on s’engage
                </span>
                <p className="mt-2 max-w-sm text-sm text-white/55">
                  On fait monter ce qui compte, baisser ce qui coûte.
                </p>

                <div className="mt-5 divide-y divide-white/10">
                  {kpis.map((k) => (
                    <div key={k.label} className="flex items-center gap-3 py-3.5 sm:gap-4">
                      <span className="flex-1 font-grotesk text-sm font-bold text-white">
                        {k.label}
                        {k.note && (
                          <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-white/30">
                            {k.note}
                          </span>
                        )}
                      </span>
                      <span className="text-poulpe-400">
                        <Spark points={k.points} />
                      </span>
                      <span className="flex w-6 shrink-0 items-center justify-end gap-1 font-mono text-[11px] uppercase tracking-wide text-poulpe-300 sm:w-[5.5rem]">
                        {k.down ? (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">{k.trend}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
                  Ces KPI tirent votre chiffre d’affaires et votre marge. Mais
                  comme ils dépendent aussi de vous (offre, vente, qualité), on
                  s’engage sur les KPI — pas sur le CA.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* concrete cases */}
        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          Cas concrets
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.metricLabel} delay={i * 80}>
              <article className="group relative flex h-full flex-col overflow-hidden border border-neutral-200 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-900">
                <span className="absolute inset-x-0 top-0 h-0.5 -translate-y-full bg-poulpe-500 transition-transform duration-300 group-hover:translate-y-0" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                    {c.sector}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {c.duration}
                  </span>
                </div>

                <div className="mt-6 font-grotesk text-[3.25rem] font-bold leading-none tracking-tight text-neutral-900">
                  {c.metric}
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-900">
                  {c.metricLabel}
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                  {c.detail}
                </p>

                <div className="mt-6 border-t border-neutral-200 pt-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    Actions menées
                  </span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {c.actions.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
