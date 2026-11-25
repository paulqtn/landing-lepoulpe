import Link from "next/link";
import { AlertTriangle, CalendarCheck, CalendarClock, Flame } from "lucide-react";
import { AdvanceButton, CreateOrderButton } from "@/components/admin/LogisticsActions";
import { requireMenu } from "@/lib/admin/auth";
import { logisticsBoard, type Task } from "@/lib/admin/logistics-tasks";

export const dynamic = "force-dynamic";

/* Tâches du jour du logisticien — tout part de la date à laquelle le
   commercial a validé l'affaire. */

const dayFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short" });

export default async function LogistiquePage() {
  const user = await requireMenu("logistique");
  const { tasks, stockAlertes, delais, compteurs } = await logisticsBoard();
  const retard = tasks.filter((t) => t.retard > 0);
  const jour = tasks.filter((t) => t.retard === 0);
  const aVenir = tasks.filter((t) => t.retard < 0 && t.retard >= -7);
  const plusTard = tasks.filter((t) => t.retard < -7).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Bonjour {user.name} — vos tâches du jour</h1>
        <p className="text-sm capitalize text-neutral-400">{dayFmt.format(new Date())}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            [retard.length, "En retard", "text-red-600"],
            [jour.length, "À faire aujourd'hui", "text-pine-700"],
            [compteurs.enCours, "Commandes en atelier", "text-inkgreen"],
            [compteurs.pretes, "Prêtes à expédier", "text-inkgreen"],
          ] as const
        ).map(([n, label, color]) => (
          <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{n}</p>
            <p className="mt-1 text-xs font-semibold text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {stockAlertes.length > 0 && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <strong className="font-bold text-inkgreen">Stock à surveiller :</strong>{" "}
            {stockAlertes.map((s) => `${s.label} (${s.qty} ${s.unite}${s.previsionnel < 0 ? `, manque ${Math.abs(s.previsionnel)} pour l'atelier` : ""})`).join(" · ")}.{" "}
            <Link href="/logistique/stock" className="font-bold text-pine-700 underline-offset-2 hover:underline">Voir le stock</Link>
          </span>
        </p>
      )}

      <Section title="En retard" icon={<Flame className="h-4 w-4 text-red-500" />} tasks={retard} tone="border-red-200" empty="Aucun retard." />
      <Section title="Aujourd'hui" icon={<CalendarCheck className="h-4 w-4 text-pine-600" />} tasks={jour} tone="border-pine-200" empty="Rien d'autre à l'échéance du jour." />
      <Section title="À venir — 7 prochains jours" icon={<CalendarClock className="h-4 w-4 text-neutral-400" />} tasks={aVenir} tone="border-neutral-200" empty="Rien de prévu cette semaine." />
      {plusTard > 0 && <p className="text-xs text-neutral-400">+ {plusTard} tâche{plusTard > 1 ? "s" : ""} au-delà de 7 jours.</p>}

      <p className="text-xs text-neutral-400">
        Échéances calculées à partir de la date de validation par le commercial (affaire passée à « Signé ») : lancement J+{delais.lancement}, découpe J+{delais.decoupe},
        façonnage J+{delais.faconnage}, prêt J+{delais.pret}, expédition J+{delais.expedition}.
      </p>
    </div>
  );
}

function Section({ title, icon, tasks, tone, empty }: { title: string; icon: React.ReactNode; tasks: Task[]; tone: string; empty: string }) {
  return (
    <section className={`rounded-2xl border bg-white p-5 ${tone}`}>
      <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
        {icon}
        {title}
        <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">{tasks.length}</span>
      </h2>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-400">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-inkgreen">
                  {t.action} <span className="font-semibold text-neutral-400">· {t.ref}</span>
                </p>
                <p className="truncate text-sm text-neutral-700">{t.client}</p>
                <p className="text-xs text-neutral-400">
                  {t.detail}
                  {t.valideLe && `${t.detail ? " · " : ""}validé par le commercial le ${shortFmt.format(new Date(t.valideLe))}`}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${
                  t.retard > 0 ? "bg-red-50 text-red-700 ring-red-200" : t.retard === 0 ? "bg-pine-50 text-pine-700 ring-pine-200" : "bg-neutral-50 text-neutral-500 ring-neutral-200"
                }`}
              >
                {t.retard > 0 ? `${t.retard} j de retard` : t.retard === 0 ? "aujourd'hui" : `pour le ${shortFmt.format(new Date(t.echeance))}`}
              </span>
              {t.kind === "lancer" && t.leadId && <CreateOrderButton leadId={t.leadId} />}
              {t.kind === "avancer" && t.orderId && <AdvanceButton kind="order" id={t.orderId} nextLabel={t.nextLabel ?? ""} />}
              {t.kind === "tournee" && t.shipmentId && <AdvanceButton kind="shipment" id={t.shipmentId} nextLabel={t.nextLabel ?? ""} />}
              {t.kind === "affecter" && (
                <Link href="/logistique/expeditions" className="rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">
                  Choisir une tournée
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
