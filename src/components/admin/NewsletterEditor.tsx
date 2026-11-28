"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, History, Loader2, Megaphone, Send, X } from "lucide-react";
import { RichText } from "./RichText";

/* Newsletter : on coche les états, on rédige, on prévisualise, on s'envoie un
   essai, puis on confirme l'envoi dans une fenêtre dédiée. L'envoi part par
   lots ; la progression s'affiche et peut être reprise. */

type StatutRow = { key: string; label: string; n: number };
type Progression = { id: number; total: number; envoyes: number; echecs: number; restants: number; termine: boolean; derniereErreur: string | null };
type Campagne = { id: number; created_at: string; created_by: string | null; sujet: string; statuts: string[]; total: number; envoyes: number; echecs: number; restants: number };

const CORPS_DEPART = "<p>Bonjour {prenom},</p><p><br></p>";
const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function NewsletterEditor(props: {
  statuts: StatutRow[];
  exclus: { desinscrits: number; sansEmail: number };
  variables: { cle: string; description: string }[];
  mailConfigured: boolean;
  testTo: string;
  siteUrl: string;
  campagnes: Campagne[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [counting, setCounting] = useState(false);
  const [c, setC] = useState({ sujet: "", corps: CORPS_DEPART, bouton: "", lien: props.siteUrl });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState<{ sujet: string; html: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [checked, setChecked] = useState(false);
  const [prog, setProg] = useState<Progression | null>(null);
  const stop = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);

  const api = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { res, data: await res.json().catch(() => ({})) };
  };

  /* Le nombre de destinataires est toujours compté par le serveur (adresses en double retirées). */
  useEffect(() => {
    if (sel.length === 0) return setTotal(0);
    let alive = true;
    setCounting(true);
    api({ action: "compter", statuts: sel }).then(({ data }) => {
      if (alive) {
        setTotal(data.total ?? 0);
        setCounting(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [sel]);
  useEffect(() => {
    if (confirm) dialog.current?.focus();
  }, [confirm]);

  const toggle = (k: string) => setSel((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  const set = (patch: Partial<typeof c>) => { setC((cur) => ({ ...cur, ...patch })); setPreview(null); setMsg(null); };

  async function act(action: "preview" | "test") {
    setBusy(action);
    setMsg(null);
    const { res, data } = await api({ action, contenu: c }).catch(() => ({ res: null, data: {} as Record<string, string> }));
    setBusy(null);
    if (!res?.ok) return setMsg({ ok: false, text: data.error ?? "Action impossible." });
    if (action === "preview") setPreview({ sujet: data.sujet, html: data.html });
    else setMsg({ ok: true, text: `E-mail d'essai envoyé à ${data.to}.` });
  }

  /* Envoi par lots : on rappelle le serveur tant qu'il reste des destinataires. */
  async function poursuivre(id: number, premier?: Progression) {
    stop.current = false;
    let p = premier ?? null;
    if (p) setProg(p);
    while (!stop.current && (!p || !p.termine)) {
      const { res, data } = await api({ action: "continuer", id }).catch(() => ({ res: null, data: {} as Record<string, unknown> }));
      if (!res?.ok) {
        setMsg({ ok: false, text: (data.error as string) ?? "Envoi interrompu (réseau). Vous pouvez le reprendre ci-dessous, sans doublon." });
        break;
      }
      p = data.progression as Progression;
      setProg(p);
    }
    setBusy(null);
    router.refresh();
  }

  async function envoyer() {
    setBusy("envoyer");
    setMsg(null);
    const { res, data } = await api({ action: "envoyer", statuts: sel, contenu: c, confirmTotal: total }).catch(() => ({ res: null, data: {} as Record<string, unknown> }));
    setConfirm(false);
    if (!res?.ok) {
      setBusy(null);
      if (typeof data.total === "number") setTotal(data.total);
      return setMsg({ ok: false, text: (data.error as string) ?? "Envoi impossible." });
    }
    await poursuivre(data.id as number, data.progression as Progression);
  }

  const pret = sel.length > 0 && total > 0 && c.sujet.trim().length >= 3 && (c.corps.replace(/<[^>]+>/g, "").trim().length >= 20 || c.corps.includes("<img"));
  const enCours = busy === "envoyer" || busy === "reprise";

  return (
    <div className="space-y-6">
      {!props.mailConfigured && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm text-neutral-800">
          L&rsquo;envoi d&rsquo;e-mails n&rsquo;est pas encore branché (RESEND_API_KEY absente dans Vercel) : vous pouvez préparer et prévisualiser, pas envoyer.
        </p>
      )}
      {msg && (
        <p role="status" className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${msg.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>{msg.text}</p>
      )}

      {prog && (
        <section className="rounded-2xl border border-pine-200 bg-white p-5" aria-live="polite">
          <h2 className="text-base font-extrabold text-inkgreen">{prog.termine ? "Envoi terminé" : "Envoi en cours…"}</h2>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-pine-600 transition-all" style={{ width: `${prog.total ? Math.round(((prog.envoyes + prog.echecs) / prog.total) * 100) : 0}%` }} />
          </div>
          <p className="mt-2 text-sm text-neutral-700">
            <strong className="text-inkgreen">{prog.envoyes}</strong> envoyé{prog.envoyes > 1 ? "s" : ""} sur {prog.total}
            {prog.echecs > 0 && <span className="font-semibold text-red-600"> · {prog.echecs} en échec</span>}
            {!prog.termine && ` · ${prog.restants} restant${prog.restants > 1 ? "s" : ""}`}
          </p>
          {prog.echecs > 0 && prog.derniereErreur && <p className="mt-1 text-xs text-red-600">Dernière erreur : {prog.derniereErreur}</p>}
          {!prog.termine && enCours && (
            <button type="button" onClick={() => { stop.current = true; }} className="mt-3 rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-bold text-neutral-600">Mettre en pause</button>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2.5 text-base font-extrabold text-inkgreen"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-700 text-sm font-extrabold tabular-nums text-white">1</span>À qui ?</h2>
        <p className="mt-1 text-xs text-neutral-600">Cochez les états des clients à qui écrire. Le chiffre est le nombre d&rsquo;adresses joignables dans chaque état.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {props.statuts.map((s) => (
            <label key={s.key} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition ${sel.includes(s.key) ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 hover:bg-amber-500/15"} ${s.n === 0 ? "opacity-50" : ""}`}>
              <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={sel.includes(s.key)} onChange={() => toggle(s.key)} />
              <span className="flex-1 font-semibold text-inkgreen">{s.label}</span>
              <span className="text-xs font-bold tabular-nums text-neutral-600">{s.n.toLocaleString("fr-FR")}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-sm font-bold text-inkgreen">
          {sel.length === 0 ? "Aucun état coché." : counting ? "Calcul…" : `${total.toLocaleString("fr-FR")} destinataire${total > 1 ? "s" : ""}.`}
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          Toujours exclus : {props.exclus.desinscrits.toLocaleString("fr-FR")} désinscrit{props.exclus.desinscrits > 1 ? "s" : ""}, {props.exclus.sansEmail.toLocaleString("fr-FR")} sans e-mail valide, et les clients anonymisés.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2.5 text-base font-extrabold text-inkgreen"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-700 text-sm font-extrabold tabular-nums text-white">2</span>Le message</h2>
        <div className="mt-3 grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-neutral-600">Objet de l&rsquo;e-mail</span>
              <input className={`${inputCls} font-semibold`} value={c.sujet} maxLength={150} onChange={(e) => set({ sujet: e.target.value })} />
            </label>
            <div>
              <span className="mb-1 block text-xs font-semibold text-neutral-600">Message</span>
              <RichText initial={CORPS_DEPART} variables={props.variables} onChange={(corps) => set({ corps })} onError={(text) => setMsg({ ok: false, text })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-neutral-600">Texte du bouton (facultatif)</span>
                <input className={inputCls} value={c.bouton} maxLength={40} placeholder="Ex. Découvrir l'offre" onChange={(e) => set({ bouton: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-neutral-600">Lien du bouton</span>
                <input className={inputCls} value={c.lien} maxLength={300} placeholder="https://…" onChange={(e) => set({ lien: e.target.value })} />
              </label>
            </div>
            <p className="text-xs text-neutral-600">L&rsquo;en-tête, la signature et le lien de désinscription sont ajoutés automatiquement.</p>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy !== null} onClick={() => act("preview")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
                {busy === "preview" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                Aperçu
              </button>
              <button type="button" disabled={busy !== null || !props.mailConfigured} title={props.mailConfigured ? `Envoie cet e-mail à ${props.testTo}` : "Envoi d'e-mails non configuré"} onClick={() => act("test")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
                {busy === "test" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                M&rsquo;envoyer un essai
              </button>
            </div>
            {preview ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
                <p className="border-b border-neutral-200 bg-mist px-3 py-2 text-xs text-neutral-600"><span className="font-semibold text-neutral-600">Objet :</span> <strong className="text-inkgreen">{preview.sujet}</strong></p>
                <iframe title="Aperçu de la newsletter" sandbox="" srcDoc={`<body style="margin:0;padding:16px;background:#ffffff;">${preview.html}</body>`} className="h-[28rem] w-full bg-white" />
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">L&rsquo;aperçu montre l&rsquo;e-mail tel qu&rsquo;un client le recevra.</p>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2.5 text-base font-extrabold text-inkgreen"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pine-700 text-sm font-extrabold tabular-nums text-white">3</span>Envoyer</h2>
        <span className="flex-1" />
        <button type="button" disabled={busy !== null || !pret || !props.mailConfigured} onClick={() => { setChecked(false); setConfirm(true); }} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
          {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
          Envoyer à {total.toLocaleString("fr-FR")} destinataire{total > 1 ? "s" : ""}…
        </button>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2.5 text-base font-extrabold text-inkgreen"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700"><History className="h-4 w-4" /></span>Newsletters envoyées</h2>
        {props.campagnes.length === 0 ? (
          <p className="text-sm text-neutral-600">Aucune newsletter envoyée pour l&rsquo;instant.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {props.campagnes.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-inkgreen">{k.sujet}</p>
                  <p className="text-xs text-neutral-600">{dateFmt.format(new Date(k.created_at))} · {k.created_by ?? "—"} · {k.statuts.join(", ")}</p>
                </div>
                <span className="text-xs font-bold tabular-nums text-neutral-600">
                  {k.envoyes} / {k.total} envoyés{k.echecs > 0 && <span className="text-red-600"> · {k.echecs} échec{k.echecs > 1 ? "s" : ""}</span>}
                </span>
                {k.restants > 0 && (
                  <button type="button" disabled={busy !== null} onClick={() => { setBusy("reprise"); poursuivre(k.id); }} className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40">
                    Reprendre ({k.restants} restants)
                  </button>
                )}
                {k.restants === 0 && k.echecs > 0 && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={async () => {
                      if (!window.confirm(`Renvoyer aux ${k.echecs} destinataire(s) en échec ? À ne faire que si vous êtes sûr qu'ils n'ont rien reçu.`)) return;
                      setBusy("reprise");
                      const { res, data } = await api({ action: "relancer_echecs", id: k.id });
                      if (res.ok) await poursuivre(k.id, data.progression as Progression);
                      else { setBusy(null); setMsg({ ok: false, text: data.error ?? "Relance impossible." }); }
                    }}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40"
                  >
                    Renvoyer les échecs
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-pine-950/60 p-4" onClick={() => busy === null && setConfirm(false)}>
          <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="nl-confirm" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-card outline-none" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && busy === null && setConfirm(false)}>
            <div className="flex items-start justify-between gap-3">
              <h2 id="nl-confirm" className="text-lg font-extrabold text-inkgreen">Envoyer cette newsletter ?</h2>
              <button type="button" aria-label="Fermer" onClick={() => setConfirm(false)} className="rounded-lg p-1 text-neutral-600 hover:bg-neutral-100"><X className="h-4 w-4" /></button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-neutral-600">Destinataires</dt><dd className="text-base font-extrabold tabular-nums text-pine-700">{total.toLocaleString("fr-FR")}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-600">États</dt><dd className="text-right font-bold text-inkgreen">{props.statuts.filter((s) => sel.includes(s.key)).map((s) => s.label).join(", ")}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-neutral-600">Objet</dt><dd className="text-right font-bold text-inkgreen">{c.sujet}</dd></div>
            </dl>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Un e-mail envoyé ne peut pas être rattrapé. Vérifiez l&rsquo;aperçu et envoyez-vous un essai avant de confirmer.
            </p>
            <label className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-neutral-800">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pine-700" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span>J&rsquo;ai relu le message et je confirme l&rsquo;envoi à {total.toLocaleString("fr-FR")} destinataire{total > 1 ? "s" : ""}.</span>
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setConfirm(false)} disabled={busy !== null} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600">Annuler</button>
              <button type="button" onClick={envoyer} disabled={busy !== null || !checked} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40">
                {busy === "envoyer" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Confirmer l&rsquo;envoi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
