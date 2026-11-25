import Link from "next/link";
import { BellRing, CalendarClock, MailCheck, PhoneCall } from "lucide-react";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { RelancesEditor } from "@/components/admin/RelancesEditor";
import { canManageSettings, requireMenu } from "@/lib/admin/auth";
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
  const mine = rep && qui !== "tous";
  const dues = mine ? duesAll.filter((l) => l.assigned_to === rep) : duesAll;
  const qui_ = mine && rep ? rep : undefined;
  const [aVenir, rappels, nbRappels] = await Promise.all([relancesAVenir(qui_, 20), listRappels(qui_, 100), countRappels(qui_)]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Relances</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Séquence : devis envoyé (J0) → relance 1 à J+{jours[0]} → relance 2 à J+{jours[1]} → relance 3 à J+{jours[2]} ·{" "}
          {!mailConfigured ? "e-mails non branchés : rien ne part pour l'instant" : !seq.active ? "envoi automatique désactivé" : CRON_HORAIRE ? "envoi automatique à l'heure choisie" : "envoi automatique une fois par jour"}
        </p>
        {rep && (
          <div className="mt-2.5 flex gap-1.5">
            <Chip href="/commercial/relances" active={mine === true} label="Les miennes" />
            <Chip href="/commercial/relances?qui=tous" active={!mine} label="Toute l'équipe" />
          </div>
        )}
      </div>

      {canManageSettings(user) && <RelancesEditor initial={seq} variables={VARIABLES} mailConfigured={mailConfigured} testTo={user.email} horaire={CRON_HORAIRE} heureQuotidienne={heureQuotidienne} />}

      <section className="rounded-2xl border border-pine-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <PhoneCall className="h-4 w-4 text-pine-600" />
          À rappeler par téléphone
          <span className="ml-1 rounded-full bg-pine-50 px-2 py-0.5 text-xs font-bold text-pine-700">{nbRappels}</span>
        </h2>
        {rappels.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">Aucun rappel téléphonique en attente.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {rappels.map((l) => {
              const retard = l.rappel_at ? new Date(l.rappel_at).getTime() < Date.now() : true;
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <ScoreBadge score={l.score} points={l.score_points} />
                  <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                    <span className="block text-xs text-neutral-400">{l.phone}{mine ? "" : l.assigned_to ? ` · ${l.assigned_to}` : " · non attribué"}</span>
                  </Link>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${retard ? "bg-amber-500/15 text-amber-700 ring-amber-500/30" : "bg-neutral-50 text-neutral-500 ring-neutral-200"}`}>
                    {l.rappel_at ? `${retard ? "à rappeler depuis le" : "rappel le"} ${new Date(l.rappel_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}` : "rappel demandé par le client"}
                  </span>
                  <StatutBadge statut={l.statut} />
                </li>
              );
            })}
          </ul>
        )}
        {nbRappels > rappels.length && (
          <p className="mt-2 text-xs font-semibold text-neutral-500">
            + {nbRappels - rappels.length} autre{nbRappels - rappels.length > 1 ? "s" : ""}, les plus anciens d&rsquo;abord : traitez ceux-ci pour faire apparaître la suite.
          </p>
        )}
        <p className="mt-3 text-[11px] text-neutral-400">Ces clients ne reçoivent plus d&rsquo;e-mail automatique : c&rsquo;est à vous de les rappeler.</p>
      </section>

      <section className="rounded-2xl border border-amber-500/40 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <BellRing className="h-4 w-4 text-amber-600" />
          Échues — à traiter
          <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700">{dues.length}</span>
        </h2>
        <Liste leads={dues} vide="Aucune relance en retard — la séquence suit son cours." mode="due" />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <CalendarClock className="h-4 w-4 text-pine-600" />
          Programmées
          <span className="ml-1 rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-neutral-500">{aVenir.length}</span>
        </h2>
        <Liste leads={aVenir} vide="Rien de programmé pour l'instant." mode="prevue" />
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <MailCheck className="h-3.5 w-3.5" />
          Les e-mails ne partent que tant que le client est en « Devis envoyé » ou « Relancé » : dès qu&rsquo;un appel abouti est enregistré sur sa fiche, la séquence s&rsquo;arrête.
        </p>
      </section>
    </div>
  );
}

function Liste({ leads, vide, mode }: { leads: Lead[]; vide: string; mode: "due" | "prevue" }) {
  if (leads.length === 0) return <p className="mt-3 text-sm text-neutral-400">{vide}</p>;
  return (
    <ul className="mt-3 divide-y divide-neutral-100">
      {leads.map((l) => (
        <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <ScoreBadge score={l.score} points={l.score_points} />
          <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
            <span className="block text-xs text-neutral-400">
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

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a href={href} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${active ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"}`}>
      {label}
    </a>
  );
}
