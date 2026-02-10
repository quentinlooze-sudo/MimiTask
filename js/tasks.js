/* ==============================================
   MimiTask — Écran Tâches
   Liste, filtres, validation 1-tap, modal d'ajout
   ============================================== */

import * as store from './store.js';
import { isToday } from './utils.js';
import { processTaskCompletion } from './points.js';
import { celebrateRewardUnlock } from './rewards.js';
import { renderDelegationBanner, getDelegationBadge, getDelegateButton, handleDelegateClick, handleDelegationResponse } from './delegation.js';

let currentFilter = 'all';
const modalEl = () => document.getElementById('add-task-modal');
const formEl = () => document.getElementById('add-task-form');

/* Retourne les infos des partenaires pour l'affichage */
function getPartnerInfo() {
  const c = store.getCouple();
  return {
    partnerA: { name: c.partnerA.name || 'Partenaire 1', initial: (c.partnerA.name || 'A')[0] },
    partnerB: { name: c.partnerB.name || 'Partenaire 2', initial: (c.partnerB.name || 'B')[0] }
  };
}

/* Construit le HTML d'une carte tâche */
function buildCardHTML(task, info, completed) {
  const p = info[task.assignedTo];
  const color = task.assignedTo === 'partnerA' ? 'a' : 'b';
  const cls = completed ? ' task-card--completed' : '';
  const checkCls = completed ? ' task-card__check--done' : '';
  return `<div class="task-card${cls}" data-task-id="${task.id}">
    <button class="task-card__check${checkCls}" data-complete="${task.id}"
      data-partner="${task.assignedTo}" aria-label="Valider ${task.name}"${completed ? ' disabled' : ''}>
      ${completed ? '✓' : ''}</button>
    <span class="task-card__icon">${task.icon || '📋'}</span>
    <div class="task-card__info">
      <span class="task-card__name">${task.name}</span>
      <span class="task-card__meta"><span class="task-card__points">+${task.points} pts</span>${getDelegationBadge(task)}</span>
    </div>
    ${getDelegateButton(task, completed)}
    <div class="task-card__avatar task-card__avatar--${color}">${p.initial}</div>
  </div>`;
}

/* Affiche un empty state selon le type */
function renderEmptyState(type) {
  if (type === 'allDone') {
    return `<div class="empty-state"><div class="empty-state__icon">🎉</div>
      <p class="empty-state__title">Tout est fait !</p>
      <p class="empty-state__subtitle">Bravo l'équipe, vous avez tout géré aujourd'hui.</p></div>`;
  }
  return `<div class="empty-state"><div class="empty-state__icon">📋</div>
    <p class="empty-state__title">Rien à faire !</p>
    <p class="empty-state__subtitle">Profitez-en… ou ajoutez une tâche pour marquer des points.</p>
    <button class="btn btn--primary empty-state__cta" id="empty-add-task">+ Ajouter une tâche</button></div>`;
}

/* Rendu principal de la liste de tâches */
function renderTaskList(filter) {
  if (filter !== undefined) currentFilter = filter;
  const info = getPartnerInfo();
  let tasks = store.getTasks();

  // Filtre par partenaire
  if (currentFilter !== 'all') tasks = tasks.filter(t => t.assignedTo === currentFilter);

  const active = tasks.filter(t => !t.completedAt || !isToday(t.completedAt));
  const done = tasks.filter(t => t.completedAt && isToday(t.completedAt));
  const container = document.getElementById('task-list');

  // Empty states
  if (store.getTasks().length === 0) {
    container.innerHTML = renderEmptyState('noTasks');
    document.getElementById('empty-add-task')?.addEventListener('click', openAddModal);
    return;
  }
  if (active.length === 0) {
    container.innerHTML = renderEmptyState('allDone')
      + done.map(t => buildCardHTML(t, info, true)).join('');
    return;
  }
  const banner = renderDelegationBanner(info);
  container.innerHTML = banner + active.map(t => buildCardHTML(t, info, false)).join('')
    + done.map(t => buildCardHTML(t, info, true)).join('');
}

/* Génère les chips de filtre avec les noms du couple */
function renderFilters() {
  const info = getPartnerInfo();
  document.getElementById('tasks-filters').innerHTML = `
    <button class="tasks-filter-chip tasks-filter-chip--active" data-filter="all">Toutes</button>
    <button class="tasks-filter-chip" data-filter="partnerA">${info.partnerA.name}</button>
    <button class="tasks-filter-chip" data-filter="partnerB">${info.partnerB.name}</button>`;
}

