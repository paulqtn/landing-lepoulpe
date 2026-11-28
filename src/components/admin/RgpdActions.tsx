"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

/* Outils RGPD de la fiche client : export des données, anonymisation. */
export function RgpdActions({ leadId, anonymized }: { leadId: number; anonymized: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-inkgreen">
        <ShieldCheck className="h-4 w-4 text-pine-600" />
        Données personnelles (RGPD)
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={`/api/admin/leads/${leadId}/rgpd`} className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:border-pine-300 hover:text-pine-700">
          Exporter ses données
        </a>
        {!anonymized && (
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            onClick={async () => {
              const phrase = `ANONYMISER ${leadId}`;
              const typed = window.prompt(`Anonymisation définitive : nom, e-mail, téléphone, adresse et notes seront effacés ; les montants et statuts sont conservés pour les statistiques.\n\nPour confirmer, saisissez : ${phrase}`);
              if (typed !== phrase) return;
              setBusy(true);
              const res = await fetch(`/api/admin/leads/${leadId}/rgpd`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: typed }) }).catch(() => null);
              setBusy(false);
              if (res?.ok) router.refresh();
              else setMsg("Anonymisation impossible.");
            }}
          >
            Anonymiser ce client
          </button>
        )}
      </div>
      {anonymized && <p className="mt-2 text-xs text-neutral-600">Ce client a été anonymisé.</p>}
      {msg && <p className="mt-2 text-xs font-semibold text-red-600">{msg}</p>}
    </section>
  );
}
