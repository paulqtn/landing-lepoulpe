import { addEvent, adminQuery as q, type Lead } from "@/lib/admin/db";
import { cleNumero, dureeLisible, numeroLisible } from "./numero";

/* ================================================================== */
/*  Journal des appels téléphoniques.                                  */
/*  Aujourd'hui alimenté par le téléphone intégré (SDK Ringover) : ce  */
/*  que le navigateur du commercial rapporte en fin d'appel.           */
/*  Demain : les webhooks et l'API Ringover écriront dans la même      */
/*  table (source « webhook » ou « api »), reconnue par `call_id`, et  */
/*  y ajouteront enregistrement et résumé. Rien d'autre ne changera.   */
/* ================================================================== */

export type AppelSdk = {
  callId: string;
  direction: "in" | "out";
  fromNumber: string;
  toNumber: string;
  answered: boolean;
  ringDuration: number;
  callDuration: number;
};

/** Fiches dont le téléphone correspond à ce numéro (les plus récentes d'abord). */
export async function fichesParNumero(numero: string): Promise<Pick<Lead, "id" | "name" | "assigned_to" | "statut">[]> {
  const cle = cleNumero(numero);
  if (cle.length < 8) return [];
  return q<Pick<Lead, "id" | "name" | "assigned_to" | "statut">>(
    `SELECT id, name, assigned_to, statut FROM leads
     WHERE anonymized_at IS NULL AND right(regexp_replace(phone, '\\D', '', 'g'), 9) = $1
     ORDER BY id DESC LIMIT 5`,
    [cle],
  );
}

/**
 * Enregistre un appel terminé. Un même appel (call_id) n'est inscrit qu'une fois, même si
 * l'écran le signale deux fois ; l'historique de la fiche ne reçoit donc qu'une ligne.
 */
export async function enregistrerAppel(a: AppelSdk, leadId: number | null, utilisateur: string): Promise<{ cree: boolean }> {
  const rows = await q<{ id: number }>(
    `INSERT INTO telephonie_appels (call_id, source, lead_id, utilisateur, direction, from_number, to_number, answered, ring_s, duree_s)
     VALUES ($1, 'sdk', $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (call_id) DO NOTHING RETURNING id`,
    [a.callId, leadId, utilisateur, a.direction, a.fromNumber, a.toNumber, a.answered, a.ringDuration, a.callDuration],
  );
  if (!rows[0]) return { cree: false };
  if (leadId) {
    const sens = a.direction === "out" ? "sortant" : "entrant";
    const autre = numeroLisible(a.direction === "out" ? a.toNumber : a.fromNumber);
    const issue = a.answered ? `${dureeLisible(a.callDuration)} de conversation` : a.direction === "out" ? "sans réponse" : "manqué";
    await addEvent(leadId, "appel", `Appel ${sens} Ringover (${autre}) — ${issue} — ${utilisateur}`);
  }
  return { cree: true };
}
