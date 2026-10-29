/* ================================================================== */
/*  Scoring des leads — classement A/B/C pour la gestion commerciale.  */
/*  Recalculé à la création puis à chaque signal d'engagement.         */
/* ================================================================== */

export type Engagement = { opens: number; clicks: number; devis_views: number };

export function computeScore(input: {
  estimationTTC: number | null;
  source: string | null;
  answers: Record<string, unknown>;
  engagement?: Engagement;
}): { points: number; grade: "A" | "B" | "C" } {
  const a = input.answers ?? {};
  let pts = 0;

  // Valeur du projet
  const est = input.estimationTTC ?? 0;
  if (est >= 4000) pts += 30;
  else if (est >= 1500) pts += 20;
  else if (est > 0) pts += 10;

  // Intention selon la provenance
  const src = input.source ?? "";
  if (src.startsWith("fiche-produit")) pts += 15;
  else if (src.startsWith("configurateur-") && src !== "configurateur-devis") pts += 12;
  else if (src) pts += 8;

  // Signaux projet
  if (a.installation === "installateur") pts += 10;
  const lieu = String(a.lieu ?? a.usage ?? "");
  if (lieu === "piscine") pts += 10; // obligation réglementaire : urgence réelle
  if (String(a.hauteur ?? "") === "110") pts += 5;
  if (Array.isArray(a.cotes) && (a.cotes as unknown[]).length >= 2) pts += 8;
  if (a.codePostal) pts += 7;
  if (a.systeme && a.systeme !== "conseil") pts += 5;

  // Engagement (emails ouverts/cliqués, devis consulté)
  const e = input.engagement;
  if (e) {
    pts += Math.min(e.opens * 3, 9);
    pts += Math.min(e.clicks * 5, 15);
    pts += Math.min(e.devis_views * 5, 15);
  }

  const grade = pts >= 60 ? "A" : pts >= 35 ? "B" : "C";
  return { points: pts, grade };
}
