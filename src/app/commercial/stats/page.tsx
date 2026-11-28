import { CalendarDays, Clock, Factory, Filter, Gauge, Inbox, MapPinned, PackageSearch, PiggyBank, Radar, ShoppingBag, Target, Trophy, Users } from "lucide-react";
import { BandeauPerformance } from "@/components/admin/BandeauPerformance";
import { Compteur } from "@/components/admin/Compteur";
import { eurFmt, EtatVide } from "@/components/admin/ui";
import { currentRep, requireMenu, voitTout } from "@/lib/admin/auth";
import { getCompSettings, repStats } from "@/lib/admin/compens";
import { listLeadsLight } from "@/lib/admin/db";
import { globalStats, ORDER_LABELS } from "@/lib/admin/logistics";
import { USAGE_LABELS } from "@/lib/admin/statuts";
import { getTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

/* Statistiques — la performance d'abord (la sienne pour un commercial, celle de l'équipe pour un
   administrateur), puis les volumes, l'entonnoir, l'origine des demandes et la production. */

const jourFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "short" });

function Carte({ icon: Icon, titre, sous, children, className = "" }: { icon: typeof Gauge; titre: string; sous?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white p-5 ${className}`}>
      <h2 className="flex items-center gap-2.5 text-base font-extrabold text-inkgreen">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pine-50 text-pine-700"><Icon className="h-4 w-4" /></span>
        {titre}
      </h2>
      {sous && <p className="mt-1 text-xs text-neutral-500">{sous}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Barre horizontale : libellé, jauge qui se remplit, valeur et part du total. */
function Barre({ label, valeur, max, total, detail, couleur = "bg-pine-600" }: { label: string; valeur: number; max: number; total?: number; detail?: string; couleur?: string }) {
  const part = total ? Math.round((valeur / Math.max(1, total)) * 100) : null;
  return (
    <div className="group">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-neutral-700">{label}{detail && <span className="ml-2 text-xs font-bold text-pine-700">{detail}</span>}</span>
        <span className="shrink-0 font-extrabold tabular-nums text-inkgreen">{valeur}{part !== null && <span className="ml-1.5 text-xs font-semibold text-neutral-500">{part} %</span>}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mist">
        <div className={`mgk-jauge h-full rounded-full ${couleur} transition-opacity group-hover:opacity-80`} style={{ width: `${valeur > 0 ? Math.max(2, (valeur / Math.max(1, max)) * 100) : 0}%` }} />
      </div>
    </div>
  );
}

/** Volume quotidien : barres sur 30 jours, le jour courant en ambre. */
function Volume({ data }: { data: { d: string; n: number }[] }) {
  const max = Math.max(1, ...data.map((p) => p.n));
  const total = data.reduce((s, p) => s + p.n, 0);
  const meilleur = data.reduce((m, p) => (p.n > m.n ? p : m), data[0]);
  return (
    <>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        <p><span className="block text-3xl font-extrabold tabular-nums leading-none text-inkgreen"><Compteur valeur={total} /></span><span className="text-xs font-semibold text-neutral-500">demandes sur 30 jours</span></p>
        <p><span className="block text-lg font-extrabold tabular-nums leading-tight text-inkgreen">{String(Math.round((total / 30) * 10) / 10).replace(".", ",")}</span><span className="text-xs font-semibold text-neutral-500">par jour en moyenne</span></p>
        {meilleur && meilleur.n > 0 && <p><span className="block text-lg font-extrabold tabular-nums leading-tight text-inkgreen">{meilleur.n}</span><span className="text-xs font-semibold text-neutral-500">le {jourFmt.format(new Date(meilleur.d))}, meilleur jour</span></p>}
      </div>
      <div className="mt-5 flex h-32 items-end gap-[3px]" role="img" aria-label={`Demandes par jour sur 30 jours : ${total} au total`}>
        {data.map((p, i) => (
          <div key={p.d} className="group relative flex h-full flex-1 items-end" title={`${jourFmt.format(new Date(p.d))} : ${p.n} demande${p.n > 1 ? "s" : ""}`}>
            <div className={`mgk-colonne w-full rounded-t-[4px] transition-colors ${i === data.length - 1 ? "bg-amber-500" : p.n > 0 ? "bg-pine-600/80 group-hover:bg-pine-700" : "bg-neutral-200"}`} style={{ height: `${p.n > 0 ? Math.max(6, (p.n / max) * 100) : 3}%`, animationDelay: `${i * 12}ms` }} />
          </div>
        ))}
      </div>
      <p className="mt-2 flex justify-between text-xs font-semibold text-neutral-500"><span>{jourFmt.format(new Date(data[0].d))}</span><span className="text-amber-700">aujourd&rsquo;hui</span></p>
    </>
  );
}

export default async function StatsPage() {
  const me = await requireMenu("stats");
  // Un commercial ne voit que ses propres chiffres ; les administrateurs voient toute l'équipe.
  const moi = voitTout(me) ? undefined : me.name;
  const [rep, leads, g] = await Promise.all([currentRep(), listLeadsLight(moi ? { assigned: moi } : {}), globalStats(moi)]);
  const perso = Boolean(moi); // toute la page se lit alors à la première personne
  const team = moi ? [moi] : await getTeam();
  const reps = moi ? [moi] : [...new Set([...team, ...leads.map((l) => l.assigned_to).filter((x): x is string => Boolean(x))])];
  const comp = await getCompSettings();
  const perReps = reps.map((r) => repStats(leads, r, comp)).sort((a, b) => b.caMois - a.caMois);
  const srcMax = Math.max(1, ...g.sources.map((x) => x.n));
  const srcTotal = g.sources.reduce((s, x) => s + x.n, 0);
  const usgMax = Math.max(1, ...g.usages.map((x) => x.n));
  const usgTotal = g.usages.reduce((s, x) => s + x.n, 0);
  const scoreTotal = g.scores.A + g.scores.B + g.scores.C;
  const commandes = g.ordersParStatut.reduce((s, o) => s + o.n, 0);
  const recues = g.funnel[0]?.n ?? 0;

  const cles: { icon: typeof Gauge; label: string; valeur: number; suffixe: string; aide: string }[] = [
    { icon: Inbox, label: perso ? "Mes demandes" : "Demandes reçues", valeur: g.parJour.reduce((s, p) => s + p.n, 0), suffixe: "", aide: "sur 30 jours" },
    { icon: Target, label: perso ? "Mon taux de signature" : "Taux de conversion", valeur: g.tauxConversion, suffixe: " %", aide: "des demandes reçues sont signées" },
    { icon: PiggyBank, label: perso ? "Mes affaires en cours" : "Affaires en cours", valeur: g.pipelineTTC, suffixe: " €", aide: "TTC, non encore signées" },
    { icon: ShoppingBag, label: perso ? "Mon panier moyen" : "Panier moyen", valeur: g.panierMoyen, suffixe: " €", aide: "estimation TTC par demande" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">{perso ? "Mes statistiques" : "Statistiques"}</h1>
        <p className="mt-1 text-sm text-neutral-600">{perso ? "Tous les chiffres de cette page ne concernent que vos clients et vos affaires." : "Toute l'équipe, toutes les demandes."}</p>
      </div>

      {/* ------------------ la performance ------------------ */}
      {perso ? (
        perReps[0] && <BandeauPerformance perso={perReps[0]} comp={comp} lien={false} />
      ) : (
        <Carte icon={Trophy} titre="Performance par commercial" sous={`Prime du mois = ${comp.tauxMarge} % de la marge brute + ${eurFmt.format(comp.bonusParTranche)} € dès ${eurFmt.format(comp.seuilCA)} € de CA HT, puis ${eurFmt.format(comp.bonusParTranche)} € par tranche de ${eurFmt.format(comp.tranche)} €.`}>
          {perReps.length === 0 ? (
            <EtatVide encadre={false} icon={<Users className="h-6 w-6" />} titre="Aucun commercial pour l'instant" texte="Les chiffres apparaîtront dès qu'un client sera attribué." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-bold uppercase tracking-wide text-neutral-500">
                    <th className="py-2.5 pr-3">Commercial</th>
                    <th className="py-2.5 pr-3 text-right">Signé ce mois</th>
                    <th className="py-2.5 pr-3 text-right">Prime</th>
                    <th className="py-2.5 pr-3">Objectif bonus</th>
                    <th className="py-2.5 pr-3 text-right">Signées</th>
                    <th className="py-2.5 pr-3 text-right">Taux</th>
                    <th className="py-2.5 pr-3 text-right">En cours</th>
                    <th className="py-2.5 text-right">Panier moyen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {perReps.map((p, i) => (
                    <tr key={p.rep} className={`transition-colors hover:bg-amber-500/[0.05] ${p.rep === rep ? "bg-pine-50/60" : ""}`}>
                      <td className="py-3 pr-3">
                        <span className="flex items-center gap-2.5">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${i === 0 && p.caMois > 0 ? "bg-amber-500 text-pine-950" : "bg-mist text-neutral-600"}`}>{i === 0 && p.caMois > 0 ? <Trophy className="h-4 w-4" /> : i + 1}</span>
                          <span className="font-bold text-inkgreen">{p.rep}</span>
                          {p.rep === rep && <span className="rounded-full bg-pine-700 px-2 py-0.5 text-xs font-bold text-white">vous</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-inkgreen">{eurFmt.format(p.caMois)} €</td>
                      <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-amber-700">{eurFmt.format(p.primeMois)} €{p.margesManquantes > 0 ? " *" : ""}</td>
                      <td className="py-3 pr-3">
                        <span className="flex items-center gap-2.5">
                          <span className="h-2 w-28 overflow-hidden rounded-full bg-mist"><span className="mgk-jauge block h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${p.pctObjectif}%` }} /></span>
                          <span className="w-10 text-xs font-bold tabular-nums text-neutral-600">{p.pctObjectif} %</span>
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums"><strong className="font-extrabold text-inkgreen">{p.signees}</strong> <span className="text-xs text-neutral-500">/ {p.perdues} non signée{p.perdues > 1 ? "s" : ""}</span></td>
                      <td className="py-3 pr-3 text-right font-bold tabular-nums">{p.tauxSignature !== null ? `${p.tauxSignature} %` : "—"}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-neutral-700">{eurFmt.format(p.enCoursTTC)} €</td>
                      <td className="py-3 text-right tabular-nums text-neutral-700">{eurFmt.format(p.panierMoyen)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {perReps.some((p) => p.margesManquantes > 0) && <p className="mt-2 text-xs text-neutral-500">* des affaires signées n&rsquo;ont pas encore de marge enregistrée : elles ne sont pas comptées dans la prime.</p>}
            </div>
          )}
        </Carte>
      )}

      {/* ------------------ les quatre chiffres clés ------------------ */}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cles.map((k) => (
          <li key={k.label} className="mgk-tuile flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-700"><k.icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-2xl font-extrabold leading-tight text-inkgreen"><Compteur valeur={k.valeur} suffixe={k.suffixe} /></span>
              <span className="block text-sm font-bold text-neutral-800">{k.label}</span>
              <span className="block text-xs text-neutral-500">{k.aide}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-3">
        <Carte icon={CalendarDays} titre={perso ? "Mes demandes, jour par jour" : "Demandes, jour par jour"} className="xl:col-span-2">
          <Volume data={g.parJour} />
        </Carte>

        {/* entonnoir : chaque étape avec ce qu'il reste de l'étape précédente */}
        <Carte icon={Filter} titre={perso ? "Mon entonnoir" : "Entonnoir de conversion"} sous="De la demande à la signature.">
          {recues === 0 ? (
            <p className="text-sm text-neutral-500">Pas encore de demande.</p>
          ) : (
            <ol className="space-y-2">
              {g.funnel.map((f, i) => {
                const part = Math.round((f.n / Math.max(1, recues)) * 100);
                const passage = i > 0 ? Math.round((f.n / Math.max(1, g.funnel[i - 1].n)) * 100) : null;
                return (
                  <li key={f.label}>
                    {passage !== null && <p className="mb-2 pl-3 text-xs font-bold text-neutral-500">↓ {passage} % passent à l&rsquo;étape suivante</p>}
                    <div className="mx-auto" style={{ width: `${Math.max(62, part)}%` }}>
                      <div className={`mgk-jauge flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 ${i === g.funnel.length - 1 ? "bg-amber-500 text-pine-950" : i === 0 ? "bg-pine-800 text-white" : "bg-pine-700 text-white"}`}>
                        <span className="min-w-0 text-sm font-bold leading-tight">{f.label}</span>
                        <span className="shrink-0 text-lg font-extrabold tabular-nums">{f.n}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Carte>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Carte icon={Radar} titre={perso ? "Origine de mes clients" : "Meilleures sources"} sous="D'où viennent les demandes, et lesquelles signent.">
          {g.sources.length === 0 ? <p className="text-sm text-neutral-500">Pas encore de données.</p> : (
            <div className="space-y-3.5">
              {g.sources.map((x) => <Barre key={x.source} label={x.source} valeur={x.n} max={srcMax} total={srcTotal} detail={x.gagnes ? `${x.gagnes} signée${x.gagnes > 1 ? "s" : ""}` : undefined} />)}
            </div>
          )}
        </Carte>

        <Carte icon={MapPinned} titre={perso ? "Mes projets par usage" : "Projets par usage"} sous="Ce que les clients veulent équiper.">
          {g.usages.length === 0 ? <p className="text-sm text-neutral-500">Pas encore de données.</p> : (
            <div className="space-y-3.5">
              {g.usages.map((u) => <Barre key={u.usage} label={USAGE_LABELS[u.usage] ?? u.usage} valeur={u.n} max={usgMax} total={usgTotal} couleur="bg-teal-600" />)}
            </div>
          )}
        </Carte>

        {/* scores : une seule barre partagée entre A, B et C */}
        <Carte icon={Gauge} titre={perso ? "Scores de mes demandes" : "Scores des demandes"} sous="A : à appeler en priorité · B : à relancer · C : à nourrir." className="lg:col-span-2 xl:col-span-1">
          {scoreTotal === 0 ? <p className="text-sm text-neutral-500">Pas encore de données.</p> : (
            <>
              <div className="flex h-4 overflow-hidden rounded-full bg-mist" role="img" aria-label={`Score A : ${g.scores.A}, score B : ${g.scores.B}, score C : ${g.scores.C}`}>
                {([["A", "bg-green-600"], ["B", "bg-amber-500"], ["C", "bg-neutral-300"]] as const).map(([k, c]) => g.scores[k] > 0 && <div key={k} className={`mgk-jauge h-full ${c}`} style={{ width: `${(g.scores[k] / scoreTotal) * 100}%` }} />)}
              </div>
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {([["A", "bg-green-600", "prioritaires"], ["B", "bg-amber-500", "à relancer"], ["C", "bg-neutral-300", "à nourrir"]] as const).map(([k, c, l]) => (
                  <li key={k} className="rounded-xl bg-mist/70 px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-700"><span className={`h-2.5 w-2.5 rounded-full ${c}`} /> Score {k}</p>
                    <p className="mt-0.5 text-xl font-extrabold tabular-nums leading-tight text-inkgreen">{g.scores[k]} <span className="text-xs font-semibold text-neutral-600">{Math.round((g.scores[k] / scoreTotal) * 100)} %</span></p>
                    <p className="text-xs text-neutral-600">{l}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Carte>
      </div>

      {/* ------------------ production ------------------ */}
      <Carte icon={Factory} titre={perso ? "Mes affaires en production" : "Production et logistique"} sous={perso ? "Où en sont vos affaires signées à l'atelier." : "Les commandes, étape par étape."}>
        {commandes === 0 ? (
          <EtatVide encadre={false} icon={<PackageSearch className="h-6 w-6" />} titre="Aucune commande à l'atelier" texte={perso ? "Vos affaires signées apparaîtront ici dès qu'elles seront lancées en production." : "Les commandes lancées en production apparaîtront ici."} />
        ) : (
          <>
            <ol className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {g.ordersParStatut.map((o, i) => (
                <li key={o.statut} className={`relative rounded-xl border px-3.5 py-3 ${o.n > 0 ? "border-pine-200 bg-pine-50/60" : "border-neutral-200 bg-white"}`}>
                  <p className="text-xs font-bold text-neutral-600"><span className="mr-1.5 tabular-nums text-neutral-500">{i + 1}</span>{ORDER_LABELS[o.statut]}</p>
                  <p className={`mt-1 text-2xl font-extrabold tabular-nums leading-tight ${o.n > 0 ? "text-inkgreen" : "text-neutral-500"}`}>{o.n}</p>
                  <p className="text-xs tabular-nums text-neutral-600">{o.montant ? `${eurFmt.format(o.montant)} €` : "—"}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-pine-600" /> Délai moyen atelier → expédition : <strong className="font-extrabold text-inkgreen">{g.delaiMoyenJours !== null ? `${String(g.delaiMoyenJours).replace(".", ",")} j` : "—"}</strong></span>
              {!perso && <span>{g.stockAlertes} alerte{g.stockAlertes > 1 ? "s" : ""} de stock</span>}
            </p>
          </>
        )}
      </Carte>
    </div>
  );
}
