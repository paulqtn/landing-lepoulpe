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
  if (lead.assigned_to || !cible) return null; // réattribution ou remise en file : inchangé
  if (lead.statut === "gagne" || lead.statut === "perdu") return null;
  const first = await oldestPoolLead();
  if (first && first.id !== lead.id) return `Une demande plus ancienne attend dans la file (${first.name}) : elle doit être prise en premier.`;
  return null;
}
