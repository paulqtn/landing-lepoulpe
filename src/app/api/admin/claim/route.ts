import { NextResponse } from "next/server";
import { repFromRequest, requireAdmin } from "@/lib/admin/auth";
import { addEvent, dbConfigured, getLead, updateLead } from "@/lib/admin/db";

/* La pioche : un commercial s'attribue un lead entrant. Premier arrivé,
   premier servi — si quelqu'un l'a pris entre-temps, on le dit. */
export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const rep = repFromRequest(req);
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
  await updateLead(lead.id, { assigned_to: rep });
  await addEvent(lead.id, "attribution", `Pioché par ${rep}`);
  return NextResponse.json({ ok: true });
}
