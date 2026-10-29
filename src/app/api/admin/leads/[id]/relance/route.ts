import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addEvent, getLead, updateLead } from "@/lib/admin/db";
import { sendRelanceEmail } from "@/lib/admin/mail";

/** Envoie la relance n° suivant immédiatement. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  const numero = lead.relances + 1;
  const mail = await sendRelanceEmail(lead, numero);
  if (!mail.sent) {
    await addEvent(lead.id, "relance_echec", `Relance ${numero} impossible : ${mail.reason}`);
    return NextResponse.json({ ok: false, error: mail.reason }, { status: 502 });
  }
  await updateLead(lead.id, {
    relances: numero,
    statut: numero >= 2 ? "relance_2" : "relance_1",
    next_relance_at: numero >= 2 ? null : new Date(Date.now() + 5 * 86400_000).toISOString(),
  });
  await addEvent(lead.id, "relance_envoyee", `Relance ${numero} envoyée par email`);
  return NextResponse.json({ ok: true, numero });
}
