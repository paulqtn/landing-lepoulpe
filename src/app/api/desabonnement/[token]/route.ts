import { NextResponse } from "next/server";
import { addEvent, adminQuery as q, dbConfigured } from "@/lib/admin/db";

/* Désinscription de la newsletter par le client (lien en bas de chaque e-mail). */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!dbConfigured || !/^[0-9a-f]{24}$/.test(token)) return NextResponse.json({ ok: false }, { status: 404 });
  const rows = await q<{ id: number; email: string }>("SELECT id, email FROM leads WHERE token = $1", [token]);
  if (!rows[0]) return NextResponse.json({ ok: false }, { status: 404 });
  // Toutes les demandes faites avec la même adresse sont désinscrites.
  await q("UPDATE leads SET newsletter_optout_at = COALESCE(newsletter_optout_at, now()) WHERE lower(email) = lower($1)", [rows[0].email]);
  await addEvent(rows[0].id, "info", "Le client s'est désinscrit de la newsletter");
  return NextResponse.json({ ok: true });
}
