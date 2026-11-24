"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";

export function AccountForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== confirm) return setMsg({ ok: false, text: "Les deux mots de passe ne correspondent pas." });
        setBusy(true);
        setMsg(null);
        const res = await fetch("/api/admin/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current, password }),
        }).catch(() => null);
        const data = res ? await res.json().catch(() => ({})) : {};
        setBusy(false);
        if (res?.ok) {
          setMsg({ ok: true, text: "Mot de passe modifié." });
          setCurrent(""); setPassword(""); setConfirm("");
        } else setMsg({ ok: false, text: data.error ?? "Modification impossible." });
      }}
    >
      <input className={inputCls} type="password" autoComplete="current-password" placeholder="Mot de passe actuel" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <input className={inputCls} type="password" autoComplete="new-password" placeholder="Nouveau mot de passe (10 caractères minimum)" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input className={inputCls} type="password" autoComplete="new-password" placeholder="Confirmer le nouveau mot de passe" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      {msg && <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy || !current || password.length < 10} className="flex items-center gap-2 rounded-full bg-pine-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Changer mon mot de passe
      </button>
    </form>
  );
}
