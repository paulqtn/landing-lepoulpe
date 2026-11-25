import { peutVoirFiche, requireMenuApi } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { renderQuotePdf } from "@/lib/admin/quote-pdf";
import { getQuote } from "@/lib/admin/quotes";
import { getSociete, type Societe } from "@/lib/admin/societe";

/* Téléchargement du PDF. Un devis envoyé est rendu avec les mentions figées à l'envoi. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const quote = await getQuote(Number((await params).id));
  const fiche = quote?.lead_id ? await getLead(quote.lead_id) : null;
  if (!quote || (fiche && !peutVoirFiche(g.user, fiche))) return Response.json({ error: "introuvable" }, { status: 404 });
  const frozen = (quote.snapshot as { societe?: Societe } | null)?.societe;
  const pdf = await renderQuotePdf(quote, frozen ?? (await getSociete()));
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${new URL(req.url).searchParams.has("apercu") ? "inline" : "attachment"}; filename="Devis-${quote.ref}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
