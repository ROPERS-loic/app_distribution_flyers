-- ============================================================
-- SCRIPT V2 : Base de lieux complète et précise
-- Sources : pagesjaunes.fr, mappy.fr, gorges-ardeche-pontdarc.fr, google maps
-- ATTENTION : Supprime les anciens lieux auto-générés puis reinsère
-- ============================================================

-- 1. Suppression des anciens lieux auto-générés (garder ceux saisis manuellement)
-- D'abord supprimer les visites liées (contrainte clé étrangère visites_lieu_id_fkey)
DELETE FROM visites
WHERE lieu_id IN (
  SELECT id FROM lieux
  WHERE user_id = '80fbeff5-ab1b-479c-ab56-a6150075ef20'
    AND created_at > '2025-01-01'
);

-- Ensuite supprimer les lieux
DELETE FROM lieux
WHERE user_id = '80fbeff5-ab1b-479c-ab56-a6150075ef20'
  AND created_at > '2025-01-01';

-- 2. Insertion des nouveaux lieux avec adresses précises
-- Format : (nom, adresse, ville, code_postal, type, latitude, longitude, actif, pays, user_id)

INSERT INTO lieux (nom, adresse, ville, code_postal, type, latitude, longitude, actif, pays, user_id) VALUES

-- ══════════════════════════════════════════════════════════
-- VALLON-PONT-D'ARC (07150)
-- ══════════════════════════════════════════════════════════
('Office de Tourisme Gorges de l''Ardèche - Pont d''Arc',
  '16 Rue des Abeilles',            'Vallon-Pont-d''Arc', '07150', 'office_tourisme', 44.4071, 4.3942, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Manoir du Raveyron',
  '140 Rue Henri Barbusse',         'Vallon-Pont-d''Arc', '07150', 'hotel',           44.4065, 4.3950, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Clos des Bruyères',
  '347 Route des Gorges',           'Vallon-Pont-d''Arc', '07150', 'hotel',           44.4021, 4.4018, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Arc en Ciel',
  '359 Chemin du Moulin',           'Vallon-Pont-d''Arc', '07150', 'camping',         44.4082, 4.3887, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Beau Rivage',
  '714 Chemin du Savel',            'Vallon-Pont-d''Arc', '07150', 'camping',         44.3985, 4.4055, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Camp des Gorges',
  '5898 Route des Gorges',          'Vallon-Pont-d''Arc', '07150', 'camping',         44.3912, 4.4201, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Rouvière',
  '5608 Route des Gorges',          'Vallon-Pont-d''Arc', '07150', 'camping',         44.3940, 4.4150, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping des Tunnels',
  '2242 Route des Gorges',          'Vallon-Pont-d''Arc', '07150', 'camping',         44.3997, 4.4068, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Roubine',
  '672 Chemin de la Roubine',       'Vallon-Pont-d''Arc', '07150', 'camping',         44.4110, 4.3830, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Vieux Vallon',
  '206 Chemin du Vieux Vallon',     'Vallon-Pont-d''Arc', '07150', 'camping',         44.4098, 4.3862, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Plage Fleurie',
  '225 Chemin de la Galine',        'Vallon-Pont-d''Arc', '07150', 'camping',         44.4050, 4.3920, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Le Pont d''Arc',
  'Route des Gorges',               'Vallon-Pont-d''Arc', '07150', 'site_touristique', 44.3947, 4.4163, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SALAVAS (07150)
-- ══════════════════════════════════════════════════════════
('Camping International',
  '65 Impasse la Plaine',           'Salavas',            '07150', 'camping',         44.4183, 4.3855, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping de l''Ardèche',
  '100 Chemin de la Plage',         'Salavas',            '07150', 'camping',         44.4185, 4.3845, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Chauvieux',
  '40 Chemin de la Plage',          'Salavas',            '07150', 'camping',         44.4175, 4.3838, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Micocoulier',
  'Chemin Lantousse',               'Salavas',            '07150', 'camping',         44.4190, 4.3870, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SAMPZON (07120)
-- ══════════════════════════════════════════════════════════
('Camping Le Riviera',
  '3319 Route du Rocher',           'Sampzon',            '07120', 'camping',         44.3725, 4.3548, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Soleil Vivarais',
  '3342 Route du Rocher',           'Sampzon',            '07120', 'camping',         44.3718, 4.3541, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Sun Camping',
  '10 Chemin des Pibous',           'Sampzon',            '07120', 'camping',         44.3742, 4.3560, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Mas de la Source',
  '75 Chemin de la Source',         'Sampzon',            '07120', 'camping',         44.3750, 4.3580, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Chassezac',
  '748 Route d''Alès',              'Sampzon',            '07120', 'camping',         44.3735, 4.3520, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Rocher de Sampzon',
  'Chemin du Rocher',               'Sampzon',            '07120', 'site_touristique', 44.3755, 4.3545, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- LAGORCE (07150)
-- ══════════════════════════════════════════════════════════
('Camping Domaine de Chadeyron',
  '400 Chemin de Chadeyron',        'Lagorce',            '07150', 'camping',         44.4674, 4.4140, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- LABASTIDE-DE-VIRAC (07150)
-- ══════════════════════════════════════════════════════════
('Camping Mas de Serret',
  'Mas Serret',                     'Labastide-de-Virac', '07150', 'camping',         44.3645, 4.3982, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Aven de la Forestière',
  'Route de l''Aven',               'Labastide-de-Virac', '07150', 'site_touristique', 44.3660, 4.3950, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- RUOMS (07120)
-- ══════════════════════════════════════════════════════════
('Office de Tourisme Gorges de l''Ardèche - Ruoms',
  '9 Rue Alphonse Daudet',          'Ruoms',              '07120', 'office_tourisme', 44.4529, 4.3380, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Sunêlia Aluna Vacances',
  '900 Route de Lagorce',           'Ruoms',              '07120', 'camping',         44.4601, 4.3218, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Chapoulière',
  '140 Chemin de la Chapoulière',   'Ruoms',              '07120', 'camping',         44.4488, 4.3421, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Petit Bois',
  '87 Chemin du Petit Bois',        'Ruoms',              '07120', 'camping',         44.4510, 4.3350, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Paillotes',
  '7 Chemin Espedes',               'Ruoms',              '07120', 'camping',         44.4520, 4.3340, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Carpenty',
  '10 Chemin de Fay et Carpenti',   'Ruoms',              '07120', 'camping',         44.4498, 4.3385, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Yelloh Village La Plaine',
  '247 Chemin de La Plaine',        'Ruoms',              '07120', 'camping',         44.4540, 4.3395, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- VAGNAS (07150)
-- ══════════════════════════════════════════════════════════
('Camping La Rouvière Les Pins',
  '1380 Chemin de la Rouvière',     'Vagnas',             '07150', 'camping',         44.3810, 4.3755, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SAINT-RÉMÈZE (07700)
-- ══════════════════════════════════════════════════════════
('Aven Marzal',
  '106 Route de Plance',            'Saint-Rémèze',       '07700', 'site_touristique', 44.3698, 4.5121, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Grotte de la Madeleine',
  'Route Touristique des Gorges',   'Saint-Rémèze',       '07700', 'site_touristique', 44.3398, 4.4836, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Belvédère de la Cathédrale',
  'Route Touristique des Gorges',   'Saint-Rémèze',       '07700', 'site_touristique', 44.3540, 4.4680, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Réserve Naturelle des Gorges de l''Ardèche',
  'Route Touristique des Gorges',   'Saint-Rémèze',       '07700', 'site_touristique', 44.3480, 4.4700, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Domaine de Briange',
  '1077 Route de Vallon',           'Saint-Rémèze',       '07700', 'camping',         44.3850, 4.4820, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SAINT-ALBAN-AURIOLLES (07120)
-- ══════════════════════════════════════════════════════════
('Camping Ranc Davaine',
  '500 Chemin du Ranc d''Avaine',   'Saint-Alban-Auriolles', '07120', 'camping',      44.3962, 4.3165, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping du Vieux Pont',
  '2750 Route de Ruoms',            'Saint-Alban-Auriolles', '07120', 'camping',      44.3978, 4.3148, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas de Chavetourte',
  '670 Chemin Chavetourte',         'Saint-Alban-Auriolles', '07120', 'camping',      44.3945, 4.3175, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Mas du Sartre',
  '50 Chemin Vignasse',             'Saint-Alban-Auriolles', '07120', 'camping',      44.3951, 4.3160, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping à la Ferme de Cassagne',
  '115 Chemin Cassagne',            'Saint-Alban-Auriolles', '07120', 'camping',      44.3938, 4.3182, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Mas Daudet',
  '710 Chemin de la Vignasse',      'Saint-Alban-Auriolles', '07120', 'site_touristique', 44.4396, 4.3165, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- PRADONS (07120)
-- ══════════════════════════════════════════════════════════
('Camping Les Coudoulets',
  '120 Chemin de l''Ardèche',       'Pradons',            '07120', 'camping',         44.4258, 4.3445, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping de Laborie',
  '780 Route de Ruoms',             'Pradons',            '07120', 'camping',         44.4275, 4.3412, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- CHAUZON (07120)
-- ══════════════════════════════════════════════════════════
('Camping La Digue',
  '860 Chemin des Digues',          'Chauzon',            '07120', 'camping',         44.4365, 4.3512, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping des Chênes',
  'Route du Boulodrome',            'Chauzon',            '07120', 'camping',         44.4372, 4.3498, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- LABEAUME (07120)
-- ══════════════════════════════════════════════════════════
('Camping de Peyroche',
  '179 Chemin du Flojas',           'Labeaume',           '07120', 'camping',         44.4398, 4.3288, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Savane',
  '696 Chemin du Flojas',           'Labeaume',           '07120', 'camping',         44.4412, 4.3275, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Gorges de la Beaume',
  'Chemin du Flojas',               'Labeaume',           '07120', 'site_touristique', 44.4405, 4.3260, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Labeaume',
  'Le Village',                     'Labeaume',           '07120', 'site_touristique', 44.4390, 4.3295, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- GROSPIERRES (07120)
-- ══════════════════════════════════════════════════════════
('Camping Les Lavandes',
  'Route de Grospierres',           'Grospierres',        '07120', 'camping',         44.4088, 4.3148, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping L''Oasis',
  'La Gare',                        'Grospierres',        '07120', 'camping',         44.4095, 4.3162, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- BALAZUC (07120)
-- ══════════════════════════════════════════════════════════
('Camping Beaume Giraud',
  '342 Route de Chauzon',           'Balazuc',            '07120', 'camping',         44.4521, 4.3628, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping de la Falaise',
  'Hameau Les Salles',              'Balazuc',            '07120', 'camping',         44.4510, 4.3622, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village médiéval de Balazuc',
  'Le Village',                     'Balazuc',            '07120', 'site_touristique', 44.4506, 4.3632, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Gîtes du Viel Audon',
  'Le Viel Audon',                  'Balazuc',            '07120', 'gite',            44.5059, 4.3629, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- ORGNAC-L'AVEN (07150)
-- ══════════════════════════════════════════════════════════
('Aven d''Orgnac - Grand Site de France',
  '2240 Route de l''Aven',          'Orgnac-l''Aven',     '07150', 'site_touristique', 44.3185, 4.4125, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Cité de la Préhistoire d''Orgnac',
  '2240 Route de l''Aven',          'Orgnac-l''Aven',     '07150', 'site_touristique', 44.3182, 4.4122, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Les Stalagmites',
  '190 Route de Pont Saint Esprit', 'Orgnac-l''Aven',     '07150', 'hotel',           44.3210, 4.4180, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- BIDON (07700) — Grotte Saint-Marcel
-- ══════════════════════════════════════════════════════════
('Grotte Saint-Marcel',
  '2759 Route Touristique des Gorges', 'Bidon',           '07700', 'site_touristique', 44.3322, 4.5410, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- VOGÜÉ (07200)
-- ══════════════════════════════════════════════════════════
('Château de Vogüé',
  '2 Impasse des Marronniers',      'Vogüé',              '07200', 'site_touristique', 44.5511, 4.4121, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme de Vogüé',
  'Place du Village',               'Vogüé',              '07200', 'office_tourisme', 44.5512, 4.4118, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Roches',
  '215 Montée des Carriers',        'Vogüé',              '07200', 'camping',         44.5498, 4.4108, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Le Jardin des Peupliers',
  '350 Chemin de l''Auzon',         'Vogüé',              '07200', 'camping',         44.5520, 4.4095, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Les Chênes Verts',
  '665 Route Saint-Germain',        'Vogüé',              '07200', 'camping',         44.5535, 4.4080, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('L''Oasis des Garrigues',
  '290 Chemin de l''Auzon',         'Vogüé',              '07200', 'camping',         44.5505, 4.4112, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SAINT-MAURICE-D'ARDÈCHE (07200)
-- ══════════════════════════════════════════════════════════
('Camping Le Chamadou',
  '1500 Chemin de Chaussy',         'Saint-Maurice-d''Ardèche', '07200', 'camping',   44.5385, 4.4285, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- LARGENTIÈRE (07110)
-- ══════════════════════════════════════════════════════════
('Château de Largentière',
  'Place Gal de Lattre de Tassigny','Largentière',        '07110', 'site_touristique', 44.5351, 4.2948, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme Ardèche Secrète',
  'Place du Château',               'Largentière',        '07110', 'office_tourisme', 44.5350, 4.2945, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Domaine des Chênes',
  '1740 Route d''Aubenas',          'Largentière',        '07110', 'camping',         44.5412, 4.3088, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- AUBENAS (07200)
-- ══════════════════════════════════════════════════════════
('Château d''Aubenas',
  'Place de l''Hôtel de Ville',     'Aubenas',            '07200', 'site_touristique', 44.6201, 4.3922, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme d''Aubenas',
  '53 Boulevard Gambetta',          'Aubenas',            '07200', 'office_tourisme', 44.6195, 4.3918, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Ibis Aubenas',
  '42 Route de Montélimar',         'Aubenas',            '07200', 'hotel',           44.6248, 4.3875, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- JOYEUSE (07260)
-- ══════════════════════════════════════════════════════════
('Château de Joyeuse',
  'Place du Château',               'Joyeuse',            '07260', 'site_touristique', 44.4798, 4.2328, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Office de Tourisme Cévennes d''Ardèche - Joyeuse',
  '63 Avenue François Boissel',     'Joyeuse',            '07260', 'office_tourisme', 44.4801, 4.2335, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Nouzarède',
  'Chemin de la Nouzarède',         'Joyeuse',            '07260', 'camping',         44.4812, 4.2298, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping Arleblanc',
  '275 Route de Chassagnes',        'Rosières',           '07260', 'camping',         44.4748, 4.2415, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- ROSIÈRES (07260)
-- ══════════════════════════════════════════════════════════
('Camping Les Hortensias',
  '430 Route Ribeyre-Bouchet',      'Rosières',           '07260', 'camping',         44.4762, 4.2448, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- LES VANS (07140)
-- ══════════════════════════════════════════════════════════
('Office de Tourisme Cévennes d''Ardèche - Les Vans',
  '17 Place Léopold Ollier',        'Les Vans',           '07140', 'office_tourisme', 44.4085, 4.1298, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Hôtel Le Carmel',
  '7 Montée du Carmel',             'Les Vans',           '07140', 'hotel',           44.4078, 4.1305, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Bois de Paiolive',
  'Massif de Paiolive',             'Les Vans',           '07140', 'site_touristique', 44.3955, 4.1285, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- BARJAC (30430 - Gard)
-- ══════════════════════════════════════════════════════════
('Village médiéval de Barjac',
  'Place Charles Guynet',           'Barjac',             '30430', 'site_touristique', 44.3068, 4.3468, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Camping La Buissière',
  'Route de la Buissière',          'Barjac',             '30430', 'camping',         44.3055, 4.3455, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- SAINT-MARTIN-D'ARDÈCHE (07700)
-- ══════════════════════════════════════════════════════════
('Camping Huttopia Le Moulin',
  'Route du Moulin',                'Saint-Martin-d''Ardèche', '07700', 'camping',    44.3125, 4.5548, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village de Saint-Martin-d''Ardèche',
  'Le Village',                     'Saint-Martin-d''Ardèche', '07700', 'site_touristique', 44.3118, 4.5541, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- BOURG-SAINT-ANDÉOL (07700)
-- ══════════════════════════════════════════════════════════
('Office de Tourisme de Bourg-Saint-Andéol',
  'Place du Champ de Mars',         'Bourg-Saint-Andéol', '07700', 'office_tourisme', 44.3728, 4.6418, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Cathédrale Saint-Polycarpe',
  'Place de la République',         'Bourg-Saint-Andéol', '07700', 'site_touristique', 44.3725, 4.6415, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),

-- ══════════════════════════════════════════════════════════
-- VILLENEUVE-DE-BERG (07170)
-- ══════════════════════════════════════════════════════════
('Office de Tourisme de Villeneuve-de-Berg',
  'Place du Marché',                'Villeneuve-de-Berg', '07170', 'office_tourisme', 44.5568, 4.5008, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20'),
('Village médiéval de Villeneuve-de-Berg',
  'Le Village',                     'Villeneuve-de-Berg', '07170', 'site_touristique', 44.5565, 4.5005, true, 'FR', '80fbeff5-ab1b-479c-ab56-a6150075ef20')

;

-- 3. Vérification
SELECT ville, type, COUNT(*) as nb
FROM lieux
GROUP BY ville, type
ORDER BY ville, type;

SELECT COUNT(*) as total FROM lieux;
