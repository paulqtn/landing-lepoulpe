import { requireAdmin } from "@/lib/admin/auth";
import { renderQuotePdf } from "@/lib/admin/quote-pdf";
import { getQuote } from "@/lib/admin/quotes";
import { getSociete, type Societe } from "@/lib/admin/societe";

/* Téléchargement du PDF. Un devis envoyé est rendu avec les mentions figées à l'envoi. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard) return guard;
  const quote = await getQuote(Number((await params).id));
  if (!quote) return Response.json({ error: "introuvable" }, { status: 404 });
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
