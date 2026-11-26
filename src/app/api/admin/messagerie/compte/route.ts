import { NextResponse } from "next/server";
import { adminQuery as q } from "@/lib/admin/db";
import { acces, corps, refuse } from "@/lib/messagerie/acces";
import { cleConfiguree } from "@/lib/messagerie/chiffrement";
import { comptePublic, globaux, jetonARevoquer, journal, reglagesDe, scellerMotDePasse, type Compte } from "@/lib/messagerie/comptes";
import { testerSmtp } from "@/lib/messagerie/envoi";
import { AUTRE, FOURNISSEURS, fournisseurParCle } from "@/lib/messagerie/fournisseurs";
import { iaConfiguree } from "@/lib/messagerie/ia";
import { erreurLisible, testerConnexion } from "@/lib/messagerie/imap";
import { sanitizeReglages } from "@/lib/messagerie/modele";
import { estOAuth, oauthConfigure, revoquer } from "@/lib/messagerie/oauth";
import { detecterFournisseur, verifierServeur } from "@/lib/messagerie/reseau";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 45;

const publicFournisseur = (f: typeof AUTRE) => ({ cle: f.cle, nom: f.nom, imap: f.imap, smtp: f.smtp, oauth: f.oauth ?? null, oauthObligatoire: Boolean(f.oauthObligatoire), oauthPret: f.oauth ? oauthConfigure(f.oauth) : false, aide: f.aide });

/** État de la messagerie pour l'utilisateur connecté. */
export async function GET(req: Request) {
  const a = await acces(req);
  if (a.refus) return a.refus;
  const g = await globaux();
  return NextResponse.json({
    pret: { chiffrement: cleConfiguree(), ia: iaConfiguree && g.ia, iaCle: iaConfiguree, iaAutorisee: g.ia },
    compte: a.compte ? comptePublic(a.compte) : null,
    fournisseurs: [...FOURNISSEURS, AUTRE].map(publicFournisseur),
  });
}

