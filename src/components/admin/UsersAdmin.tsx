"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { MENUS, ROLE_MENUS, type MenuKey } from "@/lib/admin/menus";

type Role = "superadmin" | "admin" | "commercial" | "logisticien";
type Row = { id: number; email: string; name: string; role: Role; active: boolean; last_login_at: string | null; menus: MenuKey[]; custom: boolean; clients?: number };

const ROLE_LABELS: Record<Role, string> = { superadmin: "Super-administrateur", admin: "Administrateur", commercial: "Commercial", logisticien: "Logisticien" };
const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-inkgreen outline-none transition focus:border-pine-500 focus:ring-4 focus:ring-pine-500/10";
const dateFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function UsersAdmin({ users, me }: { users: Row[]; me: number }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", role: "commercial" as Role, password: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [del, setDel] = useState<{ id: number; clients: string } | null>(null);

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
          Le rôle donne une sélection de menus de départ, que vous ajustez ensuite compte par compte ci-dessous. Seul le super-administrateur voit tout et gère les comptes.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-base font-extrabold text-inkgreen">Comptes ({users.length})</h2>
        <ul className="divide-y divide-neutral-100">
          {users.map((u) => (
            <li key={u.id} className="py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
                  if (window.confirm(`Passer ${u.name} en « ${ROLE_LABELS[role as Role]} » ? Ses menus reviendront à la sélection de ce rôle et sa session en cours sera fermée.`))
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
              {u.id !== me && (
                <button type="button" disabled={busy !== null} onClick={() => setDel(del?.id === u.id ? null : { id: u.id, clients: "" })} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40">
                  Supprimer
                </button>
              )}
              </div>
              {del?.id === u.id && (
                <div className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <p className="font-bold">Supprimer définitivement le compte de {u.name} ({u.email}) ?</p>
                  <p className="mt-1 text-xs">Le compte disparaît et ne pourra plus se connecter. Aucune fiche client, aucun devis ni aucun historique n&rsquo;est supprimé.</p>
                  {(u.clients ?? 0) > 0 && (
                    <label className="mt-2 block text-xs font-semibold">
                      Ses {u.clients} client{(u.clients ?? 0) > 1 ? "s" : ""} :
                      <select value={del.clients} onChange={(e) => setDel({ id: u.id, clients: e.target.value })} className="ml-2 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-inkgreen">
                        <option value="">remettre dans la file des demandes</option>
                        {users.filter((x) => x.id !== u.id && x.active && x.role !== "logisticien").map((x) => (
                          <option key={x.id} value={x.name}>confier à {x.name}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" disabled={busy !== null} onClick={async () => { if (await call(`del-${u.id}`, `/api/admin/users/${u.id}`, "DELETE", { confirmEmail: u.email, clients: del.clients }, `Compte de ${u.name} supprimé.`)) setDel(null); }} className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40">
                      Supprimer ce compte
                    </button>
                    <button type="button" onClick={() => setDel(null)} className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-bold text-red-700">Annuler</button>
                  </div>
                </div>
              )}
              <MenuPicker user={u} disabled={busy !== null} onSave={(menus) => call(`menus-${u.id}`, `/api/admin/users/${u.id}`, "PATCH", { menus }, menus === null ? `Menus de ${u.name} : retour à la sélection du rôle.` : `Menus de ${u.name} enregistrés.`)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* Choix des menus ouverts à un compte. */
function MenuPicker({ user, disabled, onSave }: { user: Row; disabled: boolean; onSave: (menus: MenuKey[] | null) => void }) {
  const [sel, setSel] = useState<MenuKey[]>(user.menus);
  if (user.role === "superadmin") {
    return <p className="mt-2 text-xs text-neutral-400">Accès complet à tous les menus (super-administrateur).</p>;
  }
  const changed = sel.length !== user.menus.length || sel.some((k) => !user.menus.includes(k));
  const toggle = (k: MenuKey) => setSel((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  return (
    <details className="mt-2 rounded-xl border border-neutral-200">
      <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-pine-700">
        Menus accessibles : {user.menus.length} sur {MENUS.length}
        <span className="ml-2 font-semibold text-neutral-400">{user.custom ? "sélection personnalisée" : "sélection du rôle"}</span>
      </summary>
      <div className="border-t border-neutral-100 px-3 py-3">
        <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {MENUS.map((m) => (
            <label key={m.key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" className="h-4 w-4 accent-pine-700" checked={sel.includes(m.key)} disabled={disabled} onChange={() => toggle(m.key)} />
              {m.label}
              {m.group !== "commercial" && <span className="text-[10px] font-bold uppercase text-amber-600">{m.group === "administration" ? "admin" : "logistique"}</span>}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">« Mon compte » reste toujours accessible. « Utilisateurs » est réservé au super-administrateur. La modification s&rsquo;applique dès la page suivante de l&rsquo;utilisateur.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={disabled || !changed} onClick={() => onSave(MENUS.map((m) => m.key).filter((k) => sel.includes(k)))} className="rounded-full bg-pine-700 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-pine-600 disabled:opacity-40">
            Enregistrer les menus
          </button>
          {user.custom && (
            <button type="button" disabled={disabled} onClick={() => { setSel(ROLE_MENUS[user.role]); onSave(null); }} className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-pine-300 hover:text-pine-700 disabled:opacity-40">
            Revenir à la sélection du rôle
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
