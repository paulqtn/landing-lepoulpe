import Link from "next/link";
import { AlertTriangle, ArrowRight, BellRing, Euro, FileText, Flame, Hand, PhoneCall, Trophy } from "lucide-react";
import { ClaimButton } from "@/components/admin/ClaimButton";
import { SeedDemo } from "@/components/admin/SeedDemo";
import { dateFmt, eurFmt, ScoreBadge, StatutBadge } from "@/components/admin/ui";
import { currentRep } from "@/lib/admin/auth";
import { COMMISSION_PCT, OBJECTIF_MENSUEL, PRIME_OBJECTIF, repStats } from "@/lib/admin/compens";
import { dueRelances, listLeads, stats, type Lead } from "@/lib/admin/db";
import { listOrders } from "@/lib/admin/logistics";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default async function CommercialHome() {
  const [rep, s, tous, dues, orders] = await Promise.all([
    currentRep(),
    stats(),
    listLeads({ limit: 500 }),
    dueRelances(),
    listOrders(),
  ]);

  const miens = rep ? tous.filter((l) => l.assigned_to === rep) : tous;
  const pool = tous
    .filter((l) => !l.assigned_to && !["gagne", "perdu"].includes(l.statut))
    .sort((a, b) => Number(new Date(a.created_at)) - Number(new Date(b.created_at)));
  const devisATraiter = miens.filter((l) => l.statut === "nouveau");
  const fresh = Date.now() - 48 * 3600_000;
  const chauds = miens.filter(
    (l) => !["gagne", "perdu"].includes(l.statut) && l.last_activity_at && Number(new Date(l.last_activity_at)) > fresh,
  );
  const mesDues = rep ? dues.filter((l) => l.assigned_to === rep) : dues;
  const aAppeler = miens.filter((l) => l.statut === "nouveau" && l.score === "A" && !chauds.some((c) => c.id === l.id));
  const withOrder = new Set(orders.map((o) => o.lead_id).filter(Boolean));
  const aLancer = miens.filter((l) => l.statut === "gagne" && !withOrder.has(l.id));
  const perso = rep ? repStats(tous, rep) : null;

  /* Les tâches, dans l'ordre d'attaque du matin. */
  const taches = [
    { n: pool.length, label: "Leads entrants à piocher", sub: "premier arrivé, premier servi", href: "#pioche", icon: Hand, hot: pool.length > 0 },
    { n: chauds.length, label: "Signaux chauds à rappeler", sub: "devis consultés ces 48 h", href: "/commercial/clients?qui=moi", icon: Flame, hot: chauds.length > 0 },
    { n: devisATraiter.length, label: "Devis à traiter", sub: "calepinage + envoi", href: "/commercial/devis", icon: FileText, hot: devisATraiter.length > 0 },
    { n: mesDues.length, label: "Relances échues", sub: "la séquence vous attend", href: "/commercial/relances", icon: BellRing, hot: false },
    { n: aLancer.length, label: "Gagnées à lancer en production", sub: "envoyer à l'atelier", href: "/commercial/production", icon: Trophy, hot: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-inkgreen">{rep ? `Bonjour ${rep} 👋` : "État des lieux"}</h1>
          <p className="text-sm capitalize text-neutral-400">{dayFmt.format(new Date())}</p>
        </div>
        {s.total === 0 && <SeedDemo />}
      </div>

      {!rep && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Vous êtes connecté sans identité : déconnectez-vous puis choisissez votre nom pour retrouver
          vos clients, votre chiffre et votre prime.
        </p>
      )}

      {/* ------------------- votre argent, en premier ------------------- */}
      {perso && (
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-pine-900 p-5 text-white">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-200">
                <Euro className="h-3.5 w-3.5 text-amber-400" />
                CA signé ce mois-ci
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">{eurFmt.format(perso.caMois)} €</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-200">Commission ({COMMISSION_PCT} %)</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-amber-400">{eurFmt.format(perso.commissionMois)} €</p>
            </div>
            <div className="min-w-56 flex-1">
              <p className="flex items-baseline justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-pine-200">
                <span>Prime {eurFmt.format(PRIME_OBJECTIF)} € à {eurFmt.format(OBJECTIF_MENSUEL)} €</span>
                <span className="text-amber-400">{perso.pctObjectif} %</span>
              </p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${perso.pctObjectif}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-pine-200">
                {perso.resteObjectif > 0 ? `Encore ${eurFmt.format(perso.resteObjectif)} € pour décrocher la prime.` : "Objectif atteint — prime débloquée 🎉"}
              </p>
            </div>
          </div>
          <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 border-t border-white/10 pt-3.5 text-xs text-pine-200">
            <div>Taux de signature : <strong className="font-extrabold text-white">{perso.tauxSignature !== null ? `${perso.tauxSignature} %` : "—"}</strong></div>
            <div>Signées : <strong className="font-extrabold text-white">{perso.signees}</strong> · Perdues : <strong className="font-extrabold text-white">{perso.perdues}</strong></div>
            <div>En cours : <strong className="font-extrabold text-white">{perso.enCours}</strong> ({eurFmt.format(perso.enCoursTTC)} €)</div>
            <div>Panier moyen : <strong className="font-extrabold text-white">{eurFmt.format(perso.panierMoyen)} €</strong></div>
            <Link href="/commercial/stats" className="ml-auto inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300">
              Mes stats détaillées <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </dl>
        </section>
      )}

      {/* ----------------------- vos priorités ----------------------- */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Vos priorités du jour</h2>
        <ul className="mt-3 divide-y divide-neutral-100">
          {taches.map((t) => (
            <li key={t.label}>
              <Link href={t.href} className="flex items-center gap-4 py-3 transition hover:bg-mist/60">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${t.hot ? "bg-amber-500 text-pine-950" : "bg-pine-50 text-pine-700"}`}>
                  <t.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-inkgreen">{t.label}</span>
                  <span className="block text-xs text-neutral-400">{t.sub}</span>
                </span>
                <span className={`text-2xl font-extrabold tabular-nums ${t.n > 0 ? (t.hot ? "text-amber-600" : "text-inkgreen") : "text-neutral-300"}`}>
                  {t.n}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------- la pioche des entrants ------------------- */}
      <section id="pioche" className="rounded-2xl border border-amber-500/40 bg-white p-5">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <Hand className="h-4 w-4 text-amber-600" />
          Leads entrants — à piocher
          <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700">{pool.length}</span>
        </h2>
        <p className="mt-1 text-xs text-neutral-400">Par ordre d&rsquo;arrivée — « Je le prends » vous l&rsquo;attribue, il rejoint vos clients.</p>
        {pool.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-400">File vide — tous les entrants sont attribués.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {pool.slice(0, 8).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <ScoreBadge score={l.score} points={l.score_points} />
                <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">{l.name}</span>
                  <span className="block text-xs text-neutral-400">
                    arrivé le {dateFmt.format(new Date(l.created_at))} · {l.source ?? "site"}
                  </span>
                </Link>
                {l.estimation_ttc && (
                  <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
                )}
                <ClaimButton leadId={l.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --------------- vos clients à l'action maintenant --------------- */}
      <FileSection
        icon={<Flame className="h-4 w-4 text-orange-500" />}
        titre={rep ? "Vos signaux chauds" : "Signaux chauds"}
        vide="Pas d'activité récente sur vos devis."
        leads={chauds}
        detail={(l) => `${l.devis_views > 0 ? `${l.devis_views} vue${l.devis_views > 1 ? "s" : ""} du devis · ` : ""}${l.opens} ouv. · ${l.clicks} clic${l.clicks > 1 ? "s" : ""}`}
      />
      <FileSection
        icon={<PhoneCall className="h-4 w-4 text-green-600" />}
        titre={rep ? "Vos appels prioritaires (score A)" : "À appeler en priorité (score A)"}
        vide="Aucun client A en attente — beau travail."
        leads={aAppeler}
        detail={(l) => `${l.score_points} pts · ${l.source ?? "site"}`}
      />

      {!mailConfigured && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Emails automatiques inactifs : ajoutez RESEND_API_KEY et EMAIL_FROM dans Vercel (voir ADMIN.md).
        </p>
      )}
    </div>
  );
}

function FileSection({
  icon,
  titre,
  vide,
  leads,
  detail,
}: {
  icon: React.ReactNode;
  titre: string;
  vide: string;
  leads: Lead[];
  detail: (l: Lead) => string;
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
                <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>
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
    </section>
  );
}
