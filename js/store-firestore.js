/* ==============================================
   MimiTask — Helpers Firestore pour store.js
   Ecriture fire-and-forget + lecture au boot
   ============================================== */

import { db } from './firebase-config.js';
import {
  doc, setDoc, deleteDoc, getDoc, getDocs,
  collection, writeBatch, updateDoc
} from 'firebase/firestore';

const COUPLES = 'couples';
let coupleCode = null;

/* Injecte le code couple (appele par store.js) */
function setCoupleCode(code) { coupleCode = code; }
function isFirestoreReady() { return !!coupleCode; }

/* Ref du document couple courant */
function coupleRef() {
  if (!coupleCode) return null;
  return doc(db, COUPLES, coupleCode);
}

/* Signale pending/ok au sync indicator pendant un write */
async function wrapWrite(fn) {
  window.setSyncStatus?.('pending');
  try { await fn(); window.setSyncStatus?.('ok'); }
  catch (err) { window.setSyncStatus?.('ok'); throw err; }
}

/* --- Ecriture taches --- */
async function writeTask(task) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => setDoc(doc(ref, 'tasks', task.id), task, { merge: true }));
  } catch (err) { console.warn('[store-fs] writeTask failed:', err.code || err); }
}

async function removeTask(taskId) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => deleteDoc(doc(ref, 'tasks', taskId)));
  } catch (err) { console.warn('[store-fs] removeTask failed:', err.code || err); }
}

async function batchWriteTasks(tasks) {
  const ref = coupleRef();
  if (!ref || tasks.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const t of tasks) batch.set(doc(ref, 'tasks', t.id), t);
    await wrapWrite(() => batch.commit());
  } catch (err) { console.warn('[store-fs] batchWriteTasks failed:', err.code || err); }
}

/* --- Ecriture recompenses --- */
async function writeReward(reward) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => setDoc(doc(ref, 'rewards', reward.id), reward, { merge: true }));
  } catch (err) { console.warn('[store-fs] writeReward failed:', err.code || err); }
}

async function removeReward(rewardId) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => deleteDoc(doc(ref, 'rewards', rewardId)));
  } catch (err) { console.warn('[store-fs] removeReward failed:', err.code || err); }
}

async function batchWriteRewards(rewards) {
  const ref = coupleRef();
  if (!ref || rewards.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const r of rewards) batch.set(doc(ref, 'rewards', r.id), r);
    await wrapWrite(() => batch.commit());
  } catch (err) { console.warn('[store-fs] batchWriteRewards failed:', err.code || err); }
}

/* --- Ecriture stats --- */
async function writeStats(stats) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => setDoc(doc(ref, 'stats', 'current'), stats, { merge: true }));
  } catch (err) { console.warn('[store-fs] writeStats failed:', err.code || err); }
}

/* --- Mascotte prefs (couleur + accessoire) --- */
async function writeMascotPrefs(prefs) {
  const ref = coupleRef();
  if (!ref) return;
  try { await wrapWrite(() => setDoc(doc(ref, 'mascot', 'prefs'), prefs, { merge: true }));
  } catch (err) { console.warn('[store-fs] writeMascotPrefs:', err.code || err); }
}
async function readMascotPrefs() {
  const ref = coupleRef();
  if (!ref) return null;
  try { const s = await getDoc(doc(ref, 'mascot', 'prefs')); return s.exists() ? s.data() : null;
  } catch { return null; }
}

/* --- Ecriture champ couple --- */
async function writeCoupleField(fieldPath, value) {
  const ref = coupleRef();
  if (!ref) return;
  try {
    await wrapWrite(() => updateDoc(ref, { [fieldPath]: value }));
  } catch (err) { console.warn('[store-fs] writeCoupleField failed:', err.code || err); }
}

/* --- Lecture complete au boot --- */

const DEFAULT_STATS = {
  partnerA: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
  partnerB: { totalPoints: 0, currentStreak: 0, bestStreak: 0, lastActivityDate: null },
  couplePoints: 0
};

async function pullFromFirestore() {
  if (!coupleCode) return null;
  try {
    const ref = coupleRef();
    const coupleSnap = await getDoc(ref);
    if (!coupleSnap.exists()) return null;
    const cd = coupleSnap.data();

    const tasksSnap = await getDocs(collection(ref, 'tasks'));
    const tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const rewardsSnap = await getDocs(collection(ref, 'rewards'));
    const rewards = rewardsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const statsSnap = await getDoc(doc(ref, 'stats', 'current'));
    const stats = statsSnap.exists() ? statsSnap.data() : { ...DEFAULT_STATS };

    const mascotSnap = await getDoc(doc(ref, 'mascot', 'prefs'));
    const mascot = mascotSnap.exists() ? mascotSnap.data() : { colorId: 'vert', accessoryId: 'none' };

    return {
      couple: {
        partnerA: { name: cd.partnerA?.name || '', avatar: cd.partnerA?.avatar || '' },
        partnerB: { name: cd.partnerB?.name || '', avatar: cd.partnerB?.avatar || '' },
        coupleCode
      },
      tasks,
      rewards,
      stats,
      mascot,
      settings: {
        theme: cd.settings?.theme || 'default',
        onboardingDone: true,
        lastResetDate: cd.settings?.lastResetDate || null
      }
    };
  } catch (err) {
    console.warn('[store-fs] pullFromFirestore failed:', err.code || err);
    return null;
  }
}

export {
  setCoupleCode, isFirestoreReady, coupleRef,
  writeTask, removeTask, batchWriteTasks,
  writeReward, removeReward, batchWriteRewards,
  writeStats, writeCoupleField, writeMascotPrefs, readMascotPrefs,
  pullFromFirestore
};
