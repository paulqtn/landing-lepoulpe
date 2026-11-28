import Link from "next/link";
import { BoutonAppeler } from "@/components/admin/Telephone";
import { BellRing, CalendarClock, CheckCircle2, MailCheck, PhoneCall, Phone } from "lucide-react";
import { Carte, dateFmt, EnTete, eurFmt, Onglets, pastilleCls, Rien, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { RelancesEditor } from "@/components/admin/RelancesEditor";
import { canManageSettings, requireMenu, voitTout } from "@/lib/admin/auth";
import { CRON_HEURE_UTC, CRON_HORAIRE } from "@/lib/admin/cron-frequence";
import { VARIABLES, getRelanceSettings } from "@/lib/admin/relances";
import { countRappels, dueRelances, type Lead, listRappels, relancesAVenir } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

/* Relances — l'automatisation sous contrôle : ce qui est dû maintenant,
   ce qui partira ensuite, et l'engagement constaté sur chaque client. */

export default async function RelancesPage({ searchParams }: { searchParams: Promise<{ qui?: string }> }) {
  const user = await requireMenu("relances");
  const rep = user.name;
  const [{ qui }, duesAll, seq] = await Promise.all([searchParams, dueRelances(), getRelanceSettings()]);
  // Heure de Paris du passage quotidien, pour l'expliquer à l'écran.
  const heureQuotidienne =
    CRON_HEURE_UTC === null || !Number.isFinite(CRON_HEURE_UTC)
      ? null
      : new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "numeric", minute: "2-digit" }).format(new Date(Date.UTC(2026, new Date().getUTCMonth(), new Date().getUTCDate(), CRON_HEURE_UTC)));
  const jours = seq.delais.reduce<number[]>((acc, d, i) => [...acc, (acc[i - 1] ?? 0) + d], []);
  const equipe = voitTout(user);
  const mine = Boolean(rep) && (!equipe || qui !== "tous");
  const dues = mine ? duesAll.filter((l) => l.assigned_to === rep) : duesAll;
  const qui_ = mine && rep ? rep : undefined;
  const [aVenir, rappels, nbRappels] = await Promise.all([relancesAVenir(qui_, 20), listRappels(qui_, 100), countRappels(qui_)]);

  return (
    <div className="space-y-6">
      <EnTete
        titre="Relances"
        sous={<>{!mailConfigured ? "E-mails non branchés : rien ne part pour l'instant." : !seq.active ? "Envoi automatique désactivé." : CRON_HORAIRE ? "Envoi automatique à l'heure choisie." : "Envoi automatique une fois par jour."}</>}
      />

      <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Séquence de relances">
        {[
          { t: "Devis envoyé", j: "J0" },
          { t: "Relance 1", j: `J+${jours[0]}` },
          { t: "Relance 2", j: `J+${jours[1]}` },
          { t: "Relance 3", j: `J+${jours[2]}` },
        ].map((e, i) => (
          <li key={e.t} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3.5 py-3">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold tabular-nums ${i === 0 ? "bg-pine-700 text-white" : "bg-pine-50 text-pine-700"}`}>{i + 1}</span>
            <span className="min-w-0"><span className="block text-sm font-bold text-inkgreen">{e.t}</span><span className="block text-xs font-semibold tabular-nums text-neutral-600">{e.j}</span></span>
          </li>
        ))}
      </ol>

      {canManageSettings(user) && <RelancesEditor initial={seq} variables={VARIABLES} mailConfigured={mailConfigured} testTo={user.email} horaire={CRON_HORAIRE} heureQuotidienne={heureQuotidienne} />}

      {rep && equipe && (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <Onglets
            label="Relances affichées"
            items={[
              { href: "/commercial/relances", label: "Les miennes", on: mine === true },
              { href: "/commercial/relances?qui=tous", label: "Toute l'équipe", on: !mine },
            ]}
          />
        </div>
      )}

      <Carte icon={PhoneCall} titre="À rappeler par téléphone" n={nbRappels} sous="Ces clients ne reçoivent plus d'e-mail automatique : c'est à vous de les rappeler.">
        {rappels.length === 0 ? (
          <Rien icon={CheckCircle2}>Aucun rappel téléphonique en attente.</Rien>
        ) : (
          <ul className="-my-1 divide-y divide-neutral-100">
            {rappels.map((l) => {
              const retard = l.rappel_at ? new Date(l.rappel_at).getTime() < Date.now() : true;
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <ScoreBadge score={l.score} points={l.score_points} />
                  <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                    <span className="block text-xs text-neutral-600">{l.phone}{mine ? "" : l.assigned_to ? ` · ${l.assigned_to}` : " · non attribué"}</span>
                  </Link>
                  <span className={`${pastilleCls} ${retard ? "bg-amber-500/15 text-amber-800 ring-amber-500/30" : "bg-neutral-50 text-neutral-600 ring-neutral-200"}`}>
                    {l.rappel_at ? `${retard ? "à rappeler depuis le" : "rappel le"} ${new Date(l.rappel_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : l.a_valide ? "a validé son devis en ligne" : "rappel demandé par le client"}
                  </span>
                  <StatutBadge statut={l.statut} />
                  {l.phone && (
                    <BoutonAppeler numero={l.phone} leadId={l.id} nom={l.name} className="inline-flex items-center gap-1.5 rounded-full bg-pine-700 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-pine-600">
                      <Phone className="h-3.5 w-3.5" /> Appeler
                    </BoutonAppeler>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {nbRappels > rappels.length && (
          <p className="mt-3 text-xs font-semibold text-neutral-600">
            + {nbRappels - rappels.length} autre{nbRappels - rappels.length > 1 ? "s" : ""}, les plus anciens d&rsquo;abord : traitez ceux-ci pour faire apparaître la suite.
          </p>
        )}
      </Carte>

      <Carte icon={BellRing} titre="Échues — à traiter" n={dues.length} ton="ambre">
        <Liste leads={dues} vide="Aucune relance en retard — la séquence suit son cours." mode="due" />
      </Carte>

      <Carte icon={CalendarClock} titre="Programmées" n={aVenir.length} ton="neutre">
        <Liste leads={aVenir} vide="Rien de programmé pour l'instant." mode="prevue" />
        <p className="mt-4 flex items-start gap-1.5 text-xs text-neutral-600">
          <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Les e-mails ne partent que tant que le client est en « Devis envoyé » ou « Relancé » : dès qu&rsquo;un appel abouti est enregistré sur sa fiche, la séquence s&rsquo;arrête.
        </p>
      </Carte>
    </div>
  );
}

function Liste({ leads, vide, mode }: { leads: Lead[]; vide: string; mode: "due" | "prevue" }) {
  if (leads.length === 0) return <Rien icon={mode === "due" ? CheckCircle2 : CalendarClock}>{vide}</Rien>;
  return (
    <ul className="-my-1 divide-y divide-neutral-100">
      {leads.map((l) => (
        <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <ScoreBadge score={l.score} points={l.score_points} />
          <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
            <span className="block text-xs text-neutral-600">
              relance {Math.min(l.relances + 1, 3)}/3 · {mode === "due" ? "prévue le" : "partira le"}{" "}
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
