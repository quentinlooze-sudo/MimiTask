# 🤖 MimiTask — Agent 06 : Prompts Vibecoding

> **15 prompts structurés, dans l'ordre de la roadmap, prêts à copier-coller dans Claude Code.**
> Chaque prompt est autosuffisant : il rappelle le contexte, les conventions et le résultat attendu.

*Version 1.0 — Février 2026*

---

## 📋 Table des prompts

| # | Fonctionnalité | Fichiers produits |
|---|---|---|
| 1 | Structure de base | `index.html`, `css/variables.css`, `css/reset.css`, `css/base.css`, `css/components.css` |
| 2 | Store.js | `js/store.js`, `js/utils.js` |
| 3 | Onboarding | `js/onboarding.js`, `css/onboarding.css` |
| 4 | Bibliothèque de tâches | `data/default-tasks.json`, `data/default-rewards.json` (intégration) |
| 5 | Écran Tâches | `js/tasks.js`, `css/tasks.css` |
| 6 | Système de points | `js/points.js` |
| 7 | Dashboard | `js/dashboard.js`, `css/dashboard.css` |
| 8 | Récompenses | `js/rewards.js` |
| 9 | Délégation | Extension de `js/tasks.js` |
| 10 | Récurrence automatique | Extension de `js/tasks.js` + `js/store.js` |
| 11 | Mascotte réactive | `js/mascot.js`, `data/mascot-phrases.json` |
| 12 | Streaks | Extension de `js/points.js` + `js/dashboard.js` |
| 13 | PWA | `manifest.json`, `sw.js` |
| 14 | Tests & polish | Corrections, animations finales, responsive |
| 15 | Déploiement | README.md, `.gitignore`, config GitHub Pages |

---

## ⚡ Prompt 1 — Structure de base (HTML, CSS tokens, navigation onglets)

```markdown
# Contexte
Tu travailles sur MimiTask, une PWA mobile-first qui gamifie les tâches ménagères pour les couples.
Lis le fichier CLAUDE.md à la racine du projet avant de coder — il contient TOUTES les conventions.

Stack : HTML/CSS/JS pur — zéro framework, zéro dépendance npm.
Stockage : LocalStorage. Déploiement : GitHub Pages.

# Objectif
Créer la structure de base du projet : le fichier HTML principal (SPA-like) et les fichiers CSS fondamentaux (tokens, reset, base, composants).

# Fichiers à créer

## 1. index.html
- Point d'entrée unique (SPA-like, navigation par onglets)
- Sémantique HTML5 : `<header>`, `<main>`, `<nav>`, `<section>`
- 3 sections principales masquées/affichées par JS :
  - `<section id="screen-tasks">` — Écran Tâches (affiché par défaut)
  - `<section id="screen-dashboard">` — Écran Dashboard
  - `<section id="screen-settings">` — Écran Paramètres
- Section overlay pour l'onboarding : `<section id="screen-onboarding">` (masquée si onboarding déjà fait)
- Tab bar fixée en bas avec 3 onglets :
  - 🏠 Tâches (icône checklist SVG inline + label "Tâches")
  - 🏆 Dashboard (icône chart/trophy SVG inline + label "Dashboard")
  - ⚙️ Paramètres (icône gear SVG inline + label "Paramètres")
- Onglet actif : classe `.tab-bar__item--active` avec couleur `--color-primary`
- Attributs ARIA : `role="tablist"` sur la nav, `role="tab"` + `aria-selected` sur chaque onglet, `role="tabpanel"` sur chaque section
- Charger les CSS via `<link>` (pas d'@import pour la perf)
- Charger `js/app.js` avec `type="module"` en fin de body
- Google Font Inter (preconnect + display=swap)
- Meta viewport, charset UTF-8, lang="fr"
- Zone pour les toasts : `<div id="toast-container" aria-live="polite"></div>`
- Favicon placeholder

## 2. css/variables.css
Reprendre EXACTEMENT les custom properties du CLAUDE.md :
- Couleurs principales, secondaires, gamification, neutres, partenaires
- Espacements (--space-xs à --space-2xl)
- Rayons (--radius-sm à --radius-full)
- Ombres (--shadow-sm à --shadow-lg)
- Typographie (--font-family, --font-size-xs à --font-size-2xl)
- Ajouter les tokens manquants :
  - `--transition-fast: 200ms ease`
  - `--transition-normal: 300ms ease`
  - `--z-tab-bar: 100`
  - `--z-modal: 200`
  - `--z-toast: 300`
  - `--tab-bar-height: 64px`

## 3. css/reset.css
Reset minimal :
- `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
- `html { -webkit-text-size-adjust: 100%; }` 
- `body { min-height: 100dvh; }` (dvh pour mobile)
- Images/SVG responsives : `max-width: 100%; display: block;`
- Boutons/inputs : `font: inherit; color: inherit;`
- Listes : `list-style: none;`
- Liens : `text-decoration: none; color: inherit;`

## 4. css/base.css
- Body : font-family var(--font-family), font-size var(--font-size-base), color var(--color-text), background var(--color-bg)
- Typographie : styles pour h1-h3 (tailles du CLAUDE.md, font-weight 700)
- Main : `padding-bottom: var(--tab-bar-height)` pour compenser la tab bar fixe
- Classe utilitaire `.visually-hidden` pour l'accessibilité (sr-only)
- Focus visible : outline 2px solid var(--color-primary), offset 2px

## 5. css/components.css
Composants de base (convention BEM) :
- `.tab-bar` : fixée en bas, flex, bg white, shadow-md, height var(--tab-bar-height), z-index var(--z-tab-bar)
- `.tab-bar__item` : flex column, center, font-size-xs, color text-secondary, padding-sm, min-width 44px, min-height 44px (zone tactile WCAG)
- `.tab-bar__item--active` : color primary
- `.tab-bar__icon` : 24x24px
- `.btn` : base bouton (padding, border-radius, font-weight 600, transition, cursor pointer, min-height 44px)
- `.btn--primary` : bg primary, color white, radius-full
- `.btn--secondary` : bg transparent, border primary, color primary, radius-md
- `.btn--ghost` : bg transparent, color text-secondary
- `.btn--icon` : padding 8px, radius-full
- `.toast` : position fixed, bottom calc(tab-bar-height + space-md), left/right space-md, bg surface, shadow-lg, radius-md, padding-md, z-index var(--z-toast), transform translateY(100px), opacity 0, transition
- `.toast--visible` : transform translateY(0), opacity 1
- `.toast--success` : left border 4px solid primary-light
- `.toast--error` : left border 4px solid streak
- Sections écrans : `.screen { display: none; }` `.screen--active { display: block; }`
- `.modal-overlay` : position fixed, inset 0, bg rgba(0,0,0,0.5), z-index var(--z-modal), display none
- `.modal-overlay--active` : display flex, align-items flex-end (bottom sheet)
- `.modal` : bg surface, radius-lg radius-lg 0 0, padding space-lg, width 100%, max-height 90vh, overflow-y auto, animation slide-up 300ms ease
- `.card` : bg surface, shadow-sm, radius-md, padding-md

