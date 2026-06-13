import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { stats } from "@/lib/site";

export function Stats() {
  return (
    <section className="py-8">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 px-6 py-12 shadow-xl shadow-poulpe-500/20 sm:px-12">
          {/* decorative rings */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80} className="text-center">
                <p className="text-4xl font-extrabold text-white sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-white/80">
                  {stat.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
