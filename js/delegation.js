/* ==============================================
   MimiTask — Délégation (passe-tour)
   Bandeau notifications, badges, requête/réponse
   ============================================== */

import * as store from './store.js';
import { getPartnerRole } from './auth.js';

/* Retourne le HTML du bandeau de notification pour les délégations en attente */
function renderDelegationBanner(info) {
  const allPending = store.getTasks().filter(t => t.delegationStatus?.status === 'pending');
  if (allPending.length === 0) return '';
  return allPending.map(task => {
    const requester = info[task.delegationStatus.requestedBy];
    return `<div class="delegation-banner" data-task-id="${task.id}">
      <p class="delegation-banner__text">${requester.name} te demande un coup de main pour « ${task.name} ».</p>
      <div class="delegation-banner__actions">
        <button class="btn btn--primary btn--sm" data-accept-delegation="${task.id}">J'accepte</button>
        <button class="btn btn--ghost btn--sm" data-decline-delegation="${task.id}">Pas cette fois</button>
      </div></div>`;
  }).join('');
}

/* Retourne le badge "⏳ Demandé" si la tâche est en attente de délégation */
function getDelegationBadge(task) {
  if (task.delegationStatus?.status === 'pending') return ' <span class="task-card__badge">⏳ Demandé</span>';
  return '';
}

/* Retourne le bouton passe-tour (sauf si complétée ou déjà en pending) */
function getDelegateButton(task, completed) {
  if (completed || task.delegationStatus?.status === 'pending') return '';
  return `<button class="task-card__delegate" data-delegate="${task.id}"
    data-assigned="${task.assignedTo}" aria-label="Passe-tour">↗</button>`;
}

/* Gère le clic sur le bouton passe-tour */
function handleDelegateClick(e, info, renderCallback) {
  const btn = e.target.closest('[data-delegate]');
  if (!btn) return false;
  const me = getPartnerRole() || 'partnerA';
  const other = me === 'partnerA' ? 'partnerB' : 'partnerA';
  const otherName = info[other].name;
  if (!confirm(`Demander à ${otherName} de s'en charger ?`)) return true;
  store.requestDelegation(btn.dataset.delegate, me);
  window.showToast(`Demande envoyée à ${otherName} !`);
  renderCallback();
  return true;
}

/* Gère les réponses accepter/refuser du bandeau */
function handleDelegationResponse(e, info, renderCallback) {
  const acceptBtn = e.target.closest('[data-accept-delegation]');
  const declineBtn = e.target.closest('[data-decline-delegation]');
  if (acceptBtn) {
    store.acceptDelegation(acceptBtn.dataset.acceptDelegation);
    window.showToast("C'est noté ! La tâche est à toi.");
    renderCallback();
    return true;
  }
  if (declineBtn) {
    const taskId = declineBtn.dataset.declineDelegation;
    const task = store.getTasks().find(t => t.id === taskId);
    const name = task ? info[task.assignedTo].name : '';
    store.declineDelegation(taskId);
    window.showToast(`OK, la tâche reste chez ${name}.`);
    renderCallback();
    return true;
  }
  return false;
}

export {
  renderDelegationBanner, getDelegationBadge, getDelegateButton,
  handleDelegateClick, handleDelegationResponse
};
