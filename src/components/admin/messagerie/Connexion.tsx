"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Lock, PlugZap, TriangleAlert } from "lucide-react";
import { appel, bouton, boutonPrincipal, champ, etiquette, type CompteVue, type Etat, type FournisseurVue } from "./commun";

/* Connexion (ou modification) de la boîte mail du commercial : configuration automatique par
   fournisseur, test, puis enregistrement. Le mot de passe part une seule fois vers le serveur,
   qui le chiffre ; il n'est jamais relu par l'écran. */

export function Connexion({ etat, compte, onConnecte, onAnnule }: { etat: Etat; compte?: CompteVue | null; onConnecte: (c: CompteVue, avertissement: string | null) => void; onAnnule?: () => void }) {
  const autre = etat.fournisseurs.find((f) => f.cle === "autre") as FournisseurVue;
  const depart = etat.fournisseurs.find((f) => f.cle === compte?.fournisseur) ?? autre;
  const [f, setF] = useState<FournisseurVue>(depart);
  const [v, setV] = useState({
    email: compte?.email ?? "", nom: compte?.nom ?? "", user: compte?.imap.user ?? "", pass: "",
    imapHost: compte?.imap.host ?? depart.imap.host, imapPort: String(compte?.imap.port ?? depart.imap.port), imapSecure: compte?.imap.secure ?? depart.imap.secure,
    smtpHost: compte?.smtp.host ?? depart.smtp.host, smtpPort: String(compte?.smtp.port ?? depart.smtp.port), smtpSecure: compte?.smtp.secure ?? depart.smtp.secure,
  });
  const [occupe, setOccupe] = useState<"detecter" | "tester" | "connecter" | null>(null);
  const [retour, setRetour] = useState<{ ok: boolean; texte: string } | null>(null);
  const set = (p: Partial<typeof v>) => { setV((x) => ({ ...x, ...p })); setRetour(null); };

  const choisir = (nf: FournisseurVue) => {
    setF(nf);
    if (nf.cle !== "autre") set({ imapHost: nf.imap.host, imapPort: String(nf.imap.port), imapSecure: nf.imap.secure, smtpHost: nf.smtp.host, smtpPort: String(nf.smtp.port), smtpSecure: nf.smtp.secure });
  };

  async function detecter() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) || compte) return;
    setOccupe("detecter");
    const r = await appel<{ fournisseur: FournisseurVue | null }>("/compte", { body: { action: "detecter", email: v.email } });
    setOccupe(null);
    if (r.ok && r.fournisseur) {
      choisir(r.fournisseur);
      setRetour({ ok: true, texte: `Fournisseur reconnu : ${r.fournisseur.nom}. Les serveurs sont remplis pour vous.` });
    }
  }

  async function envoyer(action: "tester" | "connecter") {
    setOccupe(action);
    setRetour(null);
    const r = await appel<{ compte?: CompteVue; avertissement: string | null; dossiers?: { drafts: string | null; sent: string | null } }>("/compte", {
      body: { action, email: v.email, nom: v.nom, user: v.user || v.email, pass: v.pass, fournisseur: f.cle, imap: { host: v.imapHost, port: Number(v.imapPort), secure: v.imapSecure }, smtp: { host: v.smtpHost, port: Number(v.smtpPort), secure: v.smtpSecure } },
    });
    setOccupe(null);
    if (!r.ok) return setRetour({ ok: false, texte: r.error });
    if (action === "connecter" && r.compte) return onConnecte(r.compte, r.avertissement);
    setRetour({ ok: !r.avertissement, texte: r.avertissement ?? `Connexion réussie. Dossier des brouillons : ${r.dossiers?.drafts ?? "créé automatiquement"} · Envoyés : ${r.dossiers?.sent ?? "non trouvé"}.` });
  }

  const oauth = f.oauth && f.oauthPret;
  const bloque = f.oauthObligatoire && !f.oauthPret;

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-inkgreen">
        <PlugZap className="h-5 w-5 text-pine-600" /> {compte ? "Paramètres de connexion" : "Connecter ma boîte mail"}
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Vos e-mails restent dans votre boîte : le back office les y lit, les trie et y dépose des brouillons de réponse. Aucun e-mail n&rsquo;est copié dans le back office, et rien n&rsquo;est envoyé sans votre validation.
      </p>

      {!etat.pret.chiffrement && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          La clé de chiffrement n&rsquo;est pas encore configurée sur le serveur (variable MESSAGERIE_SECRET). Tant qu&rsquo;elle manque, aucune boîte ne peut être connectée : prévenez votre administrateur.
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={etiquette}>Adresse e-mail</span>
          <input id="msg-email" type="email" autoComplete="email" className={champ} value={v.email} disabled={Boolean(compte)} onChange={(e) => set({ email: e.target.value })} onBlur={detecter} placeholder="prenom@societe.fr" />
        </label>
        <label className="block">
          <span className={etiquette}>Fournisseur</span>
          <select id="msg-fournisseur" className={champ} value={f.cle} onChange={(e) => choisir(etat.fournisseurs.find((x) => x.cle === e.target.value) ?? autre)}>
            {etat.fournisseurs.map((x) => <option key={x.cle} value={x.cle}>{x.nom}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={etiquette}>Nom affiché à vos destinataires</span>
          <input id="msg-nom" className={champ} value={v.nom} onChange={(e) => set({ nom: e.target.value })} placeholder="Prénom Nom" />
        </label>
      </div>

      <p className="mt-3 rounded-xl bg-mist px-3.5 py-2.5 text-xs leading-relaxed text-neutral-700">{f.aide}</p>

      {oauth && (
        <a href={`/api/admin/messagerie/oauth/${f.oauth}/start?email=${encodeURIComponent(v.email)}`} className={`${boutonPrincipal} mt-4 w-full`}>
          <Lock className="h-4 w-4" /> Se connecter avec {f.oauth === "google" ? "Google" : "Microsoft"}
        </a>
      )}
      {bloque && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-3 text-sm text-neutral-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          La connexion Microsoft n&rsquo;est pas encore activée sur le serveur. Votre administrateur doit déclarer l&rsquo;application chez Microsoft (voir ADMIN.md, « Messagerie intelligente »).
        </p>
      )}

      {!f.oauthObligatoire && (
        <>
          {oauth && <p className="mt-4 text-center text-xs font-semibold text-neutral-500">ou avec un mot de passe d&rsquo;application</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={etiquette}>Identifiant IMAP</span>
              <input id="msg-user" autoComplete="username" className={champ} value={v.user} onChange={(e) => set({ user: e.target.value })} placeholder={v.email || "l'adresse e-mail le plus souvent"} />
            </label>
            <label className="block">
              <span className={etiquette}>Mot de passe ou mot de passe d&rsquo;application</span>
              <input id="msg-pass" type="password" autoComplete="new-password" className={champ} value={v.pass} onChange={(e) => set({ pass: e.target.value })} placeholder={compte?.auth === "password" ? "Laisser vide pour garder l'actuel" : ""} />
            </label>
            <label className="block">
              <span className={etiquette}>Serveur IMAP (réception)</span>
              <input id="msg-imap-host" className={champ} value={v.imapHost} onChange={(e) => set({ imapHost: e.target.value })} placeholder="imap.exemple.fr" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={etiquette}>Port IMAP</span>
                <input id="msg-imap-port" inputMode="numeric" className={champ} value={v.imapPort} onChange={(e) => set({ imapPort: e.target.value.replace(/\D/g, "") })} />
              </label>
              <label className="block">
                <span className={etiquette}>Sécurité</span>
                <select id="msg-imap-secure" className={champ} value={v.imapSecure ? "ssl" : "starttls"} onChange={(e) => set({ imapSecure: e.target.value === "ssl", imapPort: e.target.value === "ssl" ? "993" : "143" })}>
                  <option value="ssl">SSL/TLS</option>
                  <option value="starttls">STARTTLS</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className={etiquette}>Serveur SMTP (envoi)</span>
              <input id="msg-smtp-host" className={champ} value={v.smtpHost} onChange={(e) => set({ smtpHost: e.target.value })} placeholder="smtp.exemple.fr" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={etiquette}>Port SMTP</span>
                <input id="msg-smtp-port" inputMode="numeric" className={champ} value={v.smtpPort} onChange={(e) => set({ smtpPort: e.target.value.replace(/\D/g, "") })} />
              </label>
              <label className="block">
                <span className={etiquette}>Sécurité</span>
                <select id="msg-smtp-secure" className={champ} value={v.smtpSecure ? "ssl" : "starttls"} onChange={(e) => set({ smtpSecure: e.target.value === "ssl", smtpPort: e.target.value === "ssl" ? "465" : "587" })}>
                  <option value="ssl">SSL/TLS</option>
                  <option value="starttls">STARTTLS</option>
                </select>
              </label>
            </div>
          </div>

          {retour && (
            <p role="status" className={`mt-4 flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${retour.ok ? "border border-green-200 bg-green-50 text-green-800" : "border border-amber-500/40 bg-amber-500/10 text-neutral-800"}`}>
              {retour.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
              {retour.texte}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button type="button" className={boutonPrincipal} disabled={occupe !== null || !etat.pret.chiffrement} onClick={() => envoyer("connecter")}>
              {occupe === "connecter" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              {compte ? "Enregistrer la connexion" : "Connecter la boîte"}
            </button>
            <button type="button" className={bouton} disabled={occupe !== null || !etat.pret.chiffrement} onClick={() => envoyer("tester")}>
              {occupe === "tester" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Tester la connexion
            </button>
            {onAnnule && <button type="button" className={bouton} onClick={onAnnule}>Annuler</button>}
            {occupe === "detecter" && <span className="text-xs text-neutral-500">Recherche du fournisseur…</span>}
          </div>
        </>
      )}
      <p className="mt-4 flex items-start gap-1.5 text-xs text-neutral-500">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Vos identifiants sont chiffrés sur le serveur et ne sont jamais affichés. Vous seul voyez votre boîte : ni vos collègues ni l&rsquo;administrateur n&rsquo;ont accès à vos e-mails.
      </p>
    </section>
  );
}
