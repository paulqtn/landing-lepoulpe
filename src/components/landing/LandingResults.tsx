import { TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Landing } from "@/lib/landings";

export function LandingResults({ results }: { results: Landing["results"] }) {
  return (
    <section id="resultats" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={results.eyebrow}
          title={results.title}
          intro={results.intro}
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {results.cases.map((c, i) => (
            <Reveal key={c.client} delay={i * 80}>
              <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {c.sector}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {c.duration}
                  </span>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-extrabold leading-none text-gradient">
                    {c.metric}
                  </span>
                  <TrendingUp className="mb-1 h-6 w-6 text-poulpe-500" />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {c.metricLabel}
                </p>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {c.detail}
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-poulpe-100 text-sm font-bold text-poulpe-700">
                    {c.client.charAt(0)}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {c.client}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
