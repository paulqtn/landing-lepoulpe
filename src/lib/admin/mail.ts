import type { Lead } from "./db";
import { fichesPourLead, videoPourLead } from "./assets";
import { site } from "@/lib/site";
import { rendreCorps } from "./newsletter-html";
import { NB_RELANCES, getRelanceSettings, renderRelance, type RelanceMail, type RelanceVars } from "./relances";

/* ================================================================== */
/*  Emails (devis automatique + séquence de relances) via Resend.      */
/*  RESEND_API_KEY + EMAIL_FROM à définir dans Vercel — sans clef, on  */
/*  ne bloque rien : l'envoi est simplement signalé « non configuré ». */
/* ================================================================== */

export const mailConfigured = Boolean(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? `${site.name} <devis@example.com>`;
const REPLY_TO = process.env.EMAIL_REPLY_TO;
const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Nombre de relances de la séquence (textes et délais : voir relances.ts). */
export const SEQ_MAX = 3;

type SendResult = { sent: boolean; reason?: string };

type Attachment = { filename: string; content: string };

async function send(to: string, subject: string, html: string, attachments?: Attachment[]): Promise<SendResult> {
  if (!mailConfigured) return { sent: false, reason: "RESEND_API_KEY non configurée" };
  // Leads « à rappeler » (assistant du tunnel) : pas d'email — on ne tente rien.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { sent: false, reason: "lead sans email (demande de rappel)" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
        ...(attachments?.length ? { attachments } : {}),
      }),
    });
    if (!res.ok) return { sent: false, reason: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "erreur réseau" };
  }
}

/* ----------------------------- Gabarits ----------------------------- */

function devisUrl(lead: Lead): string {
  return `${site.url}/d/${lead.token}`;
}

function bouton(href: string, label: string, amber = true): string {
  const bg = amber ? "#f6a723" : "#175a3b";
  const color = amber ? "#0c2017" : "#ffffff";
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${color};font-weight:bold;
    font-size:14px;padding:12px 26px;border-radius:999px;text-decoration:none;margin:6px 0;">${label}</a>`;
}

