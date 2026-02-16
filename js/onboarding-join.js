/* ==============================================
   MimiTask — Onboarding : flux "Rejoindre un couple"
   Validation code couple + appel joinCouple + sync
   ============================================== */

import * as store from './store.js';

const ERROR_MESSAGES = {
  COUPLE_NOT_FOUND: 'Code introuvable. Vérifiez avec votre partenaire.',
  COUPLE_FULL: 'Ce couple a déjà deux membres.',
  INVALID_CODE_FORMAT: 'Format invalide — le code ressemble à MIM-ABC.',
  AUTH_REQUIRED: 'Erreur d\'authentification. Rechargez l\'app.',
  INVALID_NAME: 'Prénom trop court (2 caractères minimum).'
};

/* Branche la validation temps réel + submit, appelle onComplete() après succès */
function initJoinStep(onComplete) {
  const codeInput = document.getElementById('join-couple-code');
  const nameInput = document.getElementById('join-partner-name');
  const submitBtn = document.getElementById('join-submit-btn');
  const errorEl = document.getElementById('join-error');

  function validate() {
    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    submitBtn.disabled = code.length < 7 || name.length < 2;
    errorEl.hidden = true;
  }

  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
    validate();
  });
  nameInput.addEventListener('input', validate);

  submitBtn.addEventListener('click', () => submitJoin(onComplete));
}

/* Appel joinCouple + sync des données */
async function submitJoin(onComplete) {
  const submitBtn = document.getElementById('join-submit-btn');
  const errorEl = document.getElementById('join-error');
  const code = document.getElementById('join-couple-code').value.trim();
  const name = document.getElementById('join-partner-name').value.trim();

  // État loading
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.classList.add('onboarding__cta--loading');
  submitBtn.innerHTML = '<span class="onboarding__spinner"></span> Connexion…';
  errorEl.hidden = true;

  try {
    const { joinCouple } = await import('./auth.js');
    const result = await joinCouple(code, name);

    // Sync des données du couple depuis Firestore
    await store.syncFromFirestore();
    store.setOnboardingDone();

    window.showToast(`Bienvenue dans le duo ! 🎉`);
    if (onComplete) onComplete();
    window.showSyncIndicator?.();
    try { const { startSync } = await import('./sync.js'); startSync(); } catch { /* sync optionnel */ }
  } catch (err) {
    const msg = ERROR_MESSAGES[err.message] || 'Erreur de connexion. Vérifiez votre réseau.';
    errorEl.textContent = msg;
    errorEl.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('onboarding__cta--loading');
    submitBtn.textContent = originalText;
  }
}

export { initJoinStep };
