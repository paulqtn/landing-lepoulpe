import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Landing } from "@/lib/landings";

export function LandingBenefits({
  benefits,
}: {
  benefits: Landing["benefits"];
}) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={benefits.eyebrow}
          title={benefits.title}
          intro={benefits.intro}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 70}>
              <div className="group flex h-full gap-4 rounded-2xl border border-slate-200 bg-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:border-poulpe-200 hover:shadow-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-poulpe-500 text-white shadow-md shadow-poulpe-500/25 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
