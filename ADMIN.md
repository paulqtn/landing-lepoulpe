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
   Mots de passe hachés (scrypt), sessions révocables de 48 h. Les anciennes variables
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
- **Primes des commerciaux** (par mois civil) : 4 % de la marge brute des affaires signées,
  plus 150 € dès 110 000 € de CA HT puis 150 € par tranche de 10 000 € supplémentaire. Les
  quatre paramètres sont modifiables. La marge d'une affaire (vente HT − coût d'achat calculé
  par le moteur) est figée au passage à « Signé ». Le bloc de correction manuelle a été retiré
  de la fiche client (l'API `/api/admin/leads/[id]/marge` existe toujours). Règle de calcul : `src/lib/admin/prime.ts` (testée par `npm test`).
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
validé l'affaire (passage à « Signé », `leads.won_at`) : lancement J+1, découpe J+3,
façonnage J+6, prêt J+8, expédition J+10. Délais réglables dans *Tarifs et paramètres →
Commissions, délais et société*. Menus ajustables compte par compte dans *Utilisateurs*.

## Relances automatiques

Trois e-mails de relance partent après un devis **validé et envoyé** (jamais avant), par la
tâche quotidienne de `vercel.json`. Dans l'onglet *Relances*, les rôles d'administration
modifient l'objet, le texte et le bouton de chaque relance, les trois délais, et disposent
d'un aperçu, d'un envoi d'essai et d'un interrupteur général. Variables : `{prenom}`,
`{nom}`, `{montant}`, `{telephone}`, `{societe}`. La séquence s'arrête dès que l'affaire est
signée, non signée ou « à rappeler ». Code : `src/lib/admin/relances.ts` et `sequence.ts`.

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

## Parcours du commercial (prise → devis → signature)

Réglé après l'audit d'usage : 13 clics de la prise d'une demande à la commande atelier.

- **Prendre une demande** ouvre directement son devis (`ClaimButton`). La file est en haut de
  l'état des lieux.
- **Devis à traiter** (`listDevisATraiter`) : demandes nouvelles, clients « Devis à modifier »
  (en tête) et tout brouillon non envoyé d'une affaire ouverte. Même compteur dans les priorités.
- **Écran du devis** : un clic sur un niveau de prix l'applique ; bloc client replié (ouvert et
  signalé s'il manque l'e-mail) ; sur téléphone, barre fixe avec le total et « Envoyer » ; après
  l'envoi, « Devis suivant » et « Retour à la fiche ».
- **Préparer / refaire un devis** : s'il existe un brouillon il est rouvert ; sinon, s'il y a un
  devis envoyé, une nouvelle version en est tirée (niveau de prix conservé).
- **Fiche client** : barre d'actions (Appeler, Devis ou « Refaire le devis », « Conclure la
  vente » dès qu'un devis est parti, Note). La signature propose de créer la commande atelier
  dans la foulée. Un seul bloc « Relances par e-mail », score sur une ligne, coordonnées et
  commercial repliés ; relances et score masqués sur une affaire close.
- **Confirmations** : chaque action affiche un message en haut de l'écran (`Toasts.tsx`,
  fonction `toast()`).
- **Rappels** : raccourcis (demain, 3 jours, une semaine) et heure ; bouton « Appeler » dans la
  liste des relances.
- **Listes** : tri des clients (récents, anciens, montant, score), score du prospect affiché
  dans la liste et la vue Kanban, avec les jours sans action.
- **Retour** : le bouton de la fiche ramène à la liste d'où l'on vient (`SuiviNavigation`).
- **Sur téléphone**, le bouton du téléphone Ringover est dans la barre du haut (fixe) et non
  plus flottant.

## Téléphonie Ringover (téléphone intégré)

**Étape 1, en place : le SDK JavaScript seul** (`ringover-sdk`, gratuit, aucune clé).
Le SDK affiche l'application web Ringover (`app.ringover.com`) dans une fenêtre intégrée :
connexion, micro et appels se passent chez Ringover. Le back office ne voit jamais les
identifiants ; il reçoit des messages (connexion, sonnerie, décroché, raccroché) et peut
demander de composer un numéro.

- `src/components/admin/Telephone.tsx` : bouton flottant, fenêtre du téléphone, écoute des
  messages (uniquement ceux venant de `https://app.ringover.com`), bouton `BoutonAppeler`.
  Monté dans `BackOfficeShell` : présent sur toutes les pages, la fenêtre reste chargée d'une
  page à l'autre.
- **Activation par navigateur** : rien n'est chargé tant que la personne ne clique pas sur
  « Activer le téléphone » (préférence `mgk-telephone` du navigateur). Sans activation, le bouton
  « Appeler » des fiches reste un lien téléphonique classique.