function wrap(content: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1d2a23;">
    <div style="background:#0c2017;border-radius:14px;padding:18px 24px;margin-bottom:20px;">
      <span style="color:#ffffff;font-size:18px;font-weight:bold;">${site.name}</span>
      <span style="color:#f6a723;font-size:11px;letter-spacing:2px;text-transform:uppercase;display:block;margin-top:4px;">
        Garde-corps en verre · direct usine
      </span>
    </div>
    ${content}
    <p style="font-size:13px;color:#5a6b61;margin-top:26px;">
      Une question ? Répondez simplement à cet email ou appelez-nous au
      <strong>${site.phone}</strong> — un conseiller vous répond directement.
    </p>
    <p style="font-size:11px;color:#9aa8a0;margin-top:18px;">
      ${site.name} — devis gratuit et sans engagement. Pour ne plus recevoir nos rappels,
      répondez « stop » à cet email.
    </p>
  </div>`;
}

function recap(lead: Lead): string {
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const lignes: string[] = [];
  if (a.lieu || a.usage) lignes.push(`Projet : ${String(a.lieu ?? a.usage)}`);
  if (a.systeme) lignes.push(`Fixation : ${String(a.systeme)}`);
  if (Array.isArray(a.cotes)) lignes.push(`Longueurs : ${(a.cotes as unknown[]).join(" m + ")} m`);
  if (a.hauteur) lignes.push(`Hauteur : ${String(a.hauteur)} cm`);
  if (a.verre || a.epaisseur) lignes.push(`Verre : ${String(a.verre ?? a.epaisseur)}`);
  if (a.teinte) lignes.push(`Teinte : ${String(a.teinte)}`);
  if (!lignes.length) return "";
  return `
  <table style="width:100%;border-collapse:collapse;margin:14px 0;">
    ${lignes
      .map(
        (l) =>
          `<tr><td style="padding:7px 0;border-bottom:1px solid #e7ece9;font-size:14px;color:#3c4a42;">${l}</td></tr>`,
      )
      .join("")}
  </table>`;
}

function fichesHtml(lead: Lead): string {
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const fiches = fichesPourLead(a);
  const video = videoPourLead(a);
  if (!fiches.length && !video) return "";
  const items = [
    ...fiches.map((f) => `<li style="margin:4px 0;"><a href="${site.url}${f.href}" style="color:#175a3b;font-weight:bold;">${f.label}</a></li>`),
    ...(video ? [`<li style="margin:4px 0;"><a href="${video.url}" style="color:#175a3b;font-weight:bold;">▶ Vidéo : ${video.titre}</a></li>`] : []),
  ].join("");
  return `
  <p style="font-size:13px;font-weight:bold;color:#3c4a42;margin:16px 0 4px;">Pour aller plus loin :</p>
  <ul style="font-size:13px;padding-left:18px;margin:4px 0;">${items}</ul>`;
}

/* --------------------------- Envoi du devis -------------------------- */

export async function sendDevisEmail(lead: Lead): Promise<SendResult> {
  const prix = lead.estimation_ttc ? Number(lead.estimation_ttc) : null;
  const prixHtml = prix
    ? `<div style="background:#0c2017;border-radius:14px;padding:20px 24px;margin:18px 0;">
         <span style="color:#f6a723;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Votre tarif fourniture</span>
         <div style="color:#ffffff;font-size:30px;font-weight:bold;margin-top:6px;">${eur.format(prix)} € TTC</div>
         <span style="color:#cfe0d6;font-size:12px;">Livraison incluse · pose non comprise</span>
       </div>`
    : "";
  const html = wrap(`
    <p style="font-size:15px;">Bonjour ${lead.name},</p>
    <p style="font-size:14px;line-height:1.6;">
      Merci pour votre demande — votre devis de garde-corps en verre est prêt. Retrouvez-le à tout
      moment, avec vos fiches techniques, sur votre page personnelle :
    </p>
    <p style="text-align:center;margin:18px 0;">${bouton(devisUrl(lead), "Voir mon devis en ligne")}</p>
    ${recap(lead)}
    ${prixHtml}
    ${fichesHtml(lead)}
    <p style="font-size:14px;line-height:1.6;">
      Un technicien vérifie vos cotes et vous confirme le <strong>devis détaillé sous 24h</strong>,
      gratuit et sans engagement. La fabrication sur mesure part ensuite sous 10 jours.
    </p>`);
  return send(lead.email, `Votre devis garde-corps en verre — ${site.name}`, html);
}

/** Devis détaillé validé dans le back office, PDF en pièce jointe. */
export async function sendQuoteEmail(input: {
  to: string;
  name: string;
  ref: string;
  totalTtc: number;
  nbOptions: number;
  pdf: Uint8Array;
  devisUrl?: string;
}): Promise<SendResult> {
  const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
  const html = wrap(`
    <p style="font-size:15px;">Bonjour ${esc(input.name)},</p>
    <p style="font-size:14px;line-height:1.6;">
      Votre devis <strong>${esc(input.ref)}</strong> est joint à cet e-mail au format PDF${
        input.nbOptions > 1 ? ` — il comprend ${input.nbOptions} propositions pour vous laisser le choix` : ""
      }.
    </p>
    <div style="background:#0c2017;border-radius:14px;padding:20px 24px;margin:18px 0;">
      <span style="color:#f6a723;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${input.nbOptions > 1 ? "À partir de" : "Montant du devis"}</span>
      <div style="color:#ffffff;font-size:30px;font-weight:bold;margin-top:6px;">${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(input.totalTtc)} € TTC</div>
      <span style="color:#cfe0d6;font-size:12px;">Fourniture seule · pose non comprise</span>
    </div>
    ${input.devisUrl ? `<p style="text-align:center;margin:18px 0;">${bouton(input.devisUrl, "Voir mon projet en ligne")}</p>` : ""}
    <p style="font-size:14px;line-height:1.6;">Pour valider ou ajuster ce devis, répondez simplement à cet e-mail.</p>`);
  return send(input.to, `Votre devis ${input.ref} — ${site.name}`, html, [
    { filename: `Devis-${input.ref}.pdf`, content: Buffer.from(input.pdf).toString("base64") },
  ]);
}

/* ------------------------ Séquence de relances ----------------------- */

function relanceVars(lead: Pick<Lead, "name" | "estimation_ttc">): RelanceVars {
  const nom = lead.name.trim();
  return {
    prenom: nom.split(/\s+/)[0] ?? nom,
    nom,
    montant: lead.estimation_ttc ? `${eur.format(Number(lead.estimation_ttc))} € TTC` : "votre devis",
    telephone: site.phone,
    societe: site.name,
  };
}

/** Objet + HTML complet d'une relance (sert à l'envoi, à l'aperçu et au test). */
export function buildRelanceEmail(mail: RelanceMail, lead: Pick<Lead, "name" | "estimation_ttc" | "token">): { sujet: string; html: string } {
  const r = renderRelance(mail, relanceVars(lead));
  const cta = lead.token && r.bouton ? `<p style="text-align:center;margin:18px 0;">${bouton(devisUrl(lead as Lead), r.bouton.replace(/[<>&"]/g, ""))}</p>` : "";
  return { sujet: r.sujet, html: wrap(`${r.corpsHtml}${cta}`) };
}

export async function sendRelanceEmail(lead: Lead, numero: number): Promise<SendResult> {
  const settings = await getRelanceSettings();
  const mail = settings.mails[Math.min(Math.max(numero, 1), NB_RELANCES) - 1];
  const { sujet, html } = buildRelanceEmail(mail, lead);
  return send(lead.email, sujet, html);
}

/** Envoi d'essai d'une relance à l'adresse de la personne connectée. */
export async function sendRelanceTest(to: string, mail: RelanceMail): Promise<SendResult> {
  const { sujet, html } = buildRelanceEmail(mail, { name: "Camille Dupont", estimation_ttc: "4850", token: "apercu" });
  return send(to, `[TEST] ${sujet}`, html);
}

/* ------------------------------ Newsletter ----------------------------- */

type NewsletterContenu = { sujet: string; corps: string; bouton: string; lien: string; format?: "html" | "texte" };
const escHtml = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/**
 * Objet + HTML d'une newsletter pour un destinataire, avec son lien de désinscription.
 * `imageBase` : origine des images hébergées (adresse du site dans un e-mail, vide pour l'aperçu).
 */
export function buildNewsletterEmail(
  contenu: NewsletterContenu,
  dest: { name: string; token: string | null },
  imageBase: string = site.url,
): { sujet: string; html: string } {
  const vars = relanceVars({ name: dest.name, estimation_ttc: null });
  const html = contenu.format === "html";
  const r = renderRelance({ sujet: contenu.sujet, corps: html ? "" : contenu.corps, bouton: contenu.bouton }, vars);
  const corps = html
    ? rendreCorps(contenu.corps, imageBase).replace(/\{(prenom|nom|telephone|societe)\}/g, (_, k: keyof RelanceVars) => escHtml(vars[k]))
    : r.corpsHtml;
  const cta = r.bouton && /^https:\/\//.test(contenu.lien) ? `<p style="text-align:center;margin:18px 0;">${bouton(contenu.lien.replace(/["<>]/g, ""), r.bouton.replace(/[<>&"]/g, ""))}</p>` : "";
  const stop = dest.token
    ? `<p style="font-size:11px;color:#9aa8a0;margin-top:10px;">Vous recevez cet e-mail car vous avez demandé un devis sur ${site.name}. <a href="${site.url}/desabonnement/${dest.token}" style="color:#5a6b61;">Se désinscrire</a>.</p>`
    : "";
  return { sujet: r.sujet, html: `${wrap(`${corps}${cta}`)}${stop}` };
}

/** Envoi groupé (jusqu'à 100 e-mails par appel) via l'API « batch » de Resend. */
export async function sendBatch(items: { to: string; subject: string; html: string }[]): Promise<SendResult> {
  if (!mailConfigured) return { sent: false, reason: "RESEND_API_KEY non configurée" };
  if (items.length === 0) return { sent: true };
  try {
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(items.map((m) => ({ from: FROM, to: [m.to], subject: m.subject, html: m.html, ...(REPLY_TO ? { reply_to: REPLY_TO } : {}) }))),
    });
    if (!res.ok) return { sent: false, reason: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "erreur réseau" };
  }
}

/** Envoi d'essai d'une newsletter à la personne connectée. */
export async function sendNewsletterTest(to: string, contenu: NewsletterContenu): Promise<SendResult> {
  const { sujet, html } = buildNewsletterEmail(contenu, { name: "Camille Dupont", token: null });
  return send(to, `[TEST] ${sujet}`, html);
}
