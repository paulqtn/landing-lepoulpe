import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Container } from "@/components/ui/Container";
import { getGuide, guides } from "@/lib/guides";
import { site } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    alternates: { canonical: `/guides/${g.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const others = guides.filter((x) => x.slug !== g.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.title,
        description: g.metaDescription,
        author: { "@type": "Organization", name: site.name },
        publisher: { "@type": "Organization", name: site.name },
        mainEntityOfPage: `${site.url}/guides/${g.slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: g.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-neutral-200 bg-mist">
        <Container className="py-12 sm:py-16">
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/guides" className="hover:text-pine-700">Guides</Link>
          </nav>
          <h1 className="mt-6 max-w-3xl text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-inkgreen sm:text-[2.6rem]">
            {g.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600">{g.excerpt}</p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <article className="max-w-3xl">
            {g.sections.map((s) => (
              <section key={s.heading} className="mt-10 first:mt-0">
                <h2 className="text-xl font-extrabold tracking-tight text-inkgreen sm:text-2xl">{s.heading}</h2>
                <p className="mt-3 leading-relaxed text-neutral-700">{s.body}</p>
              </section>
            ))}

            <section className="mt-12 border-t border-neutral-200 pt-10">
              <h2 className="text-xl font-extrabold text-inkgreen sm:text-2xl">Questions fréquentes</h2>
              <div className="mt-6">
                <FaqAccordion faq={g.faq} />
              </div>
            </section>
          </article>

          {/* rail latéral */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="relative overflow-hidden rounded-2xl bg-pine-900 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="relative">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-300">Devis gratuit</p>
                <p className="mt-2 text-lg font-extrabold leading-snug">Votre garde-corps, estimé en 1 minute.</p>
                <Link
                  href="/devis"
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-pine-800 transition-all hover:-translate-y-0.5"
                >
                  <ClipboardList className="h-4 w-4" />
                  Estimer mon projet
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">À lire aussi</p>
              <ul className="mt-4 space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/guides/${o.slug}`} className="text-sm font-semibold leading-snug text-inkgreen transition hover:text-pine-700">
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </section>
    </main>
  );
}
