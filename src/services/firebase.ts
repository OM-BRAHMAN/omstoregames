/**
 * OM.COM - Firebase Integration Service
 * 
 * Configured with live Firebase Project credentials:
 * Project ID: "omcom-9aa9b"
 * Auth Domain: "omcom-9aa9b.firebaseapp.com"
 * Storage Bucket: "omcom-9aa9b.firebasestorage.app"
 * Messaging Sender ID: "724459194015"
 * App ID: "1:724459194015:web:d6eda8d36cbf6011afc4aa"
 * Measurement ID: "G-YFHJ6VJSVL"
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { Game, FirebaseConnectionConfig } from '../types/game';

const STORAGE_KEY_FIREBASE_CONFIG = 'omstore_firebase_config';

// User's Real Firebase Project Configuration
export const USER_FIREBASE_CONFIG: FirebaseConnectionConfig = {
  apiKey: "AIzaSyCdV3pPwu8Ug7bXL8_8H8aOKnC9pFpAXzE",
  authDomain: "omcom-9aa9b.firebaseapp.com",
  projectId: "omcom-9aa9b",
  storageBucket: "omcom-9aa9b.firebasestorage.app",
  messagingSenderId: "724459194015",
  appId: "1:724459194015:web:d6eda8d36cbf6011afc4aa",
  measurementId: "G-YFHJ6VJSVL"
};

export let firebaseApp: FirebaseApp;
export let firebaseAuth: Auth;
export let firestoreDb: Firestore;
export let firebaseStorage: FirebaseStorage;
export let analytics: Analytics | null = null;

// Initialize Firebase immediately with user's credentials
try {
  if (!getApps().length) {
    firebaseApp = initializeApp(USER_FIREBASE_CONFIG);
  } else {
    firebaseApp = getApp();
  }

  firebaseAuth = getAuth(firebaseApp);
  firestoreDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);

  // Initialize Analytics in browser context if supported
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && firebaseApp) {
        analytics = getAnalytics(firebaseApp);
      }
    }).catch((err) => {
      console.warn('Firebase Analytics not supported in this environment:', err);
    });
  }
} catch (err) {
  console.error('Firebase initialization error:', err);
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  if (!firebaseAuth) throw new Error('Firebase Auth is not initialized');
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
}

/**
 * Sign in existing user with Email and Password
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (!firebaseAuth) throw new Error('Firebase Auth is not initialized');
  const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return userCredential.user;
}

/**
 * 1-Click Sign in with Google
 */
export async function loginWithGoogle(): Promise<User> {
  if (!firebaseAuth) throw new Error('Firebase Auth is not initialized');
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(firebaseAuth, provider);
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

/**
 * Subscribe to Authentication State Changes (Current Logged-in User)
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  if (!firebaseAuth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

/**
 * Load saved Firebase credentials from localStorage or fallback to default
 */
export function getSavedFirebaseConfig(): FirebaseConnectionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.apiKey !== 'YOUR_API_KEY') {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read stored Firebase config:', err);
  }
  return USER_FIREBASE_CONFIG;
}

/**
 * Re-initialize or update Firebase configuration
 */
export function initFirebase(config: FirebaseConnectionConfig): boolean {
  try {
    if (!config.apiKey || !config.projectId) return false;

    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return false;
  }
}

/**
 * Disconnect and remove saved Firebase config
 */
export function disconnectFirebase() {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

/**
 * Check if Firebase is currently active and initialized
 */
export function isFirebaseActive(): boolean {
  return Boolean(firestoreDb && firebaseStorage);
}

/**
 * Real-time listener for games collection in Firestore
 */
export function subscribeToFirestoreGames(
  onUpdate: (games: Game[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!firestoreDb) return () => {};

  try {
    const gamesRef = collection(firestoreDb, 'games');
    const q = query(gamesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const games: Game[] = [];
        snapshot.forEach((d) => {
          games.push({ id: d.id, ...d.data() } as Game);
        });
        onUpdate(games);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error('Failed to subscribe to Firestore:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Upload APK file to Firebase Storage with upload progress tracking
 */
export async function uploadApkToFirebaseStorage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ downloadUrl: string; fileName: string; sizeMb: number }> {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `apks/${Date.now()}_${cleanName}`;
  const storageRef = ref(firebaseStorage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: 'application/vnd.android.package-archive',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage APK upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
          resolve({ downloadUrl, fileName: file.name, sizeMb });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Upload Image (Icon or Screenshot) to Firebase Storage
 */
export async function uploadImageToFirebaseStorage(
  file: File,
  folder = 'images',
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage is not initialized.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(firebaseStorage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Save or update game document in Firestore
 */
export async function saveGameToFirestore(game: Game): Promise<void> {
  if (!firestoreDb) {
    throw new Error('Firestore is not initialized.');
  }

  const gameDocRef = doc(firestoreDb, 'games', game.id);
  await setDoc(gameDocRef, game, { merge: true });
}

/**
 * Delete game document from Firestore
 */
export async function deleteGameFromFirestore(id: string): Promise<void> {
  if (!firestoreDb) {
    throw new Error('Firestore is not initialized.');
  }

  const gameDocRef = doc(firestoreDb, 'games', id);
  await deleteDoc(gameDocRef);
}

export const FIREBASE_VAPID_KEY = "BINTGLf0cjf_XonATzR1tQ90jyzy_mtySO9kGWwaTT8Aw5Eu0wCOvqIj0QO11V5nWK_1P-0A8gpJYg85jTG_QN0";

/**
 * Request Browser Push Notification Permission and retrieve FCM Device Token
 */
export async function requestNotificationPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return null;
  }

  try {
    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported || !firebaseApp) {
      console.warn('Firebase Messaging is not supported in this browser environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission was not granted:', permission);
      return null;
    }

    const messaging = getMessaging(firebaseApp);
    const currentToken = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log('FCM Registration Token received:', currentToken);
      localStorage.setItem('omstore_fcm_token', currentToken);
      return currentToken;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving FCM token:', err);
    return null;
  }
}

/**
 * Listen for foreground push messages
 */
export async function onForegroundMessage(callback: (payload: any) => void): Promise<(() => void) | null> {
  if (typeof window === 'undefined') return null;

  try {
    const { getMessaging, onMessage, isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    if (!supported || !firebaseApp) return null;

    const messaging = getMessaging(firebaseApp);
    return onMessage(messaging, (payload) => {
      console.log('Foreground FCM notification received:', payload);
      callback(payload);
    });
  } catch (err) {
    console.error('Failed to setup foreground push notification listener:', err);
    return null;
  }
}

/**
 * Test the Firestore connection
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!firestoreDb) return false;
  try {
    const q = query(collection(firestoreDb, 'games'));
    await getDocs(q);
    return true;
  } catch (err) {
    console.error('Firebase test connection failed:', err);
    return false;
  }
}
