import { AdvanceButton, AssignShipmentSelect } from "@/components/admin/LogisticsActions";
import { Hammer, PackageCheck, PackageOpen, Ruler, Scissors, Truck, type LucideIcon } from "lucide-react";
import { Carte, EnTete, EtatVide, type Ton } from "@/components/admin/ui";
import { requireMenu } from "@/lib/admin/auth";
import { listOrders, listShipments, ORDER_LABELS, ORDER_STATUTS, type OrderStatut } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

const ETAPES: Record<OrderStatut, { icon: LucideIcon; ton: Ton }> = {
  a_preparer: { icon: PackageOpen, ton: "ambre" },
  decoupe: { icon: Scissors, ton: "pine" },
  faconnage: { icon: Hammer, ton: "pine" },
  pret: { icon: Ruler, ton: "pine" },
  expedie: { icon: Truck, ton: "vert" },
  livre: { icon: PackageCheck, ton: "neutre" },
};
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short" });

/* Commandes atelier — de « à préparer » jusqu'à la livraison. Aucun montant ici. */
export default async function CommandesPage() {
  await requireMenu("commandes");
  const [orders, shipments] = await Promise.all([listOrders(), listShipments()]);
  const open = shipments.filter((s) => s.statut !== "livree").map((s) => ({ id: s.id, ref: s.ref }));
  return (
    <div className="space-y-6">
      <EnTete titre="Commandes atelier" sous="Le passage en découpe sort automatiquement la matière du stock." />
      {orders.length > 0 && (
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Commandes par étape">
          {ORDER_STATUTS.map((s, i) => {
            const n = orders.filter((o) => o.statut === s).length;
            return (
              <li key={s} className={`rounded-xl border px-3.5 py-3 ${n > 0 ? "border-pine-200 bg-white" : "border-neutral-200 bg-white/60"}`}>
                <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-600"><span className="tabular-nums text-neutral-600">{i + 1}</span>{ORDER_LABELS[s]}</p>
                <p className={`mt-0.5 text-2xl font-extrabold tabular-nums ${n > 0 ? "text-inkgreen" : "text-neutral-600"}`}>{n}</p>
              </li>
            );
          })}
        </ol>
      )}
      {ORDER_STATUTS.map((statut) => {
        const list = orders.filter((o) => o.statut === statut);
        if (list.length === 0) return null;
        const idx = ORDER_STATUTS.indexOf(statut);
        const next = ORDER_STATUTS[idx + 1];
        return (
          <Carte key={statut} icon={ETAPES[statut].icon} titre={ORDER_LABELS[statut]} n={list.length} ton={ETAPES[statut].ton}>
            <ul className="-my-1 divide-y divide-neutral-100">
              {list.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-inkgreen">{o.ref} <span className="font-semibold text-neutral-600">· {o.client}</span></p>
                    <p className="text-xs text-neutral-600">
                      {[o.ml && `${String(o.ml).replace(".", ",")} ml`, o.nb_verres && `${o.nb_verres} verres`, o.verre && `verre ${o.verre}`, o.hauteur && `h ${o.hauteur} cm`, o.systeme, o.departement && `dépt ${o.departement}`].filter(Boolean).join(" · ")}
                      {" · "}créée le {dateFmt.format(new Date(o.created_at))}
                    </p>
                  </div>
                  {statut === "pret" && <AssignShipmentSelect orderId={o.id} current={o.shipment_id} options={open} />}
                  {next && statut !== "pret" && statut !== "expedie" && <AdvanceButton kind="order" id={o.id} nextLabel={ORDER_LABELS[next]} />}
                </li>
              ))}
            </ul>
          </Carte>
        );
      })}
      {orders.length === 0 && <EtatVide icon={<Hammer className="h-5 w-5" />} titre="Aucune commande pour l'instant" texte="Elles arrivent ici dès qu'une affaire validée est lancée à l'atelier." />}
    </div>
  );
}
