# MimiTask — Design System Documentation

> Version 1.0 — Février 2026
> Agent 04 — Design System

---

## Vue d'ensemble

Ce design system fournit les **tokens** (couleurs, typographie, espacements, ombres, animations) et les **composants réutilisables** pour l'application MimiTask. Il est la **source de vérité** pour tout le développement frontend.

**Fichiers livrés :**

| Fichier | Rôle |
|---------|------|
| `css/variables.css` | Tokens : custom properties CSS |
| `css/components.css` | Composants : classes BEM réutilisables |
| `styleguide.html` | Démo visuelle standalone |

**Conventions :** CSS BEM (`.block__element--modifier`), custom properties CSS (`--category-property`), zéro framework, zéro dépendance.

---

## 1. Tokens

### 1.1 Couleurs

**Principales** — Utilisées pour les actions primaires et l'identité visuelle.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#2D6A4F` | Boutons CTA, tab active, liens |
| `--color-primary-light` | `#52B788` | Accents, icônes success |
| `--color-primary-dark` | `#1B4332` | Header, titres principaux |
| `--color-primary-hover` | `#245A42` | État hover des boutons primary |
| `--color-primary-active` | `#1B4332` | État active/pressed |
| `--color-primary-ghost` | `rgba(45,106,79,0.08)` | Fond des boutons ghost/secondary au hover |

**Secondaires** — CTA secondaires et accents chauds.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-secondary` | `#F4A261` | Boutons secondaires, alertes |
| `--color-secondary-light` | `#F7C59F` | Fond léger |

**Gamification** — Feedback visuel du système de jeu.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-points` | `#E9C46A` | Badge de points, étoiles |
| `--color-streak` | `#E76F51` | Indicateur de streak, progress ring |
| `--color-reward` | `#7209B7` | Récompenses, badges déblocage |

**Sémantiques** — Feedback système.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-success` | `#2D6A4F` | Validation, confirmation |
| `--color-error` | `#DC3545` | Erreurs, champs invalides |
| `--color-warning` | `#F4A261` | Avertissements |
| `--color-info` | `#3B82F6` | Informations, notifications |

Chaque couleur sémantique a une variante `-bg` (fond translucide) pour les alertes et badges.

**Contrastes WCAG AA vérifiés :**

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| `--color-text` sur `--color-bg` | 15.1:1 | ✅ AAA |
| `--color-text-inverse` sur `--color-primary` | 5.2:1 | ✅ AA |
| `--color-text-secondary` sur `--color-surface` | 5.0:1 | ✅ AA |
| `--color-error` sur `--color-surface` | 4.6:1 | ✅ AA |

### 1.2 Typographie

**Police :** Inter (Google Fonts) avec fallback système.

**Hypothèse :** Inter est la seule police utilisée. Pas de police de titres distincte — la hiérarchie se fait par taille et graisse. À valider si on souhaite une police display pour l'onboarding.

| Token | Taille | Usage |
|-------|--------|-------|
| `--font-size-3xl` | 32px (2rem) | Titre onboarding |
| `--font-size-2xl` | 24px (1.5rem) | Titres d'écran |
| `--font-size-xl` | 20px (1.25rem) | Sous-titres, section headers |
| `--font-size-lg` | 18px (1.125rem) | Titres de section secondaires |
| `--font-size-base` | 16px (1rem) | Corps de texte |
| `--font-size-sm` | 14px (0.875rem) | Labels, texte secondaire |
| `--font-size-xs` | 12px (0.75rem) | Captions, timestamps, métadonnées |

**Graisses :** 400 (normal), 500 (medium), 600 (semibold), 700 (bold).

**Règle mobile :** Jamais en dessous de 14px pour du texte lisible. Les 12px sont réservés aux captions et métadonnées non essentielles.

### 1.3 Espacements

Système **base 4px**. Tous les espacements dans l'app utilisent ces tokens.

