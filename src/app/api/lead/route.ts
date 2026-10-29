import { NextResponse } from "next/server";
import { addEvent, dbConfigured, insertLead, updateLead } from "@/lib/admin/db";
import { mailConfigured, sendDevisEmail, SEQ_DELAIS_JOURS } from "@/lib/admin/mail";
import { computeScore } from "@/lib/admin/scoring";

/**
 * Capture des leads (générateur + fiches produit).
 * Persiste en base, envoie automatiquement l'email de devis quand une
 * estimation est présente, et programme la première relance à J+2.
 * Sans base configurée, on loggue — le site public ne casse jamais.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, email, phone, answers, source } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    name.trim().length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 422 });
  }

  if (!dbConfigured) {
    console.log("[lead] base non configurée — lead loggué :", { name, email, phone, source });
    return NextResponse.json({ ok: true });
  }

  try {
    const a = (answers ?? {}) as Record<string, unknown>;
    const estimation = typeof a.estimationTTC === "number" && Number.isFinite(a.estimationTTC) ? a.estimationTTC : null;
    const src = typeof source === "string" ? source : undefined;
    const score = computeScore({ estimationTTC: estimation, source: src ?? null, answers: a });

    const lead = await insertLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source: src,
      answers: a,
      estimationTTC: estimation,
      score: score.grade,
      scorePoints: score.points,
    });
    await addEvent(lead.id, "creation", `Demande reçue (${lead.source ?? "site"}) — score ${score.grade} (${score.points} pts)`);

    // Première relance programmée selon la cadence de la séquence.
    const nextRelance = new Date(Date.now() + SEQ_DELAIS_JOURS[0] * 86400_000).toISOString();

    if (estimation !== null) {
      const mail = await sendDevisEmail(lead);
      if (mail.sent) {
        await updateLead(lead.id, { statut: "devis_envoye", next_relance_at: nextRelance });
        await addEvent(lead.id, "devis_envoye", "Email de devis automatique envoyé");
      } else {
        await updateLead(lead.id, { next_relance_at: nextRelance });
        await addEvent(lead.id, "devis_echec", `Envoi auto impossible : ${mail.reason}`);
      }
    } else {
      await updateLead(lead.id, { next_relance_at: nextRelance });
      if (!mailConfigured) await addEvent(lead.id, "info", "Emails non configurés (RESEND_API_KEY absente)");
    }
  } catch (e) {
    // Jamais d'échec côté client pour un problème interne.
    console.error("[lead] erreur de persistance :", e);
  }

  return NextResponse.json({ ok: true });
}
