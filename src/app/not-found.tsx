import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OctopusMark } from "@/components/Logo";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas">
      <Container className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-glow">
          <OctopusMark className="h-12 w-12" />
        </span>
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-poulpe-700">
          Erreur 404
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
          Cette page a pris la fuite.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-slate-600">
          Comme une encre de poulpe, elle s’est volatilisée. Reprenons depuis un
          endroit sûr.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-poulpe-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-poulpe-500/30 transition-all hover:-translate-y-0.5 hover:bg-poulpe-600"
          >
            Voir nos landing pages
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:ring-poulpe-300"
          >
            Retour à l’accueil
          </Link>
        </div>
      </Container>
    </main>
  );
}
