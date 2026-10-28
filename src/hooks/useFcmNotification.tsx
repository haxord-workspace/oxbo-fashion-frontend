import { useEffect, useState, useCallback, useRef } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { userNotificationsApi } from '../services/user/notifications.Api';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const FCM_TOKEN_STORAGE_KEY = 'oxbo_fcm_token';

export function useFcmNotification(onNewNotification?: (payload?: MessagePayload) => void) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  });
  const [notification, setNotification] = useState<MessagePayload | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    messaging !== null;

  const isSyncingRef = useRef(false);

  // Sync token to backend
  const syncTokenToBackend = useCallback(async (token: string) => {
    if (!token || !isAuthenticated || isSyncingRef.current) {
      console.warn(
        `[FCM] Stage 4 (Backend Sync) SKIPPED — token: ${!!token}, isAuthenticated: ${isAuthenticated}, alreadySyncing: ${isSyncingRef.current}`
      );
      return;
    }
    try {
      isSyncingRef.current = true;
      await userNotificationsApi.registerFcmToken(token);
      console.log('[FCM] Stage 4 (Backend Sync) OK — POST /notifications/fcm-token succeeded');
    } catch (error) {
      console.error('[FCM] Stage 4 (Backend Sync) FAILED — POST /notifications/fcm-token rejected:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated]);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async () => {
    console.log('%c[FCM] ====== Enable Notifications clicked ======', 'color:#2563eb;font-weight:bold');

    if (!isSupported) {
      console.error('[FCM] Stage 0 (Browser Support) FAILED — this browser/context does not support Notification + ServiceWorker + FCM.');
      toast.error('Push notifications are not supported in this browser.');
      return null;
    }

    if (!VAPID_KEY) {
      console.error('[FCM] Stage 3 pre-check FAILED — VITE_FIREBASE_VAPID_KEY is missing from .env.');
      toast.error('Firebase VAPID Key is missing in .env');
      return null;
    }

    try {
      setIsRegistering(true);

      // Stage 1: User Gesture & Permission Check
      const perm = await Notification.requestPermission();
      setPermission(perm);
      console.log(`[FCM] Stage 1 (Permission) result: "${perm}"`);

      if (perm === 'granted') {
        // Stage 2: firebase-messaging-sw.js loaded
        let registration: ServiceWorkerRegistration;
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          registration = await navigator.serviceWorker.ready;
          console.log('[FCM] Stage 2 (Service Worker) OK — firebase-messaging-sw.js is registered and active. Scope:', registration.scope);
        } catch (swError) {
          console.error('[FCM] Stage 2 (Service Worker) FAILED — could not register/activate firebase-messaging-sw.js (check it returns 200 at /firebase-messaging-sw.js, and that the page is served over HTTPS or localhost):', swError);
          throw swError;
        }

        // Stage 3: Google Handshake — getToken(messaging, { vapidKey })
        let token: string | null = null;
        try {
          token = await getToken(messaging!, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });
          console.log('[FCM] Stage 3 (getToken) OK — token acquired:', token ? `${token.slice(0, 20)}...` : token);
        } catch (tokenError) {
          console.error('[FCM] Stage 3 (getToken) FAILED — VAPID key may be invalid/mismatched with the oxbo-ecom Firebase project, or push service registration was blocked:', tokenError);
          throw tokenError;
        }

        if (token) {
          setFcmToken(token);
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

          // Stage 4: Backend Sync
          if (isAuthenticated) {
            await syncTokenToBackend(token);
          } else {
            console.warn('[FCM] Stage 4 (Backend Sync) SKIPPED — user is not authenticated yet; token is cached locally and will sync automatically after login.');
          }
          toast.success('Push notifications enabled!');
          return token;
        } else {
          console.error('[FCM] Stage 3 (getToken) returned an empty token with no thrown error.');
        }
      } else if (perm === 'denied') {
        console.error('[FCM] Stage 1 (Permission) FAILED — blocked by browser policy or user denial.');
        toast.error('Notification permission was blocked in your browser settings.');
      }
    } catch (error: any) {
      console.error('[FCM] requestPermission aborted:', error);
      toast.error(error?.message || 'Failed to enable push notifications');
    } finally {
      setIsRegistering(false);
    }
    return null;
  }, [isSupported, isAuthenticated, syncTokenToBackend]);

  // Automatically sync or acquire token on login if permission is already granted
  useEffect(() => {
    if (!isAuthenticated || !isSupported) return;

    if (fcmToken) {
      syncTokenToBackend(fcmToken);
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && VAPID_KEY) {
      (async () => {
        try {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const registration = await navigator.serviceWorker.ready;
          const token = await getToken(messaging!, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });
          if (token) {
            setFcmToken(token);
            localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
            await syncTokenToBackend(token);
          }
        } catch (err) {
          console.warn('[FCM] Auto-sync token on login warning:', err);
        }
      })();
    }
  }, [isAuthenticated, fcmToken, isSupported, syncTokenToBackend]);

  // Synthesize a clean, pleasant notification sound chime using Web Audio API
  const playNotificationSound = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // First note (G5 - 783.99 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second note (C6 - 1046.5 Hz, bright pleasant chime)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1046.5, now + 0.12);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.5);
    } catch (err) {
      console.warn('[FCM] Sound chime playback warning:', err);
    }
  };

  // Listen for foreground push notifications (when user is browsing the website)
  useEffect(() => {
    if (!messaging) {
      console.error('[FCM] Stage 5 (onMessage listener) NOT ATTACHED — `messaging` is null, so no push will ever be displayed in the foreground. See the "[FCM] Failed to initialize Firebase Messaging" log for the root cause.');
      return;
    }
    console.log('[FCM] Stage 5 (onMessage listener) attached — waiting for foreground pushes.');

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground push notification received:', payload);
      setNotification(payload);

      const title = payload.notification?.title || payload.data?.title || 'OXBO Fashion';
      const body = payload.notification?.body || payload.data?.body || '';
      const targetUrl = payload.data?.link || payload.data?.click_action || payload.data?.url;

      // 1. Play audio chime sound
      playNotificationSound();

      // 2. Trigger a native OS desktop notification popup regardless of tab focus
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          const desktopNotification = new Notification(title, {
            body,
            icon: '/images/OxboLogo.png',
            badge: '/favicon.svg',
            data: payload.data || {},
            requireInteraction: true,
          });

          desktopNotification.onclick = (e) => {
            e.preventDefault();
            window.focus();
            desktopNotification.close();
            if (targetUrl) {
              window.location.href = targetUrl;
            }
          };
        } catch (e) {
          console.warn('[FCM] Desktop notification fallback warning:', e);
        }
      }

      // 3. Render rich interactive in-app toast
      toast(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              if (targetUrl) {
                window.location.href = targetUrl;
              }
            }}
            className={`cursor-pointer ${targetUrl ? 'hover:opacity-90' : ''}`}
          >
            <p className="font-bold text-sm text-gray-900">{title}</p>
            {body && <p className="text-xs text-gray-600 mt-0.5">{body}</p>}
            {targetUrl && (
              <span className="text-[11px] text-primary font-medium underline mt-1 inline-block">
                View Details &rarr;
              </span>
            )}
          </div>
        ),
        {
          icon: <Bell className="w-5 h-5 text-amber-500 shrink-0" />,
          duration: 6000,
        }
      );

      // 4. Trigger badge count or list refresh
      if (onNewNotification) {
        onNewNotification(payload);
      }
      window.dispatchEvent(new CustomEvent('newNotification', { detail: payload }));
      window.dispatchEvent(new Event('notificationsRead'));
    });

    return () => unsubscribe();
  }, [onNewNotification]);

  return {
    fcmToken,
    permission,
    isSupported,
    isRegistering,
    notification,
    requestPermission,
  };
}

export default useFcmNotification;
