import type { Metadata } from "next";
import { Unsubscribe } from "@/components/Unsubscribe";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: `Désinscription — ${site.name}`, robots: { index: false, follow: false } };

/* Page de désinscription : rien n'est modifié à l'ouverture, seulement au clic
   (les antivirus de messagerie ouvrent les liens automatiquement). */
export default async function DesabonnementPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="grid min-h-[60vh] place-items-center bg-mist px-5 py-16">
      <Unsubscribe token={token} />
    </main>
  );
}
