/* Statuts du pipeline commercial — partagé client/serveur (aucune dépendance). */

export const STATUTS = [
  "nouveau", "devis_envoye", "relance_1", "relance_2", "relance_3",
  "a_rappeler", "en_discussion", "en_reflexion", "devis_a_modifier",
  "gagne", "perdu",
] as const;
export type Statut = (typeof STATUTS)[number];

export const STATUT_LABELS: Record<Statut, string> = {
  nouveau: "Nouveau",
  devis_envoye: "Devis envoyé",
  relance_1: "Relancé ×1",
  relance_2: "Relancé ×2",
  relance_3: "Relancé ×3",
  a_rappeler: "À rappeler",
  en_discussion: "En discussion",
  en_reflexion: "En réflexion",
  devis_a_modifier: "Devis à modifier",
  gagne: "Gagné",
  perdu: "Perdu",
};

/** Ce que chaque statut veut dire, affiché en aide dans le back office. */
export const STATUT_AIDE: Record<Statut, string> = {
  nouveau: "Demande reçue, devis pas encore envoyé.",
  devis_envoye: "Devis envoyé — la séquence de relances tourne.",
  relance_1: "1re relance envoyée — la séquence continue.",
  relance_2: "2e relance envoyée — la séquence continue.",
  relance_3: "3e relance envoyée — séquence terminée, sans réponse.",
  a_rappeler: "Le client demande à être rappelé — e-mails arrêtés.",
  en_discussion: "Client eu au téléphone, échange en cours — e-mails arrêtés.",
  en_reflexion: "Le client réfléchit, à rappeler à une date convenue — e-mails arrêtés.",
  devis_a_modifier: "Le client veut un devis modifié — e-mails arrêtés.",
  gagne: "Affaire signée.",
  perdu: "Affaire perdue.",
};

/**
 * Les e-mails automatiques ne partent QUE dans ces statuts. Dès qu'un humain a
 * repris la main (appel, discussion, réflexion, devis à modifier, gagné, perdu),
 * la séquence s'arrête d'elle-même.
 */
export const STATUTS_SEQUENCE: readonly Statut[] = ["devis_envoye", "relance_1", "relance_2"];
export const sequenceActive = (statut: string): boolean => (STATUTS_SEQUENCE as readonly string[]).includes(statut);

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
