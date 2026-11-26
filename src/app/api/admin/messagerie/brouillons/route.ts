import { NextResponse } from "next/server";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { indexDe } from "@/lib/messagerie/boite";
import { ecrireBrouillon } from "@/lib/messagerie/brouillons";
import { erreurLisible } from "@/lib/messagerie/imap";

export const maxDuration = 45;

/** Écrit le brouillon du commercial dans le dossier Brouillons de sa boîte (son contenu n'est pas gardé en base). */
export async function POST(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const b = await corps(req);
  if (!b || typeof b.corps !== "string") return refuse("Brouillon illisible.", 400);
  const idx = Number(b.messageId) ? await indexDe(a.compte, Number(b.messageId)) : null;
  if (!idx || idx.dossier === "sent") return refuse("Message d'origine introuvable.", 404);
  try {
    const d = await ecrireBrouillon(a.compte, idx, { dest: String(b.dest ?? ""), cc: String(b.cc ?? ""), sujet: String(b.sujet ?? ""), corps: b.corps, origine: "manuel", manquants: Array.isArray(b.manquants) ? b.manquants.map(String) : [] });
    return NextResponse.json({ ok: true, brouillon: d, avertissement: null });
  } catch (e) {
    return refuse(`Le brouillon n'a pas pu être enregistré dans votre boîte mail : ${erreurLisible(e)}`, 502);
  }
}
