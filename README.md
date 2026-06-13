# Le Poulpe — Landing pages

Landing pages pour [Agence Le Poulpe](https://www.agencelepoulpe.fr/), construites
avec **Next.js (App Router)**, **TypeScript** et **Tailwind CSS v4**.

L'identité visuelle est articulée autour de l'orange de la marque
**`RGB(252, 96, 36)` / `#FC6024`** (palette `poulpe-50` → `poulpe-950`).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

Autres commandes :

```bash
npm run build    # build de production
npm run start    # serveur de production
```

## Structure

```
public/
├── images/             # images du site → servies sur /images/...
└── README.md           # conventions d'usage des fichiers statiques
src/
├── app/
│   ├── layout.tsx      # <html>, polices, métadonnées SEO
│   ├── page.tsx        # 1re landing page (assemblage des sections)
│   ├── globals.css     # tokens de design + palette de marque (@theme)
│   └── icon.svg        # favicon (poulpe)
├── components/
│   ├── Logo.tsx        # marque "poulpe" + wordmark
│   ├── layout/         # Header, Footer
│   ├── sections/       # Hero, Services, Approach, Process, Stats…
│   └── ui/             # primitives réutilisables (Button, Container…)
└── lib/
    └── site.ts         # source unique : marque, nav, contenus partagés
```

## Ajouter une nouvelle landing page

Le projet est pensé pour passer à l'échelle. Pour une nouvelle page, créez une
route dans `src/app/` et réutilisez les sections :

```tsx
// src/app/landing-seo/page.tsx
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
// …

export default function Page() {
  return (
    <>
      <Header />
      <main>{/* sections réutilisées / spécialisées */}</main>
    </>
  );
}
```

## Charte couleur

| Token         | Hex       | Usage                        |
| ------------- | --------- | ---------------------------- |
| `poulpe-500`  | `#fc6024` | Couleur de marque principale |
| `poulpe-600`  | `#ed490f` | États survolés / accents     |
| `ink`         | `#0c0f14` | Surfaces sombres / titres    |

Toutes les nuances sont disponibles en classes Tailwind
(`bg-poulpe-500`, `text-poulpe-600`, `ring-poulpe-200`, …).
