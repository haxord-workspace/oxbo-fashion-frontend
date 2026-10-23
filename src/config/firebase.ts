import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyBBAe9umRHur6ahCjr5ZSTMOJO-5J1z0zw",
  authDomain: "oxbo-ecom.firebaseapp.com",
  projectId: "oxbo-ecom",
  storageBucket: "oxbo-ecom.firebasestorage.app",
  messagingSenderId: "473772820500",
  appId: "1:473772820500:web:63776627d29258e93bbf01",
  measurementId: "G-0H8KX2ZLN9"
};

// Initialize Firebase App safely (avoid duplicate app initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging safely (browser environment only)
export const messaging: Messaging | null =
  typeof window !== 'undefined' && 'serviceWorker' in navigator
    ? getMessaging(app)
    : null;
