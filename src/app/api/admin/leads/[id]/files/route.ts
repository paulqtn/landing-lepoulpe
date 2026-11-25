import { NextResponse } from "next/server";
import { requireMenuApi } from "@/lib/admin/auth";
import { refusAction } from "@/lib/admin/attribution";
import { adminQuery as q, getLead } from "@/lib/admin/db";
import { FICHIER_MAX, FICHIERS_PAR_FICHE, MORCEAU, TYPES_FICHIER, extension } from "@/lib/admin/fichiers";

/* Ouverture d'un envoi de fichier sur une fiche : le serveur vérifie le nom, le type et la
   taille annoncés, puis attend les morceaux (voir [fileId]/route.ts). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await requireMenuApi(req, ["etat", "devis", "clients", "relances", "pipeline"]);
  if (g.denied) return g.denied;
  const lead = await getLead(Number((await params).id));
  if (!lead) return NextResponse.json({ ok: false, error: "introuvable" }, { status: 404 });
  const refus = refusAction(g.user, lead);
  if (refus) return NextResponse.json({ ok: false, error: refus }, { status: 403 });
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // Nom nettoyé : pas de chemin, pas de caractères de contrôle.
  const name = String(b.name ?? "").replace(/[\\/\u0000-\u001f"<>|:*?]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  const mime = TYPES_FICHIER[extension(name)];
  const bytes = Number(b.size);
  if (!name || !mime) return NextResponse.json({ ok: false, error: `Type de fichier non accepté. Formats possibles : ${Object.keys(TYPES_FICHIER).join(", ")}.` }, { status: 415 });
  if (!Number.isInteger(bytes) || bytes <= 0) return NextResponse.json({ ok: false, error: "Fichier vide." }, { status: 422 });
  if (bytes > FICHIER_MAX) return NextResponse.json({ ok: false, error: "Fichier trop lourd : 10 Mo maximum." }, { status: 413 });

  // Ménage des envois interrompus depuis plus d'un jour (jamais un fichier complet).
  await q("DELETE FROM lead_files WHERE complete = false AND created_at < now() - interval '1 day'");
  const n = await q<{ n: string }>("SELECT count(*)::text AS n FROM lead_files WHERE lead_id = $1 AND complete", [lead.id]);
  if (Number(n[0].n) >= FICHIERS_PAR_FICHE) return NextResponse.json({ ok: false, error: `Cette fiche a déjà ${FICHIERS_PAR_FICHE} fichiers : supprimez-en un avant d'en ajouter.` }, { status: 409 });

  const rows = await q<{ id: number }>("INSERT INTO lead_files (lead_id, name, mime, bytes, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id", [lead.id, name, mime, bytes, g.user.name]);
  return NextResponse.json({ ok: true, fileId: rows[0].id, morceau: MORCEAU, morceaux: Math.ceil(bytes / MORCEAU) });
}
