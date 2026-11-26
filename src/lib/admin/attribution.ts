import type { User } from "./auth";
import { oldestPoolLead, type Lead } from "./db";

/**
 * Règle de la file : une demande encore libre ne s'attribue que dans l'ordre
 * d'arrivée. Elle vaut pour la pioche comme pour l'attribution depuis une fiche
 * ou une sélection. Les rôles d'administration peuvent répartir librement.
 * Renvoie le motif du refus, ou null si l'attribution est permise.
 */
export async function refusAttribution(user: User, lead: Lead, cible: string | null): Promise<string | null> {
  if (user.role === "superadmin" || user.role === "admin") return null;
  // Un client déjà suivi ne change de mains que par son commercial ou un administrateur.
  if (lead.assigned_to) return lead.assigned_to === user.name ? null : `Ce client est suivi par ${lead.assigned_to} : seul son commercial ou un administrateur peut le réattribuer.`;
  if (!cible) return null;
  if (lead.statut === "gagne" || lead.statut === "perdu") return null;
  const first = await oldestPoolLead();
  if (first && first.id !== lead.id) return `Une demande plus ancienne attend dans la file (${first.name}) : elle doit être prise en premier.`;
  return null;
}

/**
 * Agir sur une fiche (statut, note, devis, relances, coordonnées) est réservé au commercial
 * du client et aux rôles d'administration. Un client non attribué doit d'abord être pris
 * dans la file. Renvoie le motif du refus, ou null si l'action est permise.
 */
export function refusAction(user: User, lead: Pick<Lead, "assigned_to">): string | null {
  if (user.role === "superadmin" || user.role === "admin") return null;
  if (lead.assigned_to && lead.assigned_to === user.name) return null;
  return lead.assigned_to
    ? `Ce client est suivi par ${lead.assigned_to} : seul son commercial ou un administrateur peut agir sur sa fiche.`
    : "Ce client n'est pas encore attribué : prenez-le d'abord depuis Ma journée, dans l'ordre d'arrivée.";
}
