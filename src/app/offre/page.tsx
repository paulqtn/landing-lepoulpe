import type { Metadata } from "next";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingGuarantee } from "@/components/landing/LandingGuarantee";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingProcess } from "@/components/landing/LandingProcess";
import { LandingProof } from "@/components/landing/LandingProof";
import { LandingResults } from "@/components/landing/LandingResults";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { OfferComparison } from "@/components/offer/OfferComparison";
import { OfferIncluded } from "@/components/offer/OfferIncluded";
import { OfferRental } from "@/components/offer/OfferRental";
import { SiteHeader } from "@/components/SiteHeader";
import { offer } from "@/lib/offer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: offer.meta.title,
  description: offer.meta.description,
  alternates: { canonical: "/offre" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url + "/offre",
    siteName: site.legalName,
    title: offer.meta.title,
    description: offer.meta.description,
  },
};

export default function OffrePage() {
  return (
    <>
      <SiteHeader ctaHref="#generateur" ctaLabel="Étudier mon projet" />
      <main>
        <LandingHero
          hero={offer.hero}
          proof={offer.proof}
          generator={offer.generator}
          secondaryHref="#fonctionnement"
        />
        <LandingProof proof={offer.proof} />
        <OfferIncluded included={offer.included} />
        <OfferRental rental={offer.rental} />
        <OfferComparison comparison={offer.comparison} />
        <LandingResults results={offer.results} />
        <LandingProcess process={offer.process} />
        <LandingGuarantee guarantee={offer.guarantee} />
        <LandingTestimonials testimonials={offer.testimonials} />
        <LandingFaq faq={offer.faq} />
        <LandingFinalCta finalCta={offer.finalCta} ctaLabel="Étudier mon projet" />
      </main>
      <LandingFooter />
    </>
  );
}
