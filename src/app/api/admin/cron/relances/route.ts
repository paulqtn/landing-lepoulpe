import { NextResponse } from "next/server";
import { addEvent, dueRelances, updateLead } from "@/lib/admin/db";
import { mailConfigured, sendRelanceEmail } from "@/lib/admin/mail";

/**
 * Cron Vercel (voir vercel.json) : traite les relances arrivées à échéance.
 * Auth par CRON_SECRET (en-tête Authorization: Bearer …), convention Vercel.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }
  if (!mailConfigured) {
    return NextResponse.json({ ok: true, traitees: 0, info: "emails non configurés — relances à faire à la main" });
  }

  const dues = await dueRelances();
  let envoyees = 0;
  for (const lead of dues) {
    const numero = lead.relances + 1;
    if (numero > 2) {
      await updateLead(lead.id, { next_relance_at: null });
      continue;
    }
    const mail = await sendRelanceEmail(lead, numero);
    if (mail.sent) {
      await updateLead(lead.id, {
        relances: numero,
        statut: numero >= 2 ? "relance_2" : "relance_1",
        next_relance_at: numero >= 2 ? null : new Date(Date.now() + 5 * 86400_000).toISOString(),
      });
      await addEvent(lead.id, "relance_envoyee", `Relance ${numero} envoyée automatiquement`);
      envoyees++;
    } else {
      await addEvent(lead.id, "relance_echec", `Relance auto impossible : ${mail.reason}`);
      await updateLead(lead.id, { next_relance_at: new Date(Date.now() + 86400_000).toISOString() });
    }
  }
  return NextResponse.json({ ok: true, dues: dues.length, envoyees });
}
