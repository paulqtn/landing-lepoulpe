import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarClock, Eye, Factory, FilePenLine, FileText, Hand, Phone, PhoneCall, Sparkles } from "lucide-react";
import { ClaimButton } from "@/components/admin/ClaimButton";
import { PrepareQuoteButton } from "@/components/admin/QuoteEditor";
import { SeedDemo } from "@/components/admin/SeedDemo";
import { BoutonAppeler } from "@/components/admin/Telephone";
import { eurFmt } from "@/components/admin/ui";
import { currentRep, hasMenu, requireMenu } from "@/lib/admin/auth";
import { getCompSettings, repStats } from "@/lib/admin/compens";
import { dueRelances, listDevisATraiter, listLeads, listLeadsLight, listRappels, stats, type Lead } from "@/lib/admin/db";
import { listOrders } from "@/lib/admin/logistics";
import { mailConfigured } from "@/lib/admin/mail";
import { sourceLisible } from "@/lib/admin/sources";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Ma journée · Back office" } };

/* Ma journée — une seule file de travail. Chaque ligne porte un client,
   la raison pour laquelle il est là et l'action à faire, dans l'ordre
   d'urgence. Une ligne disparaît dès que l'action est faite. */

const dayFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" });
const heureFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit" });
const jourFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "short" });
const cleJour = new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris" });

/** « il y a 2 h », « hier », « il y a 4 j » : l'ancienneté se lit sans calcul. */
function ilYA(iso: string | null | undefined): string {
  if (!iso) return "";
  const min = Math.max(0, Math.round((Date.now() - Number(new Date(iso))) / 60_000));
  if (min < 60) return `il y a ${Math.max(1, min)} min`;
  if (min < 24 * 60) return `il y a ${Math.round(min / 60)} h`;
  const j = Math.round(min / 1440);
  return j === 1 ? "hier" : `il y a ${j} j`;
}

type Action = "appeler" | "devis" | "prendre" | "lancer";
type Ligne = {
  lead: Lead;
  genre: "valide" | "rappel" | "modifier" | "file" | "chaud" | "devis" | "lancer";
  raison: string;
  detail?: string;
  action: Action;
  label?: string;
  urgent?: boolean;
};

const GENRES: Record<Ligne["genre"], { icon: typeof Phone; cls: string }> = {
  valide: { icon: BadgeCheck, cls: "bg-amber-500 text-pine-950" },
  rappel: { icon: PhoneCall, cls: "bg-pine-700 text-white" },
  modifier: { icon: FilePenLine, cls: "bg-rose-100 text-rose-800" },
  file: { icon: Sparkles, cls: "bg-amber-500/20 text-amber-800" },
  chaud: { icon: Eye, cls: "bg-orange-100 text-orange-800" },
  devis: { icon: FileText, cls: "bg-pine-50 text-pine-700" },
  lancer: { icon: Factory, cls: "bg-neutral-100 text-neutral-700" },
};

