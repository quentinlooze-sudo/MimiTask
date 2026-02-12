/* ==============================================
   MimiTask — Configuration Firebase
   Initialisation SDK, Firestore et Auth
   ============================================== */

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/* Configuration Firebase */
const firebaseConfig = {
  apiKey: 'AIzaSyABwaIgmK3Sw4UDtowfKMZ4aMOYnfzykL8',
  authDomain: 'mimitask.firebaseapp.com',
  projectId: 'mimitask',
  storageBucket: 'mimitask.firebasestorage.app',
  messagingSenderId: '209506756090',
  appId: '1:209506756090:web:f9efe1d8be9f6e2f0d3043'
};

/* Initialisation des services Firebase */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* Activation du cache offline Firestore (IndexedDB)
   Permet à l'app de fonctionner hors connexion */
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    // Plusieurs onglets ouverts — la persistence ne peut être activée que dans un seul
    console.warn('Firestore persistence : un seul onglet à la fois supporté.');
  } else if (err.code === 'unimplemented') {
    // Navigateur sans support IndexedDB
    console.warn('Firestore persistence : non supporté par ce navigateur.');
  }
});

export { db, auth, app };
