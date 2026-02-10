/* ==============================================
   MimiTask — Utilitaires
   Fonctions réutilisables (dates, IDs, helpers)
   ============================================== */

const MONTHS_SHORT = [
  'janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
];

/* Génère un ID unique (timestamp + random) */
function generateId() {
  const rand = Math.random().toString(36).substring(2, 6);
  return `t_${Date.now()}_${rand}`;
}

/* Génère un code couple format MIM-XXX */
function generateCoupleCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MIM-${code}`;
}

/* Formate une date ISO en français lisible (ex: "10 fév. 2026") */
function formatDate(isoString) {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/* Vérifie si une date ISO correspond à aujourd'hui */
function isToday(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  return isSameDay(date, now);
}

/* Compare deux dates (jour uniquement, ignore l'heure) */
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

/* Nombre de jours entre deux dates (valeur absolue) */
function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/* Retourne le lundi 00:00 de la semaine d'une date */
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // lundi = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* Retourne le 1er du mois 00:00 d'une date */
function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* Debounce classique */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export {
  generateId,
  generateCoupleCode,
  formatDate,
  isToday,
  isSameDay,
  getDaysDifference,
  getStartOfWeek,
  getStartOfMonth,
  debounce
};
