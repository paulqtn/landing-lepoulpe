import { NextResponse } from "next/server";
import { audit, requireRole } from "@/lib/admin/auth";
import { adminQuery as q, addEvent, getLead, listEvents } from "@/lib/admin/db";
import { quotesForLead } from "@/lib/admin/quotes";

/* RGPD — droit d'accès (export) et droit à l'effacement (anonymisation).
   Réservé aux rôles superadmin et admin. */

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireRole(req, ["superadmin", "admin"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });
  const [events, quotes] = await Promise.all([listEvents(lead.id), quotesForLead(lead.id)]);
  await audit(g.user.name, "rgpd_export", "lead", lead.id);
  const { token: _token, ...personne } = lead;
  void _token;
  return new NextResponse(JSON.stringify({ exporte_le: new Date().toISOString(), personne, historique: events, devis: quotes.map((x) => ({ ref: x.ref, statut: x.statut, cree_le: x.created_at, envoye_le: x.sent_at, client: x.client, propositions: x.options })) }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="donnees-client-${lead.id}.json"`, "Cache-Control": "private, no-store" },
  });
}

/* Anonymisation : les données personnelles sont remplacées, les montants et
   statuts sont conservés pour les statistiques. Irréversible. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireRole(req, ["superadmin", "admin"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ ok: false, error: "introuvable" }, { status: 404 });
  let body: { confirm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (body.confirm !== `ANONYMISER ${lead.id}`) return NextResponse.json({ ok: false, error: "Confirmation incorrecte." }, { status: 422 });

  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const garde: Record<string, unknown> = {};
  for (const k of ["lieu", "usage", "systeme", "cotes", "hauteur", "teinte", "verre", "epaisseur", "estimationTTC"]) if (k in a) garde[k] = a[k];
  if (typeof a.codePostal === "string") garde.codePostal = a.codePostal.slice(0, 2); // département uniquement

  await q(
    `UPDATE leads SET name = $2, email = $3, phone = '', answers = $4, token = NULL, next_relance_at = NULL, anonymized_at = now() WHERE id = $1`,
    [lead.id, `Client anonymisé n°${lead.id}`, `anonyme-${lead.id}@invalid`, JSON.stringify(garde)],
  );
  // Historique : les textes libres sont effacés, et toute trace du nom, de
  // l'e-mail ou du téléphone est retirée des messages automatiques.
  await q(`UPDATE lead_events SET message = NULL WHERE lead_id = $1 AND type IN ('note', 'cotes_maj', 'rappel_demande')`, [lead.id]);
  for (const [needle, label] of [[lead.email, "[e-mail effacé]"], [lead.name, "[nom effacé]"], [lead.phone, "[téléphone effacé]"]] as const) {
    if (needle && needle.length >= 3)
      await q(`UPDATE lead_events SET message = replace(message, $2, $3) WHERE lead_id = $1 AND message IS NOT NULL`, [lead.id, needle, label]);
  }
  // Journal des modifications : le contenu des devis de ce client n'y est plus conservé.
  await q(
    `UPDATE audit_log SET before = NULL, after = NULL
     WHERE entity = 'quote' AND entity_id IN (SELECT id::text FROM quotes WHERE lead_id = $1)`,
    [lead.id],
  );
  await q(
    `UPDATE quotes SET client = jsonb_build_object('name', $2::text, 'email', '', 'phone', '', 'address', ''), sent_to = NULL,
            snapshot = CASE WHEN snapshot IS NULL THEN NULL ELSE snapshot - 'client' END
     WHERE lead_id = $1`,
    [lead.id, `Client anonymisé n°${lead.id}`],
  );
  await addEvent(lead.id, "info", `Données personnelles anonymisées par ${g.user.name} (demande RGPD)`);
  await audit(g.user.name, "rgpd_anonymisation", "lead", lead.id);
  return NextResponse.json({ ok: true });
}