export default async function MaJournee() {
  const me = await requireMenu("etat");
  const rep = await currentRep();
  const mine = rep ?? undefined;
  const [s, pool, devisATraiter, chauds, gagnes, dues, orders, persoLeads, rappels, comp] = await Promise.all([
    stats(),
    listLeads({ assigned: "__libre", actifs: true, order: "ancien", limit: 500 }),
    listDevisATraiter(mine),
    listLeads({ assigned: mine, actifs: true, activeSinceHours: 48, limit: 200 }),
    listLeads({ assigned: mine, statut: "gagne", limit: 500 }),
    dueRelances(),
    listOrders(),
    rep ? listLeadsLight({ assigned: rep }) : Promise.resolve([]),
    listRappels(mine),
    getCompSettings(),
  ]);
  const perso = rep ? repStats(persoLeads, rep, comp) : null;
  const aujourdhui = cleJour.format(new Date());
  const maintenant = Date.now();

  /* --- la file, dans l'ordre d'urgence ; un client n'y figure qu'une fois --- */
  const lignes: Ligne[] = [];
  const vus = new Set<number>();
  const ajouter = (l: Ligne) => {
    if (vus.has(l.lead.id)) return;
    vus.add(l.lead.id);
    lignes.push(l);
  };

  // 1. Le client a dit oui en ligne : rien n'est plus chaud.
  for (const l of rappels.filter((x) => x.a_valide))
    ajouter({ lead: l, genre: "valide", raison: "A validé son devis en ligne", detail: "Appelez-le pour conclure la vente.", action: "appeler", urgent: true });

  // 2. Rappels convenus pour aujourd'hui (ou en retard), et rappels demandés par le client.
  let rappelsPlusTard = 0;
  for (const l of rappels) {
    if (l.rappel_at) {
      const jour = cleJour.format(new Date(l.rappel_at));
      if (jour > aujourdhui) {
        if (!vus.has(l.id)) rappelsPlusTard++;
        continue;
      }
      const enRetard = Number(new Date(l.rappel_at)) < maintenant;
      const raison = jour < aujourdhui ? `Rappel prévu ${jourFmt.format(new Date(l.rappel_at))}, en retard` : enRetard ? `Rappel prévu à ${heureFmt.format(new Date(l.rappel_at))}, à faire maintenant` : `Rappel prévu à ${heureFmt.format(new Date(l.rappel_at))}`;
      ajouter({ lead: l, genre: "rappel", raison, action: "appeler", urgent: enRetard });
    } else {
      ajouter({ lead: l, genre: "rappel", raison: "A demandé à être rappelé", action: "appeler", urgent: true });
    }
  }

  // 3. Devis à refaire après un échange.
  for (const l of devisATraiter.filter((x) => x.statut === "devis_a_modifier"))
    ajouter({ lead: l, genre: "modifier", raison: "Attend un devis modifié", detail: l.devis_brouillon_id ? "Le nouveau devis est commencé, il reste à l'envoyer." : undefined, action: "devis", label: l.devis_brouillon_id ? "Reprendre le devis" : "Refaire le devis" });

  // 4. La prochaine demande de la file commune (une seule : elles se prennent dans l'ordre d'arrivée).
  const prochaine = pool[0];
  if (prochaine)
    ajouter({
      lead: prochaine,
      genre: "file",
      raison: `Nouvelle demande, arrivée ${ilYA(prochaine.created_at)}`,
      detail: `${sourceLisible(prochaine.source)}${pool.length > 1 ? ` · ${pool.length - 1} autre${pool.length > 2 ? "s" : ""} en attente derrière` : ""}`,
      action: "prendre",
    });

  // 5. Clients actifs sur leur devis ces 48 dernières heures.
  for (const l of chauds.filter((x) => x.statut !== "nouveau" && (x.devis_views > 0 || x.clicks > 0)))
    ajouter({
      lead: l,
      genre: "chaud",
      raison: l.devis_views > 0 ? `A consulté son devis ${l.devis_views > 1 ? `${l.devis_views} fois` : ""}${l.last_activity_at ? `${l.devis_views > 1 ? ", " : ""}dernière visite ${ilYA(l.last_activity_at)}` : ""}`.replace(/\s+,/, ",").trim() : `A cliqué dans vos e-mails ${ilYA(l.last_activity_at)}`,
      detail: "C'est le bon moment pour l'appeler.",
      action: "appeler",
    });

  // 6. Devis prêts à relire et à envoyer.
  for (const l of devisATraiter.filter((x) => x.statut !== "devis_a_modifier"))
    ajouter({
      lead: l,
      genre: "devis",
      raison: l.statut === "nouveau" ? `Devis à envoyer, demande reçue ${ilYA(l.created_at)}` : "Devis commencé, pas encore envoyé",
      action: "devis",
      label: "Relire et envoyer",
    });

  // 7. Affaires signées qui n'ont pas encore de commande à l'atelier.
  const avecCommande = new Set(orders.map((o) => o.lead_id).filter(Boolean));
  if (hasMenu(me, "production"))
    for (const l of gagnes.filter((x) => !avecCommande.has(x.id)))
      ajouter({ lead: l, genre: "lancer", raison: "Affaire signée, à lancer en production", action: "lancer" });

  const mesDues = rep ? dues.filter((l) => l.assigned_to === rep) : dues;
  const urgentes = lignes.filter((l) => l.urgent).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-inkgreen">{rep ? "Ma journée" : "La journée de l'équipe"}</h1>
          <p className="text-sm text-neutral-500">
            {dayFmt.format(new Date()).replace(/^./, (c) => c.toUpperCase())}
            {rep ? ` · bonjour ${rep}` : ""}
          </p>
        </div>
        {s.total === 0 && process.env.VERCEL_ENV !== "production" && <SeedDemo />}
      </div>

      {!rep && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Vous êtes connecté sans identité : déconnectez-vous puis choisissez votre nom pour retrouver vos clients, votre chiffre et votre prime.
        </p>
      )}

      {/* ---------------- vos résultats, sur une ligne ---------------- */}
      {perso && (
        <Link href={hasMenu(me, "stats") ? "/commercial/stats" : "/commercial"} className="flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-2xl bg-pine-900 px-5 py-3 text-sm text-pine-100 transition hover:bg-pine-800">
          <span>Signé ce mois-ci <strong className="ml-1 font-extrabold tabular-nums text-white">{eurFmt.format(perso.caMois)} € HT</strong></span>
          <span>Ma prime <strong className="ml-1 font-extrabold tabular-nums text-amber-400">{eurFmt.format(perso.primeMois)} €</strong></span>
          <span className="flex min-w-40 flex-1 items-center gap-2.5">
            <span className="shrink-0">Bonus</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"><span className="block h-full rounded-full bg-amber-500" style={{ width: `${perso.pctObjectif}%` }} /></span>
            <strong className="shrink-0 font-extrabold tabular-nums text-white">{perso.pctObjectif} %</strong>
          </span>
          {perso.margesManquantes > 0 && <span className="font-semibold text-amber-400">{perso.margesManquantes} affaire{perso.margesManquantes > 1 ? "s" : ""} sans marge enregistrée</span>}
          <span className="inline-flex items-center gap-1 font-bold text-amber-400">Mes résultats <ArrowRight className="h-3.5 w-3.5" /></span>
        </Link>
      )}

      {/* ------------------------ la file de travail ------------------------ */}
      <section className="rounded-2xl border border-neutral-200 bg-white">
        <h2 className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-5 py-4 text-base font-extrabold text-inkgreen">
          À faire maintenant
          <span className="rounded-full bg-pine-50 px-2 py-0.5 text-xs font-bold text-pine-800">{lignes.length}</span>
          {urgentes > 0 && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-800">{urgentes} urgent{urgentes > 1 ? "s" : ""}</span>}
          <span className="ml-auto text-xs font-semibold text-neutral-500">Du plus urgent au moins urgent</span>
        </h2>
        {lignes.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-bold text-inkgreen">Tout est traité.</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
              Aucun client ne vous attend pour l&rsquo;instant. Une nouvelle demande ou un devis validé apparaîtra ici, et la cloche vous préviendra.
            </p>
            <Link href="/commercial/clients" className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">
              Voir mes clients <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ol className="divide-y divide-neutral-100">
            {lignes.map((t) => {
              const G = GENRES[t.genre];
              const l = t.lead;
              return (
                <li key={`${t.genre}-${l.id}`} className={`flex flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5 ${t.urgent ? "bg-amber-500/[0.06]" : ""}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${G.cls}`} aria-hidden>
                    <G.icon className="h-5 w-5" />
                  </span>
                  <Link href={`/commercial/clients/${l.id}`} className="min-w-0 flex-1 basis-56">
                    <span className="block truncate text-sm font-bold text-inkgreen hover:text-pine-700">
                      {l.name}
                      {!rep && l.assigned_to ? <span className="ml-2 font-semibold text-neutral-500">· {l.assigned_to}</span> : null}
                    </span>
                    <span className="block text-sm text-neutral-700">{t.raison}</span>
                    {t.detail && <span className="block text-xs text-neutral-500">{t.detail}</span>}
                  </Link>
                  {l.estimation_ttc && <span className="text-sm font-extrabold tabular-nums text-pine-700">{eurFmt.format(Number(l.estimation_ttc))} €</span>}
                  <span className="flex w-full justify-end sm:w-44">
                    {t.action === "appeler" &&
                      (l.phone ? (
                        <BoutonAppeler numero={l.phone} leadId={l.id} nom={l.name} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-pine-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 sm:w-auto">
                          <Phone className="h-4 w-4" /> Appeler
                        </BoutonAppeler>
                      ) : (
                        <Link href={`/commercial/clients/${l.id}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-bold text-neutral-700 sm:w-auto">Ouvrir la fiche</Link>
                      ))}
                    {t.action === "devis" && <PrepareQuoteButton leadId={l.id} label={t.label ?? "Relire et envoyer"} />}
                    {t.action === "prendre" && <ClaimButton leadId={l.id} />}
                    {t.action === "lancer" && (
                      <Link href="/commercial/production" className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-pine-300 bg-white px-4 py-2.5 text-sm font-bold text-pine-800 transition hover:bg-pine-50 sm:w-auto">
                        <Factory className="h-4 w-4" /> Lancer
                      </Link>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* -------- ce qui ne demande rien aujourd'hui, pour mémoire -------- */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-1 text-sm text-neutral-600">
        {rappelsPlusTard > 0 && hasMenu(me, "relances") && (
          <Link href="/commercial/relances" className="inline-flex items-center gap-1.5 font-semibold hover:text-pine-700">
            <CalendarClock className="h-4 w-4 text-pine-600" /> {rappelsPlusTard} rappel{rappelsPlusTard > 1 ? "s" : ""} prévu{rappelsPlusTard > 1 ? "s" : ""} les jours suivants
          </Link>
        )}
        {hasMenu(me, "relances") && (
          <Link href="/commercial/relances" className="inline-flex items-center gap-1.5 font-semibold hover:text-pine-700">
            <Hand className="h-4 w-4 text-pine-600" /> Relances automatiques{mesDues.length > 0 ? ` : ${mesDues.length} à partir` : ""}
          </Link>
        )}
        {hasMenu(me, "devis") && (
          <Link href="/commercial/devis" className="inline-flex items-center gap-1.5 font-semibold hover:text-pine-700">
            <FileText className="h-4 w-4 text-pine-600" /> Tous les devis à traiter
          </Link>
        )}
      </div>

      {!mailConfigured && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-neutral-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Envoi d&rsquo;e-mails non branché : les devis et les relances ne partent pas. Ajoutez RESEND_API_KEY et EMAIL_FROM dans Vercel (voir ADMIN.md).
        </p>
      )}
    </div>
  );
}
