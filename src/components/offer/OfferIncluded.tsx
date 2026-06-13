import { Check } from "lucide-react";
import { Icon } from "@/components/Icon";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Offer } from "@/lib/offer";

export function OfferIncluded({ included }: { included: Offer["included"] }) {
  return (
    <section id="inclus" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow={included.eyebrow}
          title={included.title}
          intro={included.intro}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {included.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="group relative h-full rounded-2xl border border-slate-200 bg-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:border-poulpe-200 hover:shadow-card">
                <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-poulpe-100 text-poulpe-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-poulpe-500 text-white shadow-md shadow-poulpe-500/25 transition-transform duration-300 group-hover:scale-110">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
