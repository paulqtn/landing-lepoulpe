import { NextResponse } from "next/server";
import { addEvent, getLeadByToken, updateLead } from "@/lib/admin/db";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await getLeadByToken(token);
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  await updateLead(lead.id, { statut: "a_rappeler", next_relance_at: null });
  await addEvent(lead.id, "devis_accepte", "✅ Le client souhaite valider son devis — l'appeler pour confirmer les cotes");
  return NextResponse.json({ ok: true });
}
