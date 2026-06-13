import {
  ArrowRight,
  Megaphone,
  MonitorSmartphone,
  Search,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { OctopusMark } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Floating service chips arranged around the central octopus "hub". */
const chips = [
  { icon: MonitorSmartphone, label: "Site web", pos: "left-[-4%] top-[14%]", delay: "0s" },
  { icon: Search, label: "SEO", pos: "right-[-2%] top-[8%]", delay: "0.8s" },
  { icon: Megaphone, label: "Publicité", pos: "right-[-6%] top-[46%]", delay: "1.6s" },
  { icon: Share2, label: "Réseaux sociaux", pos: "right-[4%] bottom-[10%]", delay: "0.4s" },
  { icon: ShieldCheck, label: "Maintenance", pos: "left-[-2%] bottom-[14%]", delay: "1.2s" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-poulpe-200/50 blur-3xl" />
        <div className="absolute right-[-6%] top-[18%] h-72 w-72 rounded-full bg-poulpe-400/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.05) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 100%)",
          }}
        />
      </div>

      <Container className="grid items-center gap-14 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        {/* Copy */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-poulpe-700 shadow-sm ring-1 ring-poulpe-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-poulpe-500" />
            Agence web 360°
          </span>

          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
            Déployez votre présence digitale sur{" "}
            <span className="text-gradient">tous les fronts</span>.
          </h1>

          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-slate-600">
            Le Poulpe est votre partenaire digital 360°. Sites vitrines, landing
            pages qui convertissent, SEO, publicité et réseaux sociaux : une
            équipe, une stratégie, des résultats mesurables.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#contact" size="lg">
              Démarrer mon projet
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="#services" variant="secondary" size="lg">
              Découvrir nos services
            </ButtonLink>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-poulpe-500 text-poulpe-500"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-600">
                4,9/5 · clients satisfaits
              </span>
            </div>
            <div className="hidden h-5 w-px bg-slate-200 sm:block" />
            <p className="text-sm font-medium text-slate-600">
              <span className="font-bold text-ink">+120</span> projets livrés
            </p>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-square">
            {/* Dashed orbit rings */}
            <div className="absolute inset-[8%] rounded-full border border-dashed border-poulpe-200" />
            <div className="absolute inset-[22%] rounded-full border border-dashed border-poulpe-200/70" />

            {/* Central hub */}
            <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-2xl shadow-poulpe-500/30 sm:h-44 sm:w-44">
              <OctopusMark className="h-16 w-16 sm:h-20 sm:w-20" />
              <span className="mt-1 text-sm font-bold tracking-tight">360°</span>
            </div>

            {/* Floating chips */}
            {chips.map(({ icon: Icon, label, pos, delay }) => (
              <div
                key={label}
                className={`animate-float absolute ${pos} flex items-center gap-2 rounded-full bg-white py-2 pl-2.5 pr-4 shadow-lg ring-1 ring-slate-100`}
                style={{ animationDelay: delay }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-poulpe-50 text-poulpe-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap text-xs font-semibold text-ink">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
