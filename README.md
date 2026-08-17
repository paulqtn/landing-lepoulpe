# Garde-Corps Pro

Site **garde-corps en direct usine** (verre, aluminium, inox — sur-mesure &
kit), construit avec **Next.js (App Router)**, **TypeScript** et
**Tailwind CSS v4**. Direction visuelle « direct usine » : vert profond,
stickers ambre, configurateur de devis.

> L'ancien site Agence Le Poulpe est conservé dans l'historique git
> (commit `e75e0b5`).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production (≈80 pages statiques)
```

## Architecture (data-driven)

```
src/
├── app/
│   ├── page.tsx                    # accueil "direct usine"
│   ├── devis/                      # configurateur 5 étapes + estimation
│   ├── garde-corps/[slug]/         # 35 pages SEO : matériaux, usages, combos
│   ├── produits/[slug]/            # 12 fiches kits (prix €/ml)
│   ├── guides/[slug]/              # 20 guides experts
│   ├── api/lead/                   # réception des demandes de devis
│   └── sitemap.ts · robots.ts
├── components/                     # SiteHeader (méga-menus), Configurator…
└── lib/
    ├── catalog.ts                  # ★ 3 matériaux × 8 usages → 24 combos
    ├── pricing.ts                  # fourchettes €/ml (configurateur + pages)
    ├── guides.ts · products.ts     # registres
    └── content/                    # contenu rédigé par la flotte éditoriale
```

**Ajouter une page SEO** : ajouter un usage ou un matériau dans
`src/lib/catalog.ts` (les combos se génèrent), un guide dans
`src/lib/content/`, ou un produit dans `products-data.ts`. Le sitemap et les
menus suivent automatiquement.

**Leads** : le configurateur poste sur `src/app/api/lead/route.ts` — point
unique où brancher CRM / email / webhook.

## Roadmap SEO (vers 100+ pages)

- Pages types de pose (française, anglaise, autoportant…)
- Déclinaisons locales (garde-corps + ville/région)
- Séries de guides supplémentaires via le workflow `gc-content`
