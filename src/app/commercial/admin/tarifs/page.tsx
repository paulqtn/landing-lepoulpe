import Link from "next/link";
import { PriceEditor } from "@/components/admin/PriceEditor";
import { CommissionsForm, DelaisForm, SocieteForm } from "@/components/admin/SettingsForms";
import { DELAIS_LABELS, getDelais } from "@/lib/admin/logistics-tasks";
import { requireMenu } from "@/lib/admin/auth";
import { getCompSettings } from "@/lib/admin/compens";
import { ENGINE_LABELS, currentVersion, describe, listVersions, type Engine } from "@/lib/admin/prices";
import { referenceScenarios } from "@/lib/admin/prices-ref";
import { SOCIETE_FIELDS, getSociete } from "@/lib/admin/societe";

export const dynamic = "force-dynamic";

/* Tarifs et paramètres — tout ce qui se règle sans redéployer le site. */

const TABS = [
  { key: "site", label: "Tarifs du site" },
  { key: "simulation", label: "Tarifs de la Simulation" },
  { key: "parametres", label: "Commissions, délais et société" },
] as const;

export default async function TarifsPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  await requireMenu("tarifs");
  const { onglet } = await searchParams;
  const tab = TABS.find((t) => t.key === onglet)?.key ?? "site";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-inkgreen">Tarifs et paramètres</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">
          Les modifications publiées ici s&rsquo;appliquent aux générateurs sans redéploiement, sous une minute.
          Les règles de calcul ne changent pas : seuls les chiffres sont modifiables. Chaque publication est historisée.
        </p>
      </div>
      <nav className="flex flex-wrap gap-1.5" aria-label="Onglets">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/commercial/admin/tarifs?onglet=${t.key}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              tab === t.key ? "bg-pine-700 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-pine-300 hover:text-pine-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "parametres" ? <Parametres /> : <Tarifs engine={tab} />}
    </div>
  );
}

async function Tarifs({ engine }: { engine: Engine }) {
  const [cur, versions] = await Promise.all([currentVersion(engine), listVersions(engine)]);
  return (
    <>
      <p className="text-sm font-bold text-inkgreen">{ENGINE_LABELS[engine]}</p>
      <PriceEditor
        key={`${engine}-${cur.version ?? 0}`}
        engine={engine}
        sections={describe(engine, cur.data)}
        scenarios={referenceScenarios(engine, cur.data)}
        versions={versions.map((v) => ({ ...v, created_at: new Date(v.created_at).toISOString() }))}
        currentVersion={cur.version}
      />
    </>
  );
}

async function Parametres() {
  const [comp, societe, delais] = await Promise.all([getCompSettings(), getSociete(), getDelais()]);
  return (
    <>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-base font-extrabold text-inkgreen">Rémunération des commerciaux</h2>
        <CommissionsForm initial={comp} />
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Délais logistiques</h2>
        <p className="mb-4 mt-1 text-xs text-neutral-400">Nombre de jours après la validation de l&rsquo;affaire par le commercial. Ils fixent les échéances des tâches du logisticien.</p>
        <DelaisForm fields={Object.entries(DELAIS_LABELS).map(([key, label]) => ({ key, label }))} initial={delais} />
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-extrabold text-inkgreen">Société — mentions des devis</h2>
        <p className="mb-4 mt-1 text-xs text-neutral-400">Ces informations figurent sur les devis envoyés aux clients. Adresse, SIRET, TVA et conditions sont obligatoires pour pouvoir envoyer un devis.</p>
        <SocieteForm fields={SOCIETE_FIELDS.map((f) => ({ ...f }))} initial={societe} />
      </section>
    </>
  );
}
