import Link from "next/link";
import { dateFmt, eurFmt, StatutBadge } from "@/components/admin/ui";
import { dbConfigured, listLeads, STATUT_LABELS, STATUTS } from "@/lib/admin/db";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-inkgreen">Demandes de devis</h1>
        <form className="flex gap-2" action="/admin/leads">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Nom, email, téléphone…"
            className="w-56 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-pine-500"
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <FilterChip href="/admin/leads" active={!statut} label="Tous" />
        {STATUTS.map((s) => (
          <FilterChip key={s} href={`/admin/leads?statut=${s}`} active={statut === s} label={STATUT_LABELS[s]} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              <th className="px-4 py-3">Contact</th>
              <th className="hidden px-4 py-3 md:table-cell">Source</th>
              <th className="hidden px-4 py-3 sm:table-cell">Estimation</th>
              <th className="px-4 py-3">Statut</th>
              <th className="hidden px-4 py-3 lg:table-cell">Prochaine relance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map((l) => (
              <tr key={l.id} className="group relative transition hover:bg-amber-500/[0.06]">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-bold text-inkgreen after:absolute after:inset-0">
                    {l.name}
                  </Link>
                  <p className="text-xs text-neutral-400">
                    {l.email} · {l.phone} · {dateFmt.format(new Date(l.created_at))}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-xs text-neutral-500 md:table-cell">{l.source ?? "site"}</td>
                <td className="hidden px-4 py-3 font-bold tabular-nums text-pine-700 sm:table-cell">
                  {l.estimation_ttc ? `${eurFmt.format(Number(l.estimation_ttc))} €` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatutBadge statut={l.statut} />
                </td>
                <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell">
                  {l.next_relance_at ? dateFmt.format(new Date(l.next_relance_at)) : "—"}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">
                  Aucune demande ne correspond.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
