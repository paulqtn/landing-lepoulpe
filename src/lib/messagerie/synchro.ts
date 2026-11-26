import { adminQuery as q } from "@/lib/admin/db";
import type { User } from "@/lib/admin/auth";
import { empreinteDe } from "./chiffrement";
import { globaux, reglagesDe, type Compte, type EtatSync } from "./comptes";
import { ficheParAdresse } from "./contexte";
import { avecImap, erreurLisible, lireDossier, lireDrapeaux, lireEntetes, nouveauxUids, supprimerMessage, type Entete } from "./imap";
import { cleFil, estExclu } from "./modele";
import { planifier } from "./taches";

/* Synchronisation d'une boîte : elle met à jour l'index, pas une copie des e-mails.
   Pour chaque nouveau message, la base reçoit sa position dans la boîte, sa date et des
   empreintes (identifiant, fil, expéditeur). Aucun objet, aucune adresse, aucun texte.
   Elle suit aussi l'état « lu », les messages déplacés ailleurs, et rapproche les brouillons
   du dossier Brouillons (modifié, envoyé ou supprimé depuis un autre logiciel).
   Travail par lots : un passage prend quelques dizaines de messages et dit s'il en reste. */

const LOT = 25;
const PREMIER_MAX = 120;

export async function utilisateurDe(compte: Compte): Promise<User | null> {
  return (await q<User>("SELECT id, email, name, role, active, created_at, last_login_at, menus FROM users WHERE id = $1 AND active", [compte.user_id]))[0] ?? null;
}

