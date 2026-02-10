# CLAUDE.md — MimiTask

> Ce fichier est lu par Claude Code à chaque session. Il contient toutes les règles et conventions du projet.

---

## 🎯 Objectif du projet

MimiTask est une **PWA mobile-first** qui gamifie les tâches ménagères pour les couples.
L'app utilise un système de points, récompenses et indicateurs d'équilibre pour transformer les corvées en expérience ludique.

**Stack :** HTML/CSS/JS pur — zéro framework, zéro dépendance npm.
**Stockage MVP :** LocalStorage (migration Firebase prévue en v2).
**Déploiement :** GitHub Pages.

---

## 📐 Règles générales

1. **Mobile-first obligatoire.** Tout est designé pour 375px d'abord, puis adapté vers le haut.
2. **Zéro dépendance externe.** Pas de framework, pas de librairie CSS, pas de bundler.
3. **Vanilla JS en ES6+.** Modules ES (`import/export`) avec `type="module"` dans le HTML.
4. **Performance avant tout.** Objectif Lighthouse > 90 partout. Chaque décision doit être justifiée en termes de poids.
5. **Accessibilité WCAG AA.** Contrastes, navigation clavier, ARIA, labels sur tous les inputs.
6. **Code commenté sobrement.** Un commentaire par bloc logique, pas par ligne.

---

## 🧱 Structure des fichiers

```
mimitask/
├── index.html                  # Point d'entrée unique (SPA-like)
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
├── favicon.ico
│
├── css/
│   ├── variables.css           # Custom properties (tokens)
│   ├── reset.css               # Reset minimal
│   ├── base.css                # Typo, layout global
│   ├── components.css          # Boutons, cartes, badges, modals
│   ├── tasks.css               # Écran tâches
│   ├── dashboard.css           # Écran dashboard
│   └── settings.css            # Écran paramètres
│
├── js/
│   ├── app.js                  # Initialisation, routing entre onglets
│   ├── store.js                # Gestion LocalStorage (CRUD)
│   ├── tasks.js                # Logique tâches (ajout, validation, délégation)
│   ├── points.js               # Calcul des points, streaks
│   ├── rewards.js              # Système de récompenses
│   ├── dashboard.js            # Rendu du dashboard, équilibre
│   ├── onboarding.js           # Flow premier lancement
│   ├── mascot.js               # Logique mascotte (humeur réactive)
│   └── utils.js                # Helpers (dates, IDs, animations)
│
├── assets/
│   ├── icons/                  # Icônes PWA (192x192, 512x512)
│   ├── mascot/                 # SVGs de la mascotte (états d'humeur)
│   └── sounds/                 # Sons optionnels (validation, récompense)
│
└── data/
    └── default-tasks.json      # Bibliothèque de tâches prédéfinies
```

### Règles de structure
- **Un fichier JS par responsabilité.** Ne jamais tout mettre dans un seul fichier.
- **CSS découpé par écran + composants.** Charger via `@import` dans un `main.css` ou directement dans le HTML.
- **Pas de dossier `src/` ou `dist/`.** Le projet est servi tel quel (pas de build).

---

## 🎨 Palette & conventions UI

### Couleurs (custom properties)

```css
:root {
  /* Couleurs principales */
  --color-primary: #2D6A4F;       /* Vert profond — actions principales */
  --color-primary-light: #52B788; /* Vert clair — accents, succès */
  --color-primary-dark: #1B4332;  /* Vert foncé — titres, header */
  
  /* Secondaire */
  --color-secondary: #F4A261;     /* Orange doux — CTA secondaires, alertes */
  --color-secondary-light: #F7C59F;
  
  /* Gamification */
  --color-points: #E9C46A;        /* Jaune — points, étoiles */
  --color-streak: #E76F51;        /* Orange-rouge — streaks */
  --color-reward: #7209B7;        /* Violet — récompenses */
  
  /* Neutres */
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-text: #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
  
  /* Équilibre (dashboard) */
  --color-partner-a: #2D6A4F;    /* Partenaire 1 */
  --color-partner-b: #E76F51;    /* Partenaire 2 */
  
  /* Espacements */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Rayons */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  
  /* Typo */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.5rem;    /* 24px */
  --font-size-2xl: 2rem;     /* 32px */
}
```

