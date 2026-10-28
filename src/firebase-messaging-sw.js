import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// PWA asset precaching (was previously the separate vite-plugin-pwa sw.js).
// Merging it into this file means there is only ever one service worker
// registered at scope '/', so it can't race with firebase-messaging-sw.js
// for control of the page.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBBAe9umRHur6ahCjr5ZSTMOJO-5J1z0zw",
  authDomain: "oxbo-ecom.firebaseapp.com",
  projectId: "oxbo-ecom",
  storageBucket: "oxbo-ecom.firebasestorage.app",
  messagingSenderId: "473772820500",
  appId: "1:473772820500:web:63776627d29258e93bbf01",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || "OXBO Men's Wear";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/images/OxboLogo.png',
    badge: '/favicon.svg',
    data: payload.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
    silent: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl =
    event.notification.data?.link ||
    event.notification.data?.click_action ||
    event.notification.data?.url ||
    '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
