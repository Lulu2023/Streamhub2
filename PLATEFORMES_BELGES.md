# Application Belge Unifiée de Streaming Vidéo

## Vue d'ensemble

Cette application intègre **toutes les principales plateformes de streaming belges** en une seule interface moderne et intuitive. Les utilisateurs peuvent accéder à l'ensemble du contenu belge francophone depuis un seul endroit.

## Plateformes Intégrées

### Plateformes Nationales
1. **RTBF Auvio** - Radio-télévision belge de la Communauté française
   - Authentification: Gigya (obligatoire)
   - Support: Direct, Replay, VOD, EPG
   - DRM: Widevine

2. **RTL Play** - Groupe RTL Belgium
   - Chaînes: RTL-TVI, Club RTL, Plug RTL, RTL Info, RTL Sport
   - Authentification: OAuth (obligatoire)
   - Support: Direct, Replay, VOD
   - DRM: Widevine

3. **LN24** - Chaîne d'information en continu
   - Authentification: Aucune
   - Support: Direct, Replay

### Chaînes TV Locales
4. **Antenne Centre** - Télévision locale du Centre
5. **Bouke** - Télévision locale de la région
6. **Canal Zoom** - Télévision locale
7. **Ma Télé** - Télévision locale de Mons-Borinage
8. **No Télé** - Télévision locale de Wallonie picarde
9. **Télé Sambre** - Télévision locale de la région de Charleroi
10. **Télé MB** - Télévision locale du Brabant wallon
11. **TV Lux** - Télévision locale de la province de Luxembourg

## Architecture

### Base de Données (Supabase)

L'application utilise Supabase pour la persistence des données :

#### Tables
- **platforms** : Métadonnées des plateformes
- **user_platform_auth** : Authentification multi-plateformes par utilisateur
- **platform_favorites** : Favoris multi-plateformes
- **platform_watch_history** : Historique de visionnage avec reprise de lecture

#### Sécurité
- RLS (Row Level Security) activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Authentification gérée par Supabase Auth

### Services API

#### Service Unifié (`unified-platforms-api.ts`)
- Abstraction pour toutes les plateformes
- Conversion de données uniformisée
- Gestion centralisée des erreurs

#### Services par Plateforme
- `rtbf-api.ts` : API RTBF Auvio complète (existante)
- `rtlplay-api.ts` : API RTL Play
- `ln24-api.ts` : API LN24
- `local-tv-api.ts` : API chaînes locales (Freecaster)

#### Service de Gestion (`platforms-service.ts`)
- CRUD pour les plateformes
- Gestion des authentifications
- Favoris et historique

### Lecteur Vidéo Universel

Support des formats :
- **HLS** (HTTP Live Streaming) - Chaînes locales, LN24
- **DASH** (Dynamic Adaptive Streaming) - RTBF, RTL Play
- **MP4** - Contenu statique
- **DRM Widevine** - RTBF, RTL Play

## Pages de l'Application

### Page d'Accueil (`/`)
- Section "Plateformes Belges" avec les 6 principales plateformes
- Contenu RTBF Auvio (si connecté)
- Historique "Reprendre"
- Catégories et recommandations

### Page Plateformes (`/platforms`)
- Liste complète de toutes les plateformes
- Filtres par catégorie (Nationales, Locales, Radios)
- Indicateurs d'authentification
- Navigation vers chaque plateforme

### Page Détail Plateforme (`/platform/:slug`)
- Contenu spécifique à la plateforme
- Recherche dans la plateforme
- Message d'authentification si requis
- Grille de contenus (vidéos, direct, programmes)

### Page Lecture (`/platform/:slug/:type/:id`)
- Lecteur vidéo universel (Shaka Player)
- Support HLS, DASH, DRM
- Contrôles de lecture
- Support Chromecast (via hook existant)

## Fonctionnalités

### Authentification Multi-Plateformes
- Stockage sécurisé des tokens dans Supabase
- Rafraîchissement automatique des tokens
- Gestion des expirations
- Interface de connexion par plateforme

### Favoris Cross-Plateformes
- Ajouter du contenu de n'importe quelle plateforme
- Affichage unifié des favoris
- Synchronisation en temps réel

