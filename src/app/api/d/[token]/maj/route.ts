import { NextResponse } from "next/server";
import { addEvent, getLeadByToken, updateLead } from "@/lib/admin/db";
import { rescoreLead } from "@/lib/admin/rescore";
import { chiffrer } from "@/lib/calculateur/engine";

/** Le client corrige ses cotes : on recalcule le tarif avec le moteur. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const lead = await getLeadByToken(token);
  if (!lead) return NextResponse.json({ error: "introuvable" }, { status: 404 });

  let body: { cotes?: unknown; hauteur?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "json invalide" }, { status: 400 });
  }

  const cotes = (Array.isArray(body.cotes) ? body.cotes : [])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 200)
    .slice(0, 6);
  const hauteur = Number(body.hauteur);
  if (cotes.length === 0 || ![90, 100, 110].includes(hauteur)) {
    return NextResponse.json({ error: "paramètres invalides" }, { status: 422 });
  }

  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const systeme = String(a.systeme ?? "rail");
  const piscine = String(a.lieu ?? a.usage ?? "").includes("piscine");
  const verre =
    typeof a.verre === "string" && ["66.4", "88.4", "1010.4"].includes(a.verre)
      ? (a.verre as "66.4" | "88.4" | "1010.4")
      : typeof a.epaisseur === "string" && ["66.4", "88.4", "1010.4"].includes(a.epaisseur)
        ? (a.epaisseur as "66.4" | "88.4" | "1010.4")
        : piscine
          ? ("66.4" as const)
          : ("88.4" as const);
  const fixation =
    systeme === "spider" ? ("GS-02" as const)
    : systeme === "pinces" ? (verre === "66.4" ? ("GS-07-A" as const) : ("GS-07-C" as const))
    : ("GS-19-L" as const);
  const teinte =
    typeof a.teinte === "string" && ["clair", "extra-clair", "fume-1f", "fume-2f"].includes(a.teinte)
      ? (a.teinte as "clair" | "extra-clair" | "fume-1f" | "fume-2f")
      : ("clair" as const);

  const r = chiffrer({
    troncons: cotes.map((longueur) => ({ longueur, escalier: String(a.lieu ?? "") === "escalier" })),
    fixation,
    verre,
    teinte,
    hauteurFinie: hauteur,
    couleur: "anodise",
    departement: typeof a.codePostal === "string" ? a.codePostal.slice(0, 2) : undefined,
    livraison: "livraison",
  });

  const ancien = lead.estimation_ttc ? Number(lead.estimation_ttc) : null;
  await updateLead(lead.id, {
    answers: { ...a, cotes, hauteur: String(hauteur), estimationTTC: r.prixTTC },
    estimation_ttc: String(r.prixTTC),
  });
  await addEvent(
    lead.id,
    "cotes_maj",
    `✏️ Cotes corrigées par le client : ${cotes.join(" m + ")} m, h ${hauteur} cm — tarif ${ancien ? `${Math.round(ancien)} € → ` : ""}${Math.round(r.prixTTC)} € TTC`,
  );
  await rescoreLead(lead.id);

  return NextResponse.json({ ok: true, ttc: r.prixTTC });
}
