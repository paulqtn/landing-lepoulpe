import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { addEvent, insertLead, updateLead } from "@/lib/admin/db";
import { computeScore } from "@/lib/admin/scoring";
import { chiffrer } from "@/lib/calculateur/engine";

/* Crée des leads de démonstration avec des tarifs calculés par le vrai moteur. */

function prix(troncons: number[], fixation: "GS-19-L" | "GS-07-C" | "GS-02", verre: "66.4" | "88.4", hauteur: 90 | 100 | 110, dept?: string): number {
  return Math.round(
    chiffrer({
      troncons: troncons.map((longueur) => ({ longueur, escalier: false })),
      fixation,
      verre,
      teinte: "clair",
      hauteurFinie: hauteur,
      couleur: "anodise",
      departement: dept,
      livraison: "livraison",
    }).prixTTC,
  );
}

export async function POST(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;

  const demos = [
    {
      name: "Démo — Claire Fontaine",
      email: "claire.demo@exemple.fr",
      phone: "06 11 22 33 44",
      source: "configurateur-piscine",
      answers: {
        lieu: "piscine", systeme: "rail", cotes: [3, 2], hauteur: "110", teinte: "clair",
        installation: "installateur", codePostal: "83000",
      },
      estimation: prix([3, 2], "GS-19-L", "66.4", 110, "83"),
    },
    {
      name: "Démo — Marc Olivier",
      email: "marc.demo@exemple.fr",
      phone: "06 55 66 77 88",
      source: "fiche-produit",
      answers: { systeme: "pinces", cotes: [4], hauteur: "100", epaisseur: "88.4", teinte: "extra-clair", codePostal: "69003" },
      estimation: prix([4], "GS-07-C", "88.4", 100, "69"),
    },
    {
      name: "Démo — Julie Perrin",
      email: "julie.demo@exemple.fr",
      phone: "07 99 88 77 66",
      source: "configurateur-devis",
      answers: { lieu: "interieur", systeme: "conseil", cotes: [2], hauteur: "90", teinte: "fume-1f" },
      estimation: null as number | null,
    },
  ];

  const crees: { id: number; token: string | null; score: string }[] = [];
  for (const d of demos) {
    const answers = { ...d.answers, ...(d.estimation ? { estimationTTC: d.estimation } : {}) };
    const s = computeScore({ estimationTTC: d.estimation, source: d.source, answers });
    const lead = await insertLead({
      name: d.name, email: d.email, phone: d.phone, source: d.source,
      answers, estimationTTC: d.estimation, score: s.grade, scorePoints: s.points,
    });
    await addEvent(lead.id, "creation", `Demande reçue (${d.source}) — score ${s.grade} (${s.points} pts) [démo]`);
    if (d.estimation) {
      await updateLead(lead.id, {
        statut: "devis_envoye",
        // échéance déjà passée : la démo alimente « relances à traiter »
        next_relance_at: new Date(Date.now() - 3600_000).toISOString(),
      });
      await addEvent(lead.id, "devis_envoye", "Email de devis automatique envoyé [démo]");
    }
    crees.push({ id: lead.id, token: lead.token, score: s.grade });
  }

  return NextResponse.json({ ok: true, leads: crees });
}
