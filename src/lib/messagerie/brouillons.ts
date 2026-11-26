import { createHash } from "node:crypto";
import { addEvent, adminQuery as q } from "@/lib/admin/db";
import { journal, reglagesDe, type Compte } from "./comptes";
import { composer, envoyerSmtp, listeAdresses, nouvelEnteteId } from "./envoi";
import { fournisseurParCle } from "./fournisseurs";
import { avecImap, deposerBrouillon, deposerEnvoye, repererDossiers, supprimerMessage } from "./imap";
import { objetReponse, sansCitation } from "./modele";

/* Brouillons de réponse. Chaque brouillon du back office a son double dans le vrai dossier
   Brouillons de la boîte mail (APPEND, drapeau \Draft, en-têtes In-Reply-To et References) :
   il se retrouve dans Outlook, Gmail, le webmail et le téléphone. Un message IMAP ne se modifie
   pas : pour mettre à jour un brouillon, on dépose la nouvelle version puis on retire l'ancienne.
   L'empreinte du contenu évite de redéposer un brouillon inchangé. */

export type Brouillon = {
  id: number;
  account_id: number;
  message_id: number | null;
  dest: string;
  cc: string;
  sujet: string;
  corps: string;
  origine: "ia" | "manuel";
  manquants: string[];
  statut: "brouillon" | "envoye" | "supprime";
  entete_id: string | null;
  imap_uid: string | null;
  imap_uidvalidity: string | null;
  empreinte: string | null;
  imap_erreur: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
};

type Origine = { id: number; message_id: string; refs: string | null; date: string; from_nom: string; from_email: string; corps: string | null; sujet: string; lead_id: number | null };

export const empreinte = (b: Pick<Brouillon, "dest" | "cc" | "sujet" | "corps">) => createHash("sha1").update([b.dest, b.cc, b.sujet, b.corps].join("\u0001")).digest("hex");

export async function brouillonDe(compte: Compte, id: number): Promise<Brouillon | null> {
  return (await q<Brouillon>("SELECT * FROM mail_drafts WHERE id = $1 AND account_id = $2", [id, compte.id]))[0] ?? null;
}

async function origineDe(compte: Compte, messageId: number | null): Promise<Origine | null> {
  if (!messageId) return null;
  return (await q<Origine>("SELECT id, message_id, refs, date, from_nom, from_email, corps, sujet, lead_id FROM mail_messages WHERE id = $1 AND account_id = $2", [messageId, compte.id]))[0] ?? null;
}

async function mime(compte: Compte, b: Brouillon, o: Origine | null, enteteId: string, marque: boolean): Promise<Buffer> {
  return composer({
    de: { nom: compte.nom, email: compte.email },
    a: listeAdresses(b.dest),
    cc: listeAdresses(b.cc),
    sujet: b.sujet,
    texte: b.corps,
    origine: o ? { messageId: o.message_id, references: (o.refs ?? "").split(/\s+/).filter(Boolean), date: new Date(o.date), de: o.from_nom ? `${o.from_nom} <${o.from_email}>` : o.from_email, texte: sansCitation(o.corps ?? "") } : null,
    enteteId,
    brouillonId: marque ? b.id : undefined,
  });
}

/** Crée ou met à jour le brouillon d'une réponse. Un seul brouillon en cours par message reçu. */
export async function enregistrerBrouillon(
  compte: Compte,
  v: { id?: number; messageId: number | null; dest: string; cc: string; sujet: string; corps: string; origine: "ia" | "manuel"; manquants?: string[] },
): Promise<Brouillon> {
  const o = await origineDe(compte, v.messageId);
  const dest = listeAdresses(v.dest).join(", ") || (o ? o.from_email : "");
  const sujet = (v.sujet.trim() || (o ? objetReponse(o.sujet) : "")).slice(0, 500);
  const champs = [dest, listeAdresses(v.cc).join(", "), sujet, v.corps.replace(/\u0000/g, "").slice(0, 50_000), v.origine, JSON.stringify((v.manquants ?? []).slice(0, 10))];
  if (v.id) {
    const maj = await q<Brouillon>(
      "UPDATE mail_drafts SET dest = $3, cc = $4, sujet = $5, corps = $6, origine = $7, manquants = $8, updated_at = now() WHERE id = $1 AND account_id = $2 AND statut = 'brouillon' RETURNING *",
      [v.id, compte.id, ...champs],
    );
    if (maj[0]) return maj[0];
  }
  const cree = await q<Brouillon>(
    `INSERT INTO mail_drafts (account_id, message_id, dest, cc, sujet, corps, origine, manquants) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (account_id, message_id) WHERE statut = 'brouillon' AND message_id IS NOT NULL
     DO UPDATE SET dest = EXCLUDED.dest, cc = EXCLUDED.cc, sujet = EXCLUDED.sujet, corps = EXCLUDED.corps, origine = EXCLUDED.origine, manquants = EXCLUDED.manquants, updated_at = now()
     RETURNING *`,
    [compte.id, o?.id ?? null, ...champs],
  );
  return cree[0];
}