### Historique de Visionnage
- Reprise de lecture là où l'utilisateur s'est arrêté
- Synchronisation cross-device
- Nettoyage manuel de l'historique
- Filtrage par plateforme

### Recherche Unifiée
- Recherche globale sur toutes les plateformes
- Recherche par plateforme
- Résultats agrégés

## Gestion des Restrictions

### Plateformes avec Authentification Obligatoire
- **RTBF Auvio** : Le contenu est masqué si non connecté
- **RTL Play** : Le contenu est masqué si non connecté

### Plateformes Sans Authentification
- **LN24** : Accès libre au direct et au replay
- **Toutes les chaînes locales** : Accès libre

## Installation et Configuration

### Prérequis
- Node.js 18+
- Compte Supabase
- Comptes optionnels : RTBF Auvio, RTL Play

### Configuration Supabase
1. Les migrations sont dans `supabase/migrations/`
2. Les tables sont créées automatiquement
3. Les politiques RLS sont configurées
4. Les 11 plateformes sont insérées automatiquement

### Variables d'Environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Structure du Code

```
src/
├── services/
│   ├── rtbf-api.ts              # API RTBF Auvio
│   ├── unified-platforms-api.ts # API unifiée
│   ├── platforms-service.ts     # Service de gestion
│   └── platforms/
│       ├── rtlplay-api.ts       # API RTL Play
│       ├── ln24-api.ts          # API LN24
│       └── local-tv-api.ts      # API chaînes locales
├── pages/
│   ├── HomePage.tsx             # Page d'accueil
│   ├── PlatformsPage.tsx       # Liste des plateformes
│   ├── PlatformDetailPage.tsx  # Détail d'une plateforme
│   └── PlatformVideoPage.tsx   # Lecteur vidéo universel
├── types/
│   └── index.ts                 # Types TypeScript
└── components/
    ├── VideoPlayer.tsx          # Lecteur Shaka Player
    └── [autres composants]
```

## Flux d'Utilisation

### Scénario 1 : Utilisateur Non Connecté
1. Accède à la page d'accueil
2. Voit les 11 plateformes disponibles
3. Clique sur une chaîne locale (ex: LN24)
4. Accède au direct et au replay sans connexion

### Scénario 2 : Utilisateur Connecté RTBF
1. Se connecte via Paramètres
2. Accède au contenu RTBF sur la page d'accueil
3. Peut regarder les émissions RTBF
4. L'historique est sauvegardé

### Scénario 3 : Exploration Multi-Plateformes
1. Va sur `/platforms`
2. Filtre par "Locales"
3. Explore Télé Sambre, TV Lux, etc.
4. Regarde différents directs
5. Ajoute des contenus aux favoris

## Technologies Utilisées

- **React 18** : Framework UI
- **TypeScript** : Typage statique
- **Supabase** : Base de données et authentification
- **Shaka Player** : Lecteur vidéo avec DRM
- **Tailwind CSS** : Styling
- **React Router** : Navigation
- **Lucide React** : Icônes

## Améliorations Futures

1. **Authentification RTL Play** : Implémenter le flow OAuth complet
2. **Cache Intelligent** : Mise en cache des métadonnées
3. **Mode Hors Ligne** : Téléchargement de contenu
4. **Recommandations** : Algorithme de recommandation cross-plateformes
5. **EPG Multi-Plateformes** : Guide TV unifié
6. **Notifications** : Alertes pour les programmes favoris
7. **Profils Utilisateurs** : Gestion multi-profils

## Limitations Connues

- RTL Play nécessite une authentification OAuth complète (non implémentée dans cette version de démonstration)
- Les chaînes locales dépendent de la disponibilité des flux Freecaster
- Le scraping HTML peut être fragile si les sites changent leur structure
- Pas de support des sous-titres pour le moment

## Contribution

Pour ajouter une nouvelle plateforme :

1. Créer un fichier API dans `src/services/platforms/`
2. Ajouter la plateforme dans la migration Supabase
3. Intégrer dans `unified-platforms-api.ts`
4. Tester le flux vidéo et les métadonnées

## Licence

Ce projet est une démonstration technique. Les droits de diffusion appartiennent aux plateformes respectives.
