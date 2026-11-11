import Link from "next/link";
import { ArrowRight, FileText, Ruler } from "lucide-react";
import { dateFmt, eurFmt, ScoreBadge } from "@/components/admin/ui";
import { currentRep } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/db";
import { USAGE_LABELS } from "@/lib/admin/statuts";

export const dynamic = "force-dynamic";

/* Devis à traiter — les demandes qui attendent leur chiffrage :
   calepinage au calculateur interne, puis envoi depuis la fiche. */

export default async function DevisPage({ searchParams }: { searchParams: Promise<{ qui?: string }> }) {
  const [{ qui }, rep, tous] = await Promise.all([searchParams, currentRep(), listLeads({ limit: 500 })]);
  const mode = qui === "tous" || !rep ? "tous" : "moi";
  const base = tous.filter((l) => l.statut === "nouveau");
  const list = (mode === "moi" ? base.filter((l) => l.assigned_to === rep) : base).sort(
    (a, b) => Number(new Date(a.created_at)) - Number(new Date(b.created_at)),
  );

  const age = (iso: string) => {
    const hrs = Math.round((Date.now() - Number(new Date(iso))) / 3600_000);
    return hrs < 24 ? `${hrs} h` : `${Math.round(hrs / 24)} j`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-inkgreen">Devis à traiter</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Calepinage au calculateur, envoi du devis depuis la fiche — puis le statut passe à « Devis envoyé ».
          </p>
        </div>
        {rep && (
          <div className="flex gap-1.5">
            <Chip href="/commercial/devis" active={mode === "moi"} label="Les miens" />
            <Chip href="/commercial/devis?qui=tous" active={mode === "tous"} label="Toute l'équipe" />
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">
            Aucun devis en attente{mode === "moi" ? " chez vous" : ""} — piochez des entrants depuis l&rsquo;état des lieux.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {list.map((l) => {
              const a = (l.answers ?? {}) as Record<string, unknown>;
              const cotes = Array.isArray(a.cotes) ? (a.cotes as number[]).join(" + ") : null;
              const usage = typeof a.lieu === "string" ? USAGE_LABELS[a.lieu] ?? a.lieu : null;
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2.5 py-3.5">
                  <ScoreBadge score={l.score} points={l.score_points} />
                  <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                    <span className="block text-xs text-neutral-400">
                      {usage ? `${usage} · ` : ""}
                      {cotes ? `${cotes} m · ` : ""}
                      {a.hauteur ? `h${a.hauteur} · ` : ""}
                      reçu il y a {age(String(l.created_at))} ({dateFmt.format(new Date(l.created_at))})
                      {mode === "tous" && l.assigned_to ? ` · ${l.assigned_to}` : ""}
                    </span>
                  </Link>
                  {l.estimation_ttc ? (
                    <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                  ) : (
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">sans estimation</span>
                  )}
                  <Link
                    href="/calculateur"
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    Calepinage
                  </Link>
                  <Link
                    href={`/commercial/clients/${l.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Traiter le devis
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
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
