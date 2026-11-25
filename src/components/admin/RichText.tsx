"use client";

import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Eraser, ImagePlus, Italic, Link2, Link2Off, List, ListOrdered, Loader2, Redo2, Trash2, Underline, Undo2 } from "lucide-react";

/* Éditeur de texte mis en forme pour la newsletter : gras, italique, souligné,
   taille, couleur, titres, listes, alignement, liens, et images déposées par
   glisser-déposer, collage ou sélection de fichier. Le HTML produit est
   toujours re-nettoyé par le serveur avant d'être enregistré ou envoyé. */

const TAILLES = [
  { label: "Petit", px: 13 },
  { label: "Normal", px: 15 },
  { label: "Grand", px: 18 },
  { label: "Très grand", px: 24 },
  { label: "Énorme", px: 32 },
];
const COULEURS = [
  { nom: "Noir", hex: "#1d2a23" },
  { nom: "Vert", hex: "#175a3b" },
  { nom: "Orange", hex: "#d9860b" },
  { nom: "Rouge", hex: "#c62828" },
  { nom: "Bleu", hex: "#1f5fbf" },
  { nom: "Gris", hex: "#6b7770" },
];
const LARGEURS = [25, 50, 75, 100];
const IMAGE_MAX_PX = 1200;

const btn = "grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-neutral-700 transition hover:bg-amber-500/15 hover:text-inkgreen disabled:opacity-40";
const sel = "h-8 rounded-lg border border-neutral-200 bg-white px-1.5 text-xs font-semibold text-neutral-700 outline-none focus:border-pine-500";
const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/** Réduit l'image dans le navigateur (largeur max 1200 px, JPEG) avant de l'envoyer. */
async function preparer(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, IMAGE_MAX_PX / bmp.width);
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(bmp.width * k));
  cv.height = Math.max(1, Math.round(bmp.height * k));
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.86));
}

