import { site } from "@/lib/site";
import { getSetting } from "./settings";

/* Coordonnées et mentions de la société, reprises sur les devis.
   Modifiables dans le back office ; rien de réel n'est écrit dans le code. */

export const SOCIETE_FIELDS = [
  { key: "raisonSociale", label: "Raison sociale", multiline: false },
  { key: "adresse", label: "Adresse", multiline: true },
  { key: "siret", label: "SIRET", multiline: false },
  { key: "tvaIntra", label: "N° de TVA intracommunautaire", multiline: false },
  { key: "telephone", label: "Téléphone", multiline: false },
  { key: "email", label: "E-mail de contact", multiline: false },
  { key: "validiteJours", label: "Validité du devis (jours)", multiline: false },
  { key: "conditions", label: "Conditions de paiement et de livraison", multiline: true },
] as const;

export type Societe = Record<(typeof SOCIETE_FIELDS)[number]["key"], string>;

export async function getSociete(): Promise<Societe> {
  const stored = (await getSetting<Partial<Societe>>("societe")) ?? {};
  const base: Societe = {
    raisonSociale: site.name,
    adresse: "",
    siret: "",
    tvaIntra: "",
    telephone: site.phone,
    email: "",
    validiteJours: "30",
    conditions: "",
  };
  for (const f of SOCIETE_FIELDS) if (typeof stored[f.key] === "string" && stored[f.key]) base[f.key] = stored[f.key] as string;
  return base;
}

/** Mentions obligatoires encore vides — bloquent l'envoi d'un devis. */
export function societeManquants(s: Societe): string[] {
  return SOCIETE_FIELDS.filter((f) => ["adresse", "siret", "tvaIntra", "conditions"].includes(f.key) && !s[f.key].trim()).map((f) => f.label);
}
