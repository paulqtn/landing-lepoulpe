"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, CalendarClock, Gauge, Loader2, MailX, Pause, PhoneCall, Play, Send, StickyNote, Trash2, UserPen } from "lucide-react";
import { NIVEAUX } from "@/lib/admin/niveaux";
import { toast } from "./Toasts";
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
  const [rappelHeure, setRappelHeure] = useState("09:00");
  const dansJours = (n: number) => { const d = new Date(Date.now() + n * 86400_000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
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
  const sequence = (body: Record<string, unknown>, ok: string) =>
    call(`/api/admin/leads/${leadId}/sequence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, ok);
  const appelApi = (body: Record<string, unknown>) =>
    call(`/api/admin/leads/${leadId}/appel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "Appel enregistré.");

  /* Chaque action dit si elle a réussi : message en haut de l'écran, visible où que l'on soit dans la fiche. */
  function call(path: string, init?: RequestInit, ok?: string, ensuite?: () => Promise<string | void>) {
    start(async () => {
      setMsg(null);
      const res = await fetch(path, init).catch(() => null);
      const data = res ? await res.json().catch(() => ({})) : {};
      if (!res?.ok) {
        const erreur = (data as { error?: string }).error ?? "L'action n'a pas abouti.";
        setMsg(erreur);
        toast(erreur, true);
      } else {
        const suite = ensuite ? await ensuite().catch(() => undefined) : undefined;
        if (suite ?? ok) toast((suite ?? ok) as string);
      }
      router.refresh();
    });
  }

  const patch = (body: Record<string, unknown>, ok = "Enregistré.", ensuite?: () => Promise<string | void>) =>
    call(`/api/admin/leads/${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, ok, ensuite);

  /* « Conclure la vente » (bouton du haut de la fiche) ouvre la confirmation de signature. */
  const zoneCloture = useRef<HTMLDivElement>(null);
  const [atelier, setAtelier] = useState(true);
  useEffect(() => {
    const ouvrir = () => { setCloture("gagne"); setOkSigne(false); setMsg(null); setTimeout(() => zoneCloture.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); };
    window.addEventListener("mgk:conclure", ouvrir);
    return () => window.removeEventListener("mgk:conclure", ouvrir);
  }, []);
  /** Signature, puis commande atelier dans la foulée si demandé. */
  const signer = () =>
    patch({ statut: "gagne" }, "Affaire signée.", async () => {
      if (!atelier) return;
      const res = await fetch("/api/admin/logistics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "order_create", leadId }) });
      const d = await res.json().catch(() => ({}));
      return res.ok ? `Affaire signée. Commande atelier ${d.ref ?? ""} créée.` : "Affaire signée. La commande atelier n'a pas pu être créée : lancez-la depuis la fiche.";
    });


  return (
    <div className="space-y-5">
      {/* appel client + séquence d'e-mails */}
      {!clos && (
        <section className="rounded-2xl border border-pine-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">Suivi du client</h2>
          {rappelAt && <p className="mt-3 rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-semibold text-neutral-800">Rappel téléphonique prévu le {quand(rappelAt)}.</p>}
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
                      <span className="block text-[11px] text-neutral-600">{effet}</span>
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
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-neutral-600">Le rappeler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([["Demain", 1], ["Dans 3 jours", 3], ["Dans une semaine", 7]] as const).map(([label, j]) => {
                      const d = dansJours(j);
                      return (
                        <button key={j} type="button" onClick={() => setRappelLe(d)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${rappelLe === d ? "border-amber-500 bg-amber-500/10 text-inkgreen" : "border-neutral-200 bg-white text-neutral-600 hover:border-pine-300"}`}>{label}</button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input type="date" aria-label="Date du rappel" value={rappelLe} onChange={(e) => setRappelLe(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500" />
                    <input type="time" aria-label="Heure du rappel" value={rappelHeure} onChange={(e) => setRappelHeure(e.target.value)} className="w-28 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500" />
                  </div>
                </div>
              )}
              <textarea value={appelNote} onChange={(e) => setAppelNote(e.target.value)} rows={2} placeholder="Compte-rendu (facultatif)" className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-pine-500" />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending || (issue === "reflexion" && !rappelLe) || (issue === "perdu" && !motif) || (issue === "gagne" && !devisRetenu && !admin)}
                  onClick={() => {
                    appelApi({ issue, note: appelNote, ...(issue === "perdu" ? { motif } : {}), ...(issue === "reflexion" ? { rappelLe: new Date(`${rappelLe}T${rappelHeure || "09:00"}:00`).toISOString() } : {}) });
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

      {/* score du prospect : une ligne de cinq pastilles */}
      {!clos && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">
            <Gauge className="h-4 w-4 text-pine-600" />
            Score du prospect
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Score du prospect">
            {NIVEAUX.map((x) => (
              <button
                key={x.n}
                type="button"
                role="radio"
                aria-checked={niveau === x.n}
                title={x.description}
                disabled={pending}
                onClick={() => patch({ niveau: niveau === x.n ? null : x.n }, niveau === x.n ? "Score retiré." : `Score : ${x.label}.`)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset transition disabled:opacity-60 ${niveau === x.n ? `${x.cls} ring-2` : "bg-white text-neutral-600 ring-neutral-200 hover:bg-amber-500/15"}`}
              >
                {x.n} · {x.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-600">{niveau ? `${NIVEAUX.find((x) => x.n === niveau)?.description} Cliquez de nouveau pour retirer le score.` : "Aucun score pour l'instant."}</p>
        </section>
      )}

      {/* note */}
      <section id="note" className="scroll-mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">
          <StickyNote className="h-4 w-4 text-pine-600" />
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
            patch({ note }, "Note ajoutée.");
            setNote("");
          }}
          className="mt-2 rounded-full bg-pine-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
        >
          Ajouter la note
        </button>
      </section>

      {/* statut */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">Statut</h2>
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
                  if (s === "gagne" || s === "perdu") { setCloture(s); setOkSigne(false); setMsg(null); } else { setCloture(null); patch({ statut: s }, `Statut : ${STATUT_LABELS[s]}.`); }
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed ${
                  statut === s
                    ? "bg-pine-700 text-white"
                    : auto
                      ? "border border-dashed border-neutral-200 bg-white text-neutral-400"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
                }`}
              >
                {STATUT_LABELS[s]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-600">Les statuts « Relancé » se posent tout seuls à l&rsquo;envoi d&rsquo;une relance.</p>

        {cloture === "gagne" && (
          <div ref={zoneCloture} className="mt-3 rounded-xl border border-pine-200 bg-pine-50/60 p-3 text-sm">
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
            {(devisRetenu || admin) && (
              <label className="mt-1.5 flex items-start gap-2 text-xs text-neutral-700">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-pine-700" checked={atelier} onChange={(e) => setAtelier(e.target.checked)} />
                <span>Créer la commande atelier dans la foulée.</span>
              </label>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" disabled={pending || !okSigne || (!devisRetenu && !admin)} onClick={() => { signer(); setCloture(null); }} className="rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">Confirmer la signature</button>
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
              <button type="button" disabled={pending || !motif} onClick={() => { patch({ statut: "perdu", motif, precision }, "Affaire classée « Non signé »."); setCloture(null); }} className="rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">Confirmer « Non signé »</button>
              <button type="button" onClick={() => setCloture(null)} className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-bold text-neutral-600">Annuler</button>
            </div>
          </div>
        )}
        {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
      </section>

      {/* relances : état, pause, suppression, déclenchement, envoi immédiat — rien sur une affaire close */}
      {!clos && (
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">
          <CalendarClock className="h-4 w-4 text-pine-600" />
          Relances par e-mail
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
                <button type="button" disabled={pending} onClick={() => sequence({ action: "pause" }, "Relances mises en pause.")} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40">
                  <Pause className="h-3.5 w-3.5" /> Mettre en pause
                </button>
              )}
              {!seqOn && (
                <button
                  type="button"
                  disabled={pending || !devisEnvoye}
                  title={devisEnvoye ? undefined : "Envoyez d'abord un devis à ce client"}
                  onClick={() => { if (enPause || window.confirm(`Déclencher les relances automatiques ? La relance ${relances + 1} partira selon le délai réglé dans l'onglet Relances.`)) sequence({ action: "declencher" }, enPause ? "Relances reprises." : "Relances déclenchées."); }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
                >
                  <Play className="h-3.5 w-3.5" /> {enPause ? "Reprendre les relances" : "Déclencher la séquence"}
                </button>
              )}
              {(seqOn || enPause) && (
                <button type="button" disabled={pending} onClick={() => { if (window.confirm("Supprimer les relances automatiques prévues pour ce client ? Vous pourrez les déclencher de nouveau plus tard.")) sequence({ action: "supprimer" }, "Relances supprimées."); }} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40">
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer les relances
                </button>
              )}
            </div>
            {devisEnvoye ? (
              <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-3">
                <label className="min-w-0 flex-1 basis-40 text-xs font-semibold text-neutral-600">
                  {seqOn ? "Changer la date de la prochaine relance" : "Ou choisir la date de la prochaine relance"}
                  <input type="date" value={relanceDate} onChange={(e) => setRelanceDate(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-inkgreen outline-none focus:border-pine-500" />
                </label>
                <button
                  type="button"
                  disabled={pending || !relanceDate}
                  onClick={() => { sequence({ action: "declencher", date: new Date(`${relanceDate}T09:00:00`).toISOString() }, "Prochaine relance programmée."); setRelanceDate(""); }}
                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
                >
                  Programmer
                </button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-neutral-600">Les relances se déclenchent une fois un devis envoyé au client.</p>
            )}
          </>
        )}
        {devisEnvoye && relances < 3 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => { if (window.confirm(`Envoyer maintenant la relance ${relances + 1} à ce client ?`)) call(`/api/admin/leads/${leadId}/relance`, { method: "POST" }, `Relance ${relances + 1} envoyée.`); }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40"
          >
            <BellPlus className="h-3.5 w-3.5" />
            Envoyer la relance {relances + 1} maintenant
          </button>
        )}
        {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
      </section>
      )}

      {/* coordonnées */}
      {contact && (
        <details className="group rounded-2xl border border-neutral-200 bg-white p-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold text-inkgreen [&::-webkit-details-marker]:hidden">
            <UserPen className="h-4 w-4 text-pine-600" />
            <span className="flex-1">Coordonnées{team.length > 0 ? " et commercial" : ""}</span>
            <span className="font-sans text-xs normal-case tracking-normal text-pine-700 group-open:hidden">Modifier</span>
            <span className="hidden font-sans text-xs normal-case tracking-normal text-pine-700 group-open:inline">Replier</span>
          </summary>
          <div className="mt-3 grid gap-2">
            {([["name", "Nom", "text"], ["email", "E-mail", "email"], ["phone", "Téléphone", "tel"]] as const).map(([k, label, type]) => (
              <label key={k} className="block text-xs font-semibold text-neutral-600">
                {label}
                <input type={type} value={coord[k]} onChange={(e) => setCoord({ ...coord, [k]: e.target.value })} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-inkgreen outline-none focus:border-pine-500" />
              </label>
            ))}
          </div>
          <button type="button" disabled={pending || !coordChange} onClick={() => patch({ contact: coord }, "Coordonnées enregistrées.")} className="mt-3 rounded-full bg-pine-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
            Enregistrer les coordonnées
          </button>
          <p className="mt-2 text-xs text-neutral-600">Les relances et les devis partent à cette adresse.</p>
          {team.length > 0 && (
            <label className="mt-4 block border-t border-neutral-100 pt-3 text-xs font-semibold text-neutral-600">
              Commercial qui suit ce client
            <select
              defaultValue={assignedTo ?? ""}
              disabled={pending}
              onChange={(e) => patch({ assigned_to: e.target.value }, e.target.value ? `Client confié à ${e.target.value}.` : "Client remis dans la file.")}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-semibold text-inkgreen outline-none focus:border-pine-500"
            >
              <option value="">Non assigné</option>
              {team.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            </label>
          )}
        </details>
      )}

    </div>
  );
}
