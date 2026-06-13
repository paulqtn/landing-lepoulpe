import {
  Megaphone,
  MonitorSmartphone,
  type LucideIcon,
  Rocket,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
};

const services: Service[] = [
  {
    icon: MonitorSmartphone,
    title: "Sites vitrines",
    description:
      "Des sites élégants et professionnels qui mettent en valeur votre activité et renforcent votre crédibilité en ligne.",
  },
  {
    icon: Rocket,
    title: "Landing pages",
    description:
      "Des pages pensées pour convertir : design percutant, message clair et appels à l’action efficaces pour générer plus de leads.",
    highlight: true,
  },
  {
    icon: Search,
    title: "Référencement SEO",
    description:
      "Gagnez en visibilité sur Google de façon durable grâce à une stratégie de contenu et une optimisation technique.",
  },
  {
    icon: Megaphone,
    title: "Publicité en ligne",
    description:
      "Des campagnes Google Ads et Social Ads rentables, pilotées au résultat pour maximiser votre retour sur investissement.",
  },
  {
    icon: Share2,
    title: "Réseaux sociaux",
    description:
      "On anime et fédère votre communauté avec une ligne éditoriale cohérente et des contenus qui engagent.",
  },
  {
    icon: ShieldCheck,
    title: "Maintenance & sécurité",
    description:
      "Un site sécurisé, performant et toujours à jour, pour une expérience optimale et une tranquillité totale.",
  },
];

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Nos services"
          title={
            <>
              Tout votre digital,{" "}
              <span className="text-gradient">au même endroit</span>
            </>
          }
          intro="Six expertises complémentaires, comme les tentacules d’un poulpe, pour couvrir l’intégralité de votre présence en ligne."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 70}>
              <article
                className={`group h-full rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                  service.highlight
                    ? "border-poulpe-200 bg-gradient-to-b from-poulpe-50 to-white shadow-lg shadow-poulpe-500/10"
                    : "border-slate-200 bg-white hover:border-poulpe-200 hover:shadow-lg hover:shadow-poulpe-500/10"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-poulpe-500 text-white shadow-md shadow-poulpe-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 flex items-center gap-2 text-xl font-bold text-ink">
                  {service.title}
                  {service.highlight && (
                    <span className="rounded-full bg-poulpe-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Populaire
                    </span>
                  )}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
