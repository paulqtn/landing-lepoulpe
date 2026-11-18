import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/* Reflète l'état réel du site : pas de cookies publicitaires ni de
   traceurs tiers ; stockage local du parcours de devis et cookie
   d'authentification de l'espace équipe uniquement. À tenir à jour si
   un outil de mesure d'audience est ajouté. */

export const metadata: Metadata = {
  title: "Gestion des cookies",
  description: `L'usage des cookies et du stockage local sur ${site.name}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/gestion-des-cookies" },
};

const H2 = "mt-10 text-xl font-extrabold tracking-tight text-inkgreen";
const P = "mt-3 leading-relaxed text-neutral-600";

export default function GestionCookies() {
  return (
    <main className="bg-white">
      <Container className="max-w-3xl py-14 sm:py-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Informations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
          Gestion des cookies
        </h1>

        <h2 className={H2}>Pas de cookies publicitaires</h2>
        <p className={P}>
          Ce site n&rsquo;utilise ni cookies publicitaires, ni traceurs de réseaux sociaux, ni outil de
          mesure d&rsquo;audience tiers. Aucune bannière de consentement n&rsquo;est donc nécessaire.
        </p>

        <h2 className={H2}>Ce que votre navigateur conserve</h2>
        <p className={P}>
          Pour vous éviter de tout ressaisir, l&rsquo;avancement de votre estimation est enregistré dans le
          stockage local de votre navigateur, sur votre appareil uniquement. Vous pouvez l&rsquo;effacer à
          tout moment en vidant les données de navigation de ce site.
        </p>

        <h2 className={H2}>Espace équipe</h2>
        <p className={P}>
          Un cookie technique d&rsquo;authentification est utilisé uniquement par notre équipe pour accéder
          à son espace de gestion. Il ne concerne pas la navigation des visiteurs.
        </p>

        <h2 className={H2}>Questions</h2>
        <p className={P}>Pour toute question : {site.email}.</p>
      </Container>
    </main>
  );
}
