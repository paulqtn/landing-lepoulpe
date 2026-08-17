import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardList,
  Phone,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { materials, usages } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import { products } from "@/lib/products";
import { phoneHref, site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Garde-corps en verre, alu & inox en direct usine | ${site.name}`,
  description:
    "Garde-corps en verre, aluminium et inox — sur-mesure au millimètre ou en kit, en direct usine. Piscine, escalier, balcon, terrasse. Devis détaillé en 24h.",
  alternates: { canonical: "/" },
};

const steps = [
  { n: "01", title: "Configurez en 1 min", desc: "Projet, matériau, dimensions : le configurateur estime votre budget immédiatement." },
  { n: "02", title: "Devis détaillé en 24h", desc: "Un conseiller affine et vous envoie un devis poste par poste, gratuit et sans engagement." },
  { n: "03", title: "Fabrication d’usine", desc: "Sur-mesure au millimètre ou kit expédié : contrôle qualité avant chaque départ." },
  { n: "04", title: "Pose ou livraison", desc: "Posé par notre réseau, ou livré chez vous prêt à poser, partout en France." },
];

export default function Home() {
  return (
    <main>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-mist">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          {/* copy */}
          <div className="animate-fade-up">
            <p className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
              <span className="h-px w-10 bg-neutral-300" />
              Spécialiste garde-corps
            </p>
            <h1 className="mt-5 text-balance text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-inkgreen sm:text-6xl">
              Garde-corps <em className="not-italic text-pine-600">en direct usine</em>.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-600">
              Verre, aluminium ou inox — <strong className="text-inkgreen">sur-mesure au millimètre ou en kit</strong>,
              pour piscine, escalier, balcon et terrasse. Conformes NF P01-012, à prix d’usine.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/devis"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-pine-700 py-4 pl-7 pr-6 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-pine-600"
              >
                <Check className="h-5 w-5" />
                Estimer un tarif
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={phoneHref}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white py-3 pl-3.5 pr-6 shadow-card transition-all hover:-translate-y-0.5"
              >
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-pine-50 text-pine-700">
                  <Phone className="h-4 w-4 group-hover:animate-wiggle" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                </span>
                <span className="text-left leading-tight">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                    Conseiller dispo
                  </span>
                  <span className="block text-sm font-bold text-inkgreen">{site.phone}</span>
                </span>
              </a>
            </div>

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card">
              <span className="text-sm font-bold text-inkgreen">Avis Google</span>
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                ))}
              </span>
              <span className="text-sm text-neutral-500">
                <strong className="text-inkgreen">5/5</strong> · clients vérifiés
              </span>
            </div>
          </div>

          {/* carte devis flottante */}
          <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]">
            <span className="absolute -top-4 right-6 z-10 inline-flex rotate-[3deg] items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-pine-950 shadow-md">
              <Zap className="h-3.5 w-3.5" />
              24 h chrono
            </span>
            <div className="rounded-3xl bg-white p-6 shadow-elevated ring-1 ring-neutral-900/5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Votre devis</p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-inkgreen">DEV-2026-00184</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Validé
                </span>
              </div>
              <div className="mt-5 space-y-4 border-t border-neutral-100 pt-5">
                {[
                  { l: "Garde-corps verre autoportant", s: "6 ml · trempé-feuilleté 55.2", p: "1 890 €" },
                  { l: "Profilé alu en pince + visserie", s: "Pose sur dalle béton", p: "420 €" },
                  { l: "Pose & mise en conformité", s: "Équipe certifiée", p: "640 €" },
                ].map((r) => (
                  <div key={r.l} className="flex items-baseline justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-inkgreen">{r.l}</p>
                      <p className="text-xs text-neutral-400">{r.s}</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums text-inkgreen">{r.p}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-pine-50 px-4 py-3.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-700">Total TTC</span>
                <span className="text-2xl font-extrabold tabular-nums text-pine-700">2 950 €</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Valable 30 jours
                </span>
                <span className="font-mono">exemple de devis</span>
              </div>
            </div>
          </div>
        </Container>

        {/* bandeau réassurance */}
        <div className="border-t border-neutral-200 bg-white">
          <Container className="grid grid-cols-2 gap-x-6 gap-y-4 py-5 sm:grid-cols-4">
            {[
              { icon: ClipboardList, label: "Devis détaillé en 24h" },
              { icon: Ruler, label: "Sur-mesure au millimètre" },
              { icon: ShieldCheck, label: "Conforme NF P01-012" },
              { icon: Truck, label: "Livraison partout en France" },
            ].map((p) => (
              <span key={p.label} className="flex items-center gap-2.5 text-sm font-semibold text-inkgreen">
                <p.icon className="h-5 w-5 shrink-0 text-pine-600" />
                {p.label}
              </span>
            ))}
          </Container>
        </div>
      </section>

      {/* ========================= MATÉRIAUX ========================= */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Nos garde-corps</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Trois matériaux, un même niveau d’exigence.
              </h2>
            </div>
            <Link href="/produits" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Voir tous les kits
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {materials.map((m, i) => (
              <Reveal key={m.slug} delay={i * 80}>
                <Link
                  href={`/garde-corps/${m.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-elevated"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    0{i + 1}
                  </span>
                  <h3 className="mt-3 text-2xl font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">
                    {m.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-neutral-600">{m.intro}</p>
                  <ul className="mt-5 space-y-2">
                    {m.benefits.slice(0, 3).map((b) => (
                      <li key={b.title} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <Check className="h-4 w-4 shrink-0 text-pine-600" />
                        {b.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 border-t border-neutral-100 pt-5 text-sm font-bold text-pine-700">
                    Découvrir
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== USAGES =========================== */}
      <section className="border-y border-neutral-200 bg-mist py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Par usage</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
            Un garde-corps pour chaque configuration.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usages.map((u, i) => (
              <Reveal key={u.slug} delay={i * 50}>
                <Link
                  href={`/garde-corps/${u.slug}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">
                      {u.name}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pine-600" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">{u.benefits[0].desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ====================== PRODUITS PHARES ====================== */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Kits en direct usine</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Les kits les plus demandés.
              </h2>
            </div>
            <Link href="/produits" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Toute la gamme
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  href={`/produits/${p.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                >
                  {p.badge ? (
                    <span className="w-fit rounded-full bg-amber-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-pine-950">
                      {p.badge}
                    </span>
                  ) : (
                    <span className="w-fit rounded-full bg-mist px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                      {p.material}
                    </span>
                  )}
                  <h3 className="mt-3 text-lg font-extrabold text-inkgreen transition-colors group-hover:text-pine-700">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">{p.specs[0]} · {p.specs[1]}</p>
                  <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
                    <span className="text-xl font-extrabold text-pine-700">
                      dès {p.priceFrom} €<span className="text-xs font-semibold text-neutral-400">/ml</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-pine-700">
                      Voir
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== ÉTAPES =========================== */}
      <section className="border-y border-neutral-200 bg-mist py-20 sm:py-28">
        <Container>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Comment ça marche</p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
            De l’estimation à la pose, en 4 étapes.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6">
                  <span className="font-mono text-sm font-bold text-pine-600">{s.n}</span>
                  <h3 className="mt-3 text-lg font-extrabold text-inkgreen">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================== GUIDES =========================== */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Guides &amp; conseils</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
                Bien choisir, en connaissance de cause.
              </h2>
            </div>
            <Link href="/guides" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-pine-700">
              Tous les guides
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.slice(0, 3).map((g, i) => (
              <Reveal key={g.slug} delay={i * 70}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-300 hover:shadow-card"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Guide</span>
                  <h3 className="mt-2.5 flex-1 text-lg font-extrabold leading-snug text-inkgreen transition-colors group-hover:text-pine-700">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{g.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-pine-700">
                    Lire le guide
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ========================= CTA FINAL ========================= */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-pine-900 px-6 py-16 text-white sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0 bg-pinegrid" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-pine-200">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    Dernière étape
                  </span>
                  <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.05] sm:text-5xl">
                    Votre devis personnalisé,
                    <br />
                    <span className="text-pine-200">en 24 h chrono.</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-pine-100/75">
                    Configurez votre projet en ligne en 1 minute. Notre équipe vous
                    renvoie un devis détaillé, sans engagement.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    {["Devis sous 24h", "Sans engagement", "Livraison France"].map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm font-semibold text-pine-100">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-green-500/20 text-green-400">
                          <Check className="h-3 w-3" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/devis"
                      className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white py-4 pl-7 pr-6 text-base font-bold text-pine-800 transition-all hover:-translate-y-0.5"
                    >
                      <ClipboardList className="h-5 w-5" />
                      Estimer mon projet en 1 min
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href={phoneHref}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white/10 px-7 py-4 text-base font-bold text-white ring-1 ring-white/20 transition-all hover:bg-white/15"
                    >
                      <Phone className="h-5 w-5" />
                      ou {site.phone}
                    </a>
                  </div>
                </div>

                {/* mini-devis décoratif */}
                <div className="relative hidden lg:block">
                  <div className="rotate-2 rounded-2xl bg-white p-6 shadow-panel">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">Votre devis</p>
                      <span className="rounded-full bg-pine-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-pine-700">Validé</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-inkgreen">Garde-corps inox 316</span>
                        <span className="font-bold text-inkgreen">1 240 €</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>5 ml · barres Ø 12 mm</span>
                        <span>TVA 10 %</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-pine-50 px-4 py-3">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-pine-700">Total TTC</span>
                      <span className="text-xl font-extrabold text-pine-700">1 364 €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
