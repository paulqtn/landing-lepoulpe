"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck, Trash2, Unplug } from "lucide-react";
import { CATEGORIES, CATEGORIES_SANS_REPONSE, FREQUENCES, PRIORITES, TONS, type Categorie, type Priorite, type Reglages as R, type ReglagesGlobaux, type ReglePriorite } from "@/lib/messagerie/modele";
import { toast } from "../Toasts";
import { Connexion } from "./Connexion";
import { appel, bouton, boutonPrincipal, champ, etiquette, ilYA, type CompteVue, type Etat, type GlobauxVue } from "./commun";

/* Paramètres : la connexion de la boîte, les réglages personnels du commercial, et pour les
   administrateurs les réglages communs à toute l'entreprise. */

const carte = "rounded-2xl border border-neutral-200 bg-white p-5";
const titre = "text-base font-extrabold text-inkgreen";

function Bascule({ id, label, aide, valeur, onChange }: { id: string; label: string; aide?: string; valeur: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 py-2">
      <input id={id} type="checkbox" checked={valeur} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-pine-600" />
      <span><span className="block text-sm font-bold text-inkgreen">{label}</span>{aide && <span className="block text-xs text-neutral-600">{aide}</span>}</span>
    </label>
  );
}

export function Reglages({ etat, admin, onCompte, onDeconnecte }: { etat: Etat; admin: boolean; onCompte: (c: CompteVue) => void; onDeconnecte: () => void }) {
  const compte = etat.compte as CompteVue;
  const [r, setR] = useState<R>(compte.reglages);
  const [nom, setNom] = useState(compte.nom);
  const [occupe, setOccupe] = useState<string | null>(null);
  const [modifConnexion, setModifConnexion] = useState(false);
  const [deconnexion, setDeconnexion] = useState(false);
  const [exclusion, setExclusion] = useState("");
  const [regle, setRegle] = useState<ReglePriorite>({ type: "domaine", valeur: "", priorite: "urgent" });
  const set = (p: Partial<R>) => setR((x) => ({ ...x, ...p }));

  async function enregistrer() {
    setOccupe("perso");
    const res = await appel<{ reglages: R; nom: string }>("/compte", { method: "PATCH", body: { reglages: r, nom } });
    setOccupe(null);
    if (!res.ok) return toast(res.error, true);
    setR(res.reglages);
    onCompte({ ...compte, reglages: res.reglages, nom: res.nom });
    toast("Paramètres enregistrés.");
  }

  async function deconnecter() {
    setOccupe("deconnexion");
    const res = await appel("/compte", { method: "DELETE" });
    setOccupe(null);
    if (!res.ok) return toast(res.error, true);
    toast("Boîte mail déconnectée. Ses messages ont été retirés du back office.");
    onDeconnecte();
  }

  if (modifConnexion) return <Connexion etat={etat} compte={compte} onAnnule={() => setModifConnexion(false)} onConnecte={(c, av) => { onCompte(c); setModifConnexion(false); toast(av ?? "Connexion enregistrée.", Boolean(av)); }} />;

  return (
    <div className="space-y-5">
      {/* ------------------------------ la boîte ------------------------------ */}
      <section className={carte}>
        <h2 className={titre}>Ma boîte mail</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div><dt className="text-xs font-semibold text-neutral-600">Adresse</dt><dd className="font-bold text-inkgreen">{compte.email}</dd></div>
          <div><dt className="text-xs font-semibold text-neutral-600">État</dt><dd className={`font-bold ${compte.statut === "ok" ? "text-green-700" : "text-red-700"}`}>{compte.statut === "ok" ? "Connectée" : "Connexion en erreur"} <span className="font-normal text-neutral-600">· synchronisée {ilYA(compte.lastSyncAt)}</span></dd></div>
          <div><dt className="text-xs font-semibold text-neutral-600">Réception</dt><dd>{compte.imap.host} · port {compte.imap.port} · {compte.imap.secure ? "SSL/TLS" : "STARTTLS"}</dd></div>
          <div><dt className="text-xs font-semibold text-neutral-600">Envoi</dt><dd>{compte.smtp.host ? `${compte.smtp.host} · port ${compte.smtp.port}` : "non configuré"}</dd></div>
          <div><dt className="text-xs font-semibold text-neutral-600">Dossier des brouillons</dt><dd>{compte.dossiers.drafts ?? "créé au premier brouillon"}</dd></div>
          <div><dt className="text-xs font-semibold text-neutral-600">Connexion</dt><dd>{compte.auth === "password" ? "Mot de passe chiffré" : `Autorisation ${compte.auth === "google" ? "Google" : "Microsoft"} (jetons chiffrés)`}</dd></div>
        </dl>
        {compte.erreur && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">{compte.erreur}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" className={bouton} onClick={() => setModifConnexion(true)}>Modifier la connexion</button>
          {!deconnexion ? (
            <button type="button" className={`${bouton} hover:border-red-300 hover:text-red-700`} onClick={() => setDeconnexion(true)}><Unplug className="h-3.5 w-3.5" /> Déconnecter la boîte</button>
          ) : (
            <span className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alertdialog" aria-label="Confirmer la déconnexion">
              Vos identifiants, vos messages et vos brouillons seront effacés du back office. Votre boîte mail, elle, ne change pas.
              <button type="button" className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40" disabled={occupe !== null} onClick={deconnecter}>{occupe === "deconnexion" ? "Déconnexion…" : "Confirmer"}</button>
              <button type="button" className={bouton} onClick={() => setDeconnexion(false)}>Annuler</button>
            </span>
          )}
        </div>
      </section>

      {/* --------------------------- réglages personnels --------------------------- */}
      <section className={carte}>
        <h2 className={titre}>Tri et réponses automatiques</h2>
        <div className="mt-2 divide-y divide-neutral-100">
          <Bascule id="r-tri" label="Trier mes e-mails automatiquement" aide="Chaque nouveau message reçoit une catégorie, une priorité et un résumé." valeur={r.triAuto} onChange={(v) => set({ triAuto: v })} />
          <Bascule id="r-brouillons" label="Préparer les réponses en brouillon" aide="Le brouillon est déposé dans votre boîte mail. Vous le relisez et l'envoyez vous-même." valeur={r.brouillonsAuto} onChange={(v) => set({ brouillonsAuto: v })} />
        </div>
        <fieldset className="mt-4" disabled={!r.brouillonsAuto}>
          <legend className={etiquette}>Catégories pour lesquelles une réponse est préparée d&rsquo;office</legend>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.filter(([k]) => !CATEGORIES_SANS_REPONSE.includes(k)).map(([k, l]) => {
              const on = r.categoriesAuto.includes(k);
              return <button key={k} type="button" aria-pressed={on} onClick={() => set({ categoriesAuto: on ? r.categoriesAuto.filter((x) => x !== k) : [...r.categoriesAuto, k as Categorie] })} className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${on ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-700"}`}>{l}</button>;
            })}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className={etiquette}>Ton de mes réponses</span><select id="r-ton" className={champ} value={r.ton} onChange={(e) => set({ ton: e.target.value as R["ton"] })}>{TONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="block"><span className={etiquette}>Fréquence de synchronisation</span><select id="r-freq" className={champ} value={r.frequenceMin} onChange={(e) => set({ frequenceMin: Number(e.target.value) })}>{FREQUENCES.map((f) => <option key={f} value={f}>Toutes les {f} minutes</option>)}</select></label>
          <label className="block sm:col-span-2"><span className={etiquette}>Nom affiché à mes destinataires</span><input id="r-nom" className={champ} value={nom} onChange={(e) => setNom(e.target.value)} /></label>
          <label className="block sm:col-span-2"><span className={etiquette}>Signature professionnelle (ajoutée sous chaque réponse préparée)</span><textarea id="r-signature" rows={4} className={champ} value={r.signature} onChange={(e) => set({ signature: e.target.value })} placeholder={"Prénom Nom\nFonction\nTéléphone"} /></label>
          <label className="block sm:col-span-2"><span className={etiquette}>Mes consignes pour l&rsquo;IA</span><textarea id="r-instructions" rows={3} className={champ} value={r.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="Exemples : je vouvoie toujours ; je propose un appel plutôt qu'un long e-mail ; je signe de mon prénom." /></label>
        </div>
        <p className="mt-2 text-xs text-neutral-500">La synchronisation tourne tant que le back office est ouvert dans votre navigateur. Fermé, elle reprend à la prochaine ouverture ou au passage quotidien du serveur.</p>
      </section>

      <section className={carte}>
        <h2 className={titre}>Notifications</h2>
        <div className="mt-2 divide-y divide-neutral-100">
          <Bascule id="r-n-urgent" label="Me prévenir quand un e-mail urgent arrive" valeur={r.notifUrgent} onChange={(v) => set({ notifUrgent: v })} />
          <Bascule id="r-n-brouillon" label="Me prévenir quand une réponse est prête à valider" valeur={r.notifBrouillon} onChange={(v) => set({ notifBrouillon: v })} />
        </div>
        <p className="mt-1 text-xs text-neutral-500">Les notifications passent par la cloche du back office, en haut de l&rsquo;écran.</p>
      </section>

      <section className={carte}>
        <h2 className={titre}>Adresses et domaines exclus</h2>
        <p className="mt-1 text-sm text-neutral-600">Leurs messages restent visibles mais ne sont jamais transmis à l&rsquo;IA : ni tri, ni brouillon.</p>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = exclusion.trim().toLowerCase().replace(/^@/, ""); if (v && !r.exclusions.includes(v)) set({ exclusions: [...r.exclusions, v] }); setExclusion(""); }}>
          <label className="sr-only" htmlFor="r-exclusion">Adresse ou domaine à exclure</label>
          <input id="r-exclusion" className={champ} value={exclusion} onChange={(e) => setExclusion(e.target.value)} placeholder="banque.fr ou comptable@cabinet.fr" />
          <button type="submit" className={bouton}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
        </form>
        {r.exclusions.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5">{r.exclusions.map((x) => <li key={x} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-neutral-700">{x}<button type="button" aria-label={`Retirer ${x}`} onClick={() => set({ exclusions: r.exclusions.filter((y) => y !== x) })}><Trash2 className="h-3.5 w-3.5 text-neutral-500 hover:text-red-600" /></button></li>)}</ul>}
      </section>

      <section className={carte}>
        <h2 className={titre}>Mes règles de priorité</h2>
        <p className="mt-1 text-sm text-neutral-600">Une règle l&rsquo;emporte sur l&rsquo;avis de l&rsquo;IA. La première qui correspond s&rsquo;applique.</p>
        <form className="mt-3 grid gap-2 sm:grid-cols-[10rem_1fr_9rem_auto]" onSubmit={(e) => { e.preventDefault(); if (regle.valeur.trim()) { set({ regles: [...r.regles, { ...regle, valeur: regle.valeur.trim().toLowerCase() }] }); setRegle({ ...regle, valeur: "" }); } }}>
          <label className="sr-only" htmlFor="r-regle-type">Type de règle</label>
          <select id="r-regle-type" className={champ} value={regle.type} onChange={(e) => setRegle({ ...regle, type: e.target.value as ReglePriorite["type"] })}><option value="domaine">Domaine</option><option value="expediteur">Adresse</option><option value="mot">Mot dans le message</option></select>
          <label className="sr-only" htmlFor="r-regle-valeur">Valeur</label>
          <input id="r-regle-valeur" className={champ} value={regle.valeur} onChange={(e) => setRegle({ ...regle, valeur: e.target.value })} placeholder={regle.type === "mot" ? "chantier bloqué" : regle.type === "domaine" ? "grand-compte.fr" : "pdg@client.fr"} />
          <label className="sr-only" htmlFor="r-regle-prio">Priorité</label>
          <select id="r-regle-prio" className={champ} value={regle.priorite} onChange={(e) => setRegle({ ...regle, priorite: e.target.value as Priorite })}>{PRIORITES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <button type="submit" className={bouton}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
        </form>
        {r.regles.length > 0 && (
          <ul className="mt-3 divide-y divide-neutral-100 text-sm">
            {r.regles.map((x, i) => (
              <li key={i} className="flex items-center gap-2 py-2">
                <span className="text-neutral-600">{x.type === "mot" ? "Si le message contient" : x.type === "domaine" ? "Si l'expéditeur est du domaine" : "Si l'expéditeur est"}</span>
                <strong className="text-inkgreen">{x.valeur}</strong>
                <span className="text-neutral-600">→ priorité</span><strong>{PRIORITES.find(([k]) => k === x.priorite)?.[1]}</strong>
                <button type="button" className="ml-auto" aria-label="Supprimer la règle" onClick={() => set({ regles: r.regles.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-neutral-500 hover:text-red-600" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-3 z-10 flex justify-end">
        <button type="button" className={`${boutonPrincipal} shadow-card`} disabled={occupe !== null} onClick={enregistrer}>{occupe === "perso" && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer mes paramètres</button>
      </div>

      {admin && <Globaux />}
    </div>
  );
}

/** Réglages communs, réservés aux administrateurs. Aucun contenu de boîte n'y apparaît. */
export function Globaux() {
  const [d, setD] = useState<GlobauxVue | null>(null);
  const [g, setG] = useState<ReglagesGlobaux | null>(null);
  const [occupe, setOccupe] = useState(false);
  useEffect(() => { void appel<GlobauxVue>("/globaux").then((r) => { if (r.ok) { setD(r); setG(r.globaux); } }); }, []);
  if (!d || !g) return null;
  const set = (p: Partial<ReglagesGlobaux>) => setG((x) => (x ? { ...x, ...p } : x));
  const etatServeur: [string, boolean, string][] = [
    ["Chiffrement des identifiants", d.serveur.chiffrement, "MESSAGERIE_SECRET"],
    ["Service d'IA", d.serveur.ia, "ANTHROPIC_API_KEY"],
    ["Connexion Google", d.serveur.google, "GOOGLE_OAUTH_CLIENT_ID et GOOGLE_OAUTH_CLIENT_SECRET"],
    ["Connexion Microsoft", d.serveur.microsoft, "MICROSOFT_OAUTH_CLIENT_ID et MICROSOFT_OAUTH_CLIENT_SECRET"],
  ];
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-white p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen"><ShieldCheck className="h-4 w-4 text-amber-600" /> Réglages de l&rsquo;entreprise (administrateur)</h2>
      <div className="mt-2 divide-y divide-neutral-100">
        <Bascule id="g-actif" label="Messagerie ouverte aux commerciaux" valeur={g.actif} onChange={(v) => set({ actif: v })} />
        <Bascule id="g-ia" label="Autoriser l'IA à lire et à rédiger" aide="Désactivé : les boîtes restent consultables, mais aucun message n'est transmis au service d'IA." valeur={g.ia} onChange={(v) => set({ ia: v })} />
      </div>
      <label className="mt-3 block">
        <span className={etiquette}>Ce que l&rsquo;IA peut savoir sur l&rsquo;entreprise</span>
        <textarea id="g-connaissances" rows={7} className={champ} value={g.connaissances} onChange={(e) => set({ connaissances: e.target.value })} placeholder={"Produits et services, zones livrées, délais habituels que vous acceptez de citer, garanties, conditions de pose, horaires, règles commerciales…\nL'IA ne cite que ce qui est écrit ici ou dans la fiche du client. N'y mettez ni prix d'achat ni marge."} />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={etiquette}>Conservation des e-mails dans le back office (jours)</span><input id="g-conservation" inputMode="numeric" className={champ} value={g.conservationJours} onChange={(e) => set({ conservationJours: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
        <label className="block"><span className={etiquette}>Première synchronisation : jours repris</span><input id="g-initial" inputMode="numeric" className={champ} value={g.joursInitial} onChange={(e) => set({ joursInitial: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
      </div>
      <button type="button" className={`${boutonPrincipal} mt-4`} disabled={occupe} onClick={async () => { setOccupe(true); const r = await appel<{ globaux: ReglagesGlobaux }>("/globaux", { method: "PUT", body: g }); setOccupe(false); if (!r.ok) return toast(r.error, true); setG(r.globaux); toast("Réglages de l'entreprise enregistrés."); }}>
        {occupe && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer les réglages de l&rsquo;entreprise
      </button>

      <h3 className="mt-6 text-sm font-extrabold text-inkgreen">État du serveur</h3>
      <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
        {etatServeur.map(([l, ok, v]) => <li key={l} className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-green-600" : "bg-neutral-300"}`} /><span><strong className="font-bold text-inkgreen">{l}</strong> : {ok ? "prêt" : <>à configurer <span className="text-xs text-neutral-500">({v})</span></>}</span></li>)}
      </ul>

      <h3 className="mt-6 text-sm font-extrabold text-inkgreen">Boîtes connectées ({d.boites.length})</h3>
      <p className="text-xs text-neutral-500">Vous voyez l&rsquo;état des connexions, jamais le contenu des boîtes.</p>
      {d.boites.length === 0 ? <p className="mt-2 text-sm text-neutral-600">Aucune boîte connectée pour l&rsquo;instant.</p> : (
        <ul className="mt-2 divide-y divide-neutral-100 text-sm">
          {d.boites.map((b) => <li key={b.email} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2"><strong className="text-inkgreen">{b.utilisateur}</strong><span className="text-neutral-600">{b.email}</span><span className={`ml-auto text-xs font-bold ${b.statut === "ok" ? "text-green-700" : "text-red-700"}`}>{b.statut === "ok" ? `synchronisée ${ilYA(b.last_sync_at)}` : `en erreur : ${b.erreur ?? ""}`}</span></li>)}
        </ul>
      )}
    </section>
  );
}
