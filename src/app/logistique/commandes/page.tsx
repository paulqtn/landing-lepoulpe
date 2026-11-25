import { AdvanceButton, AssignShipmentSelect } from "@/components/admin/LogisticsActions";
import { requireMenu } from "@/lib/admin/auth";
import { listOrders, listShipments, ORDER_LABELS, ORDER_STATUTS, type OrderStatut } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

const COLORS: Record<OrderStatut, string> = {
  a_preparer: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
  decoupe: "bg-sky-50 text-sky-700 ring-sky-200",
  faconnage: "bg-violet-50 text-violet-700 ring-violet-200",
  pret: "bg-pine-50 text-pine-700 ring-pine-200",
  expedie: "bg-green-50 text-green-700 ring-green-200",
  livre: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short" });

/* Commandes atelier — de « à préparer » jusqu'à la livraison. Aucun montant ici. */
export default async function CommandesPage() {
  await requireMenu("commandes");
  const [orders, shipments] = await Promise.all([listOrders(), listShipments()]);
  const open = shipments.filter((s) => s.statut !== "livree").map((s) => ({ id: s.id, ref: s.ref }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Commandes atelier</h1>
        <p className="mt-1 text-sm text-neutral-500">Le passage en découpe sort automatiquement la matière du stock.</p>
      </div>
      {ORDER_STATUTS.map((statut) => {
        const list = orders.filter((o) => o.statut === statut);
        if (list.length === 0) return null;
        const idx = ORDER_STATUTS.indexOf(statut);
        const next = ORDER_STATUTS[idx + 1];
        return (
          <section key={statut} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${COLORS[statut]}`}>{ORDER_LABELS[statut]}</span>
              <span className="text-xs font-bold text-neutral-400">{list.length}</span>
            </h2>
            <ul className="mt-3 divide-y divide-neutral-100">
              {list.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-inkgreen">{o.ref} <span className="font-semibold text-neutral-500">· {o.client}</span></p>
                    <p className="text-xs text-neutral-400">
                      {[o.ml && `${String(o.ml).replace(".", ",")} ml`, o.nb_verres && `${o.nb_verres} verres`, o.verre && `verre ${o.verre}`, o.hauteur && `h ${o.hauteur} cm`, o.systeme, o.departement && `dépt ${o.departement}`].filter(Boolean).join(" · ")}
                      {" · "}créée le {dateFmt.format(new Date(o.created_at))}
                    </p>
                  </div>
                  {statut === "pret" && <AssignShipmentSelect orderId={o.id} current={o.shipment_id} options={open} />}
                  {next && statut !== "pret" && statut !== "expedie" && <AdvanceButton kind="order" id={o.id} nextLabel={ORDER_LABELS[next]} />}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {orders.length === 0 && <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">Aucune commande pour l&rsquo;instant : elles arrivent ici dès qu&rsquo;une affaire validée est lancée à l&rsquo;atelier.</p>}
    </div>
  );
}
