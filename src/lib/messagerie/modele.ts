/* ================================================================== */
/*  Messagerie intelligente — modèle commun (serveur et écran).        */
/*  Catégories, priorités, réglages et règles de tri. Aucune           */
/*  dépendance : ce fichier se teste seul et se charge dans l'écran.   */
/* ================================================================== */

export const CATEGORIES = [
  ["nouveau_prospect", "Nouveau prospect"],
  ["demande_devis", "Demande de devis"],
  ["demande_infos", "Demande d'informations"],
  ["opportunite", "Opportunité commerciale"],
  ["relance_client", "Relance client"],
  ["negociation", "Négociation commerciale"],
  ["rendez_vous", "Prise de rendez-vous"],
  ["validation_commande", "Validation de commande"],
  ["reclamation", "Réclamation client"],
  ["facturation", "Facturation et administratif"],
  ["fournisseur", "Fournisseur"],
  ["newsletter", "Newsletter et publicité"],
  ["spam", "Spam potentiel"],
  ["autre", "Autre"],
] as const;
export type Categorie = (typeof CATEGORIES)[number][0];
export const CATEGORIE_CLES = CATEGORIES.map(([k]) => k) as Categorie[];
export const CATEGORIE_LABELS = Object.fromEntries(CATEGORIES) as Record<Categorie, string>;

export const PRIORITES = [["urgent", "Urgent"], ["eleve", "Élevé"], ["normal", "Normal"], ["faible", "Faible"]] as const;
export type Priorite = (typeof PRIORITES)[number][0];
export const PRIORITE_CLES = PRIORITES.map(([k]) => k) as Priorite[];
export const PRIORITE_LABELS = Object.fromEntries(PRIORITES) as Record<Priorite, string>;

/** Catégories pour lesquelles une réponse est préparée d'office, tant que le commercial n'a rien changé. */
export const CATEGORIES_REPONSE_DEFAUT: Categorie[] = ["nouveau_prospect", "demande_devis", "demande_infos", "opportunite", "relance_client", "negociation", "rendez_vous", "validation_commande", "reclamation"];
/** Catégories jamais suivies d'un brouillon automatique, quel que soit le réglage. */
export const CATEGORIES_SANS_REPONSE: Categorie[] = ["newsletter", "spam"];

export const TONS = [["professionnel", "Professionnel"], ["chaleureux", "Chaleureux"], ["commercial", "Commercial"], ["direct", "Direct et concis"]] as const;
export type Ton = (typeof TONS)[number][0];
export const FREQUENCES = [2, 5, 15, 30] as const;

export type ReglePriorite = { type: "expediteur" | "domaine" | "mot"; valeur: string; priorite: Priorite };

export type Reglages = {
  triAuto: boolean;
  brouillonsAuto: boolean;
  ton: Ton;
  signature: string;
  instructions: string;
  categoriesAuto: Categorie[];
  exclusions: string[];
  frequenceMin: number;
  /** Sirène de dix secondes à chaque e-mail reçu. */
  notifMail: boolean;
  notifUrgent: boolean;
  notifBrouillon: boolean;
  regles: ReglePriorite[];
};

export const REGLAGES_DEFAUT: Reglages = {
  triAuto: true,
  brouillonsAuto: true,
  ton: "professionnel",
  signature: "",
  instructions: "",
  categoriesAuto: CATEGORIES_REPONSE_DEFAUT,
  exclusions: [],
  frequenceMin: 5,
  notifMail: true,
  notifUrgent: true,
  notifBrouillon: true,
  regles: [],
};

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\u0000/g, "").slice(0, max) : "");

