import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBAe9umRHur6ahCjr5ZSTMOJO-5J1z0zw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "oxbo-ecom.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "oxbo-ecom",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "oxbo-ecom.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "473772820500",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:473772820500:web:63776627d29258e93bbf01",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0H8KX2ZLN9"
};

// Initialize Firebase App safely (avoid duplicate app initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BJn5ZkV9Uflrwa3Y9f08kwTZ7jmp9RQMOs6dUlmrXPN6kCV3gwUGH1F6SbJq7Q3NPe8mTYGgy5oQiJmOwQWrnso';

// Check if browser supports Push Notifications and Service Workers
export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (await isSupported())) {
    return getMessaging(app);
  }
  return null;
};

// Initialize Firebase Cloud Messaging safely (browser environment only)
const createMessagingInstance = (): Messaging | null => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return getMessaging(app);
  } catch (error) {
    // getMessaging() throws synchronously (messaging/unsupported-browser) on browsers
    // that lack full push support (e.g. some in-app webviews, locked-down private modes).
    // Without this catch, that error was silently swallowed by the module graph and
    // every FCM feature downstream (permission button, foreground/background push)
    // died silently with no console trace.
    console.error('[FCM] Failed to initialize Firebase Messaging:', error);
    return null;
  }
};

export const messaging: Messaging | null = createMessagingInstance();

