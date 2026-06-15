-- Reset toutes les coordonnées pour forcer le re-géocodage via Google Maps
UPDATE lieux SET latitude = NULL, longitude = NULL;

-- Vérification
SELECT COUNT(*) as total,
       COUNT(latitude) as avec_coords,
       COUNT(*) - COUNT(latitude) as sans_coords
FROM lieux;
