import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { addEvent, adminQuery as q, insertLead, updateLead } from "@/lib/admin/db";
import { chiffrageDepuisLead, ensureDraftForLead } from "@/lib/admin/quotes";
import { computeScore } from "@/lib/admin/scoring";

/* Création d'une fiche prospect à la main (appel direct, recommandation, salon…).
   Le prospect est attribué à la personne qui le saisit : c'est son contact, il ne passe pas
   par la file des demandes du site. Si le projet est renseigné, il est chiffré et son
   brouillon de devis est préparé, comme pour une demande du site. */

const ORIGINES: Record<string, string> = {
  appel: "Appel direct",
  recommandation: "Recommandation",
  salon: "Salon ou événement",
  passage: "Passage au dépôt",
  autre: "Autre",
};
const LIEUX = ["piscine", "escalier", "balcon", "terrasse", "mezzanine", "fenetre", "interieur", "exterieur"];
const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const g = await requireMenuApi(req, ["clients", "etat"]);
  if (g.denied) return g.denied;
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const refus = (error: string) => NextResponse.json({ ok: false, error }, { status: 422 });
  const name = s(b.name, 120);
  const email = s(b.email, 200).toLowerCase();
  const phone = s(b.phone, 40);
  if (name.length < 2) return refus("Indiquez le nom du prospect.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return refus("L'adresse e-mail n'est pas valide.");
  if (!email && phone.replace(/\D/g, "").length < 8) return refus("Indiquez au moins un téléphone ou un e-mail.");
  const origine = Object.keys(ORIGINES).includes(String(b.origine)) ? String(b.origine) : "appel";

  // Projet : tout est facultatif, mais ce qui est saisi doit être cohérent.
  const answers: Record<string, unknown> = {};
  if (b.lieu) { if (!LIEUX.includes(String(b.lieu))) return refus("Type de projet inconnu."); answers.lieu = b.lieu; }
  if (b.systeme) { if (!["rail", "pinces", "spider", "conseil"].includes(String(b.systeme))) return refus("Fixation inconnue."); answers.systeme = b.systeme; }
  if (b.teinte) { if (!["clair", "extra-clair", "fume-1f", "fume-2f"].includes(String(b.teinte))) return refus("Teinte inconnue."); answers.teinte = b.teinte; }
  if (b.hauteur) { if (![90, 100, 110].includes(Number(b.hauteur))) return refus("Hauteur invalide (90, 100 ou 110 cm)."); answers.hauteur = Number(b.hauteur); }
  const cotes = (Array.isArray(b.cotes) ? b.cotes : []).map(Number);
  if (cotes.length) {
    if (cotes.length > 6 || cotes.some((n) => !Number.isFinite(n) || n <= 0 || n > 200)) return refus("Longueurs invalides : de 1 à 6 tronçons, en mètres.");
    answers.cotes = cotes.map((n) => Math.round(n * 100) / 100);
  }
  const cp = s(b.codePostal, 5);
  if (cp) { if (!/^\d{5}$/.test(cp)) return refus("Code postal invalide (5 chiffres)."); answers.codePostal = cp; }

  // Doublon : la même adresse e-mail ou le même numéro existe déjà. Si ce client attend dans la
  // file ou est suivi par un collègue, seul un administrateur peut créer une seconde fiche :
  // sinon la création à la main servirait à sortir un client de la file.
  {
    const chiffres = phone.replace(/\D/g, "");
    const deja = (await q<{ id: number; name: string; assigned_to: string | null }>(
      `SELECT id, name, assigned_to FROM leads WHERE anonymized_at IS NULL AND (($1 <> '' AND lower(email) = $1) OR ($2 <> '' AND regexp_replace(phone, '\\D', '', 'g') = $2)) ORDER BY (assigned_to IS DISTINCT FROM $3) DESC, id DESC LIMIT 1`,
      [email, chiffres.length >= 8 ? chiffres : "", g.user.name],
    ))[0];
    if (deja) {
      const admin = g.user.role === "superadmin" || g.user.role === "admin";
      const aMoi = deja.assigned_to === g.user.name;
      const forcable = admin || aMoi;
      if (b.forcer !== true || !forcable)
        return NextResponse.json(
          {
            ok: false,
            doublon: { id: deja.id, name: deja.name, suiviPar: deja.assigned_to, forcable },
            error: aMoi
              ? `Vous suivez déjà ce client : ${deja.name}.`
              : deja.assigned_to
                ? `Ce client est déjà suivi par ${deja.assigned_to} (${deja.name}). Seul un administrateur peut créer une seconde fiche.`
                : `Ce client attend déjà dans la file des demandes (${deja.name}) : il se prend dans l'ordre d'arrivée. Seul un administrateur peut créer une seconde fiche.`,
          },
          { status: 409 },
        );
    }
  }

  const source = `manuel-${origine}`;
  let lead = await insertLead({ name, email, phone, source, answers });
  await updateLead(lead.id, { assigned_to: g.user.name });
  await addEvent(lead.id, "creation", `Fiche créée à la main par ${g.user.name} — ${ORIGINES[origine]}`);
  const note = s(b.note, 1500);
  if (note) await addEvent(lead.id, "note", note);

  lead = { ...lead, assigned_to: g.user.name };
  const c = await chiffrageDepuisLead(lead);
  if (c) {
    const score = computeScore({ estimationTTC: c.r.prixTTC, source, answers });
    await updateLead(lead.id, { estimation_ttc: String(c.r.prixTTC), answers: { ...answers, estimationTTC: c.r.prixTTC }, score: score.grade, score_points: score.points });
    await ensureDraftForLead({ ...lead, estimation_ttc: String(c.r.prixTTC) }, g.user.name, "manuel");
  }
  return NextResponse.json({ ok: true, id: lead.id });
}