/** Réglages reçus de l'écran ou lus en base : tout est borné et ramené à des valeurs connues. */
export function sanitizeReglages(raw: unknown, base: Reglages = REGLAGES_DEFAUT): Reglages {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const bool = (k: keyof Reglages) => (typeof r[k] === "boolean" ? (r[k] as boolean) : (base[k] as boolean));
  const ton = TONS.find(([k]) => k === r.ton)?.[0] ?? base.ton;
  const freq = FREQUENCES.find((f) => f === Number(r.frequenceMin)) ?? base.frequenceMin;
  const cats = Array.isArray(r.categoriesAuto) ? CATEGORIE_CLES.filter((c) => (r.categoriesAuto as unknown[]).includes(c) && !CATEGORIES_SANS_REPONSE.includes(c)) : base.categoriesAuto;
  const exclusions = Array.isArray(r.exclusions)
    ? [...new Set((r.exclusions as unknown[]).map((x) => texte(x, 120).trim().toLowerCase().replace(/^@/, "")).filter((x) => /^[a-z0-9._%+-]+(@[a-z0-9.-]+)?$|^[a-z0-9.-]+\.[a-z]{2,}$/.test(x)))].slice(0, 100)
    : base.exclusions;
  const regles = Array.isArray(r.regles)
    ? (r.regles as unknown[])
        .map((x) => (x && typeof x === "object" ? (x as Record<string, unknown>) : {}))
        .map((x) => ({ type: (["expediteur", "domaine", "mot"] as const).find((t) => t === x.type), valeur: texte(x.valeur, 120).trim().toLowerCase(), priorite: PRIORITE_CLES.find((p) => p === x.priorite) }))
        .filter((x): x is ReglePriorite => Boolean(x.type && x.valeur && x.priorite))
        .slice(0, 50)
    : base.regles;
  return {
    triAuto: bool("triAuto"),
    brouillonsAuto: bool("brouillonsAuto"),
    ton,
    signature: typeof r.signature === "string" ? texte(r.signature, 1500) : base.signature,
    instructions: typeof r.instructions === "string" ? texte(r.instructions, 3000) : base.instructions,
    categoriesAuto: cats,
    exclusions,
    frequenceMin: freq,
    notifMail: bool("notifMail"),
    notifUrgent: bool("notifUrgent"),
    notifBrouillon: bool("notifBrouillon"),
    regles,
  };
}

/** Réglages communs à toute l'entreprise, tenus par l'administrateur. */
export type ReglagesGlobaux = {
  /** Le module est ouvert aux commerciaux. */
  actif: boolean;
  /** L'analyse et la rédaction par l'IA sont autorisées. */
  ia: boolean;
  /** Ce que l'IA a le droit de savoir sur l'entreprise, ses produits et ses règles commerciales. */
  connaissances: string;
  /** Durée de conservation du contenu des e-mails dans le back office, en jours. */
  conservationJours: number;
  /** Profondeur de la première synchronisation, en jours. */
  joursInitial: number;
};
export const GLOBAUX_DEFAUT: ReglagesGlobaux = { actif: true, ia: true, connaissances: "", conservationJours: 90, joursInitial: 14 };
export function sanitizeGlobaux(raw: unknown, base: ReglagesGlobaux = GLOBAUX_DEFAUT): ReglagesGlobaux {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const borne = (v: unknown, min: number, max: number, d: number) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Math.min(max, Math.max(min, Math.round(Number(v)))) : d);
  return {
    actif: typeof r.actif === "boolean" ? r.actif : base.actif,
    ia: typeof r.ia === "boolean" ? r.ia : base.ia,
    connaissances: typeof r.connaissances === "string" ? texte(r.connaissances, 12_000) : base.connaissances,
    conservationJours: borne(r.conservationJours, 7, 730, base.conservationJours),
    joursInitial: borne(r.joursInitial, 1, 60, base.joursInitial),
  };
}

/* ------------------------- Règles déterministes ------------------------- */

export const adresse = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();
export const domaineDe = (email: string) => adresse(email).split("@")[1] ?? "";

/** L'expéditeur est-il dans la liste d'exclusion (adresse exacte, domaine ou sous-domaine) ? */
export function estExclu(email: string, exclusions: string[]): boolean {
  const a = adresse(email);
  const d = domaineDe(a);
  return exclusions.some((x) => (x.includes("@") ? x === a : d === x || d.endsWith(`.${x}`)));
}

