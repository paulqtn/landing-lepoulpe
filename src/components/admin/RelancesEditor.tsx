"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Eye, Loader2, Mail, Send } from "lucide-react";

/* Éditeur de la séquence de relances : 3 e-mails, leurs délais, un aperçu
   fidèle et un envoi d'essai. Rien ne change tant qu'on n'a pas enregistré. */

type RMail = { sujet: string; corps: string; bouton: string };
type Value = { active: boolean; delais: number[]; heures: number[]; mails: RMail[] };

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
const DELAI_LABELS = ["après l'envoi du devis", "après la relance 1", "après la relance 2"];

export function RelancesEditor({ initial, variables, mailConfigured, testTo, horaire, heureQuotidienne }: { initial: Value; variables: { cle: string; description: string }[]; mailConfigured: boolean; testTo: string; horaire: boolean; heureQuotidienne: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<{ active: boolean; delais: string[]; heures: number[]; mails: RMail[] }>({ active: initial.active, delais: initial.delais.map(String), heures: [...initial.heures], mails: initial.mails.map((m) => ({ ...m })) });
  const [tab, setTab] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState<{ sujet: string; html: string } | null>(null);

  const touch = () => { setDirty(true); setMsg(null); setPreview(null); };
  const setMail = (patch: Partial<RMail>) => { setV((x) => ({ ...x, mails: x.mails.map((m, i) => (i === tab ? { ...m, ...patch } : m)) })); touch(); };
  const payload = () => ({ active: v.active, delais: v.delais.map((d) => Number(d.trim())), heures: v.heures, mails: v.mails });
  const cumul = v.delais.reduce<number[]>((acc, d, i) => [...acc, (acc[i - 1] ?? 0) + (Number(d) || 0)], []);

  async function call(action: "save" | "preview" | "test") {
    setBusy(action);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/relances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, index: tab, value: payload() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ ok: false, text: data.error ?? "Action impossible." });
      if (action === "preview") setPreview({ sujet: data.sujet, html: data.html });
      if (action === "test") setMsg({ ok: true, text: `E-mail d'essai de la relance ${tab + 1} envoyé à ${data.to}.` });
      if (action === "save") {
        setDirty(false);
        setMsg({ ok: true, text: "Séquence enregistrée. Elle s'applique aux prochaines relances, sous une minute." });
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
    } finally {
      setBusy(null);
    }
  }

  const m = v.mails[tab];
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-extrabold text-inkgreen">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700"><Mail className="h-4 w-4" /></span>
          Séquence de relances
        </h2>
        <label className="flex items-center gap-2 text-sm font-semibold text-inkgreen">
          <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={v.active} onChange={(e) => { setV({ ...v, active: e.target.checked }); touch(); }} />
          Envoi automatique activé
        </label>
      </div>
      {!mailConfigured && (
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-neutral-800">
          Aucun e-mail ne part pour l&rsquo;instant : l&rsquo;envoi n&rsquo;est pas encore branché (RESEND_API_KEY absente dans Vercel). Vous pouvez préparer les textes et les délais dès maintenant.
        </p>
      )}

      <h3 className="mt-5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
        <Clock className="h-3.5 w-3.5" />
        Délais et heures d&rsquo;envoi
      </h3>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {v.delais.map((d, i) => (
          <label key={i} className="block rounded-xl bg-mist p-3">
            <span className="block text-xs font-bold text-inkgreen">Relance {i + 1}</span>
            <span className="mt-1.5 flex items-center gap-2">
              <input aria-label={`Délai de la relance ${i + 1} en jours`} inputMode="numeric" className={`${inputCls} !w-16 text-right font-bold tabular-nums`} value={d} onChange={(e) => { setV({ ...v, delais: v.delais.map((x, k) => (k === i ? e.target.value : x)) }); touch(); }} />
              <span className="text-xs text-neutral-600">jour{Number(d) > 1 ? "s" : ""} {DELAI_LABELS[i]}</span>
            </span>
            <span className="mt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-600">envoi à</span>
              <select aria-label={`Heure d'envoi de la relance ${i + 1}`} className={`${inputCls} !w-24 font-bold`} value={v.heures[i]} onChange={(e) => { setV({ ...v, heures: v.heures.map((x, k) => (k === i ? Number(e.target.value) : x)) }); touch(); }}>
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h} h 00</option>)}
              </select>
            </span>
            <span className="mt-1 block text-[11px] text-neutral-600">soit J+{cumul[i]} après le devis, à {v.heures[i]} h (heure de Paris)</span>
          </label>
        ))}
      </div>

      {!horaire && (
        <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
          Pour l&rsquo;instant, la tâche d&rsquo;envoi ne passe qu&rsquo;une fois par jour{heureQuotidienne ? `, vers ${heureQuotidienne}` : ""} (limite de l&rsquo;offre gratuite de Vercel) : les relances partent le bon jour, mais à ce passage, pas à l&rsquo;heure choisie. Les heures seront respectées dès que la tâche passera en horaire (offre Pro).
        </p>
      )}

      <div role="tablist" className="mt-6 flex flex-wrap gap-1.5">
        {v.mails.map((_, i) => (
          <button key={i} role="tab" type="button" aria-selected={tab === i} onClick={() => { setTab(i); setPreview(null); }} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${tab === i ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"}`}>
            Relance {i + 1} · J+{cumul[i]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Objet de l&rsquo;e-mail</span>
            <input className={`${inputCls} font-semibold`} value={m.sujet} maxLength={150} onChange={(e) => setMail({ sujet: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Texte</span>
            <textarea className={inputCls} rows={11} value={m.corps} maxLength={4000} onChange={(e) => setMail({ corps: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Texte du bouton (lien vers le devis du client) — vide pour ne pas en mettre</span>
            <input className={inputCls} value={m.bouton} maxLength={40} onChange={(e) => setMail({ bouton: e.target.value })} />
          </label>
          <p className="text-xs text-neutral-600">
            Variables remplacées à l&rsquo;envoi :{" "}
            {variables.map((x, i) => (
              <span key={x.cle}>
                <button type="button" title={`Insérer ${x.cle} à la fin du texte`} onClick={() => setMail({ corps: `${m.corps}${x.cle}` })} className="rounded bg-mist px-1.5 py-0.5 font-mono text-[11px] font-bold text-pine-700 hover:bg-amber-500/15">{x.cle}</button> {x.description}{i < variables.length - 1 ? " · " : "."}
              </span>
            ))}
          </p>
          <p className="text-xs text-neutral-600">Une ligne vide sépare deux paragraphes. L&rsquo;en-tête, la signature avec votre téléphone et la mention de désinscription sont ajoutés automatiquement.</p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy !== null} onClick={() => call("preview")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
              {busy === "preview" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
              Aperçu de la relance {tab + 1}
            </button>
            <button type="button" disabled={busy !== null || !mailConfigured} title={mailConfigured ? `Envoie cette relance à ${testTo}` : "Envoi d'e-mails non configuré"} onClick={() => call("test")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
              {busy === "test" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              M&rsquo;envoyer un essai
            </button>
          </div>
          {preview ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
              <p className="border-b border-neutral-200 bg-mist px-3 py-2 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-600">Objet :</span> <strong className="text-inkgreen">{preview.sujet}</strong>
              </p>
              <iframe title={`Aperçu de la relance ${tab + 1}`} sandbox="" srcDoc={`<body style="margin:0;padding:16px;background:#ffffff;">${preview.html}</body>`} className="h-[26rem] w-full bg-white" />
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">L&rsquo;aperçu montre l&rsquo;e-mail tel que le client le recevra, avec un client et un montant d&rsquo;exemple.</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-4">
        <button type="button" disabled={busy !== null || !dirty} onClick={() => call("save")} className="flex items-center gap-2 rounded-full bg-pine-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
          {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer la séquence
        </button>
        {dirty && <span className="text-xs font-semibold text-amber-700">Modifications non enregistrées.</span>}
        {msg && <span role="status" className={`text-sm font-semibold ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </section>
  );
}
