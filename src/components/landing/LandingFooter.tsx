import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {site.legalName} — votre partenaire digital 360°. Acquisition,
              visibilité et génération de leads pour les entreprises ambitieuses.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-2.5 text-slate-600 transition hover:text-poulpe-600"
            >
              <Mail className="h-4 w-4 text-poulpe-500" />
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2.5 text-slate-600 transition hover:text-poulpe-600"
            >
              <Phone className="h-4 w-4 text-poulpe-500" />
              {site.phone}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Tous droits réservés.
          </p>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-poulpe-600">
              Mentions légales
            </a>
            <a href="#" className="transition hover:text-poulpe-600">
              Confidentialité
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
