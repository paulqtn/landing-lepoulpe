import { NextResponse } from "next/server";
import { audit, requireRole } from "@/lib/admin/auth";
import { buildNewsletterEmail, mailConfigured, sendNewsletterTest } from "@/lib/admin/mail";
import { compterDestinataires, creerCampagne, envoyerLot, progression, relancerEchecs, sanitizeContenu, sanitizeStatuts } from "@/lib/admin/newsletter";

/* Newsletter — réservée au super-administrateur. */
export const maxDuration = 60;

export async function POST(req: Request) {
  const g = await requireRole(req, ["superadmin"]);
  if (g.denied) return g.denied;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const action = body.action;

  /* ---- suite d'un envoi déjà validé ---- */
  if (action === "continuer" || action === "relancer_echecs") {
    const id = Number(body.id);
    if (!Number.isInteger(id)) return NextResponse.json({ ok: false }, { status: 400 });
    if (!mailConfigured) return NextResponse.json({ ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)." }, { status: 503 });
    if (action === "relancer_echecs") {
      await relancerEchecs(id);
      await audit(g.user.name, "newsletter_relance_echecs", "newsletter", id);
    }
    const p = await envoyerLot(id);
    if (!p) return NextResponse.json({ ok: false, error: "Campagne introuvable." }, { status: 404 });
    return NextResponse.json({ ok: true, progression: p });
  }
  if (action === "progression") {
    const p = await progression(Number(body.id));
    return p ? NextResponse.json({ ok: true, progression: p }) : NextResponse.json({ ok: false }, { status: 404 });
  }

  const statuts = sanitizeStatuts(body.statuts);
  if (action === "compter") return NextResponse.json({ ok: true, total: await compterDestinataires(statuts) });

  const { value: contenu, error } = sanitizeContenu(body.contenu);
  if (!contenu) return NextResponse.json({ ok: false, error }, { status: 422 });

  if (action === "preview") {
    const { sujet, html } = buildNewsletterEmail(contenu, { name: "Camille Dupont", token: "apercu" });
    return NextResponse.json({ ok: true, sujet, html });
  }
  if (action === "test") {
    if (!mailConfigured) return NextResponse.json({ ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)." }, { status: 503 });
    const r = await sendNewsletterTest(g.user.email, contenu);
    return r.sent ? NextResponse.json({ ok: true, to: g.user.email }) : NextResponse.json({ ok: false, error: `L'essai n'est pas parti : ${r.reason}` }, { status: 502 });
  }

  /* ---- envoi : double vérification côté serveur ---- */
  if (action === "envoyer") {
    if (!mailConfigured) return NextResponse.json({ ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)." }, { status: 503 });
    if (!statuts.length) return NextResponse.json({ ok: false, error: "Cochez au moins un état." }, { status: 422 });
    const total = await compterDestinataires(statuts);
    if (total === 0) return NextResponse.json({ ok: false, error: "Aucun destinataire pour ces états." }, { status: 422 });
    // Le nombre confirmé à l'écran doit être celui que le serveur compte à l'instant.
    if (Number(body.confirmTotal) !== total)
      return NextResponse.json({ ok: false, error: `Le nombre de destinataires a changé (${total} maintenant). Vérifiez puis confirmez de nouveau.`, total }, { status: 409 });
    const camp = await creerCampagne(contenu, statuts, g.user.name);
    await audit(g.user.name, "newsletter_envoi", "newsletter", camp.id, undefined, { sujet: contenu.sujet, statuts, total: camp.total });
    const p = await envoyerLot(camp.id);
    return NextResponse.json({ ok: true, id: camp.id, progression: p });
  }
  return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 400 });
}
