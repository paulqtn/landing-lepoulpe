import type { Lead } from "./db";
import { fichesPourLead, videoPourLead } from "./assets";
import { site } from "@/lib/site";

/* ================================================================== */
/*  Emails (devis automatique + séquence de relances) via Resend.      */
/*  RESEND_API_KEY + EMAIL_FROM à définir dans Vercel — sans clef, on  */
/*  ne bloque rien : l'envoi est simplement signalé « non configuré ». */
/* ================================================================== */

export const mailConfigured = Boolean(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? `${site.name} <devis@example.com>`;
const REPLY_TO = process.env.EMAIL_REPLY_TO;
const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** Cadence de la séquence : jours à attendre APRÈS chaque envoi (devis, r1, r2). */
export const SEQ_DELAIS_JOURS = [2, 3, 5];
export const SEQ_MAX = 3;

type SendResult = { sent: boolean; reason?: string };

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!mailConfigured) return { sent: false, reason: "RESEND_API_KEY non configurée" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(REPLY_TO ? { reply_to: REPLY_TO } : {}) }),
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

/* ------------------------ Séquence de relances ----------------------- */

function relanceUsage(lead: Lead): string {
  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const lieu = String(a.lieu ?? a.usage ?? "");
  if (lieu === "piscine")
    return `Pour une piscine, le garde-corps n'est pas qu'esthétique : la loi impose une barrière de
      protection conforme. Votre configuration respecte la norme NF P90-306 côté hauteur — et votre
      tarif est toujours valable.`;
  if (lieu === "balcon" || lieu === "fenetre" || lieu === "mezzanine")
    return `Dès 1 m de hauteur de chute, le garde-corps conforme NF P01-012 est obligatoire. Votre
      configuration est dimensionnée pour — et votre tarif est toujours valable.`;
  return `Votre tarif est toujours valable et vos cotes sont prêtes pour le devis détaillé — il ne
      manque qu'une validation par notre technicien.`;
}

export async function sendRelanceEmail(lead: Lead, numero: number): Promise<SendResult> {
  const sujets = [
    "Votre devis garde-corps en verre vous attend",
    "Ils ont choisi le verre — votre projet aussi mérite la vue",
    "Dernier rappel : votre devis expire bientôt",
  ];
  const corps =
    numero <= 1
      ? `<p style="font-size:14px;line-height:1.6;">${relanceUsage(lead)}</p>
         <p style="text-align:center;margin:16px 0;">${bouton(devisUrl(lead), "Revoir mon devis en ligne")}</p>`
      : numero === 2
        ? `<p style="font-size:14px;line-height:1.6;">
             Chaque semaine, nous livrons des garde-corps en verre partout en France — piscines à
             débordement, balcons face à la mer, terrasses panoramiques. Le point commun : un tarif
             direct usine et une découpe au millimètre. Le vôtre est prêt :
           </p>
           <p style="text-align:center;margin:16px 0;">${bouton(devisUrl(lead), "Revoir mon devis en ligne")}</p>
           <p style="font-size:13px;line-height:1.6;color:#5a6b61;">
             Envie de voir nos réalisations ? <a href="${site.url}" style="color:#175a3b;font-weight:bold;">Elles défilent sur notre page d'accueil.</a>
           </p>`
        : `<p style="font-size:14px;line-height:1.6;">
             Dernier message de notre part : notre planning de fabrication sous 10 jours se remplit,
             et nous classerons votre demande cette semaine. Un simple « rappelez-moi » en réponse
             suffit pour la réactiver — ou validez directement en ligne :
           </p>
           <p style="text-align:center;margin:16px 0;">${bouton(devisUrl(lead), "Voir mon devis avant qu'il expire")}</p>`;

  const html = wrap(`<p style="font-size:15px;">Bonjour ${lead.name},</p>${corps}${numero <= 1 ? recap(lead) : ""}`);
  return send(lead.email, sujets[Math.min(numero - 1, sujets.length - 1)], html);
}
