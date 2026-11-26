import { adminQuery as q } from "@/lib/admin/db";
import { getSetting } from "@/lib/admin/settings";
import { chiffrer, dechiffrer } from "./chiffrement";
import { GLOBAUX_DEFAUT, REGLAGES_DEFAUT, sanitizeGlobaux, sanitizeReglages, type Reglages, type ReglagesGlobaux } from "./modele";
import { estOAuth, rafraichir } from "./oauth";

/* Boîtes mail connectées. Une boîte appartient à un seul utilisateur : toutes les lectures
   passent par son identifiant, jamais par celui de la boîte seul. Le secret (mot de passe ou
   jetons) ne sort de ce fichier que pour ouvrir une connexion ; il n'est jamais renvoyé à l'écran. */

export type Dossiers = { inbox: string; drafts: string | null; sent: string | null; archive: string | null };
export type EtatSync = Partial<Record<"inbox" | "sent", { uidValidity: string; lastUid: number }>> & { purgeAt?: string };
type Secret = { type: "password"; pass: string } | { type: "oauth"; access: string; refresh: string | null; expire: number };

export type Compte = {
  id: number;
  user_id: number;
  email: string;
  nom: string;
  fournisseur: string;
  auth: "password" | "google" | "microsoft";
  imap_host: string;
  imap_port: number;
  imap_secure: boolean;
  imap_user: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  secret: string;
  dossiers: Dossiers;
  etat: EtatSync;
  reglages: unknown;
  statut: "ok" | "erreur";
  erreur: string | null;
  last_sync_at: string | null;
  created_at: string;
};

export async function compteDe(userId: number): Promise<Compte | null> {
  return (await q<Compte>("SELECT * FROM mail_accounts WHERE user_id = $1", [userId]))[0] ?? null;
}
export async function compteParId(id: number): Promise<Compte | null> {
  return (await q<Compte>("SELECT * FROM mail_accounts WHERE id = $1", [id]))[0] ?? null;
}

export const reglagesDe = (c: Compte): Reglages => sanitizeReglages(c.reglages, REGLAGES_DEFAUT);

/** Ce que l'écran a le droit de connaître d'une boîte : jamais le secret. */
export function comptePublic(c: Compte) {
  return {
    id: c.id, email: c.email, nom: c.nom, fournisseur: c.fournisseur, auth: c.auth,
    imap: { host: c.imap_host, port: c.imap_port, secure: c.imap_secure, user: c.imap_user },
    smtp: { host: c.smtp_host, port: c.smtp_port, secure: c.smtp_secure },
    dossiers: c.dossiers, statut: c.statut, erreur: c.erreur, lastSyncAt: c.last_sync_at, reglages: reglagesDe(c),
  };
}
export type ComptePublic = ReturnType<typeof comptePublic>;

export const scellerMotDePasse = (pass: string) => chiffrer({ type: "password", pass } satisfies Secret);
export const scellerJetons = (j: { access: string; refresh: string | null; expire: number }) => chiffrer({ type: "oauth", ...j } satisfies Secret);

/** Identifiants de connexion prêts pour IMAP et SMTP. Les jetons expirés sont renouvelés et réenregistrés. */
export async function authentification(c: Pick<Compte, "id" | "auth" | "secret" | "imap_user">): Promise<{ user: string; pass?: string; accessToken?: string }> {
  const s = dechiffrer<Secret>(c.secret);
  if (s.type === "password") return { user: c.imap_user, pass: s.pass };
  if (s.expire - Date.now() > 90_000) return { user: c.imap_user, accessToken: s.access };
  if (!s.refresh || !estOAuth(c.auth)) throw new Error("L'autorisation a expiré : reconnectez la boîte mail.");
  const j = await rafraichir(c.auth, s.refresh);
  const neuf = { access: j.access, refresh: j.refresh ?? s.refresh, expire: j.expire };
  if (c.id > 0) await q("UPDATE mail_accounts SET secret = $2, updated_at = now() WHERE id = $1", [c.id, scellerJetons(neuf)]);
  return { user: c.imap_user, accessToken: neuf.access };
}

/** Jeton de renouvellement, pour le retirer chez le fournisseur à la déconnexion. */
export function jetonARevoquer(c: Compte): string | null {
  try {
    const s = dechiffrer<Secret>(c.secret);
    return s.type === "oauth" ? s.refresh ?? s.access : null;
  } catch {
    return null;
  }
}

export async function globaux(): Promise<ReglagesGlobaux> {
  return sanitizeGlobaux(await getSetting("messagerie"), GLOBAUX_DEFAUT);
}

export async function journal(userId: number | null, email: string, action: string, detail?: string): Promise<void> {
  await q("INSERT INTO mail_journal (user_id, email, action, detail) VALUES ($1, $2, $3, $4)", [userId, email, action, detail ? detail.slice(0, 500) : null]).catch(() => undefined);
}
