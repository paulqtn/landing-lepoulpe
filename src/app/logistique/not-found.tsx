import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function LogistiqueNotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-pine-50 text-pine-700">
        <Lock className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-inkgreen">Cette page ne vous est pas accessible</h1>
      <p className="mt-2 text-sm text-neutral-600">Elle n&rsquo;existe plus, ou elle est réservée à un autre rôle. Si vous pensez devoir y accéder, demandez à votre administrateur.</p>
      <Link href="/logistique" className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600">
        Revenir aux tâches du jour <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
