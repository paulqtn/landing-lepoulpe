import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing, Flame, PhoneCall } from "lucide-react";
import { SeedDemo } from "@/components/admin/SeedDemo";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { dueRelances, leadsJour, listLeads, pipeline, stats, STATUT_LABELS, type Lead } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default async function CommercialHome() {
  const [s, jour, dues, pipe, tous] = await Promise.all([
    stats(),
    leadsJour(),
    dueRelances(),
    pipeline(),
    listLeads({ limit: 500 }),
  ]);

  const chauds = jour.chauds.filter((c) => !jour.aAppeler.some((a) => a.id === c.id));
  const pipelineTTC = Math.round(
    tous.filter((l) => !["gagne", "perdu"].includes(l.statut) && l.estimation_ttc).reduce((t, l) => t + Number(l.estimation_ttc), 0),
  );
  const pipeMax = Math.max(1, ...pipe.map((p) => p.n));
  const aTraiter = jour.aAppeler.length + chauds.length + dues.length;

  const kpis = [
    { label: "À traiter maintenant", value: String(aTraiter), warn: aTraiter > 0 },
    { label: "Demandes (7 jours)", value: String(s.semaine) },
    { label: "Pipeline en cours (TTC)", value: `${eurFmt.format(pipelineTTC)} €` },
    { label: "CA gagné (TTC)", value: `${eurFmt.format(s.caGagne)} €` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-inkgreen">État des lieux</h1>
          <p className="text-sm capitalize text-neutral-400">{dayFmt.format(new Date())}</p>
        </div>
        {s.total === 0 && <SeedDemo />}
      </div>

      {!mailConfigured && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Emails automatiques inactifs : ajoutez RESEND_API_KEY et EMAIL_FROM dans Vercel (voir ADMIN.md).
          En attendant, devis et relances se font à la main depuis chaque fiche.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl border bg-white p-5 ${k.warn ? "border-amber-500/60" : "border-neutral-200"}`}>
            <p className={`text-3xl font-extrabold tabular-nums ${k.warn ? "text-amber-600" : "text-inkgreen"}`}>{k.value}</p>
            <p className="mt-1 text-sm font-semibold text-neutral-600">{k.label}</p>
          </div>
        ))}
      </div>

      {/* la file de travail, dans l'ordre : chauds → score A → relances échues */}
      <FileSection
        icon={<Flame className="h-4 w-4 text-orange-500" />}
        titre="Signaux chauds — devis consultés ces 48 h"
        vide="Pas d'activité récente sur les devis."
        leads={chauds}
        detail={(l) =>
          `${l.devis_views > 0 ? `${l.devis_views} vue${l.devis_views > 1 ? "s" : ""} du devis · ` : ""}${l.opens} ouv. · ${l.clicks} clic${l.clicks > 1 ? "s" : ""}`
        }
      />
      <FileSection
        icon={<PhoneCall className="h-4 w-4 text-green-600" />}
        titre="À appeler en priorité (score A)"
        vide="Aucun client A en attente — beau travail."
        leads={jour.aAppeler}
        detail={(l) => `${l.score_points} pts · ${l.source ?? "site"}`}
      />
      <FileSection
        icon={<BellRing className="h-4 w-4 text-amber-600" />}
        titre="Relances arrivées à échéance"
        vide="Aucune relance en retard."
        leads={dues.slice(0, 6)}
        detail={(l) => `relance ${l.relances + 1} prévue le ${l.next_relance_at ? dateFmt.format(new Date(l.next_relance_at)) : "—"}`}
        footer={
          dues.length > 0 ? (
            <Link href="/commercial/relances" className="group mt-1 inline-flex items-center gap-1 text-sm font-bold text-pine-700">
              Toutes les relances
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null
        }
      />

      {/* pipeline en un coup d'œil */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-inkgreen">Pipeline</h2>
          <Link href="/commercial/pipeline" className="group flex items-center gap-1 text-sm font-bold text-pine-700">
            Vue détaillée
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {pipe.map((p) => (
            <Link key={p.statut} href={`/commercial/clients?statut=${p.statut}`} className="flex items-center gap-3 rounded-lg px-1 py-0.5 transition hover:bg-mist/60">
              <span className="w-28 shrink-0 text-xs font-semibold text-neutral-500">{STATUT_LABELS[p.statut]}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-mist">
                <div
                  className={`h-full rounded-full ${p.statut === "gagne" ? "bg-green-500" : p.statut === "perdu" ? "bg-neutral-300" : "bg-pine-600"}`}
                  style={{ width: `${Math.max(4, (p.n / pipeMax) * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-extrabold tabular-nums text-inkgreen">{p.n}</span>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-neutral-400">
                {p.total > 0 ? `${eurFmt.format(p.total)} €` : ""}
              </span>
            </Link>
          ))}
          {pipe.length === 0 && <p className="text-sm text-neutral-400">Encore aucune demande.</p>}
        </div>
      </section>
    </div>
  );
}

function FileSection({
  icon,
  titre,
  vide,
  leads,
  detail,
  footer,
}: {
  icon: React.ReactNode;
  titre: string;
  vide: string;
  leads: Lead[];
  detail: (l: Lead) => string;
  footer?: React.ReactNode;
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
              <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
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
      {footer}
    </section>
  );
}
