import { adminQuery as q, dbConfigured } from "@/lib/admin/db";

/* Image d'une newsletter, servie publiquement : les messageries des clients
   doivent pouvoir la charger. L'adresse contient un jeton aléatoire. */

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!dbConfigured || !/^[a-f0-9]{32}$/.test(token)) return new Response(null, { status: 404 });
  const rows = await q<{ mime: string; data: Buffer }>("SELECT mime, data FROM newsletter_images WHERE token = $1", [token]);
  if (!rows[0]) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(rows[0].data), {
    headers: { "Content-Type": rows[0].mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
