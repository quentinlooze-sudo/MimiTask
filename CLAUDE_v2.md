# CLAUDE.md — MimiTask v2

> Ce fichier est lu par Claude Code à chaque session. Il contient toutes les règles et conventions du projet.
> **⚠️ Ce fichier remplace le CLAUDE.md v1.** Les règles de la v1 restent valides sauf mention contraire.

---

## 🎯 Objectif du projet

MimiTask est une **PWA mobile-first** qui gamifie les tâches ménagères pour les couples.

**v2 = synchronisation temps réel.** Chaque partenaire utilise l'app sur son propre téléphone. Les tâches, scores et récompenses se synchronisent instantanément via Firebase.

**Stack v2 :** HTML/CSS/JS vanilla + Firebase (Firestore, Auth, Cloud Messaging) + Vite (bundler)
**Hébergement :** Firebase Hosting (remplace GitHub Pages)

---

## 📏 Règles générales

1. **Mobile-first obligatoire.** Design pour 375px d'abord.
2. **Vanilla JS en ES6+.** Modules ES avec `import/export`.
3. **Firebase = seule dépendance externe.** Pas de framework UI, pas de librairie CSS.
4. **Vite comme bundler.** Nécessaire pour le tree-shaking du SDK Firebase. Config minimale.
5. **Performance avant tout.** Objectif Lighthouse > 90. Imports Firebase modulaires uniquement.
6. **Accessibilité WCAG AA.** Contrastes, navigation clavier, ARIA.
7. **Code commenté sobrement.** Un commentaire par bloc logique.
8. **Offline-first.** L'app doit fonctionner sans connexion grâce au cache Firestore + Service Worker.

---

## 🧱 Structure des fichiers (v2)

```
mimitask/
├── index.html                  # Point d'entrée unique
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (cache assets statiques)
├── favicon.ico
├── vite.config.js              # Config Vite (minimale)
├── package.json                # Dépendances (firebase uniquement)
│
├── css/
│   ├── variables.css           # Custom properties (tokens) — MIS À JOUR (nouveau design)
│   ├── reset.css               # Reset minimal — INCHANGÉ
│   ├── base.css                # Typo, layout global — MIS À JOUR (Nunito/Quicksand, gradients)
│   ├── components.css          # Boutons, cartes, badges, modals — MIS À JOUR (nouveau design)
│   ├── tasks.css               # Écran tâches — MIS À JOUR (hover, checkbox)
│   ├── dashboard.css           # Écran dashboard — MIS À JOUR (cartes, gradient)
│   ├── settings.css            # Écran paramètres — MIS À JOUR + nouvelles sections v2
│   ├── mascot-customizer.css   # NOUVEAU — UI personnalisation mascotte
│   └── notifications.css       # NOUVEAU — UI préférences notifications
│
├── js/
│   ├── app.js                  # Initialisation, routing — MODIFIÉ (init Firebase)
│   ├── firebase-config.js      # NOUVEAU — Config Firebase, initialisation SDK
│   ├── store.js                # MODIFIÉ — Firestore au lieu de LocalStorage
│   ├── auth.js                 # NOUVEAU — Auth anonyme + gestion code couple
│   ├── sync.js                 # NOUVEAU — Listeners Firestore temps réel
│   ├── migration.js            # NOUVEAU — Migration données LocalStorage → Firestore
│   ├── notifications.js        # NOUVEAU — FCM setup, permission, préférences
│   ├── tasks.js                # Logique tâches — QUASI INCHANGÉ (appelle store.js)
│   ├── points.js               # Calcul points, streaks — INCHANGÉ
│   ├── rewards.js              # Récompenses — INCHANGÉ
│   ├── dashboard.js            # Rendu dashboard — INCHANGÉ
│   ├── onboarding.js           # MODIFIÉ — Deux flux (créer / rejoindre)
│   ├── mascot.js               # MODIFIÉ — Support personnalisation
│   ├── mascot-customizer.js    # NOUVEAU — UI personnalisation mascotte
│   └── utils.js                # Helpers — INCHANGÉ
│
├── assets/
│   ├── icons/                  # Icônes PWA
│   ├── mascot/                 # SVGs mascotte — ENRICHI (variantes couleur + accessoires)
│   │   ├── mimi-happy.svg
│   │   ├── mimi-sad.svg
│   │   ├── mimi-excited.svg
│   │   ├── mimi-neutral.svg
│   │   ├── accessories/        # NOUVEAU — SVG accessoires superposables
│   │   │   ├── hat.svg
│   │   │   ├── bow.svg
│   │   │   ├── glasses.svg
│   │   │   ├── crown.svg
│   │   │   └── scarf.svg
│   │   └── colors.json         # NOUVEAU — Mapping couleurs disponibles
│   └── sounds/
│
└── data/
    └── default-tasks.json      # Bibliothèque tâches prédéfinies — INCHANGÉ
```

