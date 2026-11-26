import { adminQuery as q } from "@/lib/admin/db";
import type { User } from "@/lib/admin/auth";
import { globaux, reglagesDe, type Compte, type EtatSync } from "./comptes";
import { ficheParAdresse } from "./contexte";
import { avecImap, erreurLisible, lireDossier, lireDrapeaux, lireNouveaux, supprimerMessage, type MessageLu } from "./imap";
import { cleFil, estExclu, extrait, sansCitation } from "./modele";
import { planifier } from "./taches";

/* Synchronisation d'une boîte : nouveaux messages reçus et envoyés, état « lu », messages
   déplacés ailleurs, et rapprochement des brouillons avec le dossier Brouillons (brouillon
   modifié, envoyé ou supprimé depuis un autre logiciel de messagerie). Travail par lots : un
   passage prend au plus quelques dizaines de messages et dit s'il en reste. */

const LOT = 20;
const PREMIER_MAX = 120;

export async function utilisateurDe(compte: Compte): Promise<User | null> {
  return (await q<User>("SELECT id, email, name, role, active, created_at, last_login_at, menus FROM users WHERE id = $1 AND active", [compte.user_id]))[0] ?? null;
}

async function inserer(compte: Compte, user: User, dossier: "inbox" | "sent", uidValidity: string, m: MessageLu): Promise<number | null> {
  const autre = dossier === "inbox" ? m.fromEmail : m.to[0] ?? "";
  const fiche = await ficheParAdresse(user, autre);
  const rows = await q<{ id: number }>(
    `INSERT INTO mail_messages (account_id, dossier, uid, uidvalidity, message_id, in_reply_to, refs, fil, from_nom, from_email, dest, sujet, date, extrait, corps, html, pieces, lu, lead_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     ON CONFLICT (account_id, dossier, uidvalidity, uid) DO NOTHING RETURNING id`,
    [compte.id, dossier, m.uid, uidValidity, m.messageId, m.inReplyTo, m.references.join(" "), cleFil(m), m.fromNom, m.fromEmail, JSON.stringify({ to: m.to, cc: m.cc }), m.sujet, m.date.toISOString(), extrait(m.texte), m.texte, m.html, JSON.stringify(m.pieces), m.lu, fiche?.id ?? null],
  );
  return rows[0]?.id ?? null;
}

export type BilanSync = { recus: number; envoyes: number; reste: boolean };

