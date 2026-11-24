"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

type Role = "superadmin" | "admin" | "commercial";
type Row = { id: number; email: string; name: string; role: Role; active: boolean; last_login_at: string | null };

const ROLE_LABELS: Record<Role, string> = { superadmin: "Super-administrateur", admin: "Administrateur", commercial: "Commercial" };
const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function UsersAdmin({ users, me }: { users: Row[]; me: number }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "commercial" as Role, password: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function call(key: string, url: string, method: string, body: unknown, okText: string) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "Action impossible." });
      else {
        setMsg({ ok: true, text: okText });
        router.refresh();
      }
      return res.ok;
    } catch {
      setMsg({ ok: false, text: "Erreur réseau." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p role="status" className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${msg.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-inkgreen">
          <UserPlus className="h-4 w-4 text-pine-600" />
          Créer un compte
        </h2>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await call("create", "/api/admin/users", "POST", form, `Compte créé pour ${form.name}. Transmettez-lui son mot de passe de vive voix : il le changera dans « Mon compte ».`))
              setForm({ name: "", email: "", role: "commercial", password: "" });
          }}
        >
          <input className={inputCls} placeholder="Nom affiché" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} type="email" placeholder="E-mail" autoComplete="off" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <input className={inputCls} type="password" placeholder="Mot de passe provisoire (10 car. min.)" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button
            type="submit"
            disabled={busy !== null || !form.name || !form.email || form.password.length < 10}
            className="flex items-center justify-center gap-2 rounded-full bg-pine-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
          >
            {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
          </button>
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          Super-administrateur : tout, y compris les comptes. Administrateur : tarifs, paramètres et diagnostic. Commercial : clients, devis, simulation.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-base font-extrabold text-inkgreen">Comptes ({users.length})</h2>
        <ul className="divide-y divide-neutral-100">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-bold ${u.active ? "text-inkgreen" : "text-neutral-400 line-through"}`}>
                  {u.name} {u.id === me && <span className="text-xs font-semibold text-pine-600 no-underline">(vous)</span>}
                </span>
                <span className="block truncate text-xs text-neutral-400">
                  {u.email} · {u.last_login_at ? `dernière connexion ${dateFmt.format(new Date(u.last_login_at))}` : "jamais connecté"}
                </span>
              </div>
              <select
                aria-label={`Rôle de ${u.name}`}
                className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-semibold text-inkgreen"
                value={u.role}
                disabled={busy !== null}
                onChange={(e) => {
                  const role = e.target.value;
                  if (window.confirm(`Passer ${u.name} en « ${ROLE_LABELS[role as Role]} » ? Sa session en cours sera fermée.`))
                    call(`role-${u.id}`, `/api/admin/users/${u.id}`, "PATCH", { role }, "Rôle mis à jour.");
                }}
              >
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <button
                type="button"
                disabled={busy !== null}
                className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-bold text-inkgreen transition hover:border-amber-500 hover:bg-amber-500/15 disabled:opacity-40"
                onClick={() => {
                  const password = window.prompt(`Nouveau mot de passe provisoire pour ${u.name} (10 caractères minimum) :`);
                  if (password) call(`pwd-${u.id}`, `/api/admin/users/${u.id}`, "PATCH", { password }, `Mot de passe de ${u.name} réinitialisé.`);
                }}
              >
                Réinitialiser le mot de passe
              </button>
              <button
                type="button"
                disabled={busy !== null}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                  u.active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-700 hover:bg-green-50"
                }`}
                onClick={() => {
                  if (u.active && !window.confirm(`Désactiver le compte de ${u.name} ? Il ne pourra plus se connecter ; son historique est conservé.`)) return;
                  call(`act-${u.id}`, `/api/admin/users/${u.id}`, "PATCH", { active: !u.active }, u.active ? "Compte désactivé." : "Compte réactivé.");
                }}
              >
                {u.active ? "Désactiver" : "Réactiver"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