export function RichText(props: {
  initial: string;
  variables: { cle: string; description: string }[];
  onChange: (html: string) => void;
  onError: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [link, setLink] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = props.initial;
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => props.onChange((ref.current?.innerHTML ?? "").replace(/ data-sel="1"/g, ""));

  /* La sélection est mémorisée : un clic dans une liste ou un champ de la barre d'outils la fait perdre. */
  const saveSel = () => {
    const s = window.getSelection();
    if (s && s.rangeCount && ref.current?.contains(s.anchorNode)) saved.current = s.getRangeAt(0).cloneRange();
  };
  const restoreSel = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const s = window.getSelection();
    if (!s) return;
    if (saved.current && el.contains(saved.current.startContainer)) {
      s.removeAllRanges();
      s.addRange(saved.current);
    } else if (!el.contains(s.anchorNode)) {
      const r = document.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      s.removeAllRanges();
      s.addRange(r);
    }
  };
  const exec = (cmd: string, value?: string, css = false) => {
    restoreSel();
    document.execCommand("styleWithCSS", false, css ? "true" : "false");
    document.execCommand(cmd, false, value);
    saveSel();
    emit();
  };
  const tool = (label: string, icon: React.ReactNode, run: () => void) => (
    <button type="button" title={label} aria-label={label} className={btn} onMouseDown={(e) => e.preventDefault()} onClick={run}>
      {icon}
    </button>
  );

  function taille(px: number) {
    restoreSel();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, "7");
    const poses: HTMLElement[] = [];
    ref.current?.querySelectorAll('font[size="7"]').forEach((f) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      // Une taille déjà posée à l'intérieur l'emporterait : on la retire.
      f.querySelectorAll<HTMLElement>("span").forEach((x) => x.style.removeProperty("font-size"));
      span.append(...Array.from(f.childNodes));
      f.replaceWith(span);
      poses.push(span);
    });
    // Le texte reste sélectionné, pour enchaîner avec une couleur ou du gras.
    const s = window.getSelection();
    if (s && poses.length) {
      const r = document.createRange();
      r.setStartBefore(poses[0]);
      r.setEndAfter(poses[poses.length - 1]);
      s.removeAllRanges();
      s.addRange(r);
      saved.current = r.cloneRange();
    }
    emit();
  }

  function poserLien() {
    let url = (link ?? "").trim();
    if (!url) return setLink(null);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) url = `mailto:${url}`;
    else if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) url = `https://${url}`;
    if (/[\s"<>]/.test(url)) return props.onError("Cette adresse de lien n'est pas valide.");
    restoreSel();
    const s = window.getSelection();
    if (s && s.isCollapsed) document.execCommand("insertHTML", false, `<a href="${esc(url)}">${esc(url.replace(/^(mailto:|tel:)/, ""))}</a>`);
    else document.execCommand("createLink", false, url);
    setLink(null);
    saveSel();
    emit();
  }

  async function ajouterImages(files: File[]) {
    const images = files.filter((f) => /^image\/(jpeg|png|gif|webp)$/.test(f.type));
    if (images.length === 0) return props.onError("Seules les images JPEG, PNG, GIF ou WebP peuvent être ajoutées.");
    for (const f of images) {
      setUploading((n) => n + 1);
      try {
        const blob = await preparer(f);
        const res = await fetch("/api/admin/newsletter/image", { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error ?? "L'image n'a pas pu être enregistrée.");
        restoreSel();
        document.execCommand("insertHTML", false, `<img src="${esc(data.url)}" alt="" style="width: 100%;">`);
        saveSel();
        emit();
      } catch (e) {
        props.onError(e instanceof Error && e.message !== "canvas" && e.message !== "blob" ? e.message : "Cette image n'a pas pu être lue.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function choisirImage(el: HTMLImageElement | null) {
    ref.current?.querySelectorAll("img[data-sel]").forEach((x) => x.removeAttribute("data-sel"));
    if (el) el.setAttribute("data-sel", "1");
    setImg(el);
  }

  return (
    <div className={`overflow-hidden rounded-xl border bg-white transition focus-within:border-pine-500 focus-within:ring-4 focus-within:ring-pine-500/10 ${drag ? "border-amber-500 ring-4 ring-amber-500/20" : "border-neutral-200"}`}>
      <div role="toolbar" aria-label="Mise en forme" className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-mist px-2 py-1.5">
        <select aria-label="Style du paragraphe" className={sel} value="" onMouseDown={saveSel} onChange={(e) => e.target.value && exec("formatBlock", e.target.value)}>
          <option value="">Style…</option>
          <option value="p">Paragraphe</option>
          <option value="h2">Titre</option>
          <option value="h3">Sous-titre</option>
        </select>
        <select aria-label="Taille du texte" className={sel} value="" onMouseDown={saveSel} onChange={(e) => e.target.value && taille(Number(e.target.value))}>
          <option value="">Taille…</option>
          {TAILLES.map((t) => (
            <option key={t.px} value={t.px}>{t.label}</option>
          ))}
        </select>
        {tool("Gras", <Bold className="h-4 w-4" />, () => exec("bold"))}
        {tool("Italique", <Italic className="h-4 w-4" />, () => exec("italic"))}
        {tool("Souligné", <Underline className="h-4 w-4" />, () => exec("underline"))}
        <span className="mx-0.5 flex items-center gap-1" role="group" aria-label="Couleur du texte">
          {COULEURS.map((k) => (
            <button key={k.hex} type="button" title={`Couleur : ${k.nom}`} aria-label={`Couleur : ${k.nom}`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("foreColor", k.hex, true)} className="h-5 w-5 rounded-full border border-white shadow ring-1 ring-neutral-300 transition hover:scale-110" style={{ background: k.hex }} />
          ))}
        </span>
        {tool("Aligner à gauche", <AlignLeft className="h-4 w-4" />, () => exec("justifyLeft", undefined, true))}
        {tool("Centrer", <AlignCenter className="h-4 w-4" />, () => exec("justifyCenter", undefined, true))}
        {tool("Aligner à droite", <AlignRight className="h-4 w-4" />, () => exec("justifyRight", undefined, true))}
        {tool("Liste à puces", <List className="h-4 w-4" />, () => exec("insertUnorderedList"))}
        {tool("Liste numérotée", <ListOrdered className="h-4 w-4" />, () => exec("insertOrderedList"))}
        {tool("Ajouter un lien", <Link2 className="h-4 w-4" />, () => { saveSel(); setLink(link === null ? "" : null); })}
        {tool("Retirer le lien", <Link2Off className="h-4 w-4" />, () => exec("unlink"))}
        {tool("Ajouter une image", uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />, () => { saveSel(); file.current?.click(); })}
        {tool("Effacer la mise en forme", <Eraser className="h-4 w-4" />, () => exec("removeFormat"))}
        {tool("Annuler", <Undo2 className="h-4 w-4" />, () => exec("undo"))}
        {tool("Rétablir", <Redo2 className="h-4 w-4" />, () => exec("redo"))}
        <input ref={file} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple hidden onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) ajouterImages(f); }} />
      </div>

      {link !== null && (
        <form className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-2 py-1.5" onSubmit={(e) => { e.preventDefault(); poserLien(); }}>
          <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-neutral-500">
            Adresse du lien
            <input autoFocus className="h-8 min-w-0 flex-1 rounded-lg border border-neutral-200 px-2 text-sm text-inkgreen outline-none focus:border-pine-500" placeholder="https://… ou une adresse e-mail" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setLink(null)} />
          </label>
          <button type="submit" className="rounded-full bg-pine-700 px-3 py-1.5 text-xs font-bold text-white">Valider</button>
          <button type="button" onClick={() => setLink(null)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600">Annuler</button>
        </form>
      )}

      {img && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 bg-amber-500/10 px-2 py-1.5 text-xs font-semibold text-neutral-700">
          Largeur de l&rsquo;image :
          {LARGEURS.map((w) => (
            <button key={w} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { img.style.width = `${w}%`; emit(); }} className={`rounded-lg border px-2 py-1 font-bold ${img.style.width === `${w}%` ? "border-amber-500 bg-white text-inkgreen" : "border-neutral-200 bg-white text-neutral-600"}`}>
              {w} %
            </button>
          ))}
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { img.remove(); setImg(null); emit(); }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 font-bold text-red-700">
            <Trash2 className="h-3.5 w-3.5" /> Supprimer l&rsquo;image
          </button>
        </div>
      )}

      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label="Message de la newsletter"
        contentEditable
        suppressContentEditableWarning
        className="min-h-72 max-h-[34rem] overflow-y-auto px-4 py-3 text-[15px] leading-relaxed text-inkgreen outline-none [&_a]:text-pine-700 [&_a]:underline [&_div]:mb-3 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-bold [&_img]:inline-block [&_img]:h-auto [&_img]:max-w-full [&_img]:cursor-pointer [&_img]:rounded-lg [&_img[data-sel]]:outline [&_img[data-sel]]:outline-2 [&_img[data-sel]]:outline-offset-2 [&_img[data-sel]]:outline-amber-500 [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6"
        onInput={emit}
        onKeyUp={saveSel}
        onMouseUp={saveSel}
        onBlur={saveSel}
        onClick={(e) => choisirImage(e.target instanceof HTMLImageElement ? e.target : null)}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          e.preventDefault();
          if (files.length) {
            saveSel();
            ajouterImages(files);
          } else {
            // Texte collé sans sa mise en forme d'origine (Word, pages web…) : le rendu reste maîtrisé.
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDrag(true);
          }
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          setDrag(false);
          const files = Array.from(e.dataTransfer.files);
          if (!files.length) return;
          e.preventDefault();
          // L'image se place là où elle est lâchée.
          const d = document as Document & { caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null };
          let r: Range | null = null;
          if (d.caretPositionFromPoint) {
            const p = d.caretPositionFromPoint(e.clientX, e.clientY);
            if (p) {
              r = document.createRange();
              r.setStart(p.offsetNode, p.offset);
            }
          } else if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (r && ref.current?.contains(r.startContainer)) {
            r.collapse(true);
            saved.current = r;
          }
          ajouterImages(files);
        }}
      />

      <p className="border-t border-neutral-200 bg-mist px-3 py-2 text-xs text-neutral-500">
        {uploading > 0 ? "Envoi de l'image…" : "Glissez-déposez une image dans le texte, ou collez-la. Cliquez sur une image pour régler sa largeur."}{" "}
        Variables :{" "}
        {props.variables.map((x) => (
          <button key={x.cle} type="button" title={`Insérer ${x.cle} (${x.description}) à l'endroit du curseur`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertText", x.cle)} className="mr-1 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-pine-700 ring-1 ring-neutral-200 hover:bg-amber-500/15">
            {x.cle}
          </button>
        ))}
      </p>
    </div>
  );
}
