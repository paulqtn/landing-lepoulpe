import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

/* Chiffrement des identifiants de messagerie (mot de passe IMAP, jetons OAuth) avant écriture
   en base : AES-256-GCM, clé dérivée de MESSAGERIE_SECRET (variable d'environnement, jamais
   en base ni dans le code). Sans cette clé, aucun identifiant n'est enregistré. */

const PREFIXE = "v1";

export function cleConfiguree(secret = process.env.MESSAGERIE_SECRET): boolean {
  return typeof secret === "string" && secret.length >= 32;
}

function cle(secret = process.env.MESSAGERIE_SECRET): Buffer {
  if (!cleConfiguree(secret)) throw new Error("MESSAGERIE_SECRET absente ou trop courte (32 caractères au minimum).");
  return createHash("sha256").update(secret as string).digest();
}

export function chiffrer(valeur: unknown, secret?: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", cle(secret), iv);
  const data = Buffer.concat([c.update(JSON.stringify(valeur), "utf8"), c.final()]);
  return [PREFIXE, iv.toString("base64"), c.getAuthTag().toString("base64"), data.toString("base64")].join(":");
}

export function dechiffrer<T>(chiffre: string, secret?: string): T {
  const [v, iv, tag, data] = chiffre.split(":");
  if (v !== PREFIXE || !iv || !tag || !data) throw new Error("Identifiants illisibles : format inconnu.");
  const d = createDecipheriv("aes-256-gcm", cle(secret), Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8")) as T;
}

/**
 * Empreinte d'un identifiant de message ou d'une adresse : elle permet de reconnaître « le même »
 * sans que la valeur soit écrite en base ni retrouvable à partir de l'empreinte (clé secrète).
 */
export function empreinteDe(valeur: string | null | undefined, secret?: string): string {
  const v = (valeur ?? "").trim().toLowerCase().replace(/^<|>$/g, "");
  return v ? createHmac("sha256", cle(secret)).update(v).digest("hex").slice(0, 32) : "";
}
