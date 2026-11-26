import { NextResponse } from "next/server";
import { hasMenu, userFromRequest } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { CATEGORIE_LABELS } from "@/lib/messagerie/modele";

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
  // Messagerie : e-mail urgent trié, réponse prête à valider (selon les réglages du commercial, sur sa seule boîte).
  const courriels = hasMenu(user, "messagerie")
    ? await q<{ id: number; categorie: string | null; genre: string }>(
        `SELECT m.id, m.categorie, 'urgent' AS genre FROM mail_messages m JOIN mail_accounts a ON a.id = m.account_id
         WHERE a.user_id = $1 AND m.dossier = 'inbox' AND m.priorite = 'urgent' AND m.ia_at > $2 AND COALESCE((a.reglages->>'notifUrgent')::boolean, true)
         UNION ALL
         SELECT m.id, m.categorie, 'brouillon' AS genre FROM mail_drafts d JOIN mail_messages m ON m.id = d.message_id JOIN mail_accounts a ON a.id = d.account_id
         WHERE a.user_id = $1 AND d.statut = 'brouillon' AND d.origine = 'ia' AND d.created_at > $2 AND COALESCE((a.reglages->>'notifBrouillon')::boolean, true)
         LIMIT 10`,
        [user.id, since.toISOString()],
      ).catch(() => [])
    : [];
  return NextResponse.json({
    now: now.toISOString(),
    alertes: [
      ...demandes.map((d) => ({ cle: `d${d.id}`, titre: "Nouvelle demande", texte: `${d.name}${d.estimation_ttc ? ` · ${Math.round(Number(d.estimation_ttc)).toLocaleString("fr-FR")} € TTC` : ""}`, href: "/commercial" })),
      ...courriels.map((c) => ({ cle: `mail-${c.genre}-${c.id}`, titre: c.genre === "urgent" ? "E-mail urgent" : "Réponse prête à valider", texte: (CATEGORIE_LABELS as Record<string, string>)[c.categorie ?? ""] ?? "Ouvrir le message", href: `/commercial/messagerie?m=${c.id}` })),
      ...clients.map((c) => ({ cle: `${c.type}${c.id}`, titre: c.type === "devis_accepte" ? "Devis validé en ligne" : "Demande de rappel", texte: c.name, href: `/commercial/clients/${c.id}` })),
    ],
  });
}
