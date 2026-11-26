import { NextResponse } from "next/server";
import { peutVoirFiche } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { chargerConversation, cheminDe, indexDe, oublier } from "@/lib/messagerie/boite";
import { contenuDe, repereDuMessage } from "@/lib/messagerie/brouillons";
import { journal } from "@/lib/messagerie/comptes";
import { sansImagesDistantes } from "@/lib/messagerie/html";
import { archiver, avecImap, erreurLisible, marquerLu } from "@/lib/messagerie/imap";
import { CATEGORIE_CLES, pieceDangereuse, PRIORITE_CLES, sansCitation } from "@/lib/messagerie/modele";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 45;

/** Conversation complète, relue dans la boîte : le message, le fil, le brouillon en cours ; et la fiche du CRM si elle est visible. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const idx = await indexDe(a.compte, Number((await params).id));
  if (!idx) return refuse("Message introuvable.", 404);
  const rep = idx.dossier === "inbox" ? await repereDuMessage(a.compte, idx.id) : null;
  let conv;
  try {
    conv = await chargerConversation(a.compte, idx, { brouillonUid: rep?.imap_uid ? Number(rep.imap_uid) : null, marquerLu: idx.dossier === "inbox" });
  } catch (e) {
    return refuse(`Votre boîte mail ne répond pas : ${erreurLisible(e)}`, 502);
  }
  const m = conv.message;
  if (!m) {
    await oublier(a.compte, [idx.id]);
    return refuse("Ce message n'est plus à cet endroit de votre boîte mail (déplacé ou supprimé depuis un autre logiciel).", 404);
  }
  if (!idx.lu && idx.dossier === "inbox") await q("UPDATE mail_messages SET lu = true WHERE id = $1", [idx.id]);
  // Le repère pointait vers un brouillon qui n'existe plus dans la boîte : il est retiré.
  if (rep && rep.imap_uid && !conv.brouillon) await q("UPDATE mail_drafts SET statut = 'supprime', updated_at = now() WHERE id = $1", [rep.id]);
  const images = new URL(req.url).searchParams.get("images") === "1";
  const vue = m.html ? (images ? { html: m.html, masquees: 0 } : sansImagesDistantes(m.html)) : null;
  const [fiche, tache] = await Promise.all([
    idx.lead_id ? q<{ id: number; name: string; statut: Statut; assigned_to: string | null; estimation_ttc: string | null; phone: string }>("SELECT id, name, statut, assigned_to, estimation_ttc, phone FROM leads WHERE id = $1 AND anonymized_at IS NULL", [idx.lead_id]) : Promise.resolve([]),
    q<{ type: string }>("SELECT type FROM mail_jobs WHERE account_id = $1 AND ref_id = $2 AND type IN ('analyse', 'reponse') AND statut IN ('attente', 'en_cours') LIMIT 1", [a.compte.id, idx.id]),
  ]);
  const f = fiche[0] && peutVoirFiche(a.user, fiche[0]) ? fiche[0] : null;
  return NextResponse.json({
    ok: true,
    message: {
      id: idx.id, dossier: idx.dossier === "sent" ? "sent" : "inbox", de: { nom: m.fromNom, email: m.fromEmail }, a: m.to, cc: m.cc, sujet: m.sujet, date: m.date.toISOString(),
      texte: m.texte, html: vue?.html ?? null, imagesMasquees: vue?.masquees ?? 0,
      pieces: m.pieces.map((p, i) => ({ n: i, nom: p.nom, type: p.type, taille: p.taille, dangereuse: pieceDangereuse(p.nom) })),
      archive: idx.dossier === "archive", statut: idx.statut, categorie: idx.categorie, priorite: idx.priorite, besoinReponse: idx.besoin_reponse, langue: idx.langue,
      iaLe: idx.ia_at, iaManuel: idx.ia_manuel, iaErreur: idx.ia_erreur, reponduLe: idx.repondu_at, enCours: tache[0]?.type ?? null,
    },
    fil: conv.fil.map((x) => ({ id: x.indexId, envoye: x.envoye, de: x.fromNom || x.fromEmail, date: x.date.toISOString(), texte: sansCitation(x.texte).slice(0, 6000) })),
    brouillon: rep && conv.brouillon ? { ...contenuDe(conv.brouillon), id: rep.id, origine: rep.origine, dansLaBoite: true } : null,
    fiche: f ? { id: f.id, nom: f.name, etape: STATUT_LABELS[f.statut] ?? f.statut, estimation: f.estimation_ttc, telephone: f.phone, suiviPar: f.assigned_to } : null,
  });
}

/** Actions du commercial sur un message : lu, archivé, statut, et correction du tri proposé par l'IA. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const idx = await indexDe(a.compte, Number((await params).id));
  if (!idx) return refuse("Message introuvable.", 404);
  const b = await corps(req);
  if (!b) return refuse("Demande illisible.", 400);
  const chemin = cheminDe(a.compte, idx.dossier);

  if (b.relancerAnalyse === true) {
    await q("UPDATE mail_messages SET ia_at = NULL, ia_manuel = false, ia_erreur = NULL WHERE id = $1", [idx.id]);
    await planifier(a.compte.id, "analyse", idx.id);
    return NextResponse.json({ ok: true });
  }
  if (typeof b.lu === "boolean" && idx.dossier === "inbox" && chemin) {
    const lu = b.lu;
    await avecImap(a.compte, (c) => marquerLu(c, chemin, Number(idx.uid), lu)).catch(() => undefined);
    await q("UPDATE mail_messages SET lu = $2 WHERE id = $1", [idx.id, lu]);
  }
  if (b.archive === true && idx.dossier === "inbox") {
    try {
      const r = await avecImap(a.compte, (c) => archiver(c, a.compte.dossiers, Number(idx.uid)));
      if (r.chemin !== a.compte.dossiers.archive) await q("UPDATE mail_accounts SET dossiers = dossiers || $2::jsonb WHERE id = $1", [a.compte.id, JSON.stringify({ archive: r.chemin })]);
      // Le serveur indique où le message est arrivé : l'index le suit. Sinon la ligne quitte l'index (le message reste dans la boîte).
      if (r.uid && r.uidValidity) await q("UPDATE mail_messages SET dossier = 'archive', archive = true, uid = $2, uidvalidity = $3 WHERE id = $1", [idx.id, r.uid, r.uidValidity]);
      else await oublier(a.compte, [idx.id]);
    } catch (e) {
      return refuse(`Archivage impossible dans la boîte mail : ${erreurLisible(e)}`, 502);
    }
    await journal(a.user.id, a.compte.email, "archive");
  }
  if (typeof b.statut === "string" && ["a_traiter", "en_attente", "traite"].includes(b.statut)) await q("UPDATE mail_messages SET statut = $2 WHERE id = $1", [idx.id, b.statut]);
  // Correction du tri : le choix du commercial est marqué comme manuel et n'est plus écrasé par l'IA.
  const sets: string[] = [];
  const vals: unknown[] = [idx.id];
  if (typeof b.categorie === "string" && (CATEGORIE_CLES as string[]).includes(b.categorie)) { vals.push(b.categorie); sets.push(`categorie = $${vals.length}`); }
  if (typeof b.priorite === "string" && (PRIORITE_CLES as string[]).includes(b.priorite)) { vals.push(b.priorite); sets.push(`priorite = $${vals.length}`); }
  if (typeof b.besoinReponse === "boolean") { vals.push(b.besoinReponse); sets.push(`besoin_reponse = $${vals.length}`); }
  if (sets.length > 0) {
    await q(`UPDATE mail_messages SET ${sets.join(", ")}, ia_manuel = true WHERE id = $1`, vals);
    await journal(a.user.id, a.compte.email, "tri_corrige");
  }
  return NextResponse.json({ ok: true });
}
