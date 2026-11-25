import { getSetting } from "./settings";

/* ================================================================== */
/*  Séquence de relances : 3 e-mails envoyés automatiquement après un  */
/*  devis validé et envoyé. Textes et délais sont modifiables dans     */
/*  l'onglet Relances (table settings, clé « relances »).              */
/* ================================================================== */

export const NB_RELANCES = 3;

export type RelanceMail = { sujet: string; corps: string; bouton: string };
export type RelanceSettings = {
  /** Interrupteur général de l'envoi automatique. */
  active: boolean;
  /** Jours d'attente : [devis → relance 1, relance 1 → relance 2, relance 2 → relance 3]. */
  delais: [number, number, number];
  mails: [RelanceMail, RelanceMail, RelanceMail];
};

export const VARIABLES: { cle: string; description: string }[] = [
  { cle: "{prenom}", description: "prénom du client" },
  { cle: "{nom}", description: "nom complet du client" },
  { cle: "{montant}", description: "montant du devis, TTC" },
  { cle: "{telephone}", description: "votre numéro de téléphone" },
  { cle: "{societe}", description: "nom de la société" },
];

export const RELANCES_DEFAUT: RelanceSettings = {
  active: true,
  delais: [2, 3, 5],
  mails: [
    {
      sujet: "Votre devis garde-corps en verre vous attend",
      corps:
        "Bonjour {prenom},\n\nVotre devis de garde-corps en verre est toujours valable, pour un montant de {montant}.\n\nVos cotes sont enregistrées : il ne manque que votre accord pour lancer la fabrication sur mesure.\n\nUne question sur le verre, la fixation ou la livraison ? Répondez simplement à cet e-mail ou appelez-nous au {telephone}.",
      bouton: "Revoir mon devis",
    },
    {
      sujet: "{prenom}, une question sur votre devis ?",
      corps:
        "Bonjour {prenom},\n\nNous livrons chaque semaine des garde-corps en verre partout en France : piscines, balcons, terrasses, escaliers. Le point commun : un tarif direct usine et une découpe au millimètre.\n\nVotre projet est prêt de notre côté. Si un point vous fait hésiter (dimensions, pose, délai), dites-le-nous : nous ajustons le devis avec vous.",
      bouton: "Revoir mon devis",
    },
    {
      sujet: "Dernier rappel pour votre devis garde-corps",
      corps:
        "Bonjour {prenom},\n\nC'est notre dernier message au sujet de votre devis de {montant}.\n\nSans nouvelles de votre part, nous classerons votre demande cette semaine. Un simple « rappelez-moi » en réponse suffit pour la garder ouverte.\n\nMerci de l'intérêt porté à {societe}.",
      bouton: "Voir mon devis",
    },
  ],
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "");

/** Valide ce qui vient de l'écran ; renvoie le message d'erreur à afficher le cas échéant. */
export function sanitizeRelances(raw: unknown): { value?: RelanceSettings; error?: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const delais = Array.isArray(r.delais) ? r.delais.map(Number) : [];
  if (delais.length !== NB_RELANCES || delais.some((d) => !Number.isInteger(d) || d < 1 || d > 90))
    return { error: "Délais : un nombre de jours entier, de 1 à 90, pour chaque relance." };
  const mails = Array.isArray(r.mails) ? r.mails : [];
  if (mails.length !== NB_RELANCES) return { error: "Les trois relances doivent être renseignées." };
  const out: RelanceMail[] = [];
  for (let i = 0; i < NB_RELANCES; i++) {
    const m = (mails[i] ?? {}) as Record<string, unknown>;
    const mail = { sujet: str(m.sujet, 150).replace(/\n/g, " "), corps: str(m.corps, 4000), bouton: str(m.bouton, 40).replace(/\n/g, " ") };
    if (mail.sujet.length < 3) return { error: `Relance ${i + 1} : l'objet est obligatoire.` };
    if (mail.corps.length < 20) return { error: `Relance ${i + 1} : le texte est trop court.` };
    const inconnues = [...`${mail.sujet} ${mail.corps}`.matchAll(/\{[a-zA-Zéèê_]+\}/g)].map((x) => x[0]).filter((v) => !VARIABLES.some((k) => k.cle === v));
    if (inconnues.length) return { error: `Relance ${i + 1} : variable inconnue ${[...new Set(inconnues)].join(", ")}.` };
    out.push(mail);
  }
  return { value: { active: r.active !== false, delais: delais as [number, number, number], mails: out as [RelanceMail, RelanceMail, RelanceMail] } };
}

export async function getRelanceSettings(): Promise<RelanceSettings> {
  const stored = await getSetting<unknown>("relances");
  const value = stored ? sanitizeRelances(stored).value : undefined;
  return value ?? RELANCES_DEFAUT;
}

/** Délai (en jours) avant la relance n° `numero` (1 à 3). */
export const delaiAvant = (s: RelanceSettings, numero: number): number | null => (numero >= 1 && numero <= NB_RELANCES ? s.delais[numero - 1] : null);

export type RelanceVars = { prenom: string; nom: string; montant: string; telephone: string; societe: string };

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const fill = (text: string, vars: RelanceVars) => text.replace(/\{(prenom|nom|montant|telephone|societe)\}/g, (_, k: keyof RelanceVars) => vars[k]);

/** Objet et corps HTML (paragraphes) d'une relance, variables remplacées et contenu échappé. */
export function renderRelance(mail: RelanceMail, vars: RelanceVars): { sujet: string; corpsHtml: string; bouton: string } {
  const corpsHtml = fill(mail.corps, vars)
    .split(/\n{2,}/)
    .map((p) => `<p style="font-size:14px;line-height:1.6;margin:0 0 14px;">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return { sujet: fill(mail.sujet, vars).replace(/\s+/g, " ").trim(), corpsHtml, bouton: mail.bouton };
}
