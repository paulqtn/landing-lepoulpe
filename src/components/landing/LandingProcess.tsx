import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Landing } from "@/lib/landings";

export function LandingProcess({ process }: { process: Landing["process"] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={process.eyebrow}
          title={process.title}
        />

        <div className="relative mt-16 grid gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-poulpe-200 via-poulpe-300 to-poulpe-200 lg:block" />
          {process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <div className="relative">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-poulpe-600 shadow-md ring-1 ring-poulpe-100">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
