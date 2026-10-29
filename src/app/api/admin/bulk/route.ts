import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addEvent, getLead, STATUTS, updateLead, type Statut } from "@/lib/admin/db";
import { envoyerRelance } from "@/lib/admin/sequence";

/** Actions en masse sur une sélection de leads. */
export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  let body: { ids?: unknown; action?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 });
  }
  const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 200);
  if (!ids.length || !body.action) return NextResponse.json({ error: "paramètres invalides" }, { status: 422 });

  let ok = 0;
  const erreurs: string[] = [];
  for (const id of ids) {
    const lead = await getLead(id);
    if (!lead) continue;
    if (body.action === "statut" && typeof body.value === "string" && (STATUTS as readonly string[]).includes(body.value)) {
      const statut = body.value as Statut;
      await updateLead(id, { statut, ...(statut === "gagne" || statut === "perdu" ? { next_relance_at: null } : {}) });
      await addEvent(id, "statut", `Statut → ${statut} (action groupée)`);
      ok++;
    } else if (body.action === "assign" && typeof body.value === "string") {
      await updateLead(id, { assigned_to: body.value || null });
      await addEvent(id, "info", body.value ? `Assigné à ${body.value}` : "Assignation retirée");
      ok++;
    } else if (body.action === "relance") {
      const r = await envoyerRelance(lead, "manuel");
      if (r.ok) ok++;
      else erreurs.push(`#${id}: ${r.reason}`);
    }
  }
  return NextResponse.json({ ok: true, traites: ok, erreurs });
}
