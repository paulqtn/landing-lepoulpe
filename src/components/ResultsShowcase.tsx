import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

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
              Résultats
            </span>
            <h2 className="mt-3 font-grotesk text-3xl font-bold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl">
              Nous vendons du <span className="text-poulpe-500">résultat</span>.
            </h2>
          </div>
          <p className="text-neutral-600 lg:col-span-4 lg:col-start-9 lg:self-end">
            Pas du SEO ni des pubs « pour faire ». On choisit les actions qui
            génèrent des clients — et on s’engage sur le résultat.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
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