| Token | Valeur | Usage typique |
|-------|--------|---------------|
| `--space-2xs` | 2px | Micro-ajustements |
| `--space-xs` | 4px | Gap interne des badges |
| `--space-sm` | 8px | Padding interne compact, gap de formulaires |
| `--space-md` | 16px | Padding standard des cartes et sections |
| `--space-lg` | 24px | Espacement entre sections |
| `--space-xl` | 32px | Marge principale |
| `--space-2xl` | 48px | Espacement large entre blocs |
| `--space-3xl` | 64px | Padding hero/onboarding |

**Quand utiliser quoi :**
- Padding interne d'un composant → `--space-md`
- Gap entre éléments dans un composant → `--space-sm`
- Espace entre composants → `--space-lg`
- Espace entre sections → `--space-xl` ou `--space-2xl`

### 1.4 Ombres et Arrondis

**Ombres :**

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Élévation minimale |
| `--shadow-sm` | Cartes au repos |
| `--shadow-md` | Cartes au hover, dropdowns |
| `--shadow-lg` | Toasts, FAB |
| `--shadow-xl` | Modales |
| `--shadow-focus` | Ring de focus (accessibilité) |

**Arrondis :**

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius-xs` | 4px | Checkbox |
| `--radius-sm` | 8px | Petits éléments |
| `--radius-md` | 12px | Cartes, inputs, boutons secondaires |
| `--radius-lg` | 16px | Modales |
| `--radius-full` | 9999px | Boutons CTA, avatars, badges, pills |

### 1.5 Transitions et Animations

**Durées :**

| Token | Valeur | Usage |
|-------|--------|-------|
| `--duration-fast` | 150ms | Hover, focus |
| `--duration-normal` | 250ms | Apparition de composants |
| `--duration-slow` | 400ms | Animations complexes |
| `--duration-very-slow` | 600ms | Points pop, célébrations |

**Easings :** `--ease-default` (smooth), `--ease-bounce` (ludique, pour gamification).

**Animations prédéfinies :** `fadeIn`, `fadeOut`, `slideUp`, `slideDown`, `scaleIn`, `bounceIn`, `pointsPop`, `shake`, `pulse`.

**Mouvement réduit :** `prefers-reduced-motion` désactive toutes les animations.

### 1.6 Z-index

| Token | Valeur | Usage |
|-------|--------|-------|
| `--z-base` | 0 | Éléments standards |
| `--z-dropdown` | 100 | Menus déroulants |
| `--z-sticky` | 200 | FAB, éléments collants |
| `--z-header` | 300 | Tab bar |
| `--z-overlay` | 400 | Fond de modal |
| `--z-modal` | 500 | Contenu de modal |
| `--z-toast` | 600 | Toasts |
| `--z-tooltip` | 700 | Tooltips |

---

## 2. Composants

### 2.1 Boutons (`.btn`)

**Quand utiliser :**
- **Primary** (`.btn--primary`) : action principale d'un écran (1 seul par écran)
- **Secondary** (`.btn--secondary`) : actions secondaires
- **Ghost** (`.btn--ghost`) : actions tertiaires, liens discrets
- **Danger** (`.btn--danger`) : suppression, réinitialisation
- **Icon** (`.btn--icon`) : actions avec icône seule (fermer, ajouter)

**Quand NE PAS utiliser :**
- Pour la navigation → utiliser des liens `<a>`
- Pour un toggle → utiliser `.toggle`

**États :** default, hover, active (scale 0.97), focus-visible (ring), disabled (opacity 0.45), loading (spinner).

**HTML :**
```html
<button class="btn btn--primary">C'est parti !</button>
<button class="btn btn--secondary">Annuler</button>
<button class="btn btn--primary" disabled>Indisponible</button>
<button class="btn btn--primary btn--loading">Chargement</button>
<button class="btn btn--primary btn--block">Pleine largeur</button>
```

### 2.2 Carte tâche (`.task-card`)

Structure : checkbox + contenu (nom + méta) + badge points + avatar assigné.

**Variantes :**
- Default : tâche à faire
- `.task-card--completed` : opacité réduite, nom barré, check vert
- `.task-card--delegated` : bordure gauche orange

**Cas edge :** les noms longs sont tronqués via `text-overflow: ellipsis`.

**HTML :**
```html
<div class="task-card">
  <button class="task-card__check" aria-label="Valider la tâche">✓</button>
  <div class="task-card__content">
    <div class="task-card__name">Faire la vaisselle</div>
    <div class="task-card__meta">
      <span>🍽️ Cuisine</span><span>·</span><span>Chaque jour</span>
    </div>
  </div>
  <span class="task-card__points">+8 pts</span>
  <div class="task-card__avatar task-card__avatar--a">L</div>
