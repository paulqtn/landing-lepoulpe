import { ImapFlow, type ListResponse } from "imapflow";
import { simpleParser, type AddressObject, type ParsedMail } from "mailparser";
import { authentification, type Compte, type Dossiers } from "./comptes";
import { nettoyerHtml, texteDepuisHtml } from "./html";
import { idMessage } from "./modele";

/* Service IMAP : connexion, repérage des dossiers, lecture des nouveaux messages, dépôt des
   brouillons (APPEND avec le drapeau \Draft), drapeaux et déplacements. Chaque appel ouvre une
   connexion et la referme : rien ne reste ouvert entre deux requêtes (hébergement sans serveur). */

type Connexion = Pick<Compte, "id" | "auth" | "secret" | "imap_user" | "imap_host" | "imap_port" | "imap_secure">;

export function erreurLisible(e: unknown): string {
  const x = e as { authenticationFailed?: boolean; code?: string; responseText?: string; message?: string };
  const brut = `${x?.responseText ?? ""} ${x?.message ?? ""}`.trim();
  if (x?.authenticationFailed || /AUTHENTICATIONFAILED|Invalid credentials|LOGIN failed|authentication failed|AUTHENTICATE failed/i.test(brut))
    return "Identifiant ou mot de passe refusé par le serveur. Si la validation en deux étapes est active, utilisez un mot de passe d'application.";
  if (x?.code === "ENOTFOUND" || /ENOTFOUND|getaddrinfo/i.test(brut)) return "Serveur introuvable : vérifiez son nom.";
  if (x?.code === "ECONNREFUSED" || /ECONNREFUSED/i.test(brut)) return "Le serveur refuse la connexion sur ce port.";
  if (x?.code === "ETIMEDOUT" || x?.code === "ETIMEOUT" || /timed? ?out|timeout/i.test(brut)) return "Le serveur ne répond pas (délai dépassé). Vérifiez le port et le réglage SSL/TLS.";
  if (/certificate|self.signed|CERT_|SSL|TLS|wrong version number/i.test(brut)) return "La connexion sécurisée a échoué : vérifiez le port et le réglage SSL/TLS (993 avec SSL/TLS le plus souvent).";
  if (/MESSAGERIE_SECRET|illisibles|autorisation a expiré|reconnectez/i.test(brut)) return brut;
  if (/quota|OVERQUOTA/i.test(brut)) return "La boîte mail est pleine : le serveur refuse l'enregistrement.";
  return `Le serveur de messagerie a renvoyé une erreur${brut ? ` : ${brut.slice(0, 160)}` : "."}`;
}

