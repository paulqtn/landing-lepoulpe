import { requireAdmin } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/db";
import { site } from "@/lib/site";

/** Export CSV des demandes (filtres statut / q identiques à la liste). */
export async function GET(req: Request) {
  const guard = requireAdmin(req);
  if (guard) return guard;
  const url = new URL(req.url);
  const leads = await listLeads({
    statut: url.searchParams.get("statut") ?? undefined,
    search: url.searchParams.get("q") ?? undefined,
    limit: 500,
  });

  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = [
    "id", "date", "nom", "email", "telephone", "source", "score", "points", "statut",
    "estimation_ttc", "relances", "prochaine_relance", "assigne", "vues_devis", "ouvertures", "clics", "lien_devis",
  ].join(";");
  const lignes = leads.map((l) =>
    [
      l.id,
      new Date(l.created_at).toLocaleString("fr-FR"),
      l.name, l.email, l.phone, l.source ?? "", l.score, l.score_points, l.statut,
      l.estimation_ttc ?? "", l.relances,
      l.next_relance_at ? new Date(l.next_relance_at).toLocaleDateString("fr-FR") : "",
      l.assigned_to ?? "", l.devis_views, l.opens, l.clicks,
      l.token ? `${site.url}/d/${l.token}` : "",
    ].map(esc).join(";"),
  );

  return new Response("﻿" + [header, ...lignes].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
