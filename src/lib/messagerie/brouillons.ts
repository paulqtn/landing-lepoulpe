import { createHash } from "node:crypto";
import type { ImapFlow } from "imapflow";
import { addEvent, adminQuery as q } from "@/lib/admin/db";
import { cheminDe, indexDe, type Index } from "./boite";
import { journal, type Compte } from "./comptes";
import { composer, envoyerSmtp, listeAdresses, nouvelEnteteId } from "./envoi";
import { fournisseurParCle } from "./fournisseurs";
import { avecImap, deposerBrouillon, deposerEnvoye, lireMessages, repererDossiers, supprimerMessage, type MessageLu } from "./imap";
import { objetReponse, sansCitation } from "./modele";

/* Brouillons de réponse. Leur contenu n'existe que dans le dossier Brouillons de la boîte mail
   (APPEND, drapeau \Draft, en-têtes In-Reply-To et References) : il se retrouve dans Outlook,
   Gmail, le webmail et le téléphone. La base ne garde qu'un repère sans contenu : à quel message
   il répond, où il se trouve dans la boîte, et l'empreinte de sa dernière version.
   Un message IMAP ne se modifie pas : pour mettre à jour un brouillon, la nouvelle version est
   déposée, puis l'ancienne retirée. */

export type Repere = {
  id: number;
  account_id: number;
  message_id: number | null;
  origine: "ia" | "manuel";
  statut: "brouillon" | "envoye" | "supprime";
  entete_id: string | null;
  imap_uid: string | null;
  imap_uidvalidity: string | null;
  empreinte: string | null;
  created_at: string;
  updated_at: string;
};
export type Contenu = { dest: string; cc: string; sujet: string; corps: string; manquants: string[] };
export type BrouillonLu = Contenu & { id: number; origine: "ia" | "manuel"; dansLaBoite: boolean };

const empreinte = (c: Contenu) => createHash("sha1").update([c.dest, c.cc, c.sujet, c.corps, c.manquants.join("\u0002")].join("\u0001")).digest("hex");

export async function repereDe(compte: Compte, id: number): Promise<Repere | null> {
  return (await q<Repere>("SELECT * FROM mail_drafts WHERE id = $1 AND account_id = $2", [id, compte.id]))[0] ?? null;
}
export async function repereDuMessage(compte: Compte, messageId: number): Promise<Repere | null> {
  return (await q<Repere>("SELECT * FROM mail_drafts WHERE account_id = $1 AND message_id = $2 AND statut = 'brouillon'", [compte.id, messageId]))[0] ?? null;
}

/** Contenu d'un brouillon tel qu'il vient d'être relu dans la boîte. */
export function contenuDe(m: MessageLu): Contenu {
  return { dest: m.to.join(", "), cc: m.cc.join(", "), sujet: m.sujet, corps: sansCitation(m.texte), manquants: m.manquants };
}

async function dossierBrouillons(compte: Compte, client: ImapFlow): Promise<string> {
  if (compte.dossiers.drafts) return compte.dossiers.drafts;
  await client.mailboxCreate("Drafts").catch(() => undefined);
  const chemin = repererDossiers(await client.list()).drafts ?? "Drafts";
  await q("UPDATE mail_accounts SET dossiers = dossiers || $2::jsonb WHERE id = $1", [compte.id, JSON.stringify({ drafts: chemin })]);
  compte.dossiers.drafts = chemin;
  return chemin;
}

const versOrigine = (o: MessageLu | null) => (o ? { messageId: o.messageId, references: o.references, date: o.date, de: o.fromNom ? `${o.fromNom} <${o.fromEmail}>` : o.fromEmail, texte: sansCitation(o.texte) } : null);

/**
 * Écrit le brouillon dans le dossier Brouillons de la boîte (et nulle part ailleurs).
 * Un seul brouillon en cours par message reçu ; une version identique n'est pas redéposée.
 */
export async function ecrireBrouillon(compte: Compte, idx: Index | null, v: Contenu & { origine: "ia" | "manuel" }, origine?: MessageLu | null): Promise<BrouillonLu> {
  const dejaLa = idx ? await repereDuMessage(compte, idx.id) : null;
  const rep =
    dejaLa ??
    (await q<Repere>(
      `INSERT INTO mail_drafts (account_id, message_id, origine) VALUES ($1, $2, $3)
       ON CONFLICT (account_id, message_id) WHERE statut = 'brouillon' AND message_id IS NOT NULL DO UPDATE SET updated_at = now() RETURNING *`,
      [compte.id, idx?.id ?? null, v.origine],
    ))[0];
  try {
    return await avecImap(compte, async (client) => {
      const cheminOrigine = idx ? cheminDe(compte, idx.dossier) : null;
      const o = origine !== undefined ? origine : idx && cheminOrigine ? (await lireMessages(client, cheminOrigine, [Number(idx.uid)]))[0] ?? null : null;
      const contenu: Contenu = {
        dest: listeAdresses(v.dest).join(", ") || (o ? o.fromEmail : ""),
        cc: listeAdresses(v.cc).join(", "),
        sujet: (v.sujet.trim() || (o ? objetReponse(o.sujet) : "")).slice(0, 500),
        corps: v.corps.replace(/\u0000/g, "").slice(0, 50_000),
        manquants: v.manquants.map((x) => x.slice(0, 300)).slice(0, 10),
      };
      const e = empreinte(contenu);
      if (rep.imap_uid && rep.empreinte === e) return { ...contenu, id: rep.id, origine: rep.origine, dansLaBoite: true };
      const chemin = await dossierBrouillons(compte, client);
      const enteteId = nouvelEnteteId(compte.email);
      const mime = await composer({ de: { nom: compte.nom, email: compte.email }, a: listeAdresses(contenu.dest), cc: listeAdresses(contenu.cc), sujet: contenu.sujet, texte: contenu.corps, origine: versOrigine(o), enteteId, brouillonId: rep.id, manquants: contenu.manquants });
      const depot = await deposerBrouillon(client, chemin, mime);
      // La nouvelle version est en place : l'ancienne peut partir (jamais l'inverse).
      if (rep.imap_uid) await supprimerMessage(client, chemin, Number(rep.imap_uid)).catch(() => undefined);
      await q("UPDATE mail_drafts SET imap_uid = $2, imap_uidvalidity = $3, entete_id = $4, empreinte = $5, origine = CASE WHEN origine = 'ia' THEN 'ia' ELSE $6 END, updated_at = now() WHERE id = $1", [rep.id, depot.uid, depot.uidValidity, enteteId, e, v.origine]);
      return { ...contenu, id: rep.id, origine: v.origine, dansLaBoite: depot.uid !== null };
    });
  } catch (err) {
    // Rien n'a pu être déposé pour un repère tout neuf : il ne doit pas rester un brouillon fantôme.
    if (!rep.imap_uid) await q("DELETE FROM mail_drafts WHERE id = $1 AND imap_uid IS NULL", [rep.id]);
    throw err;
  }
}

