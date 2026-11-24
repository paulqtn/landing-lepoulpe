import { NextResponse } from "next/server";
import { userFromRequest } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";
import { currentVersion, getCatalogueSimulation } from "@/lib/admin/prices";
import { simulate, type SimulationInput } from "@/lib/simulation/engine";

/* Enregistre une simulation : le résultat est recalculé ici à partir de la saisie. */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  let body: { label?: unknown; input?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const label = typeof body.label === "string" ? body.label.trim().slice(0, 120) : "";
  if (label.length < 2) return NextResponse.json({ ok: false, error: "Donnez un nom à cette simulation." }, { status: 422 });
  const input = body.input as SimulationInput;
  if (!input || typeof input !== "object") return NextResponse.json({ ok: false, error: "Saisie manquante." }, { status: 400 });
  const result = simulate(input, await getCatalogueSimulation());
  if (!result.geometry) return NextResponse.json({ ok: false, error: "Saisie invalide : corrigez-la avant d'enregistrer." }, { status: 422 });
  const version = (await currentVersion("simulation")).version;
  const rows = await q<{ id: number }>(
    "INSERT INTO simulations (created_by, label, input, result, price_version, total_ht, total_ttc) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [user.name, label, JSON.stringify(input), JSON.stringify(result), version, result.sale?.totalHt ?? null, result.sale?.totalTtc ?? null],
  );
  return NextResponse.json({ ok: true, id: rows[0].id });
}
