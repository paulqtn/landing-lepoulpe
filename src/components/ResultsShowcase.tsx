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

// Illustrative trajectory — bars that cross the contractual objective line.
const OBJECTIVE = 56;
const bars = [16, 28, 42, 62, 82, 100];
const months = ["M1", "M2", "M3", "M4", "M5", "M6"];

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

        {/* engagement infographic — dark panel: principle + trajectory chart */}
        <Reveal className="mt-12">
          <div className="relative overflow-hidden bg-ink text-white">
            <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-25" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* principle */}
              <div className="border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r">
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

              {/* trajectory chart */}
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                    Exemple de trajectoire
                  </span>
                  <span className="rounded-full bg-poulpe-500/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-poulpe-300">
                    Objectif dépassé
                  </span>
                </div>

                <div className="relative mt-10 h-48">
                  {/* bars */}
                  <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
                    {bars.map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${h >= OBJECTIVE ? "bg-poulpe-500" : "bg-white/15"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  {/* objective line */}
                  <div
                    className="absolute inset-x-0 z-20"
                    style={{ bottom: `${OBJECTIVE}%` }}
                  >
                    <div className="border-t border-dashed border-white/40" />
                    <span className="absolute -top-2.5 right-0 bg-ink pl-2 font-mono text-[10px] uppercase tracking-wide text-white/55">
                      Objectif
                    </span>
                  </div>
                </div>

                {/* x axis */}
                <div className="mt-3 flex gap-2 sm:gap-3">
                  {months.map((m) => (
                    <span
                      key={m}
                      className="flex-1 text-center font-mono text-[10px] text-white/35"
                    >
                      {m}
                    </span>
                  ))}
                </div>
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
