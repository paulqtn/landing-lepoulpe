import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { acces } from "@/lib/messagerie/acces";
import { cleConfiguree } from "@/lib/messagerie/chiffrement";
import { estOAuth, oauthConfigure, urlAutorisation } from "@/lib/messagerie/oauth";

/** Départ de la connexion sécurisée chez Google ou Microsoft. */
export async function GET(req: Request, { params }: { params: Promise<{ fournisseur: string }> }) {
  const a = await acces(req);
  const url = new URL(req.url);
  const retour = (erreur: string) => NextResponse.redirect(new URL(`/commercial/messagerie?oauth=${encodeURIComponent(erreur)}`, url.origin));
  if (a.refus) return retour("Connectez-vous au back office.");
  const { fournisseur } = await params;
  if (!estOAuth(fournisseur) || !oauthConfigure(fournisseur)) return retour("Cette connexion n'est pas encore configurée sur le serveur.");
  if (!cleConfiguree()) return retour("La clé de chiffrement n'est pas configurée sur le serveur.");
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(urlAutorisation(fournisseur, state, url.origin, url.searchParams.get("email") ?? undefined));
  res.cookies.set("mgk_oauth", `${fournisseur}.${state}`, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/api/admin/messagerie/oauth", maxAge: 600 });
  return res;
}
