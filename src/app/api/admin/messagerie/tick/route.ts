import { NextResponse } from "next/server";
import { adminQuery as q } from "@/lib/admin/db";
import { accesAvecBoite, corps } from "@/lib/messagerie/acces";
import { compteParId, comptePublic } from "@/lib/messagerie/comptes";
import { synchroDue, traiter } from "@/lib/messagerie/pipeline";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 60;

/* Passage de traitement pour la boîte de l'utilisateur connecté : synchronise si c'est dû (ou
   si le commercial le demande), puis fait avancer la file de tâches pendant quelques dizaines
   de secondes. L'écran l'appelle régulièrement tant qu'il est ouvert. */
export async function POST(req: Request) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const b = (await corps(req)) ?? {};
  if (b.forcer === true || synchroDue(a.compte)) await planifier(a.compte.id, "sync", a.compte.id);
  // Demande explicite du commercial : une synchronisation en attente de nouvel essai part tout de suite.
  if (b.forcer === true) await q("UPDATE mail_jobs SET prochain_essai_at = now() WHERE account_id = $1 AND type = 'sync' AND statut = 'attente'", [a.compte.id]);
  const bilan = await traiter(a.compte.id, b.forcer === true ? 45_000 : 35_000);
  const compte = (await compteParId(a.compte.id)) ?? a.compte;
  return NextResponse.json({ ok: compte.statut === "ok", bilan, compte: comptePublic(compte) });
}
