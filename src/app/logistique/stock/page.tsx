import { StockMoveForm } from "@/components/admin/LogisticsActions";
import { AlertTriangle, Boxes, PackageSearch } from "lucide-react";
import { Carte, EnTete, EtatVide, Tuile } from "@/components/admin/ui";
import { requireMenu } from "@/lib/admin/auth";
import { listStock } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

/* Stock matière — quantité en rayon, réservée par l'atelier, et ce qu'il restera. */
export default async function StockPage() {
  await requireMenu("stock");
  const stock = await listStock();
  const enAlerte = stock.filter((it) => Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0).length;
  return (
    <div className="space-y-6">
      <EnTete titre="Stock" sous="« Engagé » = matière réservée par les commandes en atelier. « Prévisionnel » = ce qu'il restera une fois l'atelier servi." />
      <ul className="grid gap-3 sm:grid-cols-2">
        <Tuile icon={Boxes} valeur={stock.length} label="Références suivies" aide="verres et fixations" ton="neutre" />
        <Tuile icon={AlertTriangle} valeur={enAlerte} label="À réapprovisionner" aide="sous le seuil d'alerte, ou insuffisant pour l'atelier" ton="rouge" />
      </ul>
      {stock.length === 0 ? (
        <EtatVide icon={<PackageSearch className="h-5 w-5" />} titre="Aucune référence en stock" />
      ) : (
      <Carte icon={PackageSearch} titre="Matière en rayon" n={stock.length} ton="neutre">
        <ul className="-my-1 divide-y divide-neutral-100">
          {stock.map((it) => {
            const alerte = Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0;
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-inkgreen">
                    {it.label} {alerte && <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 ring-1 ring-inset ring-red-200"><AlertTriangle className="h-3 w-3" />à réapprovisionner</span>}
                  </p>
                  <p className="text-xs text-neutral-600">{it.sku} · {it.categorie} · seuil d&rsquo;alerte {Number(it.seuil)} {it.unite}</p>
                </div>
                <dl className="flex gap-5 text-right text-xs text-neutral-600">
                  <div><dt>En stock</dt><dd className="text-base font-extrabold tabular-nums text-inkgreen">{Number(it.qty)} {it.unite}</dd></div>
                  <div><dt>Engagé</dt><dd className="text-base font-extrabold tabular-nums text-neutral-600">{it.engage}</dd></div>
                  <div><dt>Prévisionnel</dt><dd className={`text-base font-extrabold tabular-nums ${it.previsionnel < 0 ? "text-red-600" : "text-pine-700"}`}>{it.previsionnel}</dd></div>
                </dl>
                <StockMoveForm itemId={it.id} unite={it.unite} />
              </li>
            );
          })}
        </ul>
      </Carte>
      )}
    </div>
  );
}
