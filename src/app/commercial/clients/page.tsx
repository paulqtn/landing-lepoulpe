import Link from "next/link";
import { Download, Search, SearchX, UserPlus, Users, X } from "lucide-react";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";
import { TriClients } from "@/components/admin/TriClients";
import { currentRep, requireMenu, voitTout } from "@/lib/admin/auth";
import { countLeads, countLeadsParStatut, listLeads, STATUT_LABELS, STATUTS } from "@/lib/admin/db";
import type { Statut } from "@/lib/admin/statuts";
import { getTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

/* Clients — trois réglages, trois formes différentes pour ne pas les confondre :
   1. à qui sont les clients : des onglets (c'est le choix principal) ;
   2. à quelle étape ils en sont : des étiquettes légères avec une pastille de couleur et leur nombre ;
   3. dans quel ordre : un menu déroulant, discret. */

const PASTILLE: Record<Statut, string> = {
  nouveau: "bg-amber-500",
  devis_envoye: "bg-sky-500",
  relance_1: "bg-violet-400",
  relance_2: "bg-violet-500",
  relance_3: "bg-violet-700",
  a_rappeler: "bg-orange-500",
  en_discussion: "bg-teal-500",
  en_reflexion: "bg-indigo-500",
  devis_a_modifier: "bg-rose-500",
  gagne: "bg-green-600",
  perdu: "bg-neutral-400",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; q?: string; qui?: string; page?: string; tri?: string }>;
}) {
  const me = await requireMenu("clients");
  const { statut: statutParam, q: qParam, qui, page: pageParam, tri: triParam } = await searchParams;
  const q = qParam?.trim() || undefined;
  const statut = (STATUTS as readonly string[]).includes(statutParam ?? "") ? (statutParam as Statut) : undefined;
  const TRIS = [["recent", "Plus récents"], ["ancien", "Plus anciens"], ["montant", "Montant le plus élevé"], ["score", "Meilleur score"]] as const;
  const tri = TRIS.find(([k]) => k === triParam)?.[0] ?? "recent";
  const rep = await currentRep();
  const equipe = voitTout(me); // un commercial ne voit que ses clients et la file
  const mode = qui === "libre" ? "libre" : equipe && (qui === "tous" || !rep) ? "tous" : "moi";
  const assigneDe = (m: string) => (m === "moi" && rep ? rep : m === "libre" ? "__libre" : undefined);
  const assigned = assigneDe(mode);
  const PAGE = 50;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const portees = [
    ...(rep ? [{ cle: "moi", label: "Mes clients" }] : []),
    ...(equipe ? [{ cle: "tous", label: "Toute l'équipe" }] : []),
    { cle: "libre", label: "À piocher" },
  ];
  const [leads, total, parStatut, team, ...nbPortees] = await Promise.all([
    listLeads({ statut, search: q, assigned, order: tri, limit: PAGE, offset: (page - 1) * PAGE }),
    countLeads({ statut, search: q, assigned }),
    countLeadsParStatut({ search: q, assigned }),
    getTeam(),
    ...portees.map((p) => countLeads({ search: q, assigned: assigneDe(p.cle) })),
  ]);
  const totalPortee = Object.values(parStatut).reduce((s, n) => s + n, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE));

  /** Adresse de la liste avec les réglages en cours, modifiés par `change` (null retire un réglage). */
  const href = (change: Record<string, string | null>) => {
    const p: Record<string, string> = { ...(mode !== "moi" || !rep ? { qui: mode } : {}), ...(statut ? { statut } : {}), ...(q ? { q } : {}), ...(tri !== "recent" ? { tri } : {}) };
    for (const [k, v] of Object.entries(change)) {
      if (v === null || v === "") delete p[k];
      else p[k] = v;
    }
    if (p.qui === "moi") delete p.qui;
    const s = new URLSearchParams(p).toString();
    return `/commercial/clients${s ? `?${s}` : ""}`;
  };

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
  const filtre = Boolean(statut || q);

  return (
    <div className="space-y-5">
      {/* ------------------- titre et action principale ------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-inkgreen">Clients</h1>
        <div className="flex items-center gap-1.5">
          <a href={exportHref} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-white hover:text-pine-700">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sr-only sm:hidden">Exporter la liste (CSV)</span>
          </a>
          <Link href="/commercial/clients/nouveau" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-950 shadow-sm transition hover:bg-amber-600">
            <UserPlus className="h-4 w-4" />
            Nouveau prospect
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white">
        {/* ---------------- 1. à qui sont les clients : onglets ---------------- */}
        <nav aria-label="Portée de la liste" className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-3">
          {portees.map((p, i) => {
            const on = mode === p.cle;
            return (
              <Link
                key={p.cle}
                href={href({ qui: p.cle, statut: null, page: null })}
                aria-current={on ? "page" : undefined}
                className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-bold transition ${on ? "border-pine-700 text-pine-800" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-inkgreen"}`}
              >
                {p.label}
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${on ? "bg-pine-700 text-white" : p.cle === "libre" && nbPortees[i] > 0 ? "bg-amber-500/20 text-amber-800" : "bg-mist text-neutral-600"}`}>{nbPortees[i]}</span>
              </Link>
            );
          })}
        </nav>

        {/* ---------------- recherche, puis 3. ordre de la liste ---------------- */}
        <div className="flex flex-wrap items-center gap-3 px-4 pt-4">
          <form role="search" action="/commercial/clients" className="relative min-w-0 flex-1 basis-64">
            {mode !== "moi" || !rep ? <input type="hidden" name="qui" value={mode} /> : null}
            {statut && <input type="hidden" name="statut" value={statut} />}
            {tri !== "recent" && <input type="hidden" name="tri" value={tri} />}
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden />
            <input
              id="recherche-clients"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              aria-label="Rechercher un client par nom, e-mail ou téléphone"
              placeholder="Rechercher un nom, un e-mail, un téléphone…"
              className="w-full rounded-xl border border-neutral-200 bg-mist/60 py-2.5 pl-10 pr-24 text-sm text-inkgreen outline-none transition focus:border-pine-500 focus:bg-white focus:ring-4 focus:ring-pine-500/10"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-pine-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-pine-600">Chercher</button>
          </form>
          <TriClients valeur={tri} options={TRIS.map(([k, label]) => ({ cle: k, label, href: href({ tri: k === "recent" ? null : k, page: null }) }))} />
        </div>

        {/* ---------------- 2. à quelle étape : étiquettes avec pastille ---------------- */}
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4 pt-3" role="group" aria-label="Filtrer par étape">
          <span className="mr-1 text-xs font-bold uppercase tracking-wide text-neutral-500">Étape</span>
          <Etape href={href({ statut: null, page: null })} on={!statut} label="Toutes" n={totalPortee} />
          {/* Toutes les étapes restent visibles ; celles sans client sont seulement plus claires. */}
          {STATUTS.map((s) => (
            <Etape key={s} href={href({ statut: s, page: null })} on={statut === s} label={STATUT_LABELS[s]} n={parStatut[s] ?? 0} pastille={PASTILLE[s]} />
          ))}
        </div>
      </section>

      {/* ---------------- ce qui est affiché, et comment en sortir ---------------- */}
      {filtre && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <strong className="font-bold text-inkgreen">{total.toLocaleString("fr-FR")} client{total > 1 ? "s" : ""}</strong>
          {statut && <Retirer href={href({ statut: null, page: null })} label={`Étape : ${STATUT_LABELS[statut]}`} />}
          {q && <Retirer href={href({ q: null, page: null })} label={`Recherche : « ${q} »`} />}
          <Link href={href({ statut: null, q: null, page: null })} className="font-semibold text-pine-700 hover:underline">Tout effacer</Link>
        </p>
      )}

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-neutral-500">{filtre ? <SearchX className="h-6 w-6" /> : <Users className="h-6 w-6" />}</span>
          <p className="mt-4 text-base font-extrabold text-inkgreen">
            {filtre ? "Aucun client ne correspond" : mode === "libre" ? "La file est vide" : mode === "tous" ? "Aucun client pour l'instant" : "Vous n'avez pas encore de client"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">
            {filtre
              ? "Essayez un autre mot, ou retirez le filtre d'étape."
              : mode === "libre"
                ? "Toutes les demandes entrantes sont attribuées. Les prochaines arriveront ici."
                : "Prenez une demande dans la file, ou créez une fiche pour un contact reçu par téléphone."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {filtre ? (
              <Link href={href({ statut: null, q: null, page: null })} className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600">Effacer les filtres</Link>
            ) : (
              <>
                {mode !== "libre" && <Link href={href({ qui: "libre", statut: null, page: null })} className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600">Voir les demandes à piocher</Link>}
                <Link href="/commercial/clients/nouveau" className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"><UserPlus className="h-4 w-4" /> Nouveau prospect</Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <LeadsTable leads={rows} team={team} />
          <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600" aria-label="Pagination">
            <span>
              {total.toLocaleString("fr-FR")} client{total > 1 ? "s" : ""}{pages > 1 ? ` · page ${Math.min(page, pages)} sur ${pages}` : ""}
            </span>
            <span className="flex gap-1.5">
              {page > 1 && <Link href={href({ page: page > 2 ? String(page - 1) : null })} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">← Précédente</Link>}
              {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">Suivante →</Link>}
            </span>
          </nav>
        </>
      )}
    </div>
  );
}

/** Étiquette d'étape : légère, avec une pastille de couleur (celle du statut dans le tableau) et le nombre de clients. Sans client, elle reste là, plus claire. */
function Etape({ href, on, label, n, pastille }: { href: string; on: boolean; label: string; n: number; pastille?: string }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${on ? "bg-pine-50 font-bold text-pine-900 ring-1 ring-inset ring-pine-600" : n > 0 ? "font-medium text-neutral-700 hover:bg-mist" : "font-medium text-neutral-500 hover:bg-mist hover:text-neutral-700"}`}
    >
      {pastille && <span className={`h-2 w-2 shrink-0 rounded-full ${pastille} ${n > 0 || on ? "" : "opacity-40"}`} aria-hidden />}
      {label}
      <span className={`text-xs tabular-nums ${on ? "font-bold text-pine-800" : n > 0 ? "font-semibold text-neutral-600" : "text-neutral-400"}`}>{n}</span>
    </Link>
  );
}

function Retirer({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-neutral-700 ring-1 ring-inset ring-neutral-200 transition hover:text-red-700 hover:ring-red-200" title="Retirer ce filtre">
      {label} <X className="h-3.5 w-3.5" />
    </Link>
  );
}
