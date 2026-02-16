/* ==============================================
   MimiTask — Délégation (passe-tour gratuit + payant)
   Bandeau notifications, badges, requête/réponse, achat
   ============================================== */

import * as store from './store.js';
import { getPartnerRole } from './auth.js';

const PAID_DELEGATION_COST = 300;

/* Retourne le HTML du bandeau de notification pour les délégations en attente */
function renderDelegationBanner(info) {
  const allPending = store.getTasks().filter(t => t.delegationStatus?.status === 'pending');
  if (allPending.length === 0) return '';
  return allPending.map(task => {
    const requester = info[task.delegationStatus.requestedBy];
    const isPaid = task.delegationStatus.type === 'paid';
    const label = isPaid ? '🎯 Pouvoir utilisé' : '';
    return `<div class="delegation-banner" data-task-id="${task.id}">
      <p class="delegation-banner__text">${requester.name} te demande un coup de main pour « ${task.name} ». ${label}</p>
      <div class="delegation-banner__actions">
        <button class="btn btn--primary btn--sm" data-accept-delegation="${task.id}">J'accepte</button>
        <button class="btn btn--ghost btn--sm" data-decline-delegation="${task.id}">Pas cette fois</button>
      </div></div>`;
  }).join('');
}

/* Retourne le badge selon l'état de délégation */
function getDelegationBadge(task) {
  if (task.delegationStatus?.status === 'pending') return ' <span class="task-card__badge">⏳ Demandé</span>';
  if (task.delegationStatus?.type === 'paid' && task.delegationStatus?.status === 'accepted') {
    return ' <span class="task-card__badge task-card__badge--paid">🎯 Déléguée (0 pts)</span>';
  }
  return '';
}

/* Retourne le bouton passe-tour (sauf si complétée ou déjà en pending) */
function getDelegateButton(task, completed) {
  if (completed || task.delegationStatus?.status === 'pending') return '';
  return `<button class="task-card__delegate" data-delegate="${task.id}"
    data-assigned="${task.assignedTo}" aria-label="Passe-tour">↗</button>`;
}

/* Gère le clic sur le bouton passe-tour gratuit */
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
    const wasPaid = task?.delegationStatus?.type === 'paid';
    const name = task ? info[task.assignedTo].name : '';
    store.declineDelegation(taskId);
    window.showToast(wasPaid ? `Refusé — ${PAID_DELEGATION_COST} pts remboursés.` : `OK, la tâche reste chez ${name}.`);
    renderCallback();
    return true;
  }
  return false;
}

/* Ouvre le sélecteur de tâches pour une délégation payante */
function openPaidDelegationPicker(partnerId, renderCallback) {
  const stats = store.getStats();
  const myPoints = stats[partnerId]?.totalPoints || 0;
  if (myPoints < PAID_DELEGATION_COST) {
    window.showToast(`Pas assez de points (${PAID_DELEGATION_COST} pts requis, tu en as ${myPoints})`, 'error');
    return;
  }
  const tasks = store.getTasksByPartner(partnerId).filter(t => !t.completedAt && t.delegationStatus?.status !== 'pending');
  if (tasks.length === 0) { window.showToast('Aucune tâche à déléguer.', 'error'); return; }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay modal-overlay--active';
  overlay.setAttribute('aria-hidden', 'false');
  overlay.innerHTML = `<div class="modal">
    <div class="modal__header"><h2 class="modal__title">Déléguer une tâche (${PAID_DELEGATION_COST} pts)</h2>
      <button class="modal__close" aria-label="Fermer">&times;</button></div>
    <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);margin-bottom:var(--space-md)">
      La tâche sera transférée à l'autre. Elle ne rapportera aucun point.</p>
    <div class="delegation-picker__list">${tasks.map(t =>
      `<button class="delegation-picker__item" data-pick-task="${t.id}">
        <span>${t.icon || '📋'}</span> <span>${t.name}</span>
        <span style="color:var(--color-text-secondary);font-size:var(--font-size-sm)">${t.points} pts</span>
      </button>`).join('')}</div></div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.classList.remove('modal-overlay--active'); overlay.remove(); };
  overlay.querySelector('.modal__close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.delegation-picker__list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pick-task]');
    if (!btn) return;
    if (!confirm(`Dépenser ${PAID_DELEGATION_COST} pts pour déléguer cette tâche ?`)) return;
    const ok = store.requestDelegation(btn.dataset.pickTask, partnerId, 'paid', PAID_DELEGATION_COST);
    if (!ok) { window.showToast('Erreur : points insuffisants ou tâche indisponible.', 'error'); return; }
    window.showToast(`${PAID_DELEGATION_COST} pts dépensés — demande envoyée !`);
    close();
    renderCallback?.();
  });
}

export {
  PAID_DELEGATION_COST,
  renderDelegationBanner, getDelegationBadge, getDelegateButton,
  handleDelegateClick, handleDelegationResponse, openPaidDelegationPicker
};
