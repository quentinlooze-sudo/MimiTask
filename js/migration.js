/* ==============================================
   MimiTask — Migration LocalStorage → Firestore
   Propose le transfert aux utilisateurs v1 existants
   ============================================== */

import * as fs from './store-firestore.js';

const STORAGE_KEY = 'mimitask_data';
const MIGRATION_DONE_KEY = 'mimitask_migration_done';

/* Verifie si une migration est necessaire et propose la modale */
async function checkMigration() {
  if (localStorage.getItem(MIGRATION_DONE_KEY)) return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let localData;
  try { localData = JSON.parse(raw); } catch { return; }

  /* Verifier qu'il y a des donnees significatives a migrer */
  const hasTasks = localData.tasks?.length > 0;
  const hasRewards = localData.rewards?.length > 0;
  const hasPoints = localData.stats?.couplePoints > 0;
  if (!hasTasks && !hasRewards && !hasPoints) return;

  /* Verifier que Firestore est pret (auth + coupleCode) */
  if (!fs.isFirestoreReady()) return;

  /* Afficher la modale */
  return showMigrationModal(localData);
}

/* Construit et affiche la modale de migration */
function showMigrationModal(localData) {
  return new Promise(resolve => {
    const taskCount = localData.tasks?.length || 0;
    const rewardCount = localData.rewards?.length || 0;
    const totalPts = localData.stats?.couplePoints || 0;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--active';
    overlay.style.zIndex = '250';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-labelledby="migration-title">
        <div class="migration-modal">
          <span class="migration-modal__icon">☁️</span>
          <h3 class="migration-modal__title" id="migration-title">Donnees locales detectees</h3>
          <p class="migration-modal__text">
            Vous avez <strong>${taskCount} tache${taskCount > 1 ? 's' : ''}</strong>,
            <strong>${rewardCount} recompense${rewardCount > 1 ? 's' : ''}</strong>
            et <strong>${totalPts} pts</strong> stockes sur cet appareil.
          </p>
          <p class="migration-modal__text">Voulez-vous les transferer vers le cloud pour les synchroniser entre vos appareils ?</p>
          <div class="migration-modal__actions">
            <button class="btn btn--primary" id="migration-accept">Transferer</button>
            <button class="btn btn--secondary" id="migration-decline">Plus tard</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    document.getElementById('migration-accept').addEventListener('click', async () => {
      const btn = document.getElementById('migration-accept');
      btn.textContent = 'Transfert…';
      btn.disabled = true;
      try {
        await runMigration(localData);
        localStorage.setItem(MIGRATION_DONE_KEY, Date.now().toString());
        closeModal(overlay);
        window.showToast?.('Donnees transferees avec succes !');
      } catch (err) {
        console.error('[migration] Echec:', err);
        btn.textContent = 'Transferer';
        btn.disabled = false;
        window.showToast?.('Erreur lors du transfert', 'error');
      }
      resolve();
    });

    document.getElementById('migration-decline').addEventListener('click', () => {
      closeModal(overlay);
      resolve();
    });
  });
}

function closeModal(overlay) {
  overlay.classList.remove('modal-overlay--active');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  /* Fallback si pas de transition */
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
}

/* Execute le transfert des donnees locales vers Firestore */
async function runMigration(localData) {
  const tasks = localData.tasks || [];
  const rewards = localData.rewards || [];
  const stats = localData.stats;

  const promises = [];
  if (tasks.length > 0) promises.push(fs.batchWriteTasks(tasks));
  if (rewards.length > 0) promises.push(fs.batchWriteRewards(rewards));
  if (stats) promises.push(fs.writeStats(stats));
  await Promise.all(promises);
}

/* Supprime les donnees locales (appele depuis les parametres) */
function clearLocalData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MIGRATION_DONE_KEY);
}

/* Verifie si la migration a deja ete faite */
function isMigrationDone() {
  return !!localStorage.getItem(MIGRATION_DONE_KEY);
}

/* Verifie s'il reste des donnees locales */
function hasLocalData() {
  return !!localStorage.getItem(STORAGE_KEY);
}

export { checkMigration, clearLocalData, isMigrationDone, hasLocalData };