export async function avecImap<T>(c: Connexion, fn: (client: ImapFlow) => Promise<T>): Promise<T> {
  const auth = await authentification(c);
  const client = new ImapFlow({
    host: c.imap_host,
    port: c.imap_port,
    secure: c.imap_secure,
    auth: auth.accessToken ? { user: auth.user, accessToken: auth.accessToken } : { user: auth.user, pass: auth.pass ?? "" },
    logger: false,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 40_000,
    disableAutoIdle: true,
  });
  // Une coupure du serveur ne doit pas faire tomber la requête en cours d'un autre utilisateur.
  client.on("error", () => undefined);
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

const NOMS = {
  drafts: /^(drafts?|brouillons?|entw[uü]rfe|borradores|bozze)$/i,
  sent: /^(sent|sent items|sent messages|sent mail|envoy[ée]s|[ée]l[ée]ments envoy[ée]s|messages envoy[ée]s|objets envoy[ée]s|gesendet)$/i,
  archive: /^(archives?|archive)$/i,
};

/** Dossiers de la boîte : d'abord les attributs normalisés (\Drafts, \Sent, \Archive), sinon les noms usuels. */
export function repererDossiers(liste: Pick<ListResponse, "path" | "name" | "specialUse" | "flags">[]): Dossiers {
  const parUsage = (u: string) => liste.find((b) => b.specialUse === u)?.path ?? null;
  const parNom = (r: RegExp) => liste.find((b) => r.test(b.name) && !b.flags?.has("\\Noselect"))?.path ?? null;
  return {
    inbox: liste.find((b) => b.specialUse === "\\Inbox" || b.path.toUpperCase() === "INBOX")?.path ?? "INBOX",
    drafts: parUsage("\\Drafts") ?? parNom(NOMS.drafts),
    sent: parUsage("\\Sent") ?? parNom(NOMS.sent),
    archive: parUsage("\\Archive") ?? parNom(NOMS.archive) ?? parUsage("\\All"),
  };
}

/** Test de connexion : ouvre la boîte, repère les dossiers, crée « Brouillons » s'il n'existe pas. */
export async function testerConnexion(c: Connexion): Promise<Dossiers> {
  return avecImap(c, async (client) => {
    let d = repererDossiers(await client.list());
    if (!d.drafts) {
      await client.mailboxCreate("Drafts").catch(() => undefined);
      d = repererDossiers(await client.list());
    }
    const verrou = await client.getMailboxLock(d.inbox);
    verrou.release();
    return d;
  });
}

export type PieceJointe = { nom: string; type: string; taille: number };
export type MessageLu = {
  uid: number;
  messageId: string;
  inReplyTo: string | null;
  references: string[];
  fromNom: string;
  fromEmail: string;
  to: string[];
  cc: string[];
  sujet: string;
  date: Date;
  texte: string;
  html: string | null;
  pieces: PieceJointe[];
  lu: boolean;
  enteteBrouillon: string | null;
  /** Points à vérifier, portés par le brouillon lui-même (en-tête du message), jamais par la base. */
  manquants: string[];
};

const adresses = (a: AddressObject | AddressObject[] | undefined) => (Array.isArray(a) ? a : a ? [a] : []).flatMap((x) => x.value).map((v) => (v.address ?? "").toLowerCase()).filter(Boolean);

export function versMessage(p: ParsedMail, uid: number, flags: Set<string>, dateInterne?: Date | string): MessageLu {
  const de = (Array.isArray(p.from) ? p.from[0] : p.from)?.value?.[0];
  const html = typeof p.html === "string" && p.html.trim() ? nettoyerHtml(p.html) : null;
  const texte = (p.text && p.text.trim() ? p.text : html ? texteDepuisHtml(html) : "").replace(/\u0000/g, "").slice(0, 200_000);
  const refs = (Array.isArray(p.references) ? p.references : p.references ? String(p.references).split(/\s+/) : []).map(idMessage).filter(Boolean);
  const entete = p.headers.get("x-mgk-brouillon");
  return {
    uid,
    messageId: idMessage(p.messageId) || `sans-id-${uid}`,
    inReplyTo: idMessage(p.inReplyTo) || null,
    references: refs.slice(-30),
    fromNom: (de?.name ?? "").replace(/\u0000/g, "").slice(0, 200),
    fromEmail: (de?.address ?? "").toLowerCase().slice(0, 320),
    to: adresses(p.to).slice(0, 50),
    cc: adresses(p.cc).slice(0, 50),
    sujet: (p.subject ?? "").replace(/\u0000/g, "").slice(0, 500),
    date: p.date ?? (dateInterne ? new Date(dateInterne) : new Date()),
    texte,
    html,
    pieces: p.attachments.filter((a) => a.contentDisposition !== "inline" || !a.cid).map((a) => ({ nom: (a.filename ?? "pièce jointe").slice(0, 200), type: a.contentType ?? "application/octet-stream", taille: a.size ?? 0 })).slice(0, 30),
    lu: flags.has("\\Seen"),
    enteteBrouillon: typeof entete === "string" ? entete.trim() : null,
    manquants: lireManquants(p.headers.get("x-mgk-a-verifier")),
  };
}

function lireManquants(v: unknown): string[] {
  if (typeof v !== "string" || !v.trim()) return [];
  try {
    const l = JSON.parse(Buffer.from(v.replace(/\s+/g, ""), "base64").toString("utf8")) as unknown;
    return Array.isArray(l) ? l.map((x) => String(x).slice(0, 300)).slice(0, 10) : [];
  } catch {
    return [];
  }
}

const TAILLE_MAX = 3_000_000;

/** En-têtes d'un message : de quoi l'afficher dans une liste et le situer dans un fil, sans son contenu. */
export type Entete = { uid: number; messageId: string; inReplyTo: string | null; references: string[]; fromNom: string; fromEmail: string; to: string[]; sujet: string; date: Date; lu: boolean; nbPieces: number };

type Structure = { disposition?: string; childNodes?: Structure[] };
const compterPieces = (n: Structure | undefined): number => (!n ? 0 : (n.disposition === "attachment" ? 1 : 0) + (n.childNodes ?? []).reduce((s, c) => s + compterPieces(c), 0));

/** En-têtes de messages désignés par leur numéro dans le dossier (lecture seule, rien n'est marqué lu). */
export async function lireEntetes(client: ImapFlow, chemin: string, uids: number[]): Promise<Entete[]> {
  const out: Entete[] = [];
  if (uids.length === 0) return out;
  const verrou = await client.getMailboxLock(chemin);
  try {
    for await (const m of client.fetch(uids, { uid: true, flags: true, envelope: true, internalDate: true, bodyStructure: true, headers: ["references"] }, { uid: true })) {
      const e = m.envelope;
      const refs = (m.headers?.toString("utf8") ?? "").replace(/\r?\n[ \t]+/g, " ").match(/^references:\s*(.*)$/im)?.[1] ?? "";
      out.push({
        uid: m.uid,
        messageId: idMessage(e?.messageId) || `sans-id-${m.uid}`,
        inReplyTo: idMessage(e?.inReplyTo) || null,
        references: refs.split(/\s+/).map(idMessage).filter(Boolean).slice(-30),
        fromNom: (e?.from?.[0]?.name ?? "").slice(0, 200),
        fromEmail: (e?.from?.[0]?.address ?? "").toLowerCase().slice(0, 320),
        to: (e?.to ?? []).map((x) => (x.address ?? "").toLowerCase()).filter(Boolean).slice(0, 50),
        sujet: (e?.subject ?? "").slice(0, 500),
        date: e?.date ? new Date(e.date) : m.internalDate ? new Date(m.internalDate) : new Date(),
        lu: m.flags?.has("\\Seen") ?? false,
        nbPieces: compterPieces(m.bodyStructure as Structure | undefined),
      });
    }
  } finally {
    verrou.release();
  }
  return out;
}

/** Numéros des nouveaux messages d'un dossier depuis la dernière synchronisation, par lots bornés. */
export async function nouveauxUids(
  client: ImapFlow,
  chemin: string,
  etat: { uidValidity: string; lastUid: number } | undefined,
  opts: { depuis: Date; lot: number; premierMax: number },
): Promise<{ uids: number[]; etat: { uidValidity: string; lastUid: number }; reste: boolean; repart: boolean }> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    const boite = client.mailbox;
    if (!boite) throw new Error("Dossier inaccessible.");
    const validite = String(boite.uidValidity);
    const repart = !etat || etat.uidValidity !== validite;
    let uids: number[];
    if (repart) uids = ((await client.search({ since: opts.depuis }, { uid: true })) || []).sort((a, b) => a - b).slice(-opts.premierMax);
    else uids = ((await client.search({ uid: `${etat.lastUid + 1}:*` }, { uid: true })) || []).filter((u) => u > etat.lastUid).sort((a, b) => a - b);
    const lot = uids.slice(0, opts.lot);
    const dernier = lot.length > 0 ? lot[lot.length - 1] : repart ? Math.max(0, Number(boite.uidNext ?? 1) - 1) : etat.lastUid;
    return { uids: lot, etat: { uidValidity: validite, lastUid: dernier }, reste: uids.length > lot.length, repart };
  } finally {
    verrou.release();
  }
}

