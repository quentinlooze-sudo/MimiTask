/* ==============================================
   MimiTask — Système de récompenses
   Liste, création, suppression, célébration
   ============================================== */

import * as store from './store.js';
import { formatDate } from './utils.js';
import { openPaidDelegationPicker, PAID_DELEGATION_COST } from './delegation.js';

const rewardModalEl = () => document.getElementById('add-reward-modal');
const rewardFormEl = () => document.getElementById('add-reward-form');
let selectedEmoji = '🎁';
const COUPLE_TIERS = [400, 800, 1500, 3000];

/* --- Rendu d'une carte récompense --- */
function buildRewardCardHTML(reward, couplePoints, myPoints) {
  const unlocked = !!reward.unlockedAt;
  const isPower = reward.type === 'power';
  const isCouple = reward.type === 'couple';
  const cls = unlocked ? ' reward-card--unlocked' : (isPower ? ' reward-card--power' : '');
  if (isPower) {
    const canAfford = myPoints >= reward.pointsCost;
    const btnCls = canAfford ? 'btn btn--primary btn--sm' : 'btn btn--ghost btn--sm';
    return `<div class="reward-card${cls}" data-reward-id="${reward.id}">
      <span class="reward-card__icon">${reward.icon || '🔄'}</span>
      <div class="reward-card__info"><span class="reward-card__name">${reward.name}</span>
        <span class="reward-card__desc">${reward.description || ''}</span>
        <span class="reward-card__cost">${reward.pointsCost} pts individuels</span></div>
      <button class="${btnCls}" data-use-power="${reward.id}"${canAfford ? '' : ' disabled'}>Utiliser</button></div>`;
  }
  const pts = isCouple ? couplePoints : myPoints;
  const pct = unlocked ? 100 : Math.max(0, Math.min(100, Math.round((pts / reward.pointsCost) * 100)));
  const costLabel = isCouple ? `${reward.pointsCost} pts ensemble` : `${reward.pointsCost} pts`;
  let actions = '';
  if (unlocked) {
    actions = `<button class="btn btn--ghost btn--sm" data-use-reward="${reward.id}">Utiliser</button>`;
  } else if (!isCouple) {
    actions = `<button class="reward-card__delete" data-delete-reward="${reward.id}" aria-label="Supprimer">&times;</button>`;
  }
  const progress = unlocked
    ? `<span class="reward-card__date">Débloqué le ${formatDate(reward.unlockedAt)}</span>`
    : `<div class="reward-card__progress"><div class="reward-card__progress-fill" style="width:${pct}%"></div></div>`;
  return `<div class="reward-card${cls}" data-reward-id="${reward.id}">
    <span class="reward-card__icon">${reward.icon || '🎁'}</span>
    <div class="reward-card__info"><span class="reward-card__name">${reward.name}</span>
      <span class="reward-card__cost">${costLabel}</span>
      ${reward.description ? `<span class="reward-card__desc">${reward.description}</span>` : ''}
      ${progress}</div>${actions}</div>`;
}

/* --- Rendu des sections couple par palier --- */
function buildCoupleTiersHTML(coupleRewards, couplePoints) {
  let html = '<h3 class="rewards-section__title">Récompenses couple</h3>';
  for (const tier of COUPLE_TIERS) {
    const tierRewards = coupleRewards.filter(r => r.pointsCost === tier);
    if (tierRewards.length === 0) continue;
    html += `<p class="rewards-section__subtitle">Palier ${COUPLE_TIERS.indexOf(tier) + 1} — ${tier} pts cumulés</p>`;
    html += tierRewards.map(r => buildRewardCardHTML(r, couplePoints, 0)).join('');
  }
  return html;
}

async function renderRewardsList() {
  const rewards = store.getRewards();
  const stats = store.getStats();
  let myPoints = 0;
  try { const { getPartnerRole } = await import('./auth.js'); const role = getPartnerRole(); if (role) myPoints = stats[role]?.totalPoints || 0; }
  catch { /* fallback */ }
  const powers = rewards.filter(r => r.type === 'power');
  const couple = rewards.filter(r => r.type === 'couple');
  const locked = rewards.filter(r => !r.unlockedAt && !r.type).sort((a, b) => a.pointsCost - b.pointsCost);
  const unlocked = rewards.filter(r => r.unlockedAt && r.type !== 'couple');
  const container = document.getElementById('rewards-list');
  let html = '';
  if (powers.length > 0) {
    html += '<p class="rewards-section__subtitle">⚡ Pouvoirs spéciaux</p>';
    html += powers.map(r => buildRewardCardHTML(r, stats.couplePoints, myPoints)).join('');
  }
  if (locked.length > 0) {
    html += '<p class="rewards-section__subtitle">Récompenses individuelles</p>';
    html += locked.map(r => buildRewardCardHTML(r, stats.couplePoints, myPoints)).join('');
  }
  if (unlocked.length > 0) {
    html += '<p class="rewards-section__subtitle">Débloquées 🎉</p>';
    html += unlocked.map(r => buildRewardCardHTML(r, stats.couplePoints, myPoints)).join('');
  }
  if (couple.length > 0) html += buildCoupleTiersHTML(couple, stats.couplePoints);
  if (rewards.length === 0) html = '<p class="empty-state__subtitle">Aucune récompense. Ajoutez-en une !</p>';
  container.innerHTML = html;
}

