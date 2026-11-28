import { Activity, CheckCircle2, Database, History, XCircle } from "lucide-react";
import { Carte, EnTete } from "@/components/admin/ui";
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
      <EnTete titre="Diagnostic" sous={<>Environnement : <strong className="text-inkgreen">{env}</strong>. Aucune valeur secrète n&rsquo;est affichée ici.</>} />
      <Carte icon={Activity} titre="Services" sous={`${checks.filter((c) => c[1]).length} sur ${checks.length} en ordre.`} ton={checks.every((c) => c[1]) ? "vert" : "ambre"}>
        <ul className="grid gap-3 md:grid-cols-2">
          {checks.map(([label, ok, detail]) => (
            <li key={label} className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 ${ok ? "border-neutral-200" : "border-red-200 bg-red-50/40"}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-inkgreen">{label}</p>
                <p className="text-xs text-neutral-600">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Carte>
      {h.ok && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Carte icon={Database} titre="Tables" n={h.tables!.length} ton="neutre">
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
          </Carte>
          <Carte icon={History} titre="Migrations appliquées" n={h.migrations!.length} ton="neutre">
            <ul className="space-y-1.5 text-sm">
              {h.migrations!.map((m) => (
                <li key={m.id} className="flex justify-between gap-3">
                  <span className="font-mono text-xs text-neutral-700">{m.id}</span>
                  <span className="text-xs tabular-nums text-neutral-600">{new Date(m.applied_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</span>
                </li>
              ))}
            </ul>
          </Carte>
        </div>
      )}
    </div>
  );
}
