/* Statuts du pipeline commercial — partagé client/serveur (aucune dépendance). */

export const STATUTS = ["nouveau", "devis_envoye", "relance_1", "relance_2", "relance_3", "a_rappeler", "gagne", "perdu"] as const;
export type Statut = (typeof STATUTS)[number];

export const STATUT_LABELS: Record<Statut, string> = {
  nouveau: "Nouveau",
  devis_envoye: "Devis envoyé",
  relance_1: "Relancé ×1",
  relance_2: "Relancé ×2",
  relance_3: "Relancé ×3",
  a_rappeler: "À rappeler",
  gagne: "Gagné",
  perdu: "Perdu",
};

/** Libellés des usages (slug du catalogue → nom affiché dans l'admin). */
export const USAGE_LABELS: Record<string, string> = {
  piscine: "Piscine",
  escalier: "Escalier",
  balcon: "Balcon",
  terrasse: "Terrasse",
  mezzanine: "Mezzanine",
  fenetre: "Fenêtre",
  interieur: "Intérieur",
  exterieur: "Extérieur",
  verre: "Muret / verre",
  aluminium: "Aluminium",
  inox: "Inox",
};
