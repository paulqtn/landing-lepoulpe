import { addEvent, updateLead, type Lead } from "./db";
import { SEQ_DELAIS_JOURS, SEQ_MAX, sendRelanceEmail } from "./mail";

/* Avance la séquence de relances d'un lead (envoi n° relances+1). */
export async function envoyerRelance(
  lead: Lead,
  mode: "auto" | "manuel",
): Promise<{ ok: boolean; numero: number; reason?: string }> {
  const numero = lead.relances + 1;
  if (numero > SEQ_MAX) return { ok: false, numero, reason: "séquence terminée (3 relances envoyées)" };

  const mail = await sendRelanceEmail(lead, numero);
  if (!mail.sent) {
    await addEvent(lead.id, "relance_echec", `Relance ${numero} impossible : ${mail.reason}`);
    return { ok: false, numero, reason: mail.reason };
  }

  const next =
    numero >= SEQ_MAX ? null : new Date(Date.now() + SEQ_DELAIS_JOURS[numero] * 86400_000).toISOString();
  await updateLead(lead.id, {
    relances: numero,
    statut: `relance_${numero}` as Lead["statut"],
    next_relance_at: next,
  });
  await addEvent(lead.id, "relance_envoyee", `Relance ${numero} envoyée ${mode === "auto" ? "automatiquement" : "manuellement"}`);
  return { ok: true, numero };
}
