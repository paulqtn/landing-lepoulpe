import { NextResponse } from "next/server";
import { adminQuery as q } from "@/lib/admin/db";
import { getSociete } from "@/lib/admin/societe";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { enregistrerBrouillon } from "@/lib/messagerie/brouillons";
import { globaux, journal, reglagesDe } from "@/lib/messagerie/comptes";
import { avecSignature, contexteRedaction, texteFil, type MessageCtx } from "@/lib/messagerie/contexte";
import { ACTIONS, assister, ErreurIA, iaConfiguree, redigerReponse, resumer, type ActionIA } from "@/lib/messagerie/ia";
import { estExclu, neutraliser, sansCitation } from "@/lib/messagerie/modele";
import { planifier } from "@/lib/messagerie/taches";

export const maxDuration = 60;

/* Assistant de la conversation : résumé, rédaction et retouches du brouillon, à la demande du
   commercial. Le texte rendu est enregistré comme brouillon (et déposé dans la boîte en tâche
   de fond) ; rien n'est envoyé. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const g = await globaux();
  if (!g.ia) return refuse("L'IA est désactivée par l'administrateur.", 403);
  if (!iaConfiguree) return refuse("L'IA n'est pas configurée sur le serveur (clé ANTHROPIC_API_KEY absente).", 503);
  const id = Number((await params).id);
  const m = (await q<MessageCtx>("SELECT id, dossier, from_nom, from_email, sujet, date, corps, fil, message_id, lead_id FROM mail_messages WHERE id = $1 AND account_id = $2", [id, a.compte.id]))[0];
  if (!m) return refuse("Message introuvable.", 404);
  const r = reglagesDe(a.compte);
  if (estExclu(m.from_email, r.exclusions)) return refuse("Cet expéditeur est dans votre liste d'exclusion : son message n'est pas transmis à l'IA.", 403);
  const b = await corps(req);
  const action = String(b?.action ?? "");
  const brouillon = typeof b?.brouillon === "string" ? b.brouillon : "";
  const precision = typeof b?.precision === "string" ? b.precision.slice(0, 1000) : "";

  try {
    if (action === "resumer") {
      const societe = await getSociete();
      const dernier = `<message de="${neutraliser(m.from_nom || m.from_email, 120).replace(/"/g, "'")}" date="${new Date(m.date).toISOString()}">\n${neutraliser(sansCitation(m.corps ?? ""), 4000)}\n</message>`;
      const res = await resumer(societe.raisonSociale, `${await texteFil(a.compte, m.fil, m.id)}\n${dernier}`);
      await journal(a.user.id, a.compte.email, "ia_resume", m.sujet);
      return NextResponse.json({ ok: true, resume: res });
    }
    if (!(action in ACTIONS)) return refuse("Action inconnue.", 400);
    if (action === "traduire" && !precision) return refuse("Indiquez la langue de la traduction.");
    if (action === "libre" && !precision) return refuse("Écrivez votre demande à l'IA.");
    const ctx = await contexteRedaction(a.compte, a.user, m);
    // Les retouches travaillent sur le texte sans la signature, remise ensuite telle quelle.
    const sansSig = r.signature.trim() && brouillon.includes(r.signature.trim()) ? brouillon.replace(r.signature.trim(), "").trim() : brouillon;
    const red = action === "generer" || ((action === "regenerer" || action === "relance" || action === "rendez_vous") && !sansSig.trim())
      ? await redigerReponse(ctx, ACTIONS[action as ActionIA])
      : await assister(ctx, action as Exclude<ActionIA, "generer">, sansSig, precision);
    const texte = avecSignature(red.texte, r.signature);
    const d = await enregistrerBrouillon(a.compte, { messageId: m.dossier === "inbox" ? m.id : null, dest: m.dossier === "inbox" ? m.from_email : "", cc: "", sujet: "", corps: texte, origine: "ia", manquants: red.manquants });
    await planifier(a.compte.id, "brouillon_imap", d.id);
    await journal(a.user.id, a.compte.email, `ia_${action}`, m.sujet);
    return NextResponse.json({ ok: true, brouillon: { id: d.id, dest: d.dest, cc: d.cc, sujet: d.sujet, corps: d.corps, origine: d.origine, manquants: d.manquants, dansLaBoite: false } });
  } catch (e) {
    return refuse(e instanceof ErreurIA ? e.message : "L'IA n'a pas pu répondre. Réessayez dans un instant.", e instanceof ErreurIA && e.definitive ? 422 : 503);
  }
}
