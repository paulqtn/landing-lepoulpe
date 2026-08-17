import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { combos, materials, usages } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Tous nos garde-corps : verre, aluminium, inox — par usage",
  description:
    "Explorez tous nos garde-corps par matériau (verre, aluminium, inox) et par usage (piscine, escalier, balcon, terrasse…). Sur-mesure ou en kit, devis en 24h.",
  alternates: { canonical: "/garde-corps" },
};

export default function GardeCorpsHub() {
  return (
    <main>
      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-14 sm:py-20">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">Catalogue</p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
            Tous nos garde-corps, par matériau et par usage.
          </h1>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <h2 className="text-2xl font-extrabold text-inkgreen">Par matériau</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {materials.map((m) => (
              <Link
                key={m.slug}
                href={`/garde-corps/${m.slug}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
              >
                <h3 className="flex items-center gap-1.5 text-xl font-extrabold text-inkgreen group-hover:text-pine-700">
                  {m.title}
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:text-pine-600" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{m.benefits[0].desc}</p>
              </Link>
            ))}
          </div>

          <h2 className="mt-14 text-2xl font-extrabold text-inkgreen">Par usage</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usages.map((u) => (
              <Link
                key={u.slug}
                href={`/garde-corps/${u.slug}`}
                className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-inkgreen transition-all hover:-translate-y-0.5 hover:border-pine-300 hover:text-pine-700"
              >
                {u.title}
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-pine-600" />
              </Link>
            ))}
          </div>

          <h2 className="mt-14 text-2xl font-extrabold text-inkgreen">Toutes les combinaisons</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {combos.map((c) => (
              <Link
                key={c.slug}
                href={`/garde-corps/${c.slug}`}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
              >
                {c.title}
              </Link>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/devis"
              className="group inline-flex items-center gap-2.5 rounded-full bg-pine-700 py-4 pl-7 pr-6 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pine-600"
            >
              Estimer mon projet en 1 min
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
