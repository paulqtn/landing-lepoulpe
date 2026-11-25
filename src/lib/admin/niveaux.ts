/* Score du prospect : niveau de 1 à 5 posé à la main par le commercial sur la fiche
   client (distinct de la note A/B/C calculée automatiquement à l'arrivée de la demande). */

export const NIVEAUX = [
  { n: 1, label: "Prospect froid", description: "Contact identifié, intérêt non confirmé.", cls: "bg-neutral-100 text-neutral-700 ring-neutral-300" },
  { n: 2, label: "Prospect tiède", description: "Premier échange, intérêt potentiel.", cls: "bg-sky-100 text-sky-800 ring-sky-300" },
  { n: 3, label: "Prospect qualifié", description: "Besoin identifié, projet concret.", cls: "bg-orange-100 text-orange-800 ring-orange-300" },
  { n: 4, label: "Prospect chaud", description: "Fort intérêt, proposition commerciale en cours.", cls: "bg-red-100 text-red-800 ring-red-300" },
  { n: 5, label: "Prêt à signer", description: "Accord de principe, signature imminente.", cls: "bg-green-100 text-green-800 ring-green-300" },
] as const;

export const niveauInfo = (n: number | null | undefined) => NIVEAUX.find((x) => x.n === n) ?? null;
