/* ==============================================
   MimiTask — Indicateur de sync (header dot)
   Machine d'état ok / pending / offline
   ============================================== */

let currentState = 'offline';
let indicatorEl = null;
let dotEl = null;
let pendingTimer = null;

/* Duree max avant de revenir a ok si un write ne repond pas */
const PENDING_TIMEOUT = 5000;

/* Messages affiches au tap selon l'etat */
const STATE_MESSAGES = {
  ok: 'Synchronisé',
  pending: 'Synchronisation en cours…',
  offline: 'Hors ligne — les données seront synchronisées automatiquement'
};

/* Classe CSS correspondant a chaque etat */
const STATE_CLASS = {
  ok: 'sync-indicator__dot--ok',
  pending: 'sync-indicator__dot--pending',
  offline: 'sync-indicator__dot--offline'
};

/* Met a jour la classe CSS du dot */
function applyDotClass(state) {
  if (!dotEl) return;
  Object.values(STATE_CLASS).forEach(c => dotEl.classList.remove(c));
  dotEl.classList.add(STATE_CLASS[state]);
}

/* Change l'etat du sync indicator */
function setSyncStatus(state) {
  if (!indicatorEl) return;
  if (state === currentState && state !== 'pending') return;
  currentState = state;
  applyDotClass(state);

  /* Timeout de securite : si pending reste trop longtemps, revenir a ok */
  clearTimeout(pendingTimer);
  if (state === 'pending') {
    pendingTimer = setTimeout(() => {
      if (currentState === 'pending') setSyncStatus('ok');
    }, PENDING_TIMEOUT);
  }
}

/* Rend le dot visible (appele apres creation/jonction d'un couple) */
function showSyncIndicator() {
  if (indicatorEl) indicatorEl.hidden = false;
}

/* Verifie si le dot doit etre visible (coupleCode present) */
function updateVisibility() {
  if (!indicatorEl) return;
  const code = window.store?.getCoupleCode?.();
  indicatorEl.hidden = !code;
}

/* Initialise le sync indicator */
function initSyncIndicator() {
  indicatorEl = document.getElementById('sync-indicator');
  dotEl = document.getElementById('sync-dot');
  if (!indicatorEl || !dotEl) return;

  /* Etat initial selon la connectivite */
  const initialState = navigator.onLine ? 'ok' : 'offline';
  setSyncStatus(initialState);

  /* Events online/offline du navigateur */
  window.addEventListener('online', () => setSyncStatus('ok'));
  window.addEventListener('offline', () => setSyncStatus('offline'));

  /* Tap → toast avec le statut */
  indicatorEl.addEventListener('click', () => {
    window.showToast?.(STATE_MESSAGES[currentState], 'info');
  });

  /* Visibilite selon coupleCode */
  updateVisibility();

  /* Exposer sur window pour les autres modules */
  window.setSyncStatus = setSyncStatus;
  window.showSyncIndicator = showSyncIndicator;
}

export { initSyncIndicator, showSyncIndicator };