### Règles de structure v2
- **Un fichier JS par responsabilité.** Règle v1 maintenue.
- **Les nouveaux fichiers Firebase (`firebase-config.js`, `auth.js`, `sync.js`) sont séparés.** Ne pas tout mettre dans `store.js`.
- **`store.js` reste l'interface unique pour les données.** Les autres fichiers appellent `store.js`, jamais Firestore directement.
- **Vite ne change pas la structure.** Les fichiers sont au même endroit, Vite se charge du bundling en background.

---

## 🎨 Palette & conventions UI

> ⚠️ **Design mis à jour suite au merge du prototype (février 2026).**
> Les anciennes valeurs (police Inter, couleurs v1) ne sont plus valides.

### Typographie

- **Police body :** Nunito (Google Fonts) avec fallback system
- **Police titres/accents/labels :** Quicksand (Google Fonts)
- **Titres :** Quicksand, `font-weight: 700`, tailles `--font-size-xl` à `--font-size-2xl`
- **Titres onboarding :** Quicksand, 26px
- **Titres paramètres :** Quicksand, uppercase
- **Corps :** Nunito, `font-weight: 400`, taille `--font-size-base` (16px min pour mobile)
- **Labels tab bar :** Quicksand
- **Jamais en dessous de 14px** sur mobile

```css
--font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-accent: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Couleurs (custom properties)

```css
:root {
  /* Couleurs principales */
  --color-primary: #2D6A4F;         /* Vert profond — actions principales */
  --color-primary-light: #40916C;   /* Vert clair ajusté (anciennement #52B788) */
  --color-primary-pale: [voir variables.css]; /* Vert très pâle — badges, pilules */
  --color-primary-dark: #1B4332;    /* Vert foncé — titres, header */
  
  /* Secondaire */
  --color-secondary: #F4A261;       /* Orange doux — CTA secondaires */
  --color-secondary-light: #F7C59F;
  
  /* Fond */
  --color-bg: #FAFAFA;
  --color-bg-warm: [voir variables.css]; /* Fond crème — gradient background */
  --color-surface: #FFFFFF;
  
  /* Gamification */
  --color-points: #E9C46A;          /* Jaune — points, étoiles */
  --color-streak: #E76F51;          /* Orange-rouge — streaks (pulsant) */
  --color-reward: #7209B7;          /* Violet — récompenses */
  
  /* Neutres */
  --color-text: #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
  
  /* Équilibre (dashboard) */
  --color-partner-a: #2D6A4F;
  --color-partner-b: #E76F51;
  
  /* Sync indicator (v2) */
  --color-sync-ok: #52B788;
  --color-sync-pending: #F4A261;
  --color-sync-offline: #6B7280;
  
  /* Mascot customizer (v2) */
  --mascot-color-1: #2D6A4F;
  --mascot-color-2: #E76F51;
  --mascot-color-3: #7209B7;
  --mascot-color-4: #0077B6;
  --mascot-color-5: #E63946;
  
  /* Espacements — INCHANGÉS */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Rayons — INCHANGÉS */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Ombres — AJUSTÉES (plus subtiles) */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
  --shadow-fab: [voir variables.css];
}
```

> **⚠️ Instruction pour Claude Code :** En début de session, toujours faire `cat css/variables.css` pour récupérer les valeurs exactes des propriétés marquées `[voir variables.css]`.

### Composants visuels (design actuel)

**Boutons CTA principaux :**
- Background : gradient primaire (vert)
- Shadow portée
- Hover : lift de -2px (`transform: translateY(-2px)`)
- Active : `transform: scale(0.98)`
- `border-radius: var(--radius-full)`

**Boutons secondaires :**
- `border-radius: var(--radius-md)`

**Cartes tâche :**
- Fond blanc, ombre `--shadow-sm`, radius `--radius-md`, padding `--space-md`
- Checkbox 26px
- Hover : `transform: translateX(2px)`
- Badge de points en pilule avec fond `--color-primary-pale`

**Tab bar :**
- Hauteur : 72px
- `backdrop-filter: blur(...)` (glassmorphism)
- Indicateur actif : vert, animé, positionné en haut
- Labels en Quicksand

**Dashboard :**
- Carte équilibre : fond blanc
- Mascotte : fond chaud (gradient warm)
- Streak : animation pulsante
- Barre d'équilibre : gradient orange

**Onboarding :**
- Fond : gradient vert
- Dots de navigation : forme pilule
- Code couple : bordure pointillée
- Titre : 26px Quicksand

**Toasts :**
- Fond sombre, centré
- `border-radius: var(--radius-full)` (pill shape)
- Animation spring (rebond)

**Settings :**
- Titres de section : Quicksand, uppercase
- Couple cards : avatars ronds

---

## 🧩 Composants v2 (nouveaux)

### Indicateur de sync
- Petit cercle coloré (8px) dans le header
- Vert = synchronisé, Orange = sync en cours, Gris = hors ligne
- Tooltip au tap

### Écran "Rejoindre un couple"
- Champ de saisie : 6 caractères, majuscules, monospace
- Style cohérent avec l'onboarding (fond gradient, Quicksand)
- Auto-focus au chargement
- Bouton "Rejoindre" activé quand 6 caractères saisis
- États : chargement, succès, erreur

### Personnalisation mascotte
- Grille de cercles colorés (5 couleurs)
- Grille d'icônes accessoires (5 + "aucun")
- Aperçu en direct
- Bouton "Sauvegarder" (style CTA gradient)
- Choix partagés dans le couple

### Préférences notifications
- Bouton "Activer les notifications" (si permission pas accordée)
- 3 toggles (switch iOS-style) :
  - Tâche validée par le partenaire
  - Rappel quotidien (+ sélecteur d'heure)
  - Streak en danger
- Titres en Quicksand uppercase

---

## ✍️ Règles de nommage

### CSS
- **Convention BEM** : `.block__element--modifier`
- **Custom properties** : `--category-property`

### JavaScript
- **Fichiers :** `kebab-case.js`
- **Variables/fonctions :** `camelCase`
- **Constantes :** `UPPER_SNAKE_CASE`
- **Classes :** `PascalCase`
- **IDs DOM :** `kebab-case`

### Firestore (v2)
- Collections : `camelCase` (`couples`, `tasks`, `rewards`)
- Documents : `coupleCode` comme ID pour `couples`
- Champs : `camelCase` (`partnerA`, `totalPoints`, `fcmToken`)

---

## 🔥 Firebase — Règles et conventions

### Configuration (`firebase-config.js`)
```javascript
// Import modulaire UNIQUEMENT — jamais le SDK complet
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Activer le cache offline Firestore DÈS l'initialisation
enableIndexedDbPersistence(db).catch(err => {
  console.warn('Offline persistence failed:', err.code);
});
```

### store.js — Interface de données
```javascript
// store.js est le SEUL fichier qui touche Firestore
// Les autres fichiers appellent store.getData(), store.saveTask(), etc.

