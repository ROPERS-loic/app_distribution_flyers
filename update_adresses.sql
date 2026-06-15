-- ============================================================
-- SCRIPT : Mise à jour des adresses précises + corrections
-- Sources : gorges-ardeche-pontdarc.fr, pagesjaunes.fr, mappy.fr
-- À coller dans : https://supabase.com/dashboard/project/zxkukdugsvbhwucyxurx/sql/new
-- ============================================================

-- ── CORRECTIONS DE VILLE (lieux mal classés) ───────────────
-- Hôtel Les Stalagmites est à Orgnac-l'Aven, pas à Vallon
UPDATE lieux SET ville = 'Orgnac-l''Aven', code_postal = '07150'
  WHERE nom = 'Hôtel Les Stalagmites';

-- Camping International est à Salavas (pas Vallon)
UPDATE lieux SET ville = 'Salavas', code_postal = '07150'
  WHERE nom = 'Camping International';

-- Camping La Rouvière des Pins est à Vagnas (pas Lagorce)
UPDATE lieux SET ville = 'Vagnas', code_postal = '07150'
  WHERE nom = 'Camping La Rouvière des Pins' AND ville = 'Lagorce';

-- Camping Les Ranchisses est à Chassiers (pas Grospierres)
UPDATE lieux SET ville = 'Chassiers', code_postal = '07110'
  WHERE nom = 'Camping Les Ranchisses';


-- ── VALLON-PONT-D'ARC ──────────────────────────────────────
UPDATE lieux SET adresse = '16 Rue des Abeilles',      code_postal = '07150'
  WHERE nom = 'Office de Tourisme Sud Ardèche' AND ville = 'Vallon-Pont-d''Arc';
UPDATE lieux SET adresse = '140 Rue Henri Barbusse',   code_postal = '07150'
  WHERE nom = 'Hôtel Le Manoir du Raveyron';
UPDATE lieux SET adresse = '347 Route des Gorges',     code_postal = '07150'
  WHERE nom = 'Hôtel Le Clos des Bruyères';
UPDATE lieux SET adresse = '5608 Route des Gorges',    code_postal = '07150'
  WHERE nom = 'Camping La Rouvière' AND ville = 'Vallon-Pont-d''Arc';
UPDATE lieux SET adresse = '2242 Route des Gorges',    code_postal = '07150'
  WHERE nom = 'Camping Les Genêts' AND ville = 'Vallon-Pont-d''Arc';
UPDATE lieux SET adresse = '672 Chemin de la Roubine', code_postal = '07150'
  WHERE nom = 'Camping Le Provençal' AND ville = 'Vallon-Pont-d''Arc';

-- ── SALAVAS ────────────────────────────────────────────────
UPDATE lieux SET adresse = '65 Impasse la Plaine',     code_postal = '07150'
  WHERE nom = 'Camping International';

-- ── SAMPZON ────────────────────────────────────────────────
UPDATE lieux SET adresse = '3318 Route du Rocher',     code_postal = '07120'
  WHERE nom = 'Camping Les Rives de l''Ardèche' AND ville = 'Sampzon';

-- ── LAGORCE ────────────────────────────────────────────────
UPDATE lieux SET code_postal = '07150'
  WHERE ville = 'Lagorce';

-- ── LABASTIDE-DE-VIRAC ─────────────────────────────────────
UPDATE lieux SET adresse = 'Route de l''Aven',         code_postal = '07150'
  WHERE nom = 'Aven de la Forestière';
UPDATE lieux SET adresse = 'Le Château',               code_postal = '07150'
  WHERE nom = 'Château des Roure';
UPDATE lieux SET code_postal = '07150'
  WHERE ville = 'Labastide-de-Virac';

-- ── RUOMS ──────────────────────────────────────────────────
UPDATE lieux SET adresse = '9 Rue Alphonse Daudet',    code_postal = '07120'
  WHERE nom = 'Office de Tourisme de Ruoms';
UPDATE lieux SET adresse = '900 Route de Lagorce',     code_postal = '07120'
  WHERE nom = 'Camping Sunêlia Aluna Vacances';
UPDATE lieux SET adresse = 'Route de Ruoms',           code_postal = '07120'
  WHERE nom = 'Camping La Plaine' AND ville = 'Ruoms';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Ruoms';

-- ── VAGNAS ─────────────────────────────────────────────────
UPDATE lieux SET adresse = '1380 Chemin de la Rouvière', code_postal = '07150'
  WHERE nom = 'Camping La Rouvière' AND ville = 'Vagnas';
UPDATE lieux SET adresse = '1380 Chemin de la Rouvière', code_postal = '07150'
  WHERE nom = 'Camping La Rouvière Les Pins';
