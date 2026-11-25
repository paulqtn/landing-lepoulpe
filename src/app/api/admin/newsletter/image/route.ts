import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/admin/auth";
import { adminQuery as q } from "@/lib/admin/db";

/* Dépôt d'une image de newsletter — super-administrateur uniquement.
   L'image est réduite par le navigateur avant l'envoi ; le serveur vérifie
   le type réel du fichier (et pas seulement son nom) et sa taille. */

const MAX = 2 * 1024 * 1024;

function typeReel(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 6 && ["GIF87a", "GIF89a"].includes(b.subarray(0, 6).toString("latin1"))) return "image/gif";
  return null;
}

export async function POST(req: Request) {
  const g = await requireRole(req, ["superadmin"]);
  if (g.denied) return g.denied;
  if (Number(req.headers.get("content-length") ?? 0) > MAX) return NextResponse.json({ ok: false, error: "Image trop lourde (2 Mo maximum)." }, { status: 413 });
  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0 || data.length > MAX) return NextResponse.json({ ok: false, error: "Image trop lourde (2 Mo maximum)." }, { status: 413 });
  const mime = typeReel(data);
  if (!mime) return NextResponse.json({ ok: false, error: "Format non pris en charge : utilisez une image JPEG, PNG ou GIF." }, { status: 415 });
  const token = randomBytes(16).toString("hex");
  await q("INSERT INTO newsletter_images (token, mime, data, bytes, created_by) VALUES ($1, $2, $3, $4, $5)", [token, mime, data, data.length, g.user.name]);
  return NextResponse.json({ ok: true, url: `/api/nl-image/${token}` });
}
