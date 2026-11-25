import { audit, requireMenuApi } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/db";
import { site } from "@/lib/site";

/** Export CSV des demandes (filtres statut / q identiques à la liste). */
export async function GET(req: Request) {
  const g = await requireMenuApi(req, ["clients"]);
  if (g.denied) return g.denied;
  const url = new URL(req.url);
  // Un commercial n'exporte que ses propres clients ; l'export complet est réservé aux administrateurs.
  const complet = g.user.role === "superadmin" || g.user.role === "admin";
  const tous = await listLeads({
    statut: url.searchParams.get("statut") ?? undefined,
    search: url.searchParams.get("q") ?? undefined,
    limit: 20000,
  });
  const leads = complet ? tous : tous.filter((l) => l.assigned_to === g.user.name);
  await audit(g.user.name, "export_clients", "leads", null, undefined, { lignes: leads.length, complet });

  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const header = [
    "id", "date", "nom", "email", "telephone", "source", "score", "points", "statut",
    "estimation_ttc", "relances", "prochaine_relance", "assigne", "vues_devis", "ouvertures", "clics", "lien_devis",
  ].join(";");
  const lignes = leads.map((l) =>
    [
      l.id,
      new Date(l.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }),
      l.name, l.email, l.phone, l.source ?? "", l.score, l.score_points, l.statut,
      l.estimation_ttc ?? "", l.relances,
      l.next_relance_at ? new Date(l.next_relance_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "",
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
