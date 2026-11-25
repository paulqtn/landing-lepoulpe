import { NextResponse } from "next/server";
import { repFromRequest, requireMenuApi } from "@/lib/admin/auth";
import { addEvent, claimInOrder, dbConfigured, getLead, oldestPoolLead } from "@/lib/admin/db";

/* La pioche : un commercial s'attribue un lead entrant, strictement dans
   l'ordre d'arrivée — impossible de prendre une demande tant qu'une plus
   ancienne attend dans la file. */
export async function POST(req: Request) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const rep = await repFromRequest(req);
  if (!rep) return NextResponse.json({ ok: false, error: "no_rep" }, { status: 400 });
  if (!dbConfigured) return NextResponse.json({ ok: false, demo: true });

  let body: { leadId?: number };
  try {
    body = (await req.json()) as { leadId?: number };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const lead = await getLead(Number(body.leadId));
  if (!lead) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (lead.assigned_to && lead.assigned_to !== rep) {
    return NextResponse.json({ ok: false, error: "taken", by: lead.assigned_to }, { status: 409 });
  }
  if (lead.assigned_to === rep) return NextResponse.json({ ok: true });
  // Ordre d'arrivée strict : seule la plus ancienne demande de la file peut être prise.
  if (!(await claimInOrder(lead.id, rep))) {
    const first = await oldestPoolLead();
    const again = await getLead(lead.id);
    if (again?.assigned_to && again.assigned_to !== rep) return NextResponse.json({ ok: false, error: "taken", by: again.assigned_to }, { status: 409 });
    return NextResponse.json({ ok: false, error: "not_first", first: first?.name ?? null }, { status: 409 });
  }
  await addEvent(lead.id, "attribution", `Pioché par ${rep}`);
  return NextResponse.json({ ok: true });
}
