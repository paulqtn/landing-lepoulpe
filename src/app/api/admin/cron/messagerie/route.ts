import { NextResponse } from "next/server";
import { adminQuery as q } from "@/lib/admin/db";
import { globaux } from "@/lib/messagerie/comptes";
import { traiter } from "@/lib/messagerie/pipeline";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 60;

/**
 * Tâche planifiée (voir vercel.json) : synchronise et traite les boîtes mail même quand aucun
 * écran n'est ouvert. Le temps disponible est partagé entre les boîtes, les moins récemment
 * synchronisées d'abord. Auth par CRON_SECRET, comme la tâche des relances.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  if (!(await globaux()).actif) return NextResponse.json({ ok: true, info: "messagerie désactivée" });
  const boites = await q<{ id: number }>("SELECT a.id FROM mail_accounts a JOIN users u ON u.id = a.user_id AND u.active ORDER BY a.last_sync_at ASC NULLS FIRST LIMIT 8");
  const debut = Date.now();
  let faites = 0;
  for (const b of boites) {
    const reste = 50_000 - (Date.now() - debut);
    if (reste < 6000) break;
    await planifier(b.id, "sync", b.id);
    faites += (await traiter(b.id, Math.min(reste, Math.max(8000, 50_000 / boites.length)))).faites;
  }
  return NextResponse.json({ ok: true, boites: boites.length, taches: faites });
}
