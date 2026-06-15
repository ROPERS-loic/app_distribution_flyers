-- ══════════════════════════════════════════════════════════
--  CORRECTIF RLS — Supprime et recrée des politiques simples
--  Coller dans : Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════

-- 1. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "u_select"  ON utilisateurs;
DROP POLICY IF EXISTS "u_insert"  ON utilisateurs;
DROP POLICY IF EXISTS "u_update"  ON utilisateurs;
DROP POLICY IF EXISTS "u_delete"  ON utilisateurs;
DROP POLICY IF EXISTS "l_select"  ON lieux;
DROP POLICY IF EXISTS "l_insert"  ON lieux;
DROP POLICY IF EXISTS "l_update"  ON lieux;
DROP POLICY IF EXISTS "l_delete"  ON lieux;
DROP POLICY IF EXISTS "t_select"  ON tournees;
DROP POLICY IF EXISTS "t_insert"  ON tournees;
DROP POLICY IF EXISTS "t_update"  ON tournees;
DROP POLICY IF EXISTS "t_delete"  ON tournees;
DROP POLICY IF EXISTS "pt_select" ON points_tournee;
DROP POLICY IF EXISTS "pt_insert" ON points_tournee;
DROP POLICY IF EXISTS "pt_update" ON points_tournee;
DROP POLICY IF EXISTS "pt_delete" ON points_tournee;

DROP FUNCTION IF EXISTS is_admin();

-- 2. Politiques simples : tout utilisateur connecté peut tout lire/écrire
--    (on affinera la sécurité une fois que l'appli fonctionne)

-- UTILISATEURS
CREATE POLICY "u_select" ON utilisateurs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "u_insert" ON utilisateurs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "u_update" ON utilisateurs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "u_delete" ON utilisateurs FOR DELETE USING (auth.uid() IS NOT NULL);

-- LIEUX
CREATE POLICY "l_select" ON lieux FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "l_insert" ON lieux FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "l_update" ON lieux FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "l_delete" ON lieux FOR DELETE USING (auth.uid() IS NOT NULL);

-- TOURNÉES
CREATE POLICY "t_select" ON tournees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "t_insert" ON tournees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "t_update" ON tournees FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "t_delete" ON tournees FOR DELETE USING (auth.uid() IS NOT NULL);

-- POINTS_TOURNÉE
CREATE POLICY "pt_select" ON points_tournee FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pt_insert" ON points_tournee FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pt_update" ON points_tournee FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "pt_delete" ON points_tournee FOR DELETE USING (auth.uid() IS NOT NULL);
