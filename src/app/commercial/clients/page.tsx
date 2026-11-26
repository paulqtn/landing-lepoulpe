import Link from "next/link";
import { Download, UserPlus } from "lucide-react";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { currentRep, requireMenu, voitTout } from "@/lib/admin/auth";
import { countLeads, listLeads, STATUT_LABELS, STATUTS } from "@/lib/admin/db";
import { getTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; qui?: string; page?: string; tri?: string }>;
}) {
  const me = await requireMenu("clients");
  const { statut, q, qui, page: pageParam, tri: triParam } = await searchParams;
  const TRIS = [["recent", "Plus récents"], ["ancien", "Plus anciens"], ["montant", "Montant"], ["score", "Score"]] as const;
  const tri = TRIS.find(([k]) => k === triParam)?.[0] ?? "recent";
  const rep = await currentRep();
  const equipe = voitTout(me); // un commercial ne voit que ses clients et la file
  const mode = qui === "libre" ? "libre" : equipe && (qui === "tous" || !rep) ? "tous" : "moi";
  const assigned = mode === "moi" && rep ? rep : mode === "libre" ? "__libre" : undefined;
  const PAGE = 50;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const [leads, total] = await Promise.all([
    listLeads({ statut, search: q, assigned, order: tri, limit: PAGE, offset: (page - 1) * PAGE }),
    countLeads({ statut, search: q, assigned }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const pageHref = (n: number) =>
    `/commercial/clients?${new URLSearchParams({ ...(statut ? { statut } : {}), ...(q ? { q } : {}), ...(qui ? { qui } : {}), ...(tri !== "recent" ? { tri } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`;
  const triHref = (t: string) => `/commercial/clients?${new URLSearchParams({ ...(statut ? { statut } : {}), ...(q ? { q } : {}), ...(qui ? { qui } : {}), ...(t !== "recent" ? { tri: t } : {}) })}`;
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
    niveau: l.niveau ?? null,
  }));

  const exportHref = `/api/admin/export?${new URLSearchParams({ ...(statut ? { statut } : {}), ...(q ? { q } : {}) })}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-inkgreen">Clients</h1>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2" action="/commercial/clients">
            {statut && <input type="hidden" name="statut" value={statut} />}
            {qui && <input type="hidden" name="qui" value={qui} />}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Nom, email, téléphone…"
              className="w-56 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-pine-500"
            />
          </form>
          <Link href="/commercial/clients/nouveau" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-pine-950 transition hover:bg-amber-600">
            <UserPlus className="h-3.5 w-3.5" />
            Nouveau prospect
          </Link>
          <a
            href={exportHref}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      {rep && (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip href={`/commercial/clients${statut ? `?statut=${statut}` : ""}`} active={mode === "moi"} label={`Mes clients`} />
          {equipe && <FilterChip href={`/commercial/clients?qui=tous${statut ? `&statut=${statut}` : ""}`} active={mode === "tous"} label="Toute l'équipe" />}
          <FilterChip href={`/commercial/clients?qui=libre${statut ? `&statut=${statut}` : ""}`} active={mode === "libre"} label="À piocher" />
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        <FilterChip href={`/commercial/clients${mode !== "moi" ? `?qui=${qui}` : ""}`} active={!statut} label="Tous statuts" />
        {STATUTS.map((s) => (
          <FilterChip key={s} href={`/commercial/clients?statut=${s}${mode !== "moi" && qui ? `&qui=${qui}` : ""}`} active={statut === s} label={STATUT_LABELS[s]} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-semibold text-neutral-500">Trier par</span>
        {TRIS.map(([k, label]) => (
          <FilterChip key={k} href={triHref(k)} active={tri === k} label={label} />
        ))}
      </div>

      <LeadsTable leads={rows} team={await getTeam()} />

      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500" aria-label="Pagination">
        <span>
          {total.toLocaleString("fr-FR")} client{total > 1 ? "s" : ""} · page {Math.min(page, pages)} sur {pages}
        </span>
        <span className="flex gap-1.5">
          {page > 1 && <FilterChip href={pageHref(page - 1)} active={false} label="← Précédente" />}
          {page < pages && <FilterChip href={pageHref(page + 1)} active={false} label="Suivante →" />}
        </span>
      </nav>
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
