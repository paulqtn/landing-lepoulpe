import { NextResponse } from "next/server";
import { getSociete } from "@/lib/admin/societe";
import { accesAvecBoite, corps, refuse } from "@/lib/messagerie/acces";
import { chargerConversation, indexDe } from "@/lib/messagerie/boite";
import { ecrireBrouillon } from "@/lib/messagerie/brouillons";
import { globaux, journal, reglagesDe } from "@/lib/messagerie/comptes";
import { avecSignature, contexteRedaction, texteFil } from "@/lib/messagerie/contexte";
import { ACTIONS, assister, ErreurIA, iaConfiguree, redigerReponse, resumer, type ActionIA } from "@/lib/messagerie/ia";
import { erreurLisible } from "@/lib/messagerie/imap";
import { estExclu, neutraliser, sansCitation } from "@/lib/messagerie/modele";

export const maxDuration = 60;

/* Assistant de la conversation : résumé, rédaction et retouches du brouillon, à la demande du
   commercial. La conversation est relue dans la boîte pour l'occasion ; le texte rendu est écrit
   dans le dossier Brouillons de la boîte. Rien n'est envoyé, rien n'est gardé en base. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const g = await globaux();
  if (!g.ia) return refuse("L'IA est désactivée par l'administrateur.", 403);
  if (!iaConfiguree) return refuse("L'IA n'est pas configurée sur le serveur (clé ANTHROPIC_API_KEY absente).", 503);
  const idx = await indexDe(a.compte, Number((await params).id));
  if (!idx) return refuse("Message introuvable.", 404);
  const b = await corps(req);
  const action = String(b?.action ?? "");
  const brouillon = typeof b?.brouillon === "string" ? b.brouillon : "";
  const precision = typeof b?.precision === "string" ? b.precision.slice(0, 1000) : "";
  if (action !== "resumer" && !(action in ACTIONS)) return refuse("Action inconnue.", 400);
  if (action === "traduire" && !precision) return refuse("Indiquez la langue de la traduction.");
  if (action === "libre" && !precision) return refuse("Écrivez votre demande à l'IA.");
  const recu = idx.dossier !== "sent";

  let conv;
  try {
    conv = await chargerConversation(a.compte, idx, { style: action !== "resumer" });
  } catch (e) {
    return refuse(`Votre boîte mail ne répond pas : ${erreurLisible(e)}`, 502);
  }
  const m = conv.message;
  if (!m) return refuse("Ce message n'est plus dans votre boîte mail.", 404);
  const r = reglagesDe(a.compte);
  if (estExclu(m.fromEmail, r.exclusions)) return refuse("Cet expéditeur est dans votre liste d'exclusion : son message n'est pas transmis à l'IA.", 403);

  try {
    if (action === "resumer") {
      const societe = await getSociete();
      const dernier = `<message de="${neutraliser(m.fromNom || m.fromEmail, 120).replace(/"/g, "'")}" date="${m.date.toISOString()}">\n${neutraliser(sansCitation(m.texte), 4000)}\n</message>`;
      const res = await resumer(societe.raisonSociale, `${texteFil(conv)}\n${dernier}`);
      await journal(a.user.id, a.compte.email, "ia_resume");
      return NextResponse.json({ ok: true, resume: res });
    }
    const ctx = await contexteRedaction(a.compte, a.user, conv, idx.lead_id, recu);
    // Les retouches travaillent sur le texte sans la signature, remise ensuite telle quelle.
    const sansSig = r.signature.trim() && brouillon.includes(r.signature.trim()) ? brouillon.replace(r.signature.trim(), "").trim() : brouillon;
    const red = action === "generer" || ((action === "regenerer" || action === "relance" || action === "rendez_vous") && !sansSig.trim())
      ? await redigerReponse(ctx, ACTIONS[action as ActionIA])
      : await assister(ctx, action as Exclude<ActionIA, "generer">, sansSig, precision);
    const d = await ecrireBrouillon(a.compte, recu ? idx : null, { dest: recu ? m.fromEmail : "", cc: "", sujet: "", corps: avecSignature(red.texte, r.signature), origine: "ia", manquants: red.manquants }, recu ? m : null);
    await journal(a.user.id, a.compte.email, `ia_${action}`);
    return NextResponse.json({ ok: true, brouillon: d });
  } catch (e) {
    if (e instanceof ErreurIA) return refuse(e.message, e.definitive ? 422 : 503);
    return refuse(`Le brouillon n'a pas pu être écrit dans votre boîte mail : ${erreurLisible(e)}`, 502);
  }
}