/** Règle de priorité du commercial : la première qui correspond l'emporte sur l'avis de l'IA. */
export function prioriteParRegle(m: { from: string; sujet: string; corps: string }, regles: ReglePriorite[]): Priorite | null {
  const a = adresse(m.from);
  const d = domaineDe(a);
  const contenu = `${m.sujet}\n${m.corps}`.toLowerCase();
  for (const r of regles) {
    if (r.type === "expediteur" && a === r.valeur) return r.priorite;
    if (r.type === "domaine" && (d === r.valeur || d.endsWith(`.${r.valeur}`))) return r.priorite;
    if (r.type === "mot" && contenu.includes(r.valeur)) return r.priorite;
  }
  return null;
}

/** Identifiant de message sans chevrons ni espaces. */
export const idMessage = (v: string | null | undefined) => (v ?? "").trim().replace(/^<|>$/g, "");

/** Clé de conversation : le premier message du fil (References), sinon celui auquel on répond, sinon soi-même. */
export function cleFil(m: { messageId: string; inReplyTo?: string | null; references?: string[] | string | null }): string {
  const refs = (Array.isArray(m.references) ? m.references : (m.references ?? "").split(/\s+/)).map(idMessage).filter(Boolean);
  return refs[0] || idMessage(m.inReplyTo) || idMessage(m.messageId);
}

const DEBUT_CITATION = [
  /^\s*(le|on)\b.{5,200}\b(a écrit|wrote|schrieb|escribió|ha scritto)\s*:?\s*$/i,
  /^\s*-{2,}\s*(original message|message d'origine|message original|forwarded message|message transféré)\s*-{2,}/i,
  /^\s*(de|from)\s*:\s.+$/i,
  /^_{10,}\s*$/,
];

/** Texte écrit par l'expéditeur, sans l'historique recopié sous sa réponse. */
export function sansCitation(corps: string): string {
  const lignes = corps.replace(/\r\n/g, "\n").split("\n");
  const garde: string[] = [];
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    if (DEBUT_CITATION[0].test(l) || DEBUT_CITATION[1].test(l) || DEBUT_CITATION[3].test(l)) break;
    // « De : … » n'ouvre une citation que s'il est suivi d'un autre en-tête recopié.
    if (DEBUT_CITATION[2].test(l) && /^\s*(envoyé|sent|date|à|to|objet|subject)\s*:/i.test(lignes[i + 1] ?? "")) break;
    if (/^\s*>/.test(l)) continue;
    garde.push(l);
  }
  return garde.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function extrait(corps: string, max = 180): string {
  const t = sansCitation(corps).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Contenu d'e-mail préparé pour l'IA : c'est une donnée, jamais une consigne. On retire ce qui
 * pourrait imiter nos balises ou un changement de rôle, et les caractères invisibles qui servent
 * à cacher du texte. Le texte reste lisible ; il est ensuite placé entre balises par l'appelant.
 */
export function neutraliser(texteBrut: string, max = 6000): string {
  const t = texteBrut
    .replace(/[​-‏‪-‮⁠-⁤﻿­]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<\/?\s*(courriel|conversation|fiche_client|consignes|system|assistant|user|human|instructions?)\b[^>]*>/gi, "[balise retirée]")
    .replace(/\n{4,}/g, "\n\n\n");
  return t.length > max ? `${t.slice(0, max)}\n[… message tronqué]` : t;
}

const EXT_DANGER = /\.(exe|msi|bat|cmd|com|scr|pif|js|jse|vbs|vbe|wsf|wsh|ps1|psm1|jar|hta|lnk|reg|dll|cpl|iso|img|vhd|docm|xlsm|pptm|dotm|xlam|html?|svg|chm|app|dmg|pkg|sh)$/i;
/** Pièce jointe qui peut exécuter du code à l'ouverture : jamais téléchargeable depuis le back office. */
export const pieceDangereuse = (nom: string) => EXT_DANGER.test(nom.trim()) || /\.[a-z0-9]{2,4}\.(exe|scr|js|vbs|bat|cmd)$/i.test(nom);

/** Objet d'une réponse : « Re: » ajouté une seule fois. */
export const objetReponse = (sujet: string) => (/^\s*(re|réf|aw|sv)\s*:/i.test(sujet) ? sujet.trim() : `Re: ${sujet.trim() || "(sans objet)"}`);
