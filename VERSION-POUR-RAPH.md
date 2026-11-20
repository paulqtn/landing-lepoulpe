# Version pour Raph — passation de contexte

> Fichier de reprise pour une nouvelle fenêtre de contexte. Il complète et **remplace
> partiellement** `CONTEXT.md` (plus ancien) : en cas de contradiction, c'est ce fichier
> qui fait foi. Dernière mise à jour : 20 novembre 2026.

## 1. Le projet en deux mots

Site vitrine + tunnel de devis + back office pour MGK, vendeur de garde-corps en verre.
Marque affichée : **Garde-Corps Verre**. Repo `paulqtn/landing-lepoulpe`, **branche unique
`claude/practical-sagan-rxfixu`** auto-déployée sur Vercel à chaque push. L'utilisateur
(Raph) itère par petites demandes : il fournit maquettes et images **en les poussant sur le
git** (fichiers aux noms à espaces/accents dans `public/`), on branche, on vérifie, on pousse.

**Décision stratégique récente : le site est recentré 100 % verre.** Les pages matériaux
(`/garde-corps/verre`, `/aluminium`, `/inox`) et leurs 24 combinaisons sont dépubliées,
redirigées en permanent dans `next.config.ts`. La colonne « Matériaux » du footer est
remplacée par « Informations » (guides + 4 pages légales). La page `/garde-corps/verre`
ne doit **jamais** être re-liée depuis le contenu.

## 2. Boucle de travail obligatoire

1. `git pull --no-rebase origin claude/practical-sagan-rxfixu` (session parallèle possible,
   uploads de Raph fréquents).
2. Modifier, puis `npm run build` (le build fait office de typecheck ; **pas d'ESLint** —
   le lancer déclenche une installation interactive, ne pas le faire).
3. Vérifier sur rendu réel : serveur `PORT=47xx nohup npm run start` + script Playwright
   (voir pièges §6), captures desktop `1440×…, deviceScaleFactor:2` et mobile `390×844`.
4. Commit en français avec, en fin de message, les lignes d'attribution imposées par le
   système (Co-Authored-By + Claude-Session), puis push avec la boucle :
   `for i in 1 2 3 4; do git push … && break; git fetch && git rebase origin/… ; sleep $((2**i)); done`.
5. Envoyer les captures à Raph (SendUserFile) avec un récap court.

Un stop-hook refuse les fichiers non suivis : ne jamais laisser traîner un `server.log`
ou autre à la racine (les scripts vont dans le scratchpad de session).

## 3. Stack et conventions techniques

