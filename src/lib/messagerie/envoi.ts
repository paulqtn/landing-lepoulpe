import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { authentification, type Compte } from "./comptes";
import { erreurLisible } from "./imap";

/* Fabrication d'une réponse au format e-mail (pour le dossier Brouillons et pour l'envoi), et
   envoi par SMTP. IMAP ne sait pas envoyer : l'envoi passe toujours par le serveur SMTP de la
   boîte, et uniquement sur demande explicite du commercial. */

export type Reponse = {
  de: { nom: string; email: string };
  a: string[];
  cc: string[];
  sujet: string;
  texte: string;
  /** Message auquel on répond : en-têtes de rattachement à la conversation. */
  origine?: { messageId: string; references: string[]; date: Date; de: string; texte: string } | null;
  enteteId: string;
  brouillonId?: number;
};

export const nouvelEnteteId = (email: string) => `<mgk-${Date.now().toString(36)}-${randomBytes(6).toString("hex")}@${email.split("@")[1] || "localhost"}>`;

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function listeAdresses(v: string): string[] {
  return [...new Set(v.split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter((x) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(x)))].slice(0, 30);
}

export async function composer(r: Reponse): Promise<Buffer> {
  const dateFr = r.origine ? new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "long", timeStyle: "short" }).format(r.origine.date) : "";
  const citation = r.origine ? `\n\nLe ${dateFr}, ${r.origine.de} a écrit :\n${r.origine.texte.slice(0, 20_000).split("\n").map((l) => `> ${l}`).join("\n")}` : "";
  const citationHtml = r.origine ? `<br><br><div>Le ${echapper(dateFr)}, ${echapper(r.origine.de)} a écrit :</div><blockquote style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex">${echapper(r.origine.texte.slice(0, 20_000)).replace(/\n/g, "<br>")}</blockquote>` : "";
  const refs = r.origine ? [...r.origine.references, r.origine.messageId].filter(Boolean).slice(-20).map((x) => `<${x}>`) : [];
  const mail = new MailComposer({
    from: { name: r.de.nom, address: r.de.email },
    to: r.a,
    cc: r.cc.length ? r.cc : undefined,
    subject: r.sujet,
    text: r.texte + citation,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px">${echapper(r.texte).replace(/\n/g, "<br>")}</div>${citationHtml}`,
    messageId: r.enteteId,
    inReplyTo: r.origine?.messageId ? `<${r.origine.messageId}>` : undefined,
    references: refs.length ? refs : undefined,
    headers: r.brouillonId ? { "X-MGK-Brouillon": String(r.brouillonId) } : undefined,
    date: new Date(),
  });
  return mail.compile().build();
}

export async function envoyerSmtp(c: Compte, mime: Buffer, destinataires: string[]): Promise<void> {
  const auth = await authentification(c);
  const transport = nodemailer.createTransport({
    host: c.smtp_host,
    port: c.smtp_port,
    secure: c.smtp_secure,
    requireTLS: !c.smtp_secure && process.env.MESSAGERIE_HOTES_LOCAUX !== "1",
    auth: auth.accessToken ? { type: "OAuth2", user: c.email, accessToken: auth.accessToken } : { user: auth.user, pass: auth.pass ?? "" },
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 30_000,
  });
  try {
    await transport.sendMail({ envelope: { from: c.email, to: destinataires }, raw: mime });
  } catch (e) {
    const x = e as { code?: string; responseCode?: number; message?: string };
    if (x.code === "EAUTH" || x.responseCode === 535) throw new Error("Le serveur d'envoi a refusé l'identifiant ou le mot de passe.");
    if (x.responseCode && x.responseCode >= 500) throw new Error(`Le serveur d'envoi a refusé le message : ${(x.message ?? "").slice(0, 160)}`);
    throw new Error(erreurLisible(e).replace("serveur de messagerie", "serveur d'envoi"));
  } finally {
    transport.close();
  }
}

export async function testerSmtp(c: Compte): Promise<void> {
  const auth = await authentification(c);
  const transport = nodemailer.createTransport({
    host: c.smtp_host, port: c.smtp_port, secure: c.smtp_secure,
    auth: auth.accessToken ? { type: "OAuth2", user: c.email, accessToken: auth.accessToken } : { user: auth.user, pass: auth.pass ?? "" },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
  });
  try {
    await transport.verify();
  } finally {
    transport.close();
  }
}
