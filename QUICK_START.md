# Guide de Démarrage Rapide - Plateformes Belges

## 🚀 Démarrage en 3 Minutes

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration Supabase
Les migrations sont déjà créées dans `supabase/migrations/`. Elles créent :
- Les 4 tables nécessaires
- Les politiques RLS
- Les 11 plateformes belges

### 3. Lancement de l'application
```bash
npm run dev
```

L'application est maintenant accessible sur `http://localhost:5173`

## 📺 Découverte des Plateformes

### Sans Connexion
Vous pouvez immédiatement accéder à :
- **LN24** : Chaîne d'information en direct
- **Antenne Centre, Bouke, Canal Zoom, Ma Télé, No Télé, Télé Sambre, Télé MB, TV Lux** : Chaînes locales

### Avec Connexion RTBF (Optionnel)
1. Allez dans **Paramètres** (icône en bas à droite)
2. Entrez vos identifiants RTBF Auvio
3. Accédez au contenu RTBF complet

### Avec Connexion RTL Play (Futur)
La connexion RTL Play nécessite une implémentation OAuth complète (pas encore disponible dans cette version).

## 🎯 Fonctionnalités Clés

### Page d'Accueil
- **Plateformes Belges** : Voir les 11 plateformes disponibles
- **Contenu RTBF** : Si connecté, voir les émissions RTBF
- **Reprendre** : Continuer où vous vous étiez arrêté

### Page Plateformes (`/platforms`)
- **Filtres** : Toutes / Nationales / Locales / Radios
- **Statut** : Voir quelles plateformes nécessitent une connexion
- **Navigation** : Cliquer sur une plateforme pour explorer son contenu

### Page Détail Plateforme
- **Recherche** : Chercher dans le contenu de la plateforme
- **Grille de contenu** : Vidéos, direct, programmes
- **Lecture** : Cliquer pour regarder

### Lecteur Vidéo
- **Formats supportés** : HLS, DASH, MP4
- **DRM** : Widevine pour RTBF et RTL Play
- **Contrôles** : Lecture, pause, volume, plein écran
- **Chromecast** : Support natif (si disponible)

## 🔧 Structure de Navigation

```
/ (Accueil)
├── /platforms (Toutes les plateformes)
│   └── /platform/:slug (Détail d'une plateforme)
│       └── /platform/:slug/:type/:id (Lecteur vidéo)
├── /guide (Guide TV RTBF)
├── /direct (Chaînes en direct RTBF)
├── /search (Recherche RTBF)
└── /settings (Paramètres et connexion)
```

## 🎬 Exemples d'Utilisation

### Regarder LN24 en Direct
1. Cliquez sur **Voir tout** dans "Plateformes Belges"
2. Sélectionnez **LN24**
3. Le direct apparaît dans la liste des contenus
4. Cliquez pour regarder

### Regarder une Chaîne Locale
1. Allez sur `/platforms`
2. Filtrez par **Locales**
3. Choisissez **Télé Sambre** (ou autre)
4. Cliquez sur le direct
5. La vidéo se lance automatiquement

### Explorer le Contenu RTBF
1. Connectez-vous dans **Paramètres**
2. Retournez à l'accueil
3. Le contenu RTBF s'affiche
4. Explorez les catégories, programmes, etc.

## 💡 Conseils

### Performance
- Les plateformes sont chargées en parallèle pour une expérience fluide
- Le contenu est mis en cache côté client
- Les images sont lazy-loaded

### Authentification
- Les tokens RTBF expirent après 1 heure et sont rafraîchis automatiquement
- Vous pouvez vous déconnecter dans Paramètres
- Les données d'authentification sont stockées de manière sécurisée dans Supabase

### Favoris et Historique
- Ajoutez des contenus aux favoris (fonctionnalité à venir)
- L'historique de visionnage est automatique
- La reprise de lecture fonctionne sur tous les appareils

## 🐛 Dépannage

### Erreur "Plateforme nécessite une authentification"
- Allez dans Paramètres
- Connectez-vous avec vos identifiants
- Retournez à la plateforme

### Vidéo ne se lance pas
- Vérifiez votre connexion Internet
- Certaines chaînes locales peuvent être temporairement indisponibles
- Essayez de rafraîchir la page

### Contenu RTBF manquant
- Assurez-vous d'être connecté
- Vérifiez que vos identifiants sont corrects
- Les tokens expirent après 1 heure

## 📱 Compatibilité

### Navigateurs
- Chrome/Edge (recommandé)
- Firefox
- Safari (limitée, certaines vidéos peuvent ne pas fonctionner)

### Appareils
- Desktop (Windows, Mac, Linux)
- Tablettes
- Smartphones
- Smart TVs (via navigateur)

## 🎨 Personnalisation

Chaque plateforme a sa propre couleur :
- **RTBF** : Rouge (#E31E24)
- **RTL Play** : Jaune (#FFD100)
- **LN24** : Bleu (#0066CC)
- **Chaînes locales** : Couleurs variées

## 🚦 État des Plateformes

| Plateforme | Direct | Replay | Authentification | DRM | État |
|------------|--------|--------|------------------|-----|------|
| RTBF Auvio | ✅ | ✅ | Obligatoire | Widevine | ✅ Fonctionnel |
| RTL Play | ⚠️ | ⚠️ | Obligatoire | Widevine | ⚠️ OAuth à implémenter |
| LN24 | ✅ | ✅ | Non | Non | ✅ Fonctionnel |
| Antenne Centre | ✅ | ❌ | Non | Non | ✅ Fonctionnel |
| Bouke | ✅ | ⚠️ | Non | Non | ✅ Fonctionnel |
| Canal Zoom | ✅ | ❌ | Non | Non | ✅ Fonctionnel |
| Ma Télé | ✅ | ❌ | Non | Non | ✅ Fonctionnel |
| No Télé | ✅ | ❌ | Non | Non | ✅ Fonctionnel |
| Télé Sambre | ✅ | ⚠️ | Non | Non | ✅ Fonctionnel |
| Télé MB | ✅ | ⚠️ | Non | Non | ✅ Fonctionnel |
| TV Lux | ✅ | ⚠️ | Non | Non | ✅ Fonctionnel |

Légende :
- ✅ Fonctionnel
- ⚠️ Partiel ou à tester
- ❌ Non disponible

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation complète dans `PLATEFORMES_BELGES.md`
2. Vérifiez les logs de la console navigateur
3. Testez sur un autre navigateur

Bon visionnage ! 📺✨
