/* ==============================================
   MimiTask — Notifications cross-partner
   Affiche un banner quand l'autre utilise une recompense
   ============================================== */

import { dismissNotification } from './store.js';

const DISPLAY_DURATION = 8000;
const shownNotifIds = new Set();

/* Texte adapte au type de recompense */
function buildMessage(notif) {
  const name = notif.senderName || 'Ton partenaire';
  if (notif.rewardType === 'couple') {
    return `${notif.rewardIcon} ${name} a activé « ${notif.rewardName} » pour vous deux !`;
  }
  return `${notif.rewardIcon} ${name} a utilisé « ${notif.rewardName} » — c'est à toi de jouer !`;
}

/* Cree et affiche un banner de notification */
function showNotificationBanner(notif) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const banner = document.createElement('div');
  banner.className = 'notif-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML = `
    <div class="notif-banner__content">
      <p class="notif-banner__text">${buildMessage(notif)}</p>
    </div>
    <button class="notif-banner__close" aria-label="Fermer">&times;</button>`;

  container.appendChild(banner);

  /* Animation d'entree */
  banner.offsetHeight;
  banner.classList.add('notif-banner--visible');

  /* Dismiss au clic */
  const close = () => {
    banner.classList.remove('notif-banner--visible');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
    dismissNotification(notif.id);
  };
  banner.querySelector('.notif-banner__close').addEventListener('click', close);

  /* Auto-dismiss */
  setTimeout(close, DISPLAY_DURATION);
}

/* Point d'entree appele par sync.js — filtre les notifs pour le partenaire courant */
async function handleIncomingNotification(notif) {
  if (!notif || notif.type !== 'reward_used') return;
  if (shownNotifIds.has(notif.id)) return;
  shownNotifIds.add(notif.id);

  try {
    const { getPartnerRole } = await import('./auth.js');
    const myRole = getPartnerRole();
    /* Ne montrer que les notifs destinees a MOI (pas celles que j'ai envoyees) */
    if (!myRole || notif.target !== myRole) return;
    showNotificationBanner(notif);
  } catch {
    /* Auth indisponible — on ignore silencieusement */
  }
}

/* Initialisation : expose le handler sur window pour sync.js */
function initNotifications() {
  window.handleIncomingNotification = handleIncomingNotification;
}

export { initNotifications };
