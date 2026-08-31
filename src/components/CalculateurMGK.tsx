"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calculator, Check, Copy, Loader2, Lock, Minus, Plus } from "lucide-react";

/* ================================================================== */
/*  Outil interne MGK : formulaire de chiffrage fourniture.            */
/*  Tout le calcul (et les tarifs d'achat) reste côté serveur.         */
/* ================================================================== */

type Troncon = { longueur: string; escalier: boolean };

type Result = {
  systeme: string;
  hauteurVerre: number;
  panneaux: { troncon: number; nb: number; largeurMm: number; hauteurCm: number; escalier: boolean }[];
  nbVerres: number;
  surfaceTotale: number;
  poidsTotal: number;
  usinage: string;
  prixVerreM2: number;
  nbCaisses: number;
  supportsDetail: string;
  lignes: { label: string; detail: string; montant: number }[];
  coutAchat: number;
  logistique: { turquie: number; caisses: number; france: number };
  prixHT: number;
  prixTTC: number;
  htMl: number;
  ttcMl: number;
  longueurTotale: number;
  alertes: string[];
  entree: { coefficient: number; angles: number };
};

const FIXATIONS = [
  ["GS-19-L", "GS-19-L — rail de sol (défaut rail)"],
  ["GS-03-G", "GS-03-G — rail encastré"],
  ["GS-13-E", "GS-13-E — rail sur dalle"],
  ["GS-13-E-CINTRE", "GS-13-E — rail cintré"],
  ["GS-12-L", "GS-12-L — profil de sol"],
  ["GS-17", "GS-17 — rail déporté"],
  ["GS-16", "GS-16 — rail à l'anglaise (+12 cm)"],
  ["GS-07-C", "GS-07-C — pince carrée 8+8 (défaut pince)"],
  ["GS-07-B", "GS-07-B — pince ronde 8+8"],
  ["GS-07-A", "GS-07-A — pince carrée 6+6 (piscine / 66.4)"],
  ["GS-07", "GS-07 — pince ronde 6+6"],
  ["GS-05", "GS-05 — pince de sol ronde"],
  ["GS-06", "GS-06 — pince de sol carrée"],
  ["GS-06-A", "GS-06-A — pince de sol 360°"],
  ["GS-10", "GS-10 — pince à l'anglaise (+20 cm)"],
  ["GS-02", "GS-02 — spider Ø50 (+25 cm)"],
] as const;

const eur = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

