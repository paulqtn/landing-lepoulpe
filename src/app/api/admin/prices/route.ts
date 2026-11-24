import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { ENGINES, applyEdits, currentVersion, publish, restore, type Engine, type PriceEdit } from "@/lib/admin/prices";
import { referenceScenarios } from "@/lib/admin/prices-ref";

/* Tarifs : aperçu d'impact, publication d'une nouvelle version, retour arrière.
   Réservé aux rôles superadmin et admin. */
export async function POST(req: Request) {
  const g = await requireMenuApi(req, ["tarifs"]);
  if (g.denied) return g.denied;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const engine = ENGINES.find((e) => e === body.engine) as Engine | undefined;
  if (!engine) return NextResponse.json({ ok: false, error: "Moteur inconnu." }, { status: 422 });

  if (body.action === "restore") {
    const r = await restore(engine, Number(body.versionId), g.user.name);
    return NextResponse.json(r, { status: r.ok ? 200 : 422 });
  }

  const edits: PriceEdit[] = (Array.isArray(body.edits) ? body.edits : []).slice(0, 2000).map((e) => {
    const x = (e ?? {}) as Record<string, unknown>;
    return { path: String(x.path ?? ""), value: x.value === null ? null : Number(x.value) };
  });

  if (body.action === "preview") {
    const cur = await currentVersion(engine);
    const res = applyEdits(engine, cur.data, edits);
    if (res.error) return NextResponse.json({ ok: false, error: res.error }, { status: 422 });
    return NextResponse.json({
      ok: true,
      changes: res.changes,
      before: referenceScenarios(engine, cur.data),
      after: referenceScenarios(engine, res.data),
    });
  }

  if (body.action === "publish") {
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length < 3) return NextResponse.json({ ok: false, error: "Indiquez le motif de la modification." }, { status: 422 });
    const r = await publish(engine, edits, note.slice(0, 300), g.user.name);
    return NextResponse.json(r, { status: r.ok ? 200 : 422 });
  }
  return NextResponse.json({ ok: false, error: "Action inconnue." }, { status: 400 });
}
