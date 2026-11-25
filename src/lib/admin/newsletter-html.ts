import sanitizeHtml from "sanitize-html";

/* ================================================================== */
/*  Corps mis en forme d'une newsletter.                               */
/*  Le HTML vient de l'éditeur du back office : il est toujours        */
/*  nettoyé ici, côté serveur, avec une liste fermée de balises et de  */
/*  styles. Les images ne peuvent être que celles déposées dans        */
/*  l'éditeur (hébergées par le site) : aucune image externe.          */
/* ================================================================== */

export const CORPS_MAX = 60_000;
export const IMAGE_PATH = /^\/api\/nl-image\/[a-f0-9]{32}$/;
/** Largeur du gabarit d'e-mail, en pixels. */
const LARGEUR = 560;

const TAGS = ["p", "div", "br", "b", "strong", "i", "em", "u", "s", "span", "h2", "h3", "ul", "ol", "li", "a", "img"];
const COULEUR = [/^#[0-9a-f]{3,8}$/i, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/];

/** Nettoyage strict : ce qui est enregistré et envoyé ne contient que ce qui est listé ici. */
export function sanitizeCorps(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: TAGS,
    allowedAttributes: { a: ["href"], img: ["src", "alt", "style"], "*": ["style"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        color: COULEUR,
        "background-color": COULEUR,
        "text-align": [/^(left|center|right)$/],
        "font-size": [/^(1[0-9]|[2-3][0-9]|4[0-8])px$/],
        "font-weight": [/^(bold|normal|[1-9]00)$/],
        "font-style": [/^italic$/],
        "text-decoration": [/^(underline|line-through)$/],
        "text-decoration-line": [/^(underline|line-through)$/],
      },
      img: { width: [/^(100|[1-9]\d?)%$/] },
    },
    transformTags: {
      // Couleur posée par certains navigateurs avec <font color>.
      font: (_tag, a): sanitizeHtml.Tag => ({ tagName: "span", attribs: a.color ? { style: `color:${a.color}` } : {} }),
      // Une image de l'éditeur peut porter l'adresse complète du site : on ne garde que le chemin.
      img: (_tag, a) => ({ tagName: "img", attribs: { ...a, src: (a.src ?? "").replace(/^https?:\/\/[^/]+(?=\/api\/nl-image\/)/, "") } }),
    },
    exclusiveFilter: (f) => f.tag === "img" && !IMAGE_PATH.test(f.attribs.src ?? ""),
  }).trim();
}

/** Texte seul (pour les contrôles de longueur et de variables). */
export function texteBrut(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

const BASE: Record<string, string> = {
  p: "margin:0 0 14px;font-size:15px;line-height:1.6;",
  div: "margin:0 0 14px;font-size:15px;line-height:1.6;",
  h2: "margin:22px 0 10px;font-size:22px;line-height:1.3;font-weight:bold;",
  h3: "margin:18px 0 8px;font-size:18px;line-height:1.35;font-weight:bold;",
  ul: "margin:0 0 14px;padding-left:22px;",
  ol: "margin:0 0 14px;padding-left:22px;",
  li: "margin:0 0 4px;font-size:15px;line-height:1.6;",
  a: "color:#175a3b;text-decoration:underline;",
};

let memo: { cle: string; html: string } | null = null;

/**
 * HTML prêt pour un e-mail : styles en ligne (les messageries ignorent les feuilles de style),
 * images en adresse complète et à largeur fixe. Le corps est re-nettoyé avant d'être habillé.
 */
export function rendreCorps(corps: string, imageBase: string): string {
  const cle = `${imageBase}\n${corps}`;
  if (memo?.cle === cle) return memo.html;
  const habille = (tag: string) => (_t: string, a: Record<string, string>) => ({ tagName: tag, attribs: { ...a, style: `${BASE[tag]}${a.style ?? ""}` } });
  const html = sanitizeHtml(sanitizeCorps(corps), {
    allowedTags: TAGS,
    allowedAttributes: { a: ["href", "style"], img: ["src", "alt", "style", "width"], "*": ["style"] },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    transformTags: {
      ...Object.fromEntries(Object.keys(BASE).map((t) => [t, habille(t)])),
      img: (_t, a) => {
        const pct = Math.min(100, Math.max(10, Number(/width:\s*(\d+)%/.exec(a.style ?? "")?.[1] ?? 100)));
        return {
          tagName: "img",
          attribs: { src: `${imageBase}${a.src}`, alt: a.alt ?? "", width: String(Math.round((LARGEUR * pct) / 100)), style: `width:${pct}%;max-width:100%;height:auto;border:0;border-radius:8px;` },
        };
      },
    },
  });
  memo = { cle, html };
  return html;
}
