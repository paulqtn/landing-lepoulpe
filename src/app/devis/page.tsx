import type { Metadata } from "next";
import { Configurator } from "@/components/Configurator";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Devis garde-corps gratuit en 1 minute",
  description:
    "Configurez votre garde-corps (verre, alu, inox) en 1 minute et recevez un devis détaillé sous 24h. Estimation immédiate, gratuit et sans engagement.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <main className="bg-mist">
      <Container className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">
            {site.name} · devis gratuit
          </p>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
            Votre garde-corps, estimé en 1 minute.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            Décrivez votre projet : l’estimation s’affiche immédiatement, et le
            devis détaillé arrive sous 24h. Gratuit, sans engagement.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <Configurator />
        </div>
      </Container>
    </main>
  );
}
