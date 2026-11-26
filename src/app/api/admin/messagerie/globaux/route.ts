import { NextResponse } from "next/server";
import { canManageSettings, userFromRequest } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { setSetting } from "@/lib/admin/settings";
import { corps, refuse } from "@/lib/messagerie/acces";
import { cleConfiguree } from "@/lib/messagerie/chiffrement";
import { globaux, journal } from "@/lib/messagerie/comptes";
import { iaConfiguree } from "@/lib/messagerie/ia";
import { sanitizeGlobaux } from "@/lib/messagerie/modele";
import { oauthConfigure } from "@/lib/messagerie/oauth";

/* Réglages communs de la messagerie, réservés aux administrateurs. L'administrateur voit quelles
   boîtes sont connectées et leur état, jamais leur contenu. */
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!canManageSettings(user)) return refuse("Réservé aux administrateurs.", 403);
  const boites = await q<{ nom: string; email: string; statut: string; erreur: string | null; last_sync_at: string | null; utilisateur: string }>(
    "SELECT a.nom, a.email, a.statut, a.erreur, a.last_sync_at, u.name AS utilisateur FROM mail_accounts a JOIN users u ON u.id = a.user_id ORDER BY u.name",
  );
  return NextResponse.json({ ok: true, globaux: await globaux(), boites, serveur: { chiffrement: cleConfiguree(), ia: iaConfiguree, google: oauthConfigure("google"), microsoft: oauthConfigure("microsoft") } });
}

export async function PUT(req: Request) {
  const user = await userFromRequest(req);
  if (!user || !canManageSettings(user)) return refuse("Réservé aux administrateurs.", 403);
  const b = await corps(req);
  if (!b) return refuse("Demande illisible.", 400);
  const valeur = sanitizeGlobaux(b, await globaux());
  await setSetting("messagerie", valeur, user.name);
  await journal(user.id, user.email, "reglages_globaux_modifies");
  return NextResponse.json({ ok: true, globaux: valeur });
}
