import { NextResponse } from "next/server";
import { peutVoirFiche, userFromRequest } from "@/lib/admin/auth";
import { fichesParNumero } from "@/lib/telephonie/appels";

/* À qui appartient ce numéro ? Sert à afficher le nom du client quand le téléphone sonne.
   Un commercial n'obtient que ses clients et ceux de la file, comme partout ailleurs. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const numero = new URL(req.url).searchParams.get("numero") ?? "";
  const fiches = (await fichesParNumero(numero)).filter((f) => peutVoirFiche(user, f));
  return NextResponse.json({ fiches: fiches.map((f) => ({ id: f.id, name: f.name, suiviPar: f.assigned_to })) });
}
