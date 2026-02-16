/* ==============================================
   MimiTask — Rendu des tâches
   Cartes, accordéon par récurrence, recherche
   ============================================== */

import { isToday } from './utils.js';
import { getDelegationBadge, getDelegateButton } from './delegation.js';

/* Ordre d'affichage et labels français */
const RECURRENCE_ORDER = ['daily', 'weekly', 'biweekly', 'monthly', 'once'];
const RECURRENCE_LABELS = {
  daily: 'Quotidiennes',
  weekly: 'Hebdomadaires',
  biweekly: 'Bimensuelles',
  monthly: 'Mensuelles',
  once: 'Ponctuelles / Saisonnières'
};

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
  if (type === 'noSearchResults') {
    return `<div class="search-empty"><span class="search-empty__icon">🔍</span>
      <p class="search-empty__text">Aucune tâche trouvée.</p></div>`;
  }
  return `<div class="empty-state"><div class="empty-state__icon">📋</div>
    <p class="empty-state__title">Rien à faire !</p>
    <p class="empty-state__subtitle">Profitez-en… ou ajoutez une tâche pour marquer des points.</p>
    <button class="btn btn--primary empty-state__cta" id="empty-add-task">+ Ajouter une tâche</button></div>`;
}

/* Regroupe les tâches par récurrence dans l'ordre défini */
function groupTasksByRecurrence(tasks) {
  const groups = new Map();
  RECURRENCE_ORDER.forEach(key => groups.set(key, []));
  tasks.forEach(task => {
    const key = task.recurrence || 'once';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  });
  for (const [key, val] of groups) {
    if (val.length === 0) groups.delete(key);
  }
  return groups;
}

/* Génère le HTML d'une section accordéon */
function buildSectionHTML(recKey, tasks, info, accordionState) {
  const isOpen = accordionState[recKey] === true;
  const active = tasks.filter(t => !t.completedAt || !isToday(t.completedAt));
  const done = tasks.filter(t => t.completedAt && isToday(t.completedAt));
  const label = RECURRENCE_LABELS[recKey] || recKey;
  const openCls = isOpen ? ' accordion__header--open' : '';
  const bodyCls = isOpen ? ' accordion__body--open' : '';
  const cards = active.map(t => buildCardHTML(t, info, false)).join('')
    + done.map(t => buildCardHTML(t, info, true)).join('');
  return `<div class="accordion" data-recurrence="${recKey}">
    <button class="accordion__header${openCls}" aria-expanded="${isOpen}"
      data-accordion-toggle="${recKey}">
      <span class="accordion__label">${label}</span>
      <span class="accordion__count">${done.length}/${tasks.length}</span>
      <span class="accordion__chevron" aria-hidden="true"></span>
    </button>
    <div class="accordion__body${bodyCls}"${isOpen ? '' : ' hidden'}>
      ${cards}
    </div>
  </div>`;
}

/* Génère tout le contenu accordéon */
function buildAccordionHTML(tasks, info, accordionState) {
  const groups = groupTasksByRecurrence(tasks);
  let html = '';
  for (const [recKey, groupTasks] of groups) {
    html += buildSectionHTML(recKey, groupTasks, info, accordionState);
  }
  return html;
}

/* Génère une liste plate (mode recherche) */
function buildSearchResultsHTML(tasks, info) {
  return tasks.map(t => {
    const completed = t.completedAt && isToday(t.completedAt);
    return buildCardHTML(t, info, completed);
  }).join('');
}

export {
  RECURRENCE_ORDER, RECURRENCE_LABELS,
  buildCardHTML, renderEmptyState,
  groupTasksByRecurrence, buildAccordionHTML, buildSearchResultsHTML
};
