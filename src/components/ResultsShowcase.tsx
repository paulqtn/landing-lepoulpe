import { FileCheck, Target, Trophy } from "lucide-react";
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
    icon: Trophy,
    title: "Atteints — ou vous sortez",
    desc: "On les atteint. Sinon, une clause vous libère dès 1 an.",
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

        {/* commitment infographic */}
        <Reveal className="mt-12 border border-neutral-200 bg-neutral-50 px-6 py-12 sm:px-10">
          <div className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-poulpe-200 via-poulpe-400 to-poulpe-200 md:block" />
            {commitment.map((c, i) => (
              <div key={c.title} className="relative text-center">
                <div className="relative mx-auto w-fit">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-neutral-900 text-white shadow-sm">
                    <c.icon className="h-7 w-7" />
                  </span>
                  <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-poulpe-500 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-grotesk text-lg font-bold text-neutral-900">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* concrete cases */}
        <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          Cas concrets
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.metricLabel} delay={i * 80}>
              <article className="flex h-full flex-col border border-neutral-200 p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                    {c.sector}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {c.duration}
                  </span>
                </div>

                <div className="mt-6">
                  <div className="font-grotesk text-5xl font-bold tracking-tight text-neutral-900">
                    {c.metric}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {c.metricLabel}
                  </div>
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
