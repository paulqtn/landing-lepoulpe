import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Ruler, Truck, Wrench } from "lucide-react";
import { Configurator } from "@/components/Configurator";
import { MaterialScene } from "@/components/Illustrations";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { products } from "@/lib/products";
import { site } from "@/lib/site";

/* ================================================================== */
/*  Page dédiée aux kits de garde-corps en verre — prêts à poser.      */
/* ================================================================== */

export const metadata: Metadata = {
  title: "Kits de garde-corps en verre — prêts à poser, direct usine",
  description:
    "Kits complets de garde-corps en verre : verre feuilleté de sécurité, fixations, visserie et notice de pose. Prix direct usine, livrés partout en France.",
  alternates: { canonical: "/kits-garde-corps-verre" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: `${site.url}/kits-garde-corps-verre`,
    siteName: site.name,
    title: "Kits de garde-corps en verre — prêts à poser, direct usine",
    description:
      "Kits complets de garde-corps en verre : verre feuilleté, fixations, visserie et notice de pose. Prix direct usine, livraison partout en France.",
  },
};

const avantages = [
  { icon: Package, title: "Tout est dans le kit", desc: "Verre feuilleté découpé, fixations, visserie et notice de pose : rien à racheter." },
  { icon: Wrench, title: "Pose accessible", desc: "Conçus pour l'autoconstruction — un conseiller reste joignable à chaque étape." },
  { icon: Ruler, title: "Ajustables à vos cotes", desc: "Dimensions standard en stock, découpe sur mesure lancée dès la commande." },
  { icon: Truck, title: "Livraison rapide", desc: "Expédiés partout en France métropolitaine, sous 10 jours depuis nos stocks." },
];

export default function KitsPage() {
  const kits = products.filter((p) => p.material === "verre" && p.slug.startsWith("kit-"));

  return (
    <main>
      <PageHero
        kicker="Nos kits"
        title="Kits de garde-corps en verre"
        intro="Des kits complets prêts à poser : verre feuilleté de sécurité, fixations, visserie et notice — au prix direct usine, livrés partout en France."
        image={{
          src: "/verre.jpeg",
          alt: "Garde-corps en verre sur pinces inox le long d'une promenade face à la mer",
          label: "Kit verre · pinces inox",
          title: "Front de mer",
        }}
        estimerHref="#estimation"
        breadcrumb={
          <nav aria-label="Fil d’Ariane" className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400">
            <Link href="/" className="hover:text-pine-700">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-600">Kits garde-corps en verre</span>
          </nav>
        }
      />

      {/* pourquoi un kit */}
      <section className="py-14 sm:py-20">
        <Container>
          <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
            Pourquoi choisir un kit ?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {avantages.map((a, i) => (
              <Reveal key={a.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-50 text-pine-700">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-extrabold text-inkgreen">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{a.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* la gamme de kits */}
      <section className="border-y border-neutral-200 bg-mist py-14 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-inkgreen sm:text-3xl">
              La gamme de kits verre
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-500">
              Quatre kits éprouvés, du plus accessible au tout-verre — chacun avec sa fiche détaillée.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kits.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/produits/${p.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-elevated"
                >
                  <div className="relative h-32 border-b border-neutral-100">
                    {p.photo ? (
                      <Image src={p.photo} alt="" fill sizes="20rem" className="object-cover" />
                    ) : (
                      <MaterialScene material={p.material} className="h-full" />
                    )}
                    {p.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-pine-950 shadow-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      Kit verre
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug text-inkgreen transition-colors group-hover:text-pine-700">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">
                      {p.specs[0]} · {p.specs[1]}
                    </p>
                    <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-3.5">
                      <span className="text-lg font-extrabold text-pine-700">
                        dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-pine-700">
                        Voir
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* maillage vers le sur-mesure */}
          <p className="mt-8 text-sm text-neutral-500">
            Plutôt du sur-mesure au millimètre ?{" "}
            <Link href="/produits/garde-corps-verre-sur-rail" className="font-bold text-pine-700 hover:underline">
              Verre sur rail
            </Link>
            ,{" "}
            <Link href="/produits/garde-corps-verre-sur-pinces" className="font-bold text-pine-700 hover:underline">
              sur pinces
            </Link>{" "}
            ou{" "}
            <Link href="/produits/garde-corps-verre-avec-spider" className="font-bold text-pine-700 hover:underline">
              avec spider
            </Link>{" "}
            — configurez directement sur la fiche.
          </p>
        </Container>
      </section>

      {/* générateur */}
      <section id="estimation" className="py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Devis express</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
              Votre kit au juste prix, chiffré en 1 minute.
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-neutral-500">
              Répondez à quelques questions —{" "}
              <strong className="font-semibold text-inkgreen">votre tarif exact s’affiche à la fin</strong>.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-5xl">
            <Configurator source="configurateur-kits" />
          </div>
        </Container>
      </section>
    </main>
  );
}