async function indexer(compte: Compte, user: User, dossier: "inbox" | "sent", uidValidity: string, m: Entete): Promise<number | null> {
  const autre = dossier === "inbox" ? m.fromEmail : m.to[0] ?? "";
  const fiche = await ficheParAdresse(user, autre);
  const rows = await q<{ id: number }>(
    `INSERT INTO mail_messages (account_id, dossier, uid, uidvalidity, mid, irt, fil, exp, date, lu, nb_pieces, lead_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     ON CONFLICT (account_id, dossier, uidvalidity, uid) DO NOTHING RETURNING id`,
    [compte.id, dossier, m.uid, uidValidity, empreinteDe(m.messageId), m.inReplyTo ? empreinteDe(m.inReplyTo) : null, empreinteDe(cleFil(m)), empreinteDe(autre), m.date.toISOString(), m.lu, m.nbPieces, fiche?.id ?? null],
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
      const recu = await nouveauxUids(client, compte.dossiers.inbox, etat.inbox, { depuis, lot: LOT, premierMax: PREMIER_MAX });
      // La boîte a renuméroté ses messages : l'ancien index de ce dossier ne désigne plus rien.
      if (recu.repart) await q("DELETE FROM mail_messages WHERE account_id = $1 AND dossier = 'inbox' AND uidvalidity <> $2", [compte.id, recu.etat.uidValidity]);
      for (const m of await lireEntetes(client, compte.dossiers.inbox, recu.uids)) {
        const id = await indexer(compte, user, "inbox", recu.etat.uidValidity, m);
        if (!id) continue;
        bilan.recus++;
        const deMoi = m.fromEmail === compte.email.toLowerCase();
        if (g.ia && r.triAuto && !deMoi && !estExclu(m.fromEmail, r.exclusions)) await planifier(compte.id, "analyse", id);
      }
      etat.inbox = recu.etat;
      bilan.reste = recu.reste;

      /* 2. Messages envoyés : ils disent à quoi le commercial a déjà répondu. */
      if (compte.dossiers.sent) {
        const env = await nouveauxUids(client, compte.dossiers.sent, etat.sent, { depuis, lot: LOT, premierMax: 60 });
        if (env.repart) await q("DELETE FROM mail_messages WHERE account_id = $1 AND dossier = 'sent' AND uidvalidity <> $2", [compte.id, env.etat.uidValidity]);
        for (const m of await lireEntetes(client, compte.dossiers.sent, env.uids)) {
          const id = await indexer(compte, user, "sent", env.etat.uidValidity, m);
          if (!id) continue;
          bilan.envoyes++;
          if (m.inReplyTo)
            await q("UPDATE mail_messages SET statut = 'traite', repondu_at = COALESCE(repondu_at, $3) WHERE account_id = $1 AND dossier = 'inbox' AND mid = $2", [compte.id, empreinteDe(m.inReplyTo), m.date.toISOString()]);
        }
        etat.sent = env.etat;
        bilan.reste = bilan.reste || env.reste;
      }

      /* 3. État « lu », et messages sortis de la boîte de réception depuis un autre logiciel (ils quittent l'index). */
      const connus = await q<{ id: number; uid: string; lu: boolean }>(
        "SELECT id, uid, lu FROM mail_messages WHERE account_id = $1 AND dossier = 'inbox' AND uidvalidity = $2 ORDER BY date DESC LIMIT 200",
        [compte.id, recu.etat.uidValidity],
      );
      if (connus.length > 0) {
        const drapeaux = await lireDrapeaux(client, compte.dossiers.inbox, connus.map((c) => Number(c.uid)));
        const partis: number[] = [];
        for (const c of connus) {
          const lu = drapeaux.get(Number(c.uid));
          if (lu === undefined) partis.push(c.id);
          else if (lu !== c.lu) await q("UPDATE mail_messages SET lu = $2 WHERE id = $1", [c.id, lu]);
        }
        if (partis.length > 0) await q("DELETE FROM mail_messages WHERE account_id = $1 AND id = ANY($2)", [compte.id, partis]);
      }

      /* 4. Brouillons : rapprochement des repères avec le dossier Brouillons de la boîte. */
      const reperes = await q<{ id: number; imap_uid: string | null; created_at: string; origine_mid: string | null }>(
        `SELECT d.id, d.imap_uid, d.created_at, m.mid AS origine_mid
         FROM mail_drafts d LEFT JOIN mail_messages m ON m.id = d.message_id WHERE d.account_id = $1 AND d.statut = 'brouillon' AND d.imap_uid IS NOT NULL`,
        [compte.id],
      );
      if (reperes.length > 0 && compte.dossiers.drafts) {
        const presents = await lireDossier(client, compte.dossiers.drafts, new Date(Date.now() - 60 * 86_400_000), 100);
        for (const b of reperes) {
          const candidats = presents.filter((p) => p.enteteBrouillon === String(b.id) || (b.origine_mid && p.inReplyTo && empreinteDe(p.inReplyTo) === b.origine_mid)).sort((x, y) => y.uid - x.uid);
          const garde = candidats[0];
          if (garde) {
            // Doublons (deux versions du même brouillon) : la plus récente reste, les autres partent.
            for (const d of candidats.slice(1)) await supprimerMessage(client, compte.dossiers.drafts, d.uid).catch(() => undefined);
            // Brouillon modifié depuis un autre logiciel : le repère suit sa nouvelle position.
            if (garde.uid !== Number(b.imap_uid)) await q("UPDATE mail_drafts SET imap_uid = $2, empreinte = NULL, updated_at = now() WHERE id = $1", [b.id, garde.uid]);
            continue;
          }
          // Absent du dossier : envoyé depuis un autre logiciel, ou supprimé.
          const envoye = b.origine_mid
            ? (await q<{ date: string }>("SELECT date FROM mail_messages WHERE account_id = $1 AND dossier = 'sent' AND irt = $2 AND date > $3 ORDER BY date LIMIT 1", [compte.id, b.origine_mid, b.created_at]))[0]
            : undefined;
          if (envoye) await q("UPDATE mail_drafts SET statut = 'envoye', sent_at = $2 WHERE id = $1", [b.id, envoye.date]);
          else await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [b.id]);
        }
      }
    });

    /* 5. L'index lui-même est borné dans le temps (durée fixée par l'administrateur). */
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
