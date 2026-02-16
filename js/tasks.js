/* ==============================================
   MimiTask — Écran Tâches
   Filtres, accordéon, recherche, validation, modal
   ============================================== */

import * as store from './store.js';
import { isToday, debounce } from './utils.js';
import { processTaskCompletion } from './points.js';
import { celebrateRewardUnlock } from './rewards.js';
import { renderDelegationBanner, getDelegationBadge, getDelegateButton, handleDelegateClick, handleDelegationResponse } from './delegation.js';
import { getPartnerRole } from './auth.js';
import { buildCardHTML, renderEmptyState, buildAccordionHTML, buildSearchResultsHTML } from './task-renderer.js';

let currentFilter = 'all';
let currentSearchQuery = '';
let accordionState = {};
const ACCORDION_KEY = 'mimitask_accordion_state';
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

/* Persistence de l'état accordéon (localStorage uniquement) */
function loadAccordionState() {
  try { accordionState = JSON.parse(localStorage.getItem(ACCORDION_KEY)) || {}; }
  catch { accordionState = {}; }
}
function saveAccordionState() {
  try { localStorage.setItem(ACCORDION_KEY, JSON.stringify(accordionState)); } catch {}
}

/* Rendu principal de la liste de tâches */
function renderTaskList(filter) {
  if (filter !== undefined) currentFilter = filter;
  const info = getPartnerInfo();
  let tasks = store.getTasks();

  if (currentFilter !== 'all') tasks = tasks.filter(t => t.assignedTo === currentFilter);

  const container = document.getElementById('task-list');

  /* Empty states */
  if (store.getTasks().length === 0) {
    container.innerHTML = renderEmptyState('noTasks');
    document.getElementById('empty-add-task')?.addEventListener('click', openAddModal);
    return;
  }

  /* Mode recherche : liste plate filtrée */
  if (currentSearchQuery) {
    const q = currentSearchQuery.toLowerCase();
    const filtered = tasks.filter(t => t.name.toLowerCase().includes(q));
    if (filtered.length === 0) {
      container.innerHTML = renderEmptyState('noSearchResults');
      return;
    }
    container.innerHTML = buildSearchResultsHTML(filtered, info);
    return;
  }

  /* Mode normal : accordéon par récurrence */
  const active = tasks.filter(t => !t.completedAt || !isToday(t.completedAt));
  const done = tasks.filter(t => t.completedAt && isToday(t.completedAt));
  if (active.length === 0 && done.length > 0) {
    container.innerHTML = renderEmptyState('allDone')
      + done.map(t => buildCardHTML(t, info, true)).join('');
    return;
  }
  const banner = renderDelegationBanner(info);
  container.innerHTML = banner + buildAccordionHTML(tasks, info, accordionState);
}

/* Gestion de la recherche */
function handleSearchInput(e) {
  currentSearchQuery = e.target.value.trim();
  renderTaskList();
}

/* Toggle accordéon (ouvert/fermé) */
function handleAccordionToggle(e) {
  const btn = e.target.closest('[data-accordion-toggle]');
  if (!btn) return;
  const key = btn.dataset.accordionToggle;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  const newState = !isOpen;

  btn.setAttribute('aria-expanded', newState);
  btn.classList.toggle('accordion__header--open', newState);
  const body = btn.nextElementSibling;
  if (body) {
    body.classList.toggle('accordion__body--open', newState);
    body.hidden = !newState;
  }
  accordionState[key] = newState;
  saveAccordionState();
}

/* Filtres */
function renderFilters() {
  const info = getPartnerInfo();
  const me = getPartnerRole() || 'partnerA';
  const other = me === 'partnerA' ? 'partnerB' : 'partnerA';
  document.getElementById('tasks-filters').innerHTML = `
    <button class="tasks-filter-chip tasks-filter-chip--active" data-filter="all">Toutes</button>
    <button class="tasks-filter-chip" data-filter="${me}">${info[me].name}</button>
    <button class="tasks-filter-chip" data-filter="${other}">${info[other].name}</button>`;
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
  const result = processTaskCompletion(btn.dataset.complete, getPartnerRole());
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
  if (e.target.closest('[data-accordion-toggle]')) { handleAccordionToggle(e); return; }
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
  populateAssignSelect(); formEl().reset();
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
  closeAddModal(); window.showToast('Tâche ajoutée !'); renderTaskList();
}

function initTasks() {
  loadAccordionState();
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

  /* Recherche (debounce 150ms) */
  const searchInput = document.getElementById('task-search');
  if (searchInput) searchInput.addEventListener('input', debounce(handleSearchInput, 150));

  /* Filtres + liste */
  renderFilters();
  document.getElementById('tasks-filters').addEventListener('click', handleFilterClick);
  document.getElementById('task-list').addEventListener('click', handleTaskListClick);
  renderTaskList();
  window.renderTaskList = renderTaskList;
  window.renderFilters = renderFilters;
}

export { initTasks, renderTaskList, openAddModal, closeAddModal };
