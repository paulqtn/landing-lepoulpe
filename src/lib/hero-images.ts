import fs from "node:fs";
import path from "node:path";
import type { MaterialSlug } from "./pricing";

/**
 * Emplacements d'images du hero (côté serveur, résolu au build).
 *
 * Déposez simplement vos photos dans public/images/hero/ sous le nom du
 * matériau — verre.jpg, aluminium.jpg, inox.jpg (ou .webp/.png) — et elles
 * remplacent automatiquement les placeholders au déploiement suivant.
 */

const EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

export function heroImageSrc(material: MaterialSlug): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `/images/hero/${material}${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}
