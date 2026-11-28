import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Carte, EnTete } from "@/components/admin/ui";
import { AccountForm } from "@/components/admin/AccountForm";
import { ROLE_LABELS, currentUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const me = await currentUser();
  if (!me) return null;
  return (
    <div className="space-y-6">
      <EnTete titre="Mon compte" sous="Vos informations de connexion au back office." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-pine-700 text-xl font-extrabold text-white" aria-hidden="true">{me.name.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-inkgreen">{me.name}</p>
              <p className="flex items-center gap-1.5 text-xs font-bold text-pine-700"><ShieldCheck className="h-3.5 w-3.5" />{ROLE_LABELS[me.role]}</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4 text-sm text-neutral-700"><Mail className="h-4 w-4 shrink-0 text-neutral-600" /><span className="min-w-0 break-all">{me.email}</span></p>
        </section>
        <Carte icon={KeyRound} titre="Mot de passe" sous="Dix caractères minimum. Il n'est lisible par personne, pas même par un administrateur.">
          <AccountForm />
        </Carte>
      </div>
    </div>
  );
}