/** Messages complets, lus dans la boîte au moment où on en a besoin (jamais conservés). */
export async function lireMessages(client: ImapFlow, chemin: string, uids: number[]): Promise<MessageLu[]> {
  const out: MessageLu[] = [];
  if (uids.length === 0) return out;
  const verrou = await client.getMailboxLock(chemin);
  try {
    for await (const m of client.fetch(uids, { uid: true, flags: true, internalDate: true, source: { start: 0, maxLength: TAILLE_MAX } }, { uid: true })) {
      if (!m.source) continue;
      try {
        out.push(versMessage(await simpleParser(m.source, { skipImageLinks: true, skipTextToHtml: true }), m.uid, m.flags ?? new Set(), m.internalDate));
      } catch {
        /* message illisible : on passe au suivant */
      }
    }
  } finally {
    verrou.release();
  }
  return out;
}

/** Recherche faite par le serveur de messagerie lui-même (texte libre et expéditeur). */
export async function chercher(client: ImapFlow, chemin: string, f: { texte?: string; expediteur?: string }): Promise<number[]> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    const criteres: Record<string, unknown> = {};
    if (f.expediteur) criteres.from = f.expediteur.slice(0, 100);
    if (f.texte) criteres.or = [{ from: f.texte.slice(0, 100) }, { subject: f.texte.slice(0, 100) }, { body: f.texte.slice(0, 100) }];
    return ((await client.search(criteres, { uid: true })) || []).sort((a, b) => b - a).slice(0, 500);
  } finally {
    verrou.release();
  }
}

