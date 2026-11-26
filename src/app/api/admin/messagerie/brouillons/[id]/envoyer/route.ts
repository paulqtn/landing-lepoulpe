import { NextResponse } from "next/server";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { envoyerBrouillon } from "@/lib/messagerie/brouillons";

export const maxDuration = 60;

/** Envoi d'un brouillon : uniquement sur validation explicite du commercial (confirmation exigée). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const b = await corps(req);
  if (b?.confirme !== true) return refuse("L'envoi doit être confirmé par le commercial.", 400);
  try {
    await envoyerBrouillon(a.compte, Number((await params).id), a.user.name);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return refuse(e instanceof Error ? e.message : "Envoi impossible.", 422);
  }
}
