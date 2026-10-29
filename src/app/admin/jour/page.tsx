import Link from "next/link";
import { BellRing, Flame, PhoneCall } from "lucide-react";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { dueRelances, leadsJour, type Lead } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/* « Ma journée » — la file de travail du commercial, dans l'ordre. */

export default async function JourPage() {
  const [{ aAppeler, chauds }, dues] = await Promise.all([leadsJour(), dueRelances()]);
  const chaudsFiltres = chauds.filter((c) => !aAppeler.some((a) => a.id === c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Ma journée</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {aAppeler.length} à appeler · {chaudsFiltres.length} signaux chauds · {dues.length} relances échues
        </p>
      </div>

      <Section
        icon={<PhoneCall className="h-4 w-4 text-green-600" />}
        titre="À appeler en priorité (score A)"
        vide="Aucun lead A en attente — beau travail."
        leads={aAppeler}
        detail={(l) => `${l.score_points} pts · ${l.source ?? "site"}`}
      />

      <Section
        icon={<Flame className="h-4 w-4 text-orange-500" />}
        titre="Signaux chauds (activité < 48h)"
        vide="Pas d'activité récente sur les devis."
        leads={chaudsFiltres}
        detail={(l) =>
          `${l.devis_views > 0 ? `${l.devis_views} vue${l.devis_views > 1 ? "s" : ""} du devis · ` : ""}${l.opens} ouv. · ${l.clicks} clic${l.clicks > 1 ? "s" : ""}`
        }
      />

      <Section
        icon={<BellRing className="h-4 w-4 text-amber-600" />}
        titre="Relances arrivées à échéance"
        vide="Aucune relance en retard."
        leads={dues}
        detail={(l) => `relance ${l.relances + 1} prévue le ${l.next_relance_at ? dateFmt.format(new Date(l.next_relance_at)) : "—"}`}
      />
    </div>
  );
}

function Section({
  icon,
  titre,
  vide,
  leads,
  detail,
}: {
  icon: React.ReactNode;
  titre: string;
  vide: string;
  leads: Lead[];
  detail: (l: Lead) => string;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
        {icon}
        {titre}
        <span className="ml-1 rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-neutral-500">{leads.length}</span>
      </h2>
      {leads.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-400">{vide}</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100">
          {leads.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <ScoreBadge score={l.score} points={l.score_points} />
              <Link href={`/admin/leads/${l.id}`} className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                <span className="block text-xs text-neutral-400">{detail(l)}</span>
              </Link>
              {l.estimation_ttc && (
                <span className="text-sm font-extrabold tabular-nums text-pine-700">
                  {eurFmt.format(Number(l.estimation_ttc))} €
                </span>
              )}
              <StatutBadge statut={l.statut} />
              <a
                href={`tel:${l.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {l.phone}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
