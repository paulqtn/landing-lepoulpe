import { Messagerie } from "@/components/admin/messagerie/Messagerie";
import type { Etat } from "@/components/admin/messagerie/commun";
import { canManageSettings, requireMenu, voitTout } from "@/lib/admin/auth";
import { cleConfiguree } from "@/lib/messagerie/chiffrement";
import { compteDe, comptePublic, globaux } from "@/lib/messagerie/comptes";
import { AUTRE, FOURNISSEURS } from "@/lib/messagerie/fournisseurs";
import { iaConfiguree } from "@/lib/messagerie/ia";
import { oauthConfigure } from "@/lib/messagerie/oauth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messagerie intelligente" };

/* Messagerie intelligente : la boîte mail du commercial connecté, triée par l'IA, avec les
   réponses préparées. Chacun ne voit que sa propre boîte. */
export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ m?: string; a?: string; oauth?: string; connecte?: string }> }) {
  const me = await requireMenu("messagerie");
  const [p, g, compte] = await Promise.all([searchParams, globaux(), compteDe(me.id)]);
  if (!g.actif && !voitTout(me))
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-inkgreen">Messagerie intelligente</h1>
        <p className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">La messagerie est désactivée pour le moment. Votre administrateur peut la rouvrir depuis ses paramètres.</p>
      </div>
    );
  const initial: Etat = {
    pret: { chiffrement: cleConfiguree(), ia: iaConfiguree && g.ia, iaCle: iaConfiguree, iaAutorisee: g.ia },
    compte: compte ? comptePublic(compte) : null,
    fournisseurs: [...FOURNISSEURS, AUTRE].map((f) => ({ cle: f.cle, nom: f.nom, imap: f.imap, smtp: f.smtp, oauth: f.oauth ?? null, oauthObligatoire: Boolean(f.oauthObligatoire), oauthPret: f.oauth ? oauthConfigure(f.oauth) : false, aide: f.aide })),
  };
  const message = p.connecte === "1" ? { ok: true, texte: "Boîte mail connectée. La première synchronisation démarre." } : p.oauth ? { ok: false, texte: p.oauth.slice(0, 300) } : undefined;
  return <Messagerie initial={initial} admin={canManageSettings(me)} ouvrir={Number(p.m) || undefined} ecrireA={p.a && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(p.a) ? p.a.slice(0, 200) : undefined} message={message} />;
}
