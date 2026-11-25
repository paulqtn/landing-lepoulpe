import { addEvent, adminQuery as q, dbConfigured, getLead } from "./db";

/* Coordonnées d'un client : une seule source, la fiche. Elles se corrigent depuis la fiche
   ou depuis un devis ; les relances partent toujours à l'adresse de la fiche. */

const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function majCoordonnees(leadId: number, raw: unknown, actor: string, origine = "la fiche"): Promise<{ error?: string; change: boolean }> {
  if (!dbConfigured) return { change: false };
  const lead = await getLead(leadId);
  if (!lead) return { error: "Client introuvable.", change: false };
  const c = (raw ?? {}) as Record<string, unknown>;
  const next = {
    name: c.name === undefined ? lead.name : s(c.name, 120),
    email: c.email === undefined ? lead.email : s(c.email, 200).toLowerCase(),
    phone: c.phone === undefined ? lead.phone : s(c.phone, 40),
  };
  if (next.name.length < 2) return { error: "Le nom du client est obligatoire.", change: false };
  if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return { error: "L'adresse e-mail n'est pas valide.", change: false };
  if (!next.email && next.phone.replace(/\D/g, "").length < 8) return { error: "Il faut au moins un e-mail ou un téléphone valide.", change: false };
  const diff = (["name", "email", "phone"] as const).filter((k) => next[k] !== (lead[k] ?? ""));
  if (diff.length === 0) return { change: false };
  await q("UPDATE leads SET name = $2, email = $3, phone = $4 WHERE id = $1", [leadId, next.name, next.email, next.phone]);
  const noms = { name: "nom", email: "e-mail", phone: "téléphone" };
  await addEvent(leadId, "info", `Coordonnées mises à jour depuis ${origine} par ${actor} (${diff.map((k) => noms[k]).join(", ")})`);
  return { change: true };
}
