import type { User } from "./auth";
import { MOTIFS_PERTE, statutAutomatique } from "./cloture";
import { adminQuery as q, type Lead } from "./db";

/**
 * Contrôle d'un changement de statut demandé à la main. Renvoie le motif du refus, ou le
 * complément à inscrire dans l'historique (motif de non-signature, devis retenu).
 */
export async function controleStatut(user: User, lead: Lead, statut: string, body: { motif?: unknown; precision?: unknown }): Promise<{ error?: string; detail?: string; motif?: string }> {
  if (statut === lead.statut) return {};
  const admin = user.role === "superadmin" || user.role === "admin";
  if (statutAutomatique(statut)) return { error: "Ce statut est posé automatiquement à l'envoi d'une relance : il ne se choisit pas à la main." };
  if (statut === "gagne") {
    const sent = await q<{ ref: string; total_ht: string }>("SELECT ref, total_ht FROM quotes WHERE lead_id = $1 AND statut = 'envoye' ORDER BY sent_at DESC LIMIT 1", [lead.id]);
    if (!sent[0]) return admin ? { detail: "sans devis envoyé (validé par un administrateur)" } : { error: "Aucun devis n'a été envoyé à ce client : envoyez le devis signé avant de passer l'affaire en « Signé », ou demandez à un administrateur." };
    return { detail: `devis retenu ${sent[0].ref}, ${Number(sent[0].total_ht).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € HT` };
  }
  if (statut === "perdu") {
    const motif = String(body.motif ?? "");
    if (!MOTIFS_PERTE[motif]) return { error: "Indiquez pourquoi l'affaire n'est pas signée." };
    const precision = typeof body.precision === "string" ? body.precision.trim().slice(0, 300) : "";
    return { motif, detail: `motif : ${MOTIFS_PERTE[motif]}${precision ? ` — ${precision}` : ""}` };
  }
  return {};
}
