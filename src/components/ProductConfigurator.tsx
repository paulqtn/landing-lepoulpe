"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Lock, Minus, Phone, Plus, X } from "lucide-react";
import { phoneHref, site } from "@/lib/site";

/* ================================================================== */
/*  Mini-configurateur des fiches produit : le système est fixé par    */
/*  la fiche, le client règle longueurs / hauteur / teinte et voit     */
/*  le tarif réel (moteur serveur) se mettre à jour en direct.         */
/* ================================================================== */

const fmt = new Intl.NumberFormat("fr-FR");
const eur = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fmtM = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const hauteurs = [
  { value: "90", label: "0,90 m", desc: "rampant" },
  { value: "100", label: "1,00 m", desc: "norme" },
  { value: "110", label: "1,10 m", desc: "confort" },
];

const epaisseurs = [
  { value: "66.4", label: "66.4", desc: "éco · petites portées", reco: false },
  { value: "88.4", label: "88.4", desc: "le choix de la norme", reco: true },
  { value: "1010.4", label: "1010.4", desc: "piscine · vent · 1,10 m", reco: false },
] as const;

const teintes = [
  { value: "clair", label: "Clair", swatch: "bg-gradient-to-br from-sky-50 to-pine-100/60 ring-pine-200" },
  { value: "extra-clair", label: "Extra-clair", swatch: "bg-gradient-to-br from-white to-neutral-100 ring-neutral-200" },
  { value: "fume-1f", label: "Fumé 1 face", swatch: "bg-gradient-to-br from-neutral-300 to-neutral-400 ring-neutral-400" },
  { value: "fume-2f", label: "Fumé 2 faces", swatch: "bg-gradient-to-br from-neutral-500 to-neutral-700 ring-neutral-500" },
] as const;

type Estimation = {
  ttc: number;
  ttcMl: number;
  nbVerres: number;
  enlevementPossible: boolean;
};

