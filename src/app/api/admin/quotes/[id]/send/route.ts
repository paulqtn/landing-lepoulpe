import { premiereRelance } from "@/lib/admin/sequence";
import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, getLead, updateLead } from "@/lib/admin/db";
import { mailConfigured, sendQuoteEmail } from "@/lib/admin/mail";
import { renderQuotePdf } from "@/lib/admin/quote-pdf";
import { getQuote, markSent, optionTotals } from "@/lib/admin/quotes";
import { getSociete, societeManquants } from "@/lib/admin/societe";
import { site } from "@/lib/site";

/* Envoi du devis au client — uniquement sur validation explicite :
   l'écran doit renvoyer le numéro du devis ET l'adresse du destinataire
   affichés dans la fenêtre de confirmation. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["devis", "clients"]);
  if (g.denied) return g.denied;
  const user = g.user;
  let body: { confirmRef?: unknown; confirmEmail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const quote = await getQuote(Number((await params).id));
  if (!quote) return NextResponse.json({ ok: false, error: "Devis introuvable." }, { status: 404 });
  if (quote.statut !== "brouillon") return NextResponse.json({ ok: false, error: "Ce devis a déjà été envoyé." }, { status: 409 });

  const to = quote.client.email;
  if (body.confirmRef !== quote.ref || body.confirmEmail !== to)
    return NextResponse.json({ ok: false, error: "Confirmation incomplète : le devis a changé depuis l'ouverture de la fenêtre. Rechargez la page." }, { status: 409 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ ok: false, error: "L'adresse e-mail du client est invalide." }, { status: 422 });

  const societe = await getSociete();
  const manquants = societeManquants(societe);
  if (manquants.length)
    return NextResponse.json({ ok: false, error: `Mentions de la société à compléter avant tout envoi : ${manquants.join(", ")}.` }, { status: 422 });
  if (!mailConfigured) return NextResponse.json({ ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)." }, { status: 503 });

  const totals = quote.options.map(optionTotals);
  if (totals.some((t) => t.ttc <= 0)) return NextResponse.json({ ok: false, error: "Une proposition a un total nul." }, { status: 422 });

  // Le PDF envoyé porte la date et le statut définitifs.
  const sentQuote = { ...quote, statut: "envoye" as const, sent_at: new Date().toISOString() };
  const pdf = await renderQuotePdf(sentQuote, societe);
  const lead = quote.lead_id ? await getLead(quote.lead_id) : null;
  const mail = await sendQuoteEmail({
    to,
    name: quote.client.name,
    ref: quote.ref,
    totalTtc: Math.min(...totals.map((t) => t.ttc)),
    nbOptions: quote.options.length,
    pdf,
    devisUrl: lead?.token ? `${site.url}/d/${lead.token}` : undefined,
  });
  if (!mail.sent) {
    if (lead) await addEvent(lead.id, "devis_echec", `Envoi du devis ${quote.ref} impossible : ${mail.reason}`);
    return NextResponse.json({ ok: false, error: `L'e-mail n'est pas parti : ${mail.reason}` }, { status: 502 });
  }

  await markSent(quote.id, user.name, to, { societe, options: quote.options, client: quote.client, totals });
  if (lead) {
    await updateLead(lead.id, {
      statut: lead.statut === "nouveau" ? "devis_envoye" : lead.statut,
      estimation_ttc: String(totals[0].ttc),
      next_relance_at: await premiereRelance(),
    });
    await addEvent(lead.id, "devis_envoye", `Devis ${quote.ref} validé et envoyé par ${user.name} à ${to}`);
  }
  return NextResponse.json({ ok: true });
}
