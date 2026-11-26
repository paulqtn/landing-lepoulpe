"use client";

import { useState } from "react";
import { DatabaseZap, KeyRound, Loader2, ShieldCheck } from "lucide-react";

type Mode = "login" | "setup" | "setup-token-missing" | "nodb" | "dberror";

const inputCls =
  "mt-3 w-full rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

export function AdminLogin({ mode = "login", detail }: { mode?: Mode; detail?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (mode === "nodb" || mode === "dberror" || mode === "setup-token-missing") {
    return (
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 shadow-card">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-pine-950">
          <DatabaseZap className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-inkgreen">
          {mode === "setup-token-missing" ? "Initialisation à terminer" : "Back office indisponible"}
        </h1>
        {mode === "nodb" && (
          <p className="mt-2 text-sm text-neutral-600">
            Aucune base de données n&rsquo;est connectée à ce déploiement. Le back office ne s&rsquo;ouvre qu&rsquo;avec la base
            (variable <code className="font-mono text-xs">POSTGRES_URL</code> fournie par l&rsquo;intégration Neon dans Vercel).
          </p>
        )}
        {mode === "dberror" && (
          <p className="mt-2 text-sm text-neutral-600">
            La base de données ne répond pas pour l&rsquo;instant. Réessayez dans un instant.
            {detail && <span className="mt-2 block font-mono text-xs text-red-600">{detail}</span>}
          </p>
        )}
        {mode === "setup-token-missing" && (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-neutral-600">
            <li>Dans Vercel → Settings → Environment Variables, créez <code className="font-mono text-xs">ADMIN_SETUP_TOKEN</code> avec une valeur secrète de votre choix (12 caractères minimum).</li>
            <li>Redéployez le projet.</li>
            <li>Revenez sur cette page pour créer le compte super-administrateur.</li>
          </ol>
        )}
      </div>
    );
  }

  const setup = mode === "setup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (setup && password !== confirm) return setErr("Les deux mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const res = await fetch(setup ? "/api/admin/setup" : "/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup ? { token, email, name, password } : { email, password }),
      });
      if (res.ok) return window.location.reload();
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Connexion impossible.");
    } catch {
      setErr("Erreur réseau.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-pine-700 text-white">
        {setup ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-inkgreen">{setup ? "Créer le super-administrateur" : "Espace commercial"}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {setup
          ? "Premier accès : ce compte pourra ensuite créer tous les autres. Cette étape ne s'affiche qu'une fois."
          : "Identifiez-vous pour retrouver vos clients et vos stats."}
      </p>

      {setup && (
        <>
          <input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Jeton d'initialisation (Vercel)" className={inputCls} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom affiché" autoComplete="name" className={inputCls} />
        </>
      )}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" autoComplete="username" autoFocus={!setup} className={inputCls} />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={setup ? "Mot de passe (10 caractères minimum)" : "Mot de passe"}
        autoComplete={setup ? "new-password" : "current-password"}
        className={inputCls}
      />
      {setup && (
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmer le mot de passe" autoComplete="new-password" className={inputCls} />
      )}
      {err && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={loading || !email || !password || (setup && (!token || !name))}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : setup ? "Créer le compte" : "Entrer"}
      </button>
    </form>
  );
}