- `src/lib/telephonie/numero.ts` : mise au format international des numéros (testé par `npm test`).
- **Journal des appels** : table `telephonie_appels` (un appel = un `call_id`), remplie en fin
  d'appel par `/api/admin/telephonie/appels`, avec une ligne dans l'historique de la fiche dont
  le numéro correspond. `/api/admin/telephonie/contact` retrouve le client d'un numéro entrant.
  Ces données viennent du navigateur du commercial (source `sdk`).
- **Micro** : le navigateur demande l'autorisation pour le site, qui la prête à la fenêtre
  Ringover (`allow="microphone"` posé par le SDK). Il faut https (c'est le cas sur Vercel).
  Aucun en-tête du site ne bloque le micro ni les fenêtres intégrées.
- Limites du SDK seul : il faut que le back office soit ouvert pour recevoir un appel ; pas
  d'enregistrement, de transcription ni de résumé ; passer de l'espace commercial à l'espace
  logistique recharge le téléphone.

**Étapes suivantes prévues** (rien n'est installé ni payé pour l'instant) :
1. *API REST* : clé `RINGOVER_API_KEY` dans Vercel, un fichier `src/lib/telephonie/ringover-api.ts`
   (jamais côté navigateur) pour relire les appels et compléter `telephonie_appels`.
2. *Webhooks* : une route `/api/webhooks/ringover` (signature vérifiée) qui écrit dans la même
   table avec la source `webhook` : les appels sont alors tracés même back office fermé.
3. *Résumés IA natifs (Empower)* : colonnes `resume` et `enregistrement_url` déjà prévues ;
   le résumé s'affichera dans l'historique de la fiche.

## Niveaux de prix réglables, et ce que voit chaque commercial

- **Niveaux de prix** : *Tarifs et paramètres → Commissions, délais et société → Niveaux de prix
  des devis*. Trois coefficients (plein tarif, remise, remise exceptionnelle = plancher), réservés
  aux administrateurs, contrôlés (décroissants, supérieurs à 1) et inscrits au journal. Paramètre
  `niveaux_prix`, valeurs de départ 1,7 / 1,6 / 1,5 (`src/lib/admin/niveaux-prix.ts`). Le coefficient
  du site public reste dans l'onglet « Tarifs du site ». Un devis déjà envoyé ne change pas.
- **Chacun ses vues** : un commercial ne voit que ses clients, ses devis, ses relances, ses
  affaires dans la vue Kanban et la production, et ses propres statistiques. Les fiches, devis,
  PDF et fichiers d'un collègue lui renvoient « introuvable » (`peutVoirFiche`, `voitTout` dans
  `src/lib/admin/auth.ts`). La file des demandes reste commune (lecture seule tant que la demande
  n'est pas prise). Les administrateurs voient toute l'équipe.
- **Primes** : tout ce qui est facturé sur le devis retenu compte dans la marge (4 % de la marge
  brute), lignes ajoutées à la main comprises.
- **File** : ordre d'arrivée strict, sans exception pour un client qui valide en ligne.

## Règles de vente (prix plancher, envoi, signature)

- **Prix plancher** (`refusPlancher`, `src/lib/admin/quotes.ts`) : contrôlé sur chaque proposition,
  au mètre (toute ligne en « ml » vaut au moins le plancher au mètre de sa fixation) et au total
  (au moins le projet complet au plancher). Les administrateurs ne sont pas limités. Limite connue :
  une ligne saisie sans l'unité « ml » n'est contrôlée que par le total.
- **Un seul envoi de prix** : le devis validé. Le bouton « e-mail d'estimation » a été retiré.
- **Envoyer un devis** passe toujours le client en « Devis envoyé », remet le compteur de relances
  à zéro et programme la première relance (sauf affaire déjà close).
- **Signé** : confirmation obligatoire ; il faut un devis envoyé (le dernier est retenu pour le
  chiffre et la prime), sauf pour un administrateur. **Non signé** : motif obligatoire
  (`MOTIFS_PERTE`, `leads.motif_perte`). Ni l'un ni l'autre en action groupée.
- **Relancé ×1/×2/×3** : posés uniquement par l'envoi d'une relance, jamais à la main.
- **Nouveau prospect** : si le client existe déjà dans la file ou chez un collègue, seul un
  administrateur peut créer une seconde fiche.
- Une validation du devis en ligne s'affiche en bandeau sur la fiche et dans la liste des rappels.

## Alertes, prospects saisis à la main, fichiers

- **Alertes** : le back office interroge le serveur toutes les 30 secondes (onglet visible) et
  affiche un message avec un son de cloche quand une demande arrive dans la file, ou quand un
  client valide son devis en ligne ou demande un rappel (son commercial et les administrateurs).
  Le bouton « Cloche » en haut coupe ou remet le son. `src/components/admin/Alertes.tsx`,
  `/api/admin/alerts`. Le navigateur n'autorise le son qu'après un premier clic sur la page.
- **Nouveau prospect** (*Clients → Nouveau prospect*) : pour un appel direct. Nom + téléphone ou
  e-mail suffisent ; la fiche est attribuée à celui qui la crée et ne passe pas par la file. Si
  fixation, longueurs et hauteur sont saisies, le projet est chiffré et le brouillon de devis créé.
  Un doublon (même e-mail ou téléphone) est signalé avant création.
- **Fichiers d'une fiche** : plans, photos, documents (PDF, images, DWG, DXF, Word, Excel), 10 Mo
  par fichier, 30 par fiche. Stockés en base par morceaux de 2 Mo (`lead_files`,
  `lead_file_chunks`) ; toujours servis en téléchargement. Ajout et suppression : commercial du
  client ou administrateur.
- **Remise et arrondis** : le chiffrage pose sur la ligne son total exact (`totalHt`) et le total
  au plein tarif (`normalHt`). Le devis vaut donc l'estimation du site au centime, et la remise
  apparaît à l'écran et sur le PDF (« Prix normal HT », « Remise commerciale »). Une ligne retouchée
  à la main perd ces deux valeurs.
- L'en-tête et le pied du site public ne s'affichent plus dans le back office.

## Supprimer un compte

*Administration → Utilisateurs → Supprimer* (super-administrateur). Le compte est retiré
définitivement ; ses clients sont remis dans la file ou confiés à un autre compte, au choix.
Aucune fiche, aucun devis ni aucun historique n'est supprimé. On ne peut pas supprimer son
propre compte ni le dernier super-administrateur. « Désactiver » reste possible pour bloquer
un accès sans rien retirer.

## Chiffrage et niveaux de prix d'un devis

Dans l'écran d'un devis (brouillon rattaché à une demande), le bloc **Chiffrage du projet**
reprend le projet du client (fixation, verre, teinte, longueurs, hauteur, code postal), que le
commercial peut corriger, et propose trois niveaux de prix : **plein tarif ×1,7**, **remise ×1,6**,
**remise exceptionnelle ×1,5** (`src/lib/admin/niveaux-prix.ts`). Le serveur recalcule la première
ligne du devis avec le moteur du site (`/api/admin/quotes/[id]/chiffrage`) ; une remise est écrite
sur le devis. Le niveau ×1,5 est le **prix plancher** : en dessous, l'enregistrement et l'envoi
sont refusés à un commercial (proposition principale), un administrateur n'est pas limité.
Le brouillon automatique reste au prix affiché sur le site (coefficient des tarifs, 1,75 par défaut).
Le générateur du site demande le **code postal du projet**, plus l'adresse.

## Qui peut agir sur une fiche

Statut, note, score, relances, coordonnées et devis d'un client ne se modifient que par
**son commercial** ou par un **administrateur** (`refusAction` dans `src/lib/admin/attribution.ts`,
appliqué par toutes les API). Un client non attribué doit d'abord être pris dans la file, dans
l'ordre d'arrivée ; pour les autres, la fiche et le devis s'affichent en lecture seule. Un client
déjà suivi ne change de mains que par son commercial ou un administrateur. L'export CSV d'un
commercial ne contient que ses clients (export complet : administrateurs), et chaque export est
inscrit au journal. Les coordonnées se corrigent sur la fiche ou dans un devis : la fiche fait
foi pour les relances. Toutes les dates s'affichent à l'heure de Paris.

## Fiche client : score du prospect et relances automatiques

- **Score du prospect** (au-dessus de la note commerciale) : niveau de 1 à 5 posé à la main —
  froid, tiède, qualifié, chaud, prêt à signer (`leads.niveau`, libellés dans
  `src/lib/admin/niveaux.ts`). Chaque changement est inscrit à l'historique. Il est distinct
  de la note A/B/C calculée automatiquement à l'arrivée de la demande.
- **Relances automatiques** : *Mettre en pause* (aucun e-mail ne part, `leads.sequence_pause_at`),
  *Reprendre*, *Supprimer les relances*, *Déclencher la séquence* (délais de l'onglet Relances)
  ou choisir la date de la prochaine relance. Le déclenchement exige qu'un devis ait été envoyé.
  API : `/api/admin/leads/[id]/sequence`.

## Newsletter (super-administrateur uniquement)

*Administration → Newsletter* : un e-mail envoyé aux clients des états cochés. Toujours
exclus : clients anonymisés, désinscrits, sans e-mail valide ; une adresse ne reçoit
l'e-mail qu'une fois. Chaque e-mail porte un lien de désinscription (`/desabonnement/…`,
effectif au clic de confirmation). Envoi par lots de 50 à partir d'une file en base
(`newsletters`, `newsletter_envois`) : il peut être mis en pause et repris sans doublon.
L'envoi exige une confirmation, et le serveur revérifie le nombre de destinataires.

Le message se rédige dans un éditeur mis en forme : styles (titre, sous-titre), taille, gras,
italique, souligné, couleur, alignement, listes, liens, images. Une image s'ajoute par
glisser-déposer, collage ou sélection ; elle est réduite à 1 200 px de large dans le navigateur,
enregistrée en base (`newsletter_images`) et servie par `/api/nl-image/<jeton>`. Le HTML est
toujours nettoyé par le serveur (`src/lib/admin/newsletter-html.ts`) : liste fermée de balises
et de styles, aucune image externe, aucun script. Un texte collé perd sa mise en forme d'origine.

## RGPD

Le bloc « Données personnelles » a été retiré de la fiche client. L'export et l'anonymisation
définitive restent disponibles côté serveur (`/api/admin/leads/[id]/rgpd`, rôles admin) pour
répondre à une demande d'un client ; le composant `RgpdActions` peut être remis sur la fiche.

## Fonctionnement

- Chaque formulaire du site (générateur, fiches produit) enregistre le lead avec
  ses réponses, sa source et l'estimation affichée.
- Aucun envoi automatique : le devis part après validation manuelle (voir « Devis »),
  puis la première relance est programmée à J+2.
- `/admin` : tableau de bord (KPI, relances dues), liste filtrable, fiche lead
  (projet configuré, estimation, historique, notes, changement de statut,
  envoi devis/relance en un clic, programmation de relance).

## Pipeline des statuts

`Nouveau → Devis envoyé → Relancé ×1 → Relancé ×2 → Signé / Non signé`
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

## Messagerie intelligente

Menu *Messagerie intelligente* (`/commercial/messagerie`). Chaque commercial connecte sa propre
boîte mail ; le back office la lit par IMAP, trie les messages avec l'IA et dépose des brouillons
de réponse dans le **vrai dossier Brouillons de la boîte** (visibles dans Outlook, Gmail, le
webmail et le téléphone). **Rien n'est jamais envoyé automatiquement** : l'envoi demande un clic
puis une confirmation, et passe par le SMTP de la boîte.

### Variables à poser dans Vercel

| Variable | Rôle | Obligatoire |
| --- | --- | --- |
| `MESSAGERIE_SECRET` | Clé de chiffrement des mots de passe et des jetons (32 caractères au minimum, aléatoires). Sans elle, aucune boîte ne peut être connectée. **Ne jamais la changer ensuite** : les identifiants enregistrés deviendraient illisibles (il faudrait reconnecter chaque boîte). | oui |
| `ANTHROPIC_API_KEY` | Clé du service d'IA (Claude). Sans elle, les boîtes se synchronisent mais ne sont ni triées ni suivies d'un brouillon. Facturation à l'usage, chez Anthropic. | pour l'IA |
| `MESSAGERIE_MODELE` | Modèle utilisé (défaut `claude-opus-5-5`). | non |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Bouton « Se connecter avec Google ». Sans elles, Gmail se connecte par mot de passe d'application. | non |
| `MICROSOFT_OAUTH_CLIENT_ID`, `MICROSOFT_OAUTH_CLIENT_SECRET` | Bouton « Se connecter avec Microsoft ». **Obligatoires pour Outlook et Microsoft 365**, qui refusent le mot de passe en IMAP. | pour Outlook |

Adresse de retour à déclarer chez Google et Microsoft :
`https://<domaine>/api/admin/messagerie/oauth/google/callback` et `…/oauth/microsoft/callback`.
Autorisations demandées : Google `https://mail.google.com/` ; Microsoft `IMAP.AccessAsUser.All`,
`SMTP.Send`, `offline_access`.

### Fonctionnement

- **Aucun e-mail n'est stocké en base.** Les messages, leurs pièces jointes et les brouillons
  sont lus et écrits directement dans la boîte mail, à chaque affichage. La base ne garde qu'un
  index sans contenu (`mail_messages`, migration 017) : la position du message dans la boîte
  (dossier, UID), sa date, des empreintes non réversibles (identifiant du message, fil,
  expéditeur) et les étiquettes du tri (catégorie, priorité, besoin de réponse, traité).
  `mail_drafts` ne contient qu'un repère : à quel message le brouillon répond et où il se
  trouve. Le journal ne note que la nature des actions.
- **Ce que cela implique** : chaque liste et chaque conversation ouvre une connexion à la boîte
  (comptez une à deux secondes selon le fournisseur) ; si la boîte ne répond pas, l'écran le
  dit et rien ne s'affiche. La recherche de texte est faite par le serveur de messagerie. Le
  résumé d'une conversation se demande à l'assistant, il n'est pas conservé.
- **Tables** : `mail_accounts` (une boîte par utilisateur, secret chiffré AES-256-GCM),
  `mail_messages` (index), `mail_drafts` (repères), `mail_jobs` (file de tâches), `mail_journal`.
- **Chaîne** (`src/lib/messagerie/pipeline.ts`) : synchronisation de l'index → lecture du
  message dans la boîte → étiquettes → contexte du CRM → rédaction → dépôt IMAP (`APPEND`,
  drapeau `\Draft`, en-têtes `In-Reply-To` et `References`) → cloche → validation humaine. Les
  points à vérifier avant l'envoi voyagent dans un en-tête du brouillon, retiré à l'envoi.
- **Tâches** : rien ne tourne en permanence sur Vercel. Les tâches sont inscrites en base et
  exécutées par lots : tant qu'un écran du back office est ouvert (toutes les 45 s sur la
  messagerie, toutes les 3 min ailleurs), au clic sur *Synchroniser*, et une fois par jour par
  la tâche planifiée `/api/admin/cron/messagerie` (offre Vercel gratuite ; à l'heure ou plus
  souvent avec Vercel Pro, en changeant `vercel.json`). Verrou en base (`FOR UPDATE SKIP
  LOCKED`), quatre essais avec délai croissant, puis échec visible sur le message.
- **Doublons** : un message est identifié par dossier + UIDVALIDITY + UID ; un seul brouillon
  en cours par message reçu ; un brouillon inchangé n'est pas redéposé (empreinte du contenu) ;
  une nouvelle version est déposée avant que l'ancienne soit retirée.
- **Brouillon modifié ailleurs** : le brouillon est relu dans la boîte à chaque ouverture, donc
  une modification faite dans Outlook ou sur le téléphone s'affiche telle quelle. Envoyé depuis
  un autre logiciel → message marqué répondu ; supprimé → repère retiré.
- **Message déplacé ailleurs** : un message sorti de la boîte de réception depuis un autre
  logiciel quitte l'index (il reste dans la boîte). Archivé depuis le back office, il reste
  consultable dans *Archives* quand le serveur indique sa nouvelle position.

### Sécurité et confidentialité

- Une boîte n'est lisible que par son propriétaire : aucune route ne prend l'identifiant d'une
  boîte en paramètre. L'administrateur voit l'état des connexions, jamais le contenu.
- Le contenu d'un e-mail est une donnée, jamais une consigne : il est neutralisé puis placé
  entre balises, les consignes ne sont que dans le message système, et l'IA n'a aucun outil
  (elle ne peut ni envoyer, ni modifier le CRM).
- Transmis à l'IA : le texte du message et du fil (tronqués), le nom du commercial, ses
  consignes, le texte *Ce que l'IA peut savoir sur l'entreprise*, et un extrait de la fiche du
  client (étape, projet, devis déjà envoyés, dernières notes). **Jamais** : pièces jointes,
  identifiants, tarifs d'achat, coefficients, marges. Les expéditeurs exclus par le commercial
  ne sont jamais transmis.
- HTML des e-mails nettoyé à l'enregistrement et affiché dans un cadre isolé sans script ;
  images distantes masquées par défaut ; pièces jointes relues dans la boîte à la demande, les
  fichiers exécutables étant refusés.
- Serveur de messagerie saisi par l'utilisateur : ports de messagerie seulement, adresses
  internes refusées.
- Conservation : la base ne contient aucun e-mail. L'index de tri est lui-même purgé au-delà de
  la durée fixée par l'administrateur (90 jours par défaut). Déconnecter une boîte efface ses
  identifiants et son index, et retire l'accès chez Google.
- Journal des actions : table `mail_journal` (connexion, envoi, tri corrigé, appel à l'IA…),
  sans objet ni destinataire.

### Tests

`npm test` couvre le chiffrement, les fournisseurs, les règles de tri et la neutralisation du
contenu. `npm run test:messagerie` rejoue le parcours complet en local (voir
`tests/messagerie/README.md`).
