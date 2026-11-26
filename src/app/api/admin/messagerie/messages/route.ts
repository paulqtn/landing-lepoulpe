import { NextResponse } from "next/server";
import { accesAvecBoite, refuse } from "@/lib/messagerie/acces";
import { erreurLisible } from "@/lib/messagerie/imap";
import { compteurs, lister, PAR_PAGE, VUES, type Vue } from "@/lib/messagerie/lecture";

export const maxDuration = 45;

/** Liste des messages de la boîte de l'utilisateur connecté : objets et expéditeurs sont lus dans la boîte, à l'instant. */
export async function GET(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const p = new URL(req.url).searchParams;
  const vue = (VUES.find(([v]) => v === p.get("vue"))?.[0] ?? "reception") as Vue;
  const g = (k: string) => p.get(k)?.trim() || undefined;
  try {
    const liste = await lister(a.compte, { vue, q: g("q"), expediteur: g("expediteur"), categorie: g("categorie"), priorite: g("priorite"), statut: g("statut"), du: g("du"), au: g("au"), page: Number(p.get("page")) || 1 });
    return NextResponse.json({ ok: true, vue, messages: liste.lignes, total: liste.total, parPage: PAR_PAGE, compteurs: await compteurs(a.compte.id) });
  } catch (e) {
    return refuse(`Votre boîte mail ne répond pas : ${erreurLisible(e)}`, 502);
  }
}
