import Link from "next/link";
import { BellRing, CalendarClock, MailCheck } from "lucide-react";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { currentRep } from "@/lib/admin/auth";
import { dueRelances, listLeads, type Lead } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

/* Relances — l'automatisation sous contrôle : ce qui est dû maintenant,
   ce qui partira ensuite, et l'engagement constaté sur chaque client. */

export default async function RelancesPage({ searchParams }: { searchParams: Promise<{ qui?: string }> }) {
  const [{ qui }, rep, duesAll, tousAll] = await Promise.all([searchParams, currentRep(), dueRelances(), listLeads({ limit: 500 })]);
  const mine = rep && qui !== "tous";
  const dues = mine ? duesAll.filter((l) => l.assigned_to === rep) : duesAll;
  const tous = mine ? tousAll.filter((l) => l.assigned_to === rep) : tousAll;
  const now = Date.now();
  const aVenir = tous
    .filter(
      (l) =>
        l.next_relance_at &&
        Number(new Date(l.next_relance_at)) > now &&
        !["gagne", "perdu", "a_rappeler"].includes(l.statut),
    )
    .sort((a, b) => Number(new Date(a.next_relance_at!)) - Number(new Date(b.next_relance_at!)))
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Relances</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Séquence automatique J0 → J+2 → J+5 → J+10 ·{" "}
          {mailConfigured ? "envoi chaque matin par le robot" : "emails non configurés : relancez depuis chaque fiche"}
        </p>
        {rep && (
          <div className="mt-2.5 flex gap-1.5">
            <Chip href="/commercial/relances" active={mine === true} label="Les miennes" />
            <Chip href="/commercial/relances?qui=tous" active={!mine} label="Toute l'équipe" />
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-amber-500/40 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <BellRing className="h-4 w-4 text-amber-600" />
          Échues — à traiter
          <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700">{dues.length}</span>
        </h2>
        <Liste leads={dues} vide="Aucune relance en retard — la séquence suit son cours." mode="due" />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <CalendarClock className="h-4 w-4 text-pine-600" />
          Programmées
          <span className="ml-1 rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-neutral-500">{aVenir.length}</span>
        </h2>
        <Liste leads={aVenir} vide="Rien de programmé pour l'instant." mode="prevue" />
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <MailCheck className="h-3.5 w-3.5" />
          Chaque relance s&rsquo;arrête d&rsquo;elle-même si le client répond, valide son devis ou passe gagné/perdu.
        </p>
      </section>
    </div>
  );
}

function Liste({ leads, vide, mode }: { leads: Lead[]; vide: string; mode: "due" | "prevue" }) {
  if (leads.length === 0) return <p className="mt-3 text-sm text-neutral-400">{vide}</p>;
  return (
    <ul className="mt-3 divide-y divide-neutral-100">
      {leads.map((l) => (
        <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <ScoreBadge score={l.score} points={l.score_points} />
          <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
            <span className="block text-xs text-neutral-400">
              relance {l.relances + 1}/4 · {mode === "due" ? "prévue le" : "partira le"}{" "}
              {l.next_relance_at ? dateFmt.format(new Date(l.next_relance_at)) : "—"}
              {l.opens > 0 && ` · ${l.opens} ouverture${l.opens > 1 ? "s" : ""}`}
              {l.devis_views > 0 && ` · devis consulté`}
            </span>
          </Link>
          {l.estimation_ttc && (
            <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
          )}
          <StatutBadge statut={l.statut} />
        </li>
      ))}
    </ul>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a href={href} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${active ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"}`}>
      {label}
    </a>
  );
}
