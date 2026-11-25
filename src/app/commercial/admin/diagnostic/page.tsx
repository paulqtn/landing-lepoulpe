import { CheckCircle2, XCircle } from "lucide-react";
import { requireMenu } from "@/lib/admin/auth";
import { dbHealth } from "@/lib/admin/db";
import { mailConfigured } from "@/lib/admin/mail";

export const dynamic = "force-dynamic";

/* Diagnostic — état réel de la base et des services, lu à l'instant. */
export default async function DiagnosticPage() {
  await requireMenu("diagnostic");
  const h = await dbHealth();
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "inconnu";
  const checks: [string, boolean, string][] = [
    ["Base PostgreSQL", h.ok, h.ok ? `${h.version} · base « ${h.database} » · ${h.sizeMb} Mo utilisés` : h.error ?? ""],
    ["Envoi d'e-mails (Resend)", mailConfigured, mailConfigured ? "Clé présente." : "RESEND_API_KEY absente : aucun e-mail ne part."],
    ["Stockage des PDF (Vercel Blob)", Boolean(process.env.BLOB_READ_WRITE_TOKEN), process.env.BLOB_READ_WRITE_TOKEN ? "Jeton présent." : "Non activé : les PDF sont générés à la demande, sans archivage."],
    ["Tâche planifiée protégée", Boolean(process.env.CRON_SECRET), process.env.CRON_SECRET ? "CRON_SECRET présent." : "CRON_SECRET absent : l'adresse de la tâche de relance est appelable par n'importe qui."],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Diagnostic</h1>
        <p className="mt-1 text-sm text-neutral-500">Environnement : <strong className="text-inkgreen">{env}</strong>. Aucune valeur secrète n&rsquo;est affichée ici.</p>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <ul className="divide-y divide-neutral-100">
          {checks.map(([label, ok, detail]) => (
            <li key={label} className="flex items-start gap-3 py-3">
              {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
              <div>
                <p className="text-sm font-bold text-inkgreen">{label}</p>
                <p className="text-xs text-neutral-500">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {h.ok && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-base font-extrabold text-inkgreen">Tables</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {h.tables!.map((t) => (
                  <tr key={t.name}>
                    <td className="py-1.5 font-mono text-xs text-neutral-700">{t.name}</td>
                    <td className="py-1.5 text-right font-bold tabular-nums text-inkgreen">{t.rows.toLocaleString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-base font-extrabold text-inkgreen">Migrations appliquées</h2>
            <ul className="space-y-1.5 text-sm">
              {h.migrations!.map((m) => (
                <li key={m.id} className="flex justify-between gap-3">
                  <span className="font-mono text-xs text-neutral-700">{m.id}</span>
                  <span className="text-xs text-neutral-400">{new Date(m.applied_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
