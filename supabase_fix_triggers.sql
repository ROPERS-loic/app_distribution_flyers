-- Correctif : supprime les triggers existants avant de les recréer
DROP TRIGGER IF EXISTS lieux_updated_at ON lieux;
DROP TRIGGER IF EXISTS points_updated_at ON points_tournee;

CREATE TRIGGER lieux_updated_at
  BEFORE UPDATE ON lieux
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER points_updated_at
  BEFORE UPDATE ON points_tournee
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
