import { NextResponse } from "next/server";
import { audit, requireMenuApi } from "@/lib/admin/auth";
import { getCompSettings } from "@/lib/admin/compens";
import { DELAIS_DEFAUT, getDelais } from "@/lib/admin/logistics-tasks";
import { getSetting, setSetting } from "@/lib/admin/settings";
import { SOCIETE_FIELDS } from "@/lib/admin/societe";

/* Paramètres généraux (commissions, coordonnées de la société sur les devis). */
export async function POST(req: Request) {
  const g = await requireMenuApi(req, ["tarifs"]);
  if (g.denied) return g.denied;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const v = (body.value ?? {}) as Record<string, unknown>;

  if (body.key === "commissions") {
    const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 10_000_000 ? x : null);
    const next = { commissionPct: num(v.commissionPct), objectifMensuel: num(v.objectifMensuel), primeObjectif: num(v.primeObjectif) };
    if (Object.values(next).some((x) => x === null) || (next.commissionPct as number) > 100)
      return NextResponse.json({ ok: false, error: "Valeurs invalides." }, { status: 422 });
    const before = await getCompSettings();
    await setSetting("commissions", next, g.user.name);
    await audit(g.user.name, "parametres_commissions", "settings", "commissions", before, next);
    return NextResponse.json({ ok: true });
  }

  if (body.key === "logistique") {
    const next: Record<string, number> = {};
    for (const k of Object.keys(DELAIS_DEFAUT)) {
      const x = v[k];
      if (typeof x !== "number" || !Number.isInteger(x) || x < 0 || x > 365) return NextResponse.json({ ok: false, error: "Délais : nombres de jours entiers, de 0 à 365." }, { status: 422 });
      next[k] = x;
    }
    const before = await getDelais();
    await setSetting("logistique", next, g.user.name);
    await audit(g.user.name, "parametres_logistique", "settings", "logistique", before, next);
    return NextResponse.json({ ok: true });
  }

  if (body.key === "societe") {
    const next: Record<string, string> = {};
    for (const f of SOCIETE_FIELDS) next[f.key] = typeof v[f.key] === "string" ? (v[f.key] as string).trim().slice(0, 600) : "";
    const before = await getSetting("societe");
    await setSetting("societe", next, g.user.name);
    await audit(g.user.name, "parametres_societe", "settings", "societe", before, next);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Paramètre inconnu." }, { status: 400 });
}
