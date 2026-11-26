# Tests d'intégration de la messagerie intelligente

Ces tests exercent le module de bout en bout sur une machine locale : vraie base PostgreSQL,
vrais protocoles IMAP et SMTP (serveurs de test en mémoire), service d'IA simulé. Rien ne sort
de la machine, aucun e-mail réel n'est envoyé. Le script refuse de tourner si la base ou le site
ne sont pas en `localhost`.

```bash
# 1. Serveurs de messagerie de test (deux boîtes IMAP, un SMTP qui note ce qu'il reçoit)
SMTP_LOG=/tmp/smtp.log node tests/messagerie/serveurs.cjs &

# 2. Le site, construit, avec le service d'IA simulé
npm run build
POSTGRES_URL=postgres://utilisateur:motdepasse@localhost:5432/base \
MESSAGERIE_SECRET=une-cle-de-test-de-plus-de-32-caracteres MESSAGERIE_HOTES_LOCAUX=1 \
ANTHROPIC_API_KEY=cle-de-test MOCK_IA_LOG=/tmp/ia.log MOCK_IA_PANNE=/tmp/ia-panne \
NODE_OPTIONS="--require ./tests/messagerie/simulateur-ia.cjs" PORT=3000 npm run start &

# 3. Le test (mêmes variables pour la base et les journaux)
POSTGRES_URL=postgres://utilisateur:motdepasse@localhost:5432/base BASE_URL=http://localhost:3000 \
SMTP_LOG=/tmp/smtp.log MOCK_IA_LOG=/tmp/ia.log MOCK_IA_PANNE=/tmp/ia-panne npm run test:messagerie
```

Relancez `serveurs.cjs` avant chaque passage : les boîtes de test repartent vides.

`MESSAGERIE_HOTES_LOCAUX=1` autorise la connexion à un serveur de messagerie local ; ce réglage
est ignoré en production. Les tests unitaires (`npm test`) ne demandent rien de tout cela.
