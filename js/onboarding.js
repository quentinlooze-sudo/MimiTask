/* ==============================================
   MimiTask — Onboarding (flow 5 étapes)
   ============================================== */

import * as store from './store.js';

const PRESELECTED_COUNT = 10;
let currentStep = 1;
let defaultTasks = [];
let defaultRewards = [];
let selectedTaskIds = new Set();

/* Charge les tâches et récompenses par défaut depuis les JSON */
async function loadData() {
  const [tasksRes, rewardsRes] = await Promise.all([
    fetch('data/default-tasks.json'),
    fetch('data/default-rewards.json')
  ]);
  defaultTasks = await tasksRes.json();
  defaultRewards = await rewardsRes.json();
  defaultTasks.slice(0, PRESELECTED_COUNT).forEach(t => selectedTaskIds.add(t.id));
  renderTaskGrid();
  updateTaskCount();
}

/* Génère le HTML des chips de tâches et injecte en une fois */
function renderTaskGrid() {
  const grid = document.getElementById('task-grid');
  const html = defaultTasks.map(task => {
    const sel = selectedTaskIds.has(task.id) ? ' onboarding__task-chip--selected' : '';
    return `<button class="onboarding__task-chip${sel}" data-task-id="${task.id}" type="button">
      <span>${task.icon}</span>
      <span>${task.name}</span>
      <span class="onboarding__task-chip-points">${task.points} pts</span>
    </button>`;
  }).join('');
  grid.innerHTML = html;
}

/* Toggle sélection d'une tâche */
function toggleTask(taskId) {
  if (selectedTaskIds.has(taskId)) selectedTaskIds.delete(taskId);
  else selectedTaskIds.add(taskId);
  renderTaskGrid();
  updateTaskCount();
}

/* Met à jour le compteur et le state du bouton Suivant */
function updateTaskCount() {
  document.getElementById('task-count').textContent = selectedTaskIds.size;
  document.querySelector('[data-step="3"] .onboarding__cta').disabled = selectedTaskIds.size === 0;
}

/* Navigation entre les étapes */
async function goToStep(step) {
  const steps = document.querySelectorAll('.onboarding__step');
  const dots = document.querySelectorAll('.onboarding__dot');

  steps.forEach(s => s.classList.remove('onboarding__step--active'));
  dots.forEach((d, i) => d.classList.toggle('onboarding__dot--active', i < step));

  const target = document.querySelector(`[data-step="${step}"]`);
  target.classList.add('onboarding__step--active');
  currentStep = step;

  // Focus sur le premier élément interactif
  const focusEl = target.querySelector('input:not([hidden]), button.onboarding__cta');
  if (focusEl) focusEl.focus();

  // Afficher le code couple à l'étape 5 (priorité au code Firestore)
  if (step === 5) {
    const { getCoupleCode: authCode } = await import('./auth.js');
    document.getElementById('couple-code').textContent = authCode() || store.getCoupleCode();
  }
}

/* Active/désactive le bouton Suivant selon la saisie des noms */
function validateNames() {
  const a = document.getElementById('partner-a-name').value.trim();
  const b = document.getElementById('partner-b-name').value.trim();
  document.querySelector('[data-step="2"] .onboarding__cta').disabled = a.length < 2 || b.length < 2;
}

/* Valide et sauvegarde les noms, retourne false si invalide */
function submitNames() {
  const inputA = document.getElementById('partner-a-name');
  const inputB = document.getElementById('partner-b-name');
  let valid = true;
  if (inputA.value.trim().length < 2) { inputA.classList.add('onboarding__input--error'); valid = false; }
  if (inputB.value.trim().length < 2) { inputB.classList.add('onboarding__input--error'); valid = false; }
  if (!valid) return false;
  store.setCouple(inputA.value, inputB.value);
  return true;
}

/* Sauvegarde toutes les données et ferme l'onboarding */
function finishOnboarding() {
  // Tâches sélectionnées
  const selected = defaultTasks.filter(t => selectedTaskIds.has(t.id));
  store.addDefaultTasks(selected);

  // Récompenses par défaut
  store.addDefaultRewards(defaultRewards);

  // Récompense perso si renseignée
  const rName = document.getElementById('onboarding-reward-name').value.trim();
  const rCost = parseInt(document.getElementById('onboarding-reward-points').value);
  if (rName && rCost > 0) {
    store.addReward({ name: rName, pointsCost: rCost });
  }

  store.setOnboardingDone();

  // Fermer l'onboarding
  const el = document.getElementById('onboarding');
  el.classList.remove('onboarding--active');
  el.setAttribute('aria-hidden', 'true');
}

/* Ajoute une tâche personnalisée à la grille */
function addCustomTask() {
  const nameInput = document.getElementById('custom-task-name');
  const pointsInput = document.getElementById('custom-task-points');
  const name = nameInput.value.trim();
  const points = parseInt(pointsInput.value) || 5;
  if (!name) { nameInput.classList.add('onboarding__input--error'); return; }

  const id = `custom_${Date.now()}`;
  defaultTasks.push({ id, name, icon: '✏️', points, category: 'divers', recurrence: 'daily' });
  selectedTaskIds.add(id);
  renderTaskGrid();
  updateTaskCount();

  nameInput.value = '';
  pointsInput.value = '';
  document.getElementById('custom-task-form').hidden = true;
}

/* Point d'entrée : branche tous les événements */
function initOnboarding() {
  const el = document.getElementById('onboarding');
  el.classList.add('onboarding--active');
  el.setAttribute('aria-hidden', 'false');

  loadData();

  // Validation noms en temps réel
  document.getElementById('partner-a-name').addEventListener('input', validateNames);
  document.getElementById('partner-b-name').addEventListener('input', validateNames);

  // Retirer le style erreur quand l'utilisateur tape
  el.querySelectorAll('.onboarding__input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('onboarding__input--error'));
  });

  // Clic sur les chips de tâches (délégation d'événement)
  document.getElementById('task-grid').addEventListener('click', (e) => {
    const chip = e.target.closest('.onboarding__task-chip');
    if (chip) toggleTask(chip.dataset.taskId);
  });

  // Formulaire tâche perso
  document.getElementById('add-custom-task').addEventListener('click', () => {
    document.getElementById('custom-task-form').hidden = false;
  });
  document.getElementById('confirm-custom-task').addEventListener('click', addCustomTask);

  // Copier le code couple (priorité au code Firestore)
  document.getElementById('copy-code').addEventListener('click', async () => {
    try {
      const { getCoupleCode: authCode } = await import('./auth.js');
      const code = authCode() || store.getCoupleCode();
      await navigator.clipboard.writeText(code);
      window.showToast('Code copié !');
    } catch {
      window.showToast('Impossible de copier', 'error');
    }
  });

  // Navigation entre étapes (délégation sur le conteneur)
  el.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    if (action === 'next') {
      if (currentStep === 2) {
        if (!submitNames()) return;
        // Créer le couple dans Firestore (non bloquant si offline)
        try {
          const { createCouple } = await import('./auth.js');
          await createCouple(
            document.getElementById('partner-a-name').value,
            document.getElementById('partner-b-name').value
          );
        } catch (err) {
          console.warn('[onboarding] Création Firestore échouée, mode local:', err.message);
        }
      }
      goToStep(currentStep + 1);
    } else if (action === 'back') {
      goToStep(currentStep - 1);
    } else if (action === 'skip') {
      goToStep(currentStep + 1);
    } else if (action === 'finish') {
      finishOnboarding();
    }
  });
}

export { initOnboarding };