/** État « lu » des messages connus ; un message absent de la réponse n'est plus dans le dossier. */
export async function lireDrapeaux(client: ImapFlow, chemin: string, uids: number[]): Promise<Map<number, boolean>> {
  const out = new Map<number, boolean>();
  if (uids.length === 0) return out;
  const verrou = await client.getMailboxLock(chemin);
  try {
    for await (const m of client.fetch(uids, { uid: true, flags: true }, { uid: true })) out.set(m.uid, m.flags?.has("\\Seen") ?? false);
  } finally {
    verrou.release();
  }
  return out;
}

/** Messages présents dans un dossier (brouillons, envoyés récents), en-têtes et texte compris. */
export async function lireDossier(client: ImapFlow, chemin: string, depuis: Date, max = 60): Promise<MessageLu[]> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    const uids = ((await client.search({ since: depuis }, { uid: true })) || []).sort((a, b) => a - b).slice(-max);
    const out: MessageLu[] = [];
    if (uids.length === 0) return out;
    for await (const m of client.fetch(uids, { uid: true, flags: true, internalDate: true, source: { start: 0, maxLength: 400_000 } }, { uid: true })) {
      if (!m.source) continue;
      try {
        out.push(versMessage(await simpleParser(m.source, { skipImageLinks: true, skipTextToHtml: true }), m.uid, m.flags ?? new Set(), m.internalDate));
      } catch {}
    }
    return out;
  } finally {
    verrou.release();
  }
}

/** Dépôt d'un brouillon dans le vrai dossier Brouillons de la boîte (APPEND, drapeau \Draft). */
export async function deposerBrouillon(client: ImapFlow, chemin: string, mime: Buffer): Promise<{ uid: number | null; uidValidity: string | null }> {
  const r = await client.append(chemin, mime, ["\\Draft", "\\Seen"], new Date());
  if (!r) throw new Error("Le serveur a refusé l'enregistrement du brouillon.");
  return { uid: r.uid ?? null, uidValidity: r.uidValidity !== undefined ? String(r.uidValidity) : null };
}

export async function deposerEnvoye(client: ImapFlow, chemin: string, mime: Buffer): Promise<void> {
  await client.append(chemin, mime, ["\\Seen"], new Date());
}

export async function supprimerMessage(client: ImapFlow, chemin: string, uid: number): Promise<void> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    await client.messageDelete([uid], { uid: true });
  } finally {
    verrou.release();
  }
}

export async function marquerLu(client: ImapFlow, chemin: string, uid: number, lu: boolean): Promise<void> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    if (lu) await client.messageFlagsAdd([uid], ["\\Seen"], { uid: true });
    else await client.messageFlagsRemove([uid], ["\\Seen"], { uid: true });
  } finally {
    verrou.release();
  }
}

/** Archivage : déplacement vers le dossier d'archives (créé au besoin). Rend la nouvelle position du message quand le serveur la donne. */
export async function archiver(client: ImapFlow, d: Dossiers, uid: number): Promise<{ chemin: string; uid: number | null; uidValidity: string | null }> {
  let cible = d.archive;
  if (!cible) {
    await client.mailboxCreate("Archives").catch(() => undefined);
    cible = repererDossiers(await client.list()).archive ?? "Archives";
  }
  const verrou = await client.getMailboxLock(d.inbox);
  try {
    const r = await client.messageMove([uid], cible, { uid: true });
    if (!r) throw new Error("Le serveur a refusé le déplacement.");
    return { chemin: cible, uid: r.uidMap?.get(uid) ?? null, uidValidity: r.uidValidity !== undefined ? String(r.uidValidity) : null };
  } finally {
    verrou.release();
  }
}

/** Message complet, pour en extraire une pièce jointe à la demande. */
export async function lireComplet(client: ImapFlow, chemin: string, uid: number): Promise<ParsedMail | null> {
  const verrou = await client.getMailboxLock(chemin);
  try {
    const m = await client.fetchOne(String(uid), { uid: true, source: { start: 0, maxLength: 26_000_000 } }, { uid: true });
    return m && m.source ? await simpleParser(m.source) : null;
  } finally {
    verrou.release();
  }
}
