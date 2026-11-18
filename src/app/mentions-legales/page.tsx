import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

/* Squelette à compléter avec les informations légales réelles de la
   société (raison sociale, SIRET…) avant toute mise en avant. La page
   reste en noindex tant que le contenu n'est pas définitif. */

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site ${site.name}.`,
  robots: { index: false, follow: true },
  alternates: { canonical: "/mentions-legales" },
};

const H2 = "mt-10 text-xl font-extrabold tracking-tight text-inkgreen";
const P = "mt-3 leading-relaxed text-neutral-600";

export default function MentionsLegales() {
  return (
    <main className="bg-white">
      <Container className="max-w-3xl py-14 sm:py-20">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">Informations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-inkgreen sm:text-4xl">Mentions légales</h1>

        <h2 className={H2}>Éditeur du site</h2>
        <p className={P}>
          Le site {site.name} est édité par [raison sociale], [forme juridique] au capital de [capital] €,
          immatriculée au RCS de [ville] sous le numéro [SIREN], dont le siège social est situé [adresse].
          N° de TVA intracommunautaire : [numéro]. Directeur de la publication : [nom].
        </p>

        <h2 className={H2}>Contact</h2>
        <p className={P}>
          Téléphone : {site.phone} — e-mail : {site.email}.
        </p>

        <h2 className={H2}>Hébergement</h2>
        <p className={P}>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —
          vercel.com.
        </p>

        <h2 className={H2}>Propriété intellectuelle</h2>
        <p className={P}>
          L&rsquo;ensemble des contenus du site (textes, visuels, logos, structure) est protégé par le droit
          de la propriété intellectuelle. Toute reproduction, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>
      </Container>
    </main>
  );
}
