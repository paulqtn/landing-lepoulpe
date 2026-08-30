import type { MetadataRoute } from "next";
import { allCatalog } from "@/lib/catalog";
import { guides } from "@/lib/guides";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { verres } from "@/lib/verres";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  });

  return [
    entry("/", 1),
    entry("/devis", 0.9),
    entry("/garde-corps", 0.8),
    entry("/produits", 0.8),
    entry("/guides", 0.7),
    ...allCatalog.map((e) => entry(`/garde-corps/${e.slug}`, e.kind === "combo" ? 0.7 : 0.8)),
    ...verres.map((v) => entry(`/verre/${v.slug}`, 0.7)),
    ...products.map((p) => entry(`/produits/${p.slug}`, 0.6)),
    ...guides.map((g) => entry(`/guides/${g.slug}`, 0.6)),
  ];
}
