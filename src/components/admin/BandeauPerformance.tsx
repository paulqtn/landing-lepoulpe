import Link from "next/link";
import { ArrowRight, Hourglass, Percent, ShoppingBag, Signature, Sparkles, Target, TrendingUp, Wallet } from "lucide-react";
import { Compteur } from "@/components/admin/Compteur";
import type { getCompSettings, repStats } from "@/lib/admin/compens";

/* Bandeau de performance du commercial, en tête de l'accueil : chiffre signé, prime, avancée
   vers le bonus, puis quatre repères du mois. Mêmes chiffres qu'avant, mis en scène. */

const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const RAYON = 30;
const TOUR = 2 * Math.PI * RAYON;

export function BandeauPerformance({ perso, comp, lien = true }: { perso: ReturnType<typeof repStats>; comp: Awaited<ReturnType<typeof getCompSettings>>; /** Bouton vers les statistiques (inutile sur la page des statistiques elle-même). */ lien?: boolean }) {
  const pct = Math.max(0, Math.min(100, perso.pctObjectif));
  const debloque = perso.resteObjectif <= 0;
  const reperes: { icon: typeof Percent; label: string; valeur: React.ReactNode; detail?: string }[] = [
    { icon: Percent, label: "Taux de signature", valeur: perso.tauxSignature !== null ? `${perso.tauxSignature} %` : "—", detail: perso.tauxSignature === null ? "pas encore d'affaire close" : undefined },
    { icon: Signature, label: "Affaires signées", valeur: perso.signees, detail: `${perso.perdues} non signée${perso.perdues > 1 ? "s" : ""}` },
    { icon: Hourglass, label: "En cours", valeur: perso.enCours, detail: `${eur.format(perso.enCoursTTC)} € TTC` },
    { icon: ShoppingBag, label: "Panier moyen", valeur: `${eur.format(perso.panierMoyen)} €` },
  ];

  return (
    <section className="mgk-perf relative isolate overflow-hidden rounded-3xl bg-pine-950 p-5 text-white shadow-elevated sm:p-6" aria-label="Ma performance du mois">
      {/* décor : halos et trame discrète */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#0c3626_0%,#062017_55%,#0c3626_100%)]" />
        <div className="mgk-halo absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-pine-500/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]">
        {/* chiffre signé */}
        <div className="rounded-2xl bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-pine-200">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-amber-400"><TrendingUp className="h-4 w-4" /></span>
            Signé ce mois-ci
          </p>
          <p className="mt-3 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            <Compteur valeur={perso.caMois} /> <span className="text-2xl font-bold text-pine-200 sm:text-3xl">€</span>
          </p>
          <p className="mt-2 text-sm text-pine-200">HT · marge brute <strong className="font-bold text-white">{eur.format(perso.margeMois)} €</strong></p>
        </div>

        {/* prime */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/[0.07] to-transparent p-4 ring-1 ring-inset ring-amber-400/30 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-pine-950"><Wallet className="h-4 w-4" /></span>
            Ma prime du mois
          </p>
          <p className="mt-3 text-4xl font-extrabold leading-none tracking-tight text-amber-400 sm:text-5xl">
            <Compteur valeur={perso.primeMois} /> <span className="text-2xl font-bold sm:text-3xl">€</span>
          </p>
          <p className="mt-2 text-sm text-pine-100">
            {comp.tauxMarge} % de la marge : <strong className="font-bold text-white">{eur.format(perso.commissionMois)} €</strong>
            {perso.bonusMois > 0 ? <> + bonus <strong className="font-bold text-amber-300">{eur.format(perso.bonusMois)} €</strong></> : null}
          </p>
          {perso.margesManquantes > 0 && (
            <p className="mt-2 text-xs font-semibold text-amber-300">
              {perso.margesManquantes} affaire{perso.margesManquantes > 1 ? "s" : ""} signée{perso.margesManquantes > 1 ? "s" : ""} sans marge enregistrée : non comptée{perso.margesManquantes > 1 ? "s" : ""} pour l&rsquo;instant.
            </p>
          )}
        </div>

        {/* objectif de bonus */}
        <div className="flex items-center gap-4 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10 sm:gap-5 sm:p-5">
          <div className="relative h-[84px] w-[84px] shrink-0" role="img" aria-label={`Objectif de bonus atteint à ${pct} %`}>
            <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
              <circle cx="38" cy="38" r={RAYON} fill="none" stroke="currentColor" strokeWidth="7" className="text-white/10" />
              <circle
                cx="38" cy="38" r={RAYON} fill="none" strokeWidth="7" strokeLinecap="round"
                stroke="url(#mgk-degrade-bonus)" strokeDasharray={TOUR} strokeDashoffset={TOUR * (1 - pct / 100)}
                className="mgk-anneau" style={{ "--depart": TOUR } as React.CSSProperties}
              />
              <defs>
                <linearGradient id="mgk-degrade-bonus" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f6a723" />
                  <stop offset="100%" stopColor="#ffd98a" />
                </linearGradient>
              </defs>
            </svg>
            <span aria-hidden className="absolute inset-0 flex items-center justify-center text-lg font-extrabold tabular-nums">{pct}<span className="-mt-0.5 ml-0.5 text-xs font-bold text-pine-200">%</span></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-pine-200">
              {debloque ? <Sparkles className="h-3.5 w-3.5 text-amber-400" /> : <Target className="h-3.5 w-3.5 text-amber-400" />}
              {debloque ? "Bonus débloqué" : "Objectif bonus"}
            </p>
            <p className="mt-1.5 text-lg font-extrabold leading-snug">
              {debloque ? (
                <>{perso.tranchesBonus} × {eur.format(comp.bonusParTranche)} € <span className="font-semibold text-pine-200">déjà gagnés</span></>
              ) : (
                <>Encore <span className="text-amber-400">{eur.format(perso.resteObjectif)} €</span> <span className="font-semibold text-pine-200">HT à signer</span></>
              )}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="mgk-jauge mgk-brillance h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-pine-200">
              {debloque
                ? `Encore ${eur.format(perso.resteProchaineTranche)} € HT pour la tranche suivante (+${eur.format(comp.bonusParTranche)} €).`
                : `+${eur.format(comp.bonusParTranche)} € dès ${eur.format(comp.seuilCA)} € HT, puis +${eur.format(comp.bonusParTranche)} € tous les ${eur.format(comp.tranche)} €.`}
            </p>
          </div>
        </div>
      </div>

      {/* repères du mois */}
      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-stretch">
        <ul className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 xl:flex-1">
          {reperes.map((r) => (
            <li key={r.label} className="mgk-repere flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-inset ring-white/[0.08]">
              <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-pine-200 sm:grid"><r.icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-pine-200">{r.label}</p>
                <p className="text-lg font-extrabold leading-tight tabular-nums">
                  {r.valeur}
                  {r.detail && <span className="block text-xs font-semibold text-pine-200 sm:ml-1.5 sm:inline">{r.detail}</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {lien && <Link href="/commercial/stats" className="mgk-cta group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-pine-950 shadow-sm hover:bg-amber-400">
          Mes stats détaillées
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>}
      </div>
    </section>
  );
}
