import { figerMargeAuGain } from "@/lib/admin/marge";
import { refusAttribution } from "@/lib/admin/attribution";
import { NextResponse } from "next/server";
import { niveauInfo } from "@/lib/admin/niveaux";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, getLead, listEvents, STATUTS, updateLead, type Statut } from "@/lib/admin/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  return NextResponse.json({ lead, events: await listEvents(lead.id) });
}

export async function PATCH(req: Request, { params }: Params) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  let body: { statut?: string; note?: string; next_relance_at?: string | null; assigned_to?: string | null; niveau?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 });
  }

  if (body.assigned_to !== undefined) {
    const refus = await refusAttribution(g.user, lead, body.assigned_to || null);
    if (refus) return NextResponse.json({ error: refus }, { status: 409 });
    await updateLead(lead.id, { assigned_to: body.assigned_to || null });
    await addEvent(lead.id, "info", body.assigned_to ? `Assigné à ${body.assigned_to}` : "Assignation retirée");
  }

  if (body.niveau !== undefined) {
    const info = niveauInfo(body.niveau);
    if (body.niveau !== null && !info) return NextResponse.json({ error: "Score inconnu." }, { status: 422 });
    if ((lead.niveau ?? null) !== (info?.n ?? null)) {
      await updateLead(lead.id, { niveau: info?.n ?? null });
      await addEvent(lead.id, "info", info ? `Score du prospect : ${info.n} — ${info.label} (${g.user.name})` : `Score du prospect retiré (${g.user.name})`);
    }
  }

  if (typeof body.note === "string" && body.note.trim()) {
    await addEvent(lead.id, "note", body.note.trim());
  }

  if (typeof body.statut === "string" && (STATUTS as readonly string[]).includes(body.statut)) {
    const patch: { statut: Statut; next_relance_at?: string | null } = { statut: body.statut as Statut };
    if (body.statut === "gagne" || body.statut === "perdu") patch.next_relance_at = null;
    await updateLead(lead.id, patch);
    await addEvent(lead.id, "statut", `Statut → ${body.statut}`);
    if (body.statut === "gagne") await figerMargeAuGain(lead.id);
  }

  if (body.next_relance_at !== undefined && body.statut !== "gagne" && body.statut !== "perdu") {
    await updateLead(lead.id, { next_relance_at: body.next_relance_at });
    await addEvent(
      lead.id,
      "relance_programmee",
      body.next_relance_at ? `Relance programmée le ${new Date(body.next_relance_at).toLocaleDateString("fr-FR")}` : "Relance annulée",
    );
  }

  return NextResponse.json({ ok: true });
}
