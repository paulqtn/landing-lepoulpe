import Link from "next/link";
import { AlertTriangle, CalendarCheck, CalendarClock, CheckCircle2, Factory, Flame, PackageCheck, type LucideIcon } from "lucide-react";
import { Carte, EnTete, Rien, Tuile, boutonSecondaireCls, pastilleCls, type Ton } from "@/components/admin/ui";
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
      <EnTete titre={<>Bonjour {user.name} — vos tâches du jour</>} sous={<span className="capitalize">{dayFmt.format(new Date())}</span>} />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile icon={Flame} valeur={retard.length} label="En retard" aide="à traiter en premier" ton="rouge" />
        <Tuile icon={CalendarCheck} valeur={jour.length} label="À faire aujourd'hui" aide="échéance du jour" />
        <Tuile icon={Factory} valeur={compteurs.enCours} label="Commandes en atelier" aide="en cours de fabrication" ton="neutre" />
        <Tuile icon={PackageCheck} valeur={compteurs.pretes} label="Prêtes à expédier" aide="en attente de tournée" ton="neutre" />
      </ul>

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

      <Section title="En retard" icon={Flame} ton="rouge" tasks={retard} empty="Aucun retard." />
      <Section title="Aujourd'hui" icon={CalendarCheck} ton="pine" tasks={jour} empty="Rien d'autre à l'échéance du jour." />
      <Section title="À venir — 7 prochains jours" icon={CalendarClock} ton="neutre" tasks={aVenir} empty="Rien de prévu cette semaine." />
      {plusTard > 0 && <p className="text-xs text-neutral-600">+ {plusTard} tâche{plusTard > 1 ? "s" : ""} au-delà de 7 jours.</p>}

      <p className="text-xs text-neutral-600">
        Échéances calculées à partir de la date de validation par le commercial (affaire passée à « Signé ») : lancement J+{delais.lancement}, découpe J+{delais.decoupe},
        façonnage J+{delais.faconnage}, prêt J+{delais.pret}, expédition J+{delais.expedition}.
      </p>
    </div>
  );
}

function Section({ title, icon, ton, tasks, empty }: { title: string; icon: LucideIcon; ton: Ton; tasks: Task[]; empty: string }) {
  return (
    <Carte icon={icon} titre={title} n={tasks.length} ton={ton}>
      {tasks.length === 0 ? (
        <Rien icon={CheckCircle2}>{empty}</Rien>
      ) : (
        <ul className="-my-1 divide-y divide-neutral-100">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1 basis-full sm:basis-0">
                <p className="text-sm font-bold text-inkgreen">
                  {t.action} <span className="font-semibold text-neutral-600">· {t.ref}</span>
                </p>
                <p className="truncate text-sm text-neutral-700">{t.client}</p>
                <p className="text-xs text-neutral-600">
                  {t.detail}
                  {t.valideLe && `${t.detail ? " · " : ""}validé par le commercial le ${shortFmt.format(new Date(t.valideLe))}`}
                </p>
              </div>
              <span
                className={`${pastilleCls} ${
                  t.retard > 0 ? "bg-red-50 text-red-700 ring-red-200" : t.retard === 0 ? "bg-pine-50 text-pine-700 ring-pine-200" : "bg-neutral-50 text-neutral-600 ring-neutral-200"
                }`}
              >
                {t.retard > 0 ? `${t.retard} j de retard` : t.retard === 0 ? "aujourd'hui" : `pour le ${shortFmt.format(new Date(t.echeance))}`}
              </span>
              {t.kind === "lancer" && t.leadId && <CreateOrderButton leadId={t.leadId} />}
              {t.kind === "avancer" && t.orderId && <AdvanceButton kind="order" id={t.orderId} nextLabel={t.nextLabel ?? ""} />}
              {t.kind === "tournee" && t.shipmentId && <AdvanceButton kind="shipment" id={t.shipmentId} nextLabel={t.nextLabel ?? ""} />}
              {t.kind === "affecter" && (
                <Link href="/logistique/expeditions" className={`${boutonSecondaireCls} !px-3.5 !py-2 !text-xs`}>
                  Choisir une tournée
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}