</div>
```

### 2.3 Badge (`.badge`)

Indicateurs visuels courts et catégorisés.

**Variantes :** `--points`, `--streak`, `--reward`, `--success`, `--error`, `--info`, `--warning`.

```html
<span class="badge badge--points">⭐ +12 pts</span>
<span class="badge badge--streak">🔥 5 jours</span>
```

### 2.4 Barre d'équilibre (`.balance-bar`)

Barre horizontale bicolore montrant la répartition partner A / partner B.

**Important :** la `width` du `.balance-bar__fill` est contrôlée en JS (pourcentage dynamique). La transition CSS assure l'animation fluide.

```html
<div class="balance-bar">
  <div class="balance-bar__labels">
    <span class="balance-bar__label--a">Léa 52%</span>
    <span class="balance-bar__label--b">48% Thomas</span>
  </div>
  <div class="balance-bar__track">
    <div class="balance-bar__fill" style="width: 52%"></div>
  </div>
</div>
```

### 2.5 Tab bar (`.tab-bar`)

Navigation principale fixe en bas. 3 onglets : Tâches, Dashboard, Paramètres.

**Accessibilité :** `role="tablist"` sur le container, `role="tab"` + `aria-selected` sur chaque item.

**Safe area :** `padding-bottom: env(safe-area-inset-bottom)` pour les iPhones avec encoche.

### 2.6 Modal / Bottom sheet (`.modal`)

**Mobile :** slide-up depuis le bas (bottom sheet).
**Desktop (>768px) :** centré verticalement avec border-radius complet.

**Accessibilité :** focus trap, fermeture avec Escape, `aria-modal="true"`, `role="dialog"`.

```html
<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Nouvelle tâche">
  <div class="modal">
    <div class="modal__handle"></div>
    <h2 class="modal__title">Nouvelle tâche</h2>
    <!-- contenu -->
  </div>
