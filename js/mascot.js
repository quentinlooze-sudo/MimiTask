/* ==============================================
   MimiTask — Mascotte réactive (Mimi le dino)
   SVG kawaii chargé selon l'équilibre et les streaks
   ============================================== */

import * as store from './store.js';

const PHRASES = {
  excited: ["Inarrêtables ! Mimi danse de joie !", "Équilibre + streak au top !", "Mimi fait des cabrioles !", "Fier de mon équipe !"],
  happy: ["Bel équilibre, continuez !", "Mimi est tout content.", "Bravo le duo !", "Mimi approuve !"],
  neutral: ["Pas mal, on peut mieux faire.", "L'équilibre oscille…", "Mimi observe la suite.", "Mimi a connu mieux."],
  worried: ["L'équilibre penche… On corrige ?", "Mimi se fait du souci…", "Une tâche pour rééquilibrer ?", "Tout va bien… ?"],
  sad: ["Déséquilibre… Câlin ?", "Quelqu'un porte tout…", "Une tâche pour le sourire ?", "À deux c'est mieux…"]
};

const rand = arr => arr[Math.floor(Math.random() * arr.length)];

/* Détermine l'état d'humeur de Mimi */
function getMascotState() {
  const stats = store.getStats();
  const balance = store.getBalance();
  if (stats.couplePoints === 0) {
    return { state: 'happy', phrase: "Bienvenue ! Mimi a hâte de vous voir en action." };
  }
  const minRatio = Math.min(balance.partnerA, balance.partnerB);
  const bestStreak = Math.max(stats.partnerA.currentStreak, stats.partnerB.currentStreak);
  let state;
  if (minRatio >= 45 && bestStreak > 5) state = 'excited';
  else if (minRatio >= 40) state = 'happy';
  else if (minRatio >= 30) state = 'neutral';
  else if (minRatio >= 20) state = 'worried';
  else state = 'sad';
  return { state, phrase: rand(PHRASES[state]) };
}

/* Met à jour le DOM de la mascotte avec le SVG correspondant */
function renderMascot() {
  const el = document.getElementById('dashboard-mascot');
  if (!el) return;
  const { state, phrase } = getMascotState();
  const emojiEl = el.querySelector('.mascot__emoji');
  emojiEl.innerHTML = `<img class="mascot__pet mascot__pet--${state}" src="assets/mascot/mimi-${state}.svg" alt="Mimi le dinosaure" width="120" height="120">`;
  el.querySelector('.mascot__speech').textContent = phrase;
}

export { getMascotState, renderMascot };
