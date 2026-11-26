import { currentUser, hasMenu, peutVoirFiche, requireMenu, voitTout } from "@/lib/admin/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuoteEditor } from "@/components/admin/QuoteEditor";
import { refusAction } from "@/lib/admin/attribution";
import { getLead, listDevisATraiter } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";
import { QUOTE_STATUT_LABELS, chiffrageDepuisLead, getQuote, prixParNiveau } from "@/lib/admin/quotes";
import { getTarifsSite } from "@/lib/admin/prices";
import { niveauxDepuis } from "@/lib/admin/niveaux-prix";
import { getCoefsPrix } from "@/lib/admin/niveaux-prix-serveur";
import { getSociete, societeManquants } from "@/lib/admin/societe";

export const dynamic = "force-dynamic";

/* Titre de l'onglet : le client et le numéro du devis d'abord. */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  const quote = me && hasMenu(me, "devis") ? await getQuote(Number((await params).id)) : null;
  const fiche = quote?.lead_id ? await getLead(quote.lead_id) : null;
  if (!me || !quote || (fiche && !peutVoirFiche(me, fiche))) return { title: "Devis" };
  return { title: `${quote.client?.name ? `${quote.client.name} · ` : ""}Devis ${quote.ref}` };
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMenu("devis");
  const quote = await getQuote(Number((await params).id));
  if (!quote) notFound();
  const fiche = quote.lead_id ? await getLead(quote.lead_id) : null;
  if (fiche && !peutVoirFiche(me, fiche)) notFound();
  const lectureSeule = fiche ? refusAction(me, fiche) : null;
  // Chiffrage intégré au devis : projet de la demande, prix aux trois niveaux autorisés.
  let chiffrage = null;
  if (fiche && !lectureSeule && quote.statut === "brouillon") {
    const a = (fiche.answers ?? {}) as Record<string, unknown>;
    const c = await chiffrageDepuisLead(fiche);
    chiffrage = {
      niveaux: await prixParNiveau(fiche),
      grille: niveauxDepuis(await getCoefsPrix()),
      coef: quote.coef ? Number(quote.coef) : null,
      coefSite: (await getTarifsSite()).coefDefaut,
      projet: {
        systeme: c?.systeme ?? "rail",
        cotes: (Array.isArray(a.cotes) ? a.cotes : []).map(Number).filter((n) => Number.isFinite(n) && n > 0),
        hauteur: Number(a.hauteur) || 100,
        verre: typeof a.verre === "string" ? a.verre : "",
        verreRetenu: c?.verre ?? "",
        teinte: c?.teinte ?? "clair",
        codePostal: typeof a.codePostal === "string" ? a.codePostal : "",
      },
    };
  }
  // Devis suivant à traiter par cette personne (proposé une fois celui-ci envoyé).
  const file = quote.statut === "brouillon" ? [] : await listDevisATraiter(voitTout(me) ? undefined : me.name, 50);
  const prochain = file.find((l) => l.id !== quote.lead_id && l.devis_brouillon_id && (voitTout(me) ? l.assigned_to === me.name : true));
  const suivant = prochain?.devis_brouillon_id ? { id: prochain.devis_brouillon_id, nom: prochain.name } : null;
  const manquants = societeManquants(await getSociete());
  const blockers = [
    ...(lectureSeule ? [lectureSeule] : []),
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
      {lectureSeule && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-800">
          <strong className="text-inkgreen">Devis en lecture seule.</strong> {lectureSeule}
        </p>
      )}
      <QuoteEditor
        key={`${quote.id}-${quote.statut}`}
        id={quote.id}
        quoteRef={quote.ref}
        statut={quote.statut}
        client={quote.client}
        options={quote.options}
        blockers={blockers}
        chiffrage={chiffrage}
        ficheHref={quote.lead_id ? `/commercial/clients/${quote.lead_id}` : null}
        suivant={suivant}
        sentInfo={quote.sent_at ? `Envoyé le ${new Date(quote.sent_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} à ${quote.sent_to} par ${quote.sent_by}.` : null}
      />
    </div>
  );
}
