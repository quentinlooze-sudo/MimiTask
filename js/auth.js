/* ==============================================
   MimiTask — Auth anonyme + gestion code couple
   Authentification Firebase et liaison couple/Firestore
   ============================================== */

import { auth, db } from './firebase-config.js';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateCoupleCode } from './utils.js';

const MAX_CODE_RETRIES = 5;
const COUPLES_COLLECTION = 'couples';
const COUPLE_CODE_KEY = 'mimitask_couple_code';

/* State interne — accès synchrone via les getters */
let currentUser = null;
let coupleCode = null;
let partnerRole = null;

/* ---- Initialisation ---- */

/* Authentifie l'utilisateur anonymement et restaure la liaison couple */
async function initAuth() {
  try {
    currentUser = await waitForAuth();
    console.log('[auth] Connecté anonymement:', currentUser.uid);
    await restoreCoupleLink();
  } catch (err) {
    console.error('[auth] Initialisation échouée:', err);
    throw err;
  }
}

/* Attend le premier état d'auth — signe anonymement si nécessaire */
function waitForAuth() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      try {
        if (user) {
          resolve(user);
        } else {
          const credential = await signInAnonymously(auth);
          resolve(credential.user);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

/* Vérifie si l'utilisateur est déjà lié à un couple en Firestore */
async function restoreCoupleLink() {
  const storedCode = localStorage.getItem(COUPLE_CODE_KEY);
  if (!storedCode) return;

  try {
    const snapshot = await getDoc(doc(db, COUPLES_COLLECTION, storedCode));
    if (!snapshot.exists()) {
      localStorage.removeItem(COUPLE_CODE_KEY);
      return;
    }

    const data = snapshot.data();
    const uid = currentUser.uid;

    if (data.partnerA?.authUid === uid) {
      coupleCode = storedCode;
      partnerRole = 'partnerA';
    } else if (data.partnerB?.authUid === uid) {
      coupleCode = storedCode;
      partnerRole = 'partnerB';
    } else {
      // UID ne correspond plus — clé locale obsolète
      localStorage.removeItem(COUPLE_CODE_KEY);
    }
  } catch (err) {
    console.warn('[auth] Restauration couple échouée (offline ?):', err.code);
  }
}

/* ---- Création de couple ---- */

/* Crée un nouveau couple dans Firestore avec un code unique */
async function createCouple(nameA, nameB) {
  if (!currentUser) throw new Error('AUTH_REQUIRED');
  if (!nameA?.trim() || !nameB?.trim()) throw new Error('INVALID_NAMES');

  try {
    // Générer un code unique — on tente le setDoc directement
    // (getDoc échoue sur les rules car isMember ne peut pas évaluer un doc inexistant)
    let code = null;
    for (let i = 0; i < MAX_CODE_RETRIES; i++) {
      const candidate = generateCoupleCode();
      try {
        const snapshot = await getDoc(doc(db, COUPLES_COLLECTION, candidate));
        if (!snapshot.exists()) { code = candidate; break; }
      } catch {
        // permission-denied = le doc n'existe pas (rules ne matchent pas) → code disponible
        code = candidate; break;
      }
    }
    if (!code) throw new Error('CODE_GENERATION_FAILED');

    await setDoc(doc(db, COUPLES_COLLECTION, code), {
      partnerA: {
        name: nameA.trim(),
        avatar: '',
        authUid: currentUser.uid,
        fcmToken: null
      },
      partnerB: {
        name: nameB.trim(),
        avatar: '',
        authUid: null,
        fcmToken: null
      },
      mascot: { color: null, accessory: null },
      settings: { theme: 'default', notificationsEnabled: false },
      createdAt: serverTimestamp()
    });

    // Sauvegarder localement et mettre à jour le state
    localStorage.setItem(COUPLE_CODE_KEY, code);
    coupleCode = code;
    partnerRole = 'partnerA';
    console.log('[auth] Couple créé:', code);

    return { coupleCode: code };
  } catch (err) {
    console.error('[auth] Création couple échouée:', err);
    throw err;
  }
}

/* ---- Rejoindre un couple ---- */

/* Rejoint un couple existant en tant que partenaire B */
async function joinCouple(inputCode, name) {
  if (!currentUser) throw new Error('AUTH_REQUIRED');
  if (!name?.trim()) throw new Error('INVALID_NAME');

  const code = inputCode.trim().toUpperCase();
  if (!/^MIM-[A-Z2-9]{3}$/.test(code)) throw new Error('INVALID_CODE_FORMAT');

  try {
    const docRef = doc(db, COUPLES_COLLECTION, code);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) throw new Error('COUPLE_NOT_FOUND');

    const data = snapshot.data();

    // Vérifier que la place de partenaire B est libre
    if (data.partnerB?.authUid && data.partnerB.authUid !== currentUser.uid) {
      throw new Error('COUPLE_FULL');
    }

    // Enregistrer le partenaire B
    await updateDoc(docRef, {
      'partnerB.name': name.trim(),
      'partnerB.authUid': currentUser.uid
    });

    // Sauvegarder localement et mettre à jour le state
    localStorage.setItem(COUPLE_CODE_KEY, code);
    coupleCode = code;
    partnerRole = 'partnerB';
    console.log('[auth] Couple rejoint:', code);

    return {
      coupleCode: code,
      partnerRole: 'partnerB',
      partnerAName: data.partnerA?.name || ''
    };
  } catch (err) {
    console.error('[auth] Rejoindre couple échoué:', err);
    throw err;
  }
}

/* ---- Accesseurs synchrones ---- */

function getCurrentUid() { return currentUser?.uid ?? null; }
function getCoupleCode() { return coupleCode; }
function getPartnerRole() { return partnerRole; }
function isAuthenticated() { return currentUser !== null; }

export {
  initAuth,
  createCouple,
  joinCouple,
  getCurrentUid,
  getCoupleCode,
  getPartnerRole,
  isAuthenticated
};
