import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { boutonPrincipalCls, boutonSecondaireCls, dateFmt, eurFmt, EtatVide, Onglets, ScoreBadge } from "@/components/admin/ui";
import { currentRep, requireMenu, voitTout } from "@/lib/admin/auth";
import { listLeads, listDevisATraiter } from "@/lib/admin/db";
import { USAGE_LABELS } from "@/lib/admin/statuts";
import { PrepareQuoteButton } from "@/components/admin/QuoteEditor";

export const dynamic = "force-dynamic";

/* Devis à traiter — les demandes qui attendent leur chiffrage :
   relecture du brouillon généré, puis envoi après validation. */

export default async function DevisPage({ searchParams }: { searchParams: Promise<{ qui?: string }> }) {
  const me = await requireMenu("devis");
  const [{ qui }, rep, tous] = await Promise.all([searchParams, currentRep(), listDevisATraiter(undefined, 1000)]);
  const equipe = voitTout(me);
  const mode = equipe && (qui === "tous" || !rep) ? "tous" : "moi";
  const base = tous;
  // Déjà triés : demandes de modification d'abord, puis par ordre d'arrivée.
  const list = mode === "moi" ? base.filter((l) => l.assigned_to === rep) : base;

  const age = (iso: string) => {
    const hrs = Math.round((Date.now() - Number(new Date(iso))) / 3600_000);
    return hrs < 24 ? `${hrs} h` : `${Math.round(hrs / 24)} j`;
  };

  const nbMiens = base.filter((l) => l.assigned_to === rep).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Devis à traiter</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-600">
          Nouvelles demandes, devis à modifier après un appel et brouillons pas encore envoyés. Relisez, choisissez le prix, puis validez l&rsquo;envoi.
        </p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white">
        {rep && equipe && (
          <Onglets
            label="Portée de la liste"
            items={[
              { href: "/commercial/devis", label: "Les miens", n: nbMiens, on: mode === "moi" },
              { href: "/commercial/devis?qui=tous", label: "Toute l'équipe", n: base.length, on: mode === "tous" },
            ]}
          />
        )}
        {list.length === 0 ? (
          <EtatVide
            encadre={false}
            icon={<FileCheck2 className="h-6 w-6" />}
            titre={mode === "moi" ? "Aucun devis ne vous attend" : "Aucun devis en attente"}
            texte={mode === "moi" ? "Tout est envoyé. Prenez une nouvelle demande dans la file pour préparer son devis." : "Tous les devis de l'équipe sont partis."}
          >
            <Link href="/commercial#pioche" className={boutonPrincipalCls}>Voir les demandes à piocher</Link>
            <Link href="/commercial/clients" className={boutonSecondaireCls}>Mes clients</Link>
          </EtatVide>
        ) : (
          <ul className="divide-y divide-neutral-100 px-5">
            {list.map((l) => {
              const a = (l.answers ?? {}) as Record<string, unknown>;
              const cotes = Array.isArray(a.cotes) ? (a.cotes as number[]).join(" + ") : null;
              const usage = typeof a.lieu === "string" ? USAGE_LABELS[a.lieu] ?? a.lieu : null;
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2.5 py-3.5">
                  <ScoreBadge score={l.score} points={l.score_points} />
                  <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                      {l.statut === "devis_a_modifier" ? (
                        <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200">Devis à modifier</span>
                      ) : l.statut !== "nouveau" ? (
                        <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 ring-1 ring-inset ring-sky-200">Brouillon non envoyé</span>
                      ) : null}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {usage ? `${usage} · ` : ""}
                      {cotes ? `${cotes} m · ` : ""}
                      {a.hauteur ? `h${a.hauteur} · ` : ""}
                      reçu il y a {age(String(l.created_at))} ({dateFmt.format(new Date(l.created_at))})
                      {mode === "tous" && l.assigned_to ? ` · ${l.assigned_to}` : ""}
                    </span>
                  </Link>
                  {l.estimation_ttc ? (
                    <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">sans estimation</span>
                  )}
                  <Link href={`/commercial/clients/${l.id}`} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-mist hover:text-pine-700">
                    Fiche
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <PrepareQuoteButton leadId={l.id} label={l.statut === "devis_a_modifier" && !l.devis_brouillon_id ? "Refaire le devis" : "Relire et envoyer le devis"} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
