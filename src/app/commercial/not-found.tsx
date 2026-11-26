import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

/* Page introuvable ou fiche non accessible, dans le back office :
   on reste dans l'outil, avec une explication et un chemin de retour. */
export default function BackOfficeNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-pine-50 text-pine-700">
        <Lock className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-inkgreen">Cette page ne vous est pas accessible</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Soit elle n&rsquo;existe plus, soit elle concerne un client suivi par un collègue ou un écran réservé à l&rsquo;administration.
        Si vous pensez devoir y accéder, demandez à votre administrateur.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Link href="/commercial" className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600">
          Revenir à l&rsquo;accueil <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/commercial/clients" className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">
          Mes clients
        </Link>
      </div>
    </section>
  );
}
