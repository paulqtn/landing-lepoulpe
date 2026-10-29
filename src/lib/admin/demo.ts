import type { Lead, LeadEvent } from "./db";
import { computeScore } from "./scoring";
import { chiffrer } from "@/lib/calculateur/engine";

/* ================================================================== */
/*  MODE DÉMO — sans base de données connectée, le back office sert    */
/*  trois clients fictifs calculés à la volée (tarifs réels du moteur) */
/*  pour pouvoir tout tester. Rien n'est enregistré dans ce mode.      */
/* ================================================================== */

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

const h = 3600_000;
let cache: { leads: Lead[]; events: Record<number, LeadEvent[]> } | null = null;

function iso(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString();
}

function build(): { leads: Lead[]; events: Record<number, LeadEvent[]> } {
  if (cache) return cache;

  const defs = [
    {
      id: 1,
      name: "Démo — Claire Fontaine",
      email: "claire.demo@exemple.fr",
      phone: "06 11 22 33 44",
      source: "configurateur-piscine",
      answers: { lieu: "piscine", systeme: "rail", cotes: [3, 2], hauteur: "110", teinte: "clair", installation: "installateur", codePostal: "83000" },
      estimation: prix([3, 2], "GS-19-L", "66.4", 110, "83"),
      createdAgo: 26 * h,
      engagement: { opens: 1, clicks: 1, devis_views: 2 },
      statut: "devis_envoye" as const,
      nextRelanceAgo: 2 * h, // échue → alimente « relances à traiter »
      token: "000000000000000000000001",
    },
    {
      id: 2,
      name: "Démo — Marc Olivier",
      email: "marc.demo@exemple.fr",
      phone: "06 55 66 77 88",
      source: "fiche-produit",
      answers: { systeme: "pinces", cotes: [4], hauteur: "100", epaisseur: "88.4", teinte: "extra-clair", codePostal: "69003" },
      estimation: prix([4], "GS-07-C", "88.4", 100, "69"),
      createdAgo: 20 * h,
      engagement: { opens: 0, clicks: 0, devis_views: 0 },
      statut: "devis_envoye" as const,
      nextRelanceAgo: 1 * h,
      token: "000000000000000000000002",
    },
    {
      id: 3,
      name: "Démo — Julie Perrin",
      email: "julie.demo@exemple.fr",
      phone: "07 99 88 77 66",
      source: "configurateur-devis",
      answers: { lieu: "interieur", systeme: "conseil", cotes: [2], hauteur: "90", teinte: "fume-1f" },
      estimation: null as number | null,
      createdAgo: 3 * h,
      engagement: { opens: 0, clicks: 0, devis_views: 0 },
      statut: "nouveau" as const,
      nextRelanceAgo: -46 * h, // à venir
      token: "000000000000000000000003",
    },
  ];

  const leads: Lead[] = defs.map((d) => {
    const answers = { ...d.answers, ...(d.estimation ? { estimationTTC: d.estimation } : {}) };
    const s = computeScore({ estimationTTC: d.estimation, source: d.source, answers, engagement: d.engagement });
    return {
      id: d.id,
      created_at: iso(d.createdAgo),
      name: d.name,
      email: d.email,
      phone: d.phone,
      source: d.source,
      answers,
      estimation_ttc: d.estimation !== null ? String(d.estimation) : null,
      statut: d.statut,
      relances: 0,
      next_relance_at: iso(d.nextRelanceAgo),
      assigned_to: null,
      score: s.grade,
      score_points: s.points,
      token: d.token,
      opens: d.engagement.opens,
      clicks: d.engagement.clicks,
      devis_views: d.engagement.devis_views,
      last_activity_at: d.engagement.devis_views > 0 ? iso(5 * h) : null,
    };
  });

  const events: Record<number, LeadEvent[]> = {};
  let eid = 1;
  for (const l of leads) {
    const list: LeadEvent[] = [];
    const push = (type: string, message: string, agoMs: number) =>
      list.push({ id: eid++, lead_id: l.id, created_at: iso(agoMs), type, message });
    if (l.devis_views > 0) push("devis_consulte", "Le client a consulté son devis en ligne", 5 * h);
    if (l.clicks > 0) push("email_clique", "Le client a cliqué dans un email", 6 * h);
    if (l.opens > 0) push("email_ouvert", "Le client a ouvert un email", 7 * h);
    if (l.statut === "devis_envoye") push("devis_envoye", "Email de devis automatique envoyé [démo]", Number(new Date()) - Number(new Date(l.created_at)) - 60_000);
    push("creation", `Demande reçue (${l.source}) — score ${l.score} (${l.score_points} pts) [démo]`, Number(new Date()) - Number(new Date(l.created_at)));
    events[l.id] = list;
  }

  cache = { leads, events };
  return cache;
}

export function demoLeads(): Lead[] {
  return build().leads.map((l) => ({ ...l }));
}

export function demoLead(id: number): Lead | null {
  return build().leads.find((l) => l.id === id) ?? null;
}

export function demoLeadByToken(token: string): Lead | null {
  return build().leads.find((l) => l.token === token) ?? null;
}

export function demoEvents(leadId: number): LeadEvent[] {
  return (build().events[leadId] ?? []).map((e) => ({ ...e }));
}
