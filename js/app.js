/* ==============================================
   MimiTask — Point d'entrée principal
   Navigation onglets + toast system
   ============================================== */

import * as store from './store.js';
import { initTasks, renderTaskList } from './tasks.js';
import { initDashboard, renderDashboard } from './dashboard.js';
import { initRewards } from './rewards.js';
import { checkStreaksAtBoot } from './points.js';

/* Navigation entre les onglets */
function initNavigation() {
  const tabs = document.querySelectorAll('.tab-bar__item');
  const screens = document.querySelectorAll('.screen');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      // Désactiver tous les onglets et écrans
      tabs.forEach(t => {
        t.classList.remove('tab-bar__item--active');
        t.setAttribute('aria-selected', 'false');
      });
      screens.forEach(s => s.classList.remove('screen--active'));

      // Activer l'onglet cliqué et l'écran correspondant
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
  store.init();
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

  // Initialiser les écrans
  initTasks();
  initDashboard();
  initRewards();
  initSettings();
});

/* Initialise l'écran Paramètres */
function initSettings() {
  const couple = store.getCouple();
  const namesEl = document.getElementById('settings-names-display');
  if (namesEl && couple.partnerA.name) {
    namesEl.textContent = `${couple.partnerA.name} & ${couple.partnerB.name}`;
  }
  const codeEl = document.getElementById('settings-code-display');
  if (codeEl && couple.coupleCode) {
    codeEl.textContent = couple.coupleCode;
  }

  document.getElementById('copy-couple-code')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(store.getCoupleCode());
      showToast('Code copié !');
    } catch { showToast('Impossible de copier', 'error'); }
  });

  document.getElementById('btn-export-data')?.addEventListener('click', () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mimitask-backup.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Données exportées !');
  });

  document.getElementById('btn-reset-data')?.addEventListener('click', () => {
    if (!confirm('Supprimer toutes vos données ? Cette action est irréversible.')) return;
    store.resetAll();
    showToast('Données réinitialisées.');
    location.reload();
  });
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
}

// PWA install prompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('install-app-btn');
  if (btn) btn.hidden = false;
});
function handleInstallClick() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
  const btn = document.getElementById('install-app-btn');
  if (btn) btn.hidden = true;
}

// Exposer pour les tests en console
window.showToast = showToast;
window.store = store;
window.handleInstallClick = handleInstallClick;

export { initNavigation, showToast };
