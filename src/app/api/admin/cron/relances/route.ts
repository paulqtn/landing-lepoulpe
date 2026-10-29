import { NextResponse } from "next/server";
import { dueRelances, updateLead } from "@/lib/admin/db";
import { mailConfigured, SEQ_MAX } from "@/lib/admin/mail";
import { envoyerRelance } from "@/lib/admin/sequence";

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
    if (lead.relances >= SEQ_MAX) {
      await updateLead(lead.id, { next_relance_at: null });
      continue;
    }
    const r = await envoyerRelance(lead, "auto");
    if (r.ok) envoyees++;
    else await updateLead(lead.id, { next_relance_at: new Date(Date.now() + 86400_000).toISOString() });
  }
  return NextResponse.json({ ok: true, dues: dues.length, envoyees });
}
