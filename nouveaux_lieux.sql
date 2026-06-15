-- ============================================================
-- SCRIPT : Nouveaux lieux Ardèche
-- À coller dans : https://supabase.com/dashboard/project/zxkukdugsvbhwucyxurx/sql/new
-- ============================================================

-- 1. Reclasser les offices de tourisme existants
UPDATE lieux
SET type = 'office_tourisme'
WHERE LOWER(nom) LIKE '%office%tourisme%'
   OR LOWER(nom) LIKE '%office de tourisme%';

-- 2. Insérer les nouveaux lieux
INSERT INTO lieux (nom, ville, type, actif, pays, user_id) VALUES

-- ── VALLON-PONT-D'ARC ──────────────────────────────────────
('Office de Tourisme Sud Ardèche',        'Vallon-Pont-d''Arc', 'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Le Pont d''Arc',                        'Vallon-Pont-d''Arc', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Manoir du Raveyron',           'Vallon-Pont-d''Arc', 'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Les Stalagmites',                 'Vallon-Pont-d''Arc', 'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Clos des Bruyères',            'Vallon-Pont-d''Arc', 'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping International',                 'Vallon-Pont-d''Arc', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Rouvière',                   'Vallon-Pont-d''Arc', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Provençal',                  'Vallon-Pont-d''Arc', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Genêts',                    'Vallon-Pont-d''Arc', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SALAVAS ────────────────────────────────────────────────
('Camping de Salavas',                    'Salavas',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Salavas',                    'Salavas',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAMPZON ────────────────────────────────────────────────
('Rocher de Sampzon',                     'Sampzon',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Rives de l''Ardèche',       'Sampzon',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LAGORCE ────────────────────────────────────────────────
('Dolmens de Lagorce',                    'Lagorce',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Rouvière des Pins',          'Lagorce',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LABASTIDE-DE-VIRAC ─────────────────────────────────────
('Aven de la Forestière',                 'Labastide-de-Virac', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Château des Roure',                     'Labastide-de-Virac', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas de la Serre',            'Labastide-de-Virac', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── RUOMS ──────────────────────────────────────────────────
('Office de Tourisme de Ruoms',           'Ruoms',              'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Sunêlia Aluna Vacances',        'Ruoms',              'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Plaine',                     'Ruoms',              'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Carpenty',                   'Ruoms',              'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel de l''Arcade',                    'Ruoms',              'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village médiéval de Ruoms',             'Ruoms',              'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── VAGNAS ─────────────────────────────────────────────────
('Camping La Rouvière',                   'Vagnas',             'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Vagnas',                     'Vagnas',             'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAINT-RÉMÈZE ───────────────────────────────────────────
('Belvédère de la Cathédrale',            'Saint-Rémèze',       'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Réserve Naturelle des Gorges de l''Ardèche', 'Saint-Rémèze',  'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping du Belvédère',                  'Saint-Rémèze',       'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAINT-ALBAN-AURIOLLES ──────────────────────────────────
('Camping Entre Deux Eaux',               'Saint-Alban-Auriolles', 'camping',       true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Saint-Alban-Auriolles',      'Saint-Alban-Auriolles', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── PRADONS ────────────────────────────────────────────────
('Camping Les Coudoulets',                'Pradons',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Pradons',                    'Pradons',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── GROSPIERRES ────────────────────────────────────────────
('Camping Les Ranchisses',                'Grospierres',        'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Grospierres',                'Grospierres',        'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LABEAUME ───────────────────────────────────────────────
('Village de Labeaume',                   'Labeaume',           'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Gorges de la Beaume',                   'Labeaume',           'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas du Soleillant',          'Labeaume',           'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── CHAUZON ────────────────────────────────────────────────
('Village de Chauzon',                    'Chauzon',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Digue',                      'Chauzon',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── ORGNAC-L'AVEN ──────────────────────────────────────────
('Aven d''Orgnac',                        'Orgnac-l''Aven',     'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Cité de la Préhistoire d''Orgnac',      'Orgnac-l''Aven',     'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme d''Orgnac',          'Orgnac-l''Aven',     'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Draille',                    'Orgnac-l''Aven',     'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Petit Bois',                 'Orgnac-l''Aven',     'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── BESSAS ─────────────────────────────────────────────────
('Village de Bessas',                     'Bessas',             'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── BALAZUC ────────────────────────────────────────────────
('Village médiéval de Balazuc',           'Balazuc',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Clapas',                     'Balazuc',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Bords de l''Ardèche',       'Balazuc',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LAURAC-EN-VIVARAIS ─────────────────────────────────────
('Village de Laurac-en-Vivarais',         'Laurac-en-Vivarais', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Pré de l''Arc',              'Laurac-en-Vivarais', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── VOGÜÉ ──────────────────────────────────────────────────
('Château de Vogüé',                      'Vogüé',              'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Vogüé',                      'Vogüé',              'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping de Vogüé',                      'Vogüé',              'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme de Vogüé',           'Vogüé',              'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LARGENTIÈRE ────────────────────────────────────────────
('Château de Largentière',                'Largentière',        'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme Ardèche Secrète',    'Largentière',        'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Chêne Vert',                   'Largentière',        'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Domaine des Chênes',            'Largentière',        'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── MONTRÉAL ───────────────────────────────────────────────
('Village de Montréal',                   'Montréal',           'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Municipal de Montréal',         'Montréal',           'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── ROSIÈRES ───────────────────────────────────────────────
('Camping Le Petit Bois',                 'Rosières',           'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Lavandes',                  'Rosières',           'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Rosières',                   'Rosières',           'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAINT-MAURICE-D'ARDÈCHE ────────────────────────────────
('Village de Saint-Maurice-d''Ardèche',   'Saint-Maurice-d''Ardèche', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Roches',                    'Saint-Maurice-d''Ardèche', 'camping',     true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── ROCHECOLOMBE ───────────────────────────────────────────
('Ruines du Château de Rochecolombe',     'Rochecolombe',       'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── ROCHER ─────────────────────────────────────────────────
('Village de Rocher',                     'Rocher',             'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── JOANNAS ────────────────────────────────────────────────
('Village de Joannas',                    'Joannas',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Château de Boulogne',                   'Joannas',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── UZER ───────────────────────────────────────────────────
('Village d''Uzer',                       'Uzer',               'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Platanes',                  'Uzer',               'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── AUBENAS ────────────────────────────────────────────────
('Château d''Aubenas',                    'Aubenas',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme d''Aubenas',         'Aubenas',            'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Ibis Aubenas',                    'Aubenas',            'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel du Château',                      'Aubenas',            'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel La Pinède',                       'Aubenas',            'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Pinède',                     'Aubenas',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── LES VANS ───────────────────────────────────────────────
('Office de Tourisme Pays des Vans',      'Les Vans',           'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Bois de Paiolive',                      'Les Vans',           'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Pradal',                     'Les Vans',           'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Carmel',                       'Les Vans',           'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── BARJAC ─────────────────────────────────────────────────
('Office de Tourisme de Barjac',          'Barjac',             'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village médiéval de Barjac',            'Barjac',             'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Buissière',                  'Barjac',             'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas de Reilhe',              'Barjac',             'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAINT-MARTIN-D'ARDÈCHE ─────────────────────────────────
('Village de Saint-Martin-d''Ardèche',    'Saint-Martin-d''Ardèche', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Tunnels',                   'Saint-Martin-d''Ardèche', 'camping',      true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Plage',                      'Saint-Martin-d''Ardèche', 'camping',      true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas des Cèdres',             'Saint-Martin-d''Ardèche', 'camping',      true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── BOURG-SAINT-ANDÉOL ─────────────────────────────────────
('Office de Tourisme de Bourg-Saint-Andéol', 'Bourg-Saint-Andéol', 'office_tourisme', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Musée de la Paléontologie',             'Bourg-Saint-Andéol', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Cathédrale Saint-Polycarpe',            'Bourg-Saint-Andéol', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Saint-Andéol',                 'Bourg-Saint-Andéol', 'hotel',            true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── VILLENEUVE-DE-BERG ─────────────────────────────────────
('Office de Tourisme de Villeneuve-de-Berg', 'Villeneuve-de-Berg', 'office_tourisme', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village médiéval de Villeneuve-de-Berg', 'Villeneuve-de-Berg', 'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Bastide',                    'Villeneuve-de-Berg', 'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── JOYEUSE ────────────────────────────────────────────────
('Château de Joyeuse',                    'Joyeuse',            'site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme de Joyeuse',         'Joyeuse',            'office_tourisme',  true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Nouzarède',                  'Joyeuse',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Bois de Gravières',          'Joyeuse',            'camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ── SAINT-PAUL-LE-JEUNE ────────────────────────────────────
('Village de Saint-Paul-le-Jeune',        'Saint-Paul-le-Jeune','site_touristique', true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Rouvière',                   'Saint-Paul-le-Jeune','camping',          true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20')

;

-- Vérification : combien de lieux au total ?
SELECT COUNT(*) AS total_lieux FROM lieux;
SELECT ville, COUNT(*) AS nb FROM lieux GROUP BY ville ORDER BY nb DESC;
