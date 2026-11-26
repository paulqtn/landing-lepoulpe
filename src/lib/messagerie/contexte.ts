import { adminQuery as q } from "@/lib/admin/db";
import { peutVoirFiche, type User } from "@/lib/admin/auth";
import { getSociete } from "@/lib/admin/societe";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";
import { globaux, reglagesDe, type Compte } from "./comptes";
import type { ContexteRedaction } from "./ia";
import { neutraliser, sansCitation } from "./modele";

/* Contexte commercial transmis à l'IA pour rédiger : uniquement ce que le commercial a le droit
   de voir, et uniquement ce qui sert à répondre. Jamais de tarif d'achat, de marge, de
   coefficient ni de pièce jointe. Les montants cités sont ceux des devis déjà envoyés au client. */

export type MessageCtx = { id: number; dossier: "inbox" | "sent"; from_nom: string; from_email: string; sujet: string; date: string; corps: string | null; fil: string; message_id: string; lead_id: number | null };

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

/** Messages précédents de la conversation, du plus ancien au plus récent, bornés. */
export async function texteFil(compte: Compte, fil: string, sauf?: number): Promise<string> {
  if (!fil) return "";
  const msgs = await q<{ id: number; dossier: string; from_nom: string; from_email: string; date: string; corps: string | null }>(
    "SELECT id, dossier, from_nom, from_email, date, corps FROM mail_messages WHERE account_id = $1 AND fil = $2 ORDER BY date DESC LIMIT 9",
    [compte.id, fil],
  );
  return msgs
    .filter((m) => m.id !== sauf)
    .slice(0, 8)
    .reverse()
    .map((m) => `<message de="${m.dossier === "sent" ? "le commercial" : neutraliser(m.from_nom || m.from_email, 120).replace(/"/g, "'")}" date="${dateFr.format(new Date(m.date))}">\n${neutraliser(sansCitation(m.corps ?? ""), 2500)}\n</message>`)
    .join("\n");
}

async function texteStyle(compte: Compte): Promise<string> {
  const msgs = await q<{ corps: string | null }>(
    "SELECT corps FROM mail_messages WHERE account_id = $1 AND dossier = 'sent' AND corps IS NOT NULL AND length(corps) > 80 ORDER BY date DESC LIMIT 3",
    [compte.id],
  );
  return msgs.map((m, i) => `<exemple n="${i + 1}">\n${neutraliser(sansCitation(m.corps ?? ""), 900)}\n</exemple>`).join("\n");
}

export async function contexteRedaction(compte: Compte, user: User, m: MessageCtx | null): Promise<ContexteRedaction> {
  const [societe, g, fiche, fil, style] = await Promise.all([getSociete(), globaux(), texteFiche(user, m?.lead_id ?? null), m ? texteFil(compte, m.fil, m.dossier === "inbox" ? m.id : undefined) : Promise.resolve(""), texteStyle(compte)]);
  const r = reglagesDe(compte);
  const coordonnees = [societe.telephone && `Téléphone de l'entreprise : ${societe.telephone}`, societe.email && `E-mail de contact : ${societe.email}`, societe.validiteJours && `Validité d'un devis : ${societe.validiteJours} jours`].filter(Boolean).join("\n");
  return {
    societe: societe.raisonSociale,
    commercial: compte.nom || user.name,
    ton: r.ton,
    instructionsPerso: r.instructions,
    connaissances: [coordonnees, g.connaissances].filter(Boolean).join("\n\n"),
    fiche,
    fil,
    style,
    courriel: m && m.dossier === "inbox" ? { de: `${m.from_nom} <${m.from_email}>`, sujet: m.sujet, corps: sansCitation(m.corps ?? "") } : null,
  };
}

/** Signature du commercial ajoutée sous le texte préparé (une seule fois). */
export function avecSignature(texte: string, signature: string): string {
  const s = signature.trim();
  return !s || texte.includes(s) ? texte.trim() : `${texte.trim()}\n\n${s}`;
}