UPDATE lieux SET code_postal = '07150'
  WHERE ville = 'Vagnas';

-- ── SAINT-RÉMÈZE ───────────────────────────────────────────
UPDATE lieux SET adresse = 'Route Touristique des Gorges', code_postal = '07700'
  WHERE nom = 'Belvédère de la Cathédrale';
UPDATE lieux SET adresse = 'Route Touristique des Gorges', code_postal = '07700'
  WHERE nom = 'Réserve Naturelle des Gorges de l''Ardèche';
UPDATE lieux SET adresse = 'Route Touristique des Gorges', code_postal = '07700'
  WHERE nom = 'Camping du Belvédère' AND ville = 'Saint-Rémèze';
UPDATE lieux SET code_postal = '07700'
  WHERE ville = 'Saint-Rémèze';

-- ── SAINT-ALBAN-AURIOLLES ──────────────────────────────────
UPDATE lieux SET adresse = '500 Chemin du Ranc d''Avaine', code_postal = '07120'
  WHERE nom = 'Camping Entre Deux Eaux';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Saint-Alban-Auriolles';

-- ── PRADONS ────────────────────────────────────────────────
UPDATE lieux SET adresse = '120 Chemin de l''Ardèche',  code_postal = '07120'
  WHERE nom = 'Camping Les Coudoulets';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Pradons';

-- ── GROSPIERRES ────────────────────────────────────────────
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Grospierres';

-- ── CHASSIERS (anciennement Grospierres dans notre liste) ──
UPDATE lieux SET adresse = '1525 Route de Valgorge',   code_postal = '07110'
  WHERE nom = 'Camping Les Ranchisses';

-- ── LABEAUME ───────────────────────────────────────────────
UPDATE lieux SET adresse = '179 Chemin du Flojas',     code_postal = '07120'
  WHERE nom = 'Camping Le Mas du Soleillant';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Labeaume';

-- ── CHAUZON ────────────────────────────────────────────────
UPDATE lieux SET adresse = '860 Chemin des Digues',    code_postal = '07120'
  WHERE nom = 'Camping La Digue' AND ville = 'Chauzon';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Chauzon';

-- ── ORGNAC-L'AVEN ──────────────────────────────────────────
UPDATE lieux SET adresse = '2240 Route de l''Aven',    code_postal = '07150'
  WHERE nom = 'Aven d''Orgnac';
UPDATE lieux SET adresse = 'Rue du Musée',             code_postal = '07150'
  WHERE nom = 'Cité de la Préhistoire d''Orgnac';
UPDATE lieux SET adresse = '190 Route de Pont Saint Esprit', code_postal = '07150'
  WHERE nom = 'Hôtel Les Stalagmites';
UPDATE lieux SET code_postal = '07150'
  WHERE ville = 'Orgnac-l''Aven';

-- ── BALAZUC ────────────────────────────────────────────────
UPDATE lieux SET adresse = '342 Route de Chauzon',     code_postal = '07120'
  WHERE nom = 'Camping Le Clapas' AND ville = 'Balazuc';
UPDATE lieux SET adresse = 'Bord de l''Ardèche',       code_postal = '07120'
  WHERE nom = 'Camping Les Bords de l''Ardèche' AND ville = 'Balazuc';
UPDATE lieux SET code_postal = '07120'
  WHERE ville = 'Balazuc';

-- ── VOGÜÉ ──────────────────────────────────────────────────
UPDATE lieux SET adresse = '2 Impasse des Marronniers', code_postal = '07200'
  WHERE nom = 'Château de Vogüé';
UPDATE lieux SET adresse = '290 Chemin de l''Auzon',   code_postal = '07200'
  WHERE nom = 'Camping de Vogüé';
UPDATE lieux SET code_postal = '07200'
  WHERE ville = 'Vogüé';

-- ── LARGENTIÈRE ────────────────────────────────────────────
UPDATE lieux SET adresse = 'Place Gal de Lattre de Tassigny', code_postal = '07110'
  WHERE nom = 'Château de Largentière';
UPDATE lieux SET adresse = 'Place du Château',         code_postal = '07110'
  WHERE nom = 'Office de Tourisme Ardèche Secrète';
UPDATE lieux SET adresse = '1740 Route d''Aubenas',    code_postal = '07110'
  WHERE nom = 'Camping Domaine des Chênes';
UPDATE lieux SET code_postal = '07110'
  WHERE ville = 'Largentière';

-- ── AUBENAS ────────────────────────────────────────────────
UPDATE lieux SET adresse = 'Place de l''Hôtel de Ville', code_postal = '07200'
  WHERE nom = 'Château d''Aubenas';
