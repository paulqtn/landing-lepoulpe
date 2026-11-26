import { accesAvecBoite, refuse } from "@/lib/messagerie/acces";
import { cheminDe, indexDe } from "@/lib/messagerie/boite";
import { journal } from "@/lib/messagerie/comptes";
import { avecImap, lireComplet } from "@/lib/messagerie/imap";
import { pieceDangereuse } from "@/lib/messagerie/modele";

export const maxDuration = 45;

/* Pièce jointe, relue dans la boîte mail au moment du téléchargement (rien n'est stocké dans le
   back office). Les fichiers capables d'exécuter du code sont refusés ; les autres sont toujours
   servis en téléchargement, jamais affichés dans la page. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const { id, n } = await params;
  const idx = await indexDe(a.compte, Number(id));
  const chemin = idx ? cheminDe(a.compte, idx.dossier) : null;
  if (!idx || !chemin) return refuse("Pièce jointe introuvable.", 404);
  try {
    const mail = await avecImap(a.compte, (c) => lireComplet(c, chemin, Number(idx.uid)));
    const p = (mail?.attachments ?? []).filter((x) => x.contentDisposition !== "inline" || !x.cid)[Number(n)];
    if (!p) return refuse("Pièce jointe introuvable dans la boîte mail.", 404);
    const nom = (p.filename ?? "pièce jointe").slice(0, 200);
    if (pieceDangereuse(nom)) return refuse("Ce type de fichier peut exécuter du code : il n'est pas téléchargeable depuis le back office.", 403);
    await journal(a.user.id, a.compte.email, "piece_telechargee");
    return new Response(new Uint8Array(p.content), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nom)}`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return refuse("La pièce jointe n'a pas pu être lue dans la boîte mail.", 502);
  }
}
