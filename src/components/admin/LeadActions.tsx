"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, CalendarClock, Gauge, Loader2, MailX, Pause, PhoneCall, Play, Send, StickyNote, Trash2, UserPen } from "lucide-react";
import { NIVEAUX } from "@/lib/admin/niveaux";
import { MOTIFS_PERTE, statutAutomatique } from "@/lib/admin/cloture";
import { STATUT_AIDE, STATUT_LABELS, STATUTS, sequenceActive, type Statut } from "@/lib/admin/statuts";

/* Panneau d'actions commercial sur une fiche lead. */

export function LeadActions({
  leadId,
  statut,
  relances,
  nextRelanceAt,
  hasEstimation,
  team,
  assignedTo,
  rappelAt = null,
  devisEnvoye = false,
  niveau = null,
  pauseAt = null,
  contact,
  devisRetenu = null,
  admin = false,
}: {
  leadId: number;
  statut: Statut;
  relances: number;
  nextRelanceAt: string | null;
  hasEstimation: boolean;
  team: string[];
  assignedTo: string | null;
  /** Rappel téléphonique convenu avec le client. */
  rappelAt?: string | null;
  /** Un devis (ou l'e-mail d'estimation) est déjà parti chez le client. */
  devisEnvoye?: boolean;
  /** Score du prospect (1 à 5), posé par le commercial. */
  niveau?: number | null;
  /** Relances automatiques en pause depuis cette date. */
  pauseAt?: string | null;
  /** Coordonnées actuelles du client, modifiables depuis la fiche. */
  contact?: { name: string; email: string; phone: string };
  /** Dernier devis envoyé : c'est lui qui est retenu à la signature. */
  devisRetenu?: { ref: string; ht: string } | null;
  admin?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [relanceDate, setRelanceDate] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [appel, setAppel] = useState(false);
  const [issue, setIssue] = useState("discussion");
  const [appelNote, setAppelNote] = useState("");
  const [rappelLe, setRappelLe] = useState("");
  const [cloture, setCloture] = useState<"gagne" | "perdu" | null>(null);
  const [motif, setMotif] = useState("");
  const [precision, setPrecision] = useState("");
  const [okSigne, setOkSigne] = useState(false);
  const [coord, setCoord] = useState(contact ?? { name: "", email: "", phone: "" });
  const coordChange = Boolean(contact) && (coord.name !== contact!.name || coord.email !== contact!.email || coord.phone !== contact!.phone);

  const clos = statut === "gagne" || statut === "perdu";
  const seqOn = sequenceActive(statut) && Boolean(nextRelanceAt);
  const ISSUES: [string, string, string][] = [
    ["discussion", "On échange, je garde la main", "Statut « En discussion » · e-mails arrêtés"],
    ["reflexion", "Il réfléchit, je le rappelle", "Statut « En réflexion » · e-mails arrêtés · rappel à la date choisie"],
    ["modifier", "Il veut modifier le devis", "Statut « Devis à modifier » · e-mails arrêtés"],
    ["sans_reponse", "Pas de réponse / messagerie", "Statut inchangé · la séquence d'e-mails continue"],
    ["gagne", "C'est signé", "Statut « Signé »"],
    ["perdu", "Il ne donne pas suite", "Statut « Non signé »"],
  ];
  const enPause = !clos && Boolean(pauseAt) && !seqOn;
  const quand = (iso: string) => new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const sequence = (body: Record<string, unknown>) =>
    call(`/api/admin/leads/${leadId}/sequence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const appelApi = (body: Record<string, unknown>) =>
    call(`/api/admin/leads/${leadId}/appel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  function call(path: string, init?: RequestInit) {
    start(async () => {
      setMsg(null);
      const res = await fetch(path, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg((data as { error?: string }).error ?? "Erreur");
      router.refresh();
    });
  }

  const patch = (body: Record<string, unknown>) =>
    call(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  return (
    <div className="space-y-5">
      {/* appel client + séquence d'e-mails */}
      {!clos && (
        <section className="rounded-2xl border border-pine-200 bg-white p-5">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Suivi du client</h2>
          <p className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${seqOn ? "bg-sky-50 text-sky-900" : "bg-mist text-neutral-700"}`}>
            <MailX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {seqOn
                ? `Séquence d'e-mails en cours : relance ${Math.min(relances + 1, 3)} prévue le ${new Date(nextRelanceAt!).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}.`
                : enPause
                  ? `Séquence d'e-mails en pause depuis le ${quand(pauseAt!)} : aucun e-mail automatique ne part.`
                : relances >= 3
                  ? "Séquence d'e-mails terminée : les 3 relances sont parties."
                  : !devisEnvoye
                    ? "Aucun e-mail automatique : le devis n'a pas encore été envoyé."
                    : `Séquence d'e-mails arrêtée (${STATUT_LABELS[statut].toLowerCase()}) : aucun e-mail automatique ne partira.`}
              {rappelAt && ` Rappel téléphonique prévu le ${new Date(rappelAt).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}.`}
            </span>
          </p>
          {!appel ? (
            <div className="mt-3 space-y-2">
              <button type="button" disabled={pending} onClick={() => setAppel(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
                <PhoneCall className="h-4 w-4" />
                J&rsquo;ai appelé le client
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <fieldset className="space-y-1.5">
                <legend className="mb-1 text-xs font-bold text-inkgreen">Résultat de l&rsquo;appel</legend>
                {ISSUES.map(([k, label, effet]) => (
                  <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition ${issue === k ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 hover:bg-amber-500/15"}`}>
                    <input type="radio" name="issue-appel" className="mt-1 accent-pine-700" checked={issue === k} onChange={() => setIssue(k)} />
                    <span>
                      <span className="block font-bold text-inkgreen">{label}</span>
                      <span className="block text-[11px] text-neutral-500">{effet}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              {issue === "perdu" && (
                <label className="block text-xs font-semibold text-neutral-600">
                  Pourquoi ?
                  <select value={motif} onChange={(e) => setMotif(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500">
                    <option value="">Choisir un motif…</option>
                    {Object.entries(MOTIFS_PERTE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </label>
              )}
              {issue === "gagne" && !devisRetenu && !admin && <p className="rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-semibold text-neutral-800">Aucun devis envoyé : envoyez d&rsquo;abord le devis signé.</p>}
              {issue === "reflexion" && (
                <label className="block text-xs font-semibold text-neutral-600">
                  Le rappeler le
                  <input type="date" value={rappelLe} onChange={(e) => setRappelLe(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500" />
                </label>
              )}
              <textarea value={appelNote} onChange={(e) => setAppelNote(e.target.value)} rows={2} placeholder="Compte-rendu (facultatif)" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500" />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending || (issue === "reflexion" && !rappelLe) || (issue === "perdu" && !motif) || (issue === "gagne" && !devisRetenu && !admin)}
                  onClick={() => {
                    appelApi({ issue, note: appelNote, ...(issue === "perdu" ? { motif } : {}), ...(issue === "reflexion" ? { rappelLe: new Date(`${rappelLe}T09:00:00`).toISOString() } : {}) });
                    setAppel(false);
                    setAppelNote("");
                  }}
                  className="flex-1 rounded-full bg-pine-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
                >
                  {pending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Enregistrer l'appel"}
                </button>
                <button type="button" onClick={() => setAppel(false)} className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-600">Annuler</button>
              </div>
            </div>
          )}
          {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
        </section>
      )}

      {/* score du prospect */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <Gauge className="h-3.5 w-3.5" />
          Score du prospect
        </h2>
        <div className="mt-3 space-y-1.5" role="radiogroup" aria-label="Score du prospect">
          {NIVEAUX.map((x) => (
            <button
              key={x.n}
              type="button"
              role="radio"
              aria-checked={niveau === x.n}
              disabled={pending}
              onClick={() => patch({ niveau: niveau === x.n ? null : x.n })}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition disabled:opacity-60 ${niveau === x.n ? "border-amber-500 bg-amber-500/10" : "border-neutral-200 hover:bg-amber-500/15"}`}
            >
              <span className="w-3 text-sm font-extrabold tabular-nums text-neutral-400">{x.n}</span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${x.cls}`}>{x.label}</span>
              <span className="min-w-0 flex-1 text-xs text-neutral-500">{x.description}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">{niveau ? "Cliquez de nouveau sur le score choisi pour le retirer." : "Aucun score pour l'instant."}</p>
      </section>

      {/* note */}
      <section id="note" className="scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <StickyNote className="h-3.5 w-3.5" />
          Note commerciale
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Compte-rendu d'appel, contexte, objection…"
          className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500"
        />
        <button
          type="button"
          disabled={pending || !note.trim()}
          onClick={() => {
            patch({ note });
            setNote("");
          }}
          className="mt-2 rounded-full bg-pine-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
        >
          Ajouter la note
        </button>
      </section>

      {/* statut */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Statut</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUTS.map((s) => {
            const auto = statutAutomatique(s);
            return (
              <button
                key={s}
                type="button"
                disabled={pending || (auto && statut !== s)}
                title={auto ? "Posé automatiquement à l'envoi d'une relance" : STATUT_AIDE[s]}
                onClick={() => {
                  if (s === statut) return;
                  // Signature et non-signature passent par une confirmation.
                  if (s === "gagne" || s === "perdu") { setCloture(s); setOkSigne(false); setMsg(null); } else { setCloture(null); patch({ statut: s }); }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${
                  statut === s
                    ? "bg-pine-700 text-white"
                    : auto
                      ? "border border-dashed border-neutral-200 bg-white text-neutral-300"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
                }`}
              >
                {STATUT_LABELS[s]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-400">Les statuts « Relancé » se posent tout seuls à l&rsquo;envoi d&rsquo;une relance.</p>

        {cloture === "gagne" && (
          <div className="mt-3 rounded-xl border border-pine-200 bg-pine-50/60 p-3 text-sm">
            <p className="font-bold text-inkgreen">Passer l&rsquo;affaire en « Signé » ?</p>
            {devisRetenu ? (
              <p className="mt-1 text-neutral-700">Devis retenu : <strong>{devisRetenu.ref}</strong>, <strong className="tabular-nums">{Number(devisRetenu.ht).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € HT</strong>. Ce montant sert au chiffre signé et à la prime.</p>
            ) : (
              <p className="mt-1 text-neutral-700">{admin ? "Aucun devis n'a été envoyé : le montant retenu sera l'estimation de la fiche." : "Aucun devis n'a été envoyé à ce client : envoyez d'abord le devis signé."}</p>
            )}
            {(devisRetenu || admin) && (
              <label className="mt-2 flex items-start gap-2 text-xs text-neutral-700">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pine-700" checked={okSigne} onChange={(e) => setOkSigne(e.target.checked)} />
                <span>Le client a donné son accord sur ce devis.</span>
              </label>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending || !okSigne || (!devisRetenu && !admin)} onClick={() => { patch({ statut: "gagne" }); setCloture(null); }} className="rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">Confirmer la signature</button>
              <button type="button" onClick={() => setCloture(null)} className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-bold text-neutral-600">Annuler</button>
            </div>
          </div>
        )}
        {cloture === "perdu" && (
          <div className="mt-3 rounded-xl border border-neutral-200 bg-mist p-3 text-sm">
            <p className="font-bold text-inkgreen">Pourquoi l&rsquo;affaire n&rsquo;est pas signée ?</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {Object.entries(MOTIFS_PERTE).map(([k, l]) => (
                <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold ${motif === k ? "border-amber-500 text-inkgreen" : "border-neutral-200 text-neutral-600"}`}>
                  <input type="radio" name="motif-perte" className="accent-pine-700" checked={motif === k} onChange={() => setMotif(k)} />
                  {l}
                </label>
              ))}
            </div>
            <input value={precision} onChange={(e) => setPrecision(e.target.value)} maxLength={300} placeholder="Précision (facultatif) : nom du concurrent, prix annoncé…" className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-pine-500" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending || !motif} onClick={() => { patch({ statut: "perdu", motif, precision }); setCloture(null); }} className="rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">Confirmer « Non signé »</button>
              <button type="button" onClick={() => setCloture(null)} className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-bold text-neutral-600">Annuler</button>
            </div>
          </div>
        )}
        {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
      </section>

      {/* relances automatiques : pause, suppression, déclenchement */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <CalendarClock className="h-3.5 w-3.5" />
          Relances automatiques
        </h2>
        <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${seqOn ? "bg-sky-50 text-sky-900" : enPause ? "bg-amber-500/15 text-neutral-800" : "bg-mist text-neutral-600"}`}>
          {clos
            ? "Affaire close : aucune relance."
            : seqOn
              ? `En cours — relance ${Math.min(relances + 1, 3)} sur 3 prévue le ${quand(nextRelanceAt!)}.`
              : enPause
                ? `En pause depuis le ${quand(pauseAt!)} — aucun e-mail ne part.`
                : relances >= 3
                  ? "Terminées : les 3 relances sont parties."
                  : "Aucune relance prévue."}
        </p>
        {!clos && relances < 3 && (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {seqOn && (
                <button type="button" disabled={pending} onClick={() => sequence({ action: "pause" })} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40">
                  <Pause className="h-3.5 w-3.5" /> Mettre en pause
                </button>
              )}
              {!seqOn && (
                <button
                  type="button"
                  disabled={pending || !devisEnvoye}
                  title={devisEnvoye ? undefined : "Envoyez d'abord un devis à ce client"}
                  onClick={() => { if (enPause || window.confirm(`Déclencher les relances automatiques ? La relance ${relances + 1} partira selon le délai réglé dans l'onglet Relances.`)) sequence({ action: "declencher" }); }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5" /> {enPause ? "Reprendre les relances" : "Déclencher la séquence"}
                </button>
              )}
              {(seqOn || enPause) && (
                <button type="button" disabled={pending} onClick={() => { if (window.confirm("Supprimer les relances automatiques prévues pour ce client ? Vous pourrez les déclencher de nouveau plus tard.")) sequence({ action: "supprimer" }); }} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40">
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer les relances
                </button>
              )}
            </div>
            {devisEnvoye ? (
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3">
                <label className="min-w-0 flex-1 basis-40 text-xs font-semibold text-neutral-500">
                  {seqOn ? "Changer la date de la prochaine relance" : "Ou choisir la date de la prochaine relance"}
                  <input type="date" value={relanceDate} onChange={(e) => setRelanceDate(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-inkgreen outline-none focus:border-pine-500" />
                </label>
                <button
                  type="button"
                  disabled={pending || !relanceDate}
                  onClick={() => { sequence({ action: "declencher", date: new Date(`${relanceDate}T09:00:00`).toISOString() }); setRelanceDate(""); }}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
                >
                  Programmer
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-neutral-400">Les relances se déclenchent une fois un devis envoyé au client.</p>
            )}
          </>
        )}
        {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
      </section>

      {/* emails */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Relance immédiate</h2>
        <div className="mt-3 space-y-2.5">
          <button
            type="button"
            disabled={pending || relances >= 3 || !devisEnvoye}
            title={devisEnvoye ? undefined : "Envoyez d'abord le devis"}
            onClick={() => { if (window.confirm(`Envoyer maintenant la relance ${relances + 1} à ce client ?`)) call(`/api/admin/leads/${leadId}/relance`, { method: "POST" }); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
          >
            <BellPlus className="h-4 w-4" />
            {relances >= 3 ? "Séquence terminée (3 relances)" : !devisEnvoye ? "Relance possible après l'envoi du devis" : `Envoyer la relance ${relances + 1} maintenant`}
          </button>
          {msg && <p className="text-xs font-semibold text-red-600">{msg}</p>}
        </div>
      </section>

      {/* coordonnées */}
      {contact && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            <UserPen className="h-3.5 w-3.5" />
            Coordonnées
          </h2>
          <div className="mt-3 grid gap-2">
            {([["name", "Nom", "text"], ["email", "E-mail", "email"], ["phone", "Téléphone", "tel"]] as const).map(([k, label, type]) => (
              <label key={k} className="block text-xs font-semibold text-neutral-500">
                {label}
                <input type={type} value={coord[k]} onChange={(e) => setCoord({ ...coord, [k]: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-inkgreen outline-none focus:border-pine-500" />
              </label>
            ))}
          </div>
          <button type="button" disabled={pending || !coordChange} onClick={() => patch({ contact: coord })} className="mt-3 rounded-full bg-pine-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
            Enregistrer les coordonnées
          </button>
          <p className="mt-2 text-xs text-neutral-400">Les relances et les devis partent à cette adresse.</p>
        </section>
      )}

      {/* assignation */}
      {team.length > 0 && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Commercial</h2>
          <select
            defaultValue={assignedTo ?? ""}
            disabled={pending}
            onChange={(e) => patch({ assigned_to: e.target.value })}
            className="mt-3 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-semibold text-inkgreen outline-none focus:border-pine-500"
          >
            <option value="">Non assigné</option>
            {team.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </section>
      )}
    </div>
  );
}
