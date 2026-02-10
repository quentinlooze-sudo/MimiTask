/* ==============================================
   MimiTask — Système de points
   Calcul, bonus streak, seuils de récompense
   ============================================== */

import * as store from './store.js';
import { isSameDay, getDaysDifference } from './utils.js';

const STREAK_BONUS_THRESHOLD = 3;
const STREAK_MILESTONES = [3, 5, 7, 10];
const STREAK_BONUS_MULTIPLIER = 1.5;
const MAX_POINTS_PER_TASK = 20;
const MAX_POINTS_CAP = Math.round(MAX_POINTS_PER_TASK * STREAK_BONUS_MULTIPLIER);

/* Calcule les points d'une tâche avec bonus streak éventuel */
function calculateTaskPoints(basePoints, currentStreak) {
  const pts = currentStreak >= STREAK_BONUS_THRESHOLD
    ? Math.round(basePoints * STREAK_BONUS_MULTIPLIER)
    : basePoints;
  return Math.min(pts, MAX_POINTS_CAP);
}

/* Vérifie si une récompense est débloquée et la déverrouille */
function checkRewardUnlock() {
  const { couplePoints } = store.getStats();
  const rewards = store.getRewards().filter(r => !r.unlockedAt);
  for (const reward of rewards) {
    if (couplePoints >= reward.pointsCost) {
      store.unlockReward(reward.id);
      return reward;
    }
  }
  return null;
}

/* Traitement complet de la validation d'une tâche */
function processTaskCompletion(taskId, partnerId) {
  const task = store.getTasks().find(t => t.id === taskId);
  if (!task) return null;
  const { newStreak, milestone } = updatePartnerStreak(partnerId);
  const points = calculateTaskPoints(task.points, newStreak);
  const bonusApplied = newStreak >= STREAK_BONUS_THRESHOLD;
  store.addPoints(partnerId, points);
  store.completeTask(taskId);
  const rewardUnlocked = checkRewardUnlock();
  return { points, bonusApplied, rewardUnlocked, milestone };
}

/* Retourne la prochaine récompense non débloquée la moins chère */
function getNextReward() {
  const rewards = store.getRewards().filter(r => !r.unlockedAt);
  if (rewards.length === 0) return null;
  rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  const next = rewards[0];
  const { couplePoints } = store.getStats();
  return { name: next.name, pointsCost: next.pointsCost, remaining: next.pointsCost - couplePoints };
}

/* Stats hebdomadaires d'un partenaire (lundi → dimanche) */
function getWeeklyStats(partnerId) {
  const tasks = store.getTasks();
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - mondayOffset);
  const weekTasks = tasks.filter(t =>
    t.assignedTo === partnerId && t.completedAt && new Date(t.completedAt) >= monday
  );
  return { tasksCompleted: weekTasks.length, totalPoints: weekTasks.reduce((sum, t) => sum + t.points, 0) };
}

/* Met à jour le streak d'un partenaire après validation d'une tâche */
function updatePartnerStreak(partnerId) {
  const stats = store.getStats();
  const { lastActivityDate, currentStreak } = stats[partnerId];
  const today = new Date().toISOString().slice(0, 10);
  if (lastActivityDate && isSameDay(lastActivityDate, new Date())) return { newStreak: currentStreak, milestone: null };
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  let newStreak;
  if (lastActivityDate && isSameDay(lastActivityDate, yesterday)) newStreak = currentStreak + 1;
  else newStreak = 1;
  store.updateStreak(partnerId, newStreak, today);
  const milestone = STREAK_MILESTONES.includes(newStreak) ? newStreak : null;
  return { newStreak, milestone };
}

/* Vérifie les streaks au lancement, reset si inactif > 1 jour */
function checkStreaksAtBoot() {
  const stats = store.getStats();
  const lost = [];
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  for (const id of ['partnerA', 'partnerB']) {
    const { lastActivityDate, currentStreak } = stats[id];
    if (!lastActivityDate || currentStreak === 0) continue;
    if (!isSameDay(lastActivityDate, new Date()) && !isSameDay(lastActivityDate, yesterday)) {
      store.updateStreak(id, 0, null);
      lost.push(id);
    }
  }
  return lost;
}

export {
  STREAK_BONUS_THRESHOLD, STREAK_BONUS_MULTIPLIER, MAX_POINTS_PER_TASK,
  calculateTaskPoints, processTaskCompletion, checkRewardUnlock,
  getNextReward, getWeeklyStats, updatePartnerStreak, checkStreaksAtBoot
};
