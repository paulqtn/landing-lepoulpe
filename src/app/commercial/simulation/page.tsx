import { requireMenu } from "@/lib/admin/auth";
import { Simulation } from "@/components/admin/Simulation";
import { adminQuery } from "@/lib/admin/db";
import { simulationOptions } from "@/lib/simulation/catalog";
import { EnTete } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

/* Simulation — chiffrage d'un tronçon de garde-corps selon les règles
   du classeur MGK 2026 (parité Excel), avec comparatif des 16 systèmes. */

type SavedRow = { id: number; label: string; created_at: string; created_by: string | null; total_ht: string | null; input: Record<string, unknown> };

export default async function SimulationPage() {
  await requireMenu("simulation");
  const saved = await adminQuery<SavedRow>("SELECT id, label, created_at, created_by, total_ht, input FROM simulations ORDER BY id DESC LIMIT 30");
  return (
    <div className="space-y-6">
      <EnTete titre="Simulation" sous="Chiffrage d'un tronçon droit selon les règles du calculateur MGK 2026 : calepinage, achats, transports, prix de vente et comparatif des 16 systèmes. Fourniture seule — la pose n'est jamais comprise." />
      <Simulation options={simulationOptions()} saved={saved.map((x) => ({ ...x, created_at: new Date(x.created_at).toISOString() }))} />
    </div>
  );
}
