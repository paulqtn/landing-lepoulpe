/* ================================================================== */
/*  Migrations versionnées de la base. Chaque entrée est appliquée     */
/*  une seule fois, dans l'ordre, et consignée dans schema_migrations. */
/*  RÈGLES : ne jamais modifier une migration déjà déployée — en       */
/*  ajouter une nouvelle à la fin. Aucune migration ne supprime de     */
/*  données.                                                           */
/* ================================================================== */

export type Migration = { id: string; sql: string };

export const MIGRATIONS: Migration[] = [
  {
    // Schéma historique, repris à l'identique (idempotent : IF NOT EXISTS).
    id: "001_socle_crm",
    sql: `
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        source TEXT,
        answers JSONB,
        estimation_ttc NUMERIC,
        statut TEXT NOT NULL DEFAULT 'nouveau',
        relances INT NOT NULL DEFAULT 0,
        next_relance_at TIMESTAMPTZ,
        assigned_to TEXT
      );
      CREATE TABLE IF NOT EXISTS lead_events (
        id SERIAL PRIMARY KEY,
        lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        type TEXT NOT NULL,
        message TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_leads_statut ON leads(statut);
      CREATE INDEX IF NOT EXISTS idx_leads_next_relance ON leads(next_relance_at);
      CREATE INDEX IF NOT EXISTS idx_events_lead ON lead_events(lead_id);
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS score TEXT NOT NULL DEFAULT 'C';
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_points INT NOT NULL DEFAULT 0;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS token TEXT;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS opens INT NOT NULL DEFAULT 0;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS clicks INT NOT NULL DEFAULT 0;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS devis_views INT NOT NULL DEFAULT 0;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_token ON leads(token);

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ref TEXT UNIQUE NOT NULL,
        lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
        client TEXT NOT NULL,
        statut TEXT NOT NULL DEFAULT 'a_preparer',
        ml NUMERIC,
        nb_verres INT,
        hauteur TEXT,
        verre TEXT,
        systeme TEXT,
        montant_ttc NUMERIC,
        departement TEXT,
        shipment_id INT
      );
      CREATE TABLE IF NOT EXISTS stock_items (
        id SERIAL PRIMARY KEY,
        sku TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        categorie TEXT NOT NULL,
        unite TEXT NOT NULL,
        qty NUMERIC NOT NULL DEFAULT 0,
        seuil NUMERIC NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS stock_moves (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        item_id INT NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        delta NUMERIC NOT NULL,
        motif TEXT
      );
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ref TEXT UNIQUE NOT NULL,
        transporteur TEXT,
        departement TEXT,
        date_prevue DATE,
        statut TEXT NOT NULL DEFAULT 'planifiee'
      );
      CREATE INDEX IF NOT EXISTS idx_orders_statut ON orders(statut);
    `,
  },
  {
    // Comptes, sessions, paramètres, journal des modifications, index de volume, RGPD.
    id: "002_comptes_parametres_audit",
    sql: `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'commercial')),
        password_hash TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMPTZ,
        created_by TEXT
      );
      CREATE UNIQUE INDEX idx_users_email ON users (lower(email));
      CREATE UNIQUE INDEX idx_users_name ON users (lower(name));

      CREATE TABLE sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX idx_sessions_expires ON sessions(expires_at);

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_by TEXT
      );

      CREATE TABLE audit_log (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        actor TEXT,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        before JSONB,
        after JSONB
      );
      CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
      CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);

      ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(lower(email));
      CREATE INDEX IF NOT EXISTS idx_leads_statut_created ON leads(statut, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_events_lead_created ON lead_events(lead_id, created_at DESC);
    `,
  },
  {
    // Tarifs et paramètres de calcul, versionnés (une ligne = une version publiée).
    id: "003_versions_de_tarifs",
    sql: `
      CREATE TABLE price_versions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        engine TEXT NOT NULL CHECK (engine IN ('site', 'simulation')),
        created_by TEXT,
        note TEXT NOT NULL,
        changes JSONB,
        data JSONB NOT NULL
      );
      CREATE INDEX idx_price_versions_engine ON price_versions(engine, id DESC);
    `,
  },
  {
    // Devis détaillés (propositions et lignes) et historique des simulations.
    id: "004_devis_et_simulations",
    sql: `
      CREATE SEQUENCE quote_ref_seq START 1;
      CREATE TABLE quotes (
        id SERIAL PRIMARY KEY,
        ref TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
        statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoye', 'annule')),
        origine TEXT NOT NULL DEFAULT 'manuel',
        created_by TEXT,
        updated_by TEXT,
        client JSONB NOT NULL,
        options JSONB NOT NULL,
        total_ht NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_ttc NUMERIC(12,2) NOT NULL DEFAULT 0,
        price_version INT,
        sent_at TIMESTAMPTZ,
        sent_by TEXT,
        sent_to TEXT,
        snapshot JSONB
      );
      CREATE INDEX idx_quotes_lead ON quotes(lead_id);
      CREATE INDEX idx_quotes_statut ON quotes(statut, created_at DESC);

      CREATE TABLE simulations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by TEXT,
        lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
        label TEXT NOT NULL,
        input JSONB NOT NULL,
        result JSONB NOT NULL,
        price_version INT,
        total_ht NUMERIC(12,2),
        total_ttc NUMERIC(12,2)
      );
      CREATE INDEX idx_simulations_created ON simulations(created_at DESC);
    `,
  },
  {
    // Menus accessibles par utilisateur (NULL = sélection de départ du rôle).
    id: "005_menus_par_utilisateur",
    sql: `ALTER TABLE users ADD COLUMN menus JSONB;`,
  },
  {
    // Nouveau rôle : logisticien (espace /logistique).
    id: "006_role_logisticien",
    sql: `
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'commercial', 'logisticien'));
    `,
  },
  {
    // Vente HT, coût d'achat et marge brute figés quand l'affaire est gagnée (base des primes).
    id: "007_marge_des_affaires",
    sql: `
      ALTER TABLE leads ADD COLUMN vente_ht NUMERIC(12,2);
      ALTER TABLE leads ADD COLUMN cout_achat NUMERIC(12,2);
      ALTER TABLE leads ADD COLUMN marge_brute NUMERIC(12,2);
      ALTER TABLE leads ADD COLUMN marge_source TEXT;
    `,
  },
  {
    // Date de rappel téléphonique convenue avec le client (distincte des relances par e-mail).
    id: "008_rappel_telephonique",
    sql: `
      ALTER TABLE leads ADD COLUMN rappel_at TIMESTAMPTZ;
      CREATE INDEX idx_leads_rappel ON leads(rappel_at) WHERE rappel_at IS NOT NULL;
    `,
  },
  {
    // Newsletter : campagnes, file d'envoi par destinataire, désinscription.
    id: "009_newsletter",
    sql: `
      ALTER TABLE leads ADD COLUMN newsletter_optout_at TIMESTAMPTZ;
      CREATE TABLE newsletters (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_by TEXT,
        sujet TEXT NOT NULL,
        corps TEXT NOT NULL,
        bouton TEXT NOT NULL DEFAULT '',
        lien TEXT NOT NULL DEFAULT '',
        statuts JSONB NOT NULL,
        total INT NOT NULL DEFAULT 0,
        termine_at TIMESTAMPTZ
      );
      CREATE TABLE newsletter_envois (
        newsletter_id INT NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
        lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        etat TEXT NOT NULL DEFAULT 'attente' CHECK (etat IN ('attente', 'en_envoi', 'envoye', 'echec')),
        erreur TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (newsletter_id, lead_id)
      );
      CREATE INDEX idx_newsletter_envois_etat ON newsletter_envois(newsletter_id, etat);
    `,
  },
  {
    // Newsletter mise en forme : corps en HTML (les anciennes campagnes restent en texte) et images hébergées.
    id: "010_newsletter_mise_en_forme",
    sql: `
      ALTER TABLE newsletters ADD COLUMN format TEXT NOT NULL DEFAULT 'texte' CHECK (format IN ('texte', 'html'));
      CREATE TABLE newsletter_images (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        mime TEXT NOT NULL,
        data BYTEA NOT NULL,
        bytes INT NOT NULL,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    // Score du prospect (1 à 5) posé par le commercial ; pause des relances automatiques.
    id: "011_score_prospect_et_pause_relances",
    sql: `
      ALTER TABLE leads ADD COLUMN niveau SMALLINT CHECK (niveau BETWEEN 1 AND 5);
      ALTER TABLE leads ADD COLUMN sequence_pause_at TIMESTAMPTZ;
    `,
  },
  {
    // Niveau de prix choisi pour un devis (coefficient appliqué au coût d'achat).
    id: "012_niveau_de_prix_du_devis",
    sql: `ALTER TABLE quotes ADD COLUMN coef NUMERIC(4,2);`,
  },
  {
    // Fichiers joints à une fiche client (plans, photos) : envoyés et stockés par morceaux.
    id: "013_fichiers_des_fiches",
    sql: `
      CREATE TABLE lead_files (
        id SERIAL PRIMARY KEY,
        lead_id INT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        mime TEXT NOT NULL,
        bytes INT NOT NULL,
        complete BOOLEAN NOT NULL DEFAULT false,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_lead_files_lead ON lead_files(lead_id);
      CREATE TABLE lead_file_chunks (
        file_id INT NOT NULL REFERENCES lead_files(id) ON DELETE CASCADE,
        idx INT NOT NULL,
        data BYTEA NOT NULL,
        PRIMARY KEY (file_id, idx)
      );
    `,
  },
  {
    // Motif d'une affaire non signée (choisi dans une liste fermée).
    id: "014_motif_de_non_signature",
    sql: `ALTER TABLE leads ADD COLUMN motif_perte TEXT;`,
  },
  {
    // Journal des appels téléphoniques (téléphone intégré aujourd'hui ; webhooks, enregistrements
    // et résumés pourront compléter les mêmes lignes, reconnues par call_id).
    id: "015_journal_des_appels",
    sql: `
      CREATE TABLE telephonie_appels (
        id SERIAL PRIMARY KEY,
        call_id TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT 'sdk',
        lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
        utilisateur TEXT,
        direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
        from_number TEXT NOT NULL DEFAULT '',
        to_number TEXT NOT NULL DEFAULT '',
        answered BOOLEAN NOT NULL DEFAULT false,
        ring_s INT NOT NULL DEFAULT 0,
        duree_s INT NOT NULL DEFAULT 0,
        enregistrement_url TEXT,
        resume TEXT,
        details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_telephonie_appels_lead ON telephonie_appels(lead_id);
    `,
  },
  {
    // Messagerie intelligente : boîte mail de chaque commercial, messages synchronisés, brouillons
    // préparés, file de tâches et journal. Les identifiants (colonne secret) sont chiffrés avant
    // écriture. Déconnecter une boîte supprime ses messages et ses brouillons du back office.
    id: "016_messagerie_intelligente",
    sql: `
      CREATE TABLE mail_accounts (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        nom TEXT NOT NULL DEFAULT '',
        fournisseur TEXT NOT NULL DEFAULT 'autre',
        auth TEXT NOT NULL DEFAULT 'password' CHECK (auth IN ('password', 'google', 'microsoft')),
        imap_host TEXT NOT NULL,
        imap_port INT NOT NULL,
        imap_secure BOOLEAN NOT NULL DEFAULT true,
        imap_user TEXT NOT NULL,
        smtp_host TEXT NOT NULL DEFAULT '',
        smtp_port INT NOT NULL DEFAULT 465,
        smtp_secure BOOLEAN NOT NULL DEFAULT true,
        secret TEXT NOT NULL,
        dossiers JSONB NOT NULL DEFAULT '{}',
        etat JSONB NOT NULL DEFAULT '{}',
        reglages JSONB NOT NULL DEFAULT '{}',
        statut TEXT NOT NULL DEFAULT 'ok' CHECK (statut IN ('ok', 'erreur')),
        erreur TEXT,
        last_sync_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE mail_messages (
        id SERIAL PRIMARY KEY,
        account_id INT NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
        dossier TEXT NOT NULL CHECK (dossier IN ('inbox', 'sent')),
        uid BIGINT NOT NULL,
        uidvalidity BIGINT NOT NULL,
        message_id TEXT NOT NULL DEFAULT '',
        in_reply_to TEXT,
        refs TEXT,
        fil TEXT NOT NULL DEFAULT '',
        from_nom TEXT NOT NULL DEFAULT '',
        from_email TEXT NOT NULL DEFAULT '',
        dest JSONB NOT NULL DEFAULT '{}',
        sujet TEXT NOT NULL DEFAULT '',
        date TIMESTAMPTZ NOT NULL DEFAULT now(),
        extrait TEXT NOT NULL DEFAULT '',
        corps TEXT,
        html TEXT,
        pieces JSONB NOT NULL DEFAULT '[]',
        lu BOOLEAN NOT NULL DEFAULT false,
        archive BOOLEAN NOT NULL DEFAULT false,
        statut TEXT NOT NULL DEFAULT 'a_traiter' CHECK (statut IN ('a_traiter', 'en_attente', 'traite')),
        lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
        categorie TEXT,
        priorite TEXT,
        besoin_reponse BOOLEAN,
        intention TEXT,
        resume TEXT,
        infos JSONB,
        langue TEXT,
        ia_at TIMESTAMPTZ,
        ia_manuel BOOLEAN NOT NULL DEFAULT false,
        ia_erreur TEXT,
        repondu_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (account_id, dossier, uidvalidity, uid)
      );
      CREATE INDEX idx_mail_messages_liste ON mail_messages(account_id, dossier, date DESC);
      CREATE INDEX idx_mail_messages_fil ON mail_messages(account_id, fil);
      CREATE INDEX idx_mail_messages_mid ON mail_messages(account_id, message_id);
      CREATE INDEX idx_mail_messages_lead ON mail_messages(lead_id);
      CREATE TABLE mail_drafts (
        id SERIAL PRIMARY KEY,
        account_id INT NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
        message_id INT REFERENCES mail_messages(id) ON DELETE SET NULL,
        dest TEXT NOT NULL DEFAULT '',
        cc TEXT NOT NULL DEFAULT '',
        sujet TEXT NOT NULL DEFAULT '',
        corps TEXT NOT NULL DEFAULT '',
        origine TEXT NOT NULL DEFAULT 'ia' CHECK (origine IN ('ia', 'manuel')),
        manquants JSONB NOT NULL DEFAULT '[]',
        statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoye', 'supprime')),
        entete_id TEXT,
        imap_uid BIGINT,
        imap_uidvalidity BIGINT,
        empreinte TEXT,
        imap_erreur TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        sent_at TIMESTAMPTZ
      );
      CREATE UNIQUE INDEX idx_mail_drafts_un_par_message ON mail_drafts(account_id, message_id) WHERE statut = 'brouillon' AND message_id IS NOT NULL;
      CREATE TABLE mail_jobs (
        id SERIAL PRIMARY KEY,
        account_id INT NOT NULL REFERENCES mail_accounts(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('sync', 'analyse', 'reponse', 'brouillon_imap')),
        ref_id INT NOT NULL,
        statut TEXT NOT NULL DEFAULT 'attente' CHECK (statut IN ('attente', 'en_cours', 'fait', 'echec')),
        tentatives INT NOT NULL DEFAULT 0,
        prochain_essai_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        verrou_jusqua TIMESTAMPTZ,
        erreur TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        fini_at TIMESTAMPTZ
      );
      CREATE UNIQUE INDEX idx_mail_jobs_sans_doublon ON mail_jobs(type, ref_id) WHERE statut IN ('attente', 'en_cours');
      CREATE INDEX idx_mail_jobs_file ON mail_jobs(account_id, statut, prochain_essai_at);
      CREATE TABLE mail_journal (
        id SERIAL PRIMARY KEY,
        user_id INT,
        email TEXT NOT NULL DEFAULT '',
        action TEXT NOT NULL,
        detail TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_mail_journal_user ON mail_journal(user_id, created_at DESC);
      -- Les comptes dont les menus ont été personnalisés reçoivent le nouveau menu s'ils suivent des clients.
      UPDATE users SET menus = menus || '["messagerie"]'::jsonb WHERE menus IS NOT NULL AND menus ? 'clients' AND NOT menus ? 'messagerie';
    `,
  },
  {
    // Messagerie : plus aucun contenu d'e-mail en base. Les messages et les brouillons sont lus et
    // écrits directement dans la boîte mail ; la base ne garde qu'un index sans contenu (position
    // du message dans la boîte, date, empreintes des identifiants, étiquettes du tri).
    // Cette migration retire donc volontairement les colonnes de contenu créées par la 016.
    id: "017_messagerie_sans_contenu",
    sql: `
      ALTER TABLE mail_messages
        DROP COLUMN message_id, DROP COLUMN in_reply_to, DROP COLUMN refs, DROP COLUMN from_nom, DROP COLUMN from_email,
        DROP COLUMN dest, DROP COLUMN sujet, DROP COLUMN extrait, DROP COLUMN corps, DROP COLUMN html, DROP COLUMN pieces,
        DROP COLUMN intention, DROP COLUMN resume, DROP COLUMN infos;
      ALTER TABLE mail_messages ADD COLUMN mid TEXT NOT NULL DEFAULT '';
      ALTER TABLE mail_messages ADD COLUMN irt TEXT;
      ALTER TABLE mail_messages ADD COLUMN exp TEXT NOT NULL DEFAULT '';
      ALTER TABLE mail_messages ADD COLUMN nb_pieces INT NOT NULL DEFAULT 0;
      ALTER TABLE mail_messages DROP CONSTRAINT mail_messages_dossier_check;
      ALTER TABLE mail_messages ADD CONSTRAINT mail_messages_dossier_check CHECK (dossier IN ('inbox', 'sent', 'archive'));
      CREATE INDEX idx_mail_messages_empreinte ON mail_messages(account_id, mid);
      ALTER TABLE mail_drafts DROP COLUMN dest, DROP COLUMN cc, DROP COLUMN sujet, DROP COLUMN corps, DROP COLUMN manquants, DROP COLUMN imap_erreur;
      -- Les lignes déjà synchronisées n'ont plus d'empreinte : l'index repart de zéro à la prochaine synchronisation.
      DELETE FROM mail_jobs;
      DELETE FROM mail_drafts;
      DELETE FROM mail_messages;
      UPDATE mail_accounts SET etat = '{}';
      -- Le journal ne garde que la nature des actions, plus aucun objet ni destinataire.
      UPDATE mail_journal SET detail = NULL;
    `,
  },
];
