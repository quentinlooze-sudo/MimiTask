/* ==============================================
   MimiTask — Point d'entrée principal
   Navigation onglets + toast system
   ============================================== */

import * as store from './store.js';
import { initTasks, renderTaskList } from './tasks.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initRewards } from './rewards.js';
import { checkStreaksAtBoot } from './points.js';
import { initMascotCustomizer } from './mascot-customizer.js';
import { initNotifications } from './notifications.js';

/* Navigation entre les onglets */
function initNavigation() {
  const tabs = document.querySelectorAll('.tab-bar__item');
  const screens = document.querySelectorAll('.screen');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      tabs.forEach(t => { t.classList.remove('tab-bar__item--active'); t.setAttribute('aria-selected', 'false'); });
      screens.forEach(s => s.classList.remove('screen--active'));
      tab.classList.add('tab-bar__item--active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(targetId)?.classList.add('screen--active');
      if (targetId === 'screen-tasks') renderTaskList();
      if (targetId === 'screen-dashboard') renderDashboard();
    });
  });
}

/* Système de toasts */
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Forcer le reflow avant d'ajouter la classe visible
  toast.offsetHeight;
  toast.classList.add('toast--visible');

  // Retrait automatique après la durée
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* Initialisation au chargement */
document.addEventListener('DOMContentLoaded', async () => {
  try { const { initAuth } = await import('./auth.js'); await initAuth(); }
  catch { console.warn('[app] Auth Firebase indisponible, mode local actif.'); }

  store.init();
  await store.syncFromFirestore();
  initNavigation();

  // Reset des tâches récurrentes au lancement
  const resetCount = store.checkAndResetRecurringTasks();
  if (resetCount > 0) showToast(`${resetCount} tâche${resetCount > 1 ? 's' : ''} réinitialisée${resetCount > 1 ? 's' : ''} pour aujourd'hui`);

  // Vérification des streaks perdus
  const lostStreaks = checkStreaksAtBoot();
  if (lostStreaks.length > 0) showToast('La série s\'arrête… On reprend ?', 'info');

  // Charger et lancer l'onboarding si nécessaire (import dynamique)
  if (!store.isOnboardingDone()) {
    const { initOnboarding } = await import('./onboarding.js');
    initOnboarding();
  }

  // Migration LocalStorage → Firestore pour les utilisateurs v1
  try {
    const { checkMigration } = await import('./migration.js');
    await checkMigration();
  } catch (err) { console.warn('[app] Migration check echouee:', err); }

  // Initialiser les écrans
  initTasks();
  initDashboard();
  initRewards();
  initSettings();

  // Notifications cross-partner (avant sync pour que le handler soit prêt)
  initNotifications();

  // Sync temps réel Firestore (après init pour que window.render* soient dispo)
  try { const m = await import('./sync.js'); m.initIndicator(); m.startSync(); }
  catch (err) { console.warn('[app] Sync temps reel indisponible:', err); }

  // Reset des tâches récurrentes quand l'app redevient visible (ex: après minuit)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const n = store.checkAndResetRecurringTasks();
    if (n > 0) { showToast(`${n} tâche${n > 1 ? 's' : ''} réinitialisée${n > 1 ? 's' : ''}`); renderTaskList(); renderDashboard(); }
  });
});

/* Met à jour le code couple affiché dans les paramètres */
function refreshSettingsCode() {
  const codeEl = document.getElementById('settings-code-display');
  if (!codeEl) return;
  const code = store.getCoupleCode() || localStorage.getItem('mimitask_couple_code') || '';
  codeEl.textContent = code || '—';
}

/* Initialise l'écran Paramètres */
function initSettings() {
  const couple = store.getCouple();
  const namesEl = document.getElementById('settings-names-display');
  if (namesEl && couple.partnerA.name) {
    namesEl.textContent = `${couple.partnerA.name} & ${couple.partnerB.name}`;
  }
  refreshSettingsCode();

  /* Expose pour sync.js — rafraîchit l'affichage du code couple */
  window.refreshSettingsCode = refreshSettingsCode;

  document.getElementById('copy-couple-code')?.addEventListener('click', async () => {
    try {
      const code = store.getCoupleCode() || localStorage.getItem('mimitask_couple_code') || '';
      if (!code) { showToast('Aucun code couple', 'error'); return; }
      await navigator.clipboard.writeText(code);
      showToast('Code copié !');
    } catch { showToast('Impossible de copier', 'error'); }
  });

  document.getElementById('btn-export-data')?.addEventListener('click', () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'mimitask-backup.json' });
    a.click(); URL.revokeObjectURL(a.href); showToast('Données exportées !');
  });
  document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    if (!confirm('Supprimer toutes vos données ? Cette action est irréversible.')) return;
    store.resetAll(); showToast('Données réinitialisées.'); location.reload();
  });
  initMascotCustomizer();
}

// Service Worker
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));

// PWA install logic
function initInstall() {
  const section = document.getElementById('install-section');
  const btn = document.getElementById('install-app-btn');
  const safariGuide = document.getElementById('install-safari-guide');
  const doneEl = document.getElementById('install-done');
  if (!section) return;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;
  const isSafariIOS = /iP(hone|od|ad)/.test(navigator.userAgent)
    && /WebKit/.test(navigator.userAgent)
    && !/(CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent);

  // Déjà installée
  if (isStandalone) {
    section.hidden = false;
    doneEl.hidden = false;
    return;
  }

  // Safari iOS — guide manuel
  if (isSafariIOS) {
    section.hidden = false;
    safariGuide.hidden = false;
    return;
  }

  // Chrome/Edge Android — beforeinstallprompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    section.hidden = false;
    btn.hidden = false;
  });

  btn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      btn.hidden = true;
      doneEl.hidden = false;
    });
  });
}
initInstall();

// Exposer pour les tests en console
window.showToast = showToast; window.store = store;

export { initNavigation, showToast };