export function ProductConfigurator({ systeme }: { systeme: "rail" | "pinces" | "spider" }) {
  const [cotes, setCotes] = useState<string[]>(["3,00"]);
  const [hauteur, setHauteur] = useState("100");
  const [epaisseur, setEpaisseur] = useState<(typeof epaisseurs)[number]["value"]>("88.4");
  const [teinte, setTeinte] = useState<(typeof teintes)[number]["value"]>("clair");

  const [est, setEst] = useState<Estimation | null>(null);
  const [estLoading, setEstLoading] = useState(false);
  const seqRef = useRef(0);

  const [formOpen, setFormOpen] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", cp: "", consent: false });
  const [showErr, setShowErr] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const cotesNum = cotes.map((c) => parseFloat(c.replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
  const totalMl = cotesNum.reduce((a, b) => a + b, 0);

  /* tarif live */
  useEffect(() => {
    if (cotesNum.length === 0) {
      setEst(null);
      return;
    }
    const seq = ++seqRef.current;
    setEstLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/estimation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systeme, cotes: cotesNum, hauteur: Number(hauteur), teinte, verre: epaisseur, cp: lead.cp }),
        });
        if (seq !== seqRef.current) return;
        setEst(res.ok ? await res.json() : null);
      } catch {
        if (seq === seqRef.current) setEst(null);
      } finally {
        if (seq === seqRef.current) setEstLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systeme, cotes.join("|"), hauteur, teinte, epaisseur, lead.cp]);

  function bump(i: number, delta: number) {
    setCotes((cs) =>
      cs.map((c, j) => {
        if (j !== i) return c;
        const cur = parseFloat(c.replace(",", "."));
        const base = Number.isFinite(cur) && cur > 0 ? cur : 0.5;
        return fmtM(Math.max(0.5, Math.round((base + delta) * 2) / 2));
      }),
    );
  }

  const leadErrors = {
    name: lead.name.trim().length < 2,
    email: !EMAIL_RE.test(lead.email),
    phone: lead.phone.replace(/\D/g, "").length < 8,
    consent: !lead.consent,
  };

  async function submit() {
    if (Object.values(leadErrors).some(Boolean)) {
      setShowErr(true);
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          answers: {
            systeme,
            cotes: cotesNum,
            hauteur,
            epaisseur,
            teinte,
            codePostal: lead.cp,
            estimationTTC: est?.ttc ?? null,
          },
          source: "fiche-produit",
        }),
      });
    } catch {
      /* on confirme quand même */
    }
    setStatus("done");
  }

  const label = "mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600";

  return (
    <div className="rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-card sm:p-6">
      {/* longueurs */}
      <span className={label}>Vos longueurs</span>
      <div className="mt-2.5 space-y-2">
        {cotes.map((c, i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl border border-neutral-200 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Côté {i + 1}</span>
            {cotes.length > 1 && (
              <button
                type="button"
                onClick={() => setCotes((cs) => cs.filter((_, j) => j !== i))}
                aria-label={`Supprimer le côté ${i + 1}`}
                className="grid h-6 w-6 place-items-center rounded-full text-neutral-300 transition hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => bump(i, -0.5)}
                aria-label={`Réduire le côté ${i + 1} de 50 cm`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-baseline gap-1 rounded-lg bg-mist px-1.5 py-1">
                <input
                  value={c}
                  onChange={(e) => setCotes((cs) => cs.map((x, j) => (j === i ? e.target.value : x)))}
                  inputMode="decimal"
                  aria-label={`Longueur du côté ${i + 1} en mètres`}
                  className="w-14 bg-transparent text-center text-base font-extrabold tabular-nums text-inkgreen outline-none"
                />
                <span className="text-xs font-bold text-neutral-400">m</span>
              </div>
              <button
                type="button"
                onClick={() => bump(i, 0.5)}
                aria-label={`Augmenter le côté ${i + 1} de 50 cm`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-pine-300 hover:text-pine-700"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {cotes.length < 6 && (
          <button
            type="button"
            onClick={() => setCotes((cs) => [...cs, "1,00"])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pine-300/70 px-3 py-2.5 text-sm font-bold text-pine-700 transition hover:border-pine-500 hover:bg-pine-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter un côté — mon garde-corps tourne
          </button>
        )}
      </div>

      {/* hauteur */}
      <div className="mt-5">
        <span className={label}>Hauteur</span>
        <div className="grid grid-cols-3 gap-2">
          {hauteurs.map((h) => {
            const on = hauteur === h.value;
            return (
              <button
                key={h.value}
                type="button"
                aria-pressed={on}
                onClick={() => setHauteur(h.value)}
                className={`rounded-xl border px-2 py-2.5 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:border-pine-300"}`}
              >
                <span className="block text-sm font-bold text-inkgreen">{h.label}</span>
                <span className="block text-[10px] text-neutral-500">{h.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* épaisseur */}
      <div className="mt-5">
        <span className={label}>Épaisseur du verre</span>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {epaisseurs.map((e) => {
            const on = epaisseur === e.value;
            return (
              <button
                key={e.value}
                type="button"
                aria-pressed={on}
                onClick={() => setEpaisseur(e.value)}
                className={`relative rounded-xl border px-2 py-2.5 text-center transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:border-pine-300"}`}
              >
                {e.reco && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-pine-950 shadow-sm">
                    Recommandé
                  </span>
                )}
                <span className="block font-mono text-sm font-bold text-inkgreen">{e.label}</span>
                <span className="block text-[10px] leading-tight text-neutral-500">{e.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* teinte */}
      <div className="mt-5">
        <span className={label}>Teinte du verre</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {teintes.map((t) => {
            const on = teinte === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => setTeinte(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition ${on ? "border-pine-600 bg-pine-50 ring-1 ring-pine-600" : "border-neutral-200 bg-white hover:border-pine-300"}`}
              >
                <span className={`relative h-8 w-8 overflow-hidden rounded-md ring-1 ${t.swatch}`}>
                  <span className="absolute -left-1 top-0 h-12 w-1.5 rotate-12 bg-white/50" />
                </span>
                <span className={`text-[11px] font-bold leading-tight ${on ? "text-pine-700" : "text-inkgreen"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* tarif live */}
      <div className="relative mt-6 overflow-hidden rounded-2xl bg-pine-900 px-5 py-4 text-white">
        <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Votre tarif</p>
            {est ? (
              <>
                <p key={est.ttc} className="mt-1 animate-scale-in text-3xl font-extrabold tabular-nums tracking-tight text-white">
                  {eur.format(est.ttc)} € <span className="text-sm font-bold text-pine-200">TTC</span>
                </p>
                <p className="mt-0.5 text-[11px] text-pine-100/60">
                  {eur.format(est.ttcMl)} €/ml · {est.nbVerres} panneaux · livraison incluse · pose non comprise
                </p>
              </>
            ) : estLoading ? (
              <div className="mt-2 space-y-1.5">
                <div className="shimmer h-2.5 w-32 rounded-full" />
                <div className="shimmer h-2 w-44 rounded-full" />
              </div>
            ) : (
              <p className="mt-1 text-sm text-pine-100/60">Réglez vos longueurs pour voir le tarif.</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-pine-100 ring-1 ring-white/15">
            {fmt.format(Math.round(totalMl * 100) / 100)} ml
          </span>
        </div>
      </div>

      {/* capture */}
      {status === "done" ? (
        <div className="mt-4 rounded-2xl bg-pine-50 p-4 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-pine-600 text-white">
            <Check className="h-5 w-5" />
          </span>
          <p className="mt-2.5 text-sm font-extrabold text-inkgreen">Demande envoyée !</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            Votre devis détaillé arrive sous 24h — un conseiller valide chaque cote avec vous.
          </p>
        </div>
      ) : !formOpen ? (
        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-pine-950 shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-600"
          >
            Recevoir ce tarif par email
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href={phoneHref}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-mist px-6 py-3 text-sm font-bold text-inkgreen transition hover:bg-pine-50"
          >
            <Phone className="h-4 w-4 text-pine-600" />
            Un conseil ? {site.phone}
          </a>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          <input
            value={lead.name}
            onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))}
            placeholder="Nom complet"
            autoComplete="name"
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-inkgreen outline-none transition placeholder:text-neutral-400 focus:ring-4 ${showErr && leadErrors.name ? "border-red-400 focus:ring-red-500/10" : "border-neutral-200 focus:border-pine-500 focus:ring-pine-500/10"}`}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              value={lead.email}
              onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))}
              placeholder="Email"
              type="email"
              autoComplete="email"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-inkgreen outline-none transition placeholder:text-neutral-400 focus:ring-4 ${showErr && leadErrors.email ? "border-red-400 focus:ring-red-500/10" : "border-neutral-200 focus:border-pine-500 focus:ring-pine-500/10"}`}
            />
            <input
              value={lead.phone}
              onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))}
              placeholder="Téléphone"
              type="tel"
              autoComplete="tel"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-inkgreen outline-none transition placeholder:text-neutral-400 focus:ring-4 ${showErr && leadErrors.phone ? "border-red-400 focus:ring-red-500/10" : "border-neutral-200 focus:border-pine-500 focus:ring-pine-500/10"}`}
            />
          </div>
          <input
            value={lead.cp}
            onChange={(e) => setLead((l) => ({ ...l, cp: e.target.value }))}
            placeholder="Code postal du chantier (livraison)"
            autoComplete="postal-code"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-inkgreen outline-none transition placeholder:text-neutral-400 focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10"
          />
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={lead.consent}
              onChange={(e) => setLead((l) => ({ ...l, consent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-pine-600"
            />
            <span className="text-[11px] leading-relaxed text-neutral-500">
              J’accepte d’être recontacté au sujet de mon projet. Pas de spam, jamais.
            </span>
          </label>
          {showErr && Object.values(leadErrors).some(Boolean) && (
            <p className="text-xs font-semibold text-red-600">Vérifiez vos coordonnées pour recevoir le tarif.</p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={status === "loading"}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-pine-950 shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-50"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Recevoir mon devis détaillé
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <Lock className="h-3 w-3" />
            Vos informations restent confidentielles.
          </p>
        </div>
      )}
    </div>
  );
}
