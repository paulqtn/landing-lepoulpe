import { requireMenu } from "@/lib/admin/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuoteEditor } from "@/components/admin/QuoteEditor";
import { mailConfigured } from "@/lib/admin/mail";
import { QUOTE_STATUT_LABELS, getQuote } from "@/lib/admin/quotes";
import { getSociete, societeManquants } from "@/lib/admin/societe";

export const dynamic = "force-dynamic";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireMenu("devis");
  const quote = await getQuote(Number((await params).id));
  if (!quote) notFound();
  const manquants = societeManquants(await getSociete());
  const blockers = [
    ...(manquants.length ? [`Mentions de la société à compléter (Tarifs et paramètres → Commissions et société) : ${manquants.join(", ")}.`] : []),
    ...(mailConfigured ? [] : ["L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)."]),
  ];
  return (
    <div className="space-y-5">
      <div>
        <Link href={quote.lead_id ? `/commercial/clients/${quote.lead_id}` : "/commercial/devis"} className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-pine-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          {quote.lead_id ? "Fiche client" : "Devis à traiter"}
        </Link>
        <h1 className="mt-2 flex flex-wrap items-center gap-3 text-2xl font-extrabold text-inkgreen">
          Devis {quote.ref}
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${quote.statut === "brouillon" ? "bg-amber-500/15 text-amber-700 ring-amber-500/30" : "bg-green-50 text-green-700 ring-green-200"}`}>
            {QUOTE_STATUT_LABELS[quote.statut]}
          </span>
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {quote.origine === "automatique" ? "Généré automatiquement à partir de la demande du site" : `Créé par ${quote.created_by ?? "—"}`} · fourniture seule, pose non comprise.
        </p>
      </div>
      <QuoteEditor
        key={`${quote.id}-${quote.statut}`}
        id={quote.id}
        quoteRef={quote.ref}
        statut={quote.statut}
        client={quote.client}
        options={quote.options}
        blockers={blockers}
        sentInfo={quote.sent_at ? `Envoyé le ${new Date(quote.sent_at).toLocaleString("fr-FR")} à ${quote.sent_to} par ${quote.sent_by}.` : null}
      />
    </div>
  );
}
