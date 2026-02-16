/* ==============================================
   MimiTask — Système de récompenses
   Liste, création, suppression, célébration
   ============================================== */

import * as store from './store.js';
import { formatDate } from './utils.js';

const rewardModalEl = () => document.getElementById('add-reward-modal');
const rewardFormEl = () => document.getElementById('add-reward-form');
let selectedEmoji = '🎁';

/* --- Rendu de la liste --- */

function buildRewardCardHTML(reward, couplePoints) {
  const unlocked = !!reward.unlockedAt;
  const cls = unlocked ? ' reward-card--unlocked' : '';
  const pct = unlocked ? 100 : Math.max(0, Math.min(100, Math.round((couplePoints / reward.pointsCost) * 100)));
  const progress = unlocked
    ? `<span class="reward-card__date">Débloqué le ${formatDate(reward.unlockedAt)}</span>`
    : `<div class="reward-card__progress"><div class="reward-card__progress-fill" style="width:${pct}%"></div></div>`;
  const del = unlocked ? '' : `<button class="reward-card__delete" data-delete-reward="${reward.id}" aria-label="Supprimer">&times;</button>`;
  return `<div class="reward-card${cls}" data-reward-id="${reward.id}">
    <span class="reward-card__icon">${reward.icon || '🎁'}</span>
    <div class="reward-card__info">
      <span class="reward-card__name">${reward.name}</span>
      <span class="reward-card__cost">${reward.pointsCost} pts</span>
      ${reward.description ? `<span class="reward-card__desc">${reward.description}</span>` : ''}
      ${progress}
    </div>${del}</div>`;
}

function renderRewardsList() {
  const rewards = store.getRewards();
  const { couplePoints } = store.getStats();
  const locked = rewards.filter(r => !r.unlockedAt).sort((a, b) => a.pointsCost - b.pointsCost);
  const unlocked = rewards.filter(r => r.unlockedAt);
  const container = document.getElementById('rewards-list');
  let html = '';
  if (locked.length > 0) {
    html += '<p class="rewards-section__subtitle">Prochaines récompenses</p>';
    html += locked.map(r => buildRewardCardHTML(r, couplePoints)).join('');
  }
  if (unlocked.length > 0) {
    html += '<p class="rewards-section__subtitle">Débloquées 🎉</p>';
    html += unlocked.map(r => buildRewardCardHTML(r, couplePoints)).join('');
  }
  if (rewards.length === 0) {
    html = '<p class="empty-state__subtitle">Aucune récompense. Ajoutez-en une !</p>';
  }
  container.innerHTML = html;
}

/* --- Celebration --- */

function celebrateRewardUnlock(reward) {
  const overlay = document.createElement('div');
  overlay.className = 'celebration';
  overlay.innerHTML = `<div class="celebration__content">
    <span class="celebration__emoji">${reward.icon || '🎁'}</span>
    <p class="celebration__text">${reward.name} débloqué !</p>
    <p class="celebration__sub">Vous l'avez bien mérité.</p></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => dismissCelebration(overlay));
  setTimeout(() => dismissCelebration(overlay), 3000);
}

function dismissCelebration(el) {
  if (el.classList.contains('celebration--out')) return;
  el.classList.add('celebration--out');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* --- Modal d'ajout --- */

function openAddRewardModal() {
  rewardFormEl().reset();
  selectedEmoji = '🎁';
  updateEmojiSelection();
  updateCostDisplay();
  const el = rewardModalEl();
  el.classList.add('modal-overlay--active');
  el.setAttribute('aria-hidden', 'false');
  document.getElementById('reward-name').focus();
}

function closeAddRewardModal() {
  const el = rewardModalEl();
  el.classList.remove('modal-overlay--active');
  el.setAttribute('aria-hidden', 'true');
}

function updateEmojiSelection() {
  rewardModalEl().querySelectorAll('.emoji-picker__btn').forEach(btn => {
    btn.classList.toggle('emoji-picker__btn--active', btn.dataset.emoji === selectedEmoji);
  });
}

function updateCostDisplay() {
  document.getElementById('reward-cost-display').textContent = `${document.getElementById('reward-cost').value} pts`;
}

function handleRewardSubmit(e) {
  e.preventDefault();
  const nameIn = document.getElementById('reward-name');
  const name = nameIn.value.trim();
  if (!name) { nameIn.classList.add('form-group__input--error'); nameIn.focus(); return; }
  const pointsCost = parseInt(document.getElementById('reward-cost').value);
  store.addReward({ name, pointsCost, icon: selectedEmoji });
  closeAddRewardModal();
  window.showToast('Nouvelle récompense en jeu !');
  renderRewardsList();
}

/* --- Suppression --- */

function handleDeleteReward(e) {
  const btn = e.target.closest('[data-delete-reward]');
  if (!btn) return;
  if (!confirm('Supprimer cette récompense ?')) return;
  store.deleteReward(btn.dataset.deleteReward);
  window.showToast('Récompense retirée.');
  renderRewardsList();
}

/* --- Navigation dashboard → récompenses --- */

function switchToRewards() {
  document.querySelector('[data-target="screen-settings"]')?.click();
}

/* --- Initialisation --- */

function initRewards() {
  document.getElementById('add-reward-btn').addEventListener('click', openAddRewardModal);
  document.getElementById('close-add-reward').addEventListener('click', closeAddRewardModal);
  rewardModalEl().addEventListener('click', (e) => { if (e.target === rewardModalEl()) closeAddRewardModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rewardModalEl().classList.contains('modal-overlay--active')) closeAddRewardModal();
  });
  rewardFormEl().addEventListener('submit', handleRewardSubmit);
  document.getElementById('reward-cost').addEventListener('input', updateCostDisplay);
  document.getElementById('reward-emoji-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-picker__btn');
    if (!btn) return;
    selectedEmoji = btn.dataset.emoji;
    updateEmojiSelection();
  });
  document.getElementById('reward-name').addEventListener('input', (e) => {
    e.target.classList.remove('form-group__input--error');
  });
  document.getElementById('rewards-list').addEventListener('click', handleDeleteReward);
  document.getElementById('dashboard-reward-content')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="view-rewards"]')) switchToRewards();
  });
  renderRewardsList();
}

export { initRewards, renderRewardsList, celebrateRewardUnlock };
