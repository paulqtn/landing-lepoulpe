import { ArrowRight, Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { OctopusMark } from "@/components/Logo";
import { site } from "@/lib/site";

export function CTA() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
            {/* glow + pattern */}
            <div className="pointer-events-none absolute left-1/2 top-[-30%] h-80 w-80 -translate-x-1/2 rounded-full bg-poulpe-500/30 blur-3xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.06) 1px, transparent 0)",
                backgroundSize: "26px 26px",
              }}
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-poulpe-500 to-poulpe-600 text-white shadow-xl shadow-poulpe-500/30">
                <OctopusMark className="h-10 w-10" />
              </span>

              <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
                Prêt à déployer votre présence digitale ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-slate-300">
                Parlons de votre projet. Premier échange gratuit et sans
                engagement pour cadrer vos priorités et vos objectifs.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink href={`mailto:${site.email}`} size="lg">
                  Démarrer mon projet
                  <ArrowRight className="h-5 w-5" />
                </ButtonLink>
                <ButtonLink
                  href={`mailto:${site.email}`}
                  variant="secondary"
                  size="lg"
                  className="!bg-white/5 !text-white !ring-white/15 hover:!bg-white/10 hover:!text-white"
                >
                  <Mail className="h-5 w-5" />
                  {site.email}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
