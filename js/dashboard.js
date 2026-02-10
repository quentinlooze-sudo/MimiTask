/* ==============================================
   MimiTask — Écran Dashboard
   Barre équilibre, scores, mascotte, streaks, récompense, stats
   ============================================== */

import * as store from './store.js';
import { getNextReward, getWeeklyStats } from './points.js';
import { renderMascot } from './mascot.js';

/* --- Infos partenaires --- */
function getNames() {
  const c = store.getCouple();
  return { a: c.partnerA.name || 'Partenaire 1', b: c.partnerB.name || 'Partenaire 2' };
}

/* --- Sections de rendu --- */

function renderBalance() {
  const balance = store.getBalance();
  const names = getNames();
  const el = document.getElementById('dashboard-balance');
  el.querySelector('.balance__fill--a').style.width = `${balance.partnerA}%`;
  el.querySelector('.balance__fill--b').style.width = `${balance.partnerB}%`;
  el.querySelector('[data-label-a]').textContent = `${names.a} ${balance.partnerA}%`;
  el.querySelector('[data-label-b]').textContent = `${balance.partnerB}% ${names.b}`;
}

function renderScores() {
  const stats = store.getStats();
  const names = getNames();
  const el = document.getElementById('dashboard-scores');
  el.querySelector('[data-score-a] .score-card__value').textContent = `${stats.partnerA.totalPoints}`;
  el.querySelector('[data-score-a] .score-card__label').textContent = names.a;
  el.querySelector('[data-score-b] .score-card__value').textContent = `${stats.partnerB.totalPoints}`;
  el.querySelector('[data-score-b] .score-card__label').textContent = names.b;
  el.querySelector('[data-score-couple] .score-card__value').textContent = `${stats.couplePoints}`;
}

function renderStreaks() {
  const stats = store.getStats();
  const names = getNames();
  const container = document.getElementById('dashboard-streaks');
  const streakA = stats.partnerA.currentStreak;
  const streakB = stats.partnerB.currentStreak;
  const bestA = stats.partnerA.bestStreak;
  const bestB = stats.partnerB.bestStreak;
  container.innerHTML = buildStreakHTML(names.a, streakA, bestA) + buildStreakHTML(names.b, streakB, bestB);
}

function buildStreakHTML(name, current, best) {
  const countText = current > 0 ? `${current} jours d'affilée !` : 'Pas encore de série';
  const recordText = best > 0 ? `Record : ${best} jours` : '';
  const flame = current > 3 ? ' 🔥' : '';
  return `<div class="streak">
    <span class="streak__icon">🔥</span>
    <div class="streak__info">
      <span class="streak__count">${name} — ${countText}${flame}</span>
      ${recordText ? `<span class="streak__record">${recordText}</span>` : ''}
    </div></div>`;
}

function renderNextReward() {
  const el = document.getElementById('dashboard-reward-content');
  const next = getNextReward();
  const cta = '<button class="btn btn--ghost" data-action="view-rewards">Voir toutes les récompenses</button>';
  if (!next) {
    el.innerHTML = `<div class="next-reward">
      <span class="next-reward__icon">🏆</span>
      <div class="next-reward__info">
        <span class="next-reward__name">Toutes les récompenses sont débloquées !</span>
      </div></div>${cta}`;
    return;
  }
  const pct = Math.max(0, Math.min(100, Math.round(((next.pointsCost - next.remaining) / next.pointsCost) * 100)));
  el.innerHTML = `<div class="next-reward">
    <span class="next-reward__icon">🎁</span>
    <div class="next-reward__info">
      <span class="next-reward__name">${next.name}</span>
      <span class="next-reward__remaining">Encore ${next.remaining} pts</span>
      <div class="next-reward__progress">
        <div class="next-reward__progress-fill" style="width:${pct}%"></div>
      </div>
    </div></div>${cta}`;
}

function renderWeeklyStats() {
  const statsA = getWeeklyStats('partnerA');
  const statsB = getWeeklyStats('partnerB');
  const totalTasks = statsA.tasksCompleted + statsB.tasksCompleted;
  const totalPoints = statsA.totalPoints + statsB.totalPoints;
  const el = document.getElementById('dashboard-weekly');
  el.querySelector('[data-stat-tasks] .stat-item__value').textContent = totalTasks;
  el.querySelector('[data-stat-points] .stat-item__value').textContent = totalPoints;
}

/* --- Rendu global --- */

function renderDashboard() {
  renderBalance();
  renderScores();
  renderMascot();
  renderStreaks();
  renderNextReward();
  renderWeeklyStats();
}

/* --- Initialisation --- */

function initDashboard() {
  renderDashboard();
  window.renderDashboard = renderDashboard;
}

export { initDashboard, renderDashboard };
