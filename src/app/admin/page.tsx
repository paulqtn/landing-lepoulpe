import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, Boxes, PhoneCall, Truck } from "lucide-react";
import { SeedDemo } from "@/components/admin/SeedDemo";
import { eurFmt, ScoreBadge } from "@/components/admin/ui";
import { leadsJour, listLeads, stats } from "@/lib/admin/db";
import { listOrders, listShipments, listStock, ORDER_LABELS, SHIPMENT_LABELS } from "@/lib/admin/logistics";

export const dynamic = "force-dynamic";

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default async function AdminHome() {
  const [s, jour, orders, stock, ships] = await Promise.all([stats(), leadsJour(), listOrders(), listStock(), listShipments()]);

  const atelier = orders.filter((o) => ["a_preparer", "decoupe", "faconnage", "pret"].includes(o.statut));
  const alertesStock = stock.filter((it) => Number(it.qty) <= Number(it.seuil) || it.previsionnel < 0);
  const prochainesExp = ships.filter((x) => x.statut !== "livree").slice(0, 3);
  const aTraiter = jour.aAppeler.length + jour.chauds.length;

  const kpis = [
    { label: "Demandes (7 jours)", value: String(s.semaine), href: "/admin/commercial" },
    { label: "À traiter aujourd’hui", value: String(aTraiter + s.relancesDues), href: "/admin/jour" },
    { label: "Commandes en atelier", value: String(atelier.length), href: "/admin/gestion" },
    { label: "Alertes stock", value: String(alertesStock.length), href: "/admin/gestion#stock", warn: alertesStock.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-inkgreen">Bonjour 👋</h1>
          <p className="text-sm capitalize text-neutral-400">{dayFmt.format(new Date())}</p>
        </div>
        {s.total === 0 && <SeedDemo />}
      </div>

      {/* le pouls du jour */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-card ${k.warn ? "border-amber-500/60" : "border-neutral-200"}`}
          >
            <p className={`text-3xl font-extrabold tabular-nums ${k.warn ? "text-amber-600" : "text-inkgreen"}`}>{k.value}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-600">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* les 3 pôles */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* commercial */}
        <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-700 text-amber-400">
              <PhoneCall className="h-5 w-5" />
            </span>
            <h2 className="text-base font-extrabold text-inkgreen">Commercial</h2>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            {s.devisEnvoyes} devis en cours · {s.relancesDues} relance{s.relancesDues > 1 ? "s" : ""} due{s.relancesDues > 1 ? "s" : ""}
          </p>
          <ul className="mt-3 flex-1 space-y-1.5">
            {[...new Map([...jour.chauds, ...jour.aAppeler].map((l) => [l.id, l])).values()].slice(0, 3).map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-mist/70">
                  <ScoreBadge score={l.score} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-inkgreen">{l.name}</span>
                  {l.estimation_ttc && <span className="text-xs tabular-nums text-neutral-400">{eurFmt.format(Number(l.estimation_ttc))} €</span>}
                </Link>
              </li>
            ))}
            {jour.chauds.length + jour.aAppeler.length === 0 && (
              <li className="px-2 py-4 text-center text-xs text-neutral-400">Rien d’urgent — belle journée.</li>
            )}
          </ul>
          <Link href="/admin/commercial" className="group mt-3 inline-flex items-center gap-1 text-sm font-bold text-pine-700">
            Ouvrir le pôle
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* gestion */}
        <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-700 text-amber-400">
              <Boxes className="h-5 w-5" />
            </span>
            <h2 className="text-base font-extrabold text-inkgreen">Gestion</h2>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            {atelier.length} commande{atelier.length > 1 ? "s" : ""} en atelier · {alertesStock.length} alerte{alertesStock.length > 1 ? "s" : ""} stock
          </p>
          <ul className="mt-3 flex-1 space-y-1.5">
            {alertesStock.slice(0, 2).map((it) => (
              <li key={it.sku} className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
                <span className="tabular-nums">{it.qty} {it.unite}</span>
              </li>
            ))}
            {prochainesExp.slice(0, 2).map((x) => (
              <li key={x.ref} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-600">
                <Truck className="h-3.5 w-3.5 shrink-0 text-pine-600" />
                <span className="min-w-0 flex-1 truncate">{x.ref} · dép. {x.departement}</span>
                <span className="text-neutral-400">{SHIPMENT_LABELS[x.statut]}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/gestion" className="group mt-3 inline-flex items-center gap-1 text-sm font-bold text-pine-700">
            Ouvrir le pôle
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* statistiques */}
        <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-700 text-amber-400">
              <BarChart3 className="h-5 w-5" />
            </span>
            <h2 className="text-base font-extrabold text-inkgreen">Statistiques</h2>
          </div>
          <dl className="mt-3 flex-1 space-y-2.5">
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-semibold text-neutral-500">CA gagné (TTC)</dt>
              <dd className="text-sm font-extrabold tabular-nums text-inkgreen">{eurFmt.format(s.caGagne)} €</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-semibold text-neutral-500">Devis en cours</dt>
              <dd className="text-sm font-extrabold tabular-nums text-inkgreen">{s.devisEnvoyes}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-xs font-semibold text-neutral-500">Gagnées / perdues</dt>
              <dd className="text-sm font-extrabold tabular-nums text-inkgreen">{s.gagnes} / {s.perdus}</dd>
            </div>
          </dl>
          <Link href="/admin/stats" className="group mt-3 inline-flex items-center gap-1 text-sm font-bold text-pine-700">
            Toutes les stats
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </div>

      {/* atelier en un coup d'œil */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Atelier en un coup d’œil</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(ORDER_LABELS) as (keyof typeof ORDER_LABELS)[]).map((st) => {
            const n = orders.filter((o) => o.statut === st).length;
            return (
              <Link
                key={st}
                href="/admin/gestion"
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ring-inset transition hover:-translate-y-0.5 ${
                  n > 0 ? "bg-pine-50 text-pine-800 ring-pine-200" : "bg-neutral-50 text-neutral-400 ring-neutral-200"
                }`}
              >
                {ORDER_LABELS[st]} · {n}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
