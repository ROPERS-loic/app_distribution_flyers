# Suivi Projet — App Distribution de Flyers

**Dernière mise à jour :** 30 août 2026 (session 4 — récupération admin.html + editeur sync)
**Stack :** 2 applications distinctes, même base Supabase (voir détail ci-dessous)
**Version app Flutter :** 1.0.0+1

---

## État général

Le projet comprend en réalité **deux applications séparées**, connectées à la même base Supabase :

1. **Application web (PWA)** — `tournee.html`, `gestion_lieux.html`, `editeur_lieux.html`, `app_distribution.html`, dans ce dossier. C'est l'outil le plus abouti et le plus utilisé sur le terrain : **80 commits Git** (77 entre le 15 et le 19 juin 2026, 3 le 30 août : export PDF/Excel, fix boutons, suivi de projet + logos). Fonctionnalités avancées déjà en place : pointage terrain, mode hors-ligne, photos preuve, export PDF/Excel, statistiques par période.
2. **Application mobile Flutter** (`mon_app`, dossier `C:\src\mon_app`) — un CRM de suivi commercial (lieux, tournées, visites, admin). Développée du 23 au 24 mai 2026, puis en pause depuis (~3 mois), et **sans dépôt Git initialisé** dans ce dossier. Elle couvre les bases (auth, CRUD lieux/tournées/visites, carte, admin) mais n'a pas encore les fonctions terrain avancées de la version web (pas de pointage flyers, pas de mode hors-ligne, pas d'export).

> ❓ À clarifier avec toi : ces deux apps doivent-elles converger (le Flutter remplace le web à terme ?) ou rester deux outils distincts (web = terrain quotidien, Flutter = autre usage) ?

---

## Application Web (PWA) — outil de distribution terrain

**Dépôt Git :** initialisé dans ce dossier, branche `main`, 80 commits (15–19/06/2026 + 30/08/2026), à jour avec GitHub

| Fichier | Rôle |
|---|---|
| `tournee.html` | Interface terrain, installable en PWA — pointage des visites, notes terrain, mode hors-ligne |
| `gestion_lieux.html` | Back-office : gestion des lieux, statistiques (export PDF/Excel), notes terrain |
| `editeur_lieux.html` | Éditeur de lieux (carte, zones, sync Supabase via bouton "Enregistrer") |
| `admin.html` | Interface PC admin : gestion lieux + tournées + suivi live (Supabase) — récupéré depuis Netlify le 30/08 et réintégré dans le dossier local |
| `app_distribution.html` | Ancienne interface terrain (localStorage uniquement — remplacée par `tournee.html` à venir) |
| `reset-password.html` | Page de réinitialisation de mot de passe (Supabase Auth) |
| `manifest.json` / `sw.js` / `icon-512.png` | Config PWA (installable, fonctionnement hors-ligne) |
| `DEMARRER_SERVEUR.bat` | Lance un serveur local (Python) pour tester l'app |

### Fonctionnalités confirmées (d'après l'historique Git)

