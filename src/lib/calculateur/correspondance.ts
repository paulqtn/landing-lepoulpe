/* ================================================================== */
/*  Correspondance « choix du client » → référence chiffrée.           */
/*  Règle unique pour le prix affiché sur le site, le devis            */
/*  automatique et la marge :                                          */
/*    pinces            → GS-07-C                                      */
/*    rail              → GS-19-L                                      */
/*    spider            → GS-02                                        */
/*    « à me conseiller » → rail (GS-19-L) par défaut                  */
/*  L'épaisseur et la teinte du verre choisies sont toujours prises en */
/*  compte. Fichier sans dépendance : importable partout côté serveur. */
/* ================================================================== */

export type SystemeDemande = "rail" | "pinces" | "spider" | "conseil";
export type Verre = "66.4" | "88.4" | "1010.4";
export type TeinteVerre = "clair" | "extra-clair" | "fume-1f" | "fume-2f";

export const REFERENCE_PAR_SYSTEME = {
  pinces: "GS-07-C",
  rail: "GS-19-L",
  spider: "GS-02",
  conseil: "GS-19-L",
} as const;

const isVerre = (v: unknown): v is Verre => typeof v === "string" && ["66.4", "88.4", "1010.4"].includes(v);
const isTeinte = (v: unknown): v is TeinteVerre => typeof v === "string" && ["clair", "extra-clair", "fume-1f", "fume-2f"].includes(v);

export function isSystemeDemande(v: unknown): v is SystemeDemande {
  return typeof v === "string" && v in REFERENCE_PAR_SYSTEME;
}

export function correspondance(input: { systeme: unknown; verre?: unknown; epaisseur?: unknown; lieu?: unknown; teinte?: unknown }): {
  fixation: (typeof REFERENCE_PAR_SYSTEME)[SystemeDemande];
  /** Système réellement chiffré (« conseil » devient « rail »). */
  systeme: "rail" | "pinces" | "spider";
  parDefaut: boolean;
  verre: Verre;
  teinte: TeinteVerre;
} | null {
  if (!isSystemeDemande(input.systeme)) return null;
  // Épaisseur : celle choisie ; sinon 66.4 pour une piscine, 88.4 ailleurs (règle historique).
  const piscine = String(input.lieu ?? "").includes("piscine");
  const verre = isVerre(input.verre) ? input.verre : isVerre(input.epaisseur) ? input.epaisseur : piscine ? "66.4" : "88.4";
  return {
    fixation: REFERENCE_PAR_SYSTEME[input.systeme],
    systeme: input.systeme === "conseil" ? "rail" : input.systeme,
    parDefaut: input.systeme === "conseil",
    verre,
    teinte: isTeinte(input.teinte) ? input.teinte : "clair",
  };
}
