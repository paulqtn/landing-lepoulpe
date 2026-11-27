/* Réglages connus des principaux fournisseurs de messagerie. Fichier sans dépendance :
   il sert au serveur comme au formulaire de connexion. */

export type Fournisseur = {
  cle: string;
  nom: string;
  imap: { host: string; port: number; secure: boolean };
  smtp: { host: string; port: number; secure: boolean };
  /** Connexion sécurisée par le fournisseur (OAuth 2.0) : possible, voire obligatoire. */
  oauth?: "google" | "microsoft";
  oauthObligatoire?: boolean;
  /** Le fournisseur range lui-même les messages envoyés dans « Envoyés ». */
  envoiArchive?: boolean;
  domaines: string[];
  /** Indices dans les serveurs de réception (MX) d'un nom de domaine personnalisé. */
  mx: string[];
  aide: string;
};

export const FOURNISSEURS: Fournisseur[] = [
  {
    cle: "gmail", nom: "Gmail / Google Workspace",
    imap: { host: "imap.gmail.com", port: 993, secure: true }, smtp: { host: "smtp.gmail.com", port: 465, secure: true },
    oauth: "google", envoiArchive: true, domaines: ["gmail.com", "googlemail.com"], mx: ["google.com", "googlemail.com"],
    aide: "Sans connexion Google, utilisez un mot de passe d'application : compte Google → Sécurité → Validation en deux étapes → Mots de passe des applications. Le mot de passe habituel est refusé.",
  },
  {
    cle: "outlook", nom: "Outlook / Microsoft 365",
    imap: { host: "outlook.office365.com", port: 993, secure: true }, smtp: { host: "smtp.office365.com", port: 587, secure: false },
    oauth: "microsoft", oauthObligatoire: true, envoiArchive: true, domaines: ["outlook.com", "outlook.fr", "hotmail.com", "hotmail.fr", "live.com", "live.fr", "msn.com"], mx: ["outlook.com", "protection.outlook.com"],
    aide: "Microsoft n'accepte plus le mot de passe pour IMAP : la connexion passe par le bouton « Se connecter avec Microsoft ».",
  },
  {
    cle: "ovh", nom: "OVH",
    imap: { host: "ssl0.ovh.net", port: 993, secure: true }, smtp: { host: "ssl0.ovh.net", port: 465, secure: true },
    domaines: [], mx: ["ovh.net", "mail.ovh"],
    aide: "Identifiant : l'adresse e-mail complète. Offres récentes : remplacez le serveur par imap.mail.ovh.net et smtp.mail.ovh.net si la connexion échoue.",
  },
  {
    cle: "infomaniak", nom: "Infomaniak",
    imap: { host: "mail.infomaniak.com", port: 993, secure: true }, smtp: { host: "mail.infomaniak.com", port: 465, secure: true },
    domaines: ["ik.me", "etik.com"], mx: ["infomaniak.ch", "infomaniak.com"],
    aide: "Identifiant : l'adresse e-mail complète. Avec la validation en deux étapes, créez un mot de passe d'application dans le Manager Infomaniak.",
  },
  {
    cle: "hostinger", nom: "Hostinger",
    imap: { host: "imap.hostinger.com", port: 993, secure: true }, smtp: { host: "smtp.hostinger.com", port: 465, secure: true },
    domaines: [], mx: ["hostinger.com", "hostinger.fr"],
    aide: "Identifiant : l'adresse e-mail complète. Mot de passe : celui de la boîte mail (hPanel → E-mails), pas celui du compte Hostinger. Offre « Titan » : choisissez plutôt le fournisseur Titan.",
  },
  {
    cle: "titan", nom: "Titan (Hostinger, autres hébergeurs)",
    imap: { host: "imap.titan.email", port: 993, secure: true }, smtp: { host: "smtp.titan.email", port: 465, secure: true },
    domaines: [], mx: ["titan.email"],
    aide: "Identifiant : l'adresse e-mail complète. Mot de passe : celui de la boîte mail.",
  },
  {
    cle: "ionos", nom: "IONOS (1&1)",
    imap: { host: "imap.ionos.fr", port: 993, secure: true }, smtp: { host: "smtp.ionos.fr", port: 465, secure: true },
    domaines: [], mx: ["ionos.fr", "ionos.com", "kundenserver.de"], aide: "Identifiant : l'adresse e-mail complète.",
  },
  {
    cle: "gandi", nom: "Gandi",
    imap: { host: "mail.gandi.net", port: 993, secure: true }, smtp: { host: "mail.gandi.net", port: 465, secure: true },
    domaines: [], mx: ["gandi.net"], aide: "Identifiant : l'adresse e-mail complète.",
  },
  {
    cle: "yahoo", nom: "Yahoo Mail",
    imap: { host: "imap.mail.yahoo.com", port: 993, secure: true }, smtp: { host: "smtp.mail.yahoo.com", port: 465, secure: true },
    domaines: ["yahoo.com", "yahoo.fr", "ymail.com"], mx: ["yahoodns.net"], aide: "Yahoo demande un mot de passe d'application (Sécurité du compte → Générer un mot de passe d'application).",
  },
  {
    cle: "icloud", nom: "iCloud Mail",
    imap: { host: "imap.mail.me.com", port: 993, secure: true }, smtp: { host: "smtp.mail.me.com", port: 587, secure: false },
    domaines: ["icloud.com", "me.com", "mac.com"], mx: ["icloud.com"], aide: "Apple demande un mot de passe pour application (appleid.apple.com → Connexion et sécurité).",
  },
  {
    cle: "orange", nom: "Orange",
    imap: { host: "imap.orange.fr", port: 993, secure: true }, smtp: { host: "smtp.orange.fr", port: 465, secure: true },
    domaines: ["orange.fr", "wanadoo.fr"], mx: ["orange.fr"], aide: "Identifiant : l'adresse e-mail complète.",
  },
  {
    cle: "free", nom: "Free",
    imap: { host: "imap.free.fr", port: 993, secure: true }, smtp: { host: "smtp.free.fr", port: 465, secure: true },
    domaines: ["free.fr"], mx: ["free.fr"], aide: "Identifiant : la partie de l'adresse avant @free.fr.",
  },
  {
    cle: "sfr", nom: "SFR",
    imap: { host: "imap.sfr.fr", port: 993, secure: true }, smtp: { host: "smtp.sfr.fr", port: 465, secure: true },
    domaines: ["sfr.fr", "neuf.fr"], mx: ["sfr.fr"], aide: "Identifiant : l'adresse e-mail complète.",
  },
  {
    cle: "laposte", nom: "La Poste",
    imap: { host: "imap.laposte.net", port: 993, secure: true }, smtp: { host: "smtp.laposte.net", port: 465, secure: true },
    domaines: ["laposte.net"], mx: ["laposte.net"], aide: "L'accès IMAP doit être activé dans les préférences de la messagerie La Poste.",
  },
  {
    cle: "zoho", nom: "Zoho Mail",
    imap: { host: "imap.zoho.eu", port: 993, secure: true }, smtp: { host: "smtp.zoho.eu", port: 465, secure: true },
    domaines: ["zoho.com", "zoho.eu", "zohomail.eu"], mx: ["zoho.eu", "zoho.com"], aide: "Activez l'accès IMAP dans les réglages Zoho, et utilisez un mot de passe d'application si la double validation est active.",
  },
];

export const AUTRE: Fournisseur = {
  cle: "autre", nom: "Autre fournisseur (IMAP)",
  imap: { host: "", port: 993, secure: true }, smtp: { host: "", port: 465, secure: true },
  domaines: [], mx: [], aide: "Renseignez les serveurs indiqués par votre hébergeur de messagerie. Le port 993 avec SSL/TLS est le réglage le plus courant.",
};

export const fournisseurParCle = (cle: string | null | undefined): Fournisseur => FOURNISSEURS.find((f) => f.cle === cle) ?? AUTRE;

/** Fournisseur reconnu d'après l'adresse (domaines grand public). */
export function fournisseurParAdresse(email: string): Fournisseur | null {
  const d = email.trim().toLowerCase().split("@")[1] ?? "";
  return FOURNISSEURS.find((f) => f.domaines.includes(d)) ?? null;
}

/** Fournisseur reconnu d'après les serveurs de réception d'un domaine personnalisé. */
export function fournisseurParMx(serveurs: string[]): Fournisseur | null {
  const s = serveurs.map((x) => x.toLowerCase().replace(/\.$/, ""));
  return FOURNISSEURS.find((f) => f.mx.some((m) => s.some((x) => x === m || x.endsWith(`.${m}`)))) ?? null;
}
