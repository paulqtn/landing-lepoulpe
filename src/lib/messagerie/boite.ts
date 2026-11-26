import { adminQuery as q } from "@/lib/admin/db";
import type { Compte } from "./comptes";
import { avecImap, lireMessages, marquerLu, type MessageLu } from "./imap";

/* Lecture directe dans la boîte mail. La base ne contient aucun contenu d'e-mail : seulement un
   index (où se trouve le message, sa date, ses étiquettes de tri). Tout ce qui s'affiche ou part
   vers l'IA est relu dans la boîte à l'instant où on en a besoin, puis oublié. */

export type Dossier = "inbox" | "sent" | "archive";

/** Une ligne de l'index : aucun objet, aucun expéditeur, aucun texte. */
export type Index = {
  id: number;
  account_id: number;
  dossier: Dossier;
  uid: string;
  uidvalidity: string;
  /** Empreintes de l'identifiant du message, du message auquel il répond, du fil et de l'expéditeur. */
  mid: string;
  irt: string | null;
  fil: string;
  exp: string;
  date: string;
  lu: boolean;
  archive: boolean;
  statut: "a_traiter" | "en_attente" | "traite";
  lead_id: number | null;
  categorie: string | null;
  priorite: string | null;
  besoin_reponse: boolean | null;
  langue: string | null;
  ia_at: string | null;
  ia_manuel: boolean;
  ia_erreur: string | null;
  repondu_at: string | null;
  nb_pieces: number;
};

export const cheminDe = (compte: Compte, dossier: Dossier): string | null => (dossier === "inbox" ? compte.dossiers.inbox : dossier === "sent" ? compte.dossiers.sent : compte.dossiers.archive);

export async function indexDe(compte: Compte, id: number): Promise<Index | null> {
  return (await q<Index>("SELECT * FROM mail_messages WHERE id = $1 AND account_id = $2", [id, compte.id]))[0] ?? null;
}

/** Le message n'est plus à cet endroit de la boîte (déplacé ou supprimé ailleurs) : il quitte l'index. */
export async function oublier(compte: Compte, ids: number[]): Promise<void> {
  if (ids.length > 0) await q("DELETE FROM mail_messages WHERE account_id = $1 AND id = ANY($2)", [compte.id, ids]);
}

export type Conversation = {
  message: MessageLu | null;
  /** Autres messages du fil, du plus ancien au plus récent. */
  fil: (MessageLu & { envoye: boolean; indexId: number })[];
  /** Derniers messages écrits par le commercial (pour sa manière d'écrire). */
  style: MessageLu[];
  brouillon: MessageLu | null;
};

/** Relit dans la boîte, en une seule connexion, un message, son fil et ce qui l'accompagne. */
export async function chargerConversation(compte: Compte, idx: Index, opts: { fil?: boolean; style?: boolean; brouillonUid?: number | null; marquerLu?: boolean } = {}): Promise<Conversation> {
  const [voisins, envoyes] = await Promise.all([
    opts.fil !== false && idx.fil
      ? q<Pick<Index, "id" | "dossier" | "uid">>("SELECT id, dossier, uid FROM mail_messages WHERE account_id = $1 AND fil = $2 AND id <> $3 ORDER BY date DESC LIMIT 8", [compte.id, idx.fil, idx.id])
      : Promise.resolve([]),
    opts.style ? q<Pick<Index, "uid">>("SELECT uid FROM mail_messages WHERE account_id = $1 AND dossier = 'sent' ORDER BY date DESC LIMIT 3", [compte.id]) : Promise.resolve([]),
  ]);
  const chemin = cheminDe(compte, idx.dossier);
  return avecImap(compte, async (client) => {
    const message = chemin ? (await lireMessages(client, chemin, [Number(idx.uid)]))[0] ?? null : null;
    const fil: Conversation["fil"] = [];
    for (const d of ["inbox", "sent", "archive"] as const) {
      const ici = voisins.filter((v) => v.dossier === d);
      const c = cheminDe(compte, d);
      if (ici.length === 0 || !c) continue;
      for (const m of await lireMessages(client, c, ici.map((v) => Number(v.uid)))) fil.push({ ...m, envoye: d === "sent", indexId: ici.find((v) => Number(v.uid) === m.uid)?.id ?? 0 });
    }
    fil.sort((a, b) => Number(a.date) - Number(b.date));
    const style = opts.style && compte.dossiers.sent && envoyes.length > 0 ? await lireMessages(client, compte.dossiers.sent, envoyes.map((e) => Number(e.uid))) : [];
    const brouillon = opts.brouillonUid && compte.dossiers.drafts ? (await lireMessages(client, compte.dossiers.drafts, [opts.brouillonUid]))[0] ?? null : null;
    if (opts.marquerLu && message && !message.lu && chemin) await marquerLu(client, chemin, message.uid, true).catch(() => undefined);
    return { message, fil, style, brouillon };
  });
}
