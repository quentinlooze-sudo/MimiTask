/* ==============================================
   MimiTask — Store (CRUD LocalStorage)
   Toute modification de données passe par ce module
   ============================================== */

import { generateId, generateCoupleCode, isToday, getStartOfWeek, getStartOfMonth } from './utils.js';

const STORAGE_KEY = 'mimitask_data';

const DEFAULT_DATA = {
  couple: {
    partnerA: { name: '', avatar: '' },
    partnerB: { name: '', avatar: '' },
    coupleCode: ''
  },
  tasks: [],
  rewards: [],
  stats: {
    partnerA: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    partnerB: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    couplePoints: 0
  },
  settings: { theme: 'default', onboardingDone: false, lastResetDate: null }
};

let data = null;

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota exceeded */ } }

/* Charge les données existantes ou crée la structure initiale */
function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  data = stored ? JSON.parse(stored) : clone(DEFAULT_DATA);
  save();
  return clone(data);
}

function getData() { return clone(data); }
function isOnboardingDone() { return data.settings.onboardingDone; }
function setOnboardingDone() { data.settings.onboardingDone = true; save(); }

/* Configure les noms des partenaires et génère un code couple */
function setCouple(nameA, nameB) {
  if (!nameA?.trim() || !nameB?.trim()) return;
  data.couple.partnerA.name = nameA.trim();
  data.couple.partnerB.name = nameB.trim();
  data.couple.coupleCode = generateCoupleCode();
  save();
}

function getCouple() { return clone(data.couple); }
function getCoupleCode() { return data.couple.coupleCode; }
function getTasks() { return clone(data.tasks); }
function getTasksByPartner(partnerId) { return clone(data.tasks.filter(t => t.assignedTo === partnerId)); }

function getTodayTasks() {
  return clone(data.tasks.filter(t => !t.completedAt || !isToday(t.completedAt)));
}

/* Crée une nouvelle tâche */
function addTask({ name, points, assignedTo, recurrence, icon, category }) {
  if (!name?.trim() || points < 0) return null;
  const task = {
    id: generateId(), name: name.trim(), points: points || 0,
    assignedTo: assignedTo || 'partnerA', recurrence: recurrence || 'daily',
    icon: icon || '📋', category: category || 'divers',
    completedAt: null, delegationStatus: null, createdAt: new Date().toISOString()
  };
  data.tasks.push(task);
  save();
  return clone(task);
}

function completeTask(taskId) {
  const task = data.tasks.find(t => t.id === taskId);
  if (!task) return 0;
  task.completedAt = new Date().toISOString();
  save();
  return task.points;
}

function deleteTask(taskId) { data.tasks = data.tasks.filter(t => t.id !== taskId); save(); }

function addDefaultTasks(tasksArray) {
  tasksArray.forEach(t => data.tasks.push({
    ...t, id: generateId(), assignedTo: 'partnerA',
    completedAt: null, delegationStatus: null, createdAt: new Date().toISOString()
  }));
  save();
}

function requestDelegation(taskId, requestedBy) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.completedAt || t.delegationStatus?.status === 'pending') return false;
  t.delegationStatus = { status: 'pending', requestedBy, requestedAt: new Date().toISOString() };
  save(); return true;
}
function acceptDelegation(taskId) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.delegationStatus?.status !== 'pending') return false;
  t.assignedTo = t.assignedTo === 'partnerA' ? 'partnerB' : 'partnerA';
  t.delegationStatus = { status: 'accepted', acceptedAt: new Date().toISOString() };
  save(); return true;
}
function declineDelegation(taskId) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.delegationStatus?.status !== 'pending') return false;
  t.delegationStatus = null; save(); return true;
}
function getPendingDelegations(partnerId) {
  return clone(data.tasks.filter(t => t.delegationStatus?.status === 'pending' && t.delegationStatus.requestedBy !== partnerId));
}

function getRewards() { return clone(data.rewards); }

function addReward({ name, pointsCost, description, icon }) {
  if (!name?.trim() || pointsCost < 0) return null;
  const reward = {
    id: generateId(), name: name.trim(), pointsCost: pointsCost || 0,
    description: description || '', icon: icon || '🎁', unlockedAt: null
  };
  data.rewards.push(reward);
  save();
  return clone(reward);
}

function unlockReward(rewardId) {
  const r = data.rewards.find(x => x.id === rewardId);
  if (r) { r.unlockedAt = new Date().toISOString(); save(); }
}

function deleteReward(rewardId) { data.rewards = data.rewards.filter(r => r.id !== rewardId); save(); }

function addDefaultRewards(arr) {
  arr.forEach(r => data.rewards.push({ ...r, id: generateId(), unlockedAt: null }));
  save();
}

function getStats() { return clone(data.stats); }

function addPoints(partnerId, points) {
  if (points <= 0) return;
  data.stats[partnerId].totalPoints += points;
  data.stats.couplePoints += points;
  save();
}

function getBalance() {
  const total = data.stats.couplePoints;
  if (total === 0) return { partnerA: 50, partnerB: 50 };
  const pctA = Math.round((data.stats.partnerA.totalPoints / total) * 100);
  return { partnerA: pctA, partnerB: 100 - pctA };
}

function updateStreak(partnerId, newStreak, activityDate) {
  const stats = data.stats[partnerId];
  stats.currentStreak = newStreak;
  if (newStreak > stats.bestStreak) stats.bestStreak = newStreak;
  if (activityDate) stats.lastActivityDate = activityDate;
  save();
}

/* Réinitialise les tâches récurrentes complétées selon leur fréquence */
function checkAndResetRecurringTasks() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (data.settings.lastResetDate === todayStr) return 0;
  let count = 0;
  const weekStart = getStartOfWeek(now);
  const monthStart = getStartOfMonth(now);
  data.tasks.forEach(t => {
    if (!t.completedAt || t.recurrence === 'once') return;
    const completed = new Date(t.completedAt);
    let shouldReset = false;
    if (t.recurrence === 'daily' && !isToday(t.completedAt)) shouldReset = true;
    else if (t.recurrence === 'weekly' && completed < weekStart) shouldReset = true;
    else if (t.recurrence === 'monthly' && completed < monthStart) shouldReset = true;
    if (shouldReset) { t.completedAt = null; t.delegationStatus = null; count++; }
  });
  data.settings.lastResetDate = todayStr;
  save();
  return count;
}

function exportData() { return JSON.stringify(data, null, 2); }
function importData(jsonString) { data = JSON.parse(jsonString); save(); }
function resetAll() { localStorage.removeItem(STORAGE_KEY); data = clone(DEFAULT_DATA); save(); }

export {
  init, getData, save, isOnboardingDone, setOnboardingDone,
  setCouple, getCouple, getCoupleCode,
  getTasks, getTasksByPartner, getTodayTasks, addTask, completeTask, deleteTask, addDefaultTasks,
  requestDelegation, acceptDelegation, declineDelegation, getPendingDelegations,
  getRewards, addReward, unlockReward, deleteReward, addDefaultRewards,
  getStats, addPoints, getBalance, updateStreak,
  checkAndResetRecurringTasks,
  exportData, importData, resetAll
};
