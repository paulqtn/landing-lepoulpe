"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FilePlus2, Loader2, MailCheck, Save, Send, Trash2 } from "lucide-react";
import { toast } from "../Toasts";
import { appel, bouton, boutonPrincipal, champ, etiquette, ilYA, type BrouillonVue } from "./commun";

/* Nouveau message, écrit de zéro. Le brouillon est enregistré dans le dossier Brouillons de la
   boîte mail (il se retrouve donc dans Outlook, le webmail et le téléphone) ; l'envoi demande
   une confirmation, comme pour une réponse. */

type EnCours = BrouillonVue & { modifieLe: string };
type Saisie = { id?: number; dest: string; cc: string; sujet: string; corps: string };

export function Nouveau({ destinataire, envoiPossible, onFermer }: { destinataire?: string; envoiPossible: boolean; onFermer: () => void }) {
  const [b, setB] = useState<Saisie>({ dest: destinataire ?? "", cc: "", sujet: "", corps: "" });
  const [enCours, setEnCours] = useState<EnCours[]>([]);
  const [modifie, setModifie] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [occupe, setOccupe] = useState<string | null>(null);
  const [confirmer, setConfirmer] = useState(false);

  useEffect(() => {
    void appel<{ brouillons: EnCours[]; signature: string }>("/brouillons").then((r) => {
      if (!r.ok) return;
      setEnCours(r.brouillons);
      // La signature du commercial est posée d'office sous un message vierge.
      if (r.signature.trim()) setB((x) => (x.corps || x.id ? x : { ...x, corps: `\n\n${r.signature.trim()}` }));
    });
  }, []);

  const maj = (p: Partial<Saisie>) => { setB((x) => ({ ...x, ...p })); setModifie(true); setEnregistre(false); setConfirmer(false); };
  const reperes = b.corps.match(/\[[^\]\n]{2,80}\]/g) ?? [];
  const destOk = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/.test(b.dest);

  async function enregistrer(silencieux = false): Promise<number | null> {
    setOccupe("enregistrer");
    const r = await appel<{ brouillon: BrouillonVue }>("/brouillons", { body: { id: b.id, messageId: null, dest: b.dest, cc: b.cc, sujet: b.sujet, corps: b.corps } });
    setOccupe(null);
    if (!r.ok) { toast(r.error, true); return null; }
    setB({ id: r.brouillon.id, dest: r.brouillon.dest, cc: r.brouillon.cc, sujet: r.brouillon.sujet, corps: r.brouillon.corps });
    setModifie(false);
    setEnregistre(true);
    setEnCours((l) => l.filter((x) => x.id !== r.brouillon.id));
    if (!silencieux) toast("Brouillon enregistré dans votre boîte mail.");
    return r.brouillon.id;
  }

  async function envoyer() {
    const id = modifie || !b.id ? await enregistrer(true) : b.id;
    if (!id) return;
    setOccupe("envoyer");
    const r = await appel(`/brouillons/${id}/envoyer`, { body: { confirme: true } });
    setOccupe(null);
    setConfirmer(false);
    if (!r.ok) return toast(r.error, true);
    toast("Message envoyé.");
    onFermer();
  }

  async function supprimer(id?: number) {
    if (id) {
      setOccupe("supprimer");
      const r = await appel(`/brouillons/${id}`, { method: "DELETE" });
      setOccupe(null);
      if (!r.ok) return toast(r.error, true);
      setEnCours((l) => l.filter((x) => x.id !== id));
      toast("Brouillon supprimé.");
    }
    if (!id || id === b.id) onFermer();
  }

  return (
    <article className="space-y-4">
      <section className="rounded-2xl border border-pine-200 bg-white p-4 sm:p-5">
        <button type="button" onClick={onFermer} className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700 lg:hidden"><ArrowLeft className="h-4 w-4" /> Retour à la liste</button>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-inkgreen"><FilePlus2 className="h-5 w-5 text-pine-600" /> Nouveau message</h2>
          {enregistre && !modifie && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700"><MailCheck className="h-3.5 w-3.5" /> Dans les brouillons de votre boîte mail</span>}
          {modifie && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800">Modifications non enregistrées</span>}
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={etiquette}>Destinataire</span><input id="nv-dest" type="text" inputMode="email" autoComplete="off" className={champ} value={b.dest} onChange={(e) => maj({ dest: e.target.value })} placeholder="client@exemple.fr" /></label>
            <label className="block"><span className={etiquette}>Copie (facultatif)</span><input id="nv-cc" type="text" autoComplete="off" className={champ} value={b.cc} onChange={(e) => maj({ cc: e.target.value })} /></label>
          </div>
          <label className="block"><span className={etiquette}>Objet</span><input id="nv-sujet" className={champ} value={b.sujet} onChange={(e) => maj({ sujet: e.target.value })} /></label>
          <label className="block">
            <span className={etiquette}>Votre message</span>
            <textarea id="nv-corps" rows={Math.min(24, Math.max(10, b.corps.split("\n").length + 2))} className={`${champ} leading-relaxed`} value={b.corps} onChange={(e) => maj({ corps: e.target.value })} />
          </label>
          {reperes.length > 0 && <p className="text-xs font-semibold text-amber-800">Repères à compléter avant l&rsquo;envoi : {reperes.join(" · ")}</p>}

          {confirmer ? (
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-pine-300 bg-pine-50 px-3.5 py-3" role="alertdialog" aria-label="Confirmer l'envoi">
              <p className="min-w-0 flex-1 text-sm text-pine-950">Envoyer ce message à <strong>{b.dest}</strong>{b.cc ? <> (copie : {b.cc})</> : null} depuis votre boîte mail ?</p>
              <button type="button" className={boutonPrincipal} disabled={occupe !== null} onClick={envoyer}>{occupe === "envoyer" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Confirmer l&rsquo;envoi</button>
              <button type="button" className={bouton} disabled={occupe !== null} onClick={() => setConfirmer(false)}>Annuler</button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" className={boutonPrincipal} disabled={occupe !== null || !destOk || !b.sujet.trim() || !b.corps.trim() || !envoiPossible || reperes.length > 0} title={!envoiPossible ? "Serveur d'envoi non configuré : envoyez depuis votre logiciel de messagerie." : !destOk ? "Indiquez l'adresse du destinataire." : !b.sujet.trim() ? "Indiquez un objet." : undefined} onClick={() => setConfirmer(true)}>
                <Send className="h-4 w-4" /> Valider et envoyer
              </button>
              <button type="button" className={bouton} disabled={occupe !== null || !modifie} onClick={() => enregistrer()}>
                {occupe === "enregistrer" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Enregistrer le brouillon
              </button>
              <button type="button" className={`${bouton} hover:border-red-300 hover:text-red-700`} disabled={occupe !== null} onClick={() => supprimer(b.id)}><Trash2 className="h-3.5 w-3.5" /> {b.id ? "Supprimer" : "Abandonner"}</button>
              <span className="text-xs text-neutral-500">Rien ne part sans votre validation.</span>
            </div>
          )}
        </div>
      </section>

      {enCours.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
          <h3 className="text-sm font-extrabold text-inkgreen">Nouveaux messages déjà commencés</h3>
          <ul className="mt-2 divide-y divide-neutral-100">
            {enCours.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => { setB({ id: x.id, dest: x.dest, cc: x.cc, sujet: x.sujet, corps: x.corps }); setModifie(false); setEnregistre(true); setConfirmer(false); }}>
                  <span className="block truncate font-bold text-inkgreen">{x.sujet || "(sans objet)"}</span>
                  <span className="block truncate text-xs text-neutral-600">À {x.dest || "destinataire à préciser"} · modifié {ilYA(x.modifieLe)}</span>
                </button>
                <button type="button" aria-label={`Supprimer le brouillon ${x.sujet || "sans objet"}`} className="rounded-full p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600" disabled={occupe !== null} onClick={() => supprimer(x.id)}><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
