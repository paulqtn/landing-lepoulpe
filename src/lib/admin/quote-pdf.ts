import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { optionTotals, type Quote } from "./quotes";
import { QUOTE_IMAGES } from "./quote-images";
import type { Societe } from "./societe";

/* PDF du devis — document client : aucun prix d'achat, aucune marge. */

const A4: [number, number] = [595.28, 841.89];
const M = 44;
const PINE = rgb(0.09, 0.353, 0.231);
const INK = rgb(0.05, 0.12, 0.09);
const GREY = rgb(0.42, 0.45, 0.43);
const LIGHT = rgb(0.9, 0.92, 0.91);

/** Les polices standard n'encodent que le Latin-1 étendu : on remplace le reste. */
function clean(text: string): string {
  return text
    .replace(/[   ]/g, " ")
    .replace(/→/g, "->")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\n\x20-\x7e¡-ÿ€œŒ–—…]/g, "");
}
const money = (n: number) => clean(new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)) + " €";
const num = (n: number) => clean(new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n));

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of clean(text).split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width || !line) line = test;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

export async function renderQuotePdf(quote: Quote, societe: Societe): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Devis ${quote.ref}`);
  pdf.setAuthor(clean(societe.raisonSociale));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = A4[0] - 2 * M;
  // Visuels des systèmes de fixation, chargés une seule fois par document.
  const images = new Map<string, Awaited<ReturnType<typeof pdf.embedJpg>>>();
  for (const key of new Set(quote.options.flatMap((o) => o.lines.map((l) => l.image)).filter(Boolean) as (keyof typeof QUOTE_IMAGES)[])) {
    if (QUOTE_IMAGES[key]) images.set(key, await pdf.embedJpg(Buffer.from(QUOTE_IMAGES[key], "base64")));
  }
  let page: PDFPage = pdf.addPage(A4);
  let y = A4[1] - M;

  const draft = quote.statut === "brouillon";
  const text = (t: string, x: number, yy: number, size = 9.5, f: PDFFont = font, color = INK) => page.drawText(clean(t), { x, y: yy, size, font: f, color });
  const right = (t: string, xRight: number, yy: number, size = 9.5, f: PDFFont = font, color = INK) =>
    text(t, xRight - f.widthOfTextAtSize(clean(t), size), yy, size, f, color);
  const watermark = () => {
    if (draft) page.drawText("BROUILLON", { x: 110, y: 330, size: 86, font: bold, color: rgb(0.93, 0.93, 0.93), rotate: degrees(35) });
  };
  const newPage = () => {
    page = pdf.addPage(A4);
    y = A4[1] - M;
    watermark();
  };
  const need = (h: number) => {
    if (y - h < M + 40) newPage();
  };
  watermark();

  /* ---- en-tête ---- */
  text(societe.raisonSociale, M, y - 6, 17, bold, PINE);
  right("DEVIS", A4[0] - M, y - 6, 17, bold, INK);
  y -= 24;
  right(`N° ${quote.ref}`, A4[0] - M, y, 10, bold);
  const date = new Date(quote.sent_at ?? quote.created_at);
  right(`Date : ${date.toLocaleDateString("fr-FR")}`, A4[0] - M, y - 13, 9, font, GREY);
  const validite = Number.parseInt(societe.validiteJours, 10);
  if (Number.isFinite(validite) && validite > 0) right(`Valable ${validite} jours`, A4[0] - M, y - 25, 9, font, GREY);
  let ys = y;
  for (const l of [...wrap(societe.adresse, font, 9, 230), societe.telephone, societe.email, societe.siret && `SIRET : ${societe.siret}`, societe.tvaIntra && `TVA : ${societe.tvaIntra}`].filter(Boolean) as string[]) {
    text(l, M, ys, 9, font, GREY);
    ys -= 12;
  }
  y = Math.min(ys, y - 40) - 14;

  /* ---- client ---- */
  const c = quote.client;
  const clientLines = [c.name, ...wrap(c.address, font, 9.5, 230), c.email, c.phone].filter(Boolean);
  const boxH = 22 + clientLines.length * 13;
  page.drawRectangle({ x: A4[0] - M - 250, y: y - boxH, width: 250, height: boxH, color: rgb(0.957, 0.965, 0.961) });
  text("CLIENT", A4[0] - M - 238, y - 14, 7.5, bold, GREY);
  clientLines.forEach((l, i) => text(l, A4[0] - M - 238, y - 28 - i * 13, 9.5, i === 0 ? bold : font));
  y -= boxH + 22;

  /* ---- propositions ---- */
  // Bords droits des colonnes chiffrées.
  const cols = { desc: M + 6, qty: M + W - 204, pu: M + W - 126, tva: M + W - 82, total: M + W - 6 };
  quote.options.forEach((o, idx) => {
    need(110);
    if (quote.options.length > 1 || o.label) {
      text((o.label || `Proposition ${idx + 1}`).toUpperCase(), M, y, 8, bold, PINE);
      y -= 14;
    }
    text(o.title, M, y, 12.5, bold);
    y -= 16;
    page.drawRectangle({ x: M, y: y - 16, width: W, height: 18, color: PINE });
    const white = rgb(1, 1, 1);
    text("Désignation", cols.desc, y - 11, 8, bold, white);
    right("Qté", cols.qty, y - 11, 8, bold, white);
    right("Prix unit. HT", cols.pu, y - 11, 8, bold, white);
    right("TVA", cols.tva, y - 11, 8, bold, white);
    right("Total HT", cols.total, y - 11, 8, bold, white);
    y -= 26;

    for (const l of o.lines) {
      const img = l.image ? images.get(l.image) : undefined;
      const [titre, ...details] = clean(l.description).split("\n");
      const descW = cols.qty - cols.desc - 30;
      const titres = wrap(titre, bold, 9.5, descW);
      // Avec visuel : l'image à gauche, le détail à sa droite (comme une fiche produit).
      const IMG_W = 114;
      const IMG_H = 76;
      const detailX = cols.desc + (img ? IMG_W + 12 : 6);
      const detailLines = details.flatMap((d) => wrap(d, font, 9, descW - (img ? IMG_W + 12 : 6)).map((t, i) => (img ? t : i === 0 ? `- ${t}` : `  ${t}`)));
      const detailH = Math.max(img ? IMG_H + 6 : 0, detailLines.length * 12.5);
      const h = titres.length * 12.5 + (detailLines.length || img ? 4 + detailH : 0) + 8;
      need(h);
      titres.forEach((t, i) => text(t, cols.desc, y - i * 12.5, 9.5, bold));
      right(`${num(l.qty)}${l.unit ? ` ${l.unit}` : ""}`, cols.qty, y);
      right(money(l.unitPriceHt), cols.pu, y);
      right(`${num(l.vatRate * 100)} %`, cols.tva, y);
      right(money(Math.round(l.qty * l.unitPriceHt * 100) / 100), cols.total, y, 9.5, bold);
      const top = y - titres.length * 12.5 - 4;
      if (img) page.drawImage(img, { x: cols.desc, y: top - IMG_H + 9, width: IMG_W, height: IMG_H });
      detailLines.forEach((t, i) => text(t, detailX, top - i * 12.5, 9, font, GREY));
      y -= h;
      page.drawLine({ start: { x: M, y: y + 4 }, end: { x: M + W, y: y + 4 }, thickness: 0.6, color: LIGHT });
      y -= 4;
    }

    const t = optionTotals(o);
    need(30 + t.tva.length * 14 + 30);
    y -= 6;
    const lx = M + W - 210;
    text("Total HT", lx, y);
    right(money(t.ht), cols.total, y, 9.5, bold);
    y -= 14;
    for (const v of t.tva) {
      text(`TVA ${num(v.rate * 100)} %`, lx, y, 9.5, font, GREY);
      right(money(v.amount), cols.total, y, 9.5, font, GREY);
      y -= 14;
    }
    y -= 4;
    page.drawRectangle({ x: lx - 8, y: y - 9, width: 218, height: 22, color: INK });
    text("Total TTC", lx, y - 3, 10.5, bold, rgb(1, 1, 1));
    right(money(t.ttc), cols.total, y - 3, 11, bold, rgb(0.965, 0.655, 0.137));
    y -= 40;
  });

  /* ---- mentions ---- */
  const mentions = ["Fourniture seule — la pose n'est pas comprise dans ce devis.", ...(societe.conditions ? wrap(societe.conditions, font, 8.5, W) : [])];
  need(20 + mentions.length * 11);
  text("CONDITIONS", M, y, 7.5, bold, GREY);
  y -= 13;
  for (const m of mentions) {
    need(12);
    text(m, M, y, 8.5, font, GREY);
    y -= 11;
  }
  if (!draft) {
    need(70);
    y -= 14;
    text("Bon pour accord — date et signature du client :", M, y, 9, bold);
    page.drawRectangle({ x: M, y: y - 52, width: 240, height: 44, borderColor: LIGHT, borderWidth: 1 });
  }

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const foot = clean(`${societe.raisonSociale} — Devis ${quote.ref} — page ${i + 1}/${pages.length}`);
    p.drawText(foot, { x: M, y: 24, size: 7.5, font, color: GREY });
  });
  return pdf.save();
}
