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
- **Primes des commerciaux** (par mois civil) : 4 % de la marge brute des affaires gagnées,
  plus 150 € dès 110 000 € de CA HT puis 150 € par tranche de 10 000 € supplémentaire. Les
  quatre paramètres sont modifiables. La marge d'une affaire (vente HT − coût d'achat calculé
  par le moteur) est figée au passage à « Gagné » ; un administrateur peut la corriger sur la
  fiche client. Règle de calcul : `src/lib/admin/prime.ts` (testée par `npm test`).
- **Mentions de la société** (adresse, SIRET, TVA, conditions) reprises
  sur les devis.

## Référence chiffrée selon le choix du client

Règle unique (`src/lib/calculateur/correspondance.ts`, testée par `npm test`) pour le prix
du site, le devis automatique et la marge : pinces → GS-07-C, rail → GS-19-L, spider →
GS-02, « à me conseiller » → rail GS-19-L par défaut. L'épaisseur et la teinte du verre
choisies sont toujours prises en compte.

## Devis

- Une demande du site **n'envoie plus aucun e-mail automatiquement**. Elle crée un
  **brouillon de devis** (`quotes`) calculé avec le moteur du site.
- *Devis à traiter → Relire et envoyer le devis* : propositions, lignes modifiables, aperçu
  et téléchargement PDF, puis envoi après **double validation** (fenêtre de confirmation +
  case à cocher ; le serveur revérifie le numéro et le destinataire).
- Un devis envoyé est figé ; « Créer une nouvelle version » en fait une copie modifiable.
- Les relances automatiques ne démarrent qu'après un envoi validé.

## Espace logistique (`/logistique`)

Rôle **Logisticien** : il ne voit que ses menus — Tâches du jour, Commandes atelier, Stock,
Expéditions — et aucun montant. Les tâches partent de la date à laquelle le commercial a
validé l'affaire (passage à « Gagné », `leads.won_at`) : lancement J+1, découpe J+3,
façonnage J+6, prêt J+8, expédition J+10. Délais réglables dans *Tarifs et paramètres →
Commissions, délais et société*. Menus ajustables compte par compte dans *Utilisateurs*.

## Relances automatiques

Trois e-mails de relance partent après un devis **validé et envoyé** (jamais avant), par la
tâche quotidienne de `vercel.json`. Dans l'onglet *Relances*, les rôles d'administration
modifient l'objet, le texte et le bouton de chaque relance, les trois délais, et disposent
d'un aperçu, d'un envoi d'essai et d'un interrupteur général. Variables : `{prenom}`,
`{nom}`, `{montant}`, `{telephone}`, `{societe}`. La séquence s'arrête dès que l'affaire est
gagnée, perdue ou « à rappeler ». Code : `src/lib/admin/relances.ts` et `sequence.ts`.

Chaque relance a aussi une **heure d'envoi** (heure de Paris). Elle n'est tenue que si la
tâche passe toutes les heures, ce que Vercel réserve à l'offre Pro. Tant que `vercel.json`
garde un passage quotidien (`0 7 * * *`), les relances partent le bon jour, à ce passage.
Une fois en Pro : remplacer le planning par `0 * * * *` dans `vercel.json` — le code détecte
seul le passage en horaire (`src/lib/admin/cron-frequence.ts`). Ne pas le faire en offre
gratuite : le déploiement échouerait.

## Arrêt des relances quand le client est joint

Les e-mails automatiques ne partent **que** tant que l'affaire est en « Devis envoyé »,
« Relancé ×1 » ou « Relancé ×2 ». Tout autre statut les arrête, quel que soit le chemin
(fiche, action groupée, compte-rendu d'appel, demande de rappel du client).

Nouveaux statuts : **En discussion** (client eu au téléphone, échange en cours),
**En réflexion** (avec date de rappel), **Devis à modifier**. Sur la fiche client, le
bouton « J'ai appelé le client » enregistre l'issue de l'appel et règle le statut ; un
appel sans réponse laisse la séquence continuer. « Reprendre la séquence » la relance là
où elle s'était arrêtée. Les clients à rappeler apparaissent dans l'onglet Relances et
dans les priorités de l'accueil.

## Newsletter (super-administrateur uniquement)

*Administration → Newsletter* : un e-mail envoyé aux clients des états cochés. Toujours
exclus : clients anonymisés, désinscrits, sans e-mail valide ; une adresse ne reçoit
l'e-mail qu'une fois. Chaque e-mail porte un lien de désinscription (`/desabonnement/…`,
effectif au clic de confirmation). Envoi par lots de 50 à partir d'une file en base
(`newsletters`, `newsletter_envois`) : il peut être mis en pause et repris sans doublon.
L'envoi exige une confirmation, et le serveur revérifie le nombre de destinataires.

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
