import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/* Squelette : les conditions commerciales réelles (prix, livraison,
   garanties, rétractation…) doivent être fournies par la société.
   Page en noindex tant que le contenu n'est pas définitif. */

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de ${site.name}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/cgv" },
};

const H2 = "mt-10 text-xl font-extrabold tracking-tight text-inkgreen";
const P = "mt-3 leading-relaxed text-neutral-600";

export default function CGV() {
  return (
    <main className="bg-white">
      <Container className="max-w-3xl py-14 sm:py-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Informations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
          Conditions générales de vente
        </h1>

        <p className={P}>
          [Document à compléter avec les conditions commerciales de la société : champ d&rsquo;application,
          devis et commande, prix et modalités de paiement, fabrication sur mesure et droit de rétractation,
          délais et modalités de livraison, réception et réserves, garanties, responsabilité, litiges et
          droit applicable.]
        </p>

        <h2 className={H2}>Contact</h2>
        <p className={P}>
          Pour toute question sur nos conditions de vente : {site.email} — {site.phone}.
        </p>
      </Container>
    </main>
  );
}