/** Retire un brouillon de la boîte mail. */
export async function supprimerBrouillon(compte: Compte, id: number): Promise<boolean> {
  const rep = await repereDe(compte, id);
  if (!rep || rep.statut !== "brouillon") return false;
  if (rep.imap_uid && compte.dossiers.drafts) await avecImap(compte, (client) => supprimerMessage(client, compte.dossiers.drafts as string, Number(rep.imap_uid))).catch(() => undefined);
  await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [rep.id]);
  await journal(compte.user_id, compte.email, "brouillon_supprime");
  return true;
}

/** Envoi, uniquement sur demande du commercial : le brouillon est relu dans la boîte, envoyé par SMTP, rangé dans « Envoyés », puis retiré. */
export async function envoyerBrouillon(compte: Compte, id: number, auteur: string): Promise<void> {
  const rep = await repereDe(compte, id);
  if (!rep || rep.statut !== "brouillon" || !rep.imap_uid || !compte.dossiers.drafts) throw new Error("Ce brouillon n'existe plus ou a déjà été envoyé.");
  if (!compte.smtp_host) throw new Error("Le serveur d'envoi (SMTP) n'est pas renseigné dans les paramètres de la boîte.");
  const idx = rep.message_id ? await indexDe(compte, rep.message_id) : null;
  const { b, o } = await avecImap(compte, async (client) => {
    const cheminOrigine = idx ? cheminDe(compte, idx.dossier) : null;
    return {
      b: (await lireMessages(client, compte.dossiers.drafts as string, [Number(rep.imap_uid)]))[0] ?? null,
      o: idx && cheminOrigine ? (await lireMessages(client, cheminOrigine, [Number(idx.uid)]))[0] ?? null : null,
    };
  });
  if (!b) {
    await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [rep.id]);
    throw new Error("Ce brouillon n'est plus dans votre boîte mail (supprimé ou déjà envoyé depuis un autre logiciel).");
  }
  const c = contenuDe(b);
  const dest = [...listeAdresses(c.dest), ...listeAdresses(c.cc)];
  if (listeAdresses(c.dest).length === 0) throw new Error("Ajoutez au moins un destinataire.");
  if (!c.corps.trim()) throw new Error("Le message est vide.");
  if (/\[[^\]\n]{2,80}\]/.test(c.corps)) throw new Error("Le message contient encore un repère entre crochets à compléter.");
  // Verrou : deux clics, ou deux onglets, n'envoient qu'une fois.
  const pris = await q<{ id: number }>("UPDATE mail_drafts SET statut = 'envoye', sent_at = now() WHERE id = $1 AND account_id = $2 AND statut = 'brouillon' RETURNING id", [rep.id, compte.id]);
  if (!pris[0]) throw new Error("Ce brouillon est déjà en cours d'envoi.");
  const mime = await composer({ de: { nom: compte.nom, email: compte.email }, a: listeAdresses(c.dest), cc: listeAdresses(c.cc), sujet: c.sujet, texte: c.corps, origine: versOrigine(o), enteteId: nouvelEnteteId(compte.email) });
  try {
    await envoyerSmtp(compte, mime, dest);
  } catch (e) {
    await q("UPDATE mail_drafts SET statut = 'brouillon', sent_at = NULL WHERE id = $1", [rep.id]);
    throw e;
  }
  // Le message est parti : la suite (rangement) ne doit plus pouvoir faire échouer l'envoi.
  await avecImap(compte, async (client) => {
    if (compte.dossiers.sent && !fournisseurParCle(compte.fournisseur).envoiArchive) await deposerEnvoye(client, compte.dossiers.sent, mime).catch(() => undefined);
    await supprimerMessage(client, compte.dossiers.drafts as string, Number(rep.imap_uid)).catch(() => undefined);
  }).catch(() => undefined);
  if (idx) {
    await q("UPDATE mail_messages SET statut = 'traite', repondu_at = now(), lu = true WHERE id = $1", [idx.id]);
    if (idx.lead_id) await addEvent(idx.lead_id, "info", `E-mail envoyé par ${auteur} depuis la messagerie`).catch(() => undefined);
  }
  await journal(compte.user_id, compte.email, "envoi");
}
