# Back office MGK — `/admin`

CRM léger intégré au site : demandes de devis, envoi automatique du devis par
email, relances programmées, suivi commercial.

## Mise en route (Vercel)

1. **Base de données** — intégration Neon PostgreSQL liée au projet (`POSTGRES_URL` /
   `DATABASE_URL` injectées automatiquement). Le schéma est créé et mis à jour tout seul
   par les **migrations versionnées** de `src/lib/admin/migrations.ts` (table
   `schema_migrations`). Règle : ne jamais modifier une migration déployée, en ajouter une.
2. **Premier accès** — aucun identifiant n'existe dans le code. Définir dans Vercel la
   variable `ADMIN_SETUP_TOKEN` (valeur secrète, 12 caractères minimum), redéployer, puis
   ouvrir `/commercial` : l'écran propose de créer le **super-administrateur**. Une fois ce
   compte créé, l'écran d'initialisation disparaît et la variable peut être supprimée.
3. **Comptes et rôles** — le super-administrateur crée les autres comptes dans
   *Administration → Utilisateurs* : `superadmin` (tout + comptes), `admin` (tarifs,
   paramètres, diagnostic, RGPD), `commercial` (clients, devis, simulation).
   Mots de passe hachés (scrypt), sessions révocables de 12 h. Les anciennes variables
   `ADMIN_ACCESS_CODE`, `CALC_ACCESS_CODE`, `ADMIN_TEAM`, `ADMIN_SECRET` ne servent plus.
4. **Emails** — compte [Resend](https://resend.com), domaine vérifié, puis `RESEND_API_KEY`,
   `EMAIL_FROM` (ex. `MGK Garde-corps <devis@votre-domaine.fr>`) et `EMAIL_REPLY_TO`.
   Sans ces variables aucun e-mail ne part, et l'envoi d'un devis est refusé avec un message clair.
5. **Cron des relances** — déclaré dans `vercel.json` (tous les jours à 7h UTC). Définir
   `CRON_SECRET` pour verrouiller l'adresse.
6. **Vérification** — *Administration → Diagnostic* affiche l'état réel de la base, les
   migrations appliquées, le nombre de lignes par table et les services configurés.

## Ce qui se règle sans redéployer

- **Tarifs** (*Administration → Tarifs et paramètres*) : prix d'achat, coefficients et
  transports du générateur public et de la Simulation. Chaque publication crée une version
  (`price_versions`) avec motif, auteur et détail ; test d'impact avant publication ; retour
  arrière en un clic. Les règles de calcul restent dans le code.
- **Commissions** et **mentions de la société** (adresse, SIRET, TVA, conditions) reprises
  sur les devis.

## Devis

- Une demande du site **n'envoie plus aucun e-mail automatiquement**. Elle crée un
  **brouillon de devis** (`quotes`) calculé avec le moteur du site.
- *Devis à traiter → Relire et envoyer le devis* : propositions, lignes modifiables, aperçu
  et téléchargement PDF, puis envoi après **double validation** (fenêtre de confirmation +
  case à cocher ; le serveur revérifie le numéro et le destinataire).
- Un devis envoyé est figé ; « Créer une nouvelle version » en fait une copie modifiable.
- Les relances automatiques ne démarrent qu'après un envoi validé.

## RGPD

Sur chaque fiche client (rôles admin) : export des données de la personne, et
anonymisation définitive (les montants et statuts sont conservés pour les statistiques).

## Fonctionnement

- Chaque formulaire du site (générateur, fiches produit) enregistre le lead avec
  ses réponses, sa source et l'estimation affichée.
- Aucun envoi automatique : le devis part après validation manuelle (voir « Devis »),
  puis la première relance est programmée à J+2.
- `/admin` : tableau de bord (KPI, relances dues), liste filtrable, fiche lead
  (projet configuré, estimation, historique, notes, changement de statut,
  envoi devis/relance en un clic, programmation de relance).

## Pipeline des statuts

`Nouveau → Devis envoyé → Relancé ×1 → Relancé ×2 → Gagné / Perdu`
(+ « À rappeler » pour la prise de RDV téléphonique).

## v2 — CRM commercial

- **Score A/B/C** automatique (valeur du projet, intention, signaux, engagement) ;
  recalculé à chaque ouverture d'email, clic ou consultation du devis.
- **Ma journée** (`/admin/jour`) : file de travail du commercial — leads A à appeler,
  signaux chauds (<48h), relances échues, click-to-call.
- **Devis en ligne** : chaque lead reçoit une page personnelle `/d/{token}` (devis,
  config, documents techniques, vidéo si renseignée) avec boutons **Valider**,
  **Être rappelé**, **Corriger mes cotes** (recalcul immédiat par le moteur).
  Chaque visite est tracée et nourrit le score.
- **Séquence email** : devis à J0 puis 3 relances (J+2, J+5, J+10) personnalisées
  par usage ; stop automatique dès engagement client ou statut final.
- **Webhooks Resend** (`/api/webhooks/resend`, secret `RESEND_WEBHOOK_SECRET`) :
  ouvertures/clics/bounces dans la timeline.
- **Équipe** : `ADMIN_TEAM="Prénom1,Prénom2"` active l'assignation (fiche + masse).
- **Actions en masse** (liste) : statut, assignation, relance immédiate.
- **Export CSV** : bouton sur la liste (respecte les filtres).
- `EMAIL_REPLY_TO` : adresse qui reçoit les réponses clients.
- **Démo** : bouton « Créer des leads de démo » sur le tableau de bord vide
  (tarifs calculés par le vrai moteur).
- Vidéos & fiches par système : à renseigner dans `src/lib/admin/assets.ts`.
