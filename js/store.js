/* ==============================================
   MimiTask — Store (LocalStorage + Firestore)
   Toute modification de donnees passe par ce module
   ============================================== */

import { generateId, isToday, getStartOfWeek, getStartOfMonth } from './utils.js';
import * as fs from './store-firestore.js';

const STORAGE_KEY = 'mimitask_data';
const DEFAULT_DATA = {
  couple: { partnerA: { name: '', avatar: '' }, partnerB: { name: '', avatar: '' }, coupleCode: '' },
  tasks: [],
  rewards: [],
  stats: {
    partnerA: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    partnerB: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    couplePoints: 0
  },
  settings: { theme: 'default', onboardingDone: false, lastResetDate: null },
  mascot: { colorId: 'vert', accessoryId: 'none' }
};

let data = null;
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ } }

function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  data = stored ? JSON.parse(stored) : clone(DEFAULT_DATA);
  save();
  return clone(data);
}
async function syncFromFirestore() {
  try {
    const { getCoupleCode: authCode } = await import('./auth.js');
    const code = authCode() || data.couple.coupleCode;
    if (!code) return;
    fs.setCoupleCode(code);
    const p = await fs.pullFromFirestore();
    if (p) { data = { ...p, mascot: p.mascot || data.mascot || { colorId: 'vert', accessoryId: 'none' } }; save(); }
  } catch { console.warn('[store] Sync Firestore echouee'); }
}
/* ---- Accesseurs ---- */
function getData() { return clone(data); }
function isOnboardingDone() { return data.settings.onboardingDone; }
function getCouple() { return clone(data.couple); }
function getCoupleCode() { return data.couple.coupleCode; }
function getTasks() { return clone(data.tasks); }
function getTasksByPartner(pid) { return clone(data.tasks.filter(t => t.assignedTo === pid)); }
function getRewards() { return clone(data.rewards); }
function getStats() { return clone(data.stats); }
function getMascotPrefs() { return clone(data.mascot || { colorId: 'vert', accessoryId: 'none' }); }
function getPendingDelegations(pid) {
  return clone(data.tasks.filter(t => t.delegationStatus?.status === 'pending' && t.delegationStatus.requestedBy !== pid));
}
function getBalance() {
  const t = data.stats.couplePoints;
  if (t === 0) return { partnerA: 50, partnerB: 50 };
  const a = Math.round((data.stats.partnerA.totalPoints / t) * 100);
  return { partnerA: a, partnerB: 100 - a };
}
/* ---- Mutations couple ---- */
function setOnboardingDone() { data.settings.onboardingDone = true; save(); fs.writeCoupleField('settings.onboardingDone', true); }
function setCouple(a, b) { if (!a?.trim() || !b?.trim()) return; data.couple.partnerA.name = a.trim(); data.couple.partnerB.name = b.trim(); save(); }
function setCoupleCode(code) { if (!code) return; data.couple.coupleCode = code; save(); fs.setCoupleCode(code); }

/* ---- Mutations taches ---- */
function addTask({ name, points, assignedTo, recurrence, icon, category }) {
  if (!name?.trim() || points < 0) return null;
  const task = {
    id: generateId(), name: name.trim(), points: points || 0,
    assignedTo: assignedTo || 'partnerA', recurrence: recurrence || 'daily',
    icon: icon || '📋', category: category || 'divers',
    completedAt: null, delegationStatus: null, createdAt: new Date().toISOString()
  };
  data.tasks.push(task); save(); fs.writeTask(task);
  return clone(task);
}
function completeTask(id) {
  const t = data.tasks.find(x => x.id === id); if (!t) return 0;
  t.completedAt = new Date().toISOString(); save(); fs.writeTask(t); return t.points;
}
function deleteTask(id) { data.tasks = data.tasks.filter(t => t.id !== id); save(); fs.removeTask(id); }
function addDefaultTasks(arr) {
  const now = new Date().toISOString();
  const tasks = arr.map(t => ({ ...t, id: generateId(), assignedTo: 'partnerA', completedAt: null, delegationStatus: null, createdAt: now }));
  data.tasks.push(...tasks); save(); fs.batchWriteTasks(tasks);
}
function requestDelegation(taskId, requestedBy, type = 'free', cost = 0) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.completedAt || t.delegationStatus?.status === 'pending') return false;
  if (type === 'paid' && cost > 0 && !deductPoints(requestedBy, cost)) return false;
  t.delegationStatus = { status: 'pending', requestedBy, requestedAt: new Date().toISOString(), type, cost };
  save(); fs.writeTask(t); return true;
}
function acceptDelegation(id) {
  const t = data.tasks.find(x => x.id === id); if (!t || t.delegationStatus?.status !== 'pending') return false;
  t.assignedTo = t.assignedTo === 'partnerA' ? 'partnerB' : 'partnerA';
  const { type, cost } = t.delegationStatus;
  t.delegationStatus = { status: 'accepted', acceptedAt: new Date().toISOString(), type: type || 'free', cost: cost || 0 };
  save(); fs.writeTask(t); return true;
}
function declineDelegation(id) {
  const t = data.tasks.find(x => x.id === id); if (!t || t.delegationStatus?.status !== 'pending') return false;
  if (t.delegationStatus.type === 'paid' && t.delegationStatus.cost > 0) addPoints(t.delegationStatus.requestedBy, t.delegationStatus.cost);
  t.delegationStatus = null; save(); fs.writeTask(t); return true;
}

