import { NextResponse } from "next/server";
import { userFromRequest } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { ensureDraftForLead } from "@/lib/admin/quotes";

/* Prépare (ou retrouve) le brouillon de devis d'une demande. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  let body: { leadId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const lead = await getLead(Number(body.leadId));
  if (!lead) return NextResponse.json({ ok: false, error: "Demande introuvable." }, { status: 404 });
  const quote = await ensureDraftForLead(lead, user.name, "manuel");
  return NextResponse.json({ ok: true, id: quote.id, ref: quote.ref });
}
