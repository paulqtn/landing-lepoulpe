import { FileCheck, ShieldCheck, Target } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const commitment = [
  {
    icon: Target,
    title: "Objectifs chiffrés",
    desc: "On définit ensemble des cibles précises : leads, chiffre d’affaires, positions.",
  },
  {
    icon: FileCheck,
    title: "Engagement au contrat",
    desc: "Ces objectifs sont inscrits noir sur blanc dans votre contrat.",
  },
  {
    icon: ShieldCheck,
    title: "Atteints, ou vous êtes libre",
    desc: "Objectifs non tenus ? Vous pouvez rompre le contrat, sans pénalité. Vous êtes gagnant, quoi qu’il arrive.",
  },
];

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

        {/* commitment infographic — dark premium panel */}
        <Reveal className="mt-12">
          <div className="relative overflow-hidden bg-ink text-white">
            <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-30" />
            <div className="relative grid sm:grid-cols-3">
              {commitment.map((c, i) => {
                const last = i === commitment.length - 1;
                return (
                  <div
                    key={c.title}
                    className={`p-8 sm:p-9 ${
                      i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-xl ${
                          last
                            ? "bg-poulpe-500 text-white"
                            : "bg-white/5 text-poulpe-400 ring-1 ring-white/15"
                        }`}
                      >
                        <c.icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs text-white/30">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 font-grotesk text-lg font-bold text-white">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {c.desc}
                    </p>
                  </div>
                );
              })}
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