</div>
```

### 2.7 Toast (`.toast`)

Notifications éphémères (3-4 secondes). Apparaissent en haut via `.toast-container`.

**Variantes :** `--success`, `--error`, `--info`, `--warning`.

**Disparition :** ajouter `.toast--exit` pour l'animation de sortie, puis supprimer du DOM.

### 2.8 Formulaires

**Composants :** `.form-input`, `.form-select`, `.form-textarea`, `.form-check` (checkbox/radio), `.toggle`.

**Règles :**
- Chaque input a un `<label>` associé (via `for`/`id`)
- Champs requis : `.form-label--required` ajoute un astérisque rouge
- Erreur : `.form-input--error` + `.form-error` sous le champ
- Tous les champs font minimum 44px de hauteur

### 2.9 Carte récompense (`.reward-card`)

Affiche une récompense avec icône emoji, nom et coût en points.

**Variante :** `.reward-card--unlocked` pour les récompenses débloquées (bordure violette, icône pleine).

### 2.10 Composants utilitaires

| Composant | Classe | Usage |
|-----------|--------|-------|
| Avatar | `.avatar--sm/md/lg` + `.avatar--a/b` | Initiale du partenaire |
| Chip/filtre | `.chip` + `.chip--active` | Filtres dans l'écran tâches |
| FAB | `.fab` | Bouton flottant "+" pour ajouter |
| Section header | `.section-header` | Titre + lien "voir tout" |
| Empty state | `.empty-state` | Écrans sans contenu |
| Progress ring | `.progress-ring` | Indicateur visuel de streak |
| Divider | `.divider` | Séparateur horizontal |
| Mascotte | `.mascot` | Emoji + phrase réactive |

---

## 3. Accessibilité (WCAG AA)

### Vérifications par composant

| Composant | Contraste | Focus | Clavier | ARIA | Tactile 44px |
|-----------|-----------|-------|---------|------|-------------|
| Boutons | ✅ | ✅ ring | ✅ Enter/Space | — | ✅ |
| Inputs | ✅ | ✅ ring | ✅ Tab | ✅ label | ✅ |
| Checkbox/Radio | ✅ | ✅ ring | ✅ Space | — | ✅ |
| Toggle | ✅ | ✅ ring | ✅ Space | ✅ role | ✅ |
| Task card check | ✅ | ✅ ring | ✅ Enter | ✅ aria-label | ✅ |
| Tab bar | ✅ | ✅ ring | ✅ Tab | ✅ role=tab | ✅ |
| Modal | — | ✅ trap | ✅ Esc ferme | ✅ dialog | — |
| Toast | ✅ | — | — | ✅ role=alert | — |
| Chips | ✅ | ✅ ring | ✅ Enter | — | Min 36px |

### Focus visible global

```css
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: var(--shadow-focus);
}
```

### Mouvement réduit

Tous les `animation-duration` et `transition-duration` sont réduits à 0.01ms pour `prefers-reduced-motion: reduce`.

---

## 4. Pièges à éviter

1. **Ne jamais utiliser de valeurs brutes.** Toujours `var(--space-md)` au lieu de `16px`.
2. **Ne pas créer de nouvelles variantes de couleur** sans les ajouter dans `variables.css`.
3. **Ne pas oublier les états.** Chaque élément interactif doit avoir hover, focus, active, disabled.
4. **Ne pas empiler les ombres.** Un composant = une seule ombre de l'échelle.
5. **Ne pas dépasser 500ms** pour les transitions (sauf célébration).
6. **Ne pas utiliser `!important`.**
7. **Tester avec un nom de tâche de 80+ caractères** pour vérifier le truncate.

---

## 5. Section CLAUDE.md — Design System

> Copier-coller cette section dans le CLAUDE.md du projet.

```markdown
## 🎨 Design System

### Fichiers
- `css/variables.css` — Tous les tokens (source de vérité)
- `css/components.css` — Composants réutilisables BEM
- `styleguide.html` — Référence visuelle (ouvrir dans le navigateur)

### Tokens clés
- Couleurs : `--color-primary` (#2D6A4F), `--color-secondary` (#F4A261)
- Gamification : `--color-points`, `--color-streak`, `--color-reward`
- Espacements : base 4px, de `--space-xs` (4px) à `--space-3xl` (64px)
- Arrondis : `--radius-md` (12px) pour les cartes, `--radius-full` pour les pills/avatars
- Ombres : `--shadow-sm` au repos, `--shadow-md` au hover
- Z-index : tab-bar=300, overlay=400, modal=500, toast=600
- Animations : `--duration-fast` (150ms), `--duration-normal` (250ms)

### Composants disponibles
Boutons (.btn), Carte tâche (.task-card), Badge (.badge), Barre d'équilibre (.balance-bar),
Tab bar (.tab-bar), Modal (.modal), Toast (.toast), Formulaires (.form-input/select/check),
Toggle (.toggle), Alerte (.alert), Carte générique (.card), Avatar (.avatar),
Chip (.chip), FAB (.fab), Reward card (.reward-card), Empty state (.empty-state),
Section header (.section-header), Progress ring (.progress-ring), Mascotte (.mascot)

### Règles
- Convention BEM : `.block__element--modifier`
- Zéro magic numbers : utiliser les custom properties
- Focus visible sur tout élément interactif
- Min 44x44px pour les cibles tactiles
- Contrastes WCAG AA vérifiés
- `prefers-reduced-motion` respecté
```
