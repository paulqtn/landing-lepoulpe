import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { refusAction } from "@/lib/admin/attribution";
import { majCoordonnees } from "@/lib/admin/contact";
import { getLead } from "@/lib/admin/db";
import type { User } from "@/lib/admin/auth";
import { duplicateQuote, getQuote, optionTotals, refusPlancher, sanitizeClient, sanitizeOptions, updateQuote } from "@/lib/admin/quotes";

/** Un devis rattaché à un client ne se modifie que par son commercial ou un administrateur. */
async function refusDevis(user: User, id: number): Promise<{ refus: string | null; leadId: number | null }> {
  const quote = await getQuote(id);
  const lead = quote?.lead_id ? await getLead(quote.lead_id) : null;
  return { refus: lead ? refusAction(user, lead) : null, leadId: lead?.id ?? null };
}

/* Enregistrement d'un brouillon : les totaux sont recalculés ici, jamais repris de l'écran. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const user = g.user;
  const id = Number((await params).id);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const droit = await refusDevis(user, id);
  if (droit.refus) return NextResponse.json({ ok: false, error: droit.refus }, { status: 403 });
  const { options, error } = sanitizeOptions(body.options, (await getQuote(id))?.options ?? []);
  if (error) return NextResponse.json({ ok: false, error }, { status: 422 });
  const plancher = await refusPlancher(droit.leadId ? await getLead(droit.leadId) : null, options, user.role === "superadmin" || user.role === "admin");
  if (plancher) return NextResponse.json({ ok: false, error: plancher }, { status: 422 });
  const client = sanitizeClient(body.client);
  if (client.name.length < 2) return NextResponse.json({ ok: false, error: "Le nom du client est obligatoire." }, { status: 422 });
  const r = await updateQuote(id, client, options, user.name);
  if (!r.ok) return NextResponse.json(r, { status: 409 });
  // Les coordonnées corrigées dans le devis sont reportées sur la fiche (c'est elle qui sert aux relances).
  if (droit.leadId && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) await majCoordonnees(droit.leadId, { name: client.name, email: client.email, ...(client.phone ? { phone: client.phone } : {}) }, user.name, "le devis");
  return NextResponse.json({ ok: true, totals: options.map(optionTotals) });
}

/* Nouvelle version modifiable d'un devis déjà envoyé. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const user = g.user;
  const droit = await refusDevis(user, Number((await params).id));
  if (droit.refus) return NextResponse.json({ ok: false, error: droit.refus }, { status: 403 });
  const quote = await duplicateQuote(Number((await params).id), user.name);
  if (!quote) return NextResponse.json({ ok: false, error: "Devis introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true, id: quote.id, ref: quote.ref });
}
