import { Simulation } from "@/components/admin/Simulation";
import { simulationOptions } from "@/lib/simulation/catalog";

/* Simulation — chiffrage d'un tronçon de garde-corps selon les règles
   du classeur MGK 2026 (parité Excel), avec comparatif des 16 systèmes. */

export default function SimulationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Simulation</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">
          Chiffrage d&rsquo;un tronçon droit selon les règles du calculateur MGK 2026 : calepinage, achats,
          transports, prix de vente et comparatif des 16 systèmes. Fourniture seule — la pose n&rsquo;est jamais comprise.
        </p>
      </div>
      <Simulation options={simulationOptions()} />
    </div>
  );
}
