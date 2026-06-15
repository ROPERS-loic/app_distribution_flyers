-- ══════════════════════════════════════════════════════════════════
--  NOUGATERIE DU PONT D'ARC — Base Supabase
--  Coller ce script dans : Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════


-- ══════════════════════════════════════
--  1. TABLE : UTILISATEURS
--     Liée à auth.users (système d'auth Supabase)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS utilisateurs (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom       TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  role      TEXT NOT NULL DEFAULT 'distributeur'
              CHECK (role IN ('admin', 'distributeur')),
  telephone TEXT,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ══════════════════════════════════════
--  2. TABLE : LIEUX (points de distribution)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS lieux (
  id          SERIAL PRIMARY KEY,
  nom         TEXT NOT NULL,
  categorie   TEXT,          -- Hôtel, Camping, Office de tourisme, etc.
  adresse     TEXT,
  code_postal TEXT,
  ville       TEXT,
  latitude    DECIMAL(10, 7),
  longitude   DECIMAL(10, 7),
  telephone   TEXT,
  email       TEXT,
  notes       TEXT,
  actif       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ══════════════════════════════════════
--  3. TABLE : TOURNEES
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS tournees (
  id              SERIAL PRIMARY KEY,
  nom             TEXT NOT NULL,
  date            DATE NOT NULL,
  distributeur_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  statut          TEXT DEFAULT 'planifiee'
                    CHECK (statut IN ('planifiee','en_cours','terminee','annulee')),
  secteur         TEXT,
  commentaire     TEXT,
  date_creation   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ══════════════════════════════════════
--  4. TABLE : POINTS_TOURNEE (arrêts dans une tournée)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS points_tournee (
  id                      SERIAL PRIMARY KEY,
  tournee_id              INTEGER NOT NULL REFERENCES tournees(id) ON DELETE CASCADE,
  lieu_id                 INTEGER NOT NULL REFERENCES lieux(id) ON DELETE RESTRICT,
  ordre_passage           INTEGER NOT NULL,
  quantite_flyers         INTEGER DEFAULT 0,
  statut                  TEXT DEFAULT 'a_faire'
                            CHECK (statut IN ('a_faire','distribue','ferme','refus','absent')),
  heure_validation        TIMESTAMP WITH TIME ZONE,
  photo_preuve            TEXT,   -- URL Supabase Storage
  commentaire_distributeur TEXT,
  latitude_validation     DECIMAL(10, 7),
  longitude_validation    DECIMAL(10, 7),
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ══════════════════════════════════════
--  5. TRIGGER : updated_at automatique
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lieux_updated_at
  BEFORE UPDATE ON lieux
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER points_updated_at
  BEFORE UPDATE ON points_tournee
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ══════════════════════════════════════
--  6. ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════
ALTER TABLE utilisateurs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lieux           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournees        ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_tournee  ENABLE ROW LEVEL SECURITY;

-- Helper : est-ce que l'utilisateur connecté est admin ?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM utilisateurs
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ── UTILISATEURS ──────────────────────
-- Chacun voit son propre profil ; admin voit tout
CREATE POLICY "u_select" ON utilisateurs
  FOR SELECT USING (auth.uid() = id OR is_admin());

-- Création du profil à l'inscription
CREATE POLICY "u_insert" ON utilisateurs
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Modification : soi-même ou admin
CREATE POLICY "u_update" ON utilisateurs
  FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Suppression : admin uniquement
CREATE POLICY "u_delete" ON utilisateurs
  FOR DELETE USING (is_admin());


-- ── LIEUX ─────────────────────────────
-- Lecture : tout utilisateur connecté
CREATE POLICY "l_select" ON lieux
  FOR SELECT USING (auth.role() = 'authenticated');

-- Écriture : admin uniquement
CREATE POLICY "l_insert" ON lieux
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "l_update" ON lieux
  FOR UPDATE USING (is_admin());

CREATE POLICY "l_delete" ON lieux
  FOR DELETE USING (is_admin());


-- ── TOURNÉES ──────────────────────────
-- Admin voit tout ; distributeur voit ses tournées
CREATE POLICY "t_select" ON tournees
  FOR SELECT USING (distributeur_id = auth.uid() OR is_admin());

-- Création et modification : admin uniquement
CREATE POLICY "t_insert" ON tournees
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "t_update" ON tournees
  FOR UPDATE USING (is_admin());

CREATE POLICY "t_delete" ON tournees
  FOR DELETE USING (is_admin());


-- ── POINTS_TOURNÉE ────────────────────
-- Admin voit tout ; distributeur voit les points de ses tournées
CREATE POLICY "pt_select" ON points_tournee
  FOR SELECT USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM tournees t
      WHERE t.id = tournee_id AND t.distributeur_id = auth.uid()
    )
  );

-- Insertion : admin uniquement (lors de la création de tournée)
CREATE POLICY "pt_insert" ON points_tournee
  FOR INSERT WITH CHECK (is_admin());

-- Mise à jour : admin OU distributeur assigné (pour valider)
CREATE POLICY "pt_update" ON points_tournee
  FOR UPDATE USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM tournees t
      WHERE t.id = tournee_id AND t.distributeur_id = auth.uid()
    )
  );

CREATE POLICY "pt_delete" ON points_tournee
  FOR DELETE USING (is_admin());


-- ══════════════════════════════════════
--  7. REALTIME (suivi en direct)
-- ══════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE tournees;
ALTER PUBLICATION supabase_realtime ADD TABLE points_tournee;


-- ══════════════════════════════════════
--  8. INDEX (performance)
-- ══════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_tournees_distributeur ON tournees(distributeur_id);
CREATE INDEX IF NOT EXISTS idx_tournees_date         ON tournees(date);
CREATE INDEX IF NOT EXISTS idx_points_tournee        ON points_tournee(tournee_id);
CREATE INDEX IF NOT EXISTS idx_points_lieu           ON points_tournee(lieu_id);
CREATE INDEX IF NOT EXISTS idx_points_statut         ON points_tournee(statut);
CREATE INDEX IF NOT EXISTS idx_lieux_ville           ON lieux(ville);
CREATE INDEX IF NOT EXISTS idx_lieux_categorie       ON lieux(categorie);


-- ══════════════════════════════════════
--  9. COMPTE ADMIN INITIAL
--     À exécuter APRÈS avoir créé le compte admin via l'interface
--     Remplace 'VOTRE-UUID-ICI' par l'UUID trouvé dans Authentication → Users
-- ══════════════════════════════════════
-- INSERT INTO utilisateurs (id, nom, email, role)
-- VALUES (
--   'VOTRE-UUID-ICI',
--   'Loic Ropers',
--   'ropersloic@gmail.com',
--   'admin'
-- );
-- (décommenter et exécuter après création du compte)


-- ══════════════════════════════════════
--  FIN DU SCRIPT
--  Prochaine étape : créer le bucket Storage "photos-distribution"
--  dans Supabase → Storage → New bucket → nom: photos-distribution → Public: NON
-- ══════════════════════════════════════
