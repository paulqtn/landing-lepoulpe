import { NextResponse } from "next/server";
import { hasMenu, userFromRequest, voitTout, type User } from "@/lib/admin/auth";
import { compteDe, globaux, type Compte } from "./comptes";

/* Garde commune des routes de la messagerie : utilisateur connecté, menu ouvert, module actif.
   La boîte renvoyée est toujours celle de l'utilisateur connecté : aucune route ne prend
   l'identifiant d'une boîte en paramètre, ce qui interdit de lire celle d'un collègue. */

export async function acces(req: Request): Promise<{ user: User; compte: Compte | null; refus?: undefined } | { refus: NextResponse; user?: undefined; compte?: undefined }> {
  const user = await userFromRequest(req);
  if (!user) return { refus: NextResponse.json({ error: "non autorisé" }, { status: 401 }) };
  if (!hasMenu(user, "messagerie")) return { refus: NextResponse.json({ error: "Ce menu ne vous est pas ouvert." }, { status: 403 }) };
  if (!(await globaux()).actif && !voitTout(user)) return { refus: NextResponse.json({ error: "La messagerie est désactivée par l'administrateur." }, { status: 403 }) };
  return { user, compte: await compteDe(user.id) };
}

export async function accesAvecBoite(req: Request): Promise<{ user: User; compte: Compte; refus?: undefined } | { refus: NextResponse; user?: undefined; compte?: undefined }> {
  const a = await acces(req);
  if (a.refus) return a;
  if (!a.compte) return { refus: NextResponse.json({ error: "Aucune boîte mail connectée." }, { status: 409 }) };
  return { user: a.user, compte: a.compte };
}

export async function corps(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export const refuse = (error: string, status = 422) => NextResponse.json({ ok: false, error }, { status });
