"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type RingoverSDK from "ringover-sdk";
import { ChevronDown, Mic, MicOff, Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Power, X } from "lucide-react";
import { dureeLisible, memeNumero, numeroLisible, versE164 } from "@/lib/telephonie/numero";

/* ================================================================== */
/*  Téléphone intégré au back office (Ringover).                       */
/*  Le SDK Ringover affiche l'application web Ringover dans une        */
/*  fenêtre intégrée : la connexion au compte, le micro et les appels  */
/*  se passent dans cette fenêtre, chez Ringover. Le back office ne    */
/*  voit jamais l'identifiant ni le mot de passe ; il reçoit seulement */
/*  des messages (connexion, sonnerie, décroché, raccroché) et peut    */
/*  demander de composer un numéro.                                    */
/*  Le téléphone ne se charge que si la personne l'active sur ce       */
/*  navigateur : sans cela, rien ne change et rien n'est chargé.       */
/* ================================================================== */

const ORIGINE = "https://app.ringover.com";
const CLE = "mgk-telephone";
const CONTENEUR = "mgk-ringover";

type Etat = "inactif" | "chargement" | "deconnecte" | "pret";
type Micro = "inconnu" | "autorise" | "a_autoriser" | "bloque" | "indisponible";
type Contexte = { leadId?: number | null; nom?: string | null };
type Appel = { callId: string; direction: "in" | "out"; numero: string; etape: "sonne" | "en_ligne"; leadId: number | null; nom: string | null };
type Info = { texte: string; lien?: { href: string; label: string }; erreur?: boolean };
type DonneesAppel = { direction?: string; from_number?: string; to_number?: string; call_id?: string | number; ringDuration?: number; callDuration?: number; internal?: boolean };

type Api = { actif: boolean; etat: Etat; appeler: (numero: string, ctx?: Contexte) => void };
const Ctx = createContext<Api | null>(null);
export const useTelephone = () => useContext(Ctx);

const ETAT_TEXTE: Record<Etat, string> = { inactif: "Désactivé", chargement: "Chargement…", deconnecte: "Connectez-vous à Ringover ci-dessous", pret: "Prêt" };
const MICRO_TEXTE: Record<Micro, string> = { inconnu: "Micro : à vérifier", autorise: "Micro autorisé", a_autoriser: "Micro à autoriser", bloque: "Micro bloqué", indisponible: "Micro indisponible" };

