import { refusAction } from "@/lib/admin/attribution";
import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { duplicateQuote, ensureDraftForLead, quotesForLead } from "@/lib/admin/quotes";

/* Prépare (ou retrouve) le brouillon de devis d'une demande. */
export async function POST(req: Request) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const user = g.user;
  let body: { leadId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const lead = await getLead(Number(body.leadId));
  if (!lead) return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });
  const refusFiche = refusAction(g.user, lead);
  if (refusFiche) return NextResponse.json({ ok: false, error: refusFiche }, { status: 403 });

  // Un brouillon existe : on le rouvre. Sinon, si un devis est déjà parti, on en fait une nouvelle
  // version (le prix négocié est conservé) ; à défaut seulement, un devis neuf depuis la demande.
  const existants = await quotesForLead(lead.id);
  const brouillon = existants.find((x) => x.statut === "brouillon");
  const envoye = existants.find((x) => x.statut === "envoye");
  const quote = brouillon ?? (envoye ? await duplicateQuote(envoye.id, user.name) : null) ?? (await ensureDraftForLead(lead, user.name, "manuel"));
  return NextResponse.json({ ok: true, id: quote.id, ref: quote.ref });
}
