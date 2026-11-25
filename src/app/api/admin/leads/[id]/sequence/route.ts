import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, adminQuery as q, getLead, updateLead } from "@/lib/admin/db";
import { dateRelance, getRelanceSettings } from "@/lib/admin/relances";
import { sequenceActive, type Statut } from "@/lib/admin/statuts";

/* Pilotage à la main des relances automatiques d'un client :
   - pause      : plus aucun e-mail ne part, la séquence garde sa place ;
   - supprimer  : les relances prévues sont retirées ;
   - declencher : (re)lance la séquence — aussi utilisé pour reprendre après une pause
                  ou changer la date de la prochaine relance. */

const jour = (d: Date) => d.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "long" });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ ok: false, error: "introuvable" }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const refus = (error: string) => NextResponse.json({ ok: false, error }, { status: 409 });
  const enCours = sequenceActive(lead.statut) && Boolean(lead.next_relance_at);

  if (body.action === "pause") {
    if (!enCours) return refus("Aucune relance automatique n'est en cours pour ce client.");
    await updateLead(lead.id, { next_relance_at: null, sequence_pause_at: new Date().toISOString() });
    await addEvent(lead.id, "info", `Relances automatiques mises en pause par ${g.user.name}`);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "supprimer") {
    if (!enCours && !lead.sequence_pause_at) return refus("Aucune relance automatique n'est prévue pour ce client.");
    await updateLead(lead.id, { next_relance_at: null, sequence_pause_at: null });
    await addEvent(lead.id, "info", `Relances automatiques supprimées par ${g.user.name}`);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "declencher") {
    if (lead.statut === "gagne" || lead.statut === "perdu") return refus("Affaire close : aucune relance ne peut être programmée.");
    if (lead.relances >= 3) return refus("Les 3 relances ont déjà été envoyées.");
    const envoye = await q(
      "SELECT 1 FROM quotes WHERE lead_id = $1 AND statut = 'envoye' UNION ALL SELECT 1 FROM lead_events WHERE lead_id = $1 AND type = 'devis_envoye' LIMIT 1",
      [lead.id],
    );
    if (!envoye.length) return refus("Aucun devis n'a encore été envoyé à ce client : les relances parlent de son devis.");
    let next: Date | null;
    if (body.date) {
      next = new Date(String(body.date));
      if (Number.isNaN(next.getTime()) || next.getTime() < Date.now() - 60_000) return refus("Choisissez une date à venir.");
    } else next = dateRelance(await getRelanceSettings(), lead.relances + 1);
    if (!next) return refus("Les relances automatiques sont désactivées dans l'onglet Relances.");
    const statut = (lead.relances === 0 ? "devis_envoye" : `relance_${lead.relances}`) as Statut;
    // Programmer une date lève la pause (règle de updateLead).
    await updateLead(lead.id, { statut, next_relance_at: next.toISOString(), rappel_at: null });
    await addEvent(lead.id, "relance_programmee", `Relances automatiques ${lead.sequence_pause_at ? "reprises" : "déclenchées"} par ${g.user.name} — relance ${lead.relances + 1} le ${jour(next)}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 400 });
}