export function TelephoneProvider({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  const router = useRouter();
  const sdk = useRef<RingoverSDK | null>(null);
  const attente = useRef<(Contexte & { numero: string; at: number }) | null>(null);
  const termines = useRef(new Set<string>());
  const appelRef = useRef<Appel | null>(null);
  const [actif, setActif] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [invite, setInvite] = useState(false);
  const [etat, setEtat] = useState<Etat>("inactif");
  const [appel, setAppelState] = useState<Appel | null>(null);
  const [micro, setMicro] = useState<Micro>("inconnu");
  const [info, setInfo] = useState<Info | null>(null);
  // Emplacement du bouton dans la barre du haut (utilisé sur téléphone, où un bouton flottant cache le contenu).
  const [barre, setBarre] = useState<HTMLElement | null>(null);
  useEffect(() => setBarre(document.getElementById("mgk-tel-barre")), []);
  const setAppel = (a: Appel | null) => { appelRef.current = a; setAppelState(a); };

  /* Préférence de ce navigateur. */
  useEffect(() => {
    try {
      if (visible && localStorage.getItem(CLE) === "oui") setActif(true);
    } catch {}
  }, [visible]);

  /* État de l'autorisation du micro (demandée par le navigateur pour ce site, puis prêtée à la fenêtre Ringover). */
  useEffect(() => {
    if (!actif) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return setMicro("indisponible");
    let statut: PermissionStatus | null = null;
    const lire = () => statut && setMicro(statut.state === "granted" ? "autorise" : statut.state === "denied" ? "bloque" : "a_autoriser");
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((s) => { statut = s; lire(); s.onchange = lire; })
      .catch(() => setMicro("inconnu"));
    return () => { if (statut) statut.onchange = null; };
  }, [actif]);

  const testerMicro = useCallback(async () => {
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true });
      flux.getTracks().forEach((t) => t.stop());
      setMicro("autorise");
      setInfo({ texte: "Micro autorisé : vous pouvez appeler." });
    } catch (e) {
      const nom = e instanceof DOMException ? e.name : "";
      setMicro(nom === "NotAllowedError" ? "bloque" : "indisponible");
      setInfo({ erreur: true, texte: nom === "NotAllowedError" ? "Micro refusé. Cliquez sur le cadenas à gauche de l'adresse du site, autorisez le micro, puis rechargez la page." : "Aucun micro détecté sur cet appareil." });
    }
  }, []);

  /* Chargement du SDK et création de la fenêtre Ringover. */
  useEffect(() => {
    if (!actif) return;
    let annule = false;
    setEtat("chargement");
    import("ringover-sdk")
      .then((m) => {
        if (annule || sdk.current) return;
        const Sdk = (m.default ?? m) as unknown as typeof RingoverSDK;
        const instance = new Sdk({ type: "relative", size: "auto", container: CONTENEUR, border: false, animation: false, trayicon: false });
        const cadre = instance.generate();
        sdk.current = instance;
        if (cadre) {
          cadre.title = "Téléphone Ringover";
          cadre.addEventListener("load", () => setEtat((e) => (e === "chargement" ? "deconnecte" : e)), { once: true });
        }
      })
      .catch(() => setInfo({ erreur: true, texte: "Le téléphone n'a pas pu se charger. Vérifiez votre connexion, puis rechargez la page." }));
    return () => {
      annule = true;
      try { sdk.current?.destroy(); } catch {}
      sdk.current = null;
    };
  }, [actif]);

  /* Messages envoyés par la fenêtre Ringover. On n'écoute que ceux qui viennent de Ringover. */
  useEffect(() => {
    if (!actif) return;
    async function nomDuNumero(numero: string): Promise<{ leadId: number | null; nom: string | null }> {
      try {
        const res = await fetch(`/api/admin/telephonie/contact?numero=${encodeURIComponent(numero)}`, { cache: "no-store" });
        const d = (await res.json()) as { fiches?: { id: number; name: string }[] };
        return d.fiches?.[0] ? { leadId: d.fiches[0].id, nom: d.fiches[0].name } : { leadId: null, nom: null };
      } catch {
        return { leadId: null, nom: null };
      }
    }
    function recevoir(e: MessageEvent) {
      if (e.origin !== ORIGINE || !e.data || typeof e.data.action !== "string") return;
      const d = (e.data.data ?? {}) as DonneesAppel;
      switch (e.data.action as string) {
        case "login":
          setEtat((x) => (x === "pret" ? x : "deconnecte"));
          break;
        case "dialerReady":
          setEtat("pret");
          setInfo(null);
          break;
        case "logout":
          setEtat("deconnecte");
          setAppel(null);
          break;
        case "ringingCall": {
          const direction = d.direction === "in" ? "in" : "out";
          const numero = String((direction === "out" ? d.to_number : d.from_number) ?? "");
          const callId = String(d.call_id ?? "");
          const a = attente.current;
          const connu = direction === "out" && a && Date.now() - a.at < 120_000 && memeNumero(a.numero, numero) ? a : null;
          setAppel({ callId, direction, numero, etape: "sonne", leadId: connu?.leadId ?? null, nom: connu?.nom ?? null });
          setOuvert(true);
          setInfo(null);
          if (!connu && !d.internal)
            void nomDuNumero(numero).then((c) => { if (appelRef.current?.callId === callId && c.leadId) setAppel({ ...appelRef.current, ...c }); });
          break;
        }
        case "answeredCall":
          if (appelRef.current) setAppel({ ...appelRef.current, etape: "en_ligne" });
          break;
        case "hangupCall": {
          const callId = String(d.call_id ?? "");
          const cur = appelRef.current;
          setAppel(null);
          attente.current = null;
          if (!callId || termines.current.has(callId) || d.internal) break;
          termines.current.add(callId);
          const direction = d.direction === "in" ? "in" : "out";
          const duree = Number(d.callDuration) || 0;
          void fetch("/api/admin/telephonie/appels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callId, direction, fromNumber: d.from_number, toNumber: d.to_number, ringDuration: d.ringDuration, callDuration: duree, answered: duree > 0, leadId: cur?.callId === callId ? cur.leadId : null }),
          })
            .then((r) => r.json())
            .then((r: { leadId?: number | null }) => {
              const issue = duree > 0 ? `Appel terminé — ${dureeLisible(duree)}` : direction === "out" ? "Appel sans réponse" : "Appel manqué";
              setInfo(r.leadId ? { texte: `${issue}. Inscrit dans l'historique du client.`, lien: { href: `/commercial/clients/${r.leadId}`, label: "Ouvrir la fiche pour le compte rendu" } } : { texte: `${issue}. Numéro inconnu du back office.` });
              router.refresh();
            })
            .catch(() => setInfo({ erreur: true, texte: "Appel terminé, mais il n'a pas pu être inscrit dans l'historique." }));
          break;
        }
      }
    }
    window.addEventListener("message", recevoir);
    return () => window.removeEventListener("message", recevoir);
  }, [actif, router]);

  const activer = useCallback(() => {
    try { localStorage.setItem(CLE, "oui"); } catch {}
    setActif(true);
    setInvite(false);
    setOuvert(true);
  }, []);
  const desactiver = useCallback(() => {
    try { localStorage.setItem(CLE, "non"); } catch {}
    setActif(false);
    setOuvert(false);
    setEtat("inactif");
    setAppel(null);
    setInfo(null);
  }, []);

  const appeler = useCallback((numero: string, ctx: Contexte = {}) => {
    const e164 = versE164(numero);
    setOuvert(true);
    if (!e164) return setInfo({ erreur: true, texte: `Ce numéro n'est pas reconnu : « ${numero} ». Corrigez-le dans les coordonnées du client.` });
    if (!sdk.current || etat !== "pret") return setInfo({ texte: `Connectez-vous à Ringover dans la fenêtre ci-dessous, puis cliquez de nouveau sur « Appeler » (${numeroLisible(e164)}).` });
    attente.current = { ...ctx, numero: e164, at: Date.now() };
    setInfo(null);
    sdk.current.dial(e164);
  }, [etat]);

  const enAppel = appel !== null;
  const pastille = enAppel ? "bg-amber-500" : etat === "pret" ? "bg-green-500" : etat === "inactif" ? "bg-neutral-300" : "bg-amber-400";

  return (
    <Ctx.Provider value={{ actif, etat, appeler }}>
      {children}
      {visible && (
        <>
          {/* bouton flottant */}
          <button
            type="button"
            aria-label={actif ? (ouvert ? "Réduire le téléphone" : "Ouvrir le téléphone") : "Téléphone Ringover"}
            aria-expanded={actif ? ouvert : invite}
            onClick={() => (actif ? setOuvert(!ouvert) : setInvite(!invite))}
            className={`fixed bottom-5 right-4 z-40 hidden h-12 w-12 place-items-center rounded-full text-white shadow-card transition hover:scale-105 lg:grid ${enAppel ? "animate-pulse bg-amber-500 text-pine-950" : "bg-pine-700 hover:bg-pine-600"}`}
          >
            {enAppel ? <PhoneCall className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
            <span className={`absolute right-0 top-0 h-3 w-3 rounded-full ring-2 ring-white ${pastille}`} />
          </button>

          {barre &&
            createPortal(
              <button
                type="button"
                aria-label={actif ? (ouvert ? "Réduire le téléphone" : "Ouvrir le téléphone") : "Téléphone Ringover"}
                onClick={() => (actif ? setOuvert(!ouvert) : setInvite(!invite))}
                className={`relative grid h-8 w-8 place-items-center rounded-full border lg:hidden ${enAppel ? "animate-pulse border-amber-500 bg-amber-500 text-pine-950" : "border-pine-200 bg-pine-50 text-pine-800"}`}
              >
                {enAppel ? <PhoneCall className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${pastille}`} />
              </button>,
              barre,
            )}

          {/* invitation à activer (rien n'est chargé avant) */}
          {!actif && invite && (
            <div role="dialog" aria-label="Activer le téléphone" className="fixed right-4 top-14 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 shadow-card lg:bottom-20 lg:top-auto">
              <p className="text-sm font-extrabold text-inkgreen">Téléphone Ringover</p>
              <p className="mt-1 text-xs text-neutral-600">Appelez vos clients depuis le back office avec votre compte Ringover. Les appels sont inscrits dans l&rsquo;historique des fiches. L&rsquo;activation vaut pour ce navigateur seulement.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={activer} className="rounded-full bg-pine-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-pine-600">Activer le téléphone</button>
                <button type="button" onClick={() => setInvite(false)} className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600">Plus tard</button>
              </div>
            </div>
          )}

          {/* fenêtre du téléphone : reste chargée même réduite, pour continuer à recevoir les appels */}
          {actif && (
            <section
              aria-label="Téléphone"
              aria-hidden={!ouvert}
              className={`fixed right-2 top-14 z-40 flex h-[min(42rem,calc(100dvh-4.5rem))] w-[min(23.75rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition lg:bottom-20 lg:right-4 lg:top-auto lg:h-[min(42rem,calc(100dvh-7rem))] ${ouvert ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}
            >
              <header className="flex items-center gap-2 border-b border-neutral-200 bg-mist px-3 py-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pastille}`} />
                <p className="min-w-0 flex-1 truncate text-xs font-bold text-inkgreen">
                  Téléphone <span className="font-semibold text-neutral-500">· {enAppel ? (appel.etape === "en_ligne" ? "En ligne" : appel.direction === "in" ? "Appel entrant" : "Appel en cours") : ETAT_TEXTE[etat]}</span>
                </p>
                <button type="button" onClick={testerMicro} title="Vérifier le micro" className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${micro === "autorise" ? "bg-green-50 text-green-700" : micro === "bloque" || micro === "indisponible" ? "bg-red-50 text-red-700" : "bg-amber-500/15 text-amber-700"}`}>
                  {micro === "bloque" || micro === "indisponible" ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span className="hidden sm:inline">{MICRO_TEXTE[micro]}</span>
                </button>
                <button type="button" onClick={() => { if (!enAppel && window.confirm("Désactiver le téléphone sur ce navigateur ? Vous pourrez le réactiver avec le bouton téléphone.")) desactiver(); }} disabled={enAppel} title="Désactiver le téléphone sur ce navigateur" aria-label="Désactiver le téléphone" className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-600 disabled:opacity-30"><Power className="h-4 w-4" /></button>
                <button type="button" onClick={() => setOuvert(false)} title="Réduire" aria-label="Réduire le téléphone" className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-200"><ChevronDown className="h-4 w-4" /></button>
              </header>

              {enAppel && (
                <div className="flex items-center gap-2 border-b border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
                  {appel.direction === "in" ? <PhoneIncoming className="h-4 w-4 shrink-0 text-amber-700" /> : <PhoneOutgoing className="h-4 w-4 shrink-0 text-amber-700" />}
                  <span className="min-w-0 flex-1 truncate font-bold text-inkgreen">{appel.nom ?? "Numéro inconnu du back office"} <span className="font-semibold text-neutral-500">· {numeroLisible(appel.numero)}</span></span>
                  {appel.leadId && <Link href={`/commercial/clients/${appel.leadId}`} className="shrink-0 rounded-full bg-white px-2.5 py-1 font-bold text-pine-700 ring-1 ring-neutral-200">Fiche</Link>}
                </div>
              )}
              {info && (
                <div role="status" className={`flex items-start gap-2 border-b px-3 py-2 text-xs ${info.erreur ? "border-red-200 bg-red-50 text-red-800" : "border-pine-200 bg-pine-50 text-pine-900"}`}>
                  <span className="min-w-0 flex-1">
                    {info.texte}
                    {info.lien && <Link href={info.lien.href} onClick={() => setInfo(null)} className="mt-1 block font-bold underline">{info.lien.label}</Link>}
                  </span>
                  <button type="button" aria-label="Fermer le message" onClick={() => setInfo(null)} className="rounded p-0.5 hover:bg-white/60"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}
              {micro === "indisponible" && <p className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">Le micro n&rsquo;est pas accessible : il faut une adresse en https et un micro branché.</p>}

              {/* Le SDK Ringover place sa fenêtre ici. */}
              <div id={CONTENEUR} className="min-h-0 flex-1 bg-white" />
            </section>
          )}
        </>
      )}
    </Ctx.Provider>
  );
}

/** Bouton « Appeler » : passe par le téléphone intégré s'il est activé, sinon lien téléphonique habituel. */
export function BoutonAppeler({ numero, leadId, nom, className, children }: { numero: string; leadId?: number; nom?: string; className?: string; children: React.ReactNode }) {
  const tel = useTelephone();
  if (!tel?.actif)
    return (
      <a href={`tel:${numero.replace(/\s/g, "")}`} className={className}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={() => tel.appeler(numero, { leadId, nom })} className={className}>
      {children}
    </button>
  );
}
