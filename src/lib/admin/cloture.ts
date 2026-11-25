/* Règles de clôture d'une affaire, partagées par l'écran et le serveur (aucune dépendance).
   - « Non signé » demande toujours un motif ;
   - « Relancé ×1/×2/×3 » sont posés par l'envoi d'une relance, jamais à la main. */

export const MOTIFS_PERTE: Record<string, string> = {
  prix: "Prix trop élevé",
  concurrent: "A choisi un concurrent",
  delai: "Délai trop long",
  abandon: "Projet abandonné ou reporté",
  injoignable: "Injoignable",
  autre: "Autre raison",
};
export const STATUTS_AUTOMATIQUES = ["relance_1", "relance_2", "relance_3"] as const;
export const statutAutomatique = (s: string) => (STATUTS_AUTOMATIQUES as readonly string[]).includes(s);