function handleFilterClick(e) {
  const chip = e.target.closest('.tasks-filter-chip');
  if (!chip) return;
  document.querySelectorAll('.tasks-filter-chip').forEach(c => c.classList.remove('tasks-filter-chip--active'));
  chip.classList.add('tasks-filter-chip--active');
  renderTaskList(chip.dataset.filter);
}

function handleTaskComplete(e) {
  const btn = e.target.closest('[data-complete]');
  if (!btn || btn.disabled) return;
  const card = btn.closest('.task-card');
  const result = processTaskCompletion(btn.dataset.complete, btn.dataset.partner);
  if (!result) return;
  window.showToast(result.bonusApplied
    ? `+${result.points} pts (bonus streak !)` : `+${result.points} pts ! Bien joué !`);
  if (result.milestone) window.showToast(`🔥 ${result.milestone} jours d'affilée ! Continue comme ça !`);
  if (result.rewardUnlocked) celebrateRewardUnlock(result.rewardUnlocked);
  card.classList.add('task-card--completing');
  card.addEventListener('animationend', () => renderTaskList(), { once: true });
}

/* Gestionnaire unifié des clics dans la liste */
function handleTaskListClick(e) {
  const info = getPartnerInfo();
  if (handleDelegateClick(e, info, renderTaskList)) return;
  if (handleDelegationResponse(e, info, renderTaskList)) return;
  handleTaskComplete(e);
}

function populateAssignSelect() {
  const c = store.getCouple();
  document.getElementById('task-assign').innerHTML = `
    <option value="partnerA">${c.partnerA.name || 'Partenaire 1'}</option>
    <option value="partnerB">${c.partnerB.name || 'Partenaire 2'}</option>
    <option value="random">Aléatoire</option>`;
}

function openAddModal() {
  populateAssignSelect();
  formEl().reset();
  const el = modalEl();
  el.classList.add('modal-overlay--active');
  el.setAttribute('aria-hidden', 'false');
  document.getElementById('task-name').focus();
  el.addEventListener('keydown', trapFocus);
}

function closeAddModal() {
  const el = modalEl();
  el.classList.remove('modal-overlay--active');
  el.setAttribute('aria-hidden', 'true');
  el.removeEventListener('keydown', trapFocus);
  document.getElementById('fab-add-task').focus();
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const items = modalEl().querySelector('.modal').querySelectorAll('input, select, button');
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function handleSubmit(e) {
  e.preventDefault();
  const nameIn = document.getElementById('task-name');
  const ptsIn = document.getElementById('task-points');
  const name = nameIn.value.trim();
  const points = parseInt(ptsIn.value);
  if (!name) { nameIn.classList.add('form-group__input--error'); nameIn.focus(); return; }
  if (points < 1 || points > 20 || isNaN(points)) { ptsIn.classList.add('form-group__input--error'); ptsIn.focus(); return; }
  let assignedTo = document.getElementById('task-assign').value;
  if (assignedTo === 'random') assignedTo = Math.random() < 0.5 ? 'partnerA' : 'partnerB';
  store.addTask({ name, points, assignedTo, recurrence: document.getElementById('task-recurrence').value });
  closeAddModal();
  window.showToast('Tâche ajoutée !');
  renderTaskList();
}

function initTasks() {
  // Modal
  document.getElementById('fab-add-task').addEventListener('click', openAddModal);
  document.getElementById('close-add-task').addEventListener('click', closeAddModal);
  modalEl().addEventListener('click', (e) => { if (e.target === modalEl()) closeAddModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl().classList.contains('modal-overlay--active')) closeAddModal();
  });
  formEl().addEventListener('submit', handleSubmit);
  formEl().querySelectorAll('.form-group__input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('form-group__input--error'));
  });

  // Filtres + liste
  renderFilters();
  document.getElementById('tasks-filters').addEventListener('click', handleFilterClick);
  document.getElementById('task-list').addEventListener('click', handleTaskListClick);
  renderTaskList();
  window.renderTaskList = renderTaskList;
}

export { initTasks, renderTaskList, openAddModal, closeAddModal };