export async function synchroniser(compte: Compte): Promise<BilanSync> {
  const user = await utilisateurDe(compte);
  if (!user) throw new Error("Compte du back office désactivé.");
  const [g, r] = [await globaux(), reglagesDe(compte)];
  const depuis = new Date(Date.now() - g.joursInitial * 86_400_000);
  const etat: EtatSync = { ...compte.etat };
  const bilan: BilanSync = { recus: 0, envoyes: 0, reste: false };
  try {
    await avecImap(compte, async (client) => {
      /* 1. Messages reçus. */
      const recu = await lireNouveaux(client, compte.dossiers.inbox, etat.inbox, { depuis, lot: LOT, premierMax: PREMIER_MAX });
      for (const m of recu.messages) {
        const id = await inserer(compte, user, "inbox", recu.etat.uidValidity, m);
        if (!id) continue;
        bilan.recus++;
        const deMoi = m.fromEmail === compte.email.toLowerCase();
        if (g.ia && r.triAuto && !deMoi && !estExclu(m.fromEmail, r.exclusions)) await planifier(compte.id, "analyse", id);
      }
      etat.inbox = recu.etat;
      bilan.reste = recu.reste;

      /* 2. Messages envoyés : ils disent à quoi le commercial a déjà répondu, et donnent son style. */
      if (compte.dossiers.sent) {
        const env = await lireNouveaux(client, compte.dossiers.sent, etat.sent, { depuis, lot: LOT, premierMax: 60 });
        for (const m of env.messages) {
          const id = await inserer(compte, user, "sent", env.etat.uidValidity, m);
          if (!id) continue;
          bilan.envoyes++;
          if (m.inReplyTo)
            await q("UPDATE mail_messages SET statut = 'traite', repondu_at = COALESCE(repondu_at, $3) WHERE account_id = $1 AND dossier = 'inbox' AND message_id = $2", [compte.id, m.inReplyTo, m.date.toISOString()]);
        }
        etat.sent = env.etat;
        bilan.reste = bilan.reste || env.reste;
      }

      /* 3. État « lu » et messages sortis de la boîte de réception depuis un autre logiciel. */
      const connus = await q<{ id: number; uid: string; lu: boolean }>(
        "SELECT id, uid, lu FROM mail_messages WHERE account_id = $1 AND dossier = 'inbox' AND uidvalidity = $2 AND NOT archive AND date > now() - interval '21 days' ORDER BY date DESC LIMIT 150",
        [compte.id, recu.etat.uidValidity],
      );
      if (connus.length > 0) {
        const drapeaux = await lireDrapeaux(client, compte.dossiers.inbox, connus.map((c) => Number(c.uid)));
        for (const c of connus) {
          const lu = drapeaux.get(Number(c.uid));
          if (lu === undefined) await q("UPDATE mail_messages SET archive = true WHERE id = $1", [c.id]);
          else if (lu !== c.lu) await q("UPDATE mail_messages SET lu = $2 WHERE id = $1", [c.id, lu]);
        }
      }

      /* 4. Brouillons : rapprochement avec le dossier Brouillons de la boîte. */
      const brouillons = await q<{ id: number; message_id: number | null; imap_uid: string | null; corps: string; sujet: string; created_at: string; origine_mid: string | null }>(
        `SELECT d.id, d.message_id, d.imap_uid, d.corps, d.sujet, d.created_at, m.message_id AS origine_mid
         FROM mail_drafts d LEFT JOIN mail_messages m ON m.id = d.message_id WHERE d.account_id = $1 AND d.statut = 'brouillon' AND d.imap_uid IS NOT NULL`,
        [compte.id],
      );
      if (brouillons.length > 0 && compte.dossiers.drafts) {
        const presents = await lireDossier(client, compte.dossiers.drafts, new Date(Date.now() - 45 * 86_400_000), 80);
        for (const b of brouillons) {
          const candidats = presents.filter((p) => p.enteteBrouillon === String(b.id) || (b.origine_mid && p.inReplyTo === b.origine_mid)).sort((x, y) => y.uid - x.uid);
          const garde = candidats[0];
          if (garde) {
            // Doublons (deux versions du même brouillon) : la plus récente reste, les autres partent.
            for (const d of candidats.slice(1)) await supprimerMessage(client, compte.dossiers.drafts, d.uid).catch(() => undefined);
            const texte = sansCitation(garde.texte);
            if (garde.uid !== Number(b.imap_uid)) {
              // Brouillon modifié depuis un autre logiciel : sa version devient la référence.
              await q("UPDATE mail_drafts SET corps = $2, sujet = $3, imap_uid = $4, empreinte = NULL, origine = CASE WHEN corps = $2 THEN origine ELSE 'manuel' END, updated_at = now() WHERE id = $1", [b.id, texte || b.corps, garde.sujet || b.sujet, garde.uid]);
            }
            continue;
          }
          // Absent du dossier : envoyé depuis un autre logiciel, ou supprimé.
          const envoye = b.origine_mid
            ? (await q<{ date: string }>("SELECT date FROM mail_messages WHERE account_id = $1 AND dossier = 'sent' AND in_reply_to = $2 AND date > $3 ORDER BY date LIMIT 1", [compte.id, b.origine_mid, b.created_at]))[0]
            : undefined;
          if (envoye) {
            await q("UPDATE mail_drafts SET statut = 'envoye', sent_at = $2 WHERE id = $1", [b.id, envoye.date]);
          } else {
            await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [b.id]);
          }
        }
      }
    });

    /* 5. Conservation : au-delà de la durée fixée par l'administrateur, les messages quittent le back office (ils restent dans la boîte mail). */
    const purge = !etat.purgeAt || Date.now() - Number(new Date(etat.purgeAt)) > 20 * 3600_000;
    if (purge) {
      await q("DELETE FROM mail_drafts WHERE account_id = $1 AND statut <> 'brouillon' AND updated_at < now() - ($2 || ' days')::interval", [compte.id, String(g.conservationJours)]);
      await q("DELETE FROM mail_messages WHERE account_id = $1 AND date < now() - ($2 || ' days')::interval", [compte.id, String(g.conservationJours)]);
      etat.purgeAt = new Date().toISOString();
    }
    await q("UPDATE mail_accounts SET etat = $2, statut = 'ok', erreur = NULL, last_sync_at = now(), updated_at = now() WHERE id = $1", [compte.id, JSON.stringify(etat)]);
    return bilan;
  } catch (e) {
    const message = erreurLisible(e);
    await q("UPDATE mail_accounts SET statut = 'erreur', erreur = $2, updated_at = now() WHERE id = $1", [compte.id, message]);
    throw new Error(message);
  }
}
