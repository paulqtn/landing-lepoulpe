import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProspectForm } from "@/components/admin/ProspectForm";
import { requireMenu } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/* Nouveau prospect saisi à la main (appel direct, recommandation…). */
export default async function NouveauProspectPage({ searchParams }: { searchParams: Promise<{ nom?: string; email?: string; telephone?: string }> }) {
  const p = await searchParams;
  const depart = { name: (p.nom ?? "").slice(0, 120), email: (p.email ?? "").slice(0, 200), phone: (p.telephone ?? "").slice(0, 30) };
  await requireMenu("clients");
  return (
    <div className="max-w-4xl space-y-5">
      <Link href="/commercial/clients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 transition hover:text-inkgreen">
        <ArrowLeft className="h-4 w-4" />
        Tous les clients
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Nouveau prospect</h1>
        <p className="mt-1 text-sm text-neutral-600">Pour un appel direct ou un contact hors site. La fiche vous est attribuée : elle ne passe pas par la file des demandes.</p>
      </div>
      <ProspectForm depart={depart} />
    </div>
  );
}
