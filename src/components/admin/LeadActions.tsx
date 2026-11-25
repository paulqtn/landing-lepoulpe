"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, CalendarClock, Loader2, MailX, PhoneCall, Play, Send, StickyNote } from "lucide-react";
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
                ? `Séquence d'e-mails en cours : relance ${Math.min(relances + 1, 3)} prévue le ${new Date(nextRelanceAt!).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}.`
                : relances >= 3
                  ? "Séquence d'e-mails terminée : les 3 relances sont parties."
                  : !devisEnvoye
                    ? "Aucun e-mail automatique : le devis n'a pas encore été envoyé."
                    : `Séquence d'e-mails arrêtée (${STATUT_LABELS[statut].toLowerCase()}) : aucun e-mail automatique ne partira.`}
              {rappelAt && ` Rappel téléphonique prévu le ${new Date(rappelAt).toLocaleDateString("fr-FR")}.`}
            </span>
          </p>
          {!appel ? (
            <div className="mt-3 space-y-2">
              <button type="button" disabled={pending} onClick={() => setAppel(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
                <PhoneCall className="h-4 w-4" />
                J&rsquo;ai appelé le client
              </button>
              {!seqOn && devisEnvoye && relances < 3 && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => { if (window.confirm(`Reprendre les e-mails automatiques ? La relance ${relances + 1} sera programmée selon le délai de la séquence.`)) appelApi({ action: "reprendre" }); }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5" />
                  Reprendre la séquence d&rsquo;e-mails
                </button>
              )}
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
                  disabled={pending || (issue === "reflexion" && !rappelLe)}
                  onClick={() => {
                    appelApi({ issue, note: appelNote, ...(issue === "reflexion" ? { rappelLe: new Date(`${rappelLe}T09:00:00`).toISOString() } : {}) });
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

      {/* statut */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Statut</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUTS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              title={STATUT_AIDE[s]}
              onClick={() => patch({ statut: s })}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                statut === s
                  ? "bg-pine-700 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
              }`}
            >
              {STATUT_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

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

      {/* emails */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Emails</h2>
        <div className="mt-3 space-y-2.5">
          <button
            type="button"
            disabled={pending || !hasEstimation}
            onClick={() => {
              // Double vérification : aucun e-mail ne part sur un simple clic.
              if (window.confirm("Envoyer maintenant au client l'e-mail d'estimation (prix global + lien vers sa page) ?\n\nPour un devis détaillé en PDF, utilisez plutôt « Préparer un devis »."))
                call(`/api/admin/leads/${leadId}/send-devis`, { method: "POST" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:opacity-40"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {hasEstimation ? "Envoyer l'e-mail d'estimation" : "Pas d'estimation à envoyer"}
          </button>
          <button
            type="button"
            disabled={pending || relances >= 3}
            onClick={() => call(`/api/admin/leads/${leadId}/relance`, { method: "POST" })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
          >
            <BellPlus className="h-4 w-4" />
            {relances >= 3 ? "Séquence terminée (3 relances)" : `Envoyer la relance ${relances + 1} maintenant`}
          </button>
          {msg && <p className="text-xs font-semibold text-red-600">{msg}</p>}
        </div>
      </section>

      {/* relance programmée */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          <CalendarClock className="h-3.5 w-3.5" />
          Relance automatique
        </h2>
        <p className="mt-2 text-xs text-neutral-500">
          {nextRelanceAt
            ? `Prochaine relance prévue le ${new Date(nextRelanceAt).toLocaleDateString("fr-FR")}.`
            : "Aucune relance programmée."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="date"
            value={relanceDate}
            onChange={(e) => setRelanceDate(e.target.value)}
            className="min-w-0 flex-1 basis-40 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500"
          />
          <button
            type="button"
            disabled={pending || !relanceDate}
            onClick={() => patch({ next_relance_at: new Date(`${relanceDate}T08:00:00`).toISOString() })}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
          >
            Programmer
          </button>
          {nextRelanceAt && (
            <button
              type="button"
              disabled={pending}
              onClick={() => patch({ next_relance_at: null })}
              className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-500 transition hover:border-red-300 hover:text-red-600"
            >
              Annuler
            </button>
          )}
        </div>
      </section>

      {/* note */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
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
    </div>
  );
}
