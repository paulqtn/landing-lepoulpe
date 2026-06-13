# Le Poulpe — Landing pages

Système de **landing pages de conversion** pour
[Agence Le Poulpe](https://www.agencelepoulpe.fr/), construit avec
**Next.js (App Router)**, **TypeScript** et **Tailwind CSS v4**.

Stratégie : des **ads → une page par mot-clé**, regroupées en deux familles
**SEO** et **SEA**. Chaque page est pensée comme un expert CRO (promesse forte,
preuve sociale, résultats chiffrés, garantie) et embarque un **générateur de
capture de lead** (lead magnet) que l'on rappelle ensuite.

Identité construite autour de l'orange de marque **`#FC6024`** (palette
`poulpe-50` → `poulpe-950`), avec un parti pris « dashboard premium » sur le
générateur.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
npm run start    # serveur de production
```

## Pages

| URL                              | Type | Contenu                          |
| -------------------------------- | ---- | -------------------------------- |
| `/landings`                      | hub  | Toutes les landings (SEO / SEA)  |
| `/seo/audit-seo-gratuit`         | SSG  | Landing phare (Audit SEO)        |
| `/sea/audit-sea-gratuit`         | SSG  | Audit Google Ads                 |
| `/sea/generation-de-leads`       | SSG  | Génération de leads              |
| `/api/lead`                      | API  | Réception des leads (POST)       |
| `/`                              | —    | Page agence d'origine            |

## Structure

```
src/
├── app/
│   ├── [category]/[slug]/page.tsx   # 1 route → 1 landing (SSG + metadata SEO)
│   ├── landings/page.tsx            # hub qui regroupe les landings
│   ├── api/lead/route.ts            # capture des leads (→ brancher le CRM)
│   ├── layout.tsx · globals.css     # design system + palette de marque
│   └── not-found.tsx · icon.svg
├── components/
│   ├── landing/                     # tout le système de landing
│   │   ├── LeadGenerator.tsx        # ★ générateur multi-étapes + récap "live"
│   │   ├── LandingTemplate.tsx      # assemble une landing depuis sa config
│   │   └── Landing*.tsx             # Hero, Proof, Results, Guarantee…
│   ├── Icon.tsx · Logo.tsx
│   └── ui/                          # primitives (Button, Container, Reveal…)
└── lib/
    ├── landings.ts                  # ★ registre : 1 entrée = 1 page mot-clé
    ├── generator.ts                 # types + moteur d'estimation du générateur
    └── site.ts                      # marque, contact, contenus partagés
```

## Ajouter une landing page (1 mot-clé)

Tout est piloté par la donnée : **ajoutez une entrée dans
`src/lib/landings.ts`** et la page est générée automatiquement à
`/<category>/<slug>` (avec ses métadonnées SEO).

```ts
const auditSeoLocal: Landing = {
  slug: "audit-seo-local",
  category: "seo",
  categoryLabel: "SEO",
  nav: { ctaLabel: "Audit SEO local" },
  meta: { title: "…", description: "…" },
  hero: { titleLead: "…", titleAccent: "…", subtitle: "…", bullets: [...], ctaPrimary: "…" },
  proof: { rating: "4,9/5", stats: [...], logos: [...] },
  results: { cases: [...] },        // résultats chiffrés
  benefits: { items: [...] },       // ce que le client obtient
  guarantee: { points: [...] },     // garantie / réassurance
  process: { steps: [...] },
  testimonials: [...],
  faq: [...],
  generator: { /* étapes du lead magnet + estimation */ },
  finalCta: { title: "…", subtitle: "…" },
};

// puis l'ajouter au registre :
export const landings = [auditSeoGratuit, /* … */ auditSeoLocal];
```

## Le générateur de leads

Composant `LeadGenerator` (réutilisable, piloté par `generator` dans la config) :

- **multi-étapes** avec barre de progression et navigation Retour / Continuer ;
- **panneau récap « live »** (style dashboard sombre) qui se remplit au fur et à
  mesure et affiche une **estimation dynamique** (ex. potentiel de trafic SEO,
  volume de leads SEA) ;
- **capture finale** (nom, email, téléphone + consentement) puis état de succès.

Types d'étapes : `single` (choix illustrés) et `input` (champ libre, ex. URL).
Le moteur d'estimation vit dans `src/lib/generator.ts` (`estimate: "seo" | "sea"`).

### Où vont les leads

Le formulaire envoie un `POST` vers **`src/app/api/lead/route.ts`**. C'est le
**point d'intégration unique** : y brancher un CRM, un email, un Google Sheet ou
un webhook (stratégie de rappel). Pour l'instant, l'endpoint valide et logge le
lead.

## Charte couleur

| Token        | Hex       | Usage                        |
| ------------ | --------- | ---------------------------- |
| `poulpe-500` | `#fc6024` | Couleur de marque principale |
| `poulpe-600` | `#ed490f` | États survolés / accents     |
| `flame`      | `#ff8a3d` | Accent chaud (dégradés)      |
| `ink`        | `#0b0d12` | Surfaces sombres / dashboard |

Nuances disponibles en classes Tailwind (`bg-poulpe-500`, `text-poulpe-600`,
`ring-poulpe-200`, `shadow-glow`, `rounded-4xl`…).
