import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, ExternalLink, FileText, Mail, MousePointerClick, Phone, StickyNote } from "lucide-react";
import { LeadActions } from "@/components/admin/LeadActions";
import { CreateOrderButton } from "@/components/admin/LogisticsActions";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { adminQuery, getLead, listEvents } from "@/lib/admin/db";
import { LeadFiles } from "@/components/admin/LeadFiles";
import { niveauInfo } from "@/lib/admin/niveaux";
import { getTeam } from "@/lib/admin/team";
import { PrepareQuoteButton } from "@/components/admin/QuoteEditor";
import { requireMenu } from "@/lib/admin/auth";
import { refusAction } from "@/lib/admin/attribution";
import { STATUT_LABELS, type Statut } from "@/lib/admin/statuts";
import { QUOTE_STATUT_LABELS, quotesForLead } from "@/lib/admin/quotes";

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
  appel: "Appel téléphonique",
  commande: "Commande atelier",
  attribution: "Attribution",
};

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMenu("clients");
  const { id } = await params;
  const lead = await getLead(Number(id));
  if (!lead) notFound();
  const [events, quotes, files] = await Promise.all([
    listEvents(lead.id),
    quotesForLead(lead.id),
    adminQuery<{ id: number; name: string; bytes: number; created_by: string | null; created_at: string }>("SELECT id, name, bytes, created_by, created_at FROM lead_files WHERE lead_id = $1 AND complete ORDER BY id DESC", [lead.id]),
  ]);
  const devisRapide = quotes.find((x) => x.statut === "brouillon") ?? quotes[0] ?? null;
  const niveau = niveauInfo(lead.niveau);
  const lectureSeule = refusAction(me, lead);
  // Anciennes lignes d'historique : le code du statut est remplacé par son libellé.
  const lisible = (m: string) => m.replace(/Statut → ([a-z_0-9]+)/, (t, k: string) => (STATUT_LABELS[k as Statut] ? `Statut → ${STATUT_LABELS[k as Statut]}` : t));
  const answers = (lead.answers ?? {}) as Record<string, unknown>;

  const champs: [string, unknown][] = [
    ["Projet", answers.lieu ?? answers.usage],
    ["Fixation", answers.systeme],
    ["Longueurs", Array.isArray(answers.cotes) ? `${(answers.cotes as unknown[]).join(" m + ")} m` : undefined],
    ["Hauteur", answers.hauteur ? `${answers.hauteur} cm` : undefined],
    ["Verre", answers.verre ?? answers.epaisseur],
    ["Teinte", answers.teinte],
    ["Installation", answers.installation],
    ["Adresse du chantier", answers.adresse],
    ["Ville", answers.ville],
    ["Code postal", answers.codePostal],
  ];

  return (
    <div className="space-y-5">
      <Link href="/commercial/clients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition hover:text-inkgreen">
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
{lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 font-semibold text-pine-700 hover:underline">
              <Mail className="h-3.5 w-3.5" /> {lead.email}
            </a>
            )}
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
        <div className="flex flex-wrap items-center gap-2">
          {niveau && <span title={niveau.description} className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${niveau.cls}`}>{niveau.n} · {niveau.label}</span>}
          <StatutBadge statut={lead.statut} />
        </div>
      </div>

      {/* actions rapides : sous l'en-tête sur ordinateur, barre fixe en bas sur téléphone */}
      {!lectureSeule && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-neutral-200 bg-white px-3 py-2 lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0">
          {lead.phone && (
            <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-pine-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 lg:flex-none">
              <Phone className="h-4 w-4" /> Appeler
            </a>
          )}
          {devisRapide && (
            <Link href={`/commercial/devis/${devisRapide.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 lg:flex-none">
              <FileText className="h-4 w-4" /> Devis{devisRapide.statut === "brouillon" && <span className="hidden sm:inline">&nbsp;à envoyer</span>}
            </Link>
          )}
          <a href="#note" className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700 lg:flex-none">
            <StickyNote className="h-4 w-4" /> Note
          </a>
        </div>
      )}

      {/* Sur téléphone : projet, puis actions, puis devis, fichiers et historique. */}
      <div className="grid grid-cols-1 gap-5 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:pb-0">
        <div className="contents lg:block lg:space-y-5">
          {/* projet + estimation */}
          <section className="order-1 rounded-2xl border border-neutral-200 bg-white p-5">
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

          {/* devis détaillés */}
          <section className="order-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Devis détaillés</h2>
              {!lectureSeule && <PrepareQuoteButton leadId={lead.id} label={quotes.some((x) => x.statut === "brouillon") ? "Ouvrir le brouillon" : "Préparer un devis"} />}
            </div>
            {quotes.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-400">Aucun devis pour l&rsquo;instant.</p>
            ) : (
              <ul className="mt-3 divide-y divide-neutral-100">
                {quotes.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                    <Link href={`/commercial/devis/${x.id}`} className="text-sm font-bold text-inkgreen hover:text-pine-700">{x.ref}</Link>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${x.statut === "brouillon" ? "bg-amber-500/15 text-amber-700" : "bg-green-50 text-green-700"}`}>{QUOTE_STATUT_LABELS[x.statut]}</span>
                    <span className="flex-1 text-xs text-neutral-400">
                      {x.sent_at ? `envoyé le ${dateFmt.format(new Date(x.sent_at))}` : `créé le ${dateFmt.format(new Date(x.created_at))}`}
                    </span>
                    <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(x.total_ttc))} € TTC</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="order-4">
            <LeadFiles leadId={lead.id} lectureSeule={Boolean(lectureSeule)} files={files.map((f) => ({ ...f, created_at: new Date(f.created_at).toISOString() }))} />
          </div>

          {/* timeline */}
          <section className="order-5 rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Historique</h2>
            <ul className="mt-3 space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pine-400" />
                  <div>
                    <p className="text-sm font-bold text-inkgreen">{EVENT_LABELS[e.type] ?? e.type}</p>
                    {e.message && <p className="whitespace-pre-line text-xs text-neutral-500">{lisible(e.message)}</p>}
                    <p className="text-[11px] text-neutral-400">{dateFmt.format(new Date(e.created_at))}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="order-2 space-y-5 lg:order-none">
          {lectureSeule ? (
            <div className="self-start rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
              <p className="text-sm font-bold text-inkgreen">Fiche en lecture seule</p>
              <p className="mt-1 text-sm text-neutral-700">{lectureSeule}</p>
              {!lead.assigned_to && (
                <Link href="/commercial" className="mt-3 inline-flex rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600">
                  Voir la file des demandes
                </Link>
              )}
            </div>
          ) : (
          <LeadActions
              leadId={lead.id}
              contact={{ name: lead.name, email: lead.email, phone: lead.phone }}
              statut={lead.statut}
              relances={lead.relances}
              hasEstimation={Boolean(lead.estimation_ttc)}
              team={await getTeam()}
              assignedTo={lead.assigned_to}
              niveau={lead.niveau ?? null}
              pauseAt={lead.sequence_pause_at ? new Date(lead.sequence_pause_at).toISOString() : null}
              nextRelanceAt={lead.next_relance_at ? new Date(lead.next_relance_at).toISOString() : null}
              rappelAt={lead.rappel_at ? new Date(lead.rappel_at).toISOString() : null}
              devisEnvoye={quotes.some((x) => x.statut === "envoye") || events.some((e) => e.type === "devis_envoye")}
            />
          )}

          {lead.statut === "gagne" && (
            <div className="rounded-2xl border border-pine-200 bg-pine-50/60 p-4">
              <p className="text-sm font-bold text-inkgreen">Client signé 🎉</p>
              <p className="mb-3 mt-0.5 text-xs text-neutral-500">
                Envoyez le dossier à l&rsquo;atelier : la commande apparaît dans le pôle Gestion
                avec la matière réservée.
              </p>
              <CreateOrderButton leadId={lead.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
