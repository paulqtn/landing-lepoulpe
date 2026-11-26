import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminQuery as q } from "@/lib/admin/db";
import { acces } from "@/lib/messagerie/acces";
import { journal, scellerJetons, type Compte } from "@/lib/messagerie/comptes";
import { FOURNISSEURS } from "@/lib/messagerie/fournisseurs";
import { erreurLisible, testerConnexion } from "@/lib/messagerie/imap";
import { echangerCode, estOAuth } from "@/lib/messagerie/oauth";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 45;

/** Retour de Google ou Microsoft : échange du code, test de la boîte, enregistrement des jetons chiffrés. */
export async function GET(req: Request, { params }: { params: Promise<{ fournisseur: string }> }) {
  const url = new URL(req.url);
  const retour = (message: string, ok = false) => {
    const res = NextResponse.redirect(new URL(`/commercial/messagerie?${ok ? "connecte=1" : `oauth=${encodeURIComponent(message)}`}`, url.origin));
    res.cookies.set("mgk_oauth", "", { path: "/api/admin/messagerie/oauth", maxAge: 0 });
    return res;
  };
  const a = await acces(req);
  if (a.refus) return retour("Connectez-vous au back office.");
  const { fournisseur } = await params;
  if (!estOAuth(fournisseur)) return retour("Fournisseur inconnu.");
  const attendu = (req.headers.get("cookie") ?? "").split(";").map((c) => c.trim()).find((c) => c.startsWith("mgk_oauth="))?.slice(10) ?? "";
  const recu = `${fournisseur}.${url.searchParams.get("state") ?? ""}`;
  if (!attendu || attendu.length !== recu.length || !timingSafeEqual(Buffer.from(attendu), Buffer.from(recu))) return retour("La demande de connexion a expiré : recommencez.");
  if (url.searchParams.get("error")) return retour("Vous avez refusé l'accès, ou le fournisseur l'a bloqué.");
  const code = url.searchParams.get("code");
  if (!code) return retour("Réponse du fournisseur incomplète.");
  try {
    const j = await echangerCode(fournisseur, code, url.origin);
    if (!j.email) return retour("Le fournisseur n'a pas indiqué l'adresse de la boîte.");
    if (!j.refresh) return retour("Le fournisseur n'a pas accordé d'accès durable : retirez l'accès existant dans votre compte, puis recommencez.");
    const f = FOURNISSEURS.find((x) => x.oauth === fournisseur)!;
    const secret = scellerJetons({ access: j.access, refresh: j.refresh, expire: j.expire });
    const param = { imap_host: f.imap.host, imap_port: f.imap.port, imap_secure: f.imap.secure, imap_user: j.email };
    const dossiers = await testerConnexion({ id: 0, auth: fournisseur, secret, ...param });
    if (a.compte && a.compte.email !== j.email) await q("DELETE FROM mail_accounts WHERE id = $1 AND user_id = $2", [a.compte.id, a.user.id]);
    const rows = await q<Compte>(
      `INSERT INTO mail_accounts (user_id, email, nom, fournisseur, auth, imap_host, imap_port, imap_secure, imap_user, smtp_host, smtp_port, smtp_secure, secret, dossiers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, fournisseur = EXCLUDED.fournisseur, auth = EXCLUDED.auth, imap_host = EXCLUDED.imap_host, imap_port = EXCLUDED.imap_port, imap_secure = EXCLUDED.imap_secure,
         imap_user = EXCLUDED.imap_user, smtp_host = EXCLUDED.smtp_host, smtp_port = EXCLUDED.smtp_port, smtp_secure = EXCLUDED.smtp_secure, secret = EXCLUDED.secret, dossiers = EXCLUDED.dossiers, statut = 'ok', erreur = NULL, updated_at = now()
       RETURNING *`,
      [a.user.id, j.email, a.user.name, f.cle, fournisseur, param.imap_host, param.imap_port, param.imap_secure, j.email, f.smtp.host, f.smtp.port, f.smtp.secure, secret, JSON.stringify(dossiers)],
    );
    await planifier(rows[0].id, "sync", rows[0].id);
    await journal(a.user.id, j.email, "boite_connectee", `connexion ${fournisseur}`);
    return retour("", true);
  } catch (e) {
    return retour(erreurLisible(e));
  }
}
