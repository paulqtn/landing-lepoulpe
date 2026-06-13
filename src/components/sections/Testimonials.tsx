import { Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <section id="avis" className="scroll-mt-24 bg-slate-50/70 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Ils nous font confiance"
          title={
            <>
              Des clients qui{" "}
              <span className="text-gradient">recommandent</span>
            </>
          }
          intro="La réussite de nos clients est notre meilleure carte de visite."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.author} delay={i * 90}>
              <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <Quote className="h-8 w-8 text-poulpe-200" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-poulpe-500 text-poulpe-500"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-poulpe-100 font-bold text-poulpe-700">
                    {t.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">
                      {t.author}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
