import { Check, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Landing } from "@/lib/landings";

export function LandingGuarantee({
  guarantee,
}: {
  guarantee: Landing["guarantee"];
}) {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-ink via-ink-2 to-ink p-8 shadow-panel sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-40" />
            <div className="pointer-events-none absolute -right-16 top-[-20%] h-72 w-72 rounded-full bg-poulpe-500/25 blur-3xl" />

            <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-12">
              {/* seal */}
              <div className="flex items-center gap-5 md:flex-col md:items-start">
                <span className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-poulpe-400 to-poulpe-600 text-white shadow-glow">
                  <ShieldCheck className="h-12 w-12" />
                </span>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-poulpe-300">
                  {guarantee.badge}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {guarantee.title}
                </h2>
                <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-slate-300">
                  {guarantee.text}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {guarantee.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-slate-200">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-poulpe-500 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
