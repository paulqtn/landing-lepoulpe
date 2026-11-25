import { NextResponse } from "next/server";
import { audit, requireRole } from "@/lib/admin/auth";
import { buildRelanceEmail, mailConfigured, sendRelanceTest } from "@/lib/admin/mail";
import { NB_RELANCES, getRelanceSettings, sanitizeRelances } from "@/lib/admin/relances";
import { setSetting } from "@/lib/admin/settings";

/* Séquence de relances : enregistrement, aperçu et envoi d'essai.
   Réservé aux rôles d'administration (ces textes partent chez tous les clients). */
export async function POST(req: Request) {
  const g = await requireRole(req, ["superadmin", "admin"]);
  if (g.denied) return g.denied;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { value, error } = sanitizeRelances(body.value);
  if (!value) return NextResponse.json({ ok: false, error }, { status: 422 });
  const index = Math.min(Math.max(Number(body.index) || 0, 0), NB_RELANCES - 1);

  if (body.action === "preview") {
    const { sujet, html } = buildRelanceEmail(value.mails[index], { name: "Camille Dupont", estimation_ttc: "4850", token: "apercu" });
    return NextResponse.json({ ok: true, sujet, html });
  }

  if (body.action === "test") {
    if (!mailConfigured) return NextResponse.json({ ok: false, error: "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY absente dans Vercel)." }, { status: 503 });
    const r = await sendRelanceTest(g.user.email, value.mails[index]);
    if (!r.sent) return NextResponse.json({ ok: false, error: `L'e-mail d'essai n'est pas parti : ${r.reason}` }, { status: 502 });
    return NextResponse.json({ ok: true, to: g.user.email });
  }

  if (body.action === "save") {
    const before = await getRelanceSettings();
    await setSetting("relances", value, g.user.name);
    await audit(g.user.name, "parametres_relances", "settings", "relances", before, value);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 400 });
}
