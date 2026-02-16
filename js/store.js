/* ==============================================
   MimiTask — Store (CRUD LocalStorage + Firestore)
   Toute modification de données passe par ce module
   ============================================== */

import { generateId, isToday, getStartOfWeek, getStartOfMonth } from './utils.js';
import * as fs from './store-firestore.js';

const STORAGE_KEY = 'mimitask_data';
const DEFAULT_DATA = {
  couple: { partnerA: { name: '', avatar: '' }, partnerB: { name: '', avatar: '' }, coupleCode: '' },
  tasks: [], rewards: [],
  stats: {
    partnerA: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    partnerB: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
    couplePoints: 0
  },
  mascot: { colorId: 'vert', accessoryId: 'none' },
  settings: { theme: 'default', onboardingDone: false, lastResetDate: null }
};

let data = null;
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ } }

function init() {
  const stored = localStorage.getItem(STORAGE_KEY);
  data = stored ? JSON.parse(stored) : clone(DEFAULT_DATA);
  if (!data.mascot) data.mascot = { colorId: 'vert', accessoryId: 'none' };
  save(); return clone(data);
}

/* Sync depuis Firestore au boot */
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
  if (!name?.trim()) return null;
  const task = { id: generateId(), name: name.trim(), points: points || 0, assignedTo: assignedTo || 'partnerA',
    recurrence: recurrence || 'daily', icon: icon || '📋', category: category || 'divers',
    completedAt: null, delegationStatus: null, createdAt: new Date().toISOString() };
  data.tasks.push(task); save(); fs.writeTask(task); return clone(task);
}
function completeTask(taskId) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t) return 0; t.completedAt = new Date().toISOString(); save(); fs.writeTask(t); return t.points;
}
function deleteTask(taskId) { data.tasks = data.tasks.filter(t => t.id !== taskId); save(); fs.removeTask(taskId); }
function addDefaultTasks(arr) {
  arr.forEach(t => { const task = { ...t, id: generateId(), assignedTo: 'partnerA', completedAt: null, delegationStatus: null, createdAt: new Date().toISOString() }; data.tasks.push(task); });
  save(); fs.batchWriteTasks(data.tasks);
}

/* ---- Delegation ---- */
function requestDelegation(taskId, requestedBy, type, cost) {
  const t = data.tasks.find(x => x.id === taskId);
  if (!t || t.completedAt || t.delegationStatus?.status === 'pending') return false;
  if (type === 'paid') { if (!deductPoints(requestedBy, cost)) return false; }
  t.delegationStatus = { status: 'pending', requestedBy, type: type || 'free', requestedAt: new Date().toISOString() };
  save(); fs.writeTask(t); if (type === 'paid') fs.writeStats(data.stats); return true;
}
function acceptDelegation(taskId) {
  const t = data.tasks.find(x => x.id === taskId); if (!t || t.delegationStatus?.status !== 'pending') return false;
  t.assignedTo = t.assignedTo === 'partnerA' ? 'partnerB' : 'partnerA';
  t.delegationStatus = { ...t.delegationStatus, status: 'accepted', acceptedAt: new Date().toISOString() };
  save(); fs.writeTask(t); return true;
}
function declineDelegation(taskId) {
  const t = data.tasks.find(x => x.id === taskId); if (!t || t.delegationStatus?.status !== 'pending') return false;
  if (t.delegationStatus.type === 'paid') { addPoints(t.delegationStatus.requestedBy, 300); }
  t.delegationStatus = null; save(); fs.writeTask(t); return true;
}