## 6. js/app.js
- Module ES6, point d'entrée principal
- Importer les modules nécessaires (pour l'instant vide, juste la navigation)
- Fonction `initNavigation()` : gérer les clics sur la tab bar, toggler `.screen--active` et `.tab-bar__item--active`, mettre à jour aria-selected
- Fonction `showToast(message, type = 'success', duration = 3000)` : créer le toast, l'afficher, le retirer après la durée
- DOMContentLoaded : appeler initNavigation(), vérifier si onboarding nécessaire
- Exporter les fonctions utilitaires

# Contraintes
- Convention BEM stricte pour le CSS
- Mobile-first : base = 375px, pas de media query pour le moment (prompt 14)
- Zones tactiles minimum 44x44px partout
- Jamais de !important, jamais de CSS inline
- Code commenté sobrement (1 commentaire par bloc logique)
- Pas de fichier JS > 200 lignes

# Résultat attendu
En ouvrant index.html dans un navigateur (DevTools 375px) :
- ✅ La tab bar s'affiche en bas avec les 3 onglets
- ✅ Cliquer sur un onglet affiche la section correspondante
- ✅ L'onglet actif est visuellement distinct (couleur verte)
- ✅ La page utilise les custom properties (couleurs, espacements cohérents)
- ✅ Le toast fonctionne si on l'appelle en console : `showToast('Test !', 'success')`
```

---

## ⚡ Prompt 2 — Store.js (module CRUD LocalStorage)

```markdown
# Contexte
Tu travailles sur MimiTask. Le projet a déjà :
- index.html avec navigation 3 onglets fonctionnelle
- CSS : variables.css, reset.css, base.css, components.css
- js/app.js avec navigation et système de toasts

Lis CLAUDE.md pour la structure JSON LocalStorage attendue (clé : `mimitask_data`).

# Objectif
Créer le module de persistance `store.js` et le module utilitaire `utils.js`. 
Le store est le CŒUR de l'app : toute modification de données passe par lui.

# Fichiers à créer

## 1. js/utils.js
Module utilitaire avec fonctions réutilisables :
- `generateId()` : retourne un UUID v4 simplifié (timestamp + random, ex: `t_1707123456789_x7k2`)
- `generateCoupleCode()` : retourne un code de 6 caractères format `MIM-XXX` (lettres majuscules + chiffres)
- `formatDate(isoString)` : retourne une date lisible en français (ex: "10 fév. 2026")
- `isToday(isoString)` : vérifie si une date ISO est aujourd'hui
- `isSameDay(date1, date2)` : compare deux dates (jour seulement)
- `getDaysDifference(date1, date2)` : nombre de jours entre deux dates
- `debounce(fn, delay)` : debounce classique pour les events

## 2. js/store.js
Module de gestion des données avec LocalStorage.

**Clé unique :** `mimitask_data`

**Structure JSON initiale** (conforme au CLAUDE.md) :
```json
{
  "couple": {
    "partnerA": { "name": "", "avatar": "" },
    "partnerB": { "name": "", "avatar": "" },
    "coupleCode": ""
  },
  "tasks": [],
  "rewards": [],
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

**API du store (fonctions exportées) :**

Initialisation :
- `init()` : charge les données existantes ou crée la structure initiale. Retourne les données.
- `getData()` : retourne l'objet complet
- `save()` : sérialise et sauvegarde dans LocalStorage (appelé automatiquement après chaque modification)
- `isOnboardingDone()` : retourne settings.onboardingDone
- `setOnboardingDone()` : passe onboardingDone à true + save

Couple :
- `setCouple(nameA, nameB)` : configure les noms + génère coupleCode
- `getCouple()` : retourne l'objet couple
- `getCoupleCode()` : retourne le code couple

Tâches :
- `getTasks()` : retourne toutes les tâches
- `getTasksByPartner(partnerId)` : filtre par "partnerA" ou "partnerB"
- `getTodayTasks()` : retourne les tâches actives aujourd'hui (non complétées aujourd'hui)
- `addTask({ name, points, assignedTo, recurrence, icon, category })` : crée avec ID + createdAt
- `completeTask(taskId, partnerId)` : marque completedAt = now, retourne les points gagnés
- `deleteTask(taskId)` : supprime une tâche
- `addDefaultTasks(tasksArray)` : importe les tâches prédéfinies depuis le JSON

Récompenses :
- `getRewards()` : retourne toutes les récompenses
- `addReward({ name, pointsCost, description, icon })` : crée avec ID
- `unlockReward(rewardId)` : marque unlockedAt = now
- `deleteReward(rewardId)` : supprime
- `addDefaultRewards(rewardsArray)` : importe les récompenses prédéfinies

Stats :
- `getStats()` : retourne l'objet stats complet
- `addPoints(partnerId, points)` : incrémente les points individuels + couple + save
- `getBalance()` : retourne { partnerA: %, partnerB: % } basé sur les points totaux
- `updateStreak(partnerId, newStreak)` : met à jour currentStreak + bestStreak si record

Export / Reset :
- `exportData()` : retourne le JSON stringifié (pour backup)
- `importData(jsonString)` : parse et remplace les données
- `resetAll()` : supprime la clé et réinitialise

**Règles critiques :**
- Chaque fonction qui modifie les données DOIT appeler `save()` à la fin
- Les données retournées doivent être des copies (pas des références directes) pour éviter les mutations accidentelles
- Structure compatible Firestore (pas de fonctions, pas de références circulaires)
- Valider les inputs (pas de points négatifs, pas de noms vides)

# Contraintes
- Module ES6 pur (import/export)
- Pas de classe, juste des fonctions exportées (pattern module)
- Utiliser const par défaut, let quand nécessaire
- Chaque fonction documentée en 1 ligne de commentaire
- Fichier < 200 lignes (découper si nécessaire)

# Résultat attendu
En console du navigateur :
- ✅ `store.init()` crée la structure dans LocalStorage
- ✅ `store.setCouple('Léa', 'Thomas')` sauvegarde les noms + génère un code
- ✅ `store.addTask({name: 'Vaisselle', points: 10, assignedTo: 'partnerA', recurrence: 'daily'})` crée une tâche
- ✅ `store.completeTask(taskId, 'partnerA')` met à jour completedAt et les stats
- ✅ Fermer et rouvrir le navigateur → les données persistent
- ✅ `store.getBalance()` retourne les pourcentages corrects
```

---

## ⚡ Prompt 3 — Onboarding (flow 5 étapes)

```markdown
# Contexte
MimiTask a déjà :
- index.html avec navigation onglets + zone onboarding
- CSS complet (variables, reset, base, components)
- js/app.js (navigation, toasts)
- js/store.js (CRUD LocalStorage complet)
- js/utils.js (helpers)

Fichiers de données disponibles : data/default-tasks.json, data/default-rewards.json
Copy UX disponible dans le fichier ux-copy.json (section "onboarding")

# Objectif
Implémenter le flow d'onboarding en 5 étapes, plein écran, qui s'affiche au premier lancement.

# Fichiers à créer/modifier

## 1. css/onboarding.css
Styles spécifiques au flow onboarding :
- `.onboarding` : plein écran (position fixed, inset 0), bg white, z-index 250, flex column
- `.onboarding__step` : display none par défaut, flex column, center, padding space-xl, min-height 100dvh
- `.onboarding__step--active` : display flex
- `.onboarding__progress` : dots indicateurs (5 dots), celui actif en --color-primary
- `.onboarding__title` : font-size-xl, font-weight 700, text-align center, margin-bottom space-md
- `.onboarding__subtitle` : font-size-base, color text-secondary, text-align center, margin-bottom space-lg
- `.onboarding__input` : width 100%, padding space-md, border 1px solid --color-border, radius-md, font-size-base, focus: border-color primary
- `.onboarding__input--error` : border-color streak
- `.onboarding__back-btn` : position absolute, top space-md, left space-md, btn--ghost
- `.onboarding__task-grid` : grid de sélection de tâches, scroll vertical, gap space-sm
- `.onboarding__task-chip` : card avec checkbox visuelle, icon + nom + points, toggleable
- `.onboarding__task-chip--selected` : border-color primary, bg primary-light/10%
- `.onboarding__couple-code` : grand affichage du code (font-size-2xl, font-weight 700, letter-spacing, text-align center, bg surface, padding)

## 2. js/onboarding.js
Module gérant le flow complet :

**Étape 1 — Bienvenue**
- Titre : "Bienvenue sur MimiTask !" (depuis ux-copy.json)
- Sous-titre : "Transformez vos corvées en jeu d'équipe."
- Emoji mascotte 🦖 en grand (120px)
- CTA : "C'est parti !" → passe à l'étape 2
- Pas de bouton retour

**Étape 2 — Noms du couple**
- Titre : "Qui fait équipe ?"
- 2 inputs : "Prénom du partenaire 1" et "Prénom du partenaire 2"
- Validation : min 2 caractères par prénom, bouton "Suivant" disabled tant que non valide
- Feedback visuel si champ vide au submit (border rouge + shake animation)
- Bouton retour vers étape 1

**Étape 3 — Sélection des tâches**
- Titre : "Quelles tâches pour votre duo ?"
- Sous-titre : "Choisissez dans la liste ou créez les vôtres. Vous pourrez toujours modifier plus tard."
- Charger default-tasks.json et afficher en grille scrollable
- 10 tâches présélectionnées par défaut (les plus courantes)
- Toggle sélection au tap sur chaque chip (icon + nom + points)
- Bouton "+ Ajouter une tâche perso" (ouvre un petit formulaire inline : nom + points)
- Minimum 1 tâche sélectionnée pour continuer
- Compteur : "X tâches sélectionnées"

**Étape 4 — Première récompense**
- Titre : "Votre première récompense !"
- Sous-titre : "Motivez-vous avec une récompense à débloquer ensemble."
- 2 inputs : nom de la récompense + coût en points
- CTA : "Créer la récompense"
- Lien discret : "Plus tard" (skip, passe directement à l'étape 5)

**Étape 5 — Code couple**
- Titre : "Votre code couple"
- Sous-titre : "Gardez ce code précieusement. Il servira à synchroniser vos données plus tard."
- Affichage grand du code généré (format MIM-XXX)
- Bouton "Copier le code" → clipboard API + toast "Code copié !"
- CTA : "Commencer !" → ferme l'onboarding, affiche l'écran tâches

**Logique transversale :**
- Indicateur de progression (5 dots) mis à jour à chaque étape
- Animation de transition entre étapes (slide horizontal, 300ms)
- À l'étape finale : appeler store.setCouple(), store.addDefaultTasks(), store.addDefaultRewards() (si récompense créée: store.addReward()), store.setOnboardingDone()
- Si onboardingDone === true au chargement, ne pas afficher l'onboarding

## 3. Modifier js/app.js
- Au DOMContentLoaded, vérifier store.isOnboardingDone()
- Si false : afficher l'onboarding (import et init onboarding.js)
- Si true : afficher l'écran tâches directement

## 4. Modifier index.html
- Ajouter le HTML de l'onboarding dans la section `#screen-onboarding` :
  - 5 étapes avec leur structure
  - Progress dots
  - Tous les inputs et boutons
- Charger css/onboarding.css

# Contraintes
- Convention BEM pour le CSS
- Pas de manipulation DOM en boucle — construire le HTML des tâches via DocumentFragment ou template literal + innerHTML une seule fois
- Les textes doivent correspondre EXACTEMENT au ux-copy.json
- Zones tactiles 44x44px minimum sur les chips et boutons
- Transitions CSS, pas de setTimeout pour les animations
- Gérer le focus : quand on passe à une étape, le focus va sur le premier élément interactif

# Résultat attendu
- ✅ Premier lancement : l'onboarding s'affiche plein écran
- ✅ Les 5 étapes se déroulent correctement avec transitions
- ✅ Les validations bloquent si les champs sont vides
- ✅ Les tâches s'affichent depuis le JSON, le toggle fonctionne
- ✅ Le code couple se copie dans le clipboard
- ✅ Après "Commencer", l'écran Tâches s'affiche avec les données enregistrées
- ✅ Relancer l'app → l'onboarding ne réapparaît pas
```

---

## ⚡ Prompt 4 — Bibliothèque de tâches + ajout custom

```markdown
# Contexte
MimiTask a déjà : structure HTML/CSS, store.js, onboarding complet.
Les données default-tasks.json et default-rewards.json sont dans le dossier data/.
Le store a déjà les méthodes addTask(), deleteTask(), getTasks().

# Objectif
S'assurer que la bibliothèque de tâches prédéfinies est correctement intégrée dans le store et accessible depuis l'écran Paramètres. Créer le formulaire d'ajout de tâche custom (modal bottom sheet).

# Fichiers à créer/modifier

## 1. Vérifier data/default-tasks.json
Le fichier doit contenir les 28 tâches organisées par catégorie :
- cuisine (6 tâches), menage (6), linge (4), courses (4), administratif (3), divers (5)
- Chaque tâche : id, name, category, points (1-20), recurrence, icon (emoji)

## 2. Vérifier data/default-rewards.json
10 récompenses avec id, name, pointsCost (50 à 400), description, icon (emoji)

## 3. Modifier index.html
Ajouter dans #screen-tasks :
- FAB (bouton flottant) en bas à droite, au-dessus de la tab bar : `<button class="fab" id="fab-add-task" aria-label="Ajouter une tâche">+</button>`
- Modal d'ajout de tâche (bottom sheet) avec le formulaire :
  - Input : Nom de la tâche
  - Input number : Points (1-20, slider ou input)
  - Select : Assignation (Partenaire A / Partenaire B / Aléatoire) — noms dynamiques
  - Select : Récurrence (Unique / Chaque jour / Chaque semaine / Chaque mois)
  - Bouton "Ajouter"
  - Bouton fermer (X) en haut à droite

## 4. Ajouter styles dans css/components.css ou css/tasks.css
- `.fab` : position fixed, bottom calc(tab-bar-height + space-lg), right space-lg, width 56px, height 56px, radius-full, bg primary, color white, font-size-xl, shadow-lg, z-index 50, transition scale
- `.fab:active` : transform scale(0.9)
- Styles du formulaire dans la modal (labels, inputs, select, spacing)

## 5. Logique JS (dans tasks.js ou un module dédié)
- Ouvrir la modal au clic sur le FAB
- Remplir dynamiquement le select d'assignation avec les noms du couple (store.getCouple())
- Option "Aléatoire" : au submit, assigner random entre partnerA et partnerB
- Validation : nom non vide, points entre 1 et 20
- Au submit : appeler store.addTask() + fermer la modal + toast "Tâche ajoutée !" + rafraîchir la liste
- Fermer la modal : clic sur overlay, clic sur X, touche Escape

# Résultat attendu
- ✅ Le FAB est visible sur l'écran Tâches, bien positionné
- ✅ Clic sur FAB → modal slide-up avec le formulaire
- ✅ Le formulaire est pré-rempli avec les noms du couple
- ✅ L'ajout crée bien la tâche dans le store + toast
- ✅ La modal se ferme proprement (overlay, X, Escape)
- ✅ Le focus est piégé dans la modal quand elle est ouverte (accessibilité)
```

---

## ⚡ Prompt 5 — Écran Tâches (liste, filtres, validation 1-tap)

```markdown
# Contexte
MimiTask a : structure, store, onboarding, FAB + modal d'ajout.
Copy UX pour l'écran tâches dans ux-copy.json (section "tasks").

# Objectif
Construire l'écran Tâches complet : header avec filtres, liste dynamique des tâches, validation 1-tap avec feedback visuel.

# Fichiers à créer/modifier

## 1. css/tasks.css
- `.tasks-header` : padding, flex between, sticky top 0, bg white, z-index 10
- `.tasks-header__title` : font-size-xl, "Aujourd'hui"
- `.tasks-filters` : flex, gap space-sm, overflow-x auto, scrollbar hidden, padding-bottom space-sm
- `.tasks-filter-chip` : padding space-xs space-md, radius-full, border 1px solid border, font-size-sm, white-space nowrap, min-height 36px
- `.tasks-filter-chip--active` : bg primary, color white, border-color primary
- `.task-list` : flex column, gap space-sm, padding space-md
- `.task-card` : flex row, align-items center, bg surface, shadow-sm, radius-md, padding space-md, gap space-md, transition transform 200ms, position relative
- `.task-card--completed` : opacity 0.5, text-decoration line-through sur le titre
- `.task-card__check` : width 44px, height 44px, radius-full, border 2px solid border, flex center, cursor pointer, transition. Au check : bg primary-light, border-color primary, icône ✓ en blanc
- `.task-card__info` : flex column, flex 1
- `.task-card__name` : font-weight 600
- `.task-card__meta` : font-size-sm, color text-secondary (points + assignation)
- `.task-card__icon` : font-size-lg (emoji de la tâche)
- `.task-card__points` : font-size-sm, font-weight 700, color points
- `.task-card__avatar` : width 32px, height 32px, radius-full, bg primary ou partner-b, color white, flex center, font-size-sm, font-weight 700 (initiale du partenaire)
- Empty states : `.empty-state` : flex column, center, padding space-2xl, text-align center
- `.empty-state__icon` : font-size 48px, margin-bottom space-md
- `.empty-state__title` : font-size-lg, font-weight 600
- `.empty-state__subtitle` : color text-secondary, margin-bottom space-md

## 2. js/tasks.js
Module de gestion de l'écran tâches :

**Rendu de la liste :**
- `renderTaskList(filter = 'all')` : 
  - Récupérer les tâches du jour via store
  - Filtrer selon le filtre actif (all, partnerA, partnerB)
  - Construire le HTML via template literal + DocumentFragment
  - Chaque carte affiche : emoji, nom, points, avatar/initiale du partenaire assigné, bouton check
  - Si aucune tâche : afficher l'empty state correspondant (ux-copy.json)
  - Si toutes complétées : afficher "Tout est fait ! 🎉"

**Filtres :**
- 3 chips : "Toutes", "Mes tâches", "Tâches de {partnerName}"
- Remplir dynamiquement avec les noms du couple
- Au clic : toggler la classe active + re-render la liste

**Validation 1-tap :**
- Event delegation sur la task-list (pas un listener par carte)
- Au clic sur le bouton check d'une tâche :
  1. Appeler store.completeTask(taskId, partnerId)
  2. Animation : check vert ✓ apparaît, la carte slide légèrement
  3. Afficher toast "+{points} pts ! Bien joué !"
  4. Re-render la liste après un court délai (500ms pour laisser l'animation)
  5. Mettre à jour les stats (sera connecté au dashboard plus tard)

**Initialisation :**
- Fonction `initTasks()` exportée, appelée depuis app.js
- Charger les filtres, render la liste
- Attacher les event listeners (filtres + validation + FAB)

## 3. Modifier js/app.js
- Importer et appeler `initTasks()` au chargement
- Quand on switch vers l'onglet Tâches : re-render la liste (pour refléter les changements)

## 4. Modifier index.html
- Dans #screen-tasks : ajouter la structure HTML (header, filtres, zone liste, empty states)

# Contraintes
- Event delegation obligatoire sur la liste
- DocumentFragment pour le rendu (pas de DOM manipulation en boucle)
- Les avatars utilisent les couleurs des partenaires (--color-partner-a et --color-partner-b)
- Animation de validation en CSS pur (transition + keyframes), pas de JS setTimeout

# Résultat attendu
- ✅ La liste des tâches s'affiche avec les données du store
- ✅ Les filtres fonctionnent (Toutes / Mes tâches / Partenaire)
- ✅ Cliquer sur le check d'une tâche → animation + toast + mise à jour
- ✅ Quand toutes les tâches sont faites → empty state "Tout est fait !"
- ✅ Quand aucune tâche → empty state avec CTA "Ajouter une tâche"
- ✅ L'interface est fluide et réactive sur mobile 375px
```

---

## ⚡ Prompt 6 — Système de points

```markdown
# Contexte
MimiTask a : structure, store, onboarding, écran tâches avec validation.
La validation 1-tap appelle déjà store.completeTask() et store.addPoints().

# Objectif
Créer le module points.js qui centralise toute la logique de calcul des points, bonus et vérification des seuils de récompense.

# Fichier à créer

## js/points.js

**Constantes :**
- `STREAK_BONUS_THRESHOLD = 3` (bonus à partir de 3 jours)
- `STREAK_BONUS_MULTIPLIER = 1.5` (multiplicateur x1.5 après le seuil)
- `MAX_POINTS_PER_TASK = 20`

**Fonctions exportées :**

- `calculateTaskPoints(basePoints, currentStreak)` : 
  - Si streak >= STREAK_BONUS_THRESHOLD : retourne Math.round(basePoints * STREAK_BONUS_MULTIPLIER)
  - Sinon : retourne basePoints
  - Jamais > MAX_POINTS_PER_TASK * STREAK_BONUS_MULTIPLIER

- `processTaskCompletion(taskId, partnerId)` :
  - Récupérer la tâche depuis le store
  - Calculer les points (avec bonus streak éventuel)
  - Appeler store.addPoints(partnerId, points)
  - Appeler store.completeTask(taskId, partnerId)
  - Vérifier si une récompense est débloquée (checkRewardUnlock())
  - Retourner { points, bonusApplied, rewardUnlocked }

- `checkRewardUnlock()` :
  - Récupérer les points couple depuis store.getStats()
  - Parcourir les récompenses non débloquées (store.getRewards())
  - Si couplePoints >= rewardCost pour une récompense → store.unlockReward() + retourner la récompense
  - Retourner null si aucune débloquée

- `getNextReward()` :
  - Trouver la récompense non débloquée la moins chère
  - Retourner { name, pointsCost, remaining } (remaining = coût - couplePoints)
  - Retourner null si toutes débloquées

- `getWeeklyStats(partnerId)` :
  - Compter les tâches validées cette semaine par ce partenaire
  - Retourner le total de points gagnés cette semaine

## Modifier js/tasks.js
- Remplacer l'appel direct à store.completeTask() par points.processTaskCompletion()
- Si rewardUnlocked !== null : afficher un toast spécial "🎉 {name} débloqué !"
- Si bonusApplied : afficher "+{points} pts (bonus streak !)" au lieu du message standard

# Résultat attendu
- ✅ Valider une tâche calcule et attribue les bons points
- ✅ Après 3 jours de streak, le bonus x1.5 s'applique
- ✅ Quand le seuil de récompense est atteint → toast de célébration
- ✅ getNextReward() retourne la prochaine récompense avec le reste à gagner
```

---

## ⚡ Prompt 7 — Écran Dashboard (barre d'équilibre, scores, stats)

```markdown
# Contexte
MimiTask a : structure, store, onboarding, écran tâches, système de points.
Copy UX du dashboard dans ux-copy.json (section "dashboard").
Phrases mascotte dans mascot-phrases.json.

# Objectif
Construire l'écran Dashboard complet avec : barre d'équilibre, scores, zone mascotte, streaks, prochaine récompense, stats hebdomadaires.

# Fichiers à créer/modifier

## 1. css/dashboard.css
- `.dashboard` : padding space-md space-md space-2xl, flex column, gap space-lg
- `.dashboard__section` : flex column, gap space-sm
- `.dashboard__section-title` : font-size-sm, font-weight 600, text-transform uppercase, color text-secondary, letter-spacing 0.5px

**Barre d'équilibre :**
- `.balance` : flex column, gap space-sm
- `.balance__bar` : height 24px, radius-full, overflow hidden, flex row, position relative, bg border
- `.balance__fill--a` : bg partner-a, transition width 500ms ease
- `.balance__fill--b` : bg partner-b, transition width 500ms ease
- `.balance__labels` : flex between, font-size-sm
- `.balance__label` : flex row, gap space-xs, align-items center
- `.balance__dot` : width 12px, height 12px, radius-full (couleur du partenaire)

**Scores :**
- `.scores` : flex row, gap space-md
- `.score-card` : flex 1, card, text-align center, padding space-md
- `.score-card__value` : font-size-xl, font-weight 700
- `.score-card__label` : font-size-sm, color text-secondary
- `.score-card--couple` : border 2px solid primary-light, bg primary-light/5%

**Mascotte :**
- `.mascot` : flex column, align-items center, gap space-sm, padding space-md, card
- `.mascot__emoji` : font-size 64px
- `.mascot__speech` : font-size-sm, text-align center, color text-secondary, font-style italic

**Streaks :**
- `.streak` : flex row, align-items center, gap space-md, card, padding space-md
- `.streak__icon` : font-size-xl, color streak
- `.streak__info` : flex column
- `.streak__count` : font-weight 700
- `.streak__record` : font-size-sm, color text-secondary

**Récompense :**
- `.next-reward` : card, padding space-md, flex row, align-items center, gap space-md
- `.next-reward__icon` : font-size-xl
- `.next-reward__info` : flex column, flex 1
- `.next-reward__progress` : height 8px, radius-full, bg border, overflow hidden
- `.next-reward__progress-fill` : height 100%, bg reward, radius-full, transition width 500ms

**Stats :**
- `.weekly-stats` : flex row, gap space-md
- `.stat-item` : flex 1, card, text-align center, padding space-md
- `.stat-item__value` : font-size-lg, font-weight 700, color primary
- `.stat-item__label` : font-size-xs, color text-secondary

## 2. js/dashboard.js

**Fonctions exportées :**

- `initDashboard()` : appelée depuis app.js, attache les listeners et fait le premier render
- `renderDashboard()` : orchestre le rendu de toutes les sections

Sections de rendu :
- `renderBalance()` : récupère store.getBalance(), met à jour les widths de la barre + labels ({nameA} {%}% — {%}% {nameB})
- `renderScores()` : affiche points partnerA, partnerB, couple
- `renderMascot()` : détermine l'état d'humeur selon l'équilibre (logique dans mascot.js, prompt 11 — pour l'instant placeholder emoji 🦖 + phrase random "happy")
- `renderStreaks()` : affiche currentStreak + bestStreak. Si streak === 0 : message "Pas encore de série"
- `renderNextReward()` : appelle points.getNextReward(), affiche la barre de progression. Si toutes débloquées : message "Toutes les récompenses sont débloquées !"
- `renderWeeklyStats()` : nombre de tâches validées cette semaine + points gagnés ce mois

## 3. Modifier js/app.js
- Importer et appeler initDashboard()
- Quand on switch vers l'onglet Dashboard : appeler renderDashboard() pour rafraîchir

## 4. Modifier index.html
- Dans #screen-dashboard : ajouter la structure HTML de toutes les sections

# Résultat attendu
- ✅ La barre d'équilibre reflète les proportions réelles des points
- ✅ Les scores individuels et couple s'affichent correctement
- ✅ La mascotte affiche un emoji + une phrase (placeholder pour l'instant)
- ✅ Le streak s'affiche avec le record
- ✅ La prochaine récompense montre une barre de progression
- ✅ Les stats de la semaine sont affichées
- ✅ Tout se met à jour quand on revient sur le dashboard après avoir validé des tâches
```

---

## ⚡ Prompt 8 — Système de récompenses

```markdown
# Contexte
MimiTask a : tous les écrans de base, store, points, dashboard.
Les récompenses par défaut sont dans default-rewards.json.
Le store a déjà les méthodes CRUD pour les récompenses.
points.js gère déjà checkRewardUnlock() et getNextReward().

# Objectif
Implémenter la gestion complète des récompenses : affichage dans les paramètres, création custom, déblocage avec célébration, historique des récompenses débloquées.

# Fichiers à créer/modifier

## 1. js/rewards.js

**Fonctions exportées :**

- `initRewards()` : appelée depuis app.js, prépare le rendu des récompenses

- `renderRewardsList()` :
  - Section "Prochaines récompenses" : récompenses non débloquées, triées par coût croissant
  - Section "Débloquées 🎉" : récompenses débloquées avec date
  - Chaque carte : icon + nom + coût en points + description + statut (verrouillé/débloqué)
  - Barre de progression pour chaque récompense non débloquée (couplePoints / pointsCost)

- `celebrateRewardUnlock(reward)` :
  - Animation de célébration : overlay semi-transparent + confetti CSS + nom de la récompense + emoji
  - Durée : 3 secondes puis fadeout
  - Son optionnel (placeholder, pas de fichier son nécessaire pour le MVP)

- `openAddRewardModal()` :
  - Modal bottom sheet avec formulaire : nom, coût en points (slider 50-500 par paliers de 10), description (optionnel), icon (sélecteur d'emoji simple : ☕🎬💆🍿🎁🍽️🏖️✈️)
  - Validation : nom non vide, coût >= 50
  - Au submit : store.addReward() + toast + fermer modal + re-render

- `deleteReward(rewardId)` :
  - Confirmation : "Supprimer cette récompense ?" (mini modal ou confirm custom)
  - store.deleteReward() + toast + re-render

## 2. css/rewards.css ou ajouter dans components.css
- `.reward-card` : card, flex row, gap space-md, padding space-md
- `.reward-card--locked` : opacity 0.7
- `.reward-card--unlocked` : border-left 4px solid reward
- `.reward-card__icon` : font-size-xl, width 48px, text-align center
- `.reward-card__info` : flex column, flex 1
- `.reward-card__name` : font-weight 600
- `.reward-card__cost` : font-size-sm, color reward, font-weight 700
- `.reward-card__progress` : même style que sur le dashboard
- `.celebration-overlay` : position fixed, inset 0, bg rgba(0,0,0,0.6), z-index 300, flex center, animation fadeIn

## 3. Ajouter dans l'écran Paramètres (index.html #screen-settings)
- Section "Gérer les récompenses" avec liste des récompenses + bouton "Ajouter"
- CTA vers "Voir toutes les récompenses" depuis le dashboard

## 4. Connecter au dashboard
- Le bouton "Voir toutes les récompenses" sur le dashboard switch vers les paramètres section récompenses
- Quand une récompense est débloquée (via points.processTaskCompletion) : appeler celebrateRewardUnlock()

# Résultat attendu
- ✅ Les récompenses s'affichent dans les paramètres (verrouillées et débloquées)
- ✅ On peut créer une récompense custom via le formulaire
- ✅ On peut supprimer une récompense
- ✅ Quand on valide assez de tâches → la récompense se débloque → animation de célébration
- ✅ La barre de progression est fidèle au pourcentage réel
```

---

## ⚡ Prompt 9 — Délégation ("passe ton tour")

```markdown
# Contexte
MimiTask a : tâches, points, dashboard, récompenses.
Copy UX de la délégation dans ux-copy.json (section "tasks.delegation").

# Objectif
Implémenter le système de délégation : un partenaire peut demander à l'autre de prendre en charge une tâche.

# Modification de js/tasks.js et js/store.js

## Données (store.js)
Ajouter un champ `delegationStatus` aux tâches :
- `null` : pas de délégation
- `{ status: 'pending', requestedBy: 'partnerA', requestedAt: 'ISO-date' }` : en attente
- `{ status: 'accepted', acceptedAt: 'ISO-date' }` : acceptée (la tâche change d'assignation)
- `{ status: 'declined', declinedAt: 'ISO-date' }` : refusée (retour à l'assignation d'origine)

Nouvelles fonctions store :
- `requestDelegation(taskId, requestedBy)` : met le status à pending + save
- `acceptDelegation(taskId)` : change assignedTo + met status accepted + save
- `declineDelegation(taskId)` : remet status null + save
- `getPendingDelegations(partnerId)` : retourne les tâches avec délégation pending vers ce partenaire

## UI (tasks.js)

**Bouton "Passe-tour" sur chaque carte de tâche :**
- Petit bouton discret sous la carte ou via swipe gauche
- Au clic : confirmation "Demander à {partnerName} de s'en charger ?"
- Si confirmé : store.requestDelegation() + toast "Demande envoyée à {partnerName} !"
- La carte affiche un badge "⏳ Demandé" tant que pending

**Notification de délégation entrante :**
- Au chargement de l'écran tâches, vérifier getPendingDelegations()
- Si une délégation est en attente : afficher un bandeau en haut de la liste
  - "{partnerName} te demande un coup de main pour « {taskName} »."
  - 2 boutons : "J'accepte" / "Pas cette fois"
  - J'accepte : store.acceptDelegation() + toast "C'est noté ! La tâche est à toi." + re-render
  - Pas cette fois : store.declineDelegation() + toast "OK, la tâche reste chez {originalPartner}." + re-render

**Règles :**
- On ne peut pas déléguer une tâche déjà en pending
- On ne peut pas déléguer à soi-même
- Une tâche complétée ne peut pas être déléguée
- MVP : puisqu'on est en LocalStorage (un seul appareil), la délégation est simulée — les deux partenaires utilisent le même appareil. La notification apparaît la prochaine fois que l'écran tâches est affiché.

# Résultat attendu
- ✅ Le bouton "Passe-tour" apparaît sur les tâches non complétées
- ✅ La demande de délégation s'enregistre et affiche "⏳ Demandé"
- ✅ Un bandeau de notification apparaît pour les délégations en attente
- ✅ Accepter change l'assignation de la tâche
- ✅ Refuser remet la tâche à son état original
- ✅ Les toasts correspondent au ux-copy.json
```

---

## ⚡ Prompt 10 — Récurrence automatique des tâches

```markdown
# Contexte
MimiTask a : tout le flow tâches avec validation et délégation.
Les tâches ont un champ `recurrence` : "once", "daily", "weekly", "monthly".

# Objectif
Implémenter le reset automatique des tâches récurrentes pour qu'elles réapparaissent selon leur fréquence.

# Modifications

## store.js
- Ajouter `lastResetDate` à la structure settings (pour tracker le dernier reset)
- Nouvelle fonction `checkAndResetRecurringTasks()` :
  - Comparer la date actuelle avec lastResetDate
  - Pour chaque tâche complétée avec récurrence :
    - `daily` : si completedAt est avant aujourd'hui → remettre completedAt à null
    - `weekly` : si completedAt est avant le début de cette semaine (lundi) → reset
    - `monthly` : si completedAt est avant le 1er du mois courant → reset
    - `once` : ne pas toucher (reste complétée)
  - Mettre à jour lastResetDate + save
  - Retourner le nombre de tâches réinitialisées

## app.js
- Au DOMContentLoaded (après init du store) : appeler `store.checkAndResetRecurringTasks()`
- Si des tâches ont été réinitialisées : toast discret "X tâches réinitialisées pour aujourd'hui"

## utils.js
- Ajouter `getStartOfWeek(date)` : retourne le lundi de la semaine
- Ajouter `getStartOfMonth(date)` : retourne le 1er du mois

# Résultat attendu
- ✅ Les tâches daily se réinitialisent chaque jour
- ✅ Les tâches weekly se réinitialisent chaque lundi
- ✅ Les tâches monthly se réinitialisent le 1er du mois
- ✅ Les tâches "once" ne se réinitialisent jamais
- ✅ Le reset se fait au lancement de l'app, pas en continu
- ✅ Un toast discret informe du reset
```

---

## ⚡ Prompt 11 — Mascotte réactive

```markdown
# Contexte
MimiTask a : tout fonctionnel. Le dashboard affiche déjà un placeholder 🦖.
Les phrases de la mascotte sont dans data/mascot-phrases.json (5 états : excited, happy, neutral, worried, sad).

# Objectif
Créer le module mascot.js qui gère l'humeur de la mascotte Mimi en fonction de l'équilibre du couple et des streaks.

# Fichier à créer

## js/mascot.js

**Logique d'humeur :**
- Récupérer l'équilibre via store.getBalance() → calculer le ratio min/max (ex: si 35/65, le min est 35%)
- Récupérer le meilleur streak actif

Détermination de l'état :
1. `excited` : ratio min >= 45% ET meilleur streak actif > 5
2. `happy` : ratio min >= 40%
3. `neutral` : ratio min >= 30%
4. `worried` : ratio min >= 20%
5. `sad` : ratio min < 20%

Cas spécial : si aucune tâche n'a été validée (stats à 0/0) → état `happy` par défaut avec phrase d'encouragement initiale.

**Fonctions exportées :**

- `getMascotState()` : retourne { state: 'happy', emoji: '😊', phrase: '...' }
  - Choisit une phrase aléatoire dans l'état correspondant (depuis mascot-phrases.json)

- `renderMascot(containerId)` : met à jour le DOM du container mascotte avec l'emoji + la phrase

## Modifier js/dashboard.js
- Remplacer le placeholder par l'appel à mascot.renderMascot()
- La mascotte se met à jour à chaque renderDashboard()

# Résultat attendu
- ✅ La mascotte affiche l'emoji correspondant à l'état d'équilibre
- ✅ Les phrases changent aléatoirement à chaque visite du dashboard
- ✅ Avec un équilibre parfait + streak > 5 → mascotte excitée 🤩
- ✅ Avec un déséquilibre fort → mascotte triste 😢
- ✅ Au tout début (aucune donnée) → mascotte happy par défaut
```

---

## ⚡ Prompt 12 — Streaks

```markdown
# Contexte
MimiTask a : tout le flow. Le store a déjà currentStreak et bestStreak dans les stats.
Le dashboard affiche déjà le streak.

# Objectif
Implémenter la logique complète de calcul et mise à jour des streaks.

# Modifications

## store.js / points.js
- Ajouter `lastActivityDate` par partenaire dans les stats (pour tracker le dernier jour d'activité)

**Logique de streak (dans points.js) :**

- `updateStreak(partnerId)` :
  - Récupérer lastActivityDate du partenaire
  - Si lastActivityDate === hier → incrémenter currentStreak + 1
  - Si lastActivityDate === aujourd'hui → ne rien faire (déjà compté)
  - Si lastActivityDate < hier → reset currentStreak à 1 (nouvelle série)
  - Si currentStreak > bestStreak → mettre à jour bestStreak
  - Mettre à jour lastActivityDate à aujourd'hui
  - store.updateStreak(partnerId, newStreak) + save

- Appeler `updateStreak()` à chaque processTaskCompletion()

**Vérification au lancement :**
- Dans app.js, au démarrage : vérifier si la dernière activité date de plus d'un jour
  - Si oui : reset le streak et afficher un toast "La série s'arrête… On reprend ?"
  - Utiliser le copy de ux-copy.json (toasts.streakLost)

## dashboard.js
- renderStreaks() utilise les vraies données :
  - "X jours d'affilée !" si streak > 0
  - "Pas encore de série. Validez une tâche pour commencer !" si streak === 0
  - "Record : X jours" toujours affiché

## Bonus visuel
- Quand streak atteint 3, 5, 7, 10 : toast de célébration "X jours d'affilée ! Continue comme ça !"
- Badge flamme 🔥 à côté du compteur de streak quand streak > 3

# Résultat attendu
- ✅ Valider une tâche aujourd'hui puis demain → streak = 2
- ✅ Sauter un jour → streak reset à 1
- ✅ Le record se met à jour correctement
- ✅ Toast de perte de streak au lancement si applicable
- ✅ Badges de milestone aux paliers 3, 5, 7, 10
```

---

## ⚡ Prompt 13 — PWA (manifest + service worker)

```markdown
# Contexte
MimiTask est fonctionnellement complet. Il faut maintenant le rendre installable comme PWA.

# Objectif
Configurer le manifest.json et le service worker pour que l'app soit installable sur mobile.

# Fichiers à créer

## 1. manifest.json
```json
{
  "name": "MimiTask",
  "short_name": "MimiTask",
  "description": "Transformez vos corvées en jeu d'équipe.",
  "start_url": "/index.html",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FAFAFA",
  "theme_color": "#2D6A4F",
  "lang": "fr",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
- Ajuster start_url si déployé dans un sous-dossier GitHub Pages

## 2. sw.js (Service Worker)
Stratégie : **Cache-first pour les assets statiques, Network-first pour les données.**

- Nom du cache : `mimitask-v1`
- Assets à mettre en cache à l'installation :
  - index.html, tous les CSS, tous les JS, les fichiers JSON de data/, les icônes
  - Google Fonts (Inter)
- Événement `install` : pré-cacher les assets
- Événement `fetch` :
  - Pour les fichiers locaux : cache-first (si en cache, servir ; sinon, fetch + mettre en cache)
  - Pour les requêtes externes (Google Fonts) : stale-while-revalidate
- Événement `activate` : nettoyer les anciens caches (versions précédentes)
- Gestion du fallback : si offline et pas en cache → page d'erreur minimale

## 3. Modifier index.html
- Ajouter `<link rel="manifest" href="manifest.json">`
- Ajouter les meta pour iOS : `<meta name="apple-mobile-web-app-capable" content="yes">`, `<meta name="apple-mobile-web-app-status-bar-style" content="default">`, `<link rel="apple-touch-icon" href="assets/icons/icon-192.png">`
- Ajouter `<meta name="theme-color" content="#2D6A4F">`

## 4. Modifier js/app.js
- Enregistrer le service worker au chargement :
```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed:', err));
}
```
- Détecter `beforeinstallprompt` : stocker l'événement, afficher un bouton "Installer l'app" discret dans les paramètres

## 5. Créer les icônes placeholder
- assets/icons/icon-192.png et icon-512.png : placeholder (carré vert #2D6A4F avec "MT" en blanc)
- Ces icônes seront remplacées par l'Agent 13 (Multimédia)

# Résultat attendu
- ✅ Lighthouse PWA > 90
- ✅ L'app est installable sur Chrome Android (prompt d'installation)
- ✅ L'app fonctionne offline (assets en cache)
- ✅ Le thème color s'affiche dans la barre du navigateur
- ✅ Sur iOS Safari : "Ajouter à l'écran d'accueil" fonctionne
```

---

## ⚡ Prompt 14 — Tests & polish

```markdown
# Contexte
MimiTask est fonctionnellement complet et PWA. Il faut maintenant tester, corriger et polir.

# Objectif
Passe de qualité complète : responsive, accessibilité, performance, edge cases, animations finales.

# Checklist

## Responsive (ajouter les media queries)
- Base : 375px (déjà fait)
- Tablette 768px : augmenter les paddings, afficher les cartes en grid 2 colonnes si pertinent, agrandir la mascotte
- Desktop 1024px : limiter la largeur du contenu (max-width 480px, centré — c'est une app mobile)
- Vérifier que la tab bar reste propre sur toutes les tailles
- Vérifier qu'aucun texte n'est coupé ou overflow

## Accessibilité WCAG AA
- [ ] Contrastes : vérifier chaque combinaison texte/fond (ratio >= 4.5:1 pour le texte, 3:1 pour les grands textes)
- [ ] Focus visible sur TOUS les éléments interactifs (outline 2px)
- [ ] Navigation clavier : Tab parcourt tous les éléments dans l'ordre logique
- [ ] Escape ferme toutes les modals
- [ ] aria-label sur les boutons icon-only (FAB, close, check)
- [ ] aria-live="polite" sur le toast container
- [ ] role="alert" sur les messages d'erreur de validation
- [ ] Les images/emojis décoratifs ont aria-hidden="true"
- [ ] Piège de focus dans les modals (focus ne sort pas de la modal quand elle est ouverte)

## Animations finales
- Validation de tâche : check animé (scale 0→1 avec bounce), léger confetti CSS
- Déblocage récompense : overlay avec confetti + scale-in du texte
- Transition entre étapes onboarding : slide horizontal 300ms
- Toast : slide-up + fadeOut
- Barre d'équilibre : transition width 500ms ease
- Hover/active sur tous les boutons : scale ou opacity

## Edge cases
- [ ] Aucune tâche créée → empty state
- [ ] Toutes les tâches complétées → "Tout est fait !"
- [ ] Aucune récompense → message dans le dashboard
- [ ] Toutes les récompenses débloquées → message de félicitation
- [ ] Noms très longs (15+ caractères) → ellipsis ou wrap correct
- [ ] LocalStorage plein → gestion d'erreur gracieuse (try/catch dans save())
- [ ] Premier jour (pas de streak) → messages adaptés
- [ ] Un seul partenaire a validé des tâches → l'équilibre est extrême, mascotte triste

## Performance
- [ ] Aucun layout shift visible (CLS < 0.1)
- [ ] Toutes les images/icônes ont des dimensions explicites
- [ ] CSS chargé en <head>, JS en fin de body avec type="module"
- [ ] Google Fonts avec display=swap et preconnect
- [ ] Pas de JS bloquant le rendu

## Code quality
- [ ] Aucun fichier JS > 200 lignes
- [ ] Aucun console.log restant
- [ ] Aucun TODO ou placeholder
- [ ] Commentaires à jour
- [ ] Convention BEM respectée partout

# Résultat attendu
- ✅ Lighthouse : Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90
- ✅ Navigation clavier complète sans bug
- ✅ App fluide et agréable sur mobile 375px
- ✅ Aucun edge case cassé
- ✅ Animations subtiles et cohérentes
```

---

## ⚡ Prompt 15 — Déploiement GitHub Pages

```markdown
# Contexte
MimiTask est complet, testé, optimisé. Prêt pour le déploiement.

# Objectif
Préparer le déploiement sur GitHub Pages : fichiers de config, README, vérifications finales.

# Fichiers à créer

## 1. .gitignore
```
.DS_Store
Thumbs.db
*.log
node_modules/
.env
```

## 2. README.md
```markdown
# 🦖 MimiTask

**Transformez vos corvées en jeu d'équipe.**

MimiTask est une PWA mobile-first qui gamifie les tâches ménagères pour les couples.

## ✨ Fonctionnalités

- 📋 Gestion de tâches avec validation 1-tap
- ⚖️ Barre d'équilibre en temps réel
- 🏆 Système de points et récompenses
- 🔄 Délégation ("Passe ton tour")
- 🦖 Mascotte Mimi réactive
- 🔥 Système de streaks
- 📱 PWA installable

## 🛠️ Stack technique

- HTML/CSS/JS pur — zéro framework, zéro dépendance
- LocalStorage pour la persistance (migration Firebase prévue en v2)
- PWA avec Service Worker

## 🚀 Utilisation

1. Cloner le repo
2. Ouvrir `index.html` dans un navigateur
3. Ou visiter : [URL GitHub Pages]

## 📱 Installation PWA

Sur mobile, ouvrir l'URL dans Chrome/Safari puis "Ajouter à l'écran d'accueil".

## 📄 Licence

Projet personnel — Tous droits réservés.
```

## 3. robots.txt
```
User-agent: *
Allow: /
Sitemap: https://[username].github.io/mimitask/sitemap.xml
```

## 4. sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[username].github.io/mimitask/</loc>
    <lastmod>2026-02-10</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 5. Vérifier la structure finale
```
mimitask/
├── index.html
├── manifest.json
├── sw.js
├── robots.txt
├── sitemap.xml
├── .gitignore
├── README.md
├── CLAUDE.md
├── css/ (6-7 fichiers)
├── js/ (8-9 fichiers)
├── data/ (3 fichiers JSON)
└── assets/
    ├── icons/ (favicon + PWA icons)
    └── mascot/ (placeholder)
```

## Instructions de déploiement
1. Créer un repo GitHub "mimitask"
2. Push tout le code
3. Settings → Pages → Source: Deploy from branch → main → / (root) → Save
4. Attendre 1-2 minutes → l'URL est live
5. Vérifier : l'app charge, la navigation fonctionne, la PWA est installable
6. Ajuster les URLs dans manifest.json, sitemap.xml, sw.js si nécessaire (sous-dossier /mimitask/)

# Résultat attendu
- ✅ Le repo est propre et bien documenté
- ✅ L'URL GitHub Pages charge MimiTask sans erreur
- ✅ La PWA est installable depuis l'URL déployée
- ✅ HTTPS est actif (automatique avec GitHub Pages)
- ✅ Le README est clair et complet
```

---

## 📌 Notes pour l'utilisateur

### Pourquoi cette structure de prompts ?

Chaque prompt suit un ordre logique de **dépendances techniques** :
1. **Structure d'abord** (HTML/CSS) → on a la base visuelle
2. **Store ensuite** → le moteur de données est prêt avant tout écran
3. **Onboarding** → premier contact utilisateur, remplit le store
4. **Écrans un par un** → chaque écran consomme le store
5. **Logique métier** → points, récompenses, délégation s'appuient sur les écrans
6. **Polish en dernier** → on peaufine quand tout fonctionne

### Ce qui peut être ajusté

- **Fusionner des prompts** : les prompts 9 (délégation) et 10 (récurrence) pourraient être un seul prompt si la session est longue.
- **Découper un prompt** : le prompt 5 (écran tâches) est dense — si Claude Code peine, découper en "5a: rendu de la liste" et "5b: validation + filtres".
- **Sauter un prompt** : le prompt 11 (mascotte) est marqué "souhaité" dans le CDC — skippable si on veut livrer plus vite.
- **Ajouter l'écran Paramètres** : il n'a pas de prompt dédié car il se construit progressivement via les prompts 4 (bibliothèque), 8 (récompenses) et 13 (PWA install). Si nécessaire, ajouter un prompt "Prompt 7b — Écran Paramètres complet".

### Bonnes pratiques d'utilisation

1. **Un prompt par session Claude Code** : ne pas enchaîner 3 prompts d'un coup.
2. **Vérifier le résultat attendu** avant de passer au prompt suivant.
3. **Commiter après chaque prompt** : `git commit -m "feat: [nom du prompt]"`
4. **Si Claude Code propose une approche différente** : c'est OK tant qu'il respecte le CLAUDE.md.
5. **En cas de bug** : re-donner le prompt avec le contexte de l'erreur, Claude Code se corrigera.

---

*Livrable Agent 06 — Version 1.0 — Février 2026*
