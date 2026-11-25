import { NextResponse } from "next/server";
import { dueRelances, updateLead } from "@/lib/admin/db";
import { mailConfigured, SEQ_MAX } from "@/lib/admin/mail";
import { CRON_HORAIRE } from "@/lib/admin/cron-frequence";
import { finDeJourneeParis, getRelanceSettings } from "@/lib/admin/relances";
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

  if (!(await getRelanceSettings()).active) {
    return NextResponse.json({ ok: true, traitees: 0, info: "envoi automatique désactivé dans l'onglet Relances" });
  }

  // Passage horaire : chaque relance part à son heure. Passage quotidien (offre Vercel
  // gratuite) : on envoie tout ce qui est prévu dans la journée, l'heure ne peut pas être tenue.
  const dues = await dueRelances(CRON_HORAIRE ? undefined : finDeJourneeParis());
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
