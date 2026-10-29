import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { envoyerRelance } from "@/lib/admin/sequence";

/** Envoie la relance suivante de la séquence immédiatement. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  const r = await envoyerRelance(lead, "manuel");
  if (!r.ok) return NextResponse.json({ ok: false, error: r.reason }, { status: 502 });
  return NextResponse.json({ ok: true, numero: r.numero });
}
