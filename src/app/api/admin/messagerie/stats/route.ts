import { NextResponse } from "next/server";
import { accesAvecBoite } from "@/lib/messagerie/acces";
import { MINUTES_PAR_BROUILLON, tableauDeBord } from "@/lib/messagerie/lecture";

export async function GET(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  return NextResponse.json({ ok: true, stats: await tableauDeBord(a.compte.id), minutesParBrouillon: MINUTES_PAR_BROUILLON });
}
