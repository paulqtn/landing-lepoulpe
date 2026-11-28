import { notFound } from "next/navigation";
import { NewsletterEditor } from "@/components/admin/NewsletterEditor";
import { canManageUsers, currentUser } from "@/lib/admin/auth";
import { mailConfigured } from "@/lib/admin/mail";
import { NEWSLETTER_VARIABLES, audienceParStatut, listCampagnes } from "@/lib/admin/newsletter";
import { STATUT_LABELS, STATUTS } from "@/lib/admin/statuts";
import { site } from "@/lib/site";
import { EnTete } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/* Newsletter — réservée au super-administrateur. */
export default async function NewsletterPage() {
  const me = await currentUser();
  if (!me || !canManageUsers(me)) notFound();
  const [audience, campagnes] = await Promise.all([audienceParStatut(), listCampagnes()]);
  return (
    <div className="space-y-6">
      <EnTete titre="Newsletter" sous="Un e-mail envoyé aux clients des états que vous cochez. Chaque adresse ne reçoit l'e-mail qu'une fois ; les clients désinscrits ou anonymisés sont toujours exclus." />
      <NewsletterEditor
        statuts={STATUTS.map((s) => ({ key: s, label: STATUT_LABELS[s], n: audience.parStatut[s] ?? 0 }))}
        exclus={audience.exclus}
        variables={NEWSLETTER_VARIABLES}
        mailConfigured={mailConfigured}
        testTo={me.email}
        siteUrl={site.url}
        campagnes={campagnes.map((c) => ({ ...c, created_at: new Date(c.created_at).toISOString(), statuts: (c.statuts ?? []).map((s) => STATUT_LABELS[s as keyof typeof STATUT_LABELS] ?? s) }))}
      />
    </div>
  );
}
