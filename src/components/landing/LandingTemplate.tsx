import { LandingBenefits } from "@/components/landing/LandingBenefits";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingGuarantee } from "@/components/landing/LandingGuarantee";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProcess } from "@/components/landing/LandingProcess";
import { LandingProof } from "@/components/landing/LandingProof";
import { LandingResults } from "@/components/landing/LandingResults";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import type { Landing } from "@/lib/landings";

/**
 * Renders a complete conversion-focused landing page from a single config.
 * Add a new keyword page = add a new `Landing` entry in src/lib/landings.ts.
 */
export function LandingTemplate({ landing }: { landing: Landing }) {
  return (
    <>
      <LandingHeader ctaLabel={landing.nav.ctaLabel} />
      <main>
        <LandingHero
          hero={landing.hero}
          proof={landing.proof}
          generator={landing.generator}
        />
        <LandingProof proof={landing.proof} />
        <LandingResults results={landing.results} />
        <LandingBenefits benefits={landing.benefits} />
        <LandingProcess process={landing.process} />
        <LandingGuarantee guarantee={landing.guarantee} />
        <LandingTestimonials testimonials={landing.testimonials} />
        <LandingFaq faq={landing.faq} />
        <LandingFinalCta finalCta={landing.finalCta} ctaLabel={landing.nav.ctaLabel} />
      </main>
      <LandingFooter />
    </>
  );
}
