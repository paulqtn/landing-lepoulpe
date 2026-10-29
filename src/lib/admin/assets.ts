/* ================================================================== */
/*  Assets commerciaux par système : fiches à joindre au devis et      */
/*  vidéos de présentation. Renseignez les URLs vidéo quand MGK les    */
/*  fournit — une entrée vide masque simplement la section.            */
/* ================================================================== */

export type SystemeKey = "rail" | "pinces" | "spider";

export const VIDEOS: Record<SystemeKey, { url: string; titre: string } | null> = {
  rail: null, // ex. { url: "https://www.youtube.com/watch?v=…", titre: "Poser un garde-corps sur rail" }
  pinces: null,
  spider: null,
};

export const FICHES: Record<SystemeKey, { label: string; href: string }[]> = {
  rail: [{ label: "Fiche produit — Verre sur rail", href: "/produits/garde-corps-verre-sur-rail" }],
  pinces: [{ label: "Fiche produit — Verre sur pinces", href: "/produits/garde-corps-verre-sur-pinces" }],
  spider: [{ label: "Fiche produit — Verre avec spider", href: "/produits/garde-corps-verre-avec-spider" }],
};

export const FICHES_VERRE: Record<string, { label: string; href: string }> = {
  "66.4": { label: "Verre feuilleté 66.4 — fiche technique", href: "/verre/66-4" },
  "88.4": { label: "Verre feuilleté 88.4 — fiche technique", href: "/verre/88-4" },
  "1010.4": { label: "Verre feuilleté 1010.4 — fiche technique", href: "/verre/1010-4" },
};

export function fichesPourLead(answers: Record<string, unknown>): { label: string; href: string }[] {
  const out: { label: string; href: string }[] = [];
  const sys = String(answers.systeme ?? "") as SystemeKey;
  if (FICHES[sys]) out.push(...FICHES[sys]);
  const verre = String(answers.verre ?? answers.epaisseur ?? "");
  if (FICHES_VERRE[verre]) out.push(FICHES_VERRE[verre]);
  return out;
}

export function videoPourLead(answers: Record<string, unknown>): { url: string; titre: string } | null {
  const sys = String(answers.systeme ?? "") as SystemeKey;
  return VIDEOS[sys] ?? null;
}
