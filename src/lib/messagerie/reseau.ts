import { lookup, resolveMx } from "node:dns/promises";
import { isIP } from "node:net";
import { fournisseurParAdresse, fournisseurParMx, type Fournisseur } from "./fournisseurs";

/* Garde-fous réseau : le serveur de messagerie est saisi par l'utilisateur, il ne doit pas
   servir à joindre une machine interne. Seuls les ports de messagerie sont acceptés. */

const PORTS = { imap: [993, 143], smtp: [465, 587] } as const;
/** Réservé aux tests en local (serveur de messagerie de test sur la machine). */
const LOCAL_OK = process.env.MESSAGERIE_HOTES_LOCAUX === "1" && process.env.VERCEL_ENV !== "production";

function prive(ip: string): boolean {
  if (ip.includes(":")) {
    const a = ip.toLowerCase();
    return a === "::1" || a === "::" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80") || a.startsWith("::ffff:");
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

export async function verifierServeur(host: string, port: number, genre: "imap" | "smtp"): Promise<string | null> {
  const h = host.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?$/.test(h)) return "Nom de serveur invalide.";
  if (LOCAL_OK) return null;
  if (!(PORTS[genre] as readonly number[]).includes(port)) return `Port ${port} refusé : utilisez ${PORTS[genre].join(" ou ")}.`;
  if (isIP(h)) return "Indiquez le nom du serveur, pas une adresse IP.";
  try {
    const ips = await lookup(h, { all: true });
    if (ips.length === 0 || ips.some((x) => prive(x.address))) return "Ce serveur n'est pas joignable depuis le back office.";
  } catch {
    return "Serveur introuvable : vérifiez son nom.";
  }
  return null;
}

/** Configuration automatique : par l'adresse, puis par les serveurs de réception du domaine. */
export async function detecterFournisseur(email: string): Promise<Fournisseur | null> {
  const connu = fournisseurParAdresse(email);
  if (connu) return connu;
  const domaine = email.trim().toLowerCase().split("@")[1];
  if (!domaine || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domaine)) return null;
  try {
    const mx = await Promise.race([resolveMx(domaine), new Promise<never>((_, r) => setTimeout(() => r(new Error("délai")), 4000))]);
    return fournisseurParMx(mx.map((m) => m.exchange));
  } catch {
    return null;
  }
}