export async function saveTask(task) {
  // 1. Écrire dans Firestore
  // 2. Firestore propage automatiquement aux listeners
  // 3. Le listener dans sync.js met à jour l'UI
}
```

### Listeners temps réel (`sync.js`)
```javascript
// sync.js contient TOUS les listeners Firestore
onSnapshot(tasksRef, snapshot => {
  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTasks(tasks);
});
```

### Règles de sécurité Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /couples/{coupleCode} {
      allow read, write: if request.auth != null && (
        resource.data.partnerA.authUid == request.auth.uid ||
        resource.data.partnerB.authUid == request.auth.uid
      );
      
      match /{subcollection}/{document} {
        allow read, write: if request.auth != null && (
          get(/databases/$(database)/documents/couples/$(coupleCode))
            .data.partnerA.authUid == request.auth.uid ||
          get(/databases/$(database)/documents/couples/$(coupleCode))
            .data.partnerB.authUid == request.auth.uid
        );
      }
    }
  }
}
```

### Architecture Firestore

```
couples/
  {coupleCode}/
    partnerA: { name, avatar, authUid, fcmToken }
    partnerB: { name, avatar, authUid, fcmToken }
    mascot: { color, accessory }
    settings: { theme, notificationsEnabled }
    createdAt: timestamp
    
    tasks/ (sous-collection)
      {taskId}/
        name, points, assignedTo, recurrence
        completedAt, completedBy, createdAt
    
    rewards/ (sous-collection)
      {rewardId}/
        name, pointsCost, icon, description
        unlockedAt
    
    stats/
      current/
        partnerA: { totalPoints, currentStreak, bestStreak }
        partnerB: { totalPoints, currentStreak, bestStreak }
        couplePoints: number
```

---

## 🧠 Bonnes pratiques v2

1. **Toutes les règles v1 restent valides.**
2. **Ne jamais appeler Firestore directement depuis les composants UI.** Passer par `store.js`.
3. **Les listeners sont centralisés dans `sync.js`.**
4. **Gérer les erreurs réseau.** Chaque opération Firebase → `try/catch` → toast d'erreur (pill-shape, fond sombre, animation spring).
5. **Migration transparente.** Si `mimitask_data` existe dans LocalStorage → proposer la migration. Ne jamais supprimer sans confirmation.
6. **Tester avec deux onglets** pour simuler deux partenaires.
7. **Imports Firebase modulaires.** Jamais le SDK complet.
8. **Respecter le design system actuel.** Nunito (body), Quicksand (titres/accents/labels). Gradients sur CTA. Ombres subtiles. Tab bar 72px avec backdrop-filter.
9. **Tester sur mobile d'abord.** DevTools 375px.
10. **Chaque fonctionnalité = un commit.** Messages en français.

