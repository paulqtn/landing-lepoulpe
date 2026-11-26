import { StockMoveForm } from "@/components/admin/LogisticsActions";
import { requireMenu } from "@/lib/admin/auth";
import { listStock } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stock" };

/* Stock matière — quantité en rayon, réservée par l'atelier, et ce qu'il restera. */
export default async function StockPage() {
  await requireMenu("stock");
  const stock = await listStock();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Stock</h1>
        <p className="mt-1 text-sm text-neutral-500">« Engagé » = matière réservée par les commandes en atelier. « Prévisionnel » = ce qu&rsquo;il restera une fois l&rsquo;atelier servi.</p>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <ul className="divide-y divide-neutral-100">
          {stock.map((it) => {
            const alerte = Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0;
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-inkgreen">
                    {it.label} {alerte && <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700">à réapprovisionner</span>}
                  </p>
                  <p className="text-xs text-neutral-400">{it.sku} · {it.categorie} · seuil d&rsquo;alerte {Number(it.seuil)} {it.unite}</p>
                </div>
                <dl className="flex gap-5 text-right text-xs text-neutral-500">
                  <div><dt>En stock</dt><dd className="text-base font-extrabold tabular-nums text-inkgreen">{Number(it.qty)} {it.unite}</dd></div>
                  <div><dt>Engagé</dt><dd className="text-base font-extrabold tabular-nums text-neutral-600">{it.engage}</dd></div>
                  <div><dt>Prévisionnel</dt><dd className={`text-base font-extrabold tabular-nums ${it.previsionnel < 0 ? "text-red-600" : "text-pine-700"}`}>{it.previsionnel}</dd></div>
                </dl>
                <StockMoveForm itemId={it.id} unite={it.unite} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
