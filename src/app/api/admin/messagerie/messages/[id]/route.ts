import { after, NextResponse } from "next/server";
import { peutVoirFiche } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { journal } from "@/lib/messagerie/comptes";
import { sansImagesDistantes } from "@/lib/messagerie/html";
import { archiver, avecImap, marquerLu } from "@/lib/messagerie/imap";
import { CATEGORIE_CLES, pieceDangereuse, PRIORITE_CLES, sansCitation } from "@/lib/messagerie/modele";
import { planifier } from "@/lib/messagerie/taches";

type Complet = {
  id: number; dossier: "inbox" | "sent"; uid: string; from_nom: string; from_email: string; dest: { to?: string[]; cc?: string[] }; sujet: string; date: string; corps: string | null; html: string | null;
  pieces: { nom: string; type: string; taille: number }[]; lu: boolean; archive: boolean; statut: string; lead_id: number | null; fil: string;
  categorie: string | null; priorite: string | null; besoin_reponse: boolean | null; intention: string | null; resume: string | null; infos: Record<string, string> | null; langue: string | null;
  ia_at: string | null; ia_manuel: boolean; ia_erreur: string | null; repondu_at: string | null;
};

/** Conversation complète : le message, le fil, le brouillon en cours et la fiche du CRM si elle est visible. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const id = Number((await params).id);
  const m = (await q<Complet>("SELECT * FROM mail_messages WHERE id = $1 AND account_id = $2", [id, a.compte.id]))[0];
  if (!m) return refuse("Message introuvable.", 404);
  const images = new URL(req.url).searchParams.get("images") === "1";
  const vue = m.html ? (images ? { html: m.html, masquees: 0 } : sansImagesDistantes(m.html)) : null;
  const [fil, brouillon, fiche, tache] = await Promise.all([
    q<{ id: number; dossier: string; from_nom: string; from_email: string; date: string; corps: string | null }>(
      "SELECT id, dossier, from_nom, from_email, date, corps FROM mail_messages WHERE account_id = $1 AND fil = $2 AND fil <> '' AND id <> $3 ORDER BY date DESC LIMIT 12",
      [a.compte.id, m.fil, m.id],
    ),
    q<{ id: number; dest: string; cc: string; sujet: string; corps: string; origine: string; manquants: string[]; imap_uid: string | null; imap_erreur: string | null; updated_at: string }>(
      "SELECT id, dest, cc, sujet, corps, origine, manquants, imap_uid, imap_erreur, updated_at FROM mail_drafts WHERE account_id = $1 AND message_id = $2 AND statut = 'brouillon'",
      [a.compte.id, m.id],
    ),
    m.lead_id ? q<{ id: number; name: string; statut: Statut; assigned_to: string | null; estimation_ttc: string | null; phone: string }>("SELECT id, name, statut, assigned_to, estimation_ttc, phone FROM leads WHERE id = $1 AND anonymized_at IS NULL", [m.lead_id]) : Promise.resolve([]),
    q<{ type: string; statut: string }>("SELECT type, statut FROM mail_jobs WHERE account_id = $1 AND ref_id = $2 AND type IN ('analyse', 'reponse') AND statut IN ('attente', 'en_cours') LIMIT 1", [a.compte.id, m.id]),
  ]);
  if (!m.lu && m.dossier === "inbox") {
    await q("UPDATE mail_messages SET lu = true WHERE id = $1", [m.id]);
    // Le drapeau « lu » est reporté dans la vraie boîte après la réponse, sans faire attendre l'écran.
    after(() => avecImap(a.compte, (c) => marquerLu(c, a.compte.dossiers.inbox, Number(m.uid), true)).catch(() => undefined));
  }
  const f = fiche[0] && peutVoirFiche(a.user, fiche[0]) ? fiche[0] : null;
  return NextResponse.json({
    ok: true,
    message: {
      id: m.id, dossier: m.dossier, de: { nom: m.from_nom, email: m.from_email }, a: m.dest?.to ?? [], cc: m.dest?.cc ?? [], sujet: m.sujet, date: m.date,
      texte: m.corps ?? "", html: vue?.html ?? null, imagesMasquees: vue?.masquees ?? 0,
      pieces: m.pieces.map((p, i) => ({ n: i, nom: p.nom, type: p.type, taille: p.taille, dangereuse: pieceDangereuse(p.nom) })),
      lu: true, archive: m.archive, statut: m.statut, categorie: m.categorie, priorite: m.priorite, besoinReponse: m.besoin_reponse, intention: m.intention, resume: m.resume, infos: m.infos, langue: m.langue,
      iaLe: m.ia_at, iaManuel: m.ia_manuel, iaErreur: m.ia_erreur, reponduLe: m.repondu_at, enCours: tache[0]?.type ?? null,
    },
    fil: fil.reverse().map((x) => ({ id: x.id, envoye: x.dossier === "sent", de: x.from_nom || x.from_email, date: x.date, texte: sansCitation(x.corps ?? "").slice(0, 6000) })),
    brouillon: brouillon[0] ? { ...brouillon[0], dansLaBoite: brouillon[0].imap_uid !== null } : null,
    fiche: f ? { id: f.id, nom: f.name, etape: STATUT_LABELS[f.statut] ?? f.statut, estimation: f.estimation_ttc, telephone: f.phone, suiviPar: f.assigned_to } : null,
  });
}

/** Actions du commercial sur un message : lu, archivé, statut, et correction du tri proposé par l'IA. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const id = Number((await params).id);
  const m = (await q<{ id: number; uid: string; dossier: string; archive: boolean; sujet: string }>("SELECT id, uid, dossier, archive, sujet FROM mail_messages WHERE id = $1 AND account_id = $2", [id, a.compte.id]))[0];
  if (!m) return refuse("Message introuvable.", 404);
  const b = await corps(req);
  if (!b) return refuse("Demande illisible.", 400);

  if (b.relancerAnalyse === true) {
    await q("UPDATE mail_messages SET ia_at = NULL, ia_manuel = false, ia_erreur = NULL WHERE id = $1", [m.id]);
    await planifier(a.compte.id, "analyse", m.id);
    return NextResponse.json({ ok: true });
  }
  if (typeof b.lu === "boolean" && m.dossier === "inbox") {
    await q("UPDATE mail_messages SET lu = $2 WHERE id = $1", [m.id, b.lu]);
    const lu = b.lu;
    after(() => avecImap(a.compte, (c) => marquerLu(c, a.compte.dossiers.inbox, Number(m.uid), lu)).catch(() => undefined));
  }
  if (b.archive === true && m.dossier === "inbox" && !m.archive) {
    try {
      const cible = await avecImap(a.compte, (c) => archiver(c, a.compte.dossiers, Number(m.uid)));
      if (cible !== a.compte.dossiers.archive) await q("UPDATE mail_accounts SET dossiers = dossiers || $2::jsonb WHERE id = $1", [a.compte.id, JSON.stringify({ archive: cible })]);
    } catch (e) {
      return refuse(`Archivage impossible dans la boîte mail : ${e instanceof Error ? e.message.slice(0, 160) : "erreur"}`, 502);
    }
    await q("UPDATE mail_messages SET archive = true WHERE id = $1", [m.id]);
    await journal(a.user.id, a.compte.email, "archive", m.sujet);
  }
  if (typeof b.statut === "string" && ["a_traiter", "en_attente", "traite"].includes(b.statut)) await q("UPDATE mail_messages SET statut = $2 WHERE id = $1", [m.id, b.statut]);
  // Correction du tri : le choix du commercial est marqué comme manuel et n'est plus écrasé par l'IA.
  const sets: string[] = [];
  const vals: unknown[] = [m.id];
  if (typeof b.categorie === "string" && (CATEGORIE_CLES as string[]).includes(b.categorie)) { vals.push(b.categorie); sets.push(`categorie = $${vals.length}`); }
  if (typeof b.priorite === "string" && (PRIORITE_CLES as string[]).includes(b.priorite)) { vals.push(b.priorite); sets.push(`priorite = $${vals.length}`); }
  if (typeof b.besoinReponse === "boolean") { vals.push(b.besoinReponse); sets.push(`besoin_reponse = $${vals.length}`); }
  if (sets.length > 0) {
    await q(`UPDATE mail_messages SET ${sets.join(", ")}, ia_manuel = true WHERE id = $1`, vals);
    await journal(a.user.id, a.compte.email, "tri_corrige", m.sujet);
  }
  return NextResponse.json({ ok: true });
}
