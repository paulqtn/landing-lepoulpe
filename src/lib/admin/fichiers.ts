/* Fichiers joints à une fiche client (plans, photos, documents).
   Règles partagées par l'écran et le serveur — aucune dépendance. */

export const FICHIER_MAX = 10 * 1024 * 1024;
/** Taille d'un morceau envoyé : sous la limite de 4,5 Mo par requête de l'hébergeur. */
export const MORCEAU = 2 * 1024 * 1024;
export const FICHIERS_PAR_FICHE = 30;

/** Extensions acceptées → type servi au téléchargement. */
export const TYPES_FICHIER: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  dwg: "application/acad",
  dxf: "application/dxf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const extension = (name: string) => (/\.([a-z0-9]{1,5})$/i.exec(name)?.[1] ?? "").toLowerCase();
export const tailleLisible = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);