UPDATE lieux SET adresse = '53 Boulevard Gambetta',    code_postal = '07200'
  WHERE nom = 'Office de Tourisme d''Aubenas';
UPDATE lieux SET adresse = '42 Route de Montélimar',   code_postal = '07200'
  WHERE nom = 'Hôtel Ibis Aubenas';
UPDATE lieux SET adresse = '2 Rue des Marchands',      code_postal = '07200'
  WHERE nom = 'Hôtel du Château' AND ville = 'Aubenas';
UPDATE lieux SET adresse = 'Route de Vals',            code_postal = '07200'
  WHERE nom = 'Camping La Pinède' AND ville = 'Aubenas';
UPDATE lieux SET code_postal = '07200'
  WHERE ville = 'Aubenas';

-- ── LES VANS ───────────────────────────────────────────────
UPDATE lieux SET adresse = '17 Place Léopold Ollier',  code_postal = '07140'
  WHERE nom = 'Office de Tourisme Pays des Vans';
UPDATE lieux SET adresse = 'Massif de Paiolive',       code_postal = '07140'
  WHERE nom = 'Bois de Paiolive';
UPDATE lieux SET adresse = '7 Montée du Carmel',       code_postal = '07140'
  WHERE nom = 'Hôtel Le Carmel';
UPDATE lieux SET code_postal = '07140'
  WHERE ville = 'Les Vans';

-- ── JOYEUSE ────────────────────────────────────────────────
UPDATE lieux SET adresse = 'Place du Château',         code_postal = '07260'
  WHERE nom = 'Château de Joyeuse';
UPDATE lieux SET adresse = '63 Avenue François Boissel', code_postal = '07260'
  WHERE nom = 'Office de Tourisme de Joyeuse';
UPDATE lieux SET adresse = 'Chemin de la Nouzarède',   code_postal = '07260'
  WHERE nom = 'Camping La Nouzarède';
UPDATE lieux SET adresse = 'Route de Rosières',        code_postal = '07260'
  WHERE nom = 'Camping Le Bois de Gravières';
UPDATE lieux SET code_postal = '07260'
  WHERE ville = 'Joyeuse';

-- ── BOURG-SAINT-ANDÉOL ─────────────────────────────────────
UPDATE lieux SET adresse = 'Place du Champ de Mars',   code_postal = '07700'
  WHERE nom LIKE '%Office de Tourisme%' AND ville = 'Bourg-Saint-Andéol';
UPDATE lieux SET adresse = 'Boulevard Gambetta',       code_postal = '07700'
  WHERE nom = 'Musée de la Paléontologie' AND ville = 'Bourg-Saint-Andéol';
UPDATE lieux SET adresse = 'Place de la République',   code_postal = '07700'
  WHERE nom = 'Cathédrale Saint-Polycarpe';
UPDATE lieux SET code_postal = '07700'
  WHERE ville = 'Bourg-Saint-Andéol';

-- ── SAINT-MARTIN-D'ARDÈCHE ─────────────────────────────────
UPDATE lieux SET code_postal = '07700'
  WHERE ville = 'Saint-Martin-d''Ardèche';

-- ── VILLENEUVE-DE-BERG ─────────────────────────────────────
UPDATE lieux SET code_postal = '07170'
  WHERE ville = 'Villeneuve-de-Berg';

-- ── SAINT-PAUL-LE-JEUNE ────────────────────────────────────
UPDATE lieux SET code_postal = '07140'
  WHERE ville = 'Saint-Paul-le-Jeune';

-- ── BARJAC (Gard, pas Ardèche) ─────────────────────────────
UPDATE lieux SET code_postal = '30430'
  WHERE ville = 'Barjac';

-- ── AUTRES COMMUNES ────────────────────────────────────────
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Laurac-en-Vivarais';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Joannas';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Uzer';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Rocher';
UPDATE lieux SET code_postal = '07110' WHERE ville = 'Montréal';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Saint-Maurice-d''Ardèche';
UPDATE lieux SET code_postal = '07200' WHERE ville = 'Rochecolombe';
UPDATE lieux SET code_postal = '07260' WHERE ville = 'Rosières';
UPDATE lieux SET code_postal = '07150' WHERE ville = 'Bessas';
UPDATE lieux SET code_postal = '07120' WHERE ville = 'Sampzon';


-- ── RESET DES COORDONNÉES pour reforcer le géocodage ───────
UPDATE lieux SET latitude = NULL, longitude = NULL
  WHERE latitude IS NOT NULL OR longitude IS NOT NULL;


-- ── VÉRIFICATION ───────────────────────────────────────────
SELECT nom, adresse, ville, code_postal
FROM lieux
ORDER BY ville, nom;
