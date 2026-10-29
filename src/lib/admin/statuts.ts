/* Statuts du pipeline commercial — partagé client/serveur (aucune dépendance). */

export const STATUTS = ["nouveau", "devis_envoye", "relance_1", "relance_2", "a_rappeler", "gagne", "perdu"] as const;
export type Statut = (typeof STATUTS)[number];

export const STATUT_LABELS: Record<Statut, string> = {
  nouveau: "Nouveau",
  devis_envoye: "Devis envoyé",
  relance_1: "Relancé ×1",
  relance_2: "Relancé ×2",
  a_rappeler: "À rappeler",
  gagne: "Gagné",
  perdu: "Perdu",
};
