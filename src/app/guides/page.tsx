import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { guides } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides garde-corps : normes, prix, pose, matériaux",
  description:
    "Tous nos guides d'expert sur les garde-corps : hauteur réglementaire, normes NF P01-012, prix au ml, kit ou sur-mesure, pose, choix du matériau.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <main>
      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-14 sm:py-20">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">Guides &amp; conseils</p>
          <h1 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
            Tout comprendre avant de choisir votre garde-corps.
          </h1>
          <p className="mt-4 max-w-xl text-neutral-600">
            Normes, prix, pose, matériaux : des guides d’expert, sans jargon
            inutile, pour décider en connaissance de cause.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Guide</span>
                <h2 className="mt-2.5 flex-1 text-lg font-extrabold leading-snug text-inkgreen transition-colors group-hover:text-pine-700">
                  {g.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{g.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                  Lire le guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