- **Next.js 15 App Router + TypeScript + Tailwind v4.** Tokens dans `globals.css`
  (`pine-*` vert #175a3b, `amber-500` #f6a723, `mist` #f4f6f5, `inkgreen` #0d1f17).
  La ligne `@custom-variant hover (&:hover);` dans `globals.css` est **critique**.
- **Moteur de prix confidentiel** : `src/lib/calculateur/engine.ts` (marge ×1,75),
  strictement server-only. `/api/estimation` renvoie du sanitisé. Ne jamais exposer.
- **Images** : tout upload de Raph est converti en **WebP kebab-case** dans `public/`
  (sharp, quality 85-92), l'original à espaces est retiré (`git rm`). Si la source est
  plus petite que le besoin retina de l'emplacement (~2× la taille CSS), appliquer le
  **traitement anti-flou** : `resize({width:2000-2227, kernel:'lanczos3'})` +
  `sharpen({sigma:~1, m1:0.5-0.6, m2:0.35-0.4})`. Après remplacement d'une image,
  `rm -rf .next/cache/images`.
- **Icônes** : lucide-react d'abord ; sinon petits composants SVG maison dans
  `usage-blocks.tsx` (précédents : MainCouranteIcon, HauteurAllegeIcon,
  FenetreCroisillonsIcon, PiecesIcon, FixationSolIcon, BouclierFeuilleIcon). Raph peut
  aussi fournir les icônes en PNG : les passer en **fond transparent** (boucle raw RGBA,
  blanc>243 → alpha 0) et les poser « en fondu », sans carte ni cadre.
- **Playwright** préinstallé (`require('playwright')`, Chromium `--no-sandbox` géré).
  `playwright-core` est installé dans le scratchpad au besoin.
- **Démo/CRM** : espaces `/commercial` (complet), `/admin` (redirection), `/logistique`
  (à faire) ; Postgres optionnel avec mode démo sans base. Codes : `ADMIN_ACCESS_CODE`
  partagé (défaut dans `src/lib/admin/auth.ts`), identité vendeur par cookie signé.

## 4. Architecture des pages « par usage » (le cœur du travail actuel)

Trois fichiers :

- **`src/lib/catalog.ts`** — une entrée par usage (piscine, escalier, balcon, terrasse,
  mezzanine, fenetre, interieur, exterieur). Champs notables :
  - `title` (court : fil d'Ariane + « Votre garde-corps de X, chiffré en 1 minute ») et
    **`h1?`** (H1 SEO découplé, utilisé par le hero seul).
  - `metaTitle` + **`metaTitleIsAbsolute?: true`** (sert le title sans le suffixe
    « | Garde-Corps Verre » — utilisé sur balcon).
  - `intro` (texte du hero), `faq` (alimente l'accordéon **et** le JSON-LD FAQPage,
    automatiquement synchrones).
  - Les entrées matériaux existent encore comme **source de contenu** (FAQ homepage,
    regroupement des kits) mais ne sont plus publiées (`allCatalog = [...usages]`,
    `combos = []`).
- **`src/app/garde-corps/[slug]/usage-blocks.tsx`** — `USAGE_BLOCKS` : le contenu des
  blocs sous le générateur, par usage. Blocs **facultatifs** du gabarit :
  - `vue` : comparateur avant/après (`kind:"compare"`, `ariaLabel?`) ou image ; `points` ;
    `footnote?` (note éditoriale discrète avant le CTA, balcon).
  - `formes` (escalier), `norme?`, `matiere?` (anciens blocs génériques, encore utilisés
    par piscine/escalier/fenêtre/intérieur/extérieur).
  - `solidite?` : photo badgée + **accordéon exclusif** (details name=, premier ouvert) +
    CTA ; options `imageRight?: true` et `cta.checks?` (coches facultatives).
  - `dimensions?` (fenêtre) : en-tête gauche + accordéon + photo droite + CTA + points +
    note NF italique.
  - `systeme?` (fenêtre) : photo gauche + 2 modes de pose (images fournies par Raph,
    `public/pose-tableau.webp`, `pose-facade.webp`, grandes ~100×80 dans des rangées
    compactes py-2.5) + note support (`ancrage.webp`) + CTA pleine largeur.
  - `valeur?` (mezzanine) : grille 3 zones (titre / photo / contenu) pour que la photo
    passe **sous le H2 en mobile** ; desktop photo gauche étirée du kicker au CTA
    (alignements 0 px vérifiés) ; cards compactes ; `object-[center_30%]` mobile.
  - `durable?` (balcon) : badge + titre souligné SVG + 3 arguments + photo (médaillon
    supprimé).
  - `video?` : bloc « Une pose simple » (composant `YouTubeLite`, youtube-nocookie,
    façade cliquable). **`beforeFaq?: true`** le place juste avant la FAQ.
  - `realisations?` : galerie 3 cards (mêmes `beforeFaq?`).
  - `faqTitle`.
  - **Archive** : `BALCON_FIXATIONS_ARCHIVE` (sélecteur de pose FixationPoses retiré de
    la page balcon, réactivable en une ligne).
- **`src/app/garde-corps/[slug]/page.tsx`** — rendu commun. Ordre des sections :
  générateur → vue → solidite → valeur → durable → formes → fixations → video(haut) →
  realisations(haut) → systeme… puis norme → matiere → kits → video(beforeFaq) →
  realisations(beforeFaq) → FAQ → CTA final. Constantes `PISCINE_KICKER/H2/CTA`.

Composants notables : `BeforeAfterSlider` (cadre 16/9 fixe, clavier, labels),
`FixationPoses` (archivé), `YouTubeLite`, `PageHero` (H1 + badge Direct usine).

## 5. État actuel page par page

- **Balcon** (`/garde-corps/balcon`) — H1 « Garde-corps en verre pour balcon », title SEO
  absolu « …sur mesure | Direct usine », intro courte. Comparateur + 3 points + footnote
  éditoriale (sans lien). Bloc « conçu pour durer » (photo homme accoudé retraitée,
  « Résistance anti-chute », 88.4 / 500 kg par m²). Vidéo `EXIJ5lMdFtM`. Réalisations.
  FAQ 5 questions (prix ≈ 300 €/ml à partir de 10 m). norme/matiere supprimés.
- **Terrasse** — Bloc « Solidité & sécurité » (accordéon 4 items, photo gauche badgée
  `terrasse-solidite.webp`, coches conservées, pictos : vitrages/goujon/bouclier-coche/
  bouclier-feuille). Vidéo beforeFaq. Réalisations beforeFaq. FAQ 6 questions. norme et
  matiere supprimés.
- **Mezzanine** — H1 « Garde-corps en verre pour mezzanine ». Bloc « La sécurité d'un
  véritable garde-corps » (solidite imageRight sans coches, photo contre-plongée
  `mezzanine-norme.webp`, 4e carte : conformité NF P01-012/013 + 500 kg/m²). Bloc
  « valeur ajoutée » complet (photo `mezzanine-valorisation.webp`). Réalisations.
  FAQ 5 questions. matiere supprimé.
- **Fenêtre** — Comparateur (nouvelle photo après). Bloc « Dimensions & pose »
  (accordéon 4 items aux pictos dessinés, photo cotée `fenetre-dimensions.webp`, note
  NF P01-012). Bloc « Le système de fixation » (icônes fournies en fondu). **norme et
  matiere génériques encore présents** après ces blocs. FAQ : les 6 questions… sont
  celles d'origine (pas encore refaites par Raph).
- **Piscine** (`/barriere-piscine-verre`) — H1 « Barrière de piscine en verre », bloc
  NF P90-306, réalisations, comparateur. FAQ 6 questions refaite.
- **Escalier** — norme avec photo enfant, FAQ 6 questions refaite.
- **Intérieur / Extérieur** — comparateurs branchés, blocs norme/matiere génériques,
  FAQ d'origine. Hero intérieur = photo « après » (ancien archivé
  `ancien-heroes-interieur.webp`).
- **Site-wide** — comparateurs avant/après sur les 8 pages (16/9 strict) ; CTA final
  « gratuit et sans engagement » sur sa propre ligne ; footer 3 colonnes avec
  « Informations » ; pages légales `/mentions-legales`, `/politique-de-confidentialite`,
  `/cgv`, `/gestion-des-cookies` **en noindex avec des champs [à compléter]** ;
  redirections matériaux dans `next.config.ts` (synchro avec le commentaire de
  `catalog.ts`).

## 6. Pièges connus (appris à la dure)

- **Serveur fantôme** : un vieux `next-server` peut squatter le port et servir l'ancien
  build (EADDRINUSE silencieux dans nohup). Toujours `pkill -9 -f "next-server"` avant de
  relancer, et en cas de doute vérifier le HTML servi (`curl | grep`) ou repartir d'un
  `rm -rf .next && npm run build`.
- **Playwright** : jamais de screenshot avant une interaction synthétique (drag du
  comparateur) ; pour un clip fullPage ajouter `window.scrollY` ; locators stricts
  (`text=` matche aussi le CTA final « sans engagement », les summary du menu, etc.) ;
  pas d'apostrophes typographiques non échappées dans les scripts inline.
- **Édits de masse dans usage-blocks.tsx** : les blocs se répètent (norme ×N, matiere ×N).
  Cibler par occurrence awk (`c==3`) et vérifier les bornes avant `sed -i 'a,bd'`.
- **naturalWidth trompeur** : avec srcset, le navigateur reporte la taille corrigée de
  densité — sonder l'optimiseur avec curl pour connaître les vrais pixels servis.
- Le H1 ne doit jamais repasser par `entry.title` (il nourrit d'autres textes).
- Raph écrit vite : « retitre » peut vouloir dire « retire », demander/annoncer son
  interprétation quand les deux lectures divergent fortement.

## 7. En attente / prochaines étapes probables

- **Raph doit fournir** : textes légaux réels (puis retirer le noindex des 4 pages),
  vraies photos de chantiers pour les blocs réalisations (3 par page), photo dédiée du
  bloc système fenêtre (actuellement `comparateur-fenetre-apres` en placeholder),
  éventuels blocs avis (le bloc valeur mezzanine devra alors se caler juste au-dessus).
- **FAQ encore d'origine** : fenêtre, intérieur, extérieur, homepage.
- **Pages fenêtre/intérieur/extérieur** : probable refonte des blocs norme/matiere comme
  sur les autres pages, aux maquettes de Raph.
- **Back office** : `/logistique` (mécanique prête dans `src/lib/admin/logistics.ts`,
  UI de référence au commit `2010e5e`) et `/admin` gérant.
- Divers proposés non tranchés : codes d'accès individuels par commercial, analytics du
  tunnel, base Postgres Vercel + variables Resend réelles.
