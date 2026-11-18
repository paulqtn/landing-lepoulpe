import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/* Trame reflétant le fonctionnement réel du site (demandes de devis),
   à faire valider et compléter (durées, responsable de traitement…)
   avant indexation. */

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${site.name} traite les données transmises via ses formulaires.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/politique-de-confidentialite" },
};

const H2 = "mt-10 text-xl font-extrabold tracking-tight text-inkgreen";
const P = "mt-3 leading-relaxed text-neutral-600";

export default function PolitiqueConfidentialite() {
  return (
    <main className="bg-white">
      <Container className="max-w-3xl py-14 sm:py-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Informations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">
          Politique de confidentialité
        </h1>

        <h2 className={H2}>Données collectées</h2>
        <p className={P}>
          Lorsque vous demandez une estimation ou un rappel, nous collectons les informations que vous
          saisissez : coordonnées (nom, e-mail, téléphone, adresse du chantier) et caractéristiques de votre
          projet. Elles servent uniquement à établir votre devis et à vous recontacter.
        </p>

        <h2 className={H2}>Base légale et durée</h2>
        <p className={P}>
          Ces traitements reposent sur les mesures précontractuelles à votre demande. Les données sont
          conservées [durée à préciser], puis supprimées. Responsable de traitement : [raison sociale].
        </p>

        <h2 className={H2}>Partage</h2>
        <p className={P}>
          Vos données ne sont ni vendues ni louées. Elles ne sont accessibles qu&rsquo;à notre équipe
          commerciale et à nos prestataires techniques (hébergement, envoi d&rsquo;e-mails), dans la seule
          mesure nécessaire au traitement de votre demande.
        </p>

        <h2 className={H2}>Vos droits</h2>
        <p className={P}>
          Vous disposez de droits d&rsquo;accès, de rectification, d&rsquo;effacement et d&rsquo;opposition.
          Pour les exercer : {site.email}. Vous pouvez également saisir la CNIL (cnil.fr).
        </p>
      </Container>
    </main>
  );
}
