import { AdvanceButton, AssignShipmentSelect, ShipmentCreateForm } from "@/components/admin/LogisticsActions";
import { CheckCircle2, PackageCheck, Route, Truck } from "lucide-react";
import { Carte, EnTete, Rien, pastilleCls } from "@/components/admin/ui";
import { requireMenu } from "@/lib/admin/auth";
import { listOrders, listShipments, SHIPMENT_LABELS, SHIPMENT_STATUTS } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* Expéditions — les tournées, et les commandes prêtes à y rattacher. */
export default async function ExpeditionsPage() {
  await requireMenu("expeditions");
  const [shipments, orders] = await Promise.all([listShipments(), listOrders()]);
  const open = shipments.filter((s) => s.statut !== "livree").map((s) => ({ id: s.id, ref: s.ref }));
  const pretes = orders.filter((o) => o.statut === "pret" && !o.shipment_id);
  return (
    <div className="space-y-6">
      <EnTete titre="Expéditions" sous="Quand une tournée part, ses commandes passent en « Expédié » ; à la livraison, en « Livré »." />

      <Carte icon={Truck} titre="Nouvelle tournée">
        <ShipmentCreateForm />
      </Carte>

      <Carte icon={PackageCheck} titre="Commandes prêtes, sans tournée" n={pretes.length} ton="ambre">
        {pretes.length === 0 ? (
          <Rien icon={CheckCircle2}>Toutes les commandes prêtes ont une tournée.</Rien>
        ) : (
          <ul className="-my-1 divide-y divide-neutral-100">
            {pretes.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <p className="min-w-0 flex-1 text-sm font-bold text-inkgreen">{o.ref} <span className="font-semibold text-neutral-600">· {o.client}{o.departement ? ` · dépt ${o.departement}` : ""}</span></p>
                <AssignShipmentSelect orderId={o.id} current={null} options={open} />
              </li>
            ))}
          </ul>
        )}
      </Carte>

      <Carte icon={Route} titre="Tournées" n={shipments.length} ton="neutre">
        {shipments.length === 0 ? (
          <Rien icon={Route}>Aucune tournée créée.</Rien>
        ) : (
          <ul className="-my-1 divide-y divide-neutral-100">
            {shipments.map((s) => {
              const next = SHIPMENT_STATUTS[SHIPMENT_STATUTS.indexOf(s.statut) + 1];
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-inkgreen">
                      {s.ref} <span className={`ml-1 ${pastilleCls} ${s.statut === "livree" ? "bg-neutral-100 text-neutral-600 ring-neutral-200" : "bg-pine-50 text-pine-700 ring-pine-200"}`}>{SHIPMENT_LABELS[s.statut]}</span>
                    </p>
                    <p className="text-xs text-neutral-600">
                      {[s.transporteur, s.departement && `dépt ${s.departement}`, s.date_prevue && `prévue le ${new Date(s.date_prevue).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}`].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="text-xs text-neutral-600">{s.orders.length ? s.orders.map((o) => `${o.ref} (${o.client})`).join(", ") : "Aucune commande rattachée"}</p>
                  </div>
                  {next && s.orders.length > 0 && <AdvanceButton kind="shipment" id={s.id} nextLabel={SHIPMENT_LABELS[next]} />}
                </li>
              );
            })}
          </ul>
        )}
      </Carte>
    </div>
  );
}
