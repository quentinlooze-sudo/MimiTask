/* ==============================================
   MimiTask — Mascotte réactive (Mimi le dino)
   SVG inline + couleur/accessoire depuis les prefs
   ============================================== */

import * as store from './store.js';
import { COLORS, ACCESSORIES } from './mascot-customizer.js';
import svgExcited from '../assets/mascot/mimi-excited.svg?raw';
import svgHappy from '../assets/mascot/mimi-happy.svg?raw';
import svgNeutral from '../assets/mascot/mimi-neutral.svg?raw';
import svgWorried from '../assets/mascot/mimi-worried.svg?raw';
import svgSad from '../assets/mascot/mimi-sad.svg?raw';

const SVG_MAP = { excited: svgExcited, happy: svgHappy, neutral: svgNeutral, worried: svgWorried, sad: svgSad };

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

/* Met à jour le DOM de la mascotte avec couleur + accessoire */
function renderMascot() {
  const el = document.getElementById('dashboard-mascot');
  if (!el) return;
  const { state, phrase } = getMascotState();
  const prefs = store.getMascotPrefs();
  const color = COLORS.find(c => c.id === prefs.colorId) || COLORS[0];
  const acc = ACCESSORIES.find(a => a.id === prefs.accessoryId);
  const accHtml = acc?.svg ? `<div style="position:absolute;inset:0;color:#1A1A2E">${acc.svg}</div>` : '';
  const emojiEl = el.querySelector('.mascot__emoji');
  emojiEl.innerHTML = `<div class="mascot__pet mascot__pet--${state}" style="--mascot-color:${color.body};--mascot-belly:${color.belly};position:relative">${SVG_MAP[state]}${accHtml}</div>`;
  el.querySelector('.mascot__speech').textContent = phrase;
}

export { getMascotState, renderMascot };
