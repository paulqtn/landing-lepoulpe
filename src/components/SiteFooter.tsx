import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { materials, usages } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import { phoneHref, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-pine-950 text-pine-100">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-extrabold text-white">{site.name}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-pine-300">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pine-100/70">
              Garde-corps en verre, aluminium et inox — sur-mesure au millimètre
              ou en kit, conformes NF P01-012, livrés partout en France.
            </p>
            <div className="mt-6 space-y-2.5 text-sm">
              <a href={phoneHref} className="flex items-center gap-2.5 font-semibold text-white transition hover:text-green-300">
                <Phone className="h-4 w-4 text-green-500" />
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 text-pine-100/80 transition hover:text-white">
                <Mail className="h-4 w-4 text-pine-400" />
                {site.email}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-pine-300">Matériaux</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {materials.map((m) => (
                <li key={m.slug}>
                  <Link href={`/garde-corps/${m.slug}`} className="text-pine-100/80 transition hover:text-white">
                    {m.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/produits" className="text-pine-100/80 transition hover:text-white">
                  Kits &amp; produits
                </Link>
              </li>
              <li>
                <Link href="/devis" className="font-semibold text-green-300 transition hover:text-green-200">
                  Devis en 1 min →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-pine-300">Par usage</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {usages.map((u) => (
                <li key={u.slug}>
                  <Link href={`/garde-corps/${u.slug}`} className="text-pine-100/80 transition hover:text-white">
                    Garde-corps {u.name.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-pine-300">Guides &amp; conseils</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {guides.slice(0, 6).map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="text-pine-100/80 transition hover:text-white">
                    {g.title.length > 48 ? `${g.title.slice(0, 46)}…` : g.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/guides" className="font-semibold text-white transition hover:text-green-300">
                  Tous les guides →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-pine-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName}. Tous droits réservés.</p>
          <p className="font-mono uppercase tracking-[0.15em]">Conforme NF P01-012 · Direct usine</p>
        </div>
      </div>
    </footer>
  );
}
