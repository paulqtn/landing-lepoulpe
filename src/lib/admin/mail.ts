import type { Lead } from "./db";
import { site } from "@/lib/site";

/* ================================================================== */
/*  Envoi d'emails (devis automatique + relances) via Resend.          */
/*  RESEND_API_KEY + EMAIL_FROM à définir dans Vercel — sans clef, on  */
/*  ne bloque rien : l'envoi est simplement signalé « non configuré ». */
/* ================================================================== */

export const mailConfigured = Boolean(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? `${site.name} <devis@example.com>`;
const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

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
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    if (!res.ok) return { sent: false, reason: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "erreur réseau" };
  }
}

/* ----------------------------- Gabarits ----------------------------- */

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
      Merci pour votre demande — voici le récapitulatif de votre estimation de garde-corps en verre,
      réalisée sur ${site.name}.
    </p>
    ${recap(lead)}
    ${prixHtml}
    <p style="font-size:14px;line-height:1.6;">
      Un technicien vérifie vos cotes et vous envoie le <strong>devis détaillé sous 24h</strong>,
      gratuit et sans engagement. La fabrication sur mesure part ensuite sous 10 jours.
    </p>`);
  return send(lead.email, `Votre estimation garde-corps en verre — ${site.name}`, html);
}

export async function sendRelanceEmail(lead: Lead, numero: number): Promise<SendResult> {
  const sujets = [
    `Votre projet de garde-corps en verre — on en est où ?`,
    `Dernier rappel : votre estimation garde-corps vous attend`,
  ];
  const corps =
    numero <= 1
      ? `<p style="font-size:15px;">Bonjour ${lead.name},</p>
         <p style="font-size:14px;line-height:1.6;">
           Vous avez estimé votre garde-corps en verre il y a quelques jours — votre tarif est toujours
           valable et vos cotes sont prêtes pour le devis détaillé. Souhaitez-vous qu'un technicien
           vous rappelle pour valider les mesures ?
         </p>`
      : `<p style="font-size:15px;">Bonjour ${lead.name},</p>
         <p style="font-size:14px;line-height:1.6;">
           Petit dernier message : votre estimation reste disponible, et notre planning de fabrication
           sous 10 jours est ouvert. Après quoi nous classerons votre demande — un simple « rappelez-moi »
           en réponse suffit pour la réactiver.
         </p>`;
  return send(lead.email, sujets[Math.min(numero - 1, 1)], wrap(corps + recap(lead)));
}