export function CalculateurMGK() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [client, setClient] = useState("");
  const [projet, setProjet] = useState("terrasse");
  const [departement, setDepartement] = useState("");
  const [troncons, setTroncons] = useState<Troncon[]>([{ longueur: "", escalier: false }]);
  const [departMur, setDepartMur] = useState(false);
  const [finMur, setFinMur] = useState(false);
  const [fixation, setFixation] = useState("GS-19-L");
  const [gs10Partage, setGs10Partage] = useState(false);
  const [verre, setVerre] = useState("88.4");
  const [teinte, setTeinte] = useState("clair");
  const [hauteur, setHauteur] = useState("101");
  const [pente, setPente] = useState("35");
  const [couleur, setCouleur] = useState("anodise");
  const [livraison, setLivraison] = useState("livraison");
  const [coefficient, setCoefficient] = useState("1.75");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mgk-calc-code");
      if (saved) { setCode(saved); setUnlocked(true); }
    } catch { /* stockage indisponible */ }
  }, []);

  const aEscalier = troncons.some((t) => t.escalier);

  async function calculer() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/chiffrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          input: {
            client, projet, departement,
            troncons: troncons.map((t) => ({ longueur: parseFloat(t.longueur.replace(",", ".")), escalier: t.escalier })),
            departMur, finMur,
            fixation, gs10Partage,
            verre, teinte,
            hauteurFinie: parseFloat(hauteur.replace(",", ".")),
            penteEscalier: parseFloat(pente.replace(",", ".")),
            couleur, livraison,
            coefficient: parseFloat(coefficient.replace(",", ".")),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { setUnlocked(false); try { localStorage.removeItem("mgk-calc-code"); } catch { /* ignore */ } }
        throw new Error(data.error ?? "Erreur inconnue.");
      }
      try { localStorage.setItem("mgk-calc-code", code); } catch { /* ignore */ }
      setUnlocked(true);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  function copier() {
    if (!result) return;
    const r = result;
    const md = [
      "RÉCAPITULATIF DEVIS", "",
      `| Donnée | Valeur |`, `|---|---|`,
      `| Client | ${client || "—"}${departement ? ` — dept ${departement}` : ""} |`,
      `| Projet | ${projet || "—"} |`,
      `| Longueur totale | ${r.longueurTotale} ml |`,
      `| Tronçons | ${r.panneaux.map((p) => `${(p.nb * p.largeurMm / 1000).toFixed(2)} m${p.escalier ? " (escalier)" : ""}`).join(" + ")} (${r.entree.angles} angle(s)) |`,
      `| Fixation | ${r.systeme} |`,
      `| Type verre | ${verre} — ${r.usinage} |`,
      `| Teinte | ${teinte} |`,
      `| Hauteur finie | ${hauteur} cm |`,
      `| Hauteur verre | ${r.hauteurVerre} cm |`,
      `| Nombre de verres | ${r.nbVerres} (${r.panneaux.map((p) => `${p.nb} × ~${p.largeurMm} mm`).join(" + ")}) |`,
      `| Surface verre | ${r.surfaceTotale.toFixed(2)} m² |`,
      `| Supports | ${r.supportsDetail} |`,
      `| Poids verre | ≈ ${Math.round(r.poidsTotal)} kg |`,
      `| Nombre de caisses | ${r.nbCaisses} |`,
      `| Installation | Fourniture seule |`,
      `| Coefficient | ×${r.entree.coefficient} |`,
      `| PRIX TOTAL HT | ${eur(r.prixHT)} |`,
      `| PRIX TOTAL TTC | ${eur(r.prixTTC)} |`,
      `| PRIX HT / ML | ${eur(r.htMl)}/ml |`,
      `| PRIX TTC / ML | ${eur(r.ttcMl)}/ml |`, "",
      "TRANSPORT / CONDITIONNEMENT", "",
      `| Poste | Coût achat |`, `|---|---:|`,
      `| Turquie → France | ${eur(r.logistique.turquie)} |`,
      `| Caisse(s) bois | ${eur(r.logistique.caisses)} |`,
      `| France → client | ${eur(r.logistique.france)} |`,
      `| TOTAL LOGISTIQUE | ${eur(r.logistique.turquie + r.logistique.caisses + r.logistique.france)} |`,
      ...(r.alertes.length ? ["", "ALERTES :", ...r.alertes.map((a) => `- ${a}`)] : []),
    ].join("\n");
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      {/* ---------------- formulaire ---------------- */}
      <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-card sm:p-7">
        {!unlocked && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
            <Field label="Code d'accès interne">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                <input type="password" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="Code MGK" />
              </div>
            </Field>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client"><input value={client} onChange={(e) => setClient(e.target.value)} className={inputCls} placeholder="NOM Prénom" /></Field>
          <Field label="Département"><input value={departement} onChange={(e) => setDepartement(e.target.value)} className={inputCls} placeholder="83" maxLength={3} /></Field>
        </div>

        <div className="mt-4">
          <Field label="Projet">
            <input value={projet} onChange={(e) => setProjet(e.target.value)} className={inputCls} placeholder="terrasse, balcon, escalier…" />
          </Field>
        </div>

        {/* tronçons */}
        <div className="mt-5">
          <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            Tronçons (longueur en m)
          </span>
          <div className="space-y-2">
            {troncons.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={t.longueur}
                  onChange={(e) => setTroncons((ts) => ts.map((x, j) => (j === i ? { ...x, longueur: e.target.value } : x)))}
                  className={inputCls}
                  placeholder={`Tronçon ${i + 1} — ex. 8,30`}
                  inputMode="decimal"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-600">
                  <input
                    type="checkbox"
                    checked={t.escalier}
                    onChange={(e) => setTroncons((ts) => ts.map((x, j) => (j === i ? { ...x, escalier: e.target.checked } : x)))}
                    className="h-4 w-4 rounded border-neutral-300 accent-pine-600"
                  />
                  Escalier
                </label>
                {troncons.length > 1 && (
                  <button type="button" onClick={() => setTroncons((ts) => ts.filter((_, j) => j !== i))} aria-label="Retirer le tronçon"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600">
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setTroncons((ts) => [...ts, { longueur: "", escalier: false }])}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-pine-700 hover:text-pine-600">
            <Plus className="h-3.5 w-3.5" /> Ajouter un tronçon (angle automatique)
          </button>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <input type="checkbox" checked={departMur} onChange={(e) => setDepartMur(e.target.checked)} className="h-4 w-4 rounded accent-pine-600" />
              Départ contre mur
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <input type="checkbox" checked={finMur} onChange={(e) => setFinMur(e.target.checked)} className="h-4 w-4 rounded accent-pine-600" />
              Fin contre mur
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Fixation">
            <select value={fixation} onChange={(e) => setFixation(e.target.value)} className={inputCls}>
              {FIXATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Verre">
            <select value={verre} onChange={(e) => setVerre(e.target.value)} className={inputCls}>
              <option value="88.4">88.4 — norme hauteur</option>
              <option value="66.4">66.4 — norme piscine</option>
              <option value="1010.4">1010.4 — norme publique</option>
            </select>
          </Field>
          <Field label="Teinte">
            <select value={teinte} onChange={(e) => setTeinte(e.target.value)} className={inputCls}>
              <option value="clair">Clair</option>
              <option value="extra-clair">Extra-clair</option>
              <option value="fume-1f">Fumé une face</option>
              <option value="fume-2f">Fumé double face</option>
              <option value="autre">Autre (opale…) → tarif fumé 2F</option>
            </select>
          </Field>
          <Field label="Couleur supports">
            <select value={couleur} onChange={(e) => setCouleur(e.target.value)} className={inputCls}>
              <option value="anodise">Anodisé (défaut)</option>
              <option value="ral-standard">RAL standard (9010 / 9005 / 7016)</option>
              <option value="ral-autre">Autre RAL (+20 % thermolaqué)</option>
            </select>
          </Field>
          <Field label="Hauteur finie (cm)">
            <input value={hauteur} onChange={(e) => setHauteur(e.target.value)} className={inputCls} inputMode="decimal" />
          </Field>
          <Field label="Livraison">
            <select value={livraison} onChange={(e) => setLivraison(e.target.value)} className={inputCls}>
              <option value="livraison">Livraison</option>
              <option value="enlevement">Enlèvement (0 €)</option>
              <option value="inconnu">Non précisé</option>
            </select>
          </Field>
          {aEscalier && (
            <Field label="Pente escalier (°)">
              <input value={pente} onChange={(e) => setPente(e.target.value)} className={inputCls} inputMode="decimal" />
            </Field>
          )}
          {fixation === "GS-10" && (
            <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-xs font-semibold text-neutral-600">
              <input type="checkbox" checked={gs10Partage} onChange={(e) => setGs10Partage(e.target.checked)} className="h-4 w-4 rounded accent-pine-600" />
              Pinces partagées (N+1)
            </label>
          )}
          <Field label="Coefficient">
            <input value={coefficient} onChange={(e) => setCoefficient(e.target.value)} className={inputCls} inputMode="decimal" />
          </Field>
        </div>

        <button
          type="button"
          onClick={calculer}
          disabled={loading}
          className="group mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-pine-700 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-pine-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          Chiffrer la fourniture
        </button>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      </div>

      {/* ---------------- résultat ---------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-pine-900 p-6 text-white shadow-panel sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
        <div className="relative">
          {!result ? (
            <div className="flex h-full min-h-[24rem] flex-col items-center justify-center text-center">
              <Calculator className="h-10 w-10 text-pine-300/60" />
              <p className="mt-4 max-w-xs text-sm text-pine-100/60">
                Renseignez la demande client à gauche — le chiffrage complet s&apos;affiche ici.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-pine-300">Récapitulatif devis</p>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums text-white">
                    {eur(result.prixTTC)} <span className="text-base font-bold text-pine-200">TTC</span>
                  </p>
                  <p className="mt-1 text-sm text-pine-100/70">
                    {eur(result.prixHT)} HT · {eur(result.ttcMl)}/ml TTC · coef ×{result.entree.coefficient}
                  </p>
                </div>
                <button type="button" onClick={copier}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copié" : "Copier le récap"}
                </button>
              </div>

              {result.alertes.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.alertes.map((a, i) => (
                    <p key={i} className="flex items-start gap-2 rounded-xl bg-amber-500/15 px-3.5 py-2.5 text-xs font-semibold leading-snug text-amber-300">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {a}
                    </p>
                  ))}
                </div>
              )}

              <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                {[
                  ["Fixation", result.systeme],
                  ["Verre", `${verre} — ${result.usinage} (${result.prixVerreM2} €/m²)`],
                  ["Hauteur verre", `${result.hauteurVerre} cm (finie ${hauteur} cm)`],
                  ["Calepinage", result.panneaux.map((p) => `${p.nb} × ~${p.largeurMm} mm${p.escalier ? " (esc.)" : ""}`).join(" + ")],
                  ["Surface / poids", `${result.surfaceTotale.toFixed(2)} m² · ≈ ${Math.round(result.poidsTotal)} kg · ${result.nbCaisses} caisse(s)`],
                  ["Supports", result.supportsDetail],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-pine-300">{k}</dt>
                    <dd className="text-right font-semibold text-pine-50">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-300">Détail coût d&apos;achat</p>
                <div className="mt-3 space-y-1.5">
                  {result.lignes.map((l, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="min-w-0 flex-1 truncate text-pine-100/80">{l.label} <span className="text-pine-100/45">· {l.detail}</span></span>
                      <span className="shrink-0 font-bold tabular-nums text-pine-50">{eur(l.montant)}</span>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-3 border-t border-white/15 pt-2 text-sm">
                    <span className="font-bold text-white">Coût d&apos;achat total</span>
                    <span className="font-extrabold tabular-nums text-white">{eur(result.coutAchat)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-pine-100/50">
                Fourniture seule — la pose n&apos;est jamais chiffrée. Transport et conditionnement inclus
                dans les prix HT/TTC, détaillés pour contrôle.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
