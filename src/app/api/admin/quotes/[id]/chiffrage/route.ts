import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { refusAction } from "@/lib/admin/attribution";
import { addEvent, adminQuery as q, getLead, updateLead } from "@/lib/admin/db";
import { coefAutorise } from "@/lib/admin/niveaux-prix";
import { draftOptionsFromLead, getQuote, optionTotals, prixParNiveau, updateQuote } from "@/lib/admin/quotes";

/* Chiffrage d'un devis depuis l'écran du devis : le commercial corrige au besoin le projet
   (fixation, verre, longueurs…) et choisit un niveau de prix. Le serveur recalcule la ligne
   « garde-corps » avec le moteur du site ; les coûts d'achat ne sortent jamais d'ici. */

const SYSTEMES = ["rail", "pinces", "spider"];
const VERRES = ["66.4", "88.4", "1010.4"];
const TEINTES = ["clair", "extra-clair", "fume-1f", "fume-2f"];
const HAUTEURS = [90, 100, 110];

function lireProjet(raw: unknown): { value?: Record<string, unknown>; error?: string } {
  const p = (raw ?? {}) as Record<string, unknown>;
  if (!SYSTEMES.includes(String(p.systeme))) return { error: "Choisissez le type de fixation." };
  const cotes = (Array.isArray(p.cotes) ? p.cotes : []).map(Number);
  if (cotes.length === 0 || cotes.length > 6 || cotes.some((n) => !Number.isFinite(n) || n <= 0 || n > 200)) return { error: "Longueurs invalides : de 1 à 6 tronçons, en mètres." };
  if (!HAUTEURS.includes(Number(p.hauteur))) return { error: "Hauteur invalide (90, 100 ou 110 cm)." };
  if (p.verre && !VERRES.includes(String(p.verre))) return { error: "Épaisseur de verre invalide." };
  if (!TEINTES.includes(String(p.teinte))) return { error: "Teinte du verre invalide." };
  const cp = String(p.codePostal ?? "").trim();
  if (cp && !/^\d{5}$/.test(cp)) return { error: "Code postal invalide (5 chiffres)." };
  return { value: { systeme: p.systeme, cotes: cotes.map((n) => Math.round(n * 100) / 100), hauteur: Number(p.hauteur), verre: p.verre ? String(p.verre) : undefined, teinte: p.teinte, codePostal: cp || undefined } };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const id = Number((await params).id);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const quote = await getQuote(id);
  if (!quote) return NextResponse.json({ ok: false, error: "Devis introuvable." }, { status: 404 });
  if (quote.statut !== "brouillon") return NextResponse.json({ ok: false, error: "Ce devis a déjà été envoyé : créez une nouvelle version pour le modifier." }, { status: 409 });
  let lead = quote.lead_id ? await getLead(quote.lead_id) : null;
  if (!lead) return NextResponse.json({ ok: false, error: "Ce devis n'est rattaché à aucune demande : le chiffrage automatique n'est pas possible." }, { status: 409 });
  const refus = refusAction(g.user, lead);
  if (refus) return NextResponse.json({ ok: false, error: refus }, { status: 403 });
  if (!coefAutorise(body.coef)) return NextResponse.json({ ok: false, error: "Choisissez un niveau de prix." }, { status: 422 });

  if (body.projet !== undefined) {
    const { value, error } = lireProjet(body.projet);
    if (!value) return NextResponse.json({ ok: false, error }, { status: 422 });
    const avant = (lead.answers ?? {}) as Record<string, unknown>;
    const apres = { ...avant, ...value };
    if (JSON.stringify(avant) !== JSON.stringify(apres)) {
      await updateLead(lead.id, { answers: apres });
      await addEvent(lead.id, "info", `Projet corrigé depuis le devis ${quote.ref} par ${g.user.name}`);
      lead = (await getLead(lead.id)) ?? lead;
    }
  }

  const niveaux = await prixParNiveau(lead);
  if (!niveaux) return NextResponse.json({ ok: false, error: "Projet incomplet : indiquez la fixation, les longueurs et la hauteur." }, { status: 422 });
  const [genere] = await draftOptionsFromLead(lead, body.coef);
  // Seule la ligne « garde-corps » (la première) est recalculée ; le reste du devis est conservé.
  const premiere = quote.options[0];
  const options = [{ ...genere, label: premiere?.label || genere.label, lines: [genere.lines[0], ...(premiere?.lines.slice(1) ?? [])] }, ...quote.options.slice(1)];
  const r = await updateQuote(id, quote.client, options, g.user.name);
  if (!r.ok) return NextResponse.json(r, { status: 409 });
  await q("UPDATE quotes SET coef = $2 WHERE id = $1", [id, body.coef]);
  // Une fiche sans estimation (prospect saisi à la main) prend le montant chiffré : elle compte alors dans le portefeuille.
  if (!lead.estimation_ttc) await updateLead(lead.id, { estimation_ttc: String(optionTotals(options[0]).ttc) });
  const n = niveaux.find((x) => x.coef === body.coef)!;
  await addEvent(lead.id, "info", `Devis ${quote.ref} chiffré au niveau « ${n.label} » (×${String(n.coef).replace(".", ",")}) par ${g.user.name}`);
  return NextResponse.json({ ok: true, options, totals: options.map(optionTotals), niveaux, coef: body.coef });
}
