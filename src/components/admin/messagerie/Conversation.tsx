"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, CheckCircle2, ChevronDown, Clock, FileDown, ImageOff, Loader2, MailCheck, Paperclip, RefreshCw, Save, Send, ShieldAlert, Sparkles, Trash2, TriangleAlert, UserPlus, Wand2 } from "lucide-react";
import { CATEGORIES, CATEGORIE_LABELS, PRIORITES, PRIORITE_LABELS, type Categorie, type Priorite } from "@/lib/messagerie/modele";
import { toast } from "../Toasts";
import { appel, bouton, boutonPrincipal, champ, dateComplete, poids, PRIORITE_STYLE, quand, type BrouillonVue, type Conversation as Conv } from "./commun";

/* Colonne de droite : la conversation, ce que l'IA en a compris, et l'assistant de réponse.
   Le brouillon reste entièrement modifiable ; l'envoi demande une confirmation explicite. */

const ACTIONS: { cle: string; label: string }[] = [
  { cle: "raccourcir", label: "Raccourcir" },
  { cle: "developper", label: "Développer" },
  { cle: "reformuler", label: "Reformuler" },
  { cle: "ton_commercial", label: "Plus commercial" },
  { cle: "ton_professionnel", label: "Plus professionnel" },
  { cle: "ton_chaleureux", label: "Plus chaleureux" },
  { cle: "relance", label: "Écrire une relance" },
  { cle: "rendez_vous", label: "Proposer un rendez-vous" },
];
const LANGUES = ["français", "anglais", "espagnol", "allemand", "italien", "néerlandais", "portugais"];

