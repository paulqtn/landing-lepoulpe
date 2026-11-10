import Link from "next/link";
import { Factory, PackageCheck, Trophy } from "lucide-react";
import { CreateOrderButton } from "@/components/admin/LogisticsActions";
import { eurFmt, ScoreBadge } from "@/components/admin/ui";
import { listLeads } from "@/lib/admin/db";
import { listOrders, ORDER_LABELS, type OrderStatut } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* Mise en production — le pont commercial → atelier : chaque affaire
   gagnée part en fabrication en un clic, puis se suit d'ici. */

const ORDER_COLORS: Record<OrderStatut, string> = {
  a_preparer: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  decoupe: "bg-sky-50 text-sky-700 ring-sky-200",
  faconnage: "bg-violet-50 text-violet-700 ring-violet-200",
  pret: "bg-pine-50 text-pine-700 ring-pine-200",
  expedie: "bg-green-50 text-green-700 ring-green-200",
  livre: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

const SYS_LABEL: Record<string, string> = { rail: "Rail", pinces: "Pinces", spider: "Spider", conseil: "À définir" };

export default async function ProductionPage() {
  const [leads, orders] = await Promise.all([listLeads({ limit: 500 }), listOrders()]);
  const withOrder = new Set(orders.map((o) => o.lead_id).filter(Boolean));
  const aLancer = leads.filter((l) => l.statut === "gagne" && !withOrder.has(l.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Mise en production</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Les affaires gagnées partent à l&rsquo;atelier d&rsquo;ici — le suivi fin (découpe, stock, tournées)
          vivra dans l&rsquo;espace Logistique.
        </p>
      </div>

      <section className="rounded-2xl border border-green-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <Trophy className="h-4 w-4 text-green-600" />
          Gagnées — à lancer en fabrication
          <span className="ml-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">{aLancer.length}</span>
        </h2>
        {aLancer.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">
            Rien en attente — marquez une affaire « Gagné » sur sa fiche client pour la voir ici.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {aLancer.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <ScoreBadge score={l.score} />
                <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                  <span className="block text-xs text-neutral-400">{l.source ?? "site"}</span>
                </Link>
                {l.estimation_ttc && (
                  <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                )}
                <CreateOrderButton leadId={l.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <Factory className="h-4 w-4 text-pine-600" />
          En production
          <span className="ml-1 rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-neutral-500">
            {orders.filter((o) => o.statut !== "livre").length}
          </span>
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
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
                  <td className="py-3 pr-3 text-xs text-neutral-500">
                    {o.ml ?? "?"} ml · {o.verre ?? "?"} · h{o.hauteur ?? "?"} · {SYS_LABEL[o.systeme ?? ""] ?? o.systeme ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-sm font-extrabold tabular-nums text-inkgreen">
                    {o.montant_ttc ? `${eurFmt.format(Number(o.montant_ttc))} €` : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${ORDER_COLORS[o.statut]}`}>
                      {o.statut === "livre" && <PackageCheck className="h-3.5 w-3.5" />}
                      {ORDER_LABELS[o.statut]}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-neutral-400">Aucune commande en production.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
