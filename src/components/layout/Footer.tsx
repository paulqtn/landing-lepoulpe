import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { nav, site } from "@/lib/site";

const services = [
  "Sites vitrines",
  "Landing pages",
  "Référencement SEO",
  "Publicité en ligne",
  "Réseaux sociaux",
  "Maintenance",
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              {site.legalName}, votre agence web 360°. On déploie nos tentacules
              sur tous les fronts du digital pour faire grandir votre activité.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-slate-600">
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-poulpe-600"
              >
                <Mail className="h-4 w-4 text-poulpe-500" />
                {site.email}
              </a>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 transition-colors hover:text-poulpe-600"
              >
                <Phone className="h-4 w-4 text-poulpe-500" />
                {site.phone}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-poulpe-500" />
                {site.location}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Navigation</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-slate-600 transition-colors hover:text-poulpe-600"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">Services</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s} className="text-slate-600">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Tous droits réservés.
          </p>
          <p className="flex items-center gap-1.5">
            Conçu avec exigence
            <span className="text-poulpe-500">●</span>
            Next.js & TypeScript
          </p>
        </div>
      </Container>
    </footer>
  );
}
