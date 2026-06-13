import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Landing } from "@/lib/landings";

export function LandingProof({ proof }: { proof: Landing["proof"] }) {
  return (
    <section className="border-y border-slate-100 bg-white py-12 sm:py-16">
      <Container>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          {proof.logosLabel}
        </p>

        {/* logos (placeholders) */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {proof.logos.map((logo) => (
            <span
              key={logo}
              className="font-display text-lg font-bold tracking-tight text-slate-300"
            >
              {logo}
            </span>
          ))}
        </div>

        {/* stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {proof.stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 70}
              className="rounded-2xl border border-slate-100 bg-canvas p-5 text-center shadow-card sm:p-6"
            >
              <p className="text-3xl font-extrabold tabular-nums text-ink sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
