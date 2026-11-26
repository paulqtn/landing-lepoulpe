import { NextResponse } from "next/server";
import { peutVoirFiche, userFromRequest } from "@/lib/admin/auth";
import { getLead } from "@/lib/admin/db";
import { enregistrerAppel, fichesParNumero } from "@/lib/telephonie/appels";
import { memeNumero } from "@/lib/telephonie/numero";

/* Fin d'un appel passé ou reçu dans le téléphone intégré : l'écran du commercial le signale,
   le serveur l'inscrit au journal et dans l'historique de la fiche. Ces données viennent du
   navigateur : elles sont bornées, et rattachées à une fiche seulement si son numéro correspond. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const txt = (v: unknown, n: number) => String(v ?? "").replace(/[^\d+A-Za-z_-]/g, "").slice(0, n);
  const sec = (v: unknown) => Math.min(86_400, Math.max(0, Math.round(Number(v) || 0)));
  const callId = txt(b.callId, 64);
  if (!callId || (b.direction !== "in" && b.direction !== "out")) return NextResponse.json({ ok: false, error: "Appel incomplet." }, { status: 422 });
  const appel = {
    callId,
    direction: b.direction as "in" | "out",
    fromNumber: txt(b.fromNumber, 20),
    toNumber: txt(b.toNumber, 20),
    ringDuration: sec(b.ringDuration),
    callDuration: sec(b.callDuration),
    answered: b.answered === true || sec(b.callDuration) > 0,
  };
  const client = appel.direction === "out" ? appel.toNumber : appel.fromNumber;

  // Fiche concernée : celle d'où l'appel a été lancé si son numéro correspond, sinon la fiche trouvée par le numéro.
  let leadId: number | null = null;
  const voulue = Number(b.leadId);
  if (Number.isInteger(voulue) && voulue > 0) {
    const lead = await getLead(voulue);
    if (lead && peutVoirFiche(user, lead) && memeNumero(lead.phone, client)) leadId = lead.id;
  }
  if (!leadId) leadId = (await fichesParNumero(client)).find((f) => peutVoirFiche(user, f))?.id ?? null;

  const r = await enregistrerAppel(appel, leadId, user.name);
  return NextResponse.json({ ok: true, leadId, nouveau: r.cree });
}
