import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration from user's active campussim-9muwd project
const firebaseConfig = {
  projectId: "campussim-9muwd",
  appId: "1:415956203794:web:7377ab6767fc178af95bcb",
  storageBucket: "campussim-9muwd.firebasestorage.app",
  apiKey: "AIzaSyAIgI-svQcA7bYR-abA8_QYGEIcQHdv3MQ",
  authDomain: "campussim-9muwd.firebaseapp.com",
  messagingSenderId: "415956203794"
};

let app = null;
let db = null;
let auth = null;
let isFirebaseConnected = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseConnected = true;
  console.log('[Firebase] Connected to CampusSim Firestore & Auth:', firebaseConfig.projectId);
} catch (error) {
  console.warn('[Firebase] Initialized with local fallback mode:', error.message);
  isFirebaseConnected = false;
}

export { app, db, auth, isFirebaseConnected, firebaseConfig };
