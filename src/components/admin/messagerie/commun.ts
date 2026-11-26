import type { Reglages, ReglagesGlobaux } from "@/lib/messagerie/modele";

/* Types et aides partagés par les écrans de la messagerie. */

export type FournisseurVue = { cle: string; nom: string; imap: { host: string; port: number; secure: boolean }; smtp: { host: string; port: number; secure: boolean }; oauth: "google" | "microsoft" | null; oauthObligatoire: boolean; oauthPret: boolean; aide: string };
export type CompteVue = {
  id: number; email: string; nom: string; fournisseur: string; auth: string;
  imap: { host: string; port: number; secure: boolean; user: string }; smtp: { host: string; port: number; secure: boolean };
  dossiers: { inbox: string; drafts: string | null; sent: string | null; archive: string | null };
  statut: "ok" | "erreur"; erreur: string | null; lastSyncAt: string | null; reglages: Reglages;
};
export type Etat = { pret: { chiffrement: boolean; ia: boolean; iaCle: boolean; iaAutorisee: boolean }; compte: CompteVue | null; fournisseurs: FournisseurVue[] };
export type Ligne = {
  id: number; dossier: "inbox" | "sent"; from_nom: string; from_email: string; dest: { to?: string[] }; sujet: string; date: string; lu: boolean;
  categorie: string | null; priorite: string | null; besoin_reponse: boolean | null; statut: string; lead_id: number | null; nb_pieces: number; a_brouillon: boolean; repondu_at: string | null;
};
export type Compteurs = Record<string, number> & { categories: Record<string, number> };
export type BrouillonVue = { id: number; dest: string; cc: string; sujet: string; corps: string; origine: string; manquants: string[]; dansLaBoite: boolean };
export type Conversation = {
  message: {
    id: number; dossier: "inbox" | "sent"; de: { nom: string; email: string }; a: string[]; cc: string[]; sujet: string; date: string; texte: string; html: string | null; imagesMasquees: number;
    pieces: { n: number; nom: string; type: string; taille: number; dangereuse: boolean }[]; archive: boolean; statut: string; categorie: string | null; priorite: string | null; besoinReponse: boolean | null;
    langue: string | null; iaLe: string | null; iaManuel: boolean; iaErreur: string | null; reponduLe: string | null; enCours: string | null;
  };
  fil: { id: number; envoye: boolean; de: string; date: string; texte: string }[];
  brouillon: BrouillonVue | null;
  fiche: { id: number; nom: string; etape: string; estimation: string | null; telephone: string; suiviPar: string | null } | null;
};
export type GlobauxVue = { globaux: ReglagesGlobaux; boites: { nom: string; email: string; statut: string; erreur: string | null; last_sync_at: string | null; utilisateur: string }[]; serveur: { chiffrement: boolean; ia: boolean; google: boolean; microsoft: boolean } };

export type Reponse<T> = ({ ok: true } & T) | { ok: false; error: string };

/** Appel au serveur : rend toujours un objet, avec un message lisible en cas d'échec. */
export async function appel<T>(chemin: string, init?: { method?: string; body?: unknown }): Promise<Reponse<T>> {
  try {
    const res = await fetch(`/api/admin/messagerie${chemin}`, {
      method: init?.method ?? (init?.body !== undefined ? "POST" : "GET"),
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const d = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || d.ok === false) return { ok: false, error: typeof d.error === "string" ? d.error : res.status === 401 ? "Votre session a expiré : reconnectez-vous." : "Le serveur n'a pas répondu correctement. Réessayez." };
    return { ...(d as T), ok: true };
  } catch {
    return { ok: false, error: "Connexion au serveur impossible. Vérifiez votre réseau, puis réessayez." };
  }
}

const heure = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const jour = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short" });
const complet = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short" });
const cle = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" });

/** Heure pour aujourd'hui, « hier », sinon le jour. */
export function quand(iso: string): string {
  const d = new Date(iso);
  const a = cle.format(d);
  if (a === cle.format(new Date())) return heure.format(d);
  if (a === cle.format(new Date(Date.now() - 86_400_000))) return "hier";
  return jour.format(d);
}
export const dateComplete = (iso: string) => complet.format(new Date(iso));

export function ilYA(iso: string | null): string {
  if (!iso) return "jamais";
  const min = Math.max(0, Math.round((Date.now() - Number(new Date(iso))) / 60_000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (min < 1440) return `il y a ${Math.round(min / 60)} h`;
  return `il y a ${Math.round(min / 1440)} j`;
}

export const poids = (o: number) => (o > 1_048_576 ? `${(o / 1_048_576).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(o / 1024))} Ko`);

export const PRIORITE_STYLE: Record<string, string> = {
  urgent: "bg-red-50 text-red-700 ring-red-200",
  eleve: "bg-amber-500/15 text-amber-800 ring-amber-500/30",
  normal: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  faible: "bg-neutral-50 text-neutral-500 ring-neutral-200",
};

export const champ = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
export const bouton = "inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40";
export const boutonPrincipal = "inline-flex items-center justify-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40";
export const etiquette = "mb-1 block text-xs font-semibold text-neutral-600";
