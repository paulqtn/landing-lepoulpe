import { adminQuery as q } from "@/lib/admin/db";
import { accesAvecBoite, refuse } from "@/lib/messagerie/acces";
import { journal } from "@/lib/messagerie/comptes";
import { avecImap, lireComplet } from "@/lib/messagerie/imap";
import { pieceDangereuse } from "@/lib/messagerie/modele";

export const maxDuration = 45;

/* Pièce jointe, relue dans la boîte mail au moment du téléchargement (elle n'est pas stockée
   dans le back office). Les fichiers capables d'exécuter du code sont refusés ; les autres sont
   toujours servis en téléchargement, jamais affichés dans la page. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const a = await accesAvecBoite(req);
  if (a.refus) return a.refus;
  const { id, n } = await params;
  const m = (await q<{ uid: string; dossier: "inbox" | "sent"; archive: boolean; pieces: { nom: string }[] }>("SELECT uid, dossier, archive, pieces FROM mail_messages WHERE id = $1 AND account_id = $2", [Number(id), a.compte.id]))[0];
  const meta = m?.pieces[Number(n)];
  if (!m || !meta) return refuse("Pièce jointe introuvable.", 404);
  if (pieceDangereuse(meta.nom)) return refuse("Ce type de fichier peut exécuter du code : il n'est pas téléchargeable depuis le back office.", 403);
  if (m.archive) return refuse("Ce message a été déplacé : ouvrez la pièce jointe depuis votre boîte mail.", 409);
  const chemin = m.dossier === "inbox" ? a.compte.dossiers.inbox : a.compte.dossiers.sent;
  if (!chemin) return refuse("Dossier introuvable.", 404);
  try {
    const mail = await avecImap(a.compte, (c) => lireComplet(c, chemin, Number(m.uid)));
    const pieces = (mail?.attachments ?? []).filter((x) => x.contentDisposition !== "inline" || !x.cid);
    const p = pieces[Number(n)];
    if (!p || (p.filename ?? "pièce jointe").slice(0, 200) !== meta.nom) return refuse("Pièce jointe introuvable dans la boîte mail.", 404);
    await journal(a.user.id, a.compte.email, "piece_telechargee", meta.nom);
    return new Response(new Uint8Array(p.content), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(meta.nom)}`,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return refuse("La pièce jointe n'a pas pu être lue dans la boîte mail.", 502);
  }
}
