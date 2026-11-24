import { NextResponse } from "next/server";
import { userFromRequest } from "@/lib/admin/auth";
import { duplicateQuote, optionTotals, sanitizeClient, sanitizeOptions, updateQuote } from "@/lib/admin/quotes";

/* Enregistrement d'un brouillon : les totaux sont recalculés ici, jamais repris de l'écran. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const id = Number((await params).id);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { options, error } = sanitizeOptions(body.options);
  if (error) return NextResponse.json({ ok: false, error }, { status: 422 });
  const client = sanitizeClient(body.client);
  if (client.name.length < 2) return NextResponse.json({ ok: false, error: "Le nom du client est obligatoire." }, { status: 422 });
  const r = await updateQuote(id, client, options, user.name);
  if (!r.ok) return NextResponse.json(r, { status: 409 });
  return NextResponse.json({ ok: true, totals: options.map(optionTotals) });
}

/* Nouvelle version modifiable d'un devis déjà envoyé. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const quote = await duplicateQuote(Number((await params).id), user.name);
  if (!quote) return NextResponse.json({ ok: false, error: "Devis introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true, id: quote.id, ref: quote.ref });
}
