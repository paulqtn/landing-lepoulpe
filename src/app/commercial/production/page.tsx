import { requireMenu, voitTout } from "@/lib/admin/auth";
import Link from "next/link";
import { CheckCircle2, Factory, PackageCheck, Trophy } from "lucide-react";
import { CreateOrderButton } from "@/components/admin/LogisticsActions";
import { Carte, EnTete, eurFmt, pastilleCls, Rien, ScoreBadge } from "@/components/admin/ui";
import { listLeads } from "@/lib/admin/db";
import { listOrders, ORDER_LABELS, type OrderStatut } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* Mise en production — le pont commercial → atelier : chaque affaire
   gagnée part en fabrication en un clic, puis se suit d'ici. */

const ORDER_COLORS: Record<OrderStatut, string> = {
  a_preparer: "bg-amber-500/15 text-amber-800 ring-amber-500/30",
  decoupe: "bg-sky-50 text-sky-700 ring-sky-200",
  faconnage: "bg-violet-50 text-violet-700 ring-violet-200",
  pret: "bg-pine-50 text-pine-700 ring-pine-200",
  expedie: "bg-green-50 text-green-700 ring-green-200",
  livre: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

const SYS_LABEL: Record<string, string> = { rail: "Rail", pinces: "Pinces", spider: "Spider", conseil: "À définir" };

export default async function ProductionPage() {
  const me = await requireMenu("production");
  const [tousLeads, toutesCommandes] = await Promise.all([listLeads({ statut: "gagne", limit: 1000 }), listOrders()]);
  // Un commercial ne voit que ses affaires signées et leurs commandes.
  const equipe = voitTout(me);
  const leads = equipe ? tousLeads : tousLeads.filter((l) => l.assigned_to === me.name);
  const miens = new Set(leads.map((l) => l.id));
  const orders = equipe ? toutesCommandes : toutesCommandes.filter((o) => o.lead_id !== null && miens.has(o.lead_id));
  const withOrder = new Set(orders.map((o) => o.lead_id).filter(Boolean));
  const aLancer = leads.filter((l) => l.statut === "gagne" && !withOrder.has(l.id));

  return (
    <div className="space-y-6">
      <EnTete titre="Mise en production" sous="Les affaires signées partent à l'atelier d'ici — le suivi fin (découpe, stock, tournées) vivra dans l'espace Logistique." />

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Commandes par étape">
        {(Object.keys(ORDER_LABELS) as OrderStatut[]).map((s, i) => {
          const n = orders.filter((o) => o.statut === s).length;
          return (
            <li key={s} className={`rounded-xl border px-3.5 py-3 ${n > 0 ? "border-pine-200 bg-white" : "border-neutral-200 bg-white/60"}`}>
              <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-600"><span className="tabular-nums text-neutral-600">{i + 1}</span>{ORDER_LABELS[s]}</p>
              <p className={`mt-0.5 text-2xl font-extrabold tabular-nums ${n > 0 ? "text-inkgreen" : "text-neutral-600"}`}>{n}</p>
            </li>
          );
        })}
      </ol>

      <Carte icon={Trophy} titre="Signées — à lancer en fabrication" n={aLancer.length} ton="vert">
        {aLancer.length === 0 ? (
          <Rien icon={CheckCircle2}>Rien en attente — marquez une affaire « Signé » sur sa fiche client pour la voir ici.</Rien>
        ) : (
          <ul className="-my-1 divide-y divide-neutral-100">
            {aLancer.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <ScoreBadge score={l.score} />
                <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                  <span className="block text-xs text-neutral-600">{l.source ?? "site"}</span>
                </Link>
                {l.estimation_ttc && (
                  <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                )}
                <CreateOrderButton leadId={l.id} />
              </li>
            ))}
          </ul>
        )}
      </Carte>

      <Carte icon={Factory} titre="En production" n={orders.filter((o) => o.statut !== "livre").length}>
        {orders.length === 0 ? (
          <Rien icon={Factory}>Aucune commande en production.</Rien>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wide text-neutral-600">
                <th className="py-2 pr-3">Réf.</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Ouvrage</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 text-right">Avancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-3 font-mono text-xs font-bold text-pine-700">{o.ref}</td>
                  <td className="py-3 pr-3">
                    {o.lead_id ? (
                      <Link href={`/commercial/clients/${o.lead_id}`} className="font-semibold text-inkgreen hover:text-pine-700">
                        {o.client}
                      </Link>
                    ) : (
                      <span className="font-semibold text-inkgreen">{o.client}</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs text-neutral-600">
                    {o.ml ?? "?"} ml · {o.verre ?? "?"} · h{o.hauteur ?? "?"} · {SYS_LABEL[o.systeme ?? ""] ?? o.systeme ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-sm font-extrabold tabular-nums text-inkgreen">
                    {o.montant_ttc ? `${eurFmt.format(Number(o.montant_ttc))} €` : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`${pastilleCls} ${ORDER_COLORS[o.statut]}`}>
                      {o.statut === "livre" && <PackageCheck className="h-3.5 w-3.5" />}
                      {ORDER_LABELS[o.statut]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Carte>
    </div>
  );
}
