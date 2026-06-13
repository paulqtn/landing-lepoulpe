import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { process } from "@/lib/site";

export function Process() {
  return (
    <section id="methode" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Notre méthode"
          title={
            <>
              Une démarche claire,{" "}
              <span className="text-gradient">en 4 étapes</span>
            </>
          }
          intro="De la première discussion à la croissance continue, vous savez toujours où en est votre projet."
        />

        <div className="relative mt-16 grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          {/* connecting line on desktop */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-poulpe-200 via-poulpe-300 to-poulpe-200 lg:block" />

          {process.map((item, i) => (
            <Reveal key={item.step} delay={i * 90}>
              <div className="relative">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-poulpe-600 shadow-md ring-1 ring-poulpe-100">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
