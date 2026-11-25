import { refusAction } from "@/lib/admin/attribution";
import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { ensureDraftForLead } from "@/lib/admin/quotes";

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

  const quote = await ensureDraftForLead(lead, user.name, "manuel");
  return NextResponse.json({ ok: true, id: quote.id, ref: quote.ref });
}
