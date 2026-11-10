import Link from "next/link";
import { AlertTriangle, Boxes, PackageOpen, Truck } from "lucide-react";
import { AdvanceButton, AssignShipmentSelect, ShipmentCreateForm, StockMoveForm } from "@/components/admin/LogisticsActions";
import { dateFmt, eurFmt } from "@/components/admin/ui";
import {
  listOrders,
  listShipments,
  listStock,
  ORDER_LABELS,
  ORDER_STATUTS,
  SHIPMENT_LABELS,
  SHIPMENT_STATUTS,
  type OrderStatut,
  type ShipmentStatut,
} from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

const ORDER_COLORS: Record<OrderStatut, string> = {
  a_preparer: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  decoupe: "bg-sky-50 text-sky-700 ring-sky-200",
  faconnage: "bg-violet-50 text-violet-700 ring-violet-200",
  pret: "bg-pine-50 text-pine-700 ring-pine-200",
  expedie: "bg-green-50 text-green-700 ring-green-200",
  livre: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

const SHIP_COLORS: Record<ShipmentStatut, string> = {
  planifiee: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  chargee: "bg-sky-50 text-sky-700 ring-sky-200",
  en_route: "bg-pine-50 text-pine-700 ring-pine-200",
  livree: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

const SYS_LABEL: Record<string, string> = { rail: "Rail", pinces: "Pinces", spider: "Spider", conseil: "À définir" };

export default async function AdminGestion() {
  const [orders, stock, ships] = await Promise.all([listOrders(), listStock(), listShipments()]);
  const actives = orders.filter((o) => o.statut !== "livre");
  const openShips = ships.filter((x) => x.statut === "planifiee" || x.statut === "chargee");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-inkgreen">Gestion</h1>

      {/* ------------------------- commandes atelier ------------------------- */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
            <PackageOpen className="h-4 w-4 text-pine-600" />
            Commandes atelier
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUTS.map((st) => {
              const n = orders.filter((o) => o.statut === st).length;
              return (
                <span key={st} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${n > 0 ? ORDER_COLORS[st] : "bg-neutral-50 text-neutral-300 ring-neutral-200"}`}>
                  {ORDER_LABELS[st]} · {n}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                <th className="py-2 pr-3">Réf.</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Ouvrage</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3">Tournée</th>
                <th className="py-2 text-right">Avancer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {actives.map((o) => {
                const idx = ORDER_STATUTS.indexOf(o.statut);
                const next = idx < ORDER_STATUTS.length - 1 ? ORDER_LABELS[ORDER_STATUTS[idx + 1]] : null;
                return (
                  <tr key={o.id} className="align-middle">
                    <td className="py-3 pr-3 font-mono text-xs font-bold text-pine-700">{o.ref}</td>
                    <td className="py-3 pr-3">
                      {o.lead_id ? (
                        <Link href={`/admin/leads/${o.lead_id}`} className="font-semibold text-inkgreen hover:text-pine-700">{o.client}</Link>
                      ) : (
                        <span className="font-semibold text-inkgreen">{o.client}</span>
                      )}
                      {o.departement && <span className="block text-[11px] text-neutral-400">dép. {o.departement}</span>}
                    </td>
                    <td className="py-3 pr-3 text-xs text-neutral-500">
                      {o.ml ?? "?"} ml · {o.nb_verres ?? "?"} verres · {o.verre ?? "?"} · h{o.hauteur ?? "?"} · {SYS_LABEL[o.systeme ?? ""] ?? o.systeme ?? "—"}
                    </td>
                    <td className="py-3 pr-3 text-sm font-extrabold tabular-nums text-inkgreen">
                      {o.montant_ttc ? `${eurFmt.format(Number(o.montant_ttc))} €` : "—"}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${ORDER_COLORS[o.statut]}`}>
                        {ORDER_LABELS[o.statut]}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {o.statut === "pret" || o.shipment_id ? (
                        <AssignShipmentSelect orderId={o.id} current={o.shipment_id} options={openShips.map((x) => ({ id: x.id, ref: x.ref }))} />
                      ) : (
                        <span className="text-[11px] text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {next ? <AdvanceButton kind="order" id={o.id} nextLabel={next} /> : <span className="text-[11px] text-neutral-300">—</span>}
                    </td>
                  </tr>
                );
              })}
              {actives.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-neutral-400">
                  Aucune commande en cours — créez-les depuis une fiche client gagnée (pôle Commercial).
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-neutral-400">
          Le passage en « Découpe » décompte automatiquement la matière du stock (verre + fixations).
        </p>
      </section>

      {/* ------------------------------- stock ------------------------------- */}
      <section id="stock" className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <Boxes className="h-4 w-4 text-pine-600" />
          Stock matière
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                <th className="py-2 pr-3">Référence</th>
                <th className="py-2 pr-3 text-right">En stock</th>
                <th className="py-2 pr-3 text-right">Engagé atelier</th>
                <th className="py-2 pr-3 text-right">Prévisionnel</th>
                <th className="py-2 pr-3 text-right">Seuil</th>
                <th className="py-2 text-right">Mouvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stock.map((it) => {
                const low = Number(it.qty) <= Number(it.seuil);
                const danger = it.previsionnel < 0;
                return (
                  <tr key={it.sku}>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2 font-semibold text-inkgreen">
                        {(low || danger) && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />}
                        {it.label}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">{it.sku}</span>
                    </td>
                    <td className={`py-3 pr-3 text-right text-sm font-extrabold tabular-nums ${low ? "text-amber-600" : "text-inkgreen"}`}>
                      {Number(it.qty).toLocaleString("fr-FR")} {it.unite}
                    </td>
                    <td className="py-3 pr-3 text-right text-sm tabular-nums text-neutral-500">
                      {it.engage.toLocaleString("fr-FR")} {it.unite}
                    </td>
                    <td className={`py-3 pr-3 text-right text-sm font-bold tabular-nums ${danger ? "text-red-600" : "text-neutral-600"}`}>
                      {it.previsionnel.toLocaleString("fr-FR")} {it.unite}
                    </td>
                    <td className="py-3 pr-3 text-right text-xs tabular-nums text-neutral-400">{Number(it.seuil).toLocaleString("fr-FR")}</td>
                    <td className="py-3 text-right"><StockMoveForm itemId={it.id} unite={it.unite} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-neutral-400">
          Prévisionnel = stock − besoin des commandes en atelier. En orange : sous le seuil de réapprovisionnement ; en rouge : la matière manquera.
        </p>
      </section>

      {/* ---------------------------- expéditions ---------------------------- */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
            <Truck className="h-4 w-4 text-pine-600" />
            Expéditions
          </h2>
          <ShipmentCreateForm />
        </div>
        <ul className="mt-4 divide-y divide-neutral-100">
          {ships.map((x) => {
            const idx = SHIPMENT_STATUTS.indexOf(x.statut);
            const next = idx < SHIPMENT_STATUTS.length - 1 ? SHIPMENT_LABELS[SHIPMENT_STATUTS[idx + 1]] : null;
            return (
              <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="font-mono text-xs font-bold text-pine-700">{x.ref}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${SHIP_COLORS[x.statut]}`}>
                  {SHIPMENT_LABELS[x.statut]}
                </span>
                <span className="text-xs text-neutral-500">
                  {x.transporteur ?? "transporteur ?"} · dép. {x.departement ?? "?"}
                  {x.date_prevue && ` · prévue le ${dateFmt.format(new Date(x.date_prevue)).split(" ").slice(0, 2).join(" ")}`}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-neutral-400">
                  {x.orders.length > 0 ? x.orders.map((o) => o.ref).join(" · ") : "aucune commande rattachée"}
                </span>
                {next && <AdvanceButton kind="shipment" id={x.id} nextLabel={next} />}
              </li>
            );
          })}
          {ships.length === 0 && <li className="py-6 text-center text-sm text-neutral-400">Aucune expédition planifiée.</li>}
        </ul>
        <p className="mt-2 text-[11px] text-neutral-400">
          Passer une tournée « En route » expédie ses commandes prêtes ; « Livrée » les clôture.
        </p>
      </section>
    </div>
  );
}