/** Dépose le brouillon dans le dossier Brouillons de la boîte. Sans effet si cette version y est déjà. */
export async function deposer(compte: Compte, id: number): Promise<"depose" | "inchange" | "ignore"> {
  const b = await brouillonDe(compte, id);
  if (!b || b.statut !== "brouillon") return "ignore";
  const e = empreinte(b);
  if (b.imap_uid && b.empreinte === e) return "inchange";
  const o = await origineDe(compte, b.message_id);
  const enteteId = nouvelEnteteId(compte.email);
  const contenu = await mime(compte, b, o, enteteId, true);
  try {
    const r = await avecImap(compte, async (client) => {
      let chemin = compte.dossiers.drafts;
      if (!chemin) {
        await client.mailboxCreate("Drafts").catch(() => undefined);
        chemin = repererDossiers(await client.list()).drafts ?? "Drafts";
        await q("UPDATE mail_accounts SET dossiers = dossiers || $2::jsonb WHERE id = $1", [compte.id, JSON.stringify({ drafts: chemin })]);
      }
      const depot = await deposerBrouillon(client, chemin, contenu);
      // La nouvelle version est en place : l'ancienne peut partir (jamais l'inverse).
      if (b.imap_uid) await supprimerMessage(client, chemin, Number(b.imap_uid)).catch(() => undefined);
      return depot;
    });
    await q("UPDATE mail_drafts SET imap_uid = $2, imap_uidvalidity = $3, entete_id = $4, empreinte = $5, imap_erreur = NULL WHERE id = $1", [b.id, r.uid, r.uidValidity, enteteId, e]);
    return "depose";
  } catch (err) {
    await q("UPDATE mail_drafts SET imap_erreur = $2 WHERE id = $1", [b.id, err instanceof Error ? err.message.slice(0, 300) : "erreur"]);
    throw err;
  }
}

/** Retire un brouillon, dans le back office et dans la boîte mail. */
export async function supprimerBrouillon(compte: Compte, id: number): Promise<boolean> {
  const b = await brouillonDe(compte, id);
  if (!b || b.statut !== "brouillon") return false;
  if (b.imap_uid && compte.dossiers.drafts) await avecImap(compte, (client) => supprimerMessage(client, compte.dossiers.drafts as string, Number(b.imap_uid))).catch(() => undefined);
  await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [b.id]);
  await journal(compte.user_id, compte.email, "brouillon_supprime", b.sujet);
  return true;
}

/** Envoi, uniquement sur demande du commercial : SMTP, copie dans « Envoyés », brouillon retiré. */
export async function envoyerBrouillon(compte: Compte, id: number, auteur: string): Promise<void> {
  const b = await brouillonDe(compte, id);
  if (!b || b.statut !== "brouillon") throw new Error("Ce brouillon n'existe plus ou a déjà été envoyé.");
  const dest = [...listeAdresses(b.dest), ...listeAdresses(b.cc)];
  if (listeAdresses(b.dest).length === 0) throw new Error("Ajoutez au moins un destinataire.");
  if (!b.corps.trim()) throw new Error("Le message est vide.");
  if (/\[[^\]\n]{2,80}\]/.test(b.corps)) throw new Error("Le message contient encore un repère entre crochets à compléter.");
  if (!compte.smtp_host) throw new Error("Le serveur d'envoi (SMTP) n'est pas renseigné dans les paramètres de la boîte.");
  // Verrou : deux clics, ou deux onglets, n'envoient qu'une fois.
  const pris = await q<{ id: number }>("UPDATE mail_drafts SET statut = 'envoye', sent_at = now() WHERE id = $1 AND account_id = $2 AND statut = 'brouillon' RETURNING id", [b.id, compte.id]);
  if (!pris[0]) throw new Error("Ce brouillon est déjà en cours d'envoi.");
  const o = await origineDe(compte, b.message_id);
  const contenu = await mime(compte, b, o, nouvelEnteteId(compte.email), false);
  try {
    await envoyerSmtp(compte, contenu, dest);
  } catch (e) {
    await q("UPDATE mail_drafts SET statut = 'brouillon', sent_at = NULL WHERE id = $1", [b.id]);
    throw e;
  }
  // Le message est parti : la suite (rangement) ne doit plus pouvoir faire échouer l'envoi.
  await avecImap(compte, async (client) => {
    if (compte.dossiers.sent && !fournisseurParCle(compte.fournisseur).envoiArchive) await deposerEnvoye(client, compte.dossiers.sent, contenu).catch(() => undefined);
    if (b.imap_uid && compte.dossiers.drafts) await supprimerMessage(client, compte.dossiers.drafts, Number(b.imap_uid)).catch(() => undefined);
  }).catch(() => undefined);
  if (o) {
    await q("UPDATE mail_messages SET statut = 'traite', repondu_at = now(), lu = true WHERE id = $1", [o.id]);
    if (o.lead_id) await addEvent(o.lead_id, "info", `E-mail envoyé par ${auteur} : ${b.sujet}`).catch(() => undefined);
  }
  await journal(compte.user_id, compte.email, "envoi", `${b.sujet} → ${listeAdresses(b.dest).join(", ")}`);
}

/** Signature et ton connus du compte, pour l'écran. */
export const signatureDe = (compte: Compte) => reglagesDe(compte).signature;
