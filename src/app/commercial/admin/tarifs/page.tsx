import { Building2, CalendarClock, Layers, Wallet } from "lucide-react";
import { Carte, EnTete, Onglets } from "@/components/admin/ui";
import { PriceEditor } from "@/components/admin/PriceEditor";
import { CommissionsForm, DelaisForm, NiveauxPrixForm, SocieteForm } from "@/components/admin/SettingsForms";
import { getCoefsPrix } from "@/lib/admin/niveaux-prix-serveur";
import { DELAIS_LABELS, getDelais } from "@/lib/admin/logistics-tasks";
import { requireMenu } from "@/lib/admin/auth";
import { getCompSettings } from "@/lib/admin/compens";
import { ENGINE_LABELS, currentVersion, describe, getTarifsSite, listVersions, type Engine } from "@/lib/admin/prices";
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
      <EnTete titre="Tarifs et paramètres" sous="Les modifications publiées ici s'appliquent aux générateurs sans redéploiement, sous une minute. Les règles de calcul ne changent pas : seuls les chiffres sont modifiables. Chaque publication est historisée." />
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <Onglets label="Onglets" items={TABS.map((t) => ({ href: `/commercial/admin/tarifs?onglet=${t.key}`, label: t.label, on: tab === t.key }))} />
      </div>
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
  const [comp, societe, delais, coefs, tarifsSite] = await Promise.all([getCompSettings(), getSociete(), getDelais(), getCoefsPrix(), getTarifsSite()]);
  const coefSite = tarifsSite.coefDefaut;
  return (
    <>
      <Carte icon={Layers} titre="Niveaux de prix des devis" sous="Les trois prix qu'un commercial peut choisir dans un devis. Un devis déjà envoyé ne change pas.">
        <NiveauxPrixForm initial={coefs} coefSite={coefSite} />
      </Carte>
      <Carte icon={Wallet} titre="Rémunération des commerciaux">
        <CommissionsForm initial={comp} />
      </Carte>
      <Carte icon={CalendarClock} titre="Délais logistiques" sous="Nombre de jours après la validation de l'affaire par le commercial. Ils fixent les échéances des tâches du logisticien.">
        <DelaisForm fields={Object.entries(DELAIS_LABELS).map(([key, label]) => ({ key, label }))} initial={delais} />
      </Carte>
      <Carte icon={Building2} titre="Société — mentions des devis" sous="Ces informations figurent sur les devis envoyés aux clients. Adresse, SIRET, TVA et conditions sont obligatoires pour pouvoir envoyer un devis.">
        <SocieteForm fields={SOCIETE_FIELDS.map((f) => ({ ...f }))} initial={societe} />
      </Carte>
    </>
  );
}
