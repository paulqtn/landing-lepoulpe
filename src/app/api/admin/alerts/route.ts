import { NextResponse } from "next/server";
import { hasMenu, userFromRequest } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";

/* Alertes du back office : ce qui est arrivé depuis la dernière vérification de l'écran.
   - nouvelles demandes dans la file (pour ceux qui ont le menu « État des lieux ») ;
   - client qui valide son devis en ligne ou demande à être rappelé (son commercial, les
     administrateurs, et tout le monde tant que le client n'est pas attribué). */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const now = new Date();
  const demande = new Date(new URL(req.url).searchParams.get("since") ?? "");
  // Jamais plus d'une heure en arrière : un onglet resté ouvert ne déverse pas toute la journée.
  const since = new Date(Math.max(Number.isNaN(demande.getTime()) ? now.getTime() : demande.getTime(), now.getTime() - 3600_000));
  const admin = user.role === "superadmin" || user.role === "admin";

  const demandes = hasMenu(user, "etat")
    ? await q<{ id: number; name: string; estimation_ttc: string | null }>(
        "SELECT id, name, estimation_ttc FROM leads WHERE created_at > $1 AND assigned_to IS NULL AND anonymized_at IS NULL ORDER BY id LIMIT 10",
        [since.toISOString()],
      )
    : [];
  const clients = hasMenu(user, "clients") || hasMenu(user, "etat")
    ? await q<{ id: number; name: string; type: string }>(
        `SELECT l.id, l.name, e.type FROM lead_events e JOIN leads l ON l.id = e.lead_id
         WHERE e.created_at > $1 AND e.type IN ('devis_accepte', 'rappel_demande')
           AND ($2 OR l.assigned_to IS NULL OR l.assigned_to = $3)
         ORDER BY e.id LIMIT 10`,
        [since.toISOString(), admin, user.name],
      )
    : [];
  return NextResponse.json({
    now: now.toISOString(),
    alertes: [
      ...demandes.map((d) => ({ cle: `d${d.id}`, titre: "Nouvelle demande", texte: `${d.name}${d.estimation_ttc ? ` · ${Math.round(Number(d.estimation_ttc)).toLocaleString("fr-FR")} € TTC` : ""}`, href: "/commercial" })),
      ...clients.map((c) => ({ cle: `${c.type}${c.id}`, titre: c.type === "devis_accepte" ? "Devis validé en ligne" : "Demande de rappel", texte: c.name, href: `/commercial/clients/${c.id}` })),
    ],
  });
}
