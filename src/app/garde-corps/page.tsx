import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { catalogPath, usages } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Tous nos garde-corps en verre, par usage",
  description:
    "Explorez tous nos garde-corps en verre par usage : piscine, escalier, balcon, terrasse, mezzanine, fenêtre… Sur-mesure ou en kit, devis en 24h.",
  alternates: { canonical: "/garde-corps" },
};

export default function GardeCorpsHub() {
  return (
    <main>
      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-14 sm:py-20">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">Catalogue</p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
            Tous nos garde-corps en verre, par usage.
          </h1>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <h2 className="text-2xl font-extrabold text-inkgreen">Par usage</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usages.map((u) => (
              <Link
                key={u.slug}
                href={catalogPath(u.slug)}
                className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 text-sm font-bold text-inkgreen transition-all hover:-translate-y-0.5 hover:border-pine-300 hover:text-pine-700"
              >
                {u.title}
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-pine-600" />
              </Link>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/generateur"
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
