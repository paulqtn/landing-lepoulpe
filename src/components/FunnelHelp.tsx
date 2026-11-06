"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, Loader2, Phone, X } from "lucide-react";
import { phoneHref, site } from "@/lib/site";

/* ================================================================== */
/*  Assistant d'aide du tunnel — chat scripté : réponses instantanées  */
/*  contextualisées à l'étape, appel direct et rappel immédiat.        */
/*  Zéro IA, zéro latence, zéro risque : chaque réponse est maîtrisée. */
/* ================================================================== */

type QA = { q: string; a: string };

const HELP: Record<string, QA[]> = {
  lieu: [
    {
      q: "Quel usage choisir ?",
      a: "Choisissez l’endroit où le garde-corps sera posé : c’est lui qui détermine la norme applicable et les fixations possibles. En cas de doute, prenez le plus proche — un conseiller validera avec vous.",
    },
    {
      q: "Mon projet n’est pas dans la liste",
      a: "Choisissez « Extérieur » ou « Intérieur » selon le cas : le tarif reste juste, et vous préciserez votre projet avec le conseiller qui vous accompagne.",
    },
  ],
  systeme: [
    {
      q: "Rail, pince ou spider : comment choisir ?",
      a: "Le rail (profilé aluminium au sol) est le plus épuré et le plus simple à poser. Les pinces sont le classique discret, souvent le plus économique. Le spider (points inox traversants) signe les façades architecturales. Au moindre doute : « À me conseiller ».",
    },
    {
      q: "La pose est-elle difficile ?",
      a: "Le rail est le plus accessible en autoconstruction : kits pré-percés, notice claire, et nos conseillers vous guident par téléphone si besoin.",
    },
  ],
  longueurs: [
    {
      q: "Comment mesurer ma longueur ?",
      a: "Mesurez au nez de dalle, d’un bout à l’autre de la zone à protéger. Un côté = une longueur droite ; les angles entre côtés sont pris en charge automatiquement.",
    },
    {
      q: "Je ne connais pas la cote exacte",
      a: "Indiquez une valeur approchante : votre conseiller vérifie chaque dimension avec vous avant fabrication, le tarif s’ajuste au millimètre.",
    },
  ],
  hauteur: [
    {
      q: "Quelle hauteur est obligatoire ?",
      a: "1,00 m du sol fini au sommet du verre est la hauteur de référence de la norme NF P01-012. 0,90 m est possible selon configuration, 1,10 m sur certaines zones spécifiques.",
    },
  ],
  teinte: [
    {
      q: "Quelle teinte choisir ?",
      a: "Le clair est le standard — et le meilleur prix. L’extra-clair supprime le léger reflet verdâtre pour un rendu haut de gamme. Le fumé apporte intimité et caractère.",
    },
  ],
  installation: [
    {
      q: "La pose est-elle incluse dans le tarif ?",
      a: "Le tarif affiché couvre la fourniture sur mesure, découpe incluse. Si vous choisissez « installateur », nous vous mettons en relation avec un professionnel qualifié — son devis de pose est établi séparément.",
    },
  ],
  coordonnees: [
    {
      q: "Que faites-vous de mes coordonnées ?",
      a: "Uniquement vous envoyer votre devis et vous accompagner sur ce projet. Pas de spam, jamais — et vos données ne sont jamais revendues.",
    },
  ],
};

type Msg = { role: "bot" | "user"; text: string };

