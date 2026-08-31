import type { Metadata } from "next";
import { CalculateurMGK } from "@/components/CalculateurMGK";
import { Container } from "@/components/ui/Container";

/* Outil interne MGK — non indexé, absent des menus et du sitemap. */

export const metadata: Metadata = {
  title: "Calculateur interne",
  robots: { index: false, follow: false, nocache: true },
};

export default function CalculateurPage() {
  return (
    <main className="bg-mist">
      <Container className="py-12 sm:py-16">
        <div className="mb-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">
            Outil interne MGK
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
            Calculateur de chiffrage fourniture
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Calepinage, verre, supports, conditionnement et transports — coût d&apos;achat,
            prix de vente HT/TTC et prix au ml, selon les règles internes.
          </p>
        </div>
        <CalculateurMGK />
      </Container>
    </main>
  );
}
