import { addEvent, updateLead, type Lead } from "./db";
import { SEQ_MAX, sendRelanceEmail } from "./mail";
import { dateRelance, getRelanceSettings } from "./relances";

const JOUR = 86400_000;

/** Date de la première relance, à programmer quand un devis vient d'être envoyé. */
export async function premiereRelance(): Promise<string> {
  const d = dateRelance(await getRelanceSettings(), 1);
  return (d ?? new Date(Date.now() + 2 * JOUR)).toISOString();
}

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

  // Prochaine échéance selon les délais et heures réglés dans l'onglet Relances.
  // Séquence en pause : un envoi à la main ne reprogramme pas la suite.
  const prochaine = numero >= SEQ_MAX || lead.sequence_pause_at ? null : dateRelance(await getRelanceSettings(), numero + 1);
  const next = prochaine ? prochaine.toISOString() : null;
  await updateLead(lead.id, {
    relances: numero,
    statut: `relance_${numero}` as Lead["statut"],
    next_relance_at: next,
  });
  await addEvent(lead.id, "relance_envoyee", `Relance ${numero} envoyée ${mode === "auto" ? "automatiquement" : "manuellement"}`);
  return { ok: true, numero };
}
