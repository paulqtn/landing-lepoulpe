import { AccountForm } from "@/components/admin/AccountForm";
import { ROLE_LABELS, currentUser } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon compte" };

export default async function ComptePage() {
  const me = await currentUser();
  if (!me) return null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Mon compte</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {me.name} · {me.email} · {ROLE_LABELS[me.role]}
        </p>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-base font-extrabold text-inkgreen">Mot de passe</h2>
        <AccountForm />
      </section>
    </div>
  );
}
