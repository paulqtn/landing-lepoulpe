"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Archive, BarChart3, Clock, FileText, Flame, Inbox, Loader2, Mail, MailOpen, MessageSquareReply, Paperclip, PenLine, RefreshCw, Search, Send, Settings, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { CATEGORIES, CATEGORIE_LABELS, PRIORITES, PRIORITE_LABELS, type Categorie, type Priorite } from "@/lib/messagerie/modele";
import { toast } from "../Toasts";
import { Connexion } from "./Connexion";
import { Conversation } from "./Conversation";
import { Nouveau } from "./Nouveau";
import { Globaux, Reglages } from "./Reglages";
import { appel, bouton, boutonPrincipal, champ, ilYA, PRIORITE_STYLE, quand, type CompteVue, type Compteurs, type Etat, type Ligne } from "./commun";

/* Messagerie intelligente : trois colonnes (dossiers, liste, conversation), un tableau de bord
   et les paramètres. Sur téléphone, une colonne à la fois. */

const VUES: { cle: string; label: string; icon: typeof Inbox }[] = [
  { cle: "reception", label: "Boîte de réception", icon: Inbox },
  { cle: "non_lus", label: "Non lus", icon: Mail },
  { cle: "prioritaires", label: "Prioritaires", icon: Flame },
  { cle: "a_repondre", label: "À répondre", icon: MessageSquareReply },
  { cle: "brouillons", label: "Brouillons préparés", icon: Sparkles },
  { cle: "en_attente", label: "En attente", icon: Clock },
  { cle: "envoyes", label: "Envoyés", icon: Send },
  { cle: "archives", label: "Archives", icon: Archive },
];
type Onglet = "messages" | "tableau" | "parametres";
type Filtres = { q: string; expediteur: string; categorie: string; priorite: string; statut: string; du: string; au: string };
const SANS_FILTRE: Filtres = { q: "", expediteur: "", categorie: "", priorite: "", statut: "", du: "", au: "" };

