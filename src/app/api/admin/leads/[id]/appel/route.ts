import { refusAction } from "@/lib/admin/attribution";
import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, adminQuery as q, getLead, updateLead } from "@/lib/admin/db";
import { controleStatut } from "@/lib/admin/statut-regles";
import { figerMargeAuGain } from "@/lib/admin/marge";
import { dateRelance, getRelanceSettings } from "@/lib/admin/relances";
import type { Statut } from "@/lib/admin/statuts";

/* Compte-rendu d'appel : selon l'issue, le statut change et la séquence
   d'e-mails s'arrête (ou continue si le client n'a pas répondu).
   Action « reprendre » : relance la séquence là où elle s'était arrêtée. */

const ISSUES: Record<string, { statut: Statut | null; label: string }> = {
  discussion: { statut: "en_discussion", label: "Client eu au téléphone — en discussion" },
  reflexion: { statut: "en_reflexion", label: "Client eu au téléphone — il réfléchit" },
  modifier: { statut: "devis_a_modifier", label: "Client eu au téléphone — devis à modifier" },
  sans_reponse: { statut: null, label: "Appel sans réponse" },
  gagne: { statut: "gagne", label: "Client eu au téléphone — affaire signée" },
  perdu: { statut: "perdu", label: "Client eu au téléphone — affaire non signée" },
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ ok: false, error: "introuvable" }, { status: 404 });
  const refusFiche = refusAction(g.user, lead);
  if (refusFiche) return NextResponse.json({ ok: false, error: refusFiche }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  /* ---- reprise de la séquence ---- */
  if (body.action === "reprendre") {
    if (lead.statut === "gagne" || lead.statut === "perdu") return NextResponse.json({ ok: false, error: "Affaire close : la séquence ne peut pas reprendre." }, { status: 409 });
    if (lead.relances >= 3) return NextResponse.json({ ok: false, error: "Les 3 relances ont déjà été envoyées." }, { status: 409 });
    const envoye = await q(
      "SELECT 1 FROM quotes WHERE lead_id = $1 AND statut = 'envoye' UNION ALL SELECT 1 FROM lead_events WHERE lead_id = $1 AND type = 'devis_envoye' LIMIT 1",
      [lead.id],
    );
    if (!envoye.length) return NextResponse.json({ ok: false, error: "Aucun devis n'a encore été envoyé à ce client." }, { status: 409 });
    const next = dateRelance(await getRelanceSettings(), lead.relances + 1);
    const statut = (lead.relances === 0 ? "devis_envoye" : `relance_${lead.relances}`) as Statut;
    await updateLead(lead.id, { statut, next_relance_at: next ? next.toISOString() : null, rappel_at: null });
    await addEvent(lead.id, "info", `Séquence de relances reprise par ${g.user.name} — relance ${lead.relances + 1} le ${next ? next.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "—"}`);
    return NextResponse.json({ ok: true });
  }

  /* ---- compte-rendu d'appel ---- */
  const issue = ISSUES[String(body.issue)];
  if (!issue) return NextResponse.json({ ok: false, error: "Issue de l'appel inconnue." }, { status: 422 });
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 1500) : "";

  let rappel: string | null = null;
  if (body.issue === "reflexion") {
    const d = new Date(String(body.rappelLe ?? ""));
    if (Number.isNaN(d.getTime()) || d.getTime() < Date.now() - 86400_000)
      return NextResponse.json({ ok: false, error: "Indiquez la date à laquelle rappeler le client." }, { status: 422 });
    rappel = d.toISOString();
  }

  let complement = "";
  if (issue.statut) {
    const ctl = await controleStatut(g.user, lead, issue.statut, body);
    if (ctl.error) return NextResponse.json({ ok: false, error: ctl.error }, { status: 409 });
    complement = ctl.detail ? ` — ${ctl.detail}` : "";
    // Le changement de statut arrête de lui-même la séquence d'e-mails (voir updateLead).
    await updateLead(lead.id, { statut: issue.statut, rappel_at: rappel, motif_perte: ctl.motif ?? null });
    if (issue.statut === "gagne") await figerMargeAuGain(lead.id);
  }
  const suite =
    body.issue === "sans_reponse"
      ? " — la séquence d'e-mails continue"
      : body.issue === "reflexion" && rappel
        ? ` — à rappeler le ${new Date(rappel).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}, e-mails arrêtés`
        : issue.statut && issue.statut !== "gagne" && issue.statut !== "perdu"
          ? " — e-mails arrêtés"
          : "";
  await addEvent(lead.id, "appel", `${issue.label}${suite}${complement} (${g.user.name})${note ? `\n${note}` : ""}`);
  return NextResponse.json({ ok: true });
}
