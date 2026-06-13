# public/

Fichiers statiques servis **à la racine** du site.

Tout fichier placé ici est accessible directement par son chemin :

| Fichier                         | URL publique        |
| ------------------------------- | ------------------- |
| `public/images/hero.jpg`        | `/images/hero.jpg`  |
| `public/logo.svg`               | `/logo.svg`         |

## Convention

- Mettez les **images** dans `public/images/` (logos, photos, illustrations…).
- Utilisez de préférence le composant `next/image` pour l'optimisation :

  ```tsx
  import Image from "next/image";

  <Image src="/images/hero.jpg" alt="…" width={1200} height={800} />;
  ```

  Pour une image décorative qui doit remplir son conteneur, utilisez `fill` :

  ```tsx
  <Image src="/images/hero.jpg" alt="" fill className="object-cover" />;
  ```

## À noter

- Le **favicon** n'est pas ici : il est géré par convention App Router dans
  `src/app/icon.svg`.
- N'importez jamais un fichier de `public/` avec un chemin relatif : référencez-le
  toujours par son URL absolue (ex. `/images/hero.jpg`).
