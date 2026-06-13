import { ArrowRight, Check, Sparkles, Star } from "lucide-react";
import { LeadGenerator } from "@/components/landing/LeadGenerator";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Landing } from "@/lib/landings";

export function LandingHero({
  hero,
  proof,
  generator,
}: {
  hero: Landing["hero"];
  proof: Landing["proof"];
  generator: Landing["generator"];
}) {
  return (
    <section id="top" className="relative overflow-hidden pt-12 sm:pt-16">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8%] top-[-6%] h-96 w-96 rounded-full bg-poulpe-200/45 blur-3xl" />
        <div className="absolute right-[-6%] top-[10%] h-80 w-80 rounded-full bg-flame/15 blur-3xl" />
        <div className="absolute inset-0 bg-dotgrid-light [mask-image:radial-gradient(ellipse_70%_55%_at_50%_20%,#000_40%,transparent_100%)]" />
      </div>

      <Container className="grid items-center gap-12 pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:pb-24">
        {/* copy */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-poulpe-700 shadow-sm ring-1 ring-poulpe-100">
            <Sparkles className="h-3.5 w-3.5 text-poulpe-500" />
            {hero.badge}
          </span>

          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.07] text-ink sm:text-5xl lg:text-[3.4rem]">
            {hero.titleLead}{" "}
            <span className="text-gradient">{hero.titleAccent}</span>
            {hero.titleRest ? <> {hero.titleRest}</> : null}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-slate-600">
            {hero.subtitle}
          </p>

          <ul className="mt-6 space-y-2.5">
            {hero.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-[15px] text-slate-700">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-poulpe-100 text-poulpe-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#generateur" size="lg">
              {hero.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            {hero.ctaSecondary && (
              <ButtonLink href="#resultats" variant="secondary" size="lg">
                {hero.ctaSecondary}
              </ButtonLink>
            )}
          </div>

          {/* trust row */}
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-poulpe-300 to-poulpe-600 text-[11px] font-bold text-white ring-2 ring-canvas"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-poulpe-500 text-poulpe-500" />
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {proof.rating} · {proof.ratingLabel}
                </p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <p className="text-sm font-medium text-slate-600">{proof.clients}</p>
          </div>
        </div>

        {/* generator */}
        <div id="generateur" className="scroll-mt-24">
          <LeadGenerator config={generator} />
        </div>
      </Container>
    </section>
  );
}
