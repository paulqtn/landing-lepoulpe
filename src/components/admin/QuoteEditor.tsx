"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Copy, Download, Eye, Loader2, Plus, Send, Trash2, X } from "lucide-react";

/* Éditeur de devis : propositions côte à côte, lignes modifiables.
   Les totaux affichés sont indicatifs ; le serveur les recalcule à
   l'enregistrement et à l'envoi. */

type Line = { description: string; qty: string; unitPriceHt: string; vatRate: number };
type Option = { label: string; title: string; lines: Line[] };
type Client = { name: string; email: string; phone: string; address: string };

const VAT = [0.2, 0.1, 0.055, 0];
const n = (s: string) => Number(String(s).trim().replace(/\s/g, "").replace(",", "."));
const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
const eur = (x: number) => `${x.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

function totals(o: Option) {
  const by = new Map<number, number>();
  for (const l of o.lines) by.set(l.vatRate, r2((by.get(l.vatRate) ?? 0) + r2((n(l.qty) || 0) * (n(l.unitPriceHt) || 0))));
  const ht = r2([...by.values()].reduce((s, v) => s + v, 0));
  const tva = r2([...by.entries()].reduce((s, [rate, base]) => s + r2(base * rate), 0));
  return { ht, tva, ttc: r2(ht + tva) };
}

export function QuoteEditor(props: {
  id: number;
  quoteRef: string;
  statut: "brouillon" | "envoye" | "annule";
  client: Client;
  options: { label: string; title: string; lines: { description: string; qty: number; unitPriceHt: number; vatRate: number }[] }[];
  sentInfo: string | null;
  blockers: string[];
}) {
  const router = useRouter();
  const editable = props.statut === "brouillon";
  const [client, setClient] = useState<Client>(props.client);
  const [options, setOptions] = useState<Option[]>(
    props.options.map((o) => ({ ...o, lines: o.lines.map((l) => ({ ...l, qty: String(l.qty).replace(".", ","), unitPriceHt: String(l.unitPriceHt).replace(".", ",") })) })),
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [checked, setChecked] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  const touch = () => { setDirty(true); setMsg(null); };
  const setOpt = (i: number, patch: Partial<Option>) => { setOptions((os) => os.map((o, k) => (k === i ? { ...o, ...patch } : o))); touch(); };
  const setLine = (i: number, j: number, patch: Partial<Line>) =>
    setOpt(i, { lines: options[i].lines.map((l, k) => (k === j ? { ...l, ...patch } : l)) });
  const all = useMemo(() => options.map(totals), [options]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (confirm) dialog.current?.focus();
  }, [confirm]);

  const payload = () => ({
    client,
    options: options.map((o) => ({ ...o, lines: o.lines.map((l) => ({ description: l.description, qty: n(l.qty), unitPriceHt: n(l.unitPriceHt), vatRate: l.vatRate })) })),
  });

  async function save(): Promise<boolean> {
    setBusy("save");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/quotes/${props.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: data.error ?? "Enregistrement impossible." });
        return false;
      }
      setDirty(false);
      setMsg({ ok: true, text: "Brouillon enregistré." });
      router.refresh();
      return true;
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function openPdf(preview: boolean) {
    if (editable && dirty && !(await save())) return;
    window.open(`/api/admin/quotes/${props.id}/pdf${preview ? "?apercu" : ""}`, "_blank", "noopener");
  }

  async function askSend() {
    if (dirty && !(await save())) return;
    setChecked(false);
    setConfirm(true);
  }

  async function send() {
    setBusy("send");
    try {
      const res = await fetch(`/api/admin/quotes/${props.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmRef: props.quoteRef, confirmEmail: client.email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      setConfirm(false);
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "Envoi impossible." });
      else {
        setMsg({ ok: true, text: `Devis ${props.quoteRef} envoyé à ${client.email}.` });
        router.refresh();
      }
    } catch {
      setConfirm(false);
      setMsg({ ok: false, text: "Erreur réseau — le devis n'est pas parti." });
    } finally {
      setBusy(null);
    }
  }

  async function duplicate() {
    setBusy("dup");
    const res = await fetch(`/api/admin/quotes/${props.id}`, { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(null);
    if (res?.ok) router.push(`/commercial/devis/${data.id}`);
    else setMsg({ ok: false, text: data.error ?? "Copie impossible." });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email.trim());
  const blockers = [...props.blockers, ...(emailOk ? [] : ["L'adresse e-mail du client est manquante ou invalide."])];

  return (
    <div className="space-y-5">
      {msg && (
        <p role="status" className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${msg.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}
      {!editable && (
        <p className="flex flex-wrap items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-900">
          <span className="flex-1">{props.sentInfo ?? "Ce devis n'est plus modifiable."} Son contenu est figé.</span>
          <button type="button" disabled={busy !== null} onClick={duplicate} className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-white px-3.5 py-1.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100 disabled:opacity-40">
            <Copy className="h-3.5 w-3.5" />
            Créer une nouvelle version
          </button>
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Client</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["name", "Nom"],
              ["email", "E-mail"],
              ["phone", "Téléphone"],
              ["address", "Adresse"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span>
              <input className={inputCls} disabled={!editable} value={client[k]} onChange={(e) => { setClient({ ...client, [k]: e.target.value }); touch(); }} />
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Propositions de devis <span className="ml-1 text-inkgreen">{options.length}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {editable && options.length < 6 && (
            <button
              type="button"
              onClick={() => { setOptions([...options, { label: `Alternative ${options.length}`, title: options[0]?.title ?? "Proposition", lines: (options[0]?.lines ?? []).map((l) => ({ ...l })) }]); touch(); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une proposition
            </button>
          )}
          <button type="button" onClick={() => openPdf(true)} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
            <Eye className="h-3.5 w-3.5" />
            Aperçu PDF
          </button>
          <button type="button" onClick={() => openPdf(false)} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
            <Download className="h-3.5 w-3.5" />
            Télécharger le PDF
          </button>
          {editable && (
            <>
              <button type="button" onClick={save} disabled={busy !== null || !dirty} className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
                {busy === "save" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enregistrer
              </button>
              <button type="button" onClick={askSend} disabled={busy !== null} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
                <Send className="h-3.5 w-3.5" />
                Valider et envoyer{options.length > 1 ? ` les ${options.length} propositions` : " le devis"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${options.length === 1 ? "" : options.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
        {options.map((o, i) => (
          <section key={i} className="rounded-2xl border border-neutral-200 bg-white">
            <header className="space-y-2 border-b border-neutral-100 p-4">
              <div className="flex items-center gap-2">
                <input aria-label="Étiquette de la proposition" className="min-w-0 flex-1 border-b border-dashed border-neutral-300 bg-transparent font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pine-700 outline-none focus:border-pine-600" disabled={!editable} value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} />
                {editable && options.length > 1 && (
                  <button type="button" aria-label={`Supprimer la proposition ${i + 1}`} onClick={() => { if (window.confirm(`Supprimer la proposition « ${o.label || o.title} » ?`)) { setOptions(options.filter((_, k) => k !== i)); touch(); } }} className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input aria-label="Titre de la proposition" className={`${inputCls} font-bold`} disabled={!editable} value={o.title} onChange={(e) => setOpt(i, { title: e.target.value })} />
            </header>

            <div className="space-y-3 p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Lignes du devis</p>
              {o.lines.map((l, j) => (
                <div key={j} className="rounded-xl bg-mist p-3">
                  <textarea aria-label={`Désignation de la ligne ${j + 1}`} className={inputCls} disabled={!editable} rows={Math.min(9, Math.max(3, l.description.split("\n").length + 1))} value={l.description} onChange={(e) => setLine(i, j, { description: e.target.value })} />
                  {editable && <p className="mt-1 text-[11px] text-neutral-400">Astuce : retour à la ligne pour ajouter un sous-élément (rendu en tiret dans le PDF).</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input aria-label="Quantité" inputMode="decimal" className={`${inputCls} !w-16 text-right tabular-nums`} disabled={!editable} value={l.qty} onChange={(e) => setLine(i, j, { qty: e.target.value })} />
                    <span className="text-xs text-neutral-400">×</span>
                    <input aria-label="Prix unitaire HT" inputMode="decimal" className={`${inputCls} !w-24 text-right tabular-nums`} disabled={!editable} value={l.unitPriceHt} onChange={(e) => setLine(i, j, { unitPriceHt: e.target.value })} />
                    <span className="text-xs font-semibold text-neutral-400">€ HT</span>
                    <select aria-label="TVA" className={`${inputCls} !w-[7.25rem]`} disabled={!editable} value={l.vatRate} onChange={(e) => setLine(i, j, { vatRate: Number(e.target.value) })}>
                      {VAT.map((v) => <option key={v} value={v}>TVA {String(v * 100).replace(".", ",")} %</option>)}
                    </select>
                    <span className="flex-1" />
                    {editable && o.lines.length > 1 && (
                      <button type="button" aria-label={`Supprimer la ligne ${j + 1}`} onClick={() => setOpt(i, { lines: o.lines.filter((_, k) => k !== j) })} className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {editable && (
                <button type="button" onClick={() => setOpt(i, { lines: [...o.lines, { description: "", qty: "1", unitPriceHt: "0", vatRate: 0.2 }] })} className="flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-amber-500/15">
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter une ligne
                </button>
              )}
            </div>

            <footer className="space-y-1 border-t border-neutral-100 p-4 text-sm">
              <div className="flex justify-between text-neutral-500"><span>Total HT</span><span className="tabular-nums">{eur(all[i].ht)}</span></div>
              <div className="flex justify-between text-neutral-500"><span>TVA</span><span className="tabular-nums">{eur(all[i].tva)}</span></div>
              <div className="flex justify-between text-base font-extrabold text-inkgreen"><span>Total TTC</span><span className="tabular-nums text-pine-700">{eur(all[i].ttc)}</span></div>
            </footer>
          </section>
        ))}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-pine-950/60 p-4" onClick={() => busy === null && setConfirm(false)}>
          <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-card outline-none" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && busy === null && setConfirm(false)}>
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-title" className="text-lg font-extrabold text-inkgreen">Envoyer le devis {props.quoteRef} ?</h2>
              <button type="button" aria-label="Fermer" onClick={() => setConfirm(false)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-neutral-500">Destinataire</dt><dd className="font-bold text-inkgreen">{client.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-500">Adresse e-mail</dt><dd className="break-all font-bold text-inkgreen">{client.email || "—"}</dd></div>
              {options.map((o, i) => (
                <div key={i} className="flex justify-between gap-3 border-t border-neutral-100 pt-2">
                  <dt className="text-neutral-500">{o.label || `Proposition ${i + 1}`} — {o.lines.length} ligne{o.lines.length > 1 ? "s" : ""}</dt>
                  <dd className="font-bold tabular-nums text-pine-700">{eur(all[i].ttc)} TTC</dd>
                </div>
              ))}
            </dl>
            {blockers.length > 0 ? (
              <ul className="mt-4 space-y-1.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {blockers.map((b) => (
                  <li key={b} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{b}</li>
                ))}
              </ul>
            ) : (
              <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-neutral-800">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pine-700" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <span>J&rsquo;ai relu le devis (aperçu PDF) et l&rsquo;adresse du destinataire. L&rsquo;e-mail part immédiatement, PDF en pièce jointe, et le devis ne sera plus modifiable.</span>
              </label>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => openPdf(true)} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-pine-300">Aperçu PDF</button>
              <button type="button" onClick={() => setConfirm(false)} disabled={busy !== null} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600">Annuler</button>
              <button type="button" onClick={send} disabled={busy !== null || !checked || blockers.length > 0} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
                {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Confirmer l&rsquo;envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Bouton « Préparer le devis » : ouvre le brouillon de la demande, en le générant au besoin. */
export function PrepareQuoteButton({ leadId, label = "Préparer le devis", className }: { leadId: number; label?: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId }) }).catch(() => null);
        const data = res ? await res.json().catch(() => ({})) : {};
        if (res?.ok) router.push(`/commercial/devis/${data.id}`);
        else {
          setBusy(false);
          window.alert(data.error ?? "Impossible de préparer le devis.");
        }
      }}
      className={className ?? "inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
