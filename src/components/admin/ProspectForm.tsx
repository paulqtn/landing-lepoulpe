"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

/* Création d'une fiche prospect à la main : trois champs suffisent (nom + un moyen de le
   joindre). Le projet est facultatif ; s'il est complet, le devis est préparé tout de suite. */

const inputCls = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
const ORIGINES = [["appel", "Appel direct"], ["recommandation", "Recommandation"], ["salon", "Salon ou événement"], ["passage", "Passage au dépôt"], ["autre", "Autre"]];
const LIEUX = [["", "À préciser"], ["terrasse", "Terrasse"], ["balcon", "Balcon"], ["escalier", "Escalier"], ["piscine", "Piscine"], ["mezzanine", "Mezzanine"], ["fenetre", "Fenêtre"], ["interieur", "Intérieur"], ["exterieur", "Extérieur"]];
const SYSTEMES = [["", "À préciser"], ["rail", "Rail"], ["pinces", "Pinces"], ["spider", "Fixations ponctuelles (spider)"], ["conseil", "À conseiller"]];
const TEINTES = [["", "À préciser"], ["clair", "Clair"], ["extra-clair", "Extra clair"], ["fume-1f", "Fumé une face"], ["fume-2f", "Fumé deux faces"]];

export function ProspectForm() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", origine: "appel", lieu: "", systeme: "", cotes: "", hauteur: "", teinte: "", codePostal: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [doublon, setDoublon] = useState<{ id: number; name: string; forcable?: boolean } | null>(null);
  const set = (patch: Partial<typeof f>) => { setF({ ...f, ...patch }); setErr(null); setDoublon(null); };
  const select = (k: keyof typeof f, label: string, opts: string[][]) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span>
      <select className={inputCls} value={f[k]} onChange={(e) => set({ [k]: e.target.value })}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  );

  async function creer(forcer = false) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, forcer, cotes: f.cotes.split(/[+;]/).map((x) => Number(x.trim().replace(",", "."))).filter((x) => Number.isFinite(x) && x > 0) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return router.push(`/commercial/clients/${data.id}`);
      setErr(data.error ?? "Création impossible.");
      setDoublon(data.doublon ?? null);
    } catch {
      setErr("Erreur réseau.");
    }
    setBusy(false);
  }

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); creer(); }}>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Le prospect</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">Nom ou société</span><input required autoFocus className={inputCls} value={f.name} onChange={(e) => set({ name: e.target.value })} /></label>
          {select("origine", "Origine du contact", ORIGINES)}
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">Téléphone</span><input type="tel" className={inputCls} value={f.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">E-mail</span><input type="email" className={inputCls} value={f.email} onChange={(e) => set({ email: e.target.value })} /></label>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Un téléphone ou un e-mail suffit. Sans e-mail, aucun devis ne pourra lui être envoyé tant qu&rsquo;il n&rsquo;est pas ajouté.</p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Son projet (facultatif)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {select("lieu", "Type de projet", LIEUX)}
          {select("systeme", "Fixation", SYSTEMES)}
          {select("teinte", "Teinte du verre", TEINTES)}
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">Longueurs en mètres (un « + » entre deux tronçons)</span><input className={inputCls} placeholder="5,2 + 3,1" value={f.cotes} onChange={(e) => set({ cotes: e.target.value })} /></label>
          {select("hauteur", "Hauteur finie", [["", "À préciser"], ["90", "90 cm"], ["100", "100 cm"], ["110", "110 cm"]])}
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-500">Code postal du projet</span><input className={inputCls} inputMode="numeric" maxLength={5} value={f.codePostal} onChange={(e) => set({ codePostal: e.target.value.replace(/\D/g, "") })} /></label>
        </div>
        <p className="mt-2 text-xs text-neutral-400">Avec la fixation, les longueurs et la hauteur, le projet est chiffré et son brouillon de devis est prêt à l&rsquo;ouverture de la fiche.</p>
        <label className="mt-3 block"><span className="mb-1 block text-xs font-semibold text-neutral-500">Note de l&rsquo;appel</span><textarea rows={3} className={inputCls} placeholder="Contexte, besoin, échéance, prochain rappel…" value={f.note} onChange={(e) => set({ note: e.target.value })} /></label>
      </section>

      {err && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
          {doublon && (
            <span className="mt-2 flex flex-wrap gap-2">
              <Link href={`/commercial/clients/${doublon.id}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-inkgreen ring-1 ring-red-200">Ouvrir la fiche existante</Link>
              {doublon.forcable && <button type="button" disabled={busy} onClick={() => creer(true)} className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">Créer quand même une nouvelle fiche</button>}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Créer la fiche
        </button>
        <Link href="/commercial/clients" className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-600">Annuler</Link>
      </div>
    </form>
  );
}
