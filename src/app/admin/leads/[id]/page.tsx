import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink, Mail, MousePointerClick, Phone } from "lucide-react";
import { LeadActions } from "@/components/admin/LeadActions";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { dbConfigured, getLead, listEvents } from "@/lib/admin/db";
import { getTeam } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  creation: "Demande reçue",
  devis_envoye: "Devis envoyé",
  devis_echec: "Échec d'envoi du devis",
  devis_consulte: "Devis consulté en ligne",
  devis_accepte: "Devis accepté par le client",
  rappel_demande: "Rappel demandé",
  cotes_maj: "Cotes corrigées par le client",
  email_ouvert: "Email ouvert",
  email_clique: "Clic dans un email",
  email_bounce: "Email non délivré",
  relance_envoyee: "Relance envoyée",
  relance_echec: "Échec de relance",
  relance_programmee: "Relance programmée",
  statut: "Changement de statut",
  note: "Note",
  info: "Info",
};

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  if (!dbConfigured) notFound();
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();
  const events = await listEvents(lead.id);
  const answers = (lead.answers ?? {}) as Record<string, unknown>;

  const champs: [string, unknown][] = [
    ["Projet", answers.lieu ?? answers.usage],
    ["Fixation", answers.systeme],
    ["Longueurs", Array.isArray(answers.cotes) ? `${(answers.cotes as unknown[]).join(" m + ")} m` : undefined],
    ["Hauteur", answers.hauteur ? `${answers.hauteur} cm` : undefined],
    ["Verre", answers.verre ?? answers.epaisseur],
    ["Teinte", answers.teinte],
    ["Installation", answers.installation],
    ["Code postal", answers.codePostal],
  ];

  return (
    <div className="space-y-5">
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition hover:text-inkgreen">
        <ArrowLeft className="h-4 w-4" />
        Toutes les demandes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ScoreBadge score={lead.score} points={lead.score_points} />
            <h1 className="text-2xl font-extrabold text-inkgreen">{lead.name}</h1>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 font-semibold text-pine-700 hover:underline">
              <Mail className="h-3.5 w-3.5" /> {lead.email}
            </a>
            <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 font-semibold text-pine-700 hover:underline">
              <Phone className="h-3.5 w-3.5" /> {lead.phone}
            </a>
            <span>reçue le {dateFmt.format(new Date(lead.created_at))}</span>
            <span>source : {lead.source ?? "site"}</span>
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {lead.devis_views} vue{lead.devis_views > 1 ? "s" : ""} du devis
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {lead.opens} ouverture{lead.opens > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3.5 w-3.5" /> {lead.clicks} clic{lead.clicks > 1 ? "s" : ""}
            </span>
            {lead.token && (
              <a href={`/d/${lead.token}`} target="_blank" className="flex items-center gap-1 font-semibold text-pine-700 hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Voir le devis en ligne
              </a>
            )}
          </p>
        </div>
        <StatutBadge statut={lead.statut} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-5">
          {/* projet + estimation */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Projet configuré</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {champs
                .filter(([, v]) => v !== undefined && v !== null && v !== "")
                .map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2">
                    <dt className="text-xs font-semibold text-neutral-500">{k}</dt>
                    <dd className="text-sm font-bold text-inkgreen">{String(v)}</dd>
                  </div>
                ))}
            </dl>
            {lead.estimation_ttc && (
              <p className="mt-4 rounded-xl bg-pine-900 px-4 py-3 text-white">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Estimation affichée</span>
                <span className="mt-1 block text-2xl font-extrabold tabular-nums">{eurFmt.format(Number(lead.estimation_ttc))} € TTC</span>
              </p>
            )}
          </section>

          {/* timeline */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Historique</h2>
            <ul className="mt-3 space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pine-400" />
                  <div>
                    <p className="text-sm font-bold text-inkgreen">{EVENT_LABELS[e.type] ?? e.type}</p>
                    {e.message && <p className="text-xs text-neutral-500">{e.message}</p>}
                    <p className="text-[11px] text-neutral-400">{dateFmt.format(new Date(e.created_at))}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <LeadActions
          leadId={lead.id}
          statut={lead.statut}
          relances={lead.relances}
          nextRelanceAt={lead.next_relance_at}
          hasEstimation={Boolean(lead.estimation_ttc)}
          team={getTeam()}
          assignedTo={lead.assigned_to}
        />
      </div>
    </div>
  );
}