function CorpsHtml({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(240);
  // Cadre isolé, sans script : le contenu d'un e-mail ne peut rien exécuter ni lire dans le back office.
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'"><base target="_blank"><style>body{margin:0;padding:4px;font:14px/1.55 system-ui,-apple-system,sans-serif;color:#0d1f17;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}blockquote{margin:8px 0 8px 8px;padding-left:10px;border-left:2px solid #d4d4d4;color:#525252}a{color:#175a3b}</style></head><body>${html}</body></html>`;
  return (
    <iframe
      ref={ref}
      title="Contenu du message"
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      srcDoc={doc}
      onLoad={() => { try { setH(Math.min(1400, Math.max(120, (ref.current?.contentDocument?.documentElement.scrollHeight ?? 240) + 8))); } catch {} }}
      style={{ height: h }}
      className="w-full rounded-xl border border-neutral-100 bg-white"
    />
  );
}

export function Conversation({ id, iaPrete, envoiPossible, onRetour, onChange }: { id: number; iaPrete: boolean; envoiPossible: boolean; onRetour: () => void; onChange: () => void }) {
  const [c, setC] = useState<Conv | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [images, setImages] = useState(false);
  const [filOuvert, setFilOuvert] = useState(false);
  const [b, setB] = useState<{ id?: number; dest: string; cc: string; sujet: string; corps: string; origine: string; manquants: string[]; dansLaBoite: boolean } | null>(null);
  const [modifie, setModifie] = useState(false);
  const [occupe, setOccupe] = useState<string | null>(null);
  const [resume, setResume] = useState<{ resume: string; points: string[]; prochaine_etape: string } | null>(null);
  const [demande, setDemande] = useState("");
  const [langue, setLangue] = useState("anglais");
  const [confirmer, setConfirmer] = useState(false);
  const modifieRef = useRef(false);
  modifieRef.current = modifie;

  const charger = useCallback(async (avecImages = false, garderBrouillon = false) => {
    const r = await appel<Conv>(`/messages/${id}${avecImages ? "?images=1" : ""}`);
    if (!r.ok) return setErreur(r.error);
    setErreur(null);
    setC(r);
    // On ne remplace jamais un texte que le commercial est en train de modifier.
    if (!garderBrouillon && !modifieRef.current) setB(r.brouillon ? { ...r.brouillon } : null);
  }, [id]);

  useEffect(() => {
    setC(null); setB(null); setModifie(false); setResume(null); setConfirmer(false); setImages(false); setFilOuvert(false); setDemande("");
    void charger();
  }, [id, charger]);

  // Tant que l'analyse ou la rédaction tourne en tâche de fond, on revient voir.
  useEffect(() => {
    if (!c?.message.enCours) return;
    const t = setInterval(() => void charger(images), 6000);
    return () => clearInterval(t);
  }, [c?.message.enCours, charger, images]);

  if (erreur) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{erreur} <button type="button" className="ml-2 font-bold underline" onClick={() => charger()}>Réessayer</button></div>;
  if (!c) return <div className="grid h-64 place-items-center rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-500"><Loader2 className="h-5 w-5 animate-spin" aria-label="Chargement du message" /></div>;
  const m = c.message;
  const recu = m.dossier === "inbox";

  async function action(champs: Record<string, unknown>, ok?: string) {
    const r = await appel(`/messages/${id}`, { method: "PATCH", body: champs });
    if (!r.ok) return toast(r.error, true);
    if (ok) toast(ok);
    await charger(images, true);
    onChange();
  }

  async function ia(cle: string, precision = "") {
    setOccupe(cle);
    if (cle === "resumer") {
      const r = await appel<{ resume: { resume: string; points: string[]; prochaine_etape: string } }>(`/messages/${id}/assistant`, { body: { action: "resumer" } });
      setOccupe(null);
      return r.ok ? setResume(r.resume) : toast(r.error, true);
    }
    const r = await appel<{ brouillon: BrouillonVue }>(`/messages/${id}/assistant`, { body: { action: cle, brouillon: b?.corps ?? "", precision } });
    setOccupe(null);
    if (!r.ok) return toast(r.error, true);
    setB({ ...r.brouillon });
    setModifie(false);
    setDemande("");
    toast("Brouillon préparé et enregistré dans les brouillons de votre boîte mail.");
    onChange();
  }

  async function enregistrer(silencieux = false): Promise<number | null> {
    if (!b) return null;
    setOccupe("enregistrer");
    const r = await appel<{ brouillon: BrouillonVue; avertissement: string | null }>("/brouillons", { body: { messageId: id, dest: b.dest, cc: b.cc, sujet: b.sujet, corps: b.corps, origine: modifie ? "manuel" : b.origine, manquants: b.manquants } });
    setOccupe(null);
    if (!r.ok) { toast(r.error, true); return null; }
    setB({ ...r.brouillon });
    setModifie(false);
    if (r.avertissement) toast(r.avertissement, true);
    else if (!silencieux) toast("Brouillon enregistré dans votre boîte mail.");
    onChange();
    return r.brouillon.id;
  }

  async function envoyer() {
    const bid = modifie || !b?.id ? await enregistrer(true) : b.id;
    if (!bid) return;
    setOccupe("envoyer");
    const r = await appel(`/brouillons/${bid}/envoyer`, { body: { confirme: true } });
    setOccupe(null);
    setConfirmer(false);
    if (!r.ok) return toast(r.error, true);
    toast("Message envoyé.");
    setB(null);
    setModifie(false);
    await charger(images);
    onChange();
  }

  async function supprimer() {
    if (b?.id) {
      setOccupe("supprimer");
      const r = await appel(`/brouillons/${b.id}`, { method: "DELETE" });
      setOccupe(null);
      if (!r.ok) return toast(r.error, true);
    }
    setB(null);
    setModifie(false);
    setConfirmer(false);
    toast("Brouillon supprimé.");
    onChange();
  }

  const maj = (p: Partial<NonNullable<typeof b>>) => { setB((x) => (x ? { ...x, ...p } : x)); setModifie(true); setConfirmer(false); };
  const reperes = b ? (b.corps.match(/\[[^\]\n]{2,80}\]/g) ?? []) : [];

  return (
    <article className="space-y-4">
      {/* ------------------------------ en-tête ------------------------------ */}
      <header className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <button type="button" onClick={onRetour} className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 lg:hidden"><ArrowLeft className="h-4 w-4" /> Retour à la liste</button>
        <h2 className="text-lg font-extrabold leading-snug text-inkgreen">{m.sujet || "(sans objet)"}</h2>
        <p className="mt-1 text-sm text-neutral-700">
          {recu ? <><strong className="font-bold text-inkgreen">{m.de.nom || m.de.email}</strong> <span className="text-neutral-500">&lt;{m.de.email}&gt;</span></> : <>À <strong className="font-bold text-inkgreen">{m.a.join(", ")}</strong></>}
        </p>
        <p className="text-xs text-neutral-500">{dateComplete(m.date)}{m.reponduLe ? ` · répondu ${quand(m.reponduLe)}` : ""}</p>

        {recu && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="msg-cat">Catégorie</label>
            <select id="msg-cat" value={m.categorie ?? ""} onChange={(e) => action({ categorie: e.target.value }, "Catégorie corrigée.")} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700">
              {!m.categorie && <option value="">Catégorie…</option>}
              {CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <label className="sr-only" htmlFor="msg-prio">Priorité</label>
            <select id="msg-prio" value={m.priorite ?? ""} onChange={(e) => action({ priorite: e.target.value }, "Priorité corrigée.")} className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${PRIORITE_STYLE[m.priorite ?? "normal"]}`}>
              {!m.priorite && <option value="">Priorité…</option>}
              {PRIORITES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <button type="button" className={bouton} onClick={() => action({ besoinReponse: !m.besoinReponse })} aria-pressed={Boolean(m.besoinReponse)}>
              {m.besoinReponse ? "Réponse attendue" : "Pas de réponse attendue"}
            </button>
            {m.iaManuel && <span className="text-xs text-neutral-500">tri corrigé par vous</span>}
            <span className="ml-auto flex flex-wrap gap-2">
              {m.statut !== "en_attente" ? <button type="button" className={bouton} onClick={() => action({ statut: "en_attente" }, "Message mis en attente.")}><Clock className="h-3.5 w-3.5" /> En attente</button> : <button type="button" className={bouton} onClick={() => action({ statut: "a_traiter" }, "Message remis à traiter.")}><RefreshCw className="h-3.5 w-3.5" /> À traiter</button>}
              {m.statut !== "traite" && <button type="button" className={bouton} onClick={() => action({ statut: "traite" }, "Message marqué comme traité.")}><CheckCircle2 className="h-3.5 w-3.5" /> Traité</button>}
              {!m.archive && <button type="button" className={bouton} onClick={() => action({ archive: true }, "Message archivé dans votre boîte.")}><Archive className="h-3.5 w-3.5" /> Archiver</button>}
            </span>
          </div>
        )}

        {/* ce que l'IA a compris */}
        {recu && (m.enCours || m.iaErreur) && (
          <div className="mt-3 rounded-xl bg-pine-50 px-3.5 py-3 text-sm text-pine-950">
            {m.enCours && <p className="flex items-center gap-2 font-semibold"><Loader2 className="h-4 w-4 animate-spin" /> {m.enCours === "analyse" ? "Analyse du message en cours…" : "Rédaction de la réponse en cours…"}</p>}
            {m.iaErreur && <p className="flex items-start gap-1.5 text-xs text-red-700"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> L&rsquo;analyse a échoué : {m.iaErreur} <button type="button" className="font-bold underline" onClick={() => action({ relancerAnalyse: true }, "Analyse relancée.")}>Relancer</button></p>}
          </div>
        )}

        {/* lien avec le CRM */}
        {recu && (
          c.fiche ? (
            <Link href={`/commercial/clients/${c.fiche.id}`} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm transition hover:border-pine-300">
              <strong className="font-bold text-inkgreen">{c.fiche.nom}</strong>
              <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-neutral-700">{c.fiche.etape}</span>
              {c.fiche.estimation && <span className="text-xs font-bold tabular-nums text-pine-700">{Math.round(Number(c.fiche.estimation)).toLocaleString("fr-FR")} € TTC</span>}
              <span className="ml-auto text-xs font-bold text-pine-700">Ouvrir la fiche client →</span>
            </Link>
          ) : (
            <Link href={`/commercial/clients/nouveau?nom=${encodeURIComponent(m.de.nom)}&email=${encodeURIComponent(m.de.email)}`} className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-700 transition hover:border-pine-400 hover:text-pine-800">
              <UserPlus className="h-4 w-4" /> Cet expéditeur n&rsquo;est pas dans vos clients. <span className="font-bold">Créer sa fiche prospect</span>
            </Link>
          )
        )}
      </header>

      {/* ---------------------------- la conversation ---------------------------- */}
      {c.fil.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white">
          <button type="button" onClick={() => setFilOuvert(!filOuvert)} aria-expanded={filOuvert} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-inkgreen sm:px-5">
            {c.fil.length} message{c.fil.length > 1 ? "s" : ""} dans la conversation
            <ChevronDown className={`h-4 w-4 transition ${filOuvert ? "rotate-180" : ""}`} />
          </button>
          {filOuvert && (
            <ol className="divide-y divide-neutral-100 border-t border-neutral-100">
              {c.fil.map((x) => (
                <li key={x.id} className={`px-4 py-3 sm:px-5 ${x.envoye ? "bg-pine-50/50" : ""}`}>
                  <p className="text-xs font-bold text-neutral-700">{x.envoye ? "Vous" : x.de} <span className="font-normal text-neutral-500">· {dateComplete(x.date)}</span></p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-800">{x.texte}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        {m.imagesMasquees > 0 && !images && (
          <p className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-mist px-3 py-2 text-xs text-neutral-700">
            <ImageOff className="h-3.5 w-3.5" /> {m.imagesMasquees} image{m.imagesMasquees > 1 ? "s" : ""} distante{m.imagesMasquees > 1 ? "s" : ""} masquée{m.imagesMasquees > 1 ? "s" : ""} (elles signalent à l&rsquo;expéditeur que vous avez ouvert son message).
            <button type="button" className="font-bold text-pine-700 underline" onClick={() => { setImages(true); void charger(true, true); }}>Afficher</button>
          </p>
        )}
        {m.html ? <CorpsHtml html={m.html} /> : <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-800">{m.texte || "(message vide)"}</p>}
        {m.pieces.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
            {m.pieces.map((p) => p.dangereuse ? (
              <li key={p.n} title="Ce type de fichier peut exécuter du code : il n'est pas téléchargeable depuis le back office." className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                <ShieldAlert className="h-3.5 w-3.5" /> {p.nom} · bloquée
              </li>
            ) : (
              <li key={p.n}>
                <a href={`/api/admin/messagerie/messages/${id}/pieces/${p.n}`} className={bouton}><Paperclip className="h-3.5 w-3.5" /> {p.nom} <span className="font-normal text-neutral-500">{poids(p.taille)}</span> <FileDown className="h-3.5 w-3.5" /></a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------ assistant ------------------------------ */}
      <section className="rounded-2xl border border-pine-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-inkgreen"><Wand2 className="h-4 w-4 text-pine-600" /> Assistant</h3>
          {b?.dansLaBoite && !modifie && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700"><MailCheck className="h-3.5 w-3.5" /> Dans les brouillons de votre boîte mail</span>}
          {modifie && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800">Modifications non enregistrées</span>}
          <span className="ml-auto flex flex-wrap gap-2">
            <button type="button" className={bouton} disabled={!iaPrete || occupe !== null} onClick={() => ia("resumer")}>{occupe === "resumer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Résumer la conversation</button>
            {recu && <button type="button" className={bouton} disabled={!iaPrete || occupe !== null} onClick={() => ia(b ? "regenerer" : "generer")}>{occupe === "generer" || occupe === "regenerer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} {b ? "Régénérer la réponse" : "Générer une réponse"}</button>}
          </span>
        </div>
        {!iaPrete && <p className="mt-2 text-xs text-neutral-500">L&rsquo;IA n&rsquo;est pas disponible (clé non configurée ou IA désactivée par l&rsquo;administrateur). Vous pouvez écrire votre réponse vous-même.</p>}

        {resume && (
          <div className="mt-3 rounded-xl bg-mist px-3.5 py-3 text-sm text-neutral-800">
            <p>{resume.resume}</p>
            {resume.points.length > 0 && <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">{resume.points.map((p, i) => <li key={i}>{p}</li>)}</ul>}
            {resume.prochaine_etape && <p className="mt-2 text-xs font-bold">Prochaine étape : {resume.prochaine_etape}</p>}
          </div>
        )}

        {!b && recu && (
          <button type="button" className={`${bouton} mt-3`} onClick={() => { setB({ dest: m.de.email, cc: "", sujet: /^\s*re\s*:/i.test(m.sujet) ? m.sujet : `Re: ${m.sujet}`, corps: "", origine: "manuel", manquants: [], dansLaBoite: false }); setModifie(true); }}>
            Écrire la réponse moi-même
          </button>
        )}

        {b && (
          <div className="mt-4 space-y-3">
            {b.manquants.length > 0 && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-sm text-neutral-800">
                <p className="flex items-center gap-1.5 font-bold"><TriangleAlert className="h-4 w-4 text-amber-600" /> À vérifier avant l&rsquo;envoi</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">{b.manquants.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Destinataire</span><input id="msg-dest" className={champ} value={b.dest} onChange={(e) => maj({ dest: e.target.value })} /></label>
              <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Copie (facultatif)</span><input id="msg-cc" className={champ} value={b.cc} onChange={(e) => maj({ cc: e.target.value })} /></label>
            </div>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Objet</span><input id="msg-sujet" className={champ} value={b.sujet} onChange={(e) => maj({ sujet: e.target.value })} /></label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-neutral-600">Votre réponse</span>
              <textarea id="msg-corps" rows={Math.min(22, Math.max(8, b.corps.split("\n").length + 2))} className={`${champ} leading-relaxed`} value={b.corps} onChange={(e) => maj({ corps: e.target.value })} />
            </label>
            {reperes.length > 0 && <p className="text-xs font-semibold text-amber-800">Repères à compléter avant l&rsquo;envoi : {reperes.join(" · ")}</p>}

            {iaPrete && (
              <div className="rounded-xl bg-mist p-3">
                <p className="text-xs font-bold text-neutral-700">Retoucher avec l&rsquo;IA</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ACTIONS.map((a) => (
                    <button key={a.cle} type="button" className={bouton} disabled={occupe !== null || (!b.corps.trim() && !["relance", "rendez_vous"].includes(a.cle))} onClick={() => ia(a.cle)}>
                      {occupe === a.cle && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {a.label}
                    </button>
                  ))}
                  <span className="inline-flex items-center gap-1">
                    <label className="sr-only" htmlFor="msg-langue">Langue de traduction</label>
                    <select id="msg-langue" value={langue} onChange={(e) => setLangue(e.target.value)} className="rounded-full border border-neutral-200 bg-white px-2.5 py-2 text-xs font-bold text-neutral-700">{LANGUES.map((l) => <option key={l} value={l}>{l}</option>)}</select>
                    <button type="button" className={bouton} disabled={occupe !== null || !b.corps.trim()} onClick={() => ia("traduire", langue)}>{occupe === "traduire" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Traduire</button>
                  </span>
                </div>
                <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (demande.trim()) void ia("libre", demande); }}>
                  <label className="sr-only" htmlFor="msg-demande">Votre demande à l&rsquo;IA</label>
                  <input id="msg-demande" className={champ} value={demande} onChange={(e) => setDemande(e.target.value)} placeholder="Votre demande à l'IA : « ajoute que je passe mardi », « insiste sur la garantie »…" />
                  <button type="submit" className={bouton} disabled={occupe !== null || !demande.trim()}>{occupe === "libre" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Appliquer</button>
                </form>
              </div>
            )}

            {confirmer ? (
              <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-pine-300 bg-pine-50 px-3.5 py-3" role="alertdialog" aria-label="Confirmer l'envoi">
                <p className="min-w-0 flex-1 text-sm text-pine-950">Envoyer ce message à <strong>{b.dest}</strong>{b.cc ? <> (copie : {b.cc})</> : null} depuis votre boîte mail ?</p>
                <button type="button" className={boutonPrincipal} disabled={occupe !== null} onClick={envoyer}>{occupe === "envoyer" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Confirmer l&rsquo;envoi</button>
                <button type="button" className={bouton} disabled={occupe !== null} onClick={() => setConfirmer(false)}>Annuler</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <button type="button" className={boutonPrincipal} disabled={occupe !== null || !b.corps.trim() || !envoiPossible || reperes.length > 0} title={!envoiPossible ? "Serveur d'envoi non configuré : envoyez depuis votre logiciel de messagerie." : reperes.length > 0 ? "Complétez d'abord les repères entre crochets." : undefined} onClick={() => setConfirmer(true)}>
                  <Send className="h-4 w-4" /> Valider et envoyer
                </button>
                <button type="button" className={bouton} disabled={occupe !== null || !modifie || !b.corps.trim()} onClick={() => enregistrer()}>
                  {occupe === "enregistrer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Enregistrer le brouillon
                </button>
                <button type="button" className={`${bouton} hover:border-red-300 hover:text-red-700`} disabled={occupe !== null} onClick={supprimer}><Trash2 className="h-3.5 w-3.5" /> Supprimer</button>
                <span className="text-xs text-neutral-500">Rien ne part sans votre validation.</span>
              </div>
            )}
          </div>
        )}
      </section>
    </article>
  );
}

export { CATEGORIE_LABELS, PRIORITE_LABELS };
export type { Categorie, Priorite };
