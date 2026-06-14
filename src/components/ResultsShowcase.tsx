import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const principle = [
  {
    title: "Objectifs chiffrés",
    desc: "On fixe ensemble des cibles précises : leads, positions, coût par acquisition.",
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

type Kpi = { label: string; lever: string };

const kpisUp: Kpi[] = [
  { label: "Trafic organique", lever: "SEO & contenu" },
  { label: "Taux de conversion", lever: "CRO & landing pages" },
];

const kpisDown: Kpi[] = [
  { label: "Coût d’acquisition client", lever: "campagnes optimisées" },
  { label: "Coût par lead", lever: "ciblage & tracking" },
  { label: "Coût par vente", lever: "tunnels & ROAS · e-com" },
];

function KpiGroup({
  title,
  dir,
  items,
}: {
  title: string;
  dir: "up" | "down";
  items: Kpi[];
}) {
  const Icon = dir === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-poulpe-500/15 text-poulpe-400">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
          {title}
        </span>
      </div>
      <ul className="mt-3 border-t border-white/10">
        {items.map((k) => (
          <li
            key={k.label}
            className="group flex flex-col gap-0.5 border-b border-white/10 py-3 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <span className="font-grotesk text-sm font-bold text-white transition-colors group-hover:text-poulpe-300">
              {k.label}
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/40 sm:text-right">
              {k.lever}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
            Des cibles chiffrées — trafic, conversion, coût par acquisition —
            inscrites au contrat. Pas du SEO ou des ads « pour faire ».
          </p>
        </div>

        {/* engagement infographic — dark panel: principle + KPI board */}
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

              {/* KPI board */}
              <div className="flex flex-col p-6 sm:p-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Les KPI sur lesquels on s’engage
                </span>
                <p className="mt-2 max-w-sm text-sm text-white/55">
                  On fait monter ce qui compte, baisser ce qui coûte. Chaque KPI,
                  son levier.
                </p>

                <div className="mt-7 space-y-7">
                  <KpiGroup title="On fait grimper" dir="up" items={kpisUp} />
                  <KpiGroup title="On fait fondre" dir="down" items={kpisDown} />
                </div>

                <p className="mt-7 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
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
