# CONTEXT.md — Mémoire de travail de la session Claude Code

> Passation de contexte générée le 11 novembre 2026, en fin de session.
> Objectif : permettre à une nouvelle session de reprendre **exactement** où celle-ci s'arrête,
> sans accès à la conversation d'origine.
>
> Note d'honnêteté : le début de la session (plusieurs semaines de travail) a été compacté en
> résumé interne avant la rédaction de ce document. Les sections historiques ci-dessous combinent
> ce résumé (fiable mais condensé) et la fin de session (détaillée). Les incertitudes sont signalées.

---

## 1. Présentation générale du projet

- **Projet** : site vitrine + tunnel de devis + back office pour **MGK**, vendeur de
  **garde-corps en verre** en direct usine. Nom de marque affiché : **« Garde-Corps Verre »**
  (changé depuis « Garde-Corps Pro » ; modifiable en un point : `site.name` dans `src/lib/site.ts` —
  `legalName`, URL et email n'ont **pas** été changés).
- **Finalité** : générer des leads qualifiés (devis en 1 minute), les traiter commercialement
  (CRM multi-vendeurs), et préparer la production/logistique.
- **Public** : particuliers (piscine, terrasse, balcon, escalier…) + pros ; trafic mobile important.
- **Pages et parcours** :
  - Homepage : hero photo plein cadre + fondu blanc, générateur intégré, cards 3 fixations
    (bascule vers rendu détail au survol), bloc « prix d'usine » (panneau vert), bloc
    « Résistance & conformité NF » (P01-012/013), bloc « Atelier & technologie », guides, footer.
  - 8 pages usage `/garde-corps/{piscine,escalier,balcon,terrasse,mezzanine,fenetre,interieur,exterieur}`
    + 3 pages matériau (verre, aluminium, inox) via le même template `src/app/garde-corps/[slug]/page.tsx`.
  - 3 pages épaisseur `/verre/{66-4,88-4,1010-4}`, page kits `/kits-garde-corps-verre`.
  - Tunnel plein écran `/generateur` (tous les CTA y mènent ; `/devis` redirige dessus).
  - Page devis client `/d/{token}` (valider / être rappelé / corriger ses cotes).
  - **Espace commercial `/commercial`** (multi-vendeurs) — `/admin` redirige dessus.
  - Calculateur interne `/calculateur` (gaté par code, noindex).
- **Enjeux** : conversion maximale du tunnel, SEO sémantique (normes NF, maillage interne),
  identité visuelle vert sapin + ambre, mobile irréprochable.

## 2. Environnement technique

- **Stack** : Next.js 15 (App Router), TypeScript, Tailwind CSS v4 (`@theme` tokens), lucide-react,
  `pg` (Postgres), `sharp` (traitement d'images, dispo en dev), Resend (emails, via fetch).
- **Build/dev** : `npm run build` (≈ 100 pages statiques générées), `npm ci` après chaque
  redémarrage de conteneur (node_modules disparaît). Tests visuels : Playwright **installé dans le
  scratchpad** (`npm install playwright-core --no-save` dans le dossier scratchpad de la session),
  navigateur à `executablePath: '/opt/pw-browsers/chromium'`, `--no-sandbox`.
- **Déploiement** : Vercel, projet `landing-lepoulpe`, compte `paul-poulpe`. **La branche
  `claude/practical-sagan-rxfixu` est l'unique branche du repo et se déploie automatiquement.**
  Vérification des déploiements : `gh api repos/paulqtn/landing-lepoulpe/deployments` (+ statuses) —
  le proxy sortant bloque vercel.app et le domaine du site, donc pas de curl direct sur la prod.
- **Fichiers stratégiques** :
  - `src/app/globals.css` — tokens design (pine-50→950, amber-500 #f6a723 / amber-600 #dd8f0e,
    mist #f4f6f5, inkgreen #0d1f17) ; **ligne ~52 : `@custom-variant hover (&:hover);` (CRITIQUE,
    réactive le hover au tap mobile)** ; verrou tunnel `html:has(.funnel-lock)…` + masquage
    header/footer `body:has(.funnel-lock) > header/footer { display:none }` ; micro-UX
    (focus-visible ambre, ::selection marque).
  - `src/lib/site.ts` — identité, téléphone, `guarantees`.
  - `src/lib/catalog.ts` — entrées usages/matériaux (titres, intros ~110 caractères, bénéfices…).
  - `src/lib/verres.ts` — les 3 épaisseurs (intros raccourcies aussi).
  - `src/lib/calculateur/engine.ts` — **moteur de prix CONFIDENTIEL, server-only** (tarifs d'achat
    ×1,75, TVA…). Ne jamais exposer côté client ; `/api/estimation` ne renvoie que des champs
    client-safe.
  - `src/components/Configurator.tsx` — le générateur (cards ambre, étape longueurs à formes,
    adresse autocomplétée, mode `fullscreen` pour `/generateur`, reprise localStorage 7 j).
  - `src/components/FunnelHelp.tsx` — assistant d'aide scripté du tunnel (desktop uniquement),
    formulaire « Être rappelé » → lead `source: "rappel-generateur"` sans email.
  - `src/components/BeforeAfterSlider.tsx` — comparateur avant/après (voir §7, pièges).
  - `src/components/PageHero.tsx` — hero des pages internes (plein cadre desktop, bande photo
    mobile, hauteur desktop uniforme `lg:min-h-[36.5rem]`).
  - `src/app/garde-corps/[slug]/page.tsx` — template usage + sections spécifiques piscine.
  - **Back office** : `src/app/commercial/*` (layout, page, devis, clients[+id], relances,
    pipeline, production, stats), `src/components/admin/*` (AdminLogin, CommercialNav, ClaimButton,
    LeadsTable, LeadActions, LogisticsActions, ui), `src/lib/admin/*` (db, demo, auth, team,
    compens, scoring, sequence, mail, statuts, logistics), APIs `src/app/api/admin/*`
    (login, logout, leads, bulk, export, seed-demo, cron, logistics, claim).
- **Variables d'environnement** (aucune valeur secrète ici) : `POSTGRES_URL`/`DATABASE_URL`
  (sans elle → **mode démo** : lectures servies par `src/lib/admin/demo.ts` + jeux démo de
  `logistics.ts`, écritures no-op signalées), `ADMIN_ACCESS_CODE` (code d'accès back office —
  défaut codé en dur dans `src/lib/admin/auth.ts`), `ADMIN_SECRET`, `ADMIN_TEAM`
  (ex. `Paul,Sophie` ; défaut démo `Sophie,Karim` dans `team.ts`), `COMMISSION_PCT` (déf. 5),
  `OBJECTIF_MENSUEL` (déf. 30000), `PRIME_OBJECTIF` (déf. 500), `RESEND_API_KEY`, `EMAIL_FROM`,
  `EMAIL_REPLY_TO`, `RESEND_WEBHOOK_SECRET`, `CRON_SECRET`, `CALC_ACCESS_CODE`.
- Postgres 16 local dispo pour tests (`pg_ctlcluster 16 main start`, user/db mgk/mgkdb) — non requis.

## 3. Historique des échanges et décisions (chronologie condensée)

Période compactée (résumé fiable) :
1. Construction du site complet (hero, sections, pages usage/épaisseur, kits, SXO piscine…).
2. **Essais de couleurs tous revertés** : palette 5 couleurs (« revert cette merde »), bouton noir
   premium (« revert »), rebrand bleu+cyan (« C'était mieux en vert »). **Décision définitive :
   vert sapin + ambre.** Ne plus proposer de rebrand.
3. Menus : hover **ambre** partout (pastille pleine sur déclencheurs, lavis `amber-500/15` sur
   items), icônes PNG usages, cartes d'aide en pointillés.
4. Cards fixations homepage : itérations photos → **rendus studio** (`fixation-{rail,pince,spider}.png`,
   niveaux vitres/socles harmonisés par script sharp) + **bascule au survol** vers les rendus détail
   (`fixation-*-hover.png`) via calque opaque + `loading="eager"` (exigence : « switch fluide »,
   « pas de filtre vert ni d'écriture sur l'image »).
5. Heroes : PageHero aligné sur la homepage (plein cadre + fondu) ; puis **mobile = bande photo en
   haut, texte sur fond uni** (référence fournie) ; intros limitées à **3 lignes mobile** ; les
   **2 CTA entiers dans le premier écran** ; hauteurs desktop **uniformisées** (585 px partout).
6. Tunnel `/generateur` : plein écran sans scroll ; sidebar → **stepper horizontal animé sur fond
   vert** (essai sidebar gauche rediscuté : l'horizontal est acté) ; barre basse fixe
   Retour/garanties/« Suivant » ambre + aide « Sélectionnez une option pour continuer » ;
   étapes validées cliquables ; reprise auto localStorage ; chip « Votre tarif est calculé — il
   s'affiche juste après » avant les coordonnées ; **assistant scripté desktop uniquement**
   (retiré du mobile sur demande).
7. Étape fixation : rendus détail plein cadre + stickers POSE FACILE / ÉCONOMIQUE / ARCHITECTURAL.
8. Étape longueurs : v1 schéma vu de dessus live → **rejetée (« trop d'infos »)** ; v2 actée :
   4 cards de forme (Ligne droite / En L / En U / 4 côtés +) + lignes de côtés + total, une colonne.
9. Dernière étape : **adresse complète autocomplétée** (API Adresse data.gouv, sans clé) remplaçant
   le champ CP — exigence : zéro friction mais plus de devis à retaper. `/api/lead` accepte les
   leads « rappel » sans email ; `mail.ts#send` ignore les destinataires sans email valide.
10. Menu « Type de fixation » : rendus studio + bascule détail au survol + stickers **remplaçant**
    les descriptions (« Discret / Économique / Architectural ») ; le contour épais au survol a été
    **retiré** (« trop ») → lavis standard `hover:bg-amber-500/15`.
11. Page piscine : H1 **« Barrière de piscine en verre »** (accord féminin automatisé dans les
    gabarits « chiffrée/estimée ») ; bloc **NF P90-306** (titre centré, 4 `<details name>` exclusifs
    + photo réelle `barriere-piscine-nf.webp`) ; bloc **« Nos réalisations »** (3 photos) ;
    « Pourquoi ce choix ? » et « Côté technique » **retirés sur piscine uniquement** ;
    section **comparateur avant/après** (voir §10).
12. Back office : v1 monolithique (Accueil + Commercial/Gestion/Stats) **construite puis scindée**
    sur demande → **espaces dédiés** : `/commercial` (fait), `/logistique` et `/admin` gérant
    (à venir) ; `/admin` redirige vers `/commercial`.
13. `/commercial` **multi-vendeurs** : identité à la connexion (select « Vous êtes » + code équipe
    partagé — il n'existe **pas** de code individuel ; l'utilisateur en est informé, évolution
    proposée), **pioche FIFO** des leads entrants, **commission/prime** sur la home, priorités du
    jour, Devis à traiter, Stats par commercial.
14. Divers : bloc « Comment ça marche » supprimé de la home ; sous-titres « Devis express »
    supprimés (usage + épaisseur) ; H2 « …à prix d'usine » (au lieu de « prix discount ») ;
    titre atelier = celui du schéma fourni (« Le savoir-faire d'un artisan, la précision des
    machines de pointe. ») avec accent **pine-600** (l'ambre a été refusé : « reste dans ce qu'on
    a fait partout »).

## 4. Travail réellement effectué (sélection structurante, chemins exacts)

- `src/app/page.tsx` : hero (bande mobile `h-60 sm:h-72` + fondu, desktop plein cadre), cards
  fixations avec `photoHover`, panneau prix d'usine responsive, bloc NF (glyphes SVG maison
  `GlyphHauteur/GlyphLargeur/GlyphPendule`), bloc Atelier (photo extraite du schéma
  `public/atelier-sur-mesure.jpg`), bloc Étapes supprimé.
- `src/components/Configurator.tsx` : recette `OPTION_ON/OPTION_OFF` (sélection/hover ambre),
  stepper horizontal fullscreen (fond pine-900 + pinegrid), footer fixe, reprise localStorage
  (`skipScroll` pour ne pas sauter au reload), `AddressField` (autocomplétion), accord des étapes.
- `src/app/generateur/page.tsx` : shell minimal `funnel-lock` + `<Configurator fullscreen note>`.
- `src/components/{FunnelHelp,BeforeAfterSlider,PageHero}.tsx` : créés/refondus (voir §2).
- Pages piscine : sections conditionnelles `entry.slug === "piscine"` dans
  `src/app/garde-corps/[slug]/page.tsx` (comparateur, NF P90-306, réalisations ; bénéfices/technique
  masqués). Données `NORME_PISCINE`, `REALISATIONS_PISCINE` en tête de fichier.
- Back office : tout `src/app/commercial/*`, libs `logistics.ts` (commandes/stock/expéditions +
  `globalStats`), `compens.ts` (commissions), `auth.ts` (cookie vendeur signé `REP_COOKIE`),
  migrations auto dans `db.ts` (tables `orders`, `stock_items`, `stock_moves`, `shipments`,
  colonne `leads.won_at` horodatée au passage « gagné »).
- Images : conversions WebP systématiques (sharp), noms propres sans espaces ; heroes usage
  `hero-usage-*.webp` ; placeholders comparateur `comparateur-piscine-{avant,apres}.webp`.
- `src/app/robots.ts` : disallow `/calculateur`, `/admin`, `/commercial`, `/logistique`, `/api/`.

## 5. État actuel du projet

- **TERMINÉ (vérifié par build + captures/tests Playwright)** : tout le site public décrit ci-dessus ;
  tunnel complet ; `/commercial` multi-vendeurs en mode démo ; redirection `/admin` ; robots.
- **IMPLÉMENTÉ MAIS NON VÉRIFIÉ** : comportement réel avec une base Postgres branchée en prod
  (le mode Postgres est codé et testé localement pour le CRM v1, mais les nouveautés — logistique,
  pioche, won_at — n'ont été exercées qu'en mode démo) ; envoi réel des emails Resend ; cron Vercel.
- **EN COURS** : remplacement des images du **comparateur avant/après piscine** — l'utilisateur
  doit uploader la vraie paire ; un watcher tourne (voir §10).
- **À FAIRE (demandé explicitement)** : espace **`/logistique`** (le back office du logisticien ;
  toute la mécanique orders/stock/expéditions existe déjà dans `logistics.ts` + UI de référence
  dans l'historique git du commit `2010e5e`) ; espace **`/admin` gérant**.
- **ENVISAGÉ (proposé, non validé)** : codes d'accès individuels par commercial
  (`ADMIN_TEAM="Nom:code,…"`) ; analytics du tunnel (événements par étape) ; navigation clavier
  du générateur ; écran de résultat enrichi ; préchargement des images d'étapes ; aria du stepper ;
  envoi du devis PDF ; réécriture contenus legacy kits.
- **BLOQUÉ / EN ATTENTE UTILISATEUR** : photos avant/après piscine ; photos dédiées pages
  aluminium (700×458) et inox (800×800) — seuls visuels encore faibles en plein cadre ;
  création de la base Postgres sur Vercel (l'utilisateur ne sait pas la créer : guide dans ADMIN.md) ;
  variables Resend/équipe/commissions réelles.

## 6. Design, UX et contraintes métier

- **DA définitive : vert sapin + ambre.** Accents de titre en italique `text-pine-600`
  (jamais ambre pour les titres). Ambre = action/choix (CTA, sélection, stickers, stepper actif).
- Sticker ambre : `bg-amber-500 text-pine-950 font-mono uppercase` (modèle « DIRECT USINE »).
- Hover d'option : `OPTION_OFF/ON` du Configurator (bord ambre + lavis + ombre teintée) ;
  menus : lavis `hover:bg-amber-500/15` **sans contour épais**.
- Cartes image : `rounded-[1.75rem] shadow-panel ring-1 ring-pine-950/10` + halo dégradé extérieur.
- **Titres de sections centrés** sur les pages usage (exigence récente explicite).
- Mobile : les 2 CTA du hero entiers au premier écran ; intros 3 lignes max ; pas d'assistant
  flottant ; pas de débordement horizontal ; claviers adaptés (`inputMode="decimal"` sur les cotes).
- Interdits appris : texte/filtre posé sur les images produits ; schéma surchargé à l'étape
  longueurs ; « trop d'infos à l'écran » ; promesses réglementaires non validées (garder la note
  « la conformité finale dépend du dimensionnement… » du bloc NF).
- **Moteur de prix et tarifs d'achat : confidentiels, server-only. Ne jamais les exposer.**
- Email du client (utilisateur du site) : ne jamais l'envoyer à des services tiers.
- Commits : messages en français descriptifs + lignes d'attribution imposées par l'environnement
  (voir le system-reminder de la session ; ne pas mettre d'identifiant de modèle dans le code).

## 7. Problèmes et enseignements de la session

- **Conteneur cloud éphémère** : à chaque redémarrage → `npm ci`, réinstaller playwright-core au
  scratchpad, re-fetch la branche. Un fichier non poussé est perdu.
- **Uploads GitHub de l'utilisateur** : arrivent avec espaces/accents dans les noms → toujours
  convertir/renommer (webp, noms kebab) puis `git rm` l'original ; l'upload peut mettre >3 min à
  apparaître (watcher en arrière-plan avec `git rev-list --count HEAD..origin/...`) ; il peut
  partir en double ; **l'utilisateur supprime parfois d'abord les anciens fichiers → le site
  en prod casse jusqu'au commit de raccord** (prévenir ou raccorder vite).
- **Cache images Next** : après remplacement d'un fichier image sous le même nom, `rm -rf
  .next/cache/images` avant de re-tester (sinon l'ancienne variante est servie).
- **Reprise localStorage du générateur** : restaurer l'étape déclenchait le `scrollIntoView` → la
  page « sautait au générateur » à l'actualisation. Correctif : ref `skipScroll` consommée par
  l'effet de recadrage. Ne pas retirer.
- **Transition vers le tunnel** : le footer flashait → règles CSS `body:has(.funnel-lock) >
  header/footer { display:none }` + CTA pointant directement `/generateur` (plus de hop `/devis`).
- **BeforeAfterSlider** : (a) `setPointerCapture` sur la poignée envoyait les `pointermove` à un
  élément sans écouteur → drag mort ; solution : écouteurs `window` le temps du drag.
  (b) `touch-none` sur tout le cadre bloquait le scroll vertical mobile → `touch-pan-y` cadre,
  `touch-none` poignée seule. (c) **Piège Playwright** : un `page.screenshot()` AVANT un drag
  synthétique fait échouer le drag silencieusement (aria reste à 50) — faire les interactions
  d'abord, les captures ensuite ; le composant lui-même fonctionne (prouvé par instrumentation).
- **Playwright divers** : `locator('button').first()` a cliqué le menu au lieu du bouton Entrer →
  toujours cibler par placeholder/texte précis ; coordonnées de clip `fullPage` = ajouter
  `window.scrollY` ; pas de TypeScript dans les scripts Node du scratchpad.
- **Exclusivité des accordéons** : attribut natif `name` sur `<details>` + `items-start` pour que
  l'image en face ne bouge pas.
- **API lead** : exige un email valide SAUF `source === "rappel-generateur"` avec téléphone ;
  `mail.ts#send` refuse proprement les destinataires sans email (ne pas « réparer » ça).
- **Vercel** : si un commit ne déclenche pas de build → commit vide « Trigger redeploy » ;
  vérifier via `gh api …/deployments` + statuses.
- Push GitHub : erreurs 500/403 transitoires → retry backoff 2/4/8/16 s (pattern dans tous les push).

## 8. État Git et environnement (au moment de la rédaction)

- Branche : `claude/practical-sagan-rxfixu`, **à jour avec origin** (0 commit d'écart), arbre
  propre avant création de ce fichier. Build : `npm run build` ✓ (100 pages).
- Derniers commits : `a7155df` (en-tête comparateur centré), `1eb1585` (section comparateur),
  `6bbbfef` (commercial multi-vendeurs), `4dd94c4` (scission back office), `2010e5e` (back office
  3 pôles — **contient l'UI Gestion réutilisable pour /logistique**), `be2f0db` (adresse
  autocomplétée), `0b6256d`/`619e59c` (étape longueurs), `47788ad` (étape fixation), etc.
- Processus de session (perdus au prochain conteneur, sans importance) : un `next start` de test
  et un watcher bash qui surveille l'arrivée des photos avant/après sur la branche.

## 9. Prochaines tâches et priorités

1. **Brancher les photos avant/après piscine** (dès upload utilisateur — PRIORITÉ, en attente).
   - Pull, inspecter noms/dimensions, convertir en WebP ~1600×900 (sharp, q~84), écraser
     `public/comparateur-piscine-avant.webp` et `public/comparateur-piscine-apres.webp`
     (le code ne change pas), `git rm` les originaux à espaces, `rm -rf .next/cache/images`,
     build, captures 50 %/drag + mobile, push. Critère : les deux photos visibles dans le
     comparateur en ligne, même cadrage.
2. **Espace `/logistique`** (demandé : « plus tard on fera /logistique »). Reprendre l'UI du
   commit `2010e5e` (`src/app/admin/gestion/page.tsx` de l'époque) au-dessus de
   `src/lib/admin/logistics.ts` (inchangé et prêt) : commandes atelier (workflow + décompte stock
   à la découpe), stock (engagé/prévisionnel/seuils/mouvements), expéditions (tournées qui
   propagent les statuts). Layout/auth sur le modèle de `/commercial` (AdminLogin réutilisable).
   Ajouter la nav croisée depuis `/commercial/production`.
3. **Espace `/admin` gérant** : vision globale (reprendre la home 3 pôles de `2010e5e` + stats
   complètes + réglages équipe/commissions). Remplacera la redirection actuelle.
4. **Comptes commerciaux individuels** (recommandé avant de payer des commissions sur ces chiffres) :
   format `ADMIN_TEAM="Nom:code,…"`, vérif par vendeur dans `auth.ts`/login.
5. En attente utilisateur : base Postgres Vercel (guide ADMIN.md), variables Resend + webhook,
   `ADMIN_TEAM`/`COMMISSION_PCT`/`OBJECTIF_MENSUEL`/`PRIME_OBJECTIF` réels, photos alu/inox,
   vidéos de pose et fiches PDF (`src/lib/admin/assets.ts`), mentions légales devis.
6. Optimisations proposées non validées : analytics tunnel, navigation clavier générateur,
   écran résultat enrichi, préchargement étapes, aria stepper.

## 10. Dernier état de notre conversation

- **Dernière séquence** : création de la section « Sécurisez votre piscine sans gâcher la vue »
  (comparateur avant/après) selon un cahier des charges détaillé fourni par l'utilisateur —
  implémentée, testée (drag souris prouvé par instrumentation, clavier, mobile sans débordement),
  poussée (`1eb1585`). Puis demande : **« garde la logique des titres centrés sur la page »** →
  en-tête centré, poussé (`a7155df`). L'utilisateur a annoncé : **« je vais t'ajouter après sur le
  git les photos avant après »**.
- **Ce qui restait en cours** : attendre l'upload des deux photos et les brancher (procédure
  exacte en §9.1). Un watcher bash tournait en arrière-plan (il meurt avec le conteneur ; la
  nouvelle session peut simplement `git fetch` ou relancer un watcher).
- **Prochaine action concrète** : vérifier si les photos sont arrivées
  (`git fetch origin claude/practical-sagan-rxfixu && git log HEAD..origin/… --stat`) ;
  si oui → §9.1 ; sinon → reprendre la file des tâches (§9.2) ou attendre.

## 11. Instructions pour la prochaine session

- **Lire d'abord** : ce fichier, puis `src/app/globals.css` (tokens + variantes critiques),
  `src/components/Configurator.tsx`, `src/app/garde-corps/[slug]/page.tsx`,
  `src/lib/admin/{db,logistics,compens,auth}.ts`, `ADMIN.md`.
- **Règles à respecter** : palette vert+ambre non négociable ; titres centrés sur les pages
  usage ; accents de titres en pine-600 ; moteur de prix server-only ; messages de commit en
  français + lignes d'attribution de l'environnement ; après CHAQUE changement : build → test
  Playwright (captures) → commit → push (retry backoff) → envoyer les captures à l'utilisateur.
- **Ne pas remettre en question sans demande explicite** : stepper horizontal du tunnel, étape
  longueurs simple (pas de schéma), assistant desktop-only, suppression des blocs génériques sur
  piscine, redirection `/admin`.
- **Avant toute modif** : `git fetch` + `merge --ff-only` (l'utilisateur pousse des uploads
  directement sur la branche) ; vérifier que `node_modules` existe (`npm ci` sinon).
- **Ordre de reprise** : §10 (photos) puis §9 dans l'ordre.

## 12. REPRISE IMMÉDIATE — INSTRUCTIONS POUR LA NOUVELLE SESSION

1. **Situation** : site + tunnel + espace `/commercial` multi-vendeurs terminés et en ligne
   (mode démo sans base). Dernier chantier : comparateur avant/après sur la page piscine,
   livré avec des images placeholders explicites.
2. **Objectif immédiat** : brancher les vraies photos avant/après dès qu'elles sont sur le git,
   sinon enchaîner sur l'espace `/logistique`.
3. **À consulter en premier** : ce fichier ; `git log --oneline -15` ;
   `src/app/garde-corps/[slug]/page.tsx` (section comparateur) ;
   `src/components/BeforeAfterSlider.tsx`.
4. **Première action** : `npm ci` si besoin, puis
   `git fetch origin claude/practical-sagan-rxfixu && git log --stat HEAD..origin/claude/practical-sagan-rxfixu`
   pour voir si les photos sont arrivées. Si oui : procédure §9.1. Si non : démarrer §9.2
   (`/logistique`) ou demander à l'utilisateur.
5. **Vigilance** : conteneur éphémère (réinstaller deps + playwright scratchpad) ; purger
   `.next/cache/images` après remplacement d'images ; interactions Playwright AVANT les
   screenshots ; uploads utilisateur à renommer/convertir ; ne jamais exposer le moteur de prix.
6. **Réussite** : build vert, captures desktop+mobile conformes envoyées à l'utilisateur,
   commit poussé sur `claude/practical-sagan-rxfixu`, déploiement Vercel `success`.