const txt = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** Configuration automatique, test de connexion, connexion ou modification de la boîte. */
export async function POST(req: Request) {
  const a = await acces(req);
  if (a.refus) return a.refus;
  const b = await corps(req);
  if (!b) return refuse("Demande illisible.", 400);

  if (b.action === "detecter") {
    const f = await detecterFournisseur(txt(b.email, 320));
    return NextResponse.json({ ok: true, fournisseur: f ? publicFournisseur(f) : null });
  }
  if (b.action !== "tester" && b.action !== "connecter") return refuse("Action inconnue.", 400);
  if (!cleConfiguree()) return refuse("La clé de chiffrement n'est pas configurée sur le serveur (variable MESSAGERIE_SECRET). Aucun identifiant ne peut être enregistré.", 503);

  const email = txt(b.email, 320).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return refuse("Adresse e-mail invalide.");
  const f = fournisseurParCle(txt(b.fournisseur, 30));
  if (f.oauthObligatoire) return refuse(f.aide);
  const imap = (b.imap ?? {}) as Record<string, unknown>;
  const smtp = (b.smtp ?? {}) as Record<string, unknown>;
  const pass = typeof b.pass === "string" ? b.pass : "";
  const existant = a.compte && a.compte.auth === "password" ? a.compte : null;
  if (!pass && !existant) return refuse("Renseignez le mot de passe (ou le mot de passe d'application).");
  const param = {
    email,
    nom: txt(b.nom, 120) || a.user.name,
    fournisseur: f.cle,
    imap_host: txt(imap.host, 255).toLowerCase(),
    imap_port: Math.round(Number(imap.port)) || 993,
    imap_secure: imap.secure !== false,
    imap_user: txt(b.user, 320) || email,
    smtp_host: txt(smtp.host, 255).toLowerCase(),
    smtp_port: Math.round(Number(smtp.port)) || 465,
    smtp_secure: smtp.secure !== false,
  };
  if (!param.imap_host) return refuse("Renseignez le serveur IMAP.");
  const pb = (await verifierServeur(param.imap_host, param.imap_port, "imap")) ?? (param.smtp_host ? await verifierServeur(param.smtp_host, param.smtp_port, "smtp") : null);
  if (pb) return refuse(pb);

  const secret = pass ? scellerMotDePasse(pass) : (existant as Compte).secret;
  const essai = { id: 0, auth: "password" as const, secret, ...param };
  let dossiers;
  try {
    dossiers = await testerConnexion(essai);
  } catch (e) {
    await journal(a.user.id, email, "connexion_refusee", erreurLisible(e));
    return refuse(erreurLisible(e));
  }
  let avertissement: string | null = null;
  if (param.smtp_host) {
    try {
      await testerSmtp({ ...(essai as unknown as Compte), dossiers });
    } catch {
      avertissement = "La lecture fonctionne, mais le serveur d'envoi (SMTP) a refusé la connexion : vérifiez son nom, son port et le réglage SSL/TLS. Les brouillons seront bien préparés ; l'envoi depuis le back office ne fonctionnera pas tant que ce n'est pas corrigé.";
    }
  } else avertissement = "Sans serveur d'envoi (SMTP), les brouillons sont préparés dans votre boîte mais l'envoi se fait depuis votre logiciel de messagerie.";
  if (b.action === "tester") return NextResponse.json({ ok: true, dossiers, avertissement });

  // Changer d'adresse revient à connecter une autre boîte : l'ancienne est retirée avec ses messages.
  if (a.compte && a.compte.email !== email) await q("DELETE FROM mail_accounts WHERE id = $1 AND user_id = $2", [a.compte.id, a.user.id]);
  const rows = await q<Compte>(
    `INSERT INTO mail_accounts (user_id, email, nom, fournisseur, auth, imap_host, imap_port, imap_secure, imap_user, smtp_host, smtp_port, smtp_secure, secret, dossiers)
     VALUES ($1, $2, $3, $4, 'password', $5, $6, $7, $8, $9, $10, $11, $12, $13)
     ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, nom = EXCLUDED.nom, fournisseur = EXCLUDED.fournisseur, auth = 'password', imap_host = EXCLUDED.imap_host, imap_port = EXCLUDED.imap_port,
       imap_secure = EXCLUDED.imap_secure, imap_user = EXCLUDED.imap_user, smtp_host = EXCLUDED.smtp_host, smtp_port = EXCLUDED.smtp_port, smtp_secure = EXCLUDED.smtp_secure, secret = EXCLUDED.secret,
       dossiers = EXCLUDED.dossiers, statut = 'ok', erreur = NULL, updated_at = now()
     RETURNING *`,
    [a.user.id, param.email, param.nom, param.fournisseur, param.imap_host, param.imap_port, param.imap_secure, param.imap_user, param.smtp_host, param.smtp_port, param.smtp_secure, secret, JSON.stringify(dossiers)],
  );
  await planifier(rows[0].id, "sync", rows[0].id);
  await journal(a.user.id, email, a.compte ? "boite_modifiee" : "boite_connectee", `${param.imap_host}:${param.imap_port}`);
  return NextResponse.json({ ok: true, compte: comptePublic(rows[0]), avertissement });
}

/** Réglages personnels du commercial. */
export async function PATCH(req: Request) {
  const a = await acces(req);
  if (a.refus) return a.refus;
  if (!a.compte) return refuse("Aucune boîte mail connectée.", 409);
  const b = await corps(req);
  if (!b) return refuse("Demande illisible.", 400);
  const reglages = sanitizeReglages(b.reglages, reglagesDe(a.compte));
  const nom = typeof b.nom === "string" && b.nom.trim() ? b.nom.trim().slice(0, 120) : a.compte.nom;
  await q("UPDATE mail_accounts SET reglages = $2, nom = $3, updated_at = now() WHERE id = $1 AND user_id = $4", [a.compte.id, JSON.stringify(reglages), nom, a.user.id]);
  await journal(a.user.id, a.compte.email, "reglages_modifies");
  return NextResponse.json({ ok: true, reglages, nom });
}

/** Déconnexion : accès retiré chez le fournisseur, identifiants, messages et brouillons effacés du back office. */
export async function DELETE(req: Request) {
  const a = await acces(req);
  if (a.refus) return a.refus;
  if (!a.compte) return NextResponse.json({ ok: true });
  const jeton = jetonARevoquer(a.compte);
  if (jeton && estOAuth(a.compte.auth)) await revoquer(a.compte.auth, jeton);
  await q("DELETE FROM mail_accounts WHERE id = $1 AND user_id = $2", [a.compte.id, a.user.id]);
  await journal(a.user.id, a.compte.email, "boite_deconnectee");
  return NextResponse.json({ ok: true });
}
