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

export function useFcmNotification() {
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
    if (!token || !isAuthenticated || isSyncingRef.current) return;
    try {
      isSyncingRef.current = true;
      await userNotificationsApi.registerFcmToken(token);
      console.log('[FCM] Device token registered with backend successfully');
    } catch (error) {
      console.error('[FCM] Failed to sync FCM token with backend:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isAuthenticated]);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('[FCM] Push notifications are not supported in this browser.');
      return null;
    }

    if (!VAPID_KEY) {
      console.warn(
        '[FCM] Missing VITE_FIREBASE_VAPID_KEY in .env. Please configure your Web Push VAPID key.'
      );
      toast.error('Firebase VAPID Key is missing in .env');
      return null;
    }

    try {
      setIsRegistering(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging!, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          setFcmToken(token);
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

          if (isAuthenticated) {
            await syncTokenToBackend(token);
          }
          toast.success('Push notifications enabled!');
          return token;
        }
      } else if (perm === 'denied') {
        toast.error('Notification permission was blocked in your browser settings.');
      }
    } catch (error: any) {
      console.error('[FCM] Error requesting notification permission:', error);
      toast.error(error?.message || 'Failed to enable push notifications');
    } finally {
      setIsRegistering(false);
    }
    return null;
  }, [isSupported, isAuthenticated, syncTokenToBackend]);

  // Re-sync existing token on login if already granted
  useEffect(() => {
    if (isAuthenticated && fcmToken) {
      syncTokenToBackend(fcmToken);
    }
  }, [isAuthenticated, fcmToken, syncTokenToBackend]);

// Synthesize a clean, pleasant notification sound chime using Web Audio API
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First note (G5 - 783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.25, now);
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
    gain2.gain.setValueAtTime(0.25, now + 0.12);
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
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground push notification received:', payload);
      setNotification(payload);

      const title = payload.notification?.title || payload.data?.title || 'OXBO Fashion';
      const body = payload.notification?.body || payload.data?.body || '';

      // 1. Play audio chime sound
      playNotificationSound();

      // 2. If the user is in another tab or minimized, trigger a native OS desktop notification reminder
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.hidden
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
            const clickAction = payload.data?.click_action || payload.data?.url;
            if (clickAction) {
              window.location.href = clickAction;
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
              const clickAction = payload.data?.click_action || payload.data?.url;
              if (clickAction) {
                window.location.href = clickAction;
              }
            }}
            className="cursor-pointer"
          >
            <p className="font-bold text-sm text-gray-900">{title}</p>
            {body && <p className="text-xs text-gray-600 mt-0.5">{body}</p>}
          </div>
        ),
        {
          icon: <Bell className="w-5 h-5 text-amber-500 shrink-0" />,
          duration: 7000,
        }
      );
    });

    return () => unsubscribe();
  }, []);

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
