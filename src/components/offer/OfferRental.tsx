import { Info } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Offer } from "@/lib/offer";

export function OfferRental({ rental }: { rental: Offer["rental"] }) {
  return (
    <section
      id="fonctionnement"
      className="scroll-mt-24 bg-gradient-to-b from-poulpe-50/60 to-canvas py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow={rental.eyebrow}
          title={rental.title}
          intro={rental.intro}
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {rental.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 90}>
              <div className="h-full rounded-3xl border border-poulpe-100 bg-white p-7 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-md shadow-poulpe-500/25">
                  <Icon name={pillar.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink">{pillar.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {pillar.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-poulpe-500" />
            {rental.note}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
