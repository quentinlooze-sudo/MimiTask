/* ==============================================
   MimiTask — Sync temps reel Firestore
   Listeners onSnapshot centralises, re-rendu UI
   ============================================== */

import { onSnapshot, collection, doc } from 'firebase/firestore';
import { coupleRef, isFirestoreReady } from './store-firestore.js';
import { applySnapshot } from './store.js';
import { debounce } from './utils.js';
import { initSyncIndicator } from './sync-indicator.js';

const unsubs = [];
let syncing = false;

/* Detecte l'ecran actuellement visible */
function activeScreen() {
  return document.querySelector('.screen--active')?.id || null;
}

/* Re-rendus debounces et conditionnes a l'ecran actif */
const refreshTasks = debounce(() => {
  if (activeScreen() === 'screen-tasks') window.renderTaskList?.();
}, 150);

const refreshDashboard = debounce(() => {
  if (activeScreen() === 'screen-dashboard') window.renderDashboard?.();
}, 150);

const refreshRewards = debounce(() => {
  window.renderRewardsList?.();
}, 150);

/* --- Listener taches --- */
function listenTasks(ref) {
  return onSnapshot(
    collection(ref, 'tasks'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      applySnapshot('tasks', tasks);
      refreshTasks();
      refreshDashboard();
    },
    (err) => handleError('tasks', err)
  );
}

/* --- Listener recompenses --- */
function listenRewards(ref) {
  return onSnapshot(
    collection(ref, 'rewards'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      const rewards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      applySnapshot('rewards', rewards);
      refreshRewards();
      refreshDashboard();
    },
    (err) => handleError('rewards', err)
  );
}

/* --- Listener stats --- */
function listenStats(ref) {
  return onSnapshot(
    doc(ref, 'stats', 'current'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (!snapshot.exists()) return;
      applySnapshot('stats', snapshot.data());
      refreshDashboard();
    },
    (err) => handleError('stats', err)
  );
}

/* --- Listener document couple (noms, settings) --- */
function listenCouple(ref) {
  return onSnapshot(
    ref,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (!snapshot.exists()) return;
      const d = snapshot.data();
      applySnapshot('couple', {
        partnerA: { name: d.partnerA?.name || '', avatar: d.partnerA?.avatar || '' },
        partnerB: { name: d.partnerB?.name || '', avatar: d.partnerB?.avatar || '' }
      });
      const namesEl = document.getElementById('settings-names-display');
      if (namesEl && d.partnerA?.name) {
        namesEl.textContent = `${d.partnerA.name} & ${d.partnerB?.name || ''}`;
      }
      window.refreshSettingsCode?.();
      window.renderFilters?.();
      window.renderTaskList?.();
    },
    (err) => handleError('couple', err)
  );
}

/* --- Listener notifications (reward usage) --- */
function listenNotifications(ref) {
  return onSnapshot(
    collection(ref, 'notifications'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const notif = { id: change.doc.id, ...change.doc.data() };
          window.handleIncomingNotification?.(notif);
        }
      });
    },
    (err) => handleError('notifications', err)
  );
}

/* --- Listener mascotte prefs --- */
function listenMascot(ref) {
  return onSnapshot(
    doc(ref, 'mascot', 'prefs'),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (!snapshot.exists()) return;
      applySnapshot('mascot', snapshot.data());
      window.applyMascotPrefs?.(snapshot.data());
      refreshDashboard();
    },
    (err) => handleError('mascot', err)
  );
}

/* --- Gestion d'erreurs --- */
function handleError(channel, err) {
  console.warn(`[sync] Erreur listener ${channel}:`, err.code || err);
  if (err.code === 'permission-denied') {
    window.setSyncStatus?.('offline');
    window.showToast?.('Synchronisation refusee. Reconnectez-vous.', 'error');
    stopSync();
  }
}

/* --- API publique --- */
function startSync() {
  if (syncing) return;
  if (!isFirestoreReady()) {
    console.warn('[sync] Firestore pas pret, sync annulee');
    return;
  }
  const ref = coupleRef();
  if (!ref) return;
  unsubs.push(listenTasks(ref));
  unsubs.push(listenRewards(ref));
  unsubs.push(listenStats(ref));
  unsubs.push(listenCouple(ref));
  unsubs.push(listenMascot(ref));
  unsubs.push(listenNotifications(ref));
  syncing = true;
  window.setSyncStatus?.('ok');
  console.log('[sync] 6 listeners actifs');
}

function stopSync() {
  unsubs.forEach(fn => fn());
  unsubs.length = 0;
  syncing = false;
  window.setSyncStatus?.('offline');
  console.log('[sync] Listeners stoppes');
}

function isSyncing() { return syncing; }

/* Initialise l'indicateur visuel de sync */
function initIndicator() { initSyncIndicator(); }

export { startSync, stopSync, isSyncing, initIndicator };
