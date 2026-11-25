"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileUp, Loader2, Paperclip, Trash2 } from "lucide-react";
import { FICHIER_MAX, TYPES_FICHIER, extension, tailleLisible } from "@/lib/admin/fichiers";

/* Fichiers d'une fiche client (plans, photos…) : dépôt par glisser-déposer ou sélection,
   10 Mo maximum par fichier, envoyé par morceaux. */

export type FichierRow = { id: number; name: string; bytes: number; created_by: string | null; created_at: string };
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", year: "numeric" });

export function LeadFiles({ leadId, files, lectureSeule }: { leadId: number; files: FichierRow[]; lectureSeule: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [envoi, setEnvoi] = useState<{ name: string; pct: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<number | null>(null);
  const base = `/api/admin/leads/${leadId}/files`;

  async function envoyer(liste: File[]) {
    setErr(null);
    for (const f of liste) {
      if (!TYPES_FICHIER[extension(f.name)]) { setErr(`« ${f.name} » : type non accepté (${Object.keys(TYPES_FICHIER).join(", ")}).`); continue; }
      if (f.size > FICHIER_MAX) { setErr(`« ${f.name} » dépasse 10 Mo (${tailleLisible(f.size)}).`); continue; }
      if (f.size === 0) { setErr(`« ${f.name} » est vide.`); continue; }
      setEnvoi({ name: f.name, pct: 0 });
      try {
        const init = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, size: f.size }) });
        const d = await init.json().catch(() => ({}));
        if (!init.ok) throw new Error(d.error ?? "Envoi refusé.");
        for (let i = 0; i < d.morceaux; i++) {
          const res = await fetch(`${base}/${d.fileId}?i=${i}`, { method: "PUT", headers: { "Content-Type": "application/octet-stream" }, body: f.slice(i * d.morceau, (i + 1) * d.morceau) });
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Envoi interrompu.");
          setEnvoi({ name: f.name, pct: Math.round(((i + 1) / d.morceaux) * 100) });
        }
        const fin = await fetch(`${base}/${d.fileId}`, { method: "POST" });
        if (!fin.ok) throw new Error((await fin.json().catch(() => ({}))).error ?? "Envoi incomplet.");
      } catch (e) {
        setErr(`« ${f.name} » : ${e instanceof Error ? e.message : "envoi impossible"}`);
      }
    }
    setEnvoi(null);
    router.refresh();
  }

  async function supprimer(id: number) {
    const res = await fetch(`${base}/${id}`, { method: "DELETE" });
    if (!res.ok) setErr((await res.json().catch(() => ({}))).error ?? "Suppression impossible.");
    setASupprimer(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
        <Paperclip className="h-3.5 w-3.5" />
        Fichiers {files.length > 0 && <span className="text-inkgreen">{files.length}</span>}
      </h2>
      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-neutral-100">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
              <a href={`${base}/${f.id}`} className="flex min-w-0 flex-1 items-center gap-2 text-sm font-bold text-inkgreen hover:text-pine-700">
                <Download className="h-3.5 w-3.5 shrink-0 text-pine-600" />
                <span className="truncate">{f.name}</span>
              </a>
              <span className="text-xs text-neutral-400">{tailleLisible(f.bytes)} · {dateFmt.format(new Date(f.created_at))}{f.created_by ? ` · ${f.created_by}` : ""}</span>
              {!lectureSeule &&
                (aSupprimer === f.id ? (
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => supprimer(f.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white">Supprimer</button>
                    <button type="button" onClick={() => setASupprimer(null)} className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-bold text-neutral-600">Annuler</button>
                  </span>
                ) : (
                  <button type="button" aria-label={`Supprimer ${f.name}`} onClick={() => setASupprimer(f.id)} className="rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                ))}
            </li>
          ))}
        </ul>
      )}
      {files.length === 0 && lectureSeule && <p className="mt-3 text-sm text-neutral-400">Aucun fichier.</p>}
      {!lectureSeule && (
        <>
          <button
            type="button"
            disabled={envoi !== null}
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const l = Array.from(e.dataTransfer.files); if (l.length) envoyer(l); }}
            className={`mt-3 flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm transition ${drag ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 hover:border-pine-300 hover:bg-mist"}`}
          >
            {envoi ? <Loader2 className="h-5 w-5 animate-spin text-pine-600" /> : <FileUp className="h-5 w-5 text-pine-600" />}
            <span className="font-bold text-inkgreen">{envoi ? `Envoi de ${envoi.name}… ${envoi.pct} %` : "Déposer un plan ou une photo, ou cliquer pour choisir"}</span>
            <span className="text-xs text-neutral-400">PDF, images, DWG, DXF, Word, Excel · 10 Mo maximum par fichier</span>
          </button>
          <input ref={input} type="file" multiple hidden accept={Object.keys(TYPES_FICHIER).map((e) => `.${e}`).join(",")} onChange={(e) => { const l = Array.from(e.target.files ?? []); e.target.value = ""; if (l.length) envoyer(l); }} />
        </>
      )}
      {err && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
    </section>
  );
}
