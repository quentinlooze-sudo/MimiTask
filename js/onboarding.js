/* ==============================================
   MimiTask — Onboarding (flux Créer + Rejoindre)
   ============================================== */

import * as store from './store.js';
import defaultTasksData from '../data/default-tasks.json';
import defaultRewardsData from '../data/default-rewards.json';

let currentStep = 1;
let defaultTasks = [];
let defaultRewards = [];
let selectedTaskIds = new Set();

/* Charge les tâches et récompenses depuis les imports statiques */
function loadData() {
  try {
    defaultTasks = Array.isArray(defaultTasksData) ? [...defaultTasksData] : [...(defaultTasksData.default || [])];
    defaultRewards = Array.isArray(defaultRewardsData) ? [...defaultRewardsData] : [...(defaultRewardsData.default || [])];
    defaultTasks.forEach(t => selectedTaskIds.add(t.id));
    renderTaskGrid();
    updateTaskCount();
  } catch (err) {
    console.error('[onboarding] loadData error:', err);
    document.getElementById('task-grid').textContent = 'Erreur chargement tâches: ' + err.message;
  }
}

/* Génère le HTML des chips de tâches */
function renderTaskGrid() {
  const grid = document.getElementById('task-grid');
  grid.innerHTML = defaultTasks.map(task => {
    const sel = selectedTaskIds.has(task.id) ? ' onboarding__task-chip--selected' : '';
    return `<button class="onboarding__task-chip${sel}" data-task-id="${task.id}" type="button">
      <span>${task.icon}</span><span>${task.name}</span>
      <span class="onboarding__task-chip-points">${task.points} pts</span></button>`;
  }).join('');
}

function toggleTask(taskId) {
  if (selectedTaskIds.has(taskId)) selectedTaskIds.delete(taskId);
  else selectedTaskIds.add(taskId);
  renderTaskGrid();
  updateTaskCount();
}

function updateTaskCount() {
  document.getElementById('task-count').textContent = selectedTaskIds.size;
  document.querySelector('[data-step="3"] .onboarding__cta').disabled = selectedTaskIds.size === 0;
}

/* Navigation entre les étapes numérotées (1-5) */
async function goToStep(step) {
  const steps = document.querySelectorAll('.onboarding__step');
  const dots = document.querySelectorAll('.onboarding__dot');
  steps.forEach(s => s.classList.remove('onboarding__step--active'));
  dots.forEach((d, i) => d.classList.toggle('onboarding__dot--active', i < step));
  const target = document.querySelector(`[data-step="${step}"]`);
  target.classList.add('onboarding__step--active');
  currentStep = step;
  const focusEl = target.querySelector('input:not([hidden]), button.onboarding__cta');
  if (focusEl) focusEl.focus();
  if (step === 5) {
    const { getCoupleCode: authCode } = await import('./auth.js');
    const code = authCode() || store.getCoupleCode() || localStorage.getItem('mimitask_couple_code') || '';
    console.log('[onboarding] step 5 — code couple:', code, 'auth:', authCode(), 'store:', store.getCoupleCode());
    document.getElementById('couple-code').textContent = code || 'Code indisponible';
  }
}

function validateNames() {
  const a = document.getElementById('partner-a-name').value.trim();
  const b = document.getElementById('partner-b-name').value.trim();
  document.querySelector('[data-step="2"] .onboarding__cta').disabled = a.length < 2 || b.length < 2;
}

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

/* Ferme l'overlay onboarding (réutilisé par le flux join) */
function closeOnboarding() {
  const el = document.getElementById('onboarding');
  el.classList.remove('onboarding--active');
  el.setAttribute('aria-hidden', 'true');
}

/* Sauvegarde les données du flux "Créer" et ferme */
async function finishOnboarding() {
  await store.syncFromFirestore();
  store.addDefaultTasks(defaultTasks);
  store.addDefaultRewards(defaultRewards);
  const rName = document.getElementById('onboarding-reward-name').value.trim();
  const rCost = parseInt(document.getElementById('onboarding-reward-points').value);
  if (rName && rCost > 0) store.addReward({ name: rName, pointsCost: rCost });
  store.setOnboardingDone();
  closeOnboarding();
  window.showSyncIndicator?.();
  try { const { startSync } = await import('./sync.js'); startSync(); } catch { /* sync optionnel */ }
}

/* Affiche le step "Rejoindre" et charge le module join */
async function showJoinStep() {
  document.querySelectorAll('.onboarding__step').forEach(s => s.classList.remove('onboarding__step--active'));
  document.querySelectorAll('.onboarding__dot').forEach(d => d.classList.remove('onboarding__dot--active'));
  document.querySelector('[data-step="join"]').classList.add('onboarding__step--active');
  document.getElementById('join-couple-code').focus();
  const { initJoinStep } = await import('./onboarding-join.js');
  initJoinStep(closeOnboarding);
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
  console.log('[onboarding] initOnboarding called, defaultTasksData type:', typeof defaultTasksData, 'length:', defaultTasksData?.length);
  const el = document.getElementById('onboarding');
  el.classList.add('onboarding--active');
  el.setAttribute('aria-hidden', 'false');
  loadData();

  document.getElementById('partner-a-name').addEventListener('input', validateNames);
  document.getElementById('partner-b-name').addEventListener('input', validateNames);

  el.querySelectorAll('.onboarding__input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('onboarding__input--error'));
  });

  document.getElementById('task-grid').addEventListener('click', (e) => {
    const chip = e.target.closest('.onboarding__task-chip');
    if (chip) toggleTask(chip.dataset.taskId);
  });

  document.getElementById('add-custom-task').addEventListener('click', () => {
    document.getElementById('custom-task-form').hidden = false;
  });
  document.getElementById('confirm-custom-task').addEventListener('click', addCustomTask);

  document.getElementById('copy-code').addEventListener('click', async () => {
    try {
      const { getCoupleCode: authCode } = await import('./auth.js');
      await navigator.clipboard.writeText(authCode() || store.getCoupleCode());
      window.showToast('Code copié !');
    } catch { window.showToast('Impossible de copier', 'error'); }
  });

  /* Délégation navigation sur le conteneur */
  el.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'next') {
      if (currentStep === 2) {
        if (!submitNames()) return;
        try {
          const { createCouple } = await import('./auth.js');
          const result = await createCouple(document.getElementById('partner-a-name').value, document.getElementById('partner-b-name').value);
          console.log('[onboarding] createCouple result:', result);
          if (result?.coupleCode) store.setCoupleCode(result.coupleCode);
        } catch (err) { console.error('[onboarding] createCouple FAILED:', err); }
      }
      goToStep(currentStep + 1);
    } else if (action === 'back') { goToStep(currentStep - 1);
    } else if (action === 'skip') { goToStep(currentStep + 1);
    } else if (action === 'join') { showJoinStep();
    } else if (action === 'back-to-welcome') { goToStep(1);
    } else if (action === 'finish') { await finishOnboarding(); }
  });
}

export { initOnboarding };
