"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

export function AdminLogin() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setErr("Code invalide.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-7 shadow-card">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-pine-700 text-white">
        <KeyRound className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-xl font-extrabold text-inkgreen">Back office MGK</h1>
      <p className="mt-1 text-sm text-neutral-500">Entrez le code d&rsquo;accès équipe.</p>
      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code d'accès"
        autoFocus
        className="mt-4 w-full rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10"
      />
      {err && <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={loading || !code}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-pine-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrer"}
      </button>
    </form>
  );
}
