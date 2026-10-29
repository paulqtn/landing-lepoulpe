import Link from "next/link";
import { Download } from "lucide-react";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { dbConfigured, listLeads, STATUT_LABELS, STATUTS } from "@/lib/admin/db";
import { getTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string }>;
}) {
  const { statut, q } = await searchParams;
  if (!dbConfigured) {
    return <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Base non configurée — voir le tableau de bord.</p>;
  }
  const leads = await listLeads({ statut, search: q, limit: 200 });
  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    created_at: String(l.created_at),
    name: l.name,
    email: l.email,
    phone: l.phone,
    source: l.source,
    estimation_ttc: l.estimation_ttc,
    statut: l.statut,
    score: l.score,
    score_points: l.score_points,
    next_relance_at: l.next_relance_at ? String(l.next_relance_at) : null,
    assigned_to: l.assigned_to,
  }));

  const exportHref = `/api/admin/export?${new URLSearchParams({ ...(statut ? { statut } : {}), ...(q ? { q } : {}) })}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-inkgreen">Demandes de devis</h1>
        <div className="flex items-center gap-2">
          <form className="flex gap-2" action="/admin/leads">
            {statut && <input type="hidden" name="statut" value={statut} />}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Nom, email, téléphone…"
              className="w-56 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-pine-500"
            />
          </form>
          <a
            href={exportHref}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip href="/admin/leads" active={!statut} label="Tous" />
        {STATUTS.map((s) => (
          <FilterChip key={s} href={`/admin/leads?statut=${s}`} active={statut === s} label={STATUT_LABELS[s]} />
        ))}
      </div>

      <LeadsTable leads={rows} team={getTeam()} />
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
      }`}
    >
      {label}
    </Link>
  );
}
