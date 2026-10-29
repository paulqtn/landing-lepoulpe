import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { addEvent, findLeadByEmail, hasRecentEvent, recordEngagement } from "@/lib/admin/db";
import { rescoreLead } from "@/lib/admin/rescore";

/* ================================================================== */
/*  Webhook Resend (ouvertures, clics, bounces) — signé via Svix.      */
/*  Configurer dans Resend : Webhooks → endpoint /api/webhooks/resend, */
/*  secret dans RESEND_WEBHOOK_SECRET.                                 */
/* ================================================================== */

function verifySvix(req: Request, payload: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // non configuré : on accepte (à verrouiller en prod)
  const id = req.headers.get("svix-id");
  const ts = req.headers.get("svix-timestamp");
  const sigs = req.headers.get("svix-signature");
  if (!id || !ts || !sigs) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${payload}`).digest("base64");
  return sigs.split(" ").some((part) => {
    const sig = part.split(",")[1] ?? "";
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

export async function POST(req: Request) {
  const payload = await req.text();
  if (!verifySvix(req, payload)) return NextResponse.json({ error: "signature invalide" }, { status: 401 });

  let evt: { type?: string; data?: { to?: string[] | string } };
  try {
    evt = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 });
  }

  const to = Array.isArray(evt.data?.to) ? evt.data?.to[0] : evt.data?.to;
  if (!to || !evt.type) return NextResponse.json({ ok: true, ignored: true });

  const lead = await findLeadByEmail(to);
  if (!lead) return NextResponse.json({ ok: true, ignored: true });

  if (evt.type === "email.opened") {
    await recordEngagement(lead.id, { opens: 1 });
    if (!(await hasRecentEvent(lead.id, "email_ouvert", 6))) {
      await addEvent(lead.id, "email_ouvert", "Le client a ouvert un email");
    }
    await rescoreLead(lead.id);
  } else if (evt.type === "email.clicked") {
    await recordEngagement(lead.id, { clicks: 1 });
    await addEvent(lead.id, "email_clique", "Le client a cliqué dans un email");
    await rescoreLead(lead.id);
  } else if (evt.type === "email.bounced" || evt.type === "email.complained") {
    await addEvent(lead.id, "email_bounce", `Email non délivré (${evt.type}) — vérifier l'adresse`);
  }

  return NextResponse.json({ ok: true });
}
