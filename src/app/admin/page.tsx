import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing, Euro, Inbox, TrendingUp } from "lucide-react";
import { dateFmt, eurFmt, StatutBadge } from "@/components/admin/ui";
import { dbConfigured, dueRelances, listLeads, stats } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!dbConfigured) return <SetupNotice />;

  const [s, dues, derniers] = await Promise.all([stats(), dueRelances(), listLeads({ limit: 8 })]);

  const kpis = [
    { icon: Inbox, label: "Demandes (7 jours)", value: String(s.semaine), sub: `${s.total} au total` },
    { icon: TrendingUp, label: "Devis en cours", value: String(s.devisEnvoyes), sub: `${s.gagnes} gagnés · ${s.perdus} perdus` },
    { icon: BellRing, label: "Relances à traiter", value: String(s.relancesDues), sub: mailConfigured ? "envoi auto chaque matin" : "emails non configurés" },
    { icon: Euro, label: "CA gagné (TTC)", value: `${eurFmt.format(s.caGagne)} €`, sub: "sur les demandes marquées gagnées" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-inkgreen">Tableau de bord</h1>

      {!mailConfigured && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Emails automatiques inactifs : ajoutez RESEND_API_KEY et EMAIL_FROM dans Vercel (voir ADMIN.md).
          En attendant, devis et relances se font à la main depuis chaque fiche.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-pine-50 text-pine-700">
              <k.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-inkgreen">{k.value}</p>
            <p className="text-sm font-semibold text-neutral-600">{k.label}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {dues.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-white p-5">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
            <BellRing className="h-4 w-4 text-amber-600" />
            Relances arrivées à échéance
          </h2>
          <ul className="mt-3 divide-y divide-neutral-100">
            {dues.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-mist/60">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-inkgreen">{l.name}</span>
                    <span className="text-xs text-neutral-400">
                      relance {l.relances + 1} · prévue le {dateFmt.format(new Date(l.next_relance_at!))}
                    </span>
                  </span>
                  <StatutBadge statut={l.statut} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-inkgreen">Dernières demandes</h2>
          <Link href="/admin/leads" className="group flex items-center gap-1 text-sm font-bold text-pine-700">
            Tout voir
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-neutral-100">
          {derniers.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-mist/60">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-inkgreen">{l.name}</span>
                  <span className="text-xs text-neutral-400">
                    {dateFmt.format(new Date(l.created_at))} · {l.source ?? "site"}
                    {l.estimation_ttc ? ` · ${eurFmt.format(Number(l.estimation_ttc))} € TTC` : ""}
                  </span>
                </span>
                <StatutBadge statut={l.statut} />
              </Link>
            </li>
          ))}
          {derniers.length === 0 && <li className="py-6 text-center text-sm text-neutral-400">Aucune demande pour l&rsquo;instant.</li>}
        </ul>
      </section>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8">
      <h1 className="text-xl font-extrabold text-inkgreen">Base de données à connecter</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
        Le back office stocke les demandes dans Postgres. Dans Vercel : onglet
        <strong> Storage → Create Database → Postgres (Neon)</strong>, liez-la au projet — la variable
        <code className="mx-1 rounded bg-mist px-1.5 py-0.5 font-mono text-xs">POSTGRES_URL</code>
        est injectée automatiquement, puis redéployez. Détails et variables optionnelles (emails, cron)
        dans <strong>ADMIN.md</strong> à la racine du repo.
      </p>
    </div>
  );
}
