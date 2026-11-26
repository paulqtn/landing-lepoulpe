import sanitizeHtml from "sanitize-html";

/* Contenu HTML d'un e-mail : tout ce qui peut exécuter du code, charger une ressource cachée
   ou envoyer un formulaire est retiré avant l'enregistrement. L'écran l'affiche en plus dans
   un cadre isolé, sans script. */

const BALISES = ["p", "br", "div", "span", "b", "strong", "i", "em", "u", "s", "small", "sub", "sup", "blockquote", "pre", "code", "hr", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "a", "img", "font", "center"];

const dataInterdite = (src: string | undefined) => /^data:(?!image\/(png|jpe?g|gif|webp);base64,)/i.test(src ?? "");

function options(surImage: (src: string) => boolean): sanitizeHtml.IOptions {
  return {
    allowedTags: BALISES,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      td: ["colspan", "rowspan", "align", "valign", "width"],
      th: ["colspan", "rowspan", "align", "valign", "width"],
      table: ["width", "cellpadding", "cellspacing", "border", "align"],
      font: ["color", "size"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "data"] },
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        color: [/^[#a-z0-9(), .%]+$/i], "background-color": [/^[#a-z0-9(), .%]+$/i], "text-align": [/^(left|right|center|justify)$/], "font-weight": [/^[a-z0-9]+$/i], "font-style": [/^[a-z]+$/i],
        "text-decoration": [/^[a-z -]+$/i], "font-size": [/^\d+(\.\d+)?(px|pt|em|rem|%)$/], padding: [/^[\d.a-z% ]+$/i], margin: [/^[\d.a-z% -]+$/i], border: [/^[\d.a-z#(), %]+$/i], width: [/^\d+(px|%)$/], "max-width": [/^\d+(px|%)$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" } }),
    },
    exclusiveFilter: (f) => f.tag === "img" && (dataInterdite(f.attribs.src) || surImage(f.attribs.src ?? "")),
  };
}

export function nettoyerHtml(html: string): string {
  const propre = sanitizeHtml(html.slice(0, 1_500_000), options(() => false));
  return propre.length > 400_000 ? propre.slice(0, 400_000) : propre;
}

/** Version sans images distantes : elles servent souvent à savoir si le message a été ouvert. Même liste blanche que le nettoyage. */
export function sansImagesDistantes(html: string): { html: string; masquees: number } {
  let masquees = 0;
  const out = sanitizeHtml(html, options((src) => {
    if (!/^https:/i.test(src)) return false;
    masquees++;
    return true;
  }));
  return { html: out, masquees };
}

export const texteDepuisHtml = (html: string) =>
  sanitizeHtml(html.replace(/<(br|\/p|\/div|\/tr|\/li|\/h\d)\s*\/?>/gi, "$&\n"), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
