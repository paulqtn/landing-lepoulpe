# Back office MGK — `/admin`

CRM léger intégré au site : demandes de devis, envoi automatique du devis par
email, relances programmées, suivi commercial.

## Mise en route (Vercel)

1. **Base de données** — Vercel → projet → **Storage → Create Database → Postgres (Neon)**,
   lier au projet. La variable `POSTGRES_URL` est injectée automatiquement.
   Les tables se créent toutes seules au premier accès.
2. **Code d'accès** — variable `ADMIN_ACCESS_CODE` (défaut : celui du calculateur,
   `CALC_ACCESS_CODE`, sinon `MGK-2026` — à changer absolument en prod).
   Optionnel : `ADMIN_SECRET` (chaîne aléatoire) pour signer les sessions.
3. **Emails (devis auto + relances)** — créer un compte [Resend](https://resend.com),
   vérifier le domaine d'envoi, puis définir :
   - `RESEND_API_KEY`
   - `EMAIL_FROM` → ex. `MGK Garde-corps <devis@votre-domaine.fr>`
   Sans ces variables, rien ne casse : les envois sont marqués « non configurés »
   et se font à la main depuis chaque fiche.
4. **Cron des relances** — déjà déclaré dans `vercel.json` (tous les jours à 7h UTC).
   Vercel l'active au prochain déploiement. Optionnel : `CRON_SECRET` pour
   verrouiller l'endpoint (Vercel l'envoie automatiquement s'il est défini).

## Fonctionnement

- Chaque formulaire du site (générateur, fiches produit) enregistre le lead avec
  ses réponses, sa source et l'estimation affichée.
- Si une estimation existe : **email de devis envoyé automatiquement** et
  première **relance programmée à J+2** ; deuxième relance à J+5 après la
  première ; arrêt après 2 relances ou dès que le statut passe à Gagné/Perdu.
- `/admin` : tableau de bord (KPI, relances dues), liste filtrable, fiche lead
  (projet configuré, estimation, historique, notes, changement de statut,
  envoi devis/relance en un clic, programmation de relance).

## Pipeline des statuts

`Nouveau → Devis envoyé → Relancé ×1 → Relancé ×2 → Gagné / Perdu`
(+ « À rappeler » pour la prise de RDV téléphonique).
