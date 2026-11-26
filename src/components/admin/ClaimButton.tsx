"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hand, Loader2 } from "lucide-react";
import { toast } from "./Toasts";

/* « Je le prends » — la pioche d'un lead entrant par le commercial connecté. */
export function ClaimButton({ leadId }: { leadId: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "note">("idle");
  const [note, setNote] = useState("");

  async function claim() {
    setState("busy");
    try {
      const r = await fetch("/api/admin/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const j = (await r.json()) as { ok: boolean; demo?: boolean; error?: string; by?: string; first?: string | null; leadId?: number; name?: string; devisId?: number | null };
      if (j.ok) {
        // On enchaîne : le devis du client s'ouvre tout de suite (sa fiche s'il n'a pas de devis).
        toast(`Demande prise${j.name ? ` : ${j.name}` : ""}. ${j.devisId ? "Voici son devis à relire." : "Voici sa fiche."}`);
        if (j.devisId) router.push(`/commercial/devis/${j.devisId}`);
        else if (j.leadId) router.push(`/commercial/clients/${j.leadId}`);
        else router.refresh();
        return;
      }
      setNote(j.demo ? "Mode démo : écritures désactivées" : j.error === "taken" ? `Déjà pris par ${j.by}` : j.error === "not_first" ? `Prenez d'abord la demande la plus ancienne${j.first ? ` (${j.first})` : ""}` : j.error === "no_rep" ? "Reconnectez-vous en choisissant votre nom" : "Échec — réessayez");
    } catch {
      setNote("Échec — réessayez");
    }
    setState("note");
    setTimeout(() => {
      setState("idle");
      router.refresh(); // la file a changé : on la réaffiche à jour
    }, 3500);
  }

  if (state === "note") return <span className="text-[11px] font-semibold text-amber-700">{note}</span>;
  return (
    <button
      type="button"
      disabled={state === "busy"}
      onClick={claim}
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-pine-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:opacity-40"
    >
      {state === "busy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Hand className="h-3.5 w-3.5" />}
      Je le prends
    </button>
  );
}
