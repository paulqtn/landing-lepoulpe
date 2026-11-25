import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { refusAction } from "@/lib/admin/attribution";
import { addEvent, adminQuery as q, getLead } from "@/lib/admin/db";
import { MORCEAU } from "@/lib/admin/fichiers";

/* Un fichier d'une fiche : envoi par morceaux (PUT), validation (POST), téléchargement (GET),
   suppression (DELETE). Lire est ouvert à qui voit les fiches ; ajouter et supprimer est
   réservé au commercial du client et aux administrateurs. */

type P = { params: Promise<{ id: string; fileId: string }> };
type Fichier = { id: number; lead_id: number; name: string; mime: string; bytes: number; complete: boolean };
const MENUS = ["etat", "devis", "clients", "relances", "pipeline"] as const;

async function charger(req: Request, params: P["params"], ecriture: boolean) {
  const g = await requireMenuApi(req, MENUS);
  if (g.denied) return { denied: g.denied };
  const { id, fileId } = await params;
  const lead = await getLead(Number(id));
  const file = (await q<Fichier>("SELECT id, lead_id, name, mime, bytes, complete FROM lead_files WHERE id = $1", [Number(fileId) || 0]))[0];
  if (!lead || !file || file.lead_id !== lead.id) return { denied: NextResponse.json({ ok: false, error: "Fichier introuvable." }, { status: 404 }) };
  if (ecriture) {
    const refus = refusAction(g.user, lead);
    if (refus) return { denied: NextResponse.json({ ok: false, error: refus }, { status: 403 }) };
  }
  return { user: g.user, lead, file };
}

/** Un morceau du fichier (corps binaire, numéro dans ?i=). */
export async function PUT(req: Request, { params }: P) {
  const c = await charger(req, params, true);
  if (c.denied) return c.denied;
  if (c.file.complete) return NextResponse.json({ ok: false, error: "Ce fichier est déjà enregistré." }, { status: 409 });
  const i = Number(new URL(req.url).searchParams.get("i"));
  const total = Math.ceil(c.file.bytes / MORCEAU);
  if (!Number.isInteger(i) || i < 0 || i >= total) return NextResponse.json({ ok: false, error: "Morceau inattendu." }, { status: 422 });
  const data = Buffer.from(await req.arrayBuffer());
  const attendu = i === total - 1 ? c.file.bytes - MORCEAU * (total - 1) : MORCEAU;
  if (data.length !== attendu) return NextResponse.json({ ok: false, error: "Morceau de taille incorrecte." }, { status: 422 });
  await q("INSERT INTO lead_file_chunks (file_id, idx, data) VALUES ($1, $2, $3) ON CONFLICT (file_id, idx) DO UPDATE SET data = EXCLUDED.data", [c.file.id, i, data]);
  return NextResponse.json({ ok: true });
}

/** Fin de l'envoi : le fichier n'est gardé que s'il est entier. */
export async function POST(req: Request, { params }: P) {
  const c = await charger(req, params, true);
  if (c.denied) return c.denied;
  const r = (await q<{ n: string; octets: string | null }>("SELECT count(*)::text AS n, sum(length(data))::text AS octets FROM lead_file_chunks WHERE file_id = $1", [c.file.id]))[0];
  if (Number(r.n) !== Math.ceil(c.file.bytes / MORCEAU) || Number(r.octets ?? 0) !== c.file.bytes) {
    await q("DELETE FROM lead_files WHERE id = $1 AND complete = false", [c.file.id]);
    return NextResponse.json({ ok: false, error: "Envoi incomplet : recommencez." }, { status: 422 });
  }
  if (!c.file.complete) {
    await q("UPDATE lead_files SET complete = true WHERE id = $1", [c.file.id]);
    await addEvent(c.lead.id, "info", `Fichier ajouté par ${c.user.name} : ${c.file.name}`);
  }
  return NextResponse.json({ ok: true });
}

/** Téléchargement, morceau par morceau (toujours en pièce jointe, jamais exécuté par le navigateur). */
export async function GET(req: Request, { params }: P) {
  const c = await charger(req, params, false);
  if (c.denied) return c.denied;
  if (!c.file.complete) return NextResponse.json({ ok: false, error: "Fichier introuvable." }, { status: 404 });
  const total = Math.ceil(c.file.bytes / MORCEAU);
  const id = c.file.id;
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= total) return controller.close();
      const rows = await q<{ data: Buffer }>("SELECT data FROM lead_file_chunks WHERE file_id = $1 AND idx = $2", [id, i++]);
      if (!rows[0]) return controller.error(new Error("morceau manquant"));
      controller.enqueue(new Uint8Array(rows[0].data));
    },
  });
  const ascii = c.file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(stream, {
    headers: {
      "Content-Type": c.file.mime,
      "Content-Length": String(c.file.bytes),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(c.file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(req: Request, { params }: P) {
  const c = await charger(req, params, true);
  if (c.denied) return c.denied;
  await q("DELETE FROM lead_files WHERE id = $1", [c.file.id]);
  if (c.file.complete) await addEvent(c.lead.id, "info", `Fichier supprimé par ${c.user.name} : ${c.file.name}`);
  return NextResponse.json({ ok: true });
}
