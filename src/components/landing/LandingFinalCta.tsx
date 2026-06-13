import { ArrowRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Landing } from "@/lib/landings";

export function LandingFinalCta({
  finalCta,
  ctaLabel,
}: {
  finalCta: Landing["finalCta"];
  ctaLabel: string;
}) {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-poulpe-500 via-poulpe-500 to-poulpe-600 px-6 py-16 text-center shadow-glow sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.18) 1px, transparent 0)",
                backgroundSize: "26px 26px",
              }}
            />
            <div className="pointer-events-none absolute -top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl md:text-[2.6rem] md:leading-[1.1]">
                {finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-white/90">
                {finalCta.subtitle}
              </p>

              <div className="mt-9 flex justify-center">
                <a
                  href="#generateur"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-poulpe-700 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  {ctaLabel}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-sm text-white/80">
                <Lock className="h-4 w-4" />
                100% gratuit · sans engagement · réponse sous 24h
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
