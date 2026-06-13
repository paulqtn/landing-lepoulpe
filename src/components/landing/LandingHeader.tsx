import { Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function LandingHeader({ ctaLabel }: { ctaLabel: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between sm:h-[4.5rem]">
        <a href="#top" aria-label="Le Poulpe — accueil">
          <Logo />
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-poulpe-600 sm:flex"
          >
            <Phone className="h-4 w-4 text-poulpe-500" />
            {site.phone}
          </a>
          <ButtonLink href="#generateur">{ctaLabel}</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
