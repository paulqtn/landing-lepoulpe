import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addEvent, getLead, listEvents, STATUTS, updateLead, type Statut } from "@/lib/admin/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  return NextResponse.json({ lead, events: await listEvents(lead.id) });
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  let body: { statut?: string; note?: string; next_relance_at?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 });
  }

  if (typeof body.note === "string" && body.note.trim()) {
    await addEvent(lead.id, "note", body.note.trim());
  }

  if (typeof body.statut === "string" && (STATUTS as readonly string[]).includes(body.statut)) {
    const patch: { statut: Statut; next_relance_at?: string | null } = { statut: body.statut as Statut };
    if (body.statut === "gagne" || body.statut === "perdu") patch.next_relance_at = null;
    await updateLead(lead.id, patch);
    await addEvent(lead.id, "statut", `Statut → ${body.statut}`);
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
