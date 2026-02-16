/* ==============================================
   MimiTask — Personnalisation mascotte (Settings)
   Apercu, grille couleurs, grille accessoires, save Firestore
   ============================================== */

import * as store from './store.js';
import { writeMascotPrefs, readMascotPrefs } from './store-firestore.js';
import svgHappy from '../assets/mascot/mimi-happy.svg?raw';
import accHat from '../assets/mascot/accessories/hat.svg?raw';
import accBow from '../assets/mascot/accessories/bow.svg?raw';
import accGlasses from '../assets/mascot/accessories/glasses.svg?raw';
import accCrown from '../assets/mascot/accessories/crown.svg?raw';
import accScarf from '../assets/mascot/accessories/scarf.svg?raw';

const COLORS = [
  { id: 'vert', label: 'Vert forêt', body: '#2D6A4F', belly: '#52B788' },
  { id: 'orange', label: 'Orange corail', body: '#E76F51', belly: '#F4A261' },
  { id: 'violet', label: 'Violet royal', body: '#7209B7', belly: '#9D4EDD' },
  { id: 'bleu', label: 'Bleu océan', body: '#0077B6', belly: '#48CAE4' },
  { id: 'rouge', label: 'Rouge cerise', body: '#E63946', belly: '#FF758F' }
];

const ACCESSORIES = [
  { id: 'none', label: 'Aucun', svg: '' },
  { id: 'hat', label: 'Chapeau', svg: accHat },
  { id: 'bow', label: 'Nœud', svg: accBow },
  { id: 'glasses', label: 'Lunettes', svg: accGlasses },
  { id: 'crown', label: 'Couronne', svg: accCrown },
  { id: 'scarf', label: 'Écharpe', svg: accScarf }
];

let selectedColor = 'vert';
let selectedAcc = 'none';

const DEFAULT_BODY = '#2D6A4F';
const DEFAULT_BELLY = '#52B788';

/* Rendu de l'aperçu en direct */
function renderPreview() {
  const el = document.getElementById('customizer-preview');
  if (!el) return;
  const c = COLORS.find(c => c.id === selectedColor) || COLORS[0];
  const acc = ACCESSORIES.find(a => a.id === selectedAcc);
  let svg = svgHappy.replaceAll(DEFAULT_BODY, c.body).replaceAll(DEFAULT_BELLY, c.belly);
  const accHtml = acc?.svg ? `<div style="position:absolute;inset:0;color:#1A1A2E">${acc.svg}</div>` : '';
  el.innerHTML = `<div class="customizer__preview-pet">${svg}${accHtml}</div>`;
}

/* Construit la grille des couleurs */
function buildColorGrid() {
  const container = document.getElementById('customizer-colors');
  if (!container) return;
  container.innerHTML = COLORS.map(c =>
    `<button class="customizer__color-btn${c.id === selectedColor ? ' customizer__color-btn--active' : ''}"
       data-color="${c.id}" style="background-color:${c.body}"
       role="radio" aria-checked="${c.id === selectedColor}" aria-label="${c.label}"></button>`
  ).join('');
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-color]');
    if (!btn) return;
    selectedColor = btn.dataset.color;
    container.querySelectorAll('.customizer__color-btn').forEach(b => {
      const isActive = b.dataset.color === selectedColor;
      b.classList.toggle('customizer__color-btn--active', isActive);
      b.setAttribute('aria-checked', isActive);
    });
    renderPreview();
  });
}

/* Construit la grille des accessoires */
function buildAccessoryGrid() {
  const container = document.getElementById('customizer-accessories');
  if (!container) return;
  container.innerHTML = ACCESSORIES.map(a => {
    const icon = a.svg
      ? `<span class="customizer__acc-icon">${a.svg}</span>`
      : `<span class="customizer__acc-icon" style="font-size:24px;display:flex;align-items:center;justify-content:center">✕</span>`;
    return `<button class="customizer__acc-btn${a.id === selectedAcc ? ' customizer__acc-btn--active' : ''}"
       data-acc="${a.id}" role="radio" aria-checked="${a.id === selectedAcc}" aria-label="${a.label}">
       ${icon}<span class="customizer__acc-label">${a.label}</span></button>`;
  }).join('');
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-acc]');
    if (!btn) return;
    selectedAcc = btn.dataset.acc;
    container.querySelectorAll('.customizer__acc-btn').forEach(b => {
      const isActive = b.dataset.acc === selectedAcc;
      b.classList.toggle('customizer__acc-btn--active', isActive);
      b.setAttribute('aria-checked', isActive);
    });
    renderPreview();
  });
}

/* Sauvegarde dans Firestore (couples/{code}/mascot/prefs) */
async function save() {
  const prefs = { colorId: selectedColor, accessoryId: selectedAcc };
  try {
    await writeMascotPrefs(prefs);
    store.applySnapshot('mascot', prefs);
    window.renderDashboard?.();
    window.showToast?.('Look de Mimi sauvegardé !');
  } catch { window.showToast?.('Erreur de sauvegarde', 'error'); }
}

/* Charge les prefs depuis Firestore et pré-sélectionne */
async function loadPrefs() {
  try {
    const prefs = await readMascotPrefs();
    if (prefs?.colorId && COLORS.some(c => c.id === prefs.colorId)) selectedColor = prefs.colorId;
    if (prefs?.accessoryId && ACCESSORIES.some(a => a.id === prefs.accessoryId)) selectedAcc = prefs.accessoryId;
  } catch { /* default values */ }
}

/* Appelé quand la sync pousse de nouvelles prefs */
function applyRemotePrefs(prefs) {
  if (!prefs) return;
  if (prefs.colorId) selectedColor = prefs.colorId;
  if (prefs.accessoryId !== undefined) selectedAcc = prefs.accessoryId;
  buildColorGrid();
  buildAccessoryGrid();
  renderPreview();
}

/* Point d'entrée — appelé par app.js */
async function initMascotCustomizer() {
  await loadPrefs();
  buildColorGrid();
  buildAccessoryGrid();
  renderPreview();
  document.getElementById('customizer-save')?.addEventListener('click', save);
}

/* Expose pour sync.js */
window.applyMascotPrefs = applyRemotePrefs;

export { initMascotCustomizer, applyRemotePrefs, COLORS, ACCESSORIES };