---

## 🚫 À éviter absolument

### Règles v1 (toujours valides)
- **Pas de `var`.** `const` par défaut, `let` si nécessaire.
- **Pas de `document.write()`.**
- **Pas de CSS inline** (attribut `style=`).
- **Pas d'`!important`** sauf cas extrême documenté.
- **Pas d'`alert()`, `confirm()`, `prompt()`.** Toasts custom uniquement.
- **Pas de librairie externe** (sauf Firebase).
- **Pas de `setTimeout` pour les animations.** CSS transitions ou `requestAnimationFrame`.
- **Pas de magic numbers.** Custom properties et constantes.
- **Pas de fichiers > 200 lignes.**
- **Pas de logique métier dans les event listeners.**

### Règles v2 (nouvelles)
- **Pas d'import global Firebase.** Modulaire uniquement.
- **Pas d'accès Firestore hors de `store.js`.**
- **Pas de `onSnapshot` dans les composants.** Centralisé dans `sync.js`.
- **Pas de `async/await` sans `try/catch`** pour Firebase.
- **Pas de dépendance à la connexion.** Offline-first.
- **Pas de police Inter.** Remplacée par Nunito + Quicksand.

---

## 🤖 Instructions spécifiques pour Claude Code

### Avant de coder — vérifications obligatoires
1. **Lire ce fichier CLAUDE.md v2**
2. **`cat css/variables.css`** pour les valeurs exactes des tokens
3. **`ls` + `cat package.json`** pour l'état du projet
4. **`cat js/firebase-config.js`** si existant

### Comment raisonner
- **Proposer l'approche avant de coder.** 2-3 phrases max.
- **Tester la sync mentalement.** "Si partenaire A fait X, B voit-il le changement ?"
- **Priorité : sync fonctionnelle > notifications > personnalisation mascotte.**
- **Choix technique non couvert ?** Option la plus simple, documentée.

### Comment proposer du code
- **Un fichier à la fois.**
- **Code complet.** Pas de `// TODO`.
- **Gestion d'erreurs Firebase incluse.**
- **Commentaires sur les interactions Firebase.**
- **Respecter le design system** (Quicksand titres, gradients CTA, ombres subtiles).

### Comment expliquer
- **3-4 phrases max par bloc.**
- **Justifier les choix Firebase en 1 phrase.**
- **Problème de sync ?** Décrire le scénario + 2 solutions max.

### Workflow type par session
1. Lire CLAUDE.md v2
2. `cat css/variables.css`
3. `ls` + `cat package.json`
4. Vérifier config Firebase
5. Demander la fonctionnalité à travailler (ou suivre la roadmap)
6. Proposer l'approche (2-3 phrases)
7. Coder, tester avec deux onglets, committer
8. Résumer ce qui a été fait + ce qui reste

---

## 📋 Roadmap v2 (ordre de développement)

### Phase 1 — Infrastructure
1. 🔲 Setup Vite (config minimale)
2. 🔲 Setup Firebase (projet, config, `firebase-config.js`)
3. 🔲 Auth anonyme (`auth.js`)
4. 🔲 Migration `store.js` → Firestore
5. 🔲 Migration données LocalStorage → Firestore (`migration.js`)

### Phase 2 — Sync couple
6. 🔲 Structure Firestore (collections, security rules)
7. 🔲 Flux "Rejoindre un couple" (onboarding)
8. 🔲 Listeners temps réel (`sync.js`)
9. 🔲 Indicateur de sync (header)
10. 🔲 Tests sync deux onglets / deux appareils

### Phase 3 — Notifications
11. 🔲 Setup FCM
12. 🔲 Cloud Function push (plan Blaze)
13. 🔲 UI préférences notifications
14. 🔲 Notifications : tâche validée, rappel, streak

### Phase 4 — Personnalisation
15. 🔲 Variantes SVG mascotte
16. 🔲 UI personnalisation (Paramètres)
17. 🔲 Sauvegarde Firestore

### Phase 5 — Finalisation
18. 🔲 Déploiement Firebase Hosting
19. 🔲 Migration depuis GitHub Pages
20. 🔲 QA : Lighthouse, accessibilité, cross-browser
21. 🔲 RGPD : politique de confidentialité

---

*Dernière mise à jour : 11 février 2026*
