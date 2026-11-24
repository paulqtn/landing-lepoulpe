import { Simulation } from "@/components/admin/Simulation";
import { adminQuery } from "@/lib/admin/db";
import { simulationOptions } from "@/lib/simulation/catalog";

export const dynamic = "force-dynamic";

/* Simulation — chiffrage d'un tronçon de garde-corps selon les règles
   du classeur MGK 2026 (parité Excel), avec comparatif des 16 systèmes. */

type SavedRow = { id: number; label: string; created_at: string; created_by: string | null; total_ht: string | null; input: Record<string, unknown> };

export default async function SimulationPage() {
  const saved = await adminQuery<SavedRow>("SELECT id, label, created_at, created_by, total_ht, input FROM simulations ORDER BY id DESC LIMIT 30");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Simulation</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">
          Chiffrage d&rsquo;un tronçon droit selon les règles du calculateur MGK 2026 : calepinage, achats,
          transports, prix de vente et comparatif des 16 systèmes. Fourniture seule — la pose n&rsquo;est jamais comprise.
        </p>
      </div>
      <Simulation options={simulationOptions()} saved={saved.map((x) => ({ ...x, created_at: new Date(x.created_at).toISOString() }))} />
    </div>
  );
}
