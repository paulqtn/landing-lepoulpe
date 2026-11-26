/* Origine d'un client, en clair : les codes techniques enregistrés
   (« manuel-recommandation », « configurateur-escalier ») ne s'affichent jamais tels quels. */

const MANUEL: Record<string, string> = {
  appel: "Appel direct",
  recommandation: "Recommandation",
  salon: "Salon ou événement",
  passage: "Passage au dépôt",
  autre: "Saisie manuelle",
};

const SITE: Record<string, string> = {
  devis: "devis",
  produit: "fiche produit",
};

export function sourceLisible(source: string | null | undefined): string {
  const s = (source ?? "").trim().toLowerCase();
  if (!s || s === "site") return "Site";
  if (s.startsWith("manuel-")) return MANUEL[s.slice(7)] ?? "Saisie manuelle";
  if (s === "fiche-produit") return "Site · fiche produit";
  const m = /^(configurateur|generateur|générateur)-(.+)$/.exec(s);
  if (m) return `Site · ${SITE[m[2]] ?? m[2].replace(/-/g, " ")}`;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
