import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { dbConfigured, getLead, addEvent } from "@/lib/admin/db";
import {
  advanceOrder,
  advanceShipment,
  assignOrderToShipment,
  createOrderFromLead,
  createShipment,
  moveStock,
} from "@/lib/admin/logistics";

/* Actions du pôle gestion — une seule route, gardée par la session admin.
   En mode démo (pas de base), tout renvoie { demo: true } sans rien écrire. */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!dbConfigured) return NextResponse.json({ ok: false, demo: true });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = body.action;
  try {
    if (action === "order_create") {
      const lead = await getLead(Number(body.leadId));
      if (!lead) return NextResponse.json({ ok: false, error: "lead_not_found" }, { status: 404 });
      const r = await createOrderFromLead(lead);
      if (r.ok) await addEvent(lead.id, "commande", `Commande ${r.ref} créée au pôle gestion`);
      return NextResponse.json(r);
    }
    if (action === "order_advance") return NextResponse.json(await advanceOrder(Number(body.id)));
    if (action === "order_assign")
      return NextResponse.json(await assignOrderToShipment(Number(body.id), body.shipmentId ? Number(body.shipmentId) : null));
    if (action === "stock_move")
      return NextResponse.json(await moveStock(Number(body.itemId), Number(body.delta), String(body.motif ?? "")));
    if (action === "shipment_create")
      return NextResponse.json(
        await createShipment({
          transporteur: String(body.transporteur ?? ""),
          departement: String(body.departement ?? ""),
          datePrevue: String(body.datePrevue ?? ""),
        }),
      );
    if (action === "shipment_advance") return NextResponse.json(await advanceShipment(Number(body.id)));
    return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  } catch (e) {
    console.error("[logistics]", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