export function FunnelHelp({ stepId, context }: { stepId: string; context: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [cb, setCb] = useState({ name: "", phone: "" });
  const [cbState, setCbState] = useState<"idle" | "sending" | "sent">("idle");

  const qas = HELP[stepId] ?? [];

  // Chaque nouveau message fait défiler le fil : la réponse se révèle seule.
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function ask(qa: QA) {
    setMessages((m) => [...m, { role: "user", text: qa.q }, { role: "bot", text: qa.a }]);
  }

  async function requestCallback() {
    if (cb.name.trim().length < 2 || cb.phone.replace(/\D/g, "").length < 8 || cbState !== "idle") return;
    setCbState("sending");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cb.name,
          email: "",
          phone: cb.phone,
          source: "rappel-generateur",
          answers: { etape: stepId, ...context },
        }),
      });
    } catch {
      /* le bandeau de confirmation s'affiche quand même : le conseiller a le téléphone */
    }
    setCbState("sent");
    setMessages((m) => [
      ...m,
      { role: "bot", text: `C’est noté ${cb.name.split(" ")[0]} ! Un conseiller vous rappelle très vite au ${cb.phone}.` },
    ]);
  }

  return (
    <>
      {/* bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="absolute bottom-[5.5rem] right-4 z-30 inline-flex items-center gap-2 rounded-full bg-pine-900 py-2.5 pl-3 pr-4 text-sm font-bold text-white shadow-elevated ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-pine-800 sm:bottom-24 sm:right-6"
      >
        <span className="relative grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-pine-950">
          {open ? <X className="h-4 w-4" strokeWidth={3} /> : <HelpCircle className="h-[18px] w-[18px]" />}
          {!open && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-pine-900 bg-green-500" />}
        </span>
        {open ? "Fermer" : "Une question ?"}
      </button>

      {/* panneau d'aide */}
      {open && (
        <div className="absolute bottom-[8.75rem] right-4 z-30 flex max-h-[min(30rem,calc(100%-11rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-elevated sm:bottom-[9.5rem] sm:right-6">
          {/* en-tête */}
          <div className="flex items-center gap-3 bg-pine-900 px-4 py-3.5 text-white">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <HelpCircle className="h-5 w-5 text-amber-400" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">Assistant {site.name}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-pine-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Réponses immédiates
              </p>
            </div>
          </div>

          {/* fil de discussion */}
          <div ref={threadRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain bg-mist/60 p-3.5">
            <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-700 shadow-sm">
              Bonjour 👋 Posez-moi une question sur cette étape, ou demandez à être rappelé.
            </p>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-pine-700 px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed text-white shadow-sm">
                  {m.text}
                </p>
              ) : (
                <p key={i} className="max-w-[85%] animate-fade-up rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-700 shadow-sm">
                  {m.text}
                </p>
              ),
            )}
            {/* questions rapides de l'étape */}
            {qas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {qas.map((qa) => (
                  <button
                    key={qa.q}
                    type="button"
                    onClick={() => ask(qa)}
                    className="rounded-full border border-pine-200 bg-white px-3 py-1.5 text-xs font-bold text-pine-700 transition hover:border-amber-500 hover:bg-amber-500/10"
                  >
                    {qa.q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* actions : appel direct + être rappelé */}
          <div className="space-y-2.5 border-t border-neutral-200/80 bg-white p-3.5">
            <a
              href={phoneHref}
              className="flex items-center justify-center gap-2 rounded-full bg-pine-700 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600"
            >
              <Phone className="h-4 w-4" />
              Appeler maintenant — {site.phone}
            </a>
            {cbState !== "sent" ? (
              <div className="rounded-xl border border-neutral-200 bg-mist/50 p-2.5">
                <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                  ou être rappelé rapidement
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={cb.name}
                    onChange={(e) => setCb((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Prénom"
                    className="w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-inkgreen outline-none placeholder:text-neutral-400 focus:border-pine-500"
                  />
                  <input
                    value={cb.phone}
                    onChange={(e) => setCb((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                    type="tel"
                    className="w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-inkgreen outline-none placeholder:text-neutral-400 focus:border-pine-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={requestCallback}
                  disabled={cbState !== "idle" || cb.name.trim().length < 2 || cb.phone.replace(/\D/g, "").length < 8}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-2.5 text-sm font-bold text-pine-950 transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {cbState === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Être rappelé
                </button>
              </div>
            ) : (
              <p className="rounded-xl bg-pine-50 px-3.5 py-2.5 text-center text-[13px] font-semibold text-pine-700 ring-1 ring-pine-100">
                ✓ Demande envoyée — à très vite !
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
