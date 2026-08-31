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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Transforme les paramètres d'entrée (cards systèmes, liens profonds) en pré-remplissage. */
function defaultsFrom(sp: Record<string, string | string[] | undefined>) {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const defaults: {
    systeme?: "rail" | "pinces" | "spider";
    cotes?: number[];
    hauteur?: string;
  } = {};

  const sys = one(sp.sys);
  if (sys === "rail" || sys === "pinces" || sys === "spider") {
    defaults.systeme = sys;
  }

  const len = Number(one(sp.len));
  if (Number.isFinite(len) && len > 0 && len <= 200) {
    defaults.cotes = [len];
  }

  const h = one(sp.h);
  if (h === "90" || h === "100" || h === "110") defaults.hauteur = h;

  return defaults;
}

export default async function DevisPage({ searchParams }: { searchParams: SearchParams }) {
  const defaults = defaultsFrom(await searchParams);
  const prefilled = Object.keys(defaults).length > 0;

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
            {prefilled
              ? "Votre configuration est déjà reportée — il ne reste que l’essentiel : votre projet et où envoyer le devis."
              : "Décrivez votre projet : l’estimation s’affiche immédiatement, et le devis détaillé arrive sous 24h. Gratuit, sans engagement."}
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <Configurator defaults={defaults} />
        </div>
      </Container>
    </main>
  );
}
