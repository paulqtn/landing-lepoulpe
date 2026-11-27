import { NextResponse } from "next/server";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { indexDe } from "@/lib/messagerie/boite";
import { ecrireBrouillon, nouveauxEnCours } from "@/lib/messagerie/brouillons";
import { reglagesDe } from "@/lib/messagerie/comptes";
import { erreurLisible } from "@/lib/messagerie/imap";

export const maxDuration = 45;

/** Nouveaux messages en cours d'écriture, relus dans le dossier Brouillons de la boîte. */
export async function GET(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  try {
    return NextResponse.json({ ok: true, brouillons: await nouveauxEnCours(a.compte), signature: reglagesDe(a.compte).signature });
  } catch (e) {
    return refuse(`Votre boîte mail ne répond pas : ${erreurLisible(e)}`, 502);
  }
}

/**
 * Écrit le brouillon du commercial dans le dossier Brouillons de sa boîte (son contenu n'est pas
 * gardé en base). Avec « messageId », c'est une réponse ; sans, c'est un nouveau message.
 */
export async function POST(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const b = await corps(req);
  if (!b || typeof b.corps !== "string") return refuse("Brouillon illisible.", 400);
  const idx = Number(b.messageId) ? await indexDe(a.compte, Number(b.messageId)) : null;
  if (Number(b.messageId) && (!idx || idx.dossier === "sent")) return refuse("Message d'origine introuvable.", 404);
  if (!idx && !String(b.sujet ?? "").trim() && !b.corps.trim() && !String(b.dest ?? "").trim()) return refuse("Le message est vide.");
  try {
    const d = await ecrireBrouillon(a.compte, idx, { id: idx ? undefined : Number(b.id) || undefined, dest: String(b.dest ?? ""), cc: String(b.cc ?? ""), sujet: String(b.sujet ?? ""), corps: b.corps, origine: "manuel", manquants: Array.isArray(b.manquants) ? b.manquants.map(String) : [] });
    return NextResponse.json({ ok: true, brouillon: d, avertissement: null });
  } catch (e) {
    return refuse(`Le brouillon n'a pas pu être enregistré dans votre boîte mail : ${erreurLisible(e)}`, 502);
  }
}
