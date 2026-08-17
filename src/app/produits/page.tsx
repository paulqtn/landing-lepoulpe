import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { materials } from "@/lib/catalog";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Kits garde-corps en direct usine : verre, alu, inox",
  description:
    "Toute la gamme de kits garde-corps à prix d'usine : verre autoportant, aluminium thermolaqué, inox 304/316. Prix au ml affichés, devis en 24h.",
  alternates: { canonical: "/produits" },
};

export default function ProduitsPage() {
  return (
    <main>
      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-14 sm:py-20">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">Kits &amp; produits</p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
            La gamme, à prix d’usine.
          </h1>
          <p className="mt-4 max-w-xl text-neutral-600">
            Des kits prêts à poser, recoupables et conformes NF P01-012 — et le
            sur-mesure d’usine pour tout le reste.
          </p>
        </Container>
      </section>

      {materials.map((m) => {
        const list = products.filter((p) => p.material === m.material);
        if (list.length === 0) return null;
        return (
          <section key={m.slug} className="border-b border-neutral-100 py-14 sm:py-16">
            <Container>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-2xl font-extrabold text-inkgreen">{m.title}s</h2>
                <Link href={`/garde-corps/${m.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                  Tout savoir sur le {m.name.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/produits/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                  >
                    {p.badge && (
                      <span className="mb-3 w-fit rounded-full bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950">
                        {p.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">{p.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-neutral-500">{p.desc}</p>
                    <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
                      <span className="text-xl font-extrabold text-pine-700">
                        dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-pine-700">
                        Voir la fiche
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </main>
  );
}