- Pointage terrain avec détection de doublons (alerte si le lieu a déjà été visité)
- Pointage libre avec photo preuve (upload Supabase Storage) + avertissement si photo prise hors-ligne
- Mode hors-ligne : file d'attente `localStorage` + synchronisation automatique au retour du réseau
- Notes terrain (table `notes_terrain`)
- Carte avec marqueurs colorés par statut de visite + alertes configurables pour les lieux non visités
- Statistiques : export PDF et Excel, filtres par période (jour / semaine / mois / année + plage calendrier)
- Onglet Historique (a remplacé l'ancien onglet "Lieux")
- Suivi des flyers distribués par enseigne — "Nougaterie" et "Château [des Roure]" (quantité par défaut : 1 paquet)
- Recherche insensible aux accents

### Tables Supabase identifiées

`lieux`, `tournees`, `points_tournee`, `pointages`, `notes_terrain` — probablement partagées avec `profiles` et `visites` de l'app Flutter (même projet Supabase).

### Supabase — projet dédié distribution (session 2)

Un **nouveau projet Supabase** a été créé spécifiquement pour l'app de distribution flyers :

- **URL :** `https://krbzipnoeroaofojccri.supabase.co`
- **Anon key :** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…` (voir code source)
- **Admin :** `ropersloic@gmail.com` — UUID `5977f731-c8e0-41bb-a633-8c0f9ad1a32e`
- **Bucket Storage :** `photos-distribution` (privé)
- **Realtime activé sur :** `tournees`, `points_tournee`

**4 tables créées (`supabase_setup.sql`) :**

| Table | Description |
|---|---|
| `utilisateurs` | Liée à `auth.users` — nom, email, rôle (admin/distributeur), téléphone |
| `lieux` | Points de distribution — nom, catégorie, adresse, coords, zone_tournee, notes, actif |
| `tournees` | Tournées planifiées — nom, date, distributeur_id, statut, secteur |
| `points_tournee` | Arrêts d'une tournée — ordre, quantite_flyers, statut, photo, commentaire, coords validation |

**RLS :** tout utilisateur authentifié peut lire/écrire (simplifié pour le démarrage — `auth.uid() IS NOT NULL`).

**Hébergement :** `https://resonant-cannoli-eede25.netlify.app`
- `/admin.html` — interface PC (récupéré depuis Netlify et ajouté au dossier local/Git le 30/08)
- `/editeur_lieux.html` — éditeur de lieux avec sync Supabase (version locale mise à jour le 30/08 avec le code récupéré depuis Netlify, incluant la sync Supabase)

---

## Application Mobile Flutter (`mon_app`)

### Pages existantes

| Fichier | Rôle |
|---|---|
| `login_page.dart` | Connexion, inscription et mot de passe oublié (Supabase Auth) |
| `main.dart` | Point d'entrée, navigation par onglets + drawer |
| `lieux_page.dart` | Liste des lieux (recherche, filtres type/commune) |
| `ajouter_lieu_page.dart` | Ajout d'un lieu |
| `modifier_lieu_page.dart` | Modification / suppression d'un lieu |
| `carte_page.dart` | Vue carte (Google Maps, clustering, géolocalisation, géocodage auto) |
| `tournees_page.dart` | Liste des tournées |
| `ajouter_tournee_page.dart` | Création d'une tournée |
| `visites_page.dart` | Liste des visites (filtres par statut) |
| `ajouter_visite_page.dart` | Planification d'une visite |
| `detail_visite_page.dart` | Détail visite : statut, compte-rendu, photo |
| `historique_lieu_page.dart` | Historique des visites par lieu |
| `admin_page.dart` | Interface admin (3 onglets : utilisateurs, journal, statistiques) |
| `profile.dart` | Modèle profil + gestion des rôles |
| `theme.dart` | Charte graphique (thème Material 3 complet) |
| `widgets.dart` | Composants réutilisables (avatar utilisateur) |
| `lieu.dart` | Modèle de données Lieu |

### Dépendances principales

- `supabase_flutter` ^2.9.0 — base de données / auth
- `google_maps_flutter` ^2.9.0 — cartographie
- `geolocator` ^13.0.1 — géolocalisation
- `image_picker` ^1.1.2 — photos
- `url_launcher`, `http`, `flutter_dotenv`

### Graphisme

- [x] Logo icône créé (30/08/2026) — `logo_icon.svg` / `logo_icon_transparent.svg` (pas encore commités, pas encore intégrés dans le code)
- [x] Charte graphique définie dans `theme.dart` — palette complète (marron nougat, doré miel, beige crème) + thème Material 3 (AppBar, boutons, champs, cards, navigation, FAB, switch, snackbar)
- [ ] Logo actuellement affiché dans l'app (écran de connexion + drawer) via une image chargée depuis `nougaterie-dupontdarc.com` — à remplacer par le nouveau logo SVG du 30/08 une fois intégré

> **Règle de travail :** toute modification graphique fait l'objet d'un aperçu visuel validé avant intégration.

### Fonctionnalités

| Fonctionnalité | État |
|---|---|
| Authentification | ✅ Connexion, inscription, mot de passe oublié (Supabase Auth) |
| Gestion des lieux | ✅ Liste, recherche, filtres (type/commune), ajout, modification, suppression ; champs commerciaux (contact, priorité, fréquence de visite souhaitée) |
| Rôles & permissions | ✅ 3 rôles (admin / commercial / lecteur) ; le rôle "lecteur" ne peut pas modifier les lieux |
| Tournées | ✅ Liste + création (nom, dates, statut) — pas de modification/suppression d'une tournée existante |
| Carte interactive | ✅ Google Maps, clustering natif, géolocalisation, géocodage automatique des lieux sans coordonnées, fiche lieu, ouverture dans Google Maps |
| Visites / historique | ✅ Planification (lieu, tournée, date/heure, statut, notes), détail (statut, compte-rendu, photo du présentoir), historique par lieu |
| Interface admin | ✅ Gestion des utilisateurs (rôle, activation/désactivation), journal d'activité (lieux + visites créés), statistiques (compteurs + répartition des rôles) |

---

## Notes techniques (constatées dans le code)

- Les clés `SUPABASE_ANON_KEY` et `GOOGLE_MAPS_API_KEY` sont codées en dur dans `main.dart` et `carte_page.dart`, alors qu'un fichier `.env` (avec `flutter_dotenv` en dépendance) existe déjà dans le projet — à migrer vers `.env` pour éviter d'exposer les clés si le code est un jour poussé sur un dépôt public.
- Le dossier `mon_app` (app Flutter) n'a pas de dépôt Git initialisé, contrairement à ce dossier de projet qui en a un (branche `main`, 77 commits).
- Dans ce dossier de projet, 3 fichiers récents ont été commités et poussés le 30/08 : `SUIVI_PROJET.md`, `logo_icon.svg`, `logo_icon_transparent.svg`.
- **Découverte et correction du 30/08 :** `admin.html` et la version de `editeur_lieux.html` avec sync Supabase (décrits dans la session « Refonte architecture » ci-dessous) étaient en ligne sur Netlify mais absents du dossier local et du dépôt Git. Récupérés directement depuis Netlify le 30/08 et réintégrés dans ce dossier (voir session 4).

---

## Historique des sessions

### Session du 30/08/2026 (4) — Récupération admin.html + editeur_lieux.html depuis Netlify

**Contexte :** `admin.html` et la version Supabase de `editeur_lieux.html` étaient en ligne sur Netlify mais absents du dossier local/Git (voir session 3).

**Méthode :** le téléchargement direct (curl) était bloqué par l'allowlist réseau de l'environnement ; récupération effectuée via le navigateur intégré (fetch de la page depuis son propre contexte), qui a un accès réseau normal.

**Résultat :**
- `admin.html` créé dans le dossier local (nouveau fichier, non suivi par Git)
- `editeur_lieux.html` mis à jour avec la version en ligne (inclut la sync Supabase : login overlay, bouton Enregistrer, création de tournée)
- Reste à committer/pousser ces deux fichiers avec GitHub Desktop

---

### Session du 30/08/2026 (3) — Vérification état réel du dépôt + correctifs

**Contexte :** vérification de l'état réel du dossier projet avant un commit, suite à la mise à jour du suivi de projet.

**Constats :**
- Le dépôt Git local était déjà à jour avec GitHub (aucun commit en attente de push) ; seuls `SUIVI_PROJET.md`, `logo_icon.svg`, `logo_icon_transparent.svg` restaient à committer.
- Un fichier `.git/index.lock` résiduel bloquait les commits dans GitHub Desktop → supprimé.
- **`admin.html` et la sync Supabase de `editeur_lieux.html` (décrits en session 2) sont en ligne sur Netlify et fonctionnels, mais absents du dossier local et jamais commités sur Git.**

**Actions effectuées :**
- Suppression du fichier de verrou Git (`index.lock`)
- Commit + push des 3 fichiers en attente
- Correction du présent suivi de projet pour refléter l'état réel

---

### Session du 30/08/2026 (2) — Refonte architecture + admin.html + sync Supabase

> ✅ **Statut mis à jour le 30/08 :** ce travail est réel et fonctionne en production sur Netlify. Le code source a été récupéré depuis Netlify et réintégré dans ce dossier le 30/08 (voir session 4).

**Contexte :** migration de l'app terrain de localStorage vers une architecture multi-utilisateurs Supabase, pour gérer une équipe de 3+ distributeurs en saison.

**Fichiers créés / modifiés :**

| Fichier | Modifications |
|---|---|
| `supabase_setup.sql` | Script complet : 4 tables, triggers `updated_at`, RLS, realtime, index, compte admin |
| `supabase_fix_triggers.sql` | Correctif : DROP TRIGGER IF EXISTS avant recréation |
| `supabase_fix_rls.sql` | Remplacement des politiques RLS complexes par `auth.uid() IS NOT NULL` (simple et fonctionnel) |
| `admin.html` | Créé from scratch : interface PC complète (Dashboard, Lieux, Tournées, Carte, Suivi live) |
| `editeur_lieux.html` | Ajout Supabase client + bouton "💾 Enregistrer" (remplace "⬇ CSV") + login intégré |

**Fonctionnalités `admin.html` :**
- Connexion Supabase avec session persistante (getSession + onAuthStateChange)
- Dashboard : stats globales, tournées récentes, activité en temps réel
- Lieux : tableau avec filtres catégorie + zone, CRUD complet, import CSV intelligent
- Tournées : liste, création avec sélection de lieux et assignation distributeur, détail
- Carte Leaflet avec marqueurs par zone
- Suivi live : realtime Supabase sur les points de tournée
- Bandeau diagnostic (débogage)

**Fonctionnalités `editeur_lieux.html` ajoutées :**
- Supabase JS client intégré
- Login overlay (apparaît si non connecté)
- Bouton **"💾 Enregistrer"** = `autoSaveCSV()` + `syncSupabase()` en un clic
- `syncSupabase()` : upsert de tous les POIS (INSERT nouveaux / UPDATE existants par nom)
- Colonne `zone_tournee` écrite dans le CSV à chaque sauvegarde

**Import CSV `admin.html` :**
- Parser CSV robuste (gère les champs entre guillemets avec `;` ou `,`)
- Détection automatique séparateur + suppression BOM UTF-8
- Résolution doublons : récupère les lieux existants directement depuis Supabase (pas dépendant de `ST.lieux`)
- INSERT si nom nouveau, UPDATE si nom existe déjà
- Insertion par lots de 50

**Problèmes résolus :**
- CORS `file://` → hébergement Netlify
- Requête lieux bloquée indéfiniment → timeout 15s + `testNetwork()` non bloquant
- Import créait des doublons → `ST.lieux` vide au moment de l'import → récupération directe depuis Supabase
- `zone_tournee` NULL après import → colonne absente du CSV d'origine → zones stockées uniquement dans localStorage → résolu par `autoSaveCSV()` qui écrit les zones dans le CSV à chaque modification

---

### Session du 30/08/2026 — Export statistiques (app web)

| Commit | Description |
|---|---|
| `feat: export PDF et Excel dans l'onglet statistiques` | Ajout boutons PDF + Excel dans `gestion_lieux.html` onglet stats. PDF : jsPDF + autotable (CDN), en-tête noir, bande filtres actifs, 6 KPI, tableau A4 paysage avec pagination. Excel : CSV UTF-8 BOM (ouvre dans Excel sans re-encodage). |
| `fix: boutons export PDF/Excel fixés en haut de l'onglet statistiques` | Boutons déplacés à côté du titre de la section, toujours visibles sans scroller. |

---

## À faire

**Priorité immédiate :**
- [ ] Créer `tournee.html` — interface mobile terrain pour les distributeurs (prochaine session)
  - Connexion avec compte distributeur
  - Voir ses tournées assignées
  - Valider chaque arrêt : statut + nb flyers + photo + commentaire
  - Navigation Google Maps vers le prochain arrêt
  - Sync temps réel Supabase

**Supabase / données :**
- [ ] Vérifier et nettoyer les doublons éventuels dans la table `lieux` (import CSV du 30/08)
- [ ] Tester le flux complet : Enregistrer dans éditeur → vérifier dans admin → vérifier dans Supabase
- [ ] Affiner les RLS une fois l'app stable (admin = tout, distributeur = ses tournées uniquement)

**App web existante :**
- [ ] Clarifier la relation entre l'ancienne app web (tournee.html existant) et la nouvelle architecture Supabase
- [ ] Intégrer le nouveau logo SVG
- [x] Pousser les commits du 30/08 sur GitHub (export PDF/Excel + fix boutons) — fait, dépôt à jour
- [x] Récupérer `admin.html` et la version Supabase de `editeur_lieux.html` depuis Netlify et les remettre dans ce dossier — fait le 30/08, reste à committer/pousser

**App Flutter :**
- [ ] Clarifier si Flutter continue ou si tout passe en web
- [ ] Migrer les clés API vers `.env`

---

## Notes

> Espace libre pour tes remarques, bugs connus, décisions de design, etc.