### Typographie
- **Police principale :** Inter (Google Fonts) avec fallback system.
- **Titres :** `font-weight: 700`, tailles `--font-size-xl` à `--font-size-2xl`.
- **Corps :** `font-weight: 400`, taille `--font-size-base` (16px min pour mobile).
- **Jamais en dessous de 14px** sur mobile.

### Composants visuels
- **Boutons :** `border-radius: var(--radius-full)` pour les CTA principaux, `var(--radius-md)` pour les secondaires.
- **Cartes tâche :** Fond blanc, ombre `--shadow-sm`, radius `--radius-md`, padding `--space-md`.
- **Tab bar :** Fixée en bas, 3 icônes avec label, élément actif en `--color-primary`.
- **Animations :** Transitions CSS de 200-300ms. Pas d'animation > 500ms sauf confetti de validation.

---

## 🧩 Composants à privilégier

### Liste de tâches
- Chaque tâche = une carte avec : nom, points, assignation (avatar/initiale), bouton de validation.
- Swipe-to-complete OU checkbox animée (au choix, mais un seul pattern).
- Badge de points visible (+X pts).

### Barre d'équilibre
- Barre horizontale bicolore (partenaire A vs B).
- Pourcentage affiché de chaque côté.
- Animation fluide quand la proportion change.

### Mascotte
- SVG simple avec 3-5 états : content (équilibre > 40/60), neutre (30-40%), triste (< 30%), excité (streak > 5 jours).
- Placeholder MVP : emoji 🦕 avec texte réactif sous l'emoji.

### Modal/Bottom sheet
- Pour : ajouter tâche, créer récompense, déléguer.
- Animation slide-up depuis le bas sur mobile.

---

## ✍️ Règles de nommage

### CSS
- **Convention BEM** : `.block__element--modifier`
- Exemples : `.task-card__title`, `.task-card--completed`, `.tab-bar__item--active`
- **Custom properties** : `--category-property` (ex: `--color-primary`, `--space-md`)

### JavaScript
- **Fichiers :** `kebab-case.js` (ex: `default-tasks.json`)
- **Variables/fonctions :** `camelCase` (ex: `getTasksByPartner()`)
- **Constantes :** `UPPER_SNAKE_CASE` (ex: `MAX_POINTS_PER_TASK`)
- **Classes :** `PascalCase` (ex: `TaskManager`)
- **IDs DOM :** `kebab-case` (ex: `id="task-list"`)

### LocalStorage
- **Clé unique :** `mimitask_data`
- **Structure JSON :**

```json
{
  "couple": {
    "partnerA": { "name": "", "avatar": "" },
    "partnerB": { "name": "", "avatar": "" },
    "coupleCode": ""
  },
  "tasks": [
    {
      "id": "uuid",
      "name": "Vaisselle",
      "points": 10,
      "assignedTo": "partnerA",
      "recurrence": "daily",
      "completedAt": null,
      "createdAt": "ISO-date"
    }
  ],
  "rewards": [
    {
      "id": "uuid",
      "name": "Restaurant",
      "pointsCost": 200,
      "unlockedAt": null
    }
  ],
  "stats": {
    "partnerA": { "totalPoints": 0, "currentStreak": 0, "bestStreak": 0 },
    "partnerB": { "totalPoints": 0, "currentStreak": 0, "bestStreak": 0 },
    "couplePoints": 0
  },
  "settings": {
    "theme": "default",
    "onboardingDone": false
  }
}
```

---

## 🧠 Bonnes pratiques

