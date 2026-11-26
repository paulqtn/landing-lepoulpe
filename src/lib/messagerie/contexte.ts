import { adminQuery as q } from "@/lib/admin/db";
import { peutVoirFiche, type User } from "@/lib/admin/auth";
import { getSociete } from "@/lib/admin/societe";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";
import type { Conversation } from "./boite";
import { globaux, reglagesDe, type Compte } from "./comptes";
import type { ContexteRedaction } from "./ia";
import { neutraliser, sansCitation } from "./modele";

/* Contexte commercial transmis à l'IA pour rédiger : uniquement ce que le commercial a le droit
   de voir, et uniquement ce qui sert à répondre. Jamais de tarif d'achat, de marge, de
   coefficient ni de pièce jointe. Les montants cités sont ceux des devis déjà envoyés au client.
   Les e-mails viennent d'être relus dans la boîte : rien n'en est conservé après l'appel. */

const dateFr = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" });

/** Fiche du CRM qui correspond à une adresse, parmi celles que l'utilisateur peut voir. */
export async function ficheParAdresse(user: User, email: string): Promise<{ id: number; name: string; assigned_to: string | null } | null> {
  if (!email) return null;
  const rows = await q<{ id: number; name: string; assigned_to: string | null }>(
    "SELECT id, name, assigned_to FROM leads WHERE lower(email) = $1 AND anonymized_at IS NULL ORDER BY (assigned_to = $2) DESC NULLS LAST, id DESC LIMIT 5",
    [email.toLowerCase(), user.name],
  );
  return rows.find((l) => peutVoirFiche(user, l)) ?? null;
}

async function texteFiche(user: User, leadId: number | null): Promise<string> {
  if (!leadId) return "";
  const lead = (await q<{ id: number; name: string; statut: Statut; assigned_to: string | null; estimation_ttc: string | null; answers: Record<string, unknown> | null; rappel_at: string | null; created_at: string }>(
    "SELECT id, name, statut, assigned_to, estimation_ttc, answers, rappel_at, created_at FROM leads WHERE id = $1 AND anonymized_at IS NULL",
    [leadId],
  ))[0];
  if (!lead || !peutVoirFiche(user, lead)) return "";
  const a = lead.answers ?? {};
  const projet = [
    typeof a.lieu === "string" && `lieu : ${a.lieu}`,
    typeof a.systeme === "string" && `fixation : ${a.systeme}`,
    Array.isArray(a.cotes) && a.cotes.length > 0 && `longueurs : ${(a.cotes as unknown[]).map(Number).filter(Number.isFinite).join(" + ")} m`,
    a.hauteur && `hauteur : ${String(a.hauteur).slice(0, 10)} cm`,
    typeof a.teinte === "string" && `verre : ${a.teinte}`,
    typeof a.codePostal === "string" && `code postal du projet : ${a.codePostal}`,
  ].filter(Boolean).join(" ; ");
  const [devis, evts] = await Promise.all([
    q<{ ref: string; sent_at: string | null; total_ttc: string }>("SELECT ref, sent_at, total_ttc FROM quotes WHERE lead_id = $1 AND statut = 'envoye' ORDER BY sent_at DESC NULLS LAST LIMIT 3", [leadId]),
    q<{ created_at: string; type: string; message: string | null }>("SELECT created_at, type, message FROM lead_events WHERE lead_id = $1 AND type IN ('note', 'appel', 'devis_envoye', 'devis_accepte', 'rappel_demande', 'statut') ORDER BY id DESC LIMIT 8", [leadId]),
  ]);
  return [
    `Client : ${neutraliser(lead.name, 120)}`,
    `Étape : ${STATUT_LABELS[lead.statut] ?? lead.statut}`,
    `Première demande : ${dateFr.format(new Date(lead.created_at))}`,
    projet && `Projet : ${neutraliser(projet, 400)}`,
    devis.length > 0 ? `Devis déjà envoyés à ce client : ${devis.map((d) => `${d.ref} (${d.sent_at ? dateFr.format(new Date(d.sent_at)) : "date inconnue"}) : ${Math.round(Number(d.total_ttc)).toLocaleString("fr-FR")} € TTC`).join(" ; ")}` : "Aucun devis envoyé à ce client pour l'instant.",
    lead.rappel_at && `Rappel téléphonique prévu : ${dateFr.format(new Date(lead.rappel_at))}`,
    evts.length > 0 && `Derniers échanges notés :\n${evts.reverse().map((e) => `- ${dateFr.format(new Date(e.created_at))} · ${e.type}${e.message ? ` : ${neutraliser(e.message, 240).replace(/\n/g, " ")}` : ""}`).join("\n")}`,
  ].filter(Boolean).join("\n");
}

/** Les autres messages du fil, tels qu'ils viennent d'être relus, bornés et neutralisés. */
export function texteFil(conv: Conversation): string {
  return conv.fil
    .slice(-8)
    .map((m) => `<message de="${m.envoye ? "le commercial" : neutraliser(m.fromNom || m.fromEmail, 120).replace(/"/g, "'")}" date="${dateFr.format(m.date)}">\n${neutraliser(sansCitation(m.texte), 2500)}\n</message>`)
    .join("\n");
}

export async function contexteRedaction(compte: Compte, user: User, conv: Conversation, leadId: number | null, recu: boolean): Promise<ContexteRedaction> {
  const [societe, g, fiche] = await Promise.all([getSociete(), globaux(), texteFiche(user, leadId)]);
  const r = reglagesDe(compte);
  const coordonnees = [societe.telephone && `Téléphone de l'entreprise : ${societe.telephone}`, societe.email && `E-mail de contact : ${societe.email}`, societe.validiteJours && `Validité d'un devis : ${societe.validiteJours} jours`].filter(Boolean).join("\n");
  const m = conv.message;
  return {
    societe: societe.raisonSociale,
    commercial: compte.nom || user.name,
    ton: r.ton,
    instructionsPerso: r.instructions,
    connaissances: [coordonnees, g.connaissances].filter(Boolean).join("\n\n"),
    fiche,
    fil: texteFil(conv),
    style: conv.style.filter((x) => x.texte.length > 80).map((x, i) => `<exemple n="${i + 1}">\n${neutraliser(sansCitation(x.texte), 900)}\n</exemple>`).join("\n"),
    courriel: m && recu ? { de: `${m.fromNom} <${m.fromEmail}>`, sujet: m.sujet, corps: sansCitation(m.texte) } : null,
  };
}

/** Signature du commercial ajoutée sous le texte préparé (une seule fois). */
export function avecSignature(texte: string, signature: string): string {
  const s = signature.trim();
  return !s || texte.includes(s) ? texte.trim() : `${texte.trim()}\n\n${s}`;
}