/* ---- Recompenses ---- */
function addReward({ name, pointsCost, icon, type }) {
  if (!name?.trim()) return null;
  const r = { id: generateId(), name: name.trim(), pointsCost: pointsCost || 0, icon: icon || '🎁', type: type || null, unlockedAt: null };
  data.rewards.push(r); save(); fs.writeReward(r); return clone(r);
}
function unlockReward(id) { const r = data.rewards.find(x => x.id === id); if (r) { r.unlockedAt = new Date().toISOString(); save(); fs.writeReward(r); } }
function deleteReward(id) { data.rewards = data.rewards.filter(r => r.id !== id); save(); fs.removeReward(id); }
function addDefaultRewards(arr) { arr.forEach(r => data.rewards.push({ ...r, id: generateId(), unlockedAt: null })); save(); fs.batchWriteRewards(data.rewards); }
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
  } else { if (!deductPoints(partnerId, cost)) return false; }
  r.unlockedAt = null; r.usedAt = new Date().toISOString();
  save(); fs.writeReward(r); fs.writeStats(data.stats); return true;
}

/* ---- Points & streaks ---- */
function addPoints(partnerId, points) {
  if (points <= 0) return; data.stats[partnerId].totalPoints += points; data.stats.couplePoints += points; save(); fs.writeStats(data.stats);
}
function deductPoints(partnerId, amount) {
  if (data.stats[partnerId].totalPoints < amount) return false;
  data.stats[partnerId].totalPoints -= amount; data.stats.couplePoints -= amount; save(); return true;
}
function updateStreak(pid, streak, date) {
  const s = data.stats[pid]; s.currentStreak = streak; if (streak > s.bestStreak) s.bestStreak = streak;
  if (date) s.lastActivityDate = date; save(); fs.writeStats(data.stats);
}

/* ---- Recurrence reset ---- */
function checkAndResetRecurringTasks() {
  const now = new Date(); const todayStr = now.toISOString().slice(0, 10);
  if (data.settings.lastResetDate === todayStr) return 0;
  let count = 0; const weekStart = getStartOfWeek(now); const monthStart = getStartOfMonth(now);
  data.tasks.forEach(t => {
    if (!t.completedAt || t.recurrence === 'once') return;
    const completed = new Date(t.completedAt); let reset = false;
    if (t.recurrence === 'daily' && !isToday(t.completedAt)) reset = true;
    else if (t.recurrence === 'weekly' && completed < weekStart) reset = true;
    else if (t.recurrence === 'biweekly' && (now - completed) >= 14 * 86400000) reset = true;
    else if (t.recurrence === 'monthly' && completed < monthStart) reset = true;
    if (reset) { t.completedAt = null; t.delegationStatus = null; count++; }
  });
  data.settings.lastResetDate = todayStr; save(); return count;
}

/* ---- Mascotte ---- */
function setMascotPrefs(prefs) { data.mascot = { ...data.mascot, ...prefs }; save(); fs.writeMascotPrefs(data.mascot); }

/* ---- Snapshot (sync temps reel) ---- */
function applySnapshot(key, value) {
  if (key === 'couple') { data.couple.partnerA = value.partnerA; data.couple.partnerB = value.partnerB; }
  else if (key === 'tasks') data.tasks = value;
  else if (key === 'rewards') data.rewards = value;
  else if (key === 'stats') data.stats = value;
  else if (key === 'mascot') data.mascot = value;
  save();
}

/* ---- Utils ---- */
function exportData() { return JSON.stringify(data, null, 2); }
function resetAll() { localStorage.removeItem(STORAGE_KEY); data = clone(DEFAULT_DATA); save(); }

export {
  init, getData, save, isOnboardingDone, setOnboardingDone,
  setCouple, getCouple, getCoupleCode, setCoupleCode, syncFromFirestore,
  getTasks, getTasksByPartner, addTask, completeTask, deleteTask, addDefaultTasks,
  requestDelegation, acceptDelegation, declineDelegation, getPendingDelegations,
  getRewards, addReward, unlockReward, deleteReward, addDefaultRewards, useReward,
  getStats, addPoints, deductPoints, getBalance, updateStreak,
  checkAndResetRecurringTasks, getMascotPrefs, setMascotPrefs, applySnapshot,
  exportData, resetAll
};