1. **Tester sur mobile d'abord.** Utiliser DevTools en mode responsive (375px).
2. **Chaque fonctionnalité = un commit.** Messages de commit clairs en français : `feat: ajout système de points`, `fix: correction calcul streaks`.
3. **Séparer logique et rendu.** `store.js` gère les données, les autres fichiers gèrent l'affichage.
4. **Pas de manipulation DOM brute en boucle.** Construire le HTML en string ou avec `DocumentFragment`, puis injecter en une fois.
5. **Gérer le state via store.js.** Toute modification de données passe par `store.js` qui sauvegarde automatiquement dans LocalStorage.
6. **Feedback utilisateur systématique.** Chaque action (validation, ajout, suppression) doit avoir un retour visuel immédiat.
7. **Penser à la migration Firebase.** La structure de données dans `store.js` doit être compatible avec Firestore. Ne pas stocker de fonctions ou de références circulaires.

---

## 🚫 À éviter absolument

- **Pas de `var`.** Utiliser `const` par défaut, `let` quand nécessaire.
- **Pas de `document.write()`.** Jamais.
- **Pas de CSS inline** (attribut `style=`). Tout en fichiers CSS.
- **Pas d'`!important`** sauf cas extrême documenté.
- **Pas d'`alert()`, `confirm()`, `prompt()`.** Utiliser des modals/toasts custom.
- **Pas de librairie externe** (pas de jQuery, pas de Lodash, pas de Moment.js).
- **Pas de `setTimeout` pour les animations.** Utiliser CSS transitions/animations ou `requestAnimationFrame`.
- **Pas de magic numbers.** Utiliser les custom properties CSS et les constantes JS.
- **Pas de fichiers > 200 lignes.** Découper si ça dépasse.
- **Pas de logique métier dans les event listeners.** Appeler une fonction dédiée.

---

## 🤖 Instructions spécifiques pour Claude Code

### Comment raisonner
- **Avant de coder, toujours vérifier** le cahier des charges et ce fichier CLAUDE.md.
- **Proposer l'approche avant de coder.** Expliquer en 2-3 phrases ce que tu vas faire et pourquoi.
- **Si un choix technique n'est pas couvert ici**, choisir l'option la plus simple et la documenter.
- **Priorité : faire fonctionner > faire joli > faire parfait.** On itère.

### Comment proposer du code
- **Un fichier à la fois.** Ne pas générer 5 fichiers d'un coup sans explication.
- **Code complet et fonctionnel.** Pas de `// TODO` ni de `...` pour abréger.
- **Commenter les blocs logiques**, pas chaque ligne.
- **Tester mentalement le code** avant de le proposer. Est-ce que ça marche sur mobile ? Est-ce que le LocalStorage est bien sauvegardé ?

### Comment expliquer
- **Court et clair.** Maximum 3-4 phrases d'explication par bloc de code.
- **Pas de cours magistral.** L'utilisateur connaît les bases — expliquer le "pourquoi" pas le "quoi".
- **Si tu fais un choix technique**, justifie-le en 1 phrase.
- **Si tu rencontres un problème**, explique-le clairement et propose 2 solutions max.

### Workflow type par session
1. Lire ce fichier CLAUDE.md
2. Vérifier l'état actuel du projet (`ls`, vérifier les fichiers existants)
3. Demander quelle fonctionnalité travailler (ou suivre la roadmap)
4. Proposer l'approche en 2-3 phrases
5. Coder, tester, committer
6. Résumer ce qui a été fait et ce qui reste

---

## 📋 Roadmap MVP (ordre de développement)

1. ✅ Structure de base (HTML, CSS tokens, navigation onglets)
2. ✅ Store.js (CRUD LocalStorage)
3. 🔲 Onboarding (création couple)
4. 🔲 Bibliothèque de tâches prédéfinies
5. 🔲 Écran Tâches (liste, ajout, validation 1-tap)
6. 🔲 Système de points
7. 🔲 Écran Dashboard (équilibre, scores)
8. 🔲 Système de récompenses
9. 🔲 Délégation ("passe ton tour")
10. 🔲 Récurrence automatique
11. 🔲 Mascotte réactive (placeholder SVG/emoji)
12. 🔲 Streaks
13. 🔲 PWA (manifest + service worker)
14. 🔲 Déploiement GitHub Pages
15. 🔲 Tests & optimisation Lighthouse

---

*Dernière mise à jour : Février 2026*
