import { NextResponse } from "next/server";
import { addEvent, dbConfigured, insertLead } from "@/lib/admin/db";
import { computeScore } from "@/lib/admin/scoring";

/**
 * Capture des leads (générateur + fiches produit).
 * Persiste en base. Aucun e-mail n'est envoyé automatiquement : le devis
 * est validé puis envoyé à la main depuis le back office.
 * Sans base configurée, le site public ne casse jamais.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, email, phone, answers, source } = (body ?? {}) as Record<string, unknown>;

  // Les demandes de rappel (assistant du tunnel) n'exigent qu'un nom et un
  // téléphone valide — l'email reste obligatoire partout ailleurs.
  const isRappel = source === "rappel-generateur";
  const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneOk = typeof phone === "string" && phone.replace(/\D/g, "").length >= 8;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    name.trim().length < 2 ||
    (!emailOk && !(isRappel && phoneOk))
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 422 });
  }

  if (!dbConfigured) {
    console.error("[lead] base non configurée — demande NON enregistrée (source : %s)", typeof source === "string" ? source : "site");
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

    // Aucun envoi automatique : le devis part uniquement après validation
    // manuelle dans le back office, et les relances ne démarrent qu'ensuite.
    if (estimation !== null) {
      await addEvent(lead.id, "info", "Estimation enregistrée — devis à valider avant envoi");
    }
  } catch (e) {
    // Jamais d'échec côté client pour un problème interne.
    console.error("[lead] erreur de persistance :", e);
  }

  return NextResponse.json({ ok: true });
}