/* --- Celebration + confetti --- */
const CONFETTI_COLORS = ['#E9C46A', '#E76F51', '#7209B7', '#52B788', '#F4A261', '#0077B6', '#E63946'];
function spawnConfetti(container) {
  const canvas = document.createElement('canvas');
  canvas.className = 'celebration__confetti';
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width, y: -10 - Math.random() * canvas.height * 0.5,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
    vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4,
    rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  }));
  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.rot += p.vr;
      if (p.y < canvas.height + 20) alive = true;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(frame); canvas.remove(); };
}
function celebrateRewardUnlock(reward) {
  const isCouple = reward.type === 'couple';
  const overlay = document.createElement('div');
  overlay.className = 'celebration';
  overlay.innerHTML = `<div class="celebration__content">
    <span class="celebration__emoji">${reward.icon || '🎁'}</span>
    <p class="celebration__text">${reward.name} débloqué${isCouple ? 'e' : ''} !</p>
    <p class="celebration__sub">${isCouple ? 'Bravo à tous les deux !' : 'Vous l\'avez bien mérité.'}</p></div>`;
  document.body.appendChild(overlay);
  const stopConfetti = spawnConfetti(overlay);
  const dismiss = () => { stopConfetti(); dismissCelebration(overlay); };
  overlay.addEventListener('click', dismiss);
  setTimeout(dismiss, 3500);
}
function dismissCelebration(el) {
  if (el.classList.contains('celebration--out')) return;
  el.classList.add('celebration--out');
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* --- Modal d'ajout --- */
function openAddRewardModal() {
  rewardFormEl().reset(); selectedEmoji = '🎁'; updateEmojiSelection(); updateCostDisplay();
  const el = rewardModalEl();
  el.classList.add('modal-overlay--active'); el.setAttribute('aria-hidden', 'false');
  document.getElementById('reward-name').focus();
}
function closeAddRewardModal() {
  const el = rewardModalEl();
  el.classList.remove('modal-overlay--active'); el.setAttribute('aria-hidden', 'true');
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
  closeAddRewardModal(); window.showToast('Nouvelle récompense en jeu !'); renderRewardsList();
}

/* --- Clics sur la liste --- */
function handleRewardsListClick(e) {
  const delBtn = e.target.closest('[data-delete-reward]');
  if (delBtn) {
    if (!confirm('Supprimer cette récompense ?')) return;
    store.deleteReward(delBtn.dataset.deleteReward);
    window.showToast('Récompense retirée.'); renderRewardsList(); return;
  }
  const useBtn = e.target.closest('[data-use-reward]');
  if (useBtn) {
    import('./auth.js').then(({ getPartnerRole }) => {
      const role = getPartnerRole();
      if (!role) { window.showToast('Identifie-toi d\'abord.', 'error'); return; }
      const id = useBtn.dataset.useReward;
      const reward = store.getRewards().find(r => r.id === id);
      if (!reward) return;
      const ok = store.useReward(id, role);
      if (!ok) { window.showToast('Points insuffisants.', 'error'); return; }
      window.showToast(`${reward.icon} ${reward.name} utilisée !`);
      renderRewardsList(); window.renderDashboard?.();
    });
    return;
  }
  const powerBtn = e.target.closest('[data-use-power]');
  if (powerBtn) {
    import('./auth.js').then(({ getPartnerRole }) => {
      const role = getPartnerRole();
      if (!role) { window.showToast('Identifie-toi d\'abord.', 'error'); return; }
      openPaidDelegationPicker(role, () => { renderRewardsList(); window.renderTaskList?.(); });
    });
  }
}
function switchToRewards() { document.querySelector('[data-target="screen-settings"]')?.click(); }

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
    if (!btn) return; selectedEmoji = btn.dataset.emoji; updateEmojiSelection();
  });
  document.getElementById('reward-name').addEventListener('input', (e) => e.target.classList.remove('form-group__input--error'));
  document.getElementById('rewards-list').addEventListener('click', handleRewardsListClick);
  document.getElementById('dashboard-reward-content')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="view-rewards"]')) switchToRewards();
  });
  renderRewardsList();
  window.renderRewardsList = renderRewardsList;
}

export { initRewards, renderRewardsList, celebrateRewardUnlock };
