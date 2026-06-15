-- ============================================================
-- SCRIPT : Ajout des codes postaux + reset coordonnées
-- À coller dans : https://supabase.com/dashboard/project/zxkukdugsvbhwucyxurx/sql/new
-- ============================================================

UPDATE lieux SET code_postal = '07150' WHERE ville = 'Vallon-Pont-d''Arc';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Salavas';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Sampzon';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Lagorce';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Labastide-de-Virac';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Ruoms';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Vagnas';
UPDATE lieux SET code_postal = '07700' WHERE ville = 'Saint-Rémèze';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Saint-Alban-Auriolles';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Pradons';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Grospierres';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Labeaume';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Chauzon';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Orgnac-l''Aven';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Bessas';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Balazuc';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Laurac-en-Vivarais';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Vogüé';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Largentière';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Montréal';
UPDATE lieux SET code_postal = '07260' WHERE ville = 'Rosières';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Saint-Maurice-d''Ardèche';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Rochecolombe';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Rocher';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Joannas';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Uzer';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Aubenas';
UPDATE lieux SET code_postal = '07140' WHERE ville = 'Les Vans';
UPDATE lieux SET code_postal = '30430' WHERE ville = 'Barjac';
UPDATE lieux SET code_postal = '07700' WHERE ville = 'Saint-Martin-d''Ardèche';
UPDATE lieux SET code_postal = '07700' WHERE ville = 'Bourg-Saint-Andéol';
UPDATE lieux SET code_postal = '07170' WHERE ville = 'Villeneuve-de-Berg';
UPDATE lieux SET code_postal = '07260' WHERE ville = 'Joyeuse';
UPDATE lieux SET code_postal = '07140' WHERE ville = 'Saint-Paul-le-Jeune';

-- Reset des coordonnées pour forcer un nouveau géocodage (plus précis maintenant)
UPDATE lieux SET latitude = NULL, longitude = NULL
WHERE code_postal IS NOT NULL
  AND latitude IS NOT NULL;

-- Vérification
SELECT ville, code_postal, COUNT(*) as nb
FROM lieux
GROUP BY ville, code_postal
ORDER BY ville;
