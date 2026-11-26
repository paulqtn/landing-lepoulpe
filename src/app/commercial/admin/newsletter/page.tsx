import { notFound } from "next/navigation";
import { NewsletterEditor } from "@/components/admin/NewsletterEditor";
import { canManageUsers, currentUser } from "@/lib/admin/auth";
import { mailConfigured } from "@/lib/admin/mail";
import { NEWSLETTER_VARIABLES, audienceParStatut, listCampagnes } from "@/lib/admin/newsletter";
import { STATUT_LABELS, STATUTS } from "@/lib/admin/statuts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter" };

/* Newsletter — réservée au super-administrateur. */
export default async function NewsletterPage() {
  const me = await currentUser();
  if (!me || !canManageUsers(me)) notFound();
  const [audience, campagnes] = await Promise.all([audienceParStatut(), listCampagnes()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Newsletter</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">
          Un e-mail envoyé aux clients des états que vous cochez. Chaque adresse ne reçoit l&rsquo;e-mail qu&rsquo;une fois ; les clients désinscrits ou anonymisés sont toujours exclus.
        </p>
      </div>
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
