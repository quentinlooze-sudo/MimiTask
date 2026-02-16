/* ==============================================
   MimiTask — Mascotte réactive (Mimi le dino)
   SVG kawaii chargé selon l'équilibre et les streaks
   Couleurs personnalisées via store.getMascotPrefs()
   ============================================== */

import * as store from './store.js';

/* Couleurs par défaut (vert forêt) et palette complète */
const DEFAULT_BODY = '#2D6A4F';
const DEFAULT_BELLY = '#52B788';
const COLORS = [
  { id: 'vert', body: '#2D6A4F', belly: '#52B788' },
  { id: 'orange', body: '#E76F51', belly: '#F4A261' },
  { id: 'violet', body: '#7209B7', belly: '#9D4EDD' },
  { id: 'bleu', body: '#0077B6', belly: '#48CAE4' },
  { id: 'rouge', body: '#E63946', belly: '#FF758F' }
];

const PHRASES = {
  excited: ["Inarrêtables ! Mimi danse de joie !", "Équilibre + streak au top !", "Mimi fait des cabrioles !", "Fier de mon équipe !"],
  happy: ["Bel équilibre, continuez !", "Mimi est tout content.", "Bravo le duo !", "Mimi approuve !"],
  neutral: ["Pas mal, on peut mieux faire.", "L'équilibre oscille…", "Mimi observe la suite.", "Mimi a connu mieux."],
  worried: ["L'équilibre penche… On corrige ?", "Mimi se fait du souci…", "Une tâche pour rééquilibrer ?", "Tout va bien… ?"],
  sad: ["Déséquilibre… Câlin ?", "Quelqu'un porte tout…", "Une tâche pour le sourire ?", "À deux c'est mieux…"]
};

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const svgCache = {};

/* Détermine l'état d'humeur de Mimi */
function getMascotState() {
  const stats = store.getStats();
  const balance = store.getBalance();
  if (stats.couplePoints === 0) return { state: 'happy', phrase: "Bienvenue ! Mimi a hâte de vous voir en action." };
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

/* Récupère les couleurs choisies par l'utilisateur */
function getMascotColors() {
  const prefs = store.getMascotPrefs?.();
  const colorId = prefs?.colorId || 'vert';
  return COLORS.find(c => c.id === colorId) || COLORS[0];
}

/* Charge un SVG et le colorie */
async function loadColoredSVG(state) {
  const url = `assets/mascot/mimi-${state}.svg`;
  if (!svgCache[state]) {
    try {
      const resp = await fetch(url);
      svgCache[state] = await resp.text();
    } catch { svgCache[state] = ''; }
  }
  let svg = svgCache[state];
  const { body, belly } = getMascotColors();
  svg = svg.replaceAll(DEFAULT_BODY, body).replaceAll(DEFAULT_BELLY, belly);
  return svg;
}

/* Met à jour le DOM de la mascotte avec le SVG correspondant */
async function renderMascot() {
  const el = document.getElementById('dashboard-mascot');
  if (!el) return;
  const { state, phrase } = getMascotState();
  const emojiEl = el.querySelector('.mascot__emoji');
  const svgHtml = await loadColoredSVG(state);
  emojiEl.innerHTML = `<div class="mascot__pet mascot__pet--${state}">${svgHtml}</div>`;
  el.querySelector('.mascot__speech').textContent = phrase;
}

export { getMascotState, renderMascot };
