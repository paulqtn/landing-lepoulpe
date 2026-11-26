import { NextResponse } from "next/server";
import { accesAvecBoite, refuse } from "@/lib/messagerie/acces";
import { supprimerBrouillon } from "@/lib/messagerie/brouillons";

export const maxDuration = 30;

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const ok = await supprimerBrouillon(a.compte, Number((await params).id));
  return ok ? NextResponse.json({ ok: true }) : refuse("Brouillon introuvable.", 404);
}
