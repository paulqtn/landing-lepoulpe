import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center bg-mist">
      <Container className="py-20 text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-pine-700">Erreur 404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-inkgreen sm:text-5xl">
          Cette page n’existe pas.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-neutral-600">
          Le lien est peut-être ancien — retrouvez tous nos garde-corps et votre devis en 1 minute.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/devis"
            className="group inline-flex items-center gap-2 rounded-full bg-pine-700 px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pine-600"
          >
            Estimer mon projet
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-inkgreen shadow-card transition-all hover:-translate-y-0.5"
          >
            Retour à l’accueil
          </Link>
        </div>
      </Container>
    </main>
  );
}
