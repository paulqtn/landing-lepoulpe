import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, getLead, updateLead } from "@/lib/admin/db";
import { sendDevisEmail } from "@/lib/admin/mail";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  const mail = await sendDevisEmail(lead);
  if (!mail.sent) {
    await addEvent(lead.id, "devis_echec", `Envoi manuel impossible : ${mail.reason}`);
    return NextResponse.json({ ok: false, error: mail.reason }, { status: 502 });
  }
  await updateLead(lead.id, {
    statut: lead.statut === "nouveau" ? "devis_envoye" : lead.statut,
    next_relance_at: new Date(Date.now() + 2 * 86400_000).toISOString(),
  });
  await addEvent(lead.id, "devis_envoye", "Email de devis envoyé manuellement");
  return NextResponse.json({ ok: true });
}
