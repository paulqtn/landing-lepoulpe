import { NextResponse } from "next/server";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { deposer, enregistrerBrouillon } from "@/lib/messagerie/brouillons";
import { erreurLisible } from "@/lib/messagerie/imap";

export const maxDuration = 45;

/** Enregistre le brouillon du commercial et le dépose aussitôt dans le dossier Brouillons de sa boîte. */
export async function POST(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const b = await corps(req);
  if (!b || typeof b.corps !== "string") return refuse("Brouillon illisible.", 400);
  const d = await enregistrerBrouillon(a.compte, {
    id: Number(b.id) || undefined,
    messageId: Number(b.messageId) || null,
    dest: String(b.dest ?? ""),
    cc: String(b.cc ?? ""),
    sujet: String(b.sujet ?? ""),
    corps: b.corps,
    origine: b.origine === "ia" ? "ia" : "manuel",
    manquants: Array.isArray(b.manquants) ? b.manquants.map(String) : [],
  });
  let dansLaBoite = false;
  let avertissement: string | null = null;
  try {
    await deposer(a.compte, d.id);
    dansLaBoite = true;
  } catch (e) {
    avertissement = `Enregistré dans le back office, mais pas encore dans votre boîte mail : ${erreurLisible(e)}`;
  }
  return NextResponse.json({ ok: true, brouillon: { id: d.id, dest: d.dest, cc: d.cc, sujet: d.sujet, corps: d.corps, origine: d.origine, manquants: d.manquants, dansLaBoite }, avertissement });
}
