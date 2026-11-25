import { NextResponse } from "next/server";
import { audit, requireRole } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { recalculerMarge, saisirMarge } from "@/lib/admin/marge";

/* Marge d'une affaire : recalcul ou saisie manuelle. Rôles d'administration uniquement
   (le coût d'achat n'est jamais montré aux commerciaux). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireRole(req, ["superadmin", "admin"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ ok: false, error: "introuvable" }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const before = { vente_ht: lead.vente_ht, cout_achat: lead.cout_achat, marge_brute: lead.marge_brute, marge_source: lead.marge_source };
  if (body.action === "recalculer") {
    const m = await recalculerMarge(lead.id);
    await audit(g.user.name, "marge_recalcul", "lead", lead.id, before, m);
    return NextResponse.json({ ok: true });
  }
  const venteHt = Number(body.venteHt);
  const coutAchat = Number(body.coutAchat);
  if (![venteHt, coutAchat].every((n) => Number.isFinite(n) && n >= 0 && n <= 10_000_000))
    return NextResponse.json({ ok: false, error: "Montants invalides." }, { status: 422 });
  await saisirMarge(lead.id, venteHt, coutAchat, g.user.name);
  await audit(g.user.name, "marge_saisie", "lead", lead.id, before, { venteHt, coutAchat });
  return NextResponse.json({ ok: true });
}
