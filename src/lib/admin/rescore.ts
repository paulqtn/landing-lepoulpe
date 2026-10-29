import { getLead, updateLead } from "./db";
import { computeScore } from "./scoring";

/** Recalcule le score d'un lead après un signal d'engagement. */
export async function rescoreLead(leadId: number): Promise<void> {
  const lead = await getLead(leadId);
  if (!lead) return;
  const s = computeScore({
    estimationTTC: lead.estimation_ttc ? Number(lead.estimation_ttc) : null,
    source: lead.source,
    answers: (lead.answers ?? {}) as Record<string, unknown>,
    engagement: { opens: lead.opens, clicks: lead.clicks, devis_views: lead.devis_views },
  });
  if (s.grade !== lead.score || s.points !== lead.score_points) {
    await updateLead(lead.id, { score: s.grade, score_points: s.points });
  }
}
