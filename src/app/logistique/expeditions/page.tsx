import { AdvanceButton, AssignShipmentSelect, ShipmentCreateForm } from "@/components/admin/LogisticsActions";
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
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Expéditions</h1>
        <p className="mt-1 text-sm text-neutral-500">Quand une tournée part, ses commandes passent en « Expédié » ; à la livraison, en « Livré ».</p>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-base font-extrabold text-inkgreen">Nouvelle tournée</h2>
        <ShipmentCreateForm />
      </section>

      <section className="rounded-2xl border border-pine-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Commandes prêtes, sans tournée <span className="ml-1 text-xs font-bold text-neutral-400">{pretes.length}</span></h2>
        {pretes.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">Toutes les commandes prêtes ont une tournée.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {pretes.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <p className="min-w-0 flex-1 text-sm font-bold text-inkgreen">{o.ref} <span className="font-semibold text-neutral-500">· {o.client}{o.departement ? ` · dépt ${o.departement}` : ""}</span></p>
                <AssignShipmentSelect orderId={o.id} current={null} options={open} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Tournées</h2>
        {shipments.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">Aucune tournée créée.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {shipments.map((s) => {
              const next = SHIPMENT_STATUTS[SHIPMENT_STATUTS.indexOf(s.statut) + 1];
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-inkgreen">
                      {s.ref} <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-600">{SHIPMENT_LABELS[s.statut]}</span>
                    </p>
                    <p className="text-xs text-neutral-400">
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
      </section>
    </div>
  );
}