/* ---- Mutations recompenses ---- */
function addReward({ name, pointsCost, description, icon, type }) {
  if (!name?.trim() || pointsCost < 0) return null;
  const r = { id: generateId(), name: name.trim(), pointsCost: pointsCost || 0, description: description || '', icon: icon || '🎁', type: type || null, unlockedAt: null };
  data.rewards.push(r); save(); fs.writeReward(r); return clone(r);
}
function unlockReward(id) { const r = data.rewards.find(x => x.id === id); if (r) { r.unlockedAt = new Date().toISOString(); save(); fs.writeReward(r); } }
function useReward(id, partnerId) {
  const r = data.rewards.find(x => x.id === id);
  if (!r || !r.unlockedAt) return false;
  const cost = r.pointsCost;
  if (r.type === 'couple') {
    if (data.stats.couplePoints < cost) return false;
    const half = Math.floor(cost / 2); const rest = cost - half;
    data.stats.partnerA.totalPoints = Math.max(0, data.stats.partnerA.totalPoints - half);
    data.stats.partnerB.totalPoints = Math.max(0, data.stats.partnerB.totalPoints - rest);
    data.stats.couplePoints -= cost;
  } else {
    if (!deductPoints(partnerId, cost)) return false;
  }
  r.unlockedAt = null; r.usedAt = new Date().toISOString();
  save(); fs.writeReward(r); fs.writeStats(data.stats); return true;
}
function deleteReward(id) { data.rewards = data.rewards.filter(r => r.id !== id); save(); fs.removeReward(id); }
function addDefaultRewards(arr) {
  const rw = arr.map(r => ({ ...r, id: generateId(), unlockedAt: null }));
  data.rewards.push(...rw); save(); fs.batchWriteRewards(rw);
}

/* ---- Points & streaks ---- */
function addPoints(pid, pts) { if (pts <= 0) return; data.stats[pid].totalPoints += pts; data.stats.couplePoints += pts; save(); fs.writeStats(data.stats); }
function deductPoints(pid, pts) {
  if (pts <= 0 || data.stats[pid].totalPoints < pts) return false;
  data.stats[pid].totalPoints -= pts; data.stats.couplePoints -= pts; save(); fs.writeStats(data.stats); return true;
}
function updateStreak(pid, streak, date) {
  const s = data.stats[pid]; s.currentStreak = streak;
  if (streak > s.bestStreak) s.bestStreak = streak;
  if (date) s.lastActivityDate = date; save(); fs.writeStats(data.stats);
}

/* Reinitialise les taches recurrentes completees */
function checkAndResetRecurringTasks() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  if (data.settings.lastResetDate === todayStr) return 0;
  let count = 0;
  const weekStart = getStartOfWeek(now);
  const monthStart = getStartOfMonth(now);
  const modified = [];
  data.tasks.forEach(t => {
    if (!t.completedAt || t.recurrence === 'once') return;
    const completed = new Date(t.completedAt);
    let shouldReset = false;
    if (t.recurrence === 'daily' && !isToday(t.completedAt)) shouldReset = true;
    else if (t.recurrence === 'weekly' && completed < weekStart) shouldReset = true;
    else if (t.recurrence === 'biweekly' && (now - completed) >= 14 * 86400000) shouldReset = true;
    else if (t.recurrence === 'monthly' && completed < monthStart) shouldReset = true;
    if (shouldReset) { t.completedAt = null; t.delegationStatus = null; count++; modified.push(t); }
  });
  data.settings.lastResetDate = todayStr; save();
  if (modified.length > 0) { fs.batchWriteTasks(modified); fs.writeCoupleField('settings.lastResetDate', todayStr); }
  return count;
}

function exportData() { return JSON.stringify(data, null, 2); }
function importData(json) { data = JSON.parse(json); save(); fs.batchWriteTasks(data.tasks); fs.batchWriteRewards(data.rewards); fs.writeStats(data.stats); }
function resetAll() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem('mimitask_couple_code'); data = clone(DEFAULT_DATA); save(); }
function applySnapshot(p, d) {
  if (p === 'tasks') data.tasks = d; else if (p === 'rewards') data.rewards = d;
  else if (p === 'stats') Object.assign(data.stats, d);
  else if (p === 'couple') { data.couple.partnerA = d.partnerA; data.couple.partnerB = d.partnerB; }
  else if (p === 'mascot') data.mascot = { ...data.mascot, ...d }; save();
}
export { init, syncFromFirestore, getData, save, isOnboardingDone, setOnboardingDone,
  setCouple, setCoupleCode, getCouple, getCoupleCode, getTasks, getTasksByPartner,
  addTask, completeTask, deleteTask, addDefaultTasks, requestDelegation, acceptDelegation,
  declineDelegation, getPendingDelegations, getRewards, addReward, unlockReward, useReward,
  deleteReward, addDefaultRewards, getStats, getMascotPrefs, addPoints, deductPoints,
  getBalance, updateStreak, checkAndResetRecurringTasks, exportData, importData, resetAll, applySnapshot };
