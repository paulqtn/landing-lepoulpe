import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, FileText, Phone, PlayCircle, ShieldCheck, Truck } from "lucide-react";
import { DevisActions } from "@/components/devis/DevisActions";
import { Container } from "@/components/ui/Container";
import { fichesPourLead, videoPourLead } from "@/lib/admin/assets";
import { addEvent, dbConfigured, getLeadByToken, hasRecentEvent, recordEngagement } from "@/lib/admin/db";
import { rescoreLead } from "@/lib/admin/rescore";
import { phoneHref, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Votre devis — ${site.name}`,
  robots: { index: false, follow: false },
};

const eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const dateLong = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function DevisPage({ params }: { params: Promise<{ token: string }> }) {
  if (!dbConfigured) notFound();
  const { token } = await params;
  const lead = await getLeadByToken(token);
  if (!lead) notFound();

  // Tracking de consultation (1 événement max toutes les 6h, compteur à chaque vue).
  await recordEngagement(lead.id, { devis_views: 1 });
  if (!(await hasRecentEvent(lead.id, "devis_consulte", 6))) {
    await addEvent(lead.id, "devis_consulte", "Le client a consulté son devis en ligne");
  }
  await rescoreLead(lead.id);

  const a = (lead.answers ?? {}) as Record<string, unknown>;
  const prix = lead.estimation_ttc ? Number(lead.estimation_ttc) : null;
  const fiches = fichesPourLead(a);
  const video = videoPourLead(a);

  const champs: [string, unknown][] = [
    ["Projet", a.lieu ?? a.usage],
    ["Fixation", a.systeme],
    ["Longueurs", Array.isArray(a.cotes) ? `${(a.cotes as unknown[]).join(" m + ")} m` : undefined],
    ["Hauteur", a.hauteur ? `${a.hauteur} cm` : undefined],
    ["Verre", a.verre ?? a.epaisseur],
    ["Teinte", a.teinte],
  ];

  const inclus = [
    "Verre feuilleté de sécurité découpé au millimètre",
    "Fixations, visserie et joints compris",
    "Livraison partout en France sous 10 jours",
    "Cotes vérifiées par un technicien avant fabrication",
  ];

  return (
    <main className="bg-mist">
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
            Devis n° DEV-{String(lead.id).padStart(4, "0")} · {dateLong.format(new Date(lead.created_at))}
          </p>
          <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
            {lead.name}, votre garde-corps en verre est prêt à partir en fabrication.
          </h1>

          {/* prix */}
          {prix !== null && (
            <div className="relative mt-7 overflow-hidden rounded-3xl bg-pine-900 px-6 py-7 text-white shadow-panel sm:px-8">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">
                    Votre tarif fourniture
                  </p>
                  <p className="mt-2 text-5xl font-extrabold tabular-nums tracking-tight">
                    {eur.format(prix)} € <span className="text-xl font-bold text-pine-200">TTC</span>
                  </p>
                  <p className="mt-2 text-sm text-pine-100/70">Livraison incluse · pose non comprise</p>
                </div>
                <ShieldCheck className="h-12 w-12 text-pine-500/60" />
              </div>
            </div>
          )}

          {/* récap + inclus */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Votre configuration</h2>
              <dl className="mt-3 space-y-2">
                {champs
                  .filter(([, v]) => v !== undefined && v !== null && v !== "")
                  .map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-3 border-b border-neutral-100 pb-2 last:border-0">
                      <dt className="text-xs font-semibold text-neutral-500">{k}</dt>
                      <dd className="text-sm font-bold text-inkgreen">{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
            <section className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Tout est compris</h2>
              <ul className="mt-3 space-y-2.5">
                {inclus.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-neutral-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine-600" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* actions client */}
          <DevisActions
            token={token}
            systeme={String(a.systeme ?? "rail")}
            usage={a.lieu ? String(a.lieu) : undefined}
            teinte={a.teinte ? String(a.teinte) : undefined}
            verre={a.verre || a.epaisseur ? String(a.verre ?? a.epaisseur) : undefined}
            cotes={Array.isArray(a.cotes) ? (a.cotes as number[]) : [3]}
            hauteur={String(a.hauteur ?? "100")}
          />

          {/* fiches + vidéo */}
          {(fiches.length > 0 || video) && (
            <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                Vos documents techniques
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {fiches.map((f) => (
                  <li key={f.href}>
                    <Link
                      href={f.href}
                      className="group flex items-center gap-2.5 rounded-xl border border-neutral-200 px-3.5 py-3 text-sm font-semibold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/10"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-pine-600" />
                      <span className="flex-1">{f.label}</span>
                      <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600" />
                    </Link>
                  </li>
                ))}
                {video && (
                  <li>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener"
                      className="group flex items-center gap-2.5 rounded-xl border border-neutral-200 px-3.5 py-3 text-sm font-semibold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/10"
                    >
                      <PlayCircle className="h-4 w-4 shrink-0 text-pine-600" />
                      <span className="flex-1">{video.titre}</span>
                      <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-amber-600" />
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          {/* réassurance + contact */}
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="flex items-center gap-2.5 text-sm text-neutral-600">
              <Truck className="h-5 w-5 shrink-0 text-pine-600" />
              Devis gratuit, sans engagement — fabrication sous 10 jours après validation des cotes.
            </p>
            <a
              href={phoneHref}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-mist px-5 py-2.5 text-sm font-bold text-inkgreen transition hover:bg-pine-50"
            >
              <Phone className="h-4 w-4 text-pine-600" />
              {site.phone}
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