export function Messagerie({ initial, admin, ouvrir, ecrireA, message }: { initial: Etat; admin: boolean; ouvrir?: number; ecrireA?: string; message?: { ok: boolean; texte: string } }) {
  const [etat, setEtat] = useState<Etat>(initial);
  const [onglet, setOnglet] = useState<Onglet>("messages");
  const [vue, setVue] = useState("reception");
  const [filtres, setFiltres] = useState<Filtres>(SANS_FILTRE);
  const [recherche, setRecherche] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [page, setPage] = useState(1);
  const [liste, setListe] = useState<{ messages: Ligne[]; total: number; parPage: number } | null>(null);
  const [compteurs, setCompteurs] = useState<Compteurs | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [selection, setSelection] = useState<number | "nouveau" | null>(ouvrir ?? (ecrireA ? "nouveau" : null));
  const [synchro, setSynchro] = useState(false);
  const [enCours, setEnCours] = useState(0);
  const compte = etat.compte;
  const requete = useRef(0);

  useEffect(() => { if (message) toast(message.texte, !message.ok); }, [message]);

  // La vue demandée est lue au moment de l'appel : un rechargement lancé en tâche de fond (après
  // une synchronisation) ne peut pas ramener l'écran sur une vue que le commercial vient de quitter.
  const demande = useRef({ vue, page, filtres });
  demande.current = { vue, page, filtres };
  const aBoite = Boolean(compte);
  const charger = useCallback(async () => {
    if (!aBoite) return;
    const n = ++requete.current;
    const { vue, page, filtres } = demande.current;
    const p = new URLSearchParams({ vue, page: String(page) });
    for (const [k, v] of Object.entries(filtres)) if (v) p.set(k, v);
    const r = await appel<{ messages: Ligne[]; total: number; parPage: number; compteurs: Compteurs }>(`/messages?${p}`);
    if (n !== requete.current) return; // une réponse plus ancienne ne remplace pas une plus récente
    if (!r.ok) return setErreur(r.error);
    setErreur(null);
    setListe({ messages: r.messages, total: r.total, parPage: r.parPage });
    setCompteurs(r.compteurs);
  }, [aBoite]);

  useEffect(() => { void charger(); }, [charger, vue, page, filtres]);

  /* Passage de traitement : synchronise si c'est dû et fait avancer la file. Tourne tant que l'écran est visible. */
  const passage = useCallback(async (forcer: boolean) => {
    if (!compte) return;
    if (forcer) setSynchro(true);
    const r = await appel<{ bilan: { faites: number; echecs: number; restantes: number }; compte: CompteVue }>("/tick", { body: { forcer } });
    if (forcer) setSynchro(false);
    if (!r.ok) { if (forcer) toast(r.error, true); return; }
    setEtat((e) => ({ ...e, compte: r.compte }));
    setEnCours(r.bilan.restantes);
    if (forcer) toast(r.compte.statut === "ok" ? (r.bilan.restantes > 0 ? "Boîte synchronisée. L'analyse des nouveaux messages continue." : "Boîte synchronisée.") : r.compte.erreur ?? "Synchronisation impossible.", r.compte.statut !== "ok");
    if (r.bilan.faites > 0 || forcer) void charger();
  }, [compte, charger]);

  const passageRef = useRef(passage);
  passageRef.current = passage;
  useEffect(() => {
    if (!compte) return;
    void passageRef.current(false);
    const t = setInterval(() => { if (document.visibilityState === "visible") void passageRef.current(false); }, 45_000);
    return () => clearInterval(t);
  }, [compte?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Tant qu'il reste des tâches, on enchaîne sans attendre le prochain passage.
  useEffect(() => {
    if (enCours === 0) return;
    const t = setTimeout(() => void passageRef.current(false), 4000);
    return () => clearTimeout(t);
  }, [enCours, liste]);

  if (!compte)
    return (
      <div className="space-y-5">
        <Entete />
        <Connexion etat={etat} onConnecte={(c, av) => { setEtat((e) => ({ ...e, compte: c })); toast(av ?? "Boîte mail connectée. La première synchronisation démarre.", Boolean(av)); }} />
        {admin && <div className="mx-auto max-w-2xl"><Globaux /></div>}
      </div>
    );

  const choisirVue = (v: string) => { setVue(v); setPage(1); setSelection(null); setOnglet("messages"); };
  const nbFiltres = Object.entries(filtres).filter(([k, v]) => v && k !== "q").length;
  const pages = liste ? Math.max(1, Math.ceil(liste.total / liste.parPage)) : 1;
  const iaPrete = etat.pret.ia;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Entete />
        <p className="flex min-w-0 items-center gap-2 text-sm text-neutral-700" role="status">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${compte.statut === "ok" ? "bg-green-600" : "bg-red-600"}`} />
          <span className="truncate"><strong className="font-bold text-inkgreen">{compte.email}</strong> · {compte.statut === "ok" ? `synchronisée ${ilYA(compte.lastSyncAt)}` : "connexion en erreur"}{enCours > 0 ? ` · ${enCours} tâche${enCours > 1 ? "s" : ""} en cours` : ""}</span>
        </p>
        <button type="button" className={`${boutonPrincipal} ml-auto`} onClick={() => { setOnglet("messages"); setSelection("nouveau"); }}>
          <PenLine className="h-4 w-4" /> Nouveau message
        </button>
        <button type="button" className={bouton} disabled={synchro} onClick={() => passage(true)}>
          {synchro ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Synchroniser
        </button>
      </div>

      {compte.statut === "erreur" && (
        <p className="flex flex-wrap items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span className="min-w-0 flex-1">{compte.erreur ?? "La boîte mail ne répond pas."}</span>
          <button type="button" className="font-bold underline" onClick={() => setOnglet("parametres")}>Vérifier la connexion</button>
        </p>
      )}
      {!iaPrete && (
        <p className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          {etat.pret.iaAutorisee ? "Le service d'IA n'est pas encore configuré sur le serveur : vos e-mails se synchronisent, mais ne sont ni triés ni suivis d'un brouillon." : "L'IA est désactivée par l'administrateur : vos e-mails se synchronisent, sans tri ni brouillon automatique."}
        </p>
      )}

      <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Messagerie">
        {([["messages", "Messages", Inbox], ["tableau", "Tableau de bord", BarChart3], ["parametres", "Paramètres", Settings]] as const).map(([k, l, I]) => (
          <button key={k} type="button" role="tab" aria-selected={onglet === k} onClick={() => setOnglet(k)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${onglet === k ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-700 hover:border-pine-300"}`}>
            <I className="h-4 w-4" /> {l}
          </button>
        ))}
      </div>

      {onglet === "tableau" && <Tableau onVue={choisirVue} onFiltre={(f) => { setFiltres({ ...SANS_FILTRE, ...f }); setRecherche(""); choisirVue("reception"); }} />}
      {onglet === "parametres" && <Reglages etat={etat} admin={admin} onCompte={(c) => setEtat((e) => ({ ...e, compte: c }))} onDeconnecte={() => { setEtat((e) => ({ ...e, compte: null })); setListe(null); setSelection(null); }} />}

      {onglet === "messages" && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[13.5rem_minmax(0,22rem)_minmax(0,1fr)]">
          {/* ---------------------- dossiers et catégories ---------------------- */}
          <nav aria-label="Dossiers" className={`min-w-0 ${selection ? "hidden lg:block" : ""}`}>
            <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:block lg:space-y-0.5 lg:overflow-visible lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-2">
              {VUES.map((v) => {
                const n = compteurs?.[v.cle] ?? 0;
                const on = vue === v.cle && nbFiltres === 0;
                return (
                  <li key={v.cle} className="shrink-0">
                    <button type="button" aria-current={on ? "page" : undefined} onClick={() => { setFiltres({ ...SANS_FILTRE, q: filtres.q }); choisirVue(v.cle); }} className={`flex w-full items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition lg:rounded-xl lg:border-0 ${on ? "border-pine-700 bg-pine-700 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:bg-amber-500/15"}`}>
                      <v.icon className={`h-4 w-4 shrink-0 ${on ? "text-amber-400" : "text-pine-600"}`} />
                      <span className="whitespace-nowrap">{v.label}</span>
                      {n > 0 && <span className={`ml-auto rounded-full px-1.5 text-xs font-bold tabular-nums ${on ? "bg-white/20" : v.cle === "prioritaires" || v.cle === "a_repondre" ? "bg-amber-500/20 text-amber-800" : "bg-mist text-neutral-700"}`}>{n}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
            {compteurs && Object.keys(compteurs.categories).length > 0 && (
              <div className="mt-3 hidden rounded-2xl border border-neutral-200 bg-white p-2 lg:block">
                <p className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-neutral-600">Catégories à traiter</p>
                <ul className="space-y-0.5">
                  {CATEGORIES.filter(([k]) => compteurs.categories[k]).map(([k, l]) => (
                    <li key={k}>
                      <button type="button" aria-pressed={filtres.categorie === k} onClick={() => { setFiltres({ ...SANS_FILTRE, categorie: filtres.categorie === k ? "" : k }); setVue("reception"); setPage(1); setSelection(null); }} className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-sm transition ${filtres.categorie === k ? "bg-pine-50 font-bold text-pine-900" : "text-neutral-700 hover:bg-mist"}`}>
                        <span className="min-w-0 flex-1 truncate">{l}</span><span className="text-xs font-bold tabular-nums text-neutral-600">{compteurs.categories[k]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* ------------------------------ liste ------------------------------ */}
          <section aria-label="Liste des messages" className={`min-w-0 ${selection ? "hidden lg:block" : ""}`}>
            <form className="flex gap-2" role="search" onSubmit={(e) => { e.preventDefault(); setFiltres({ ...filtres, q: recherche.trim() }); setPage(1); }}>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
                <label className="sr-only" htmlFor="msg-recherche">Rechercher dans mes e-mails</label>
                <input id="msg-recherche" className={`${champ} rounded-full pl-9 pr-9`} value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher dans ma boîte…" />
                {(recherche || filtres.q) && <button type="button" aria-label="Effacer la recherche" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-600 hover:bg-mist" onClick={() => { setRecherche(""); setFiltres({ ...filtres, q: "" }); setPage(1); }}><X className="h-4 w-4" /></button>}
              </div>
              <button type="button" aria-expanded={filtresOuverts} className={`${bouton} shrink-0 ${nbFiltres > 0 ? "border-pine-600 text-pine-800" : ""}`} onClick={() => setFiltresOuverts(!filtresOuverts)}>
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtres{nbFiltres > 0 ? ` (${nbFiltres})` : ""}
              </button>
            </form>

            {filtresOuverts && (
              <div className="mt-2 grid gap-2 rounded-2xl border border-neutral-200 bg-white p-3 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-neutral-600">Expéditeur</span><input id="f-exp" className={champ} value={filtres.expediteur} onChange={(e) => { setFiltres({ ...filtres, expediteur: e.target.value }); setPage(1); }} placeholder="nom ou adresse" /></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Catégorie</span><select id="f-cat" className={champ} value={filtres.categorie} onChange={(e) => { setFiltres({ ...filtres, categorie: e.target.value }); setPage(1); }}><option value="">Toutes</option>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Priorité</span><select id="f-prio" className={champ} value={filtres.priorite} onChange={(e) => { setFiltres({ ...filtres, priorite: e.target.value }); setPage(1); }}><option value="">Toutes</option>{PRIORITES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Statut</span><select id="f-statut" className={champ} value={filtres.statut} onChange={(e) => { setFiltres({ ...filtres, statut: e.target.value }); setPage(1); }}><option value="">Tous</option><option value="a_traiter">À traiter</option><option value="en_attente">En attente</option><option value="traite">Traité</option></select></label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Du</span><input id="f-du" type="date" className={champ} value={filtres.du} onChange={(e) => { setFiltres({ ...filtres, du: e.target.value }); setPage(1); }} /></label>
                  <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Au</span><input id="f-au" type="date" className={champ} value={filtres.au} onChange={(e) => { setFiltres({ ...filtres, au: e.target.value }); setPage(1); }} /></label>
                </div>
                {nbFiltres > 0 && <button type="button" className={`${bouton} sm:col-span-2`} onClick={() => { setFiltres({ ...SANS_FILTRE, q: filtres.q }); setPage(1); }}>Effacer les filtres</button>}
              </div>
            )}

            <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {erreur ? (
                <p className="p-5 text-sm text-red-800">{erreur} <button type="button" className="font-bold underline" onClick={() => charger()}>Réessayer</button></p>
              ) : !liste ? (
                <ul aria-busy="true" aria-label="Chargement des messages">{[0, 1, 2, 3, 4, 5].map((i) => <li key={i} className="border-b border-neutral-100 p-4"><div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" /><div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-neutral-100" /><div className="mt-2 h-3 w-full animate-pulse rounded bg-neutral-100" /></li>)}</ul>
              ) : liste.messages.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <MailOpen className="mx-auto h-7 w-7 text-neutral-600" />
                  <p className="mt-2 text-sm font-bold text-inkgreen">{filtres.q || nbFiltres > 0 ? "Aucun message ne correspond." : compte.lastSyncAt ? "Rien ici pour l'instant." : "Première synchronisation en cours…"}</p>
                  <p className="mt-1 text-xs text-neutral-600">{filtres.q || nbFiltres > 0 ? "Modifiez la recherche ou effacez les filtres." : compte.lastSyncAt ? "Les nouveaux messages apparaîtront ici, triés." : "Vos derniers messages arrivent dans quelques instants."}</p>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {liste.messages.map((m) => {
                    const on = selection === m.id;
                    const qui = m.dossier === "sent" ? `À ${m.dest?.to?.[0] ?? ""}` : m.from_nom || m.from_email;
                    return (
                      <li key={m.id}>
                        <button type="button" aria-current={on ? "true" : undefined} onClick={() => { setSelection(m.id); setListe((l) => (l ? { ...l, messages: l.messages.map((x) => (x.id === m.id ? { ...x, lu: true } : x)) } : l)); }} className={`block w-full px-4 py-3 text-left transition ${on ? "bg-pine-50" : "hover:bg-amber-500/[0.06]"}`}>
                          <span className="flex items-baseline gap-2">
                            {!m.lu && m.dossier === "inbox" && <span className="h-2 w-2 shrink-0 self-center rounded-full bg-pine-600" aria-label="Non lu" />}
                            <span className={`min-w-0 flex-1 truncate text-sm ${m.lu ? "font-semibold text-neutral-800" : "font-extrabold text-inkgreen"}`}>{qui}</span>
                            <span className="shrink-0 text-xs tabular-nums text-neutral-600">{quand(m.date)}</span>
                          </span>
                          <span className={`mt-0.5 block truncate text-sm ${m.lu ? "text-neutral-700" : "font-bold text-inkgreen"}`}>{m.sujet || "(sans objet)"}</span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {m.priorite && (m.priorite === "urgent" || m.priorite === "eleve") && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${PRIORITE_STYLE[m.priorite]}`}>{PRIORITE_LABELS[m.priorite as Priorite]}</span>}
                            {m.categorie && <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-neutral-700">{CATEGORIE_LABELS[m.categorie as Categorie] ?? m.categorie}</span>}
                            {m.a_brouillon && <span className="inline-flex items-center gap-1 rounded-full bg-pine-50 px-2 py-0.5 text-xs font-bold text-pine-800"><Sparkles className="h-3 w-3" /> Brouillon prêt</span>}
                            {m.statut === "en_attente" && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">En attente</span>}
                            {m.repondu_at && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">Répondu</span>}
                            {m.lead_id && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-800">Client</span>}
                            {m.nb_pieces > 0 && <Paperclip className="h-3.5 w-3.5 text-neutral-600" aria-label="Pièce jointe" />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {liste && liste.total > 0 && (
              <p className="mt-2 flex items-center justify-between gap-2 text-xs text-neutral-600">
                <span>{liste.total.toLocaleString("fr-FR")} message{liste.total > 1 ? "s" : ""}{pages > 1 ? ` · page ${page} sur ${pages}` : ""}</span>
                <span className="flex gap-1.5">
                  {page > 1 && <button type="button" className={bouton} onClick={() => setPage(page - 1)}>← Précédents</button>}
                  {page < pages && <button type="button" className={bouton} onClick={() => setPage(page + 1)}>Suivants →</button>}
                </span>
              </p>
            )}
          </section>

          {/* --------------------------- conversation --------------------------- */}
          <section aria-label="Conversation" className={`min-w-0 ${selection ? "" : "hidden lg:block"}`}>
            {selection === "nouveau" ? (
              <Nouveau destinataire={ecrireA} envoiPossible={Boolean(compte.smtp.host)} onFermer={() => { setSelection(null); void charger(); }} />
            ) : selection ? (
              <Conversation id={selection} iaPrete={iaPrete} envoiPossible={Boolean(compte.smtp.host)} onRetour={() => setSelection(null)} onChange={() => void charger()} />
            ) : (
              <div className="grid h-full min-h-64 place-items-center rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center">
                <div>
                  <FileText className="mx-auto h-8 w-8 text-neutral-600" />
                  <p className="mt-2 text-sm font-bold text-inkgreen">Choisissez un message</p>
                  <p className="mt-1 max-w-xs text-xs text-neutral-600">Le message, la fiche du client et la réponse préparée s&rsquo;affichent ici, lus directement dans votre boîte. Les réponses prêtes sont dans « Brouillons préparés ».</p>
                  {(compteurs?.brouillons ?? 0) > 0 && <button type="button" className={`${boutonPrincipal} mt-4`} onClick={() => choisirVue("brouillons")}><Sparkles className="h-4 w-4" /> {compteurs?.brouillons} réponse{(compteurs?.brouillons ?? 0) > 1 ? "s" : ""} à valider</button>}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Entete() {
  return <h1 className="text-2xl font-extrabold text-inkgreen">Messagerie intelligente</h1>;
}

type Stats = { recus: number; a_traiter: number; urgents: number; prospects: number; opportunites: number; clients_en_attente: number; heures_reponse: number | null; reponses_generees: number; brouillons_en_attente: number; minutes_economisees: number };

function Tableau({ onVue, onFiltre }: { onVue: (v: string) => void; onFiltre: (f: Partial<Filtres>) => void }) {
  const [s, setS] = useState<Stats | null>(null);
  const [min, setMin] = useState(4);
  const [erreur, setErreur] = useState<string | null>(null);
  useEffect(() => { void appel<{ stats: Stats; minutesParBrouillon: number }>("/stats").then((r) => (r.ok ? (setS(r.stats), setMin(r.minutesParBrouillon)) : setErreur(r.error))); }, []);
  if (erreur) return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{erreur}</p>;
  if (!s) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-busy="true">{Array.from({ length: 10 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}</div>;
  const duree = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`);
  const delai = s.heures_reponse === null ? "—" : s.heures_reponse < 1 ? `${Math.round(s.heures_reponse * 60)} min` : s.heures_reponse < 48 ? `${String(s.heures_reponse).replace(".", ",")} h` : `${Math.round(s.heures_reponse / 24)} j`;
  const tuiles: { n: string; label: string; aide?: string; go?: () => void; chaud?: boolean }[] = [
    { n: String(s.a_traiter), label: "E-mails à traiter", go: () => onVue("a_repondre"), chaud: s.a_traiter > 0 },
    { n: String(s.urgents), label: "E-mails urgents", go: () => onFiltre({ priorite: "urgent" }), chaud: s.urgents > 0 },
    { n: String(s.brouillons_en_attente), label: "Brouillons à valider", go: () => onVue("brouillons"), chaud: s.brouillons_en_attente > 0 },
    { n: String(s.clients_en_attente), label: "Clients en attente de réponse", go: () => onVue("a_repondre") },
    { n: String(s.recus), label: "E-mails reçus", aide: "30 derniers jours", go: () => onVue("reception") },
    { n: String(s.prospects), label: "Prospects détectés", aide: "30 derniers jours", go: () => onFiltre({ categorie: "nouveau_prospect" }) },
    { n: String(s.opportunites), label: "Opportunités commerciales", aide: "devis, opportunités, négociations, commandes · 30 jours", go: () => onFiltre({ categorie: "demande_devis" }) },
    { n: String(s.reponses_generees), label: "Réponses préparées par l'IA", aide: "30 derniers jours" },
    { n: delai, label: "Temps moyen de réponse", aide: "entre la réception et votre réponse · 30 jours" },
    { n: duree(s.minutes_economisees), label: "Temps économisé (estimation)", aide: `${min} min par réponse préparée : une hypothèse, pas une mesure` },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {tuiles.map((t) => {
        const contenu = (<><span className={`block text-2xl font-extrabold tabular-nums ${t.chaud ? "text-amber-700" : "text-inkgreen"}`}>{t.n}</span><span className="mt-1 block text-sm font-bold text-neutral-800">{t.label}</span>{t.aide && <span className="mt-0.5 block text-xs text-neutral-600">{t.aide}</span>}{t.go && <span className="mt-2 block text-xs font-bold text-pine-700">Voir →</span>}</>);
        return t.go ? <button key={t.label} type="button" onClick={t.go} className="rounded-2xl border border-neutral-200 bg-white p-4 text-left transition hover:border-pine-300">{contenu}</button> : <div key={t.label} className="rounded-2xl border border-neutral-200 bg-white p-4">{contenu}</div>;
      })}
    </div>
  );
}
