import { NextResponse } from "next/server";
import { accesAvecBoite } from "@/lib/messagerie/acces";
import { compteurs, lister, PAR_PAGE, VUES, type Vue } from "@/lib/messagerie/lecture";

/** Liste des messages de la boîte de l'utilisateur connecté, selon la vue et les filtres. */
export async function GET(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const p = new URL(req.url).searchParams;
  const vue = (VUES.find(([v]) => v === p.get("vue"))?.[0] ?? "reception") as Vue;
  const g = (k: string) => p.get(k)?.trim() || undefined;
  const [liste, c] = await Promise.all([
    lister(a.compte.id, { vue, q: g("q"), expediteur: g("expediteur"), categorie: g("categorie"), priorite: g("priorite"), statut: g("statut"), du: g("du"), au: g("au"), page: Number(p.get("page")) || 1 }),
    compteurs(a.compte.id),
  ]);
  return NextResponse.json({ ok: true, vue, messages: liste.lignes, total: liste.total, parPage: PAR_PAGE, compteurs: c });
}
