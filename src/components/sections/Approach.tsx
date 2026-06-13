import { Clock, Layers, Target } from "lucide-react";
import { OctopusMark } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const pillars = [
  {
    icon: Layers,
    title: "Un seul interlocuteur",
    description:
      "Fini les prestataires éparpillés. Un partenaire unique orchestre l’ensemble de votre présence digitale.",
  },
  {
    icon: Target,
    title: "Une stratégie cohérente",
    description:
      "Site, référencement, publicité et réseaux sociaux avancent dans la même direction, vers vos objectifs.",
  },
  {
    icon: Clock,
    title: "Un vrai gain de temps",
    description:
      "Vous vous concentrez sur votre métier, on s’occupe de tout le digital, de A à Z.",
  },
];

export function Approach() {
  return (
    <section id="approche" className="scroll-mt-24 bg-ink py-20 sm:py-28">
      <Container>
        <div className="relative">
          {/* glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-poulpe-500/20 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <Reveal className="mb-6 flex justify-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-xl shadow-poulpe-500/30">
                <OctopusMark className="h-10 w-10" />
              </span>
            </Reveal>

            <SectionHeading
              dark
              eyebrow="Notre approche"
              title={
                <>
                  Pourquoi choisir une agence{" "}
                  <span className="text-gradient">360°</span> ?
                </>
              }
              intro="Comme un poulpe déploie ses tentacules, nous agissons sur tous les fronts du digital à la fois — avec une seule tête pensante derrière la stratégie."
            />
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors hover:border-poulpe-500/40 hover:bg-white/[0.07]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-poulpe-500/15 text-poulpe-400">
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
