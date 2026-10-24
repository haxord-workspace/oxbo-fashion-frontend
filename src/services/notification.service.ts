import { getMessagingInstance, VAPID_KEY } from '../config/firebase';
import { getToken } from 'firebase/messaging';
import api from './api';

export const FCM_TOKEN_STORAGE_KEY = 'oxbo_fcm_token';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel?: string;
  status: 'pending' | 'delivered' | 'read' | string;
  priority?: 'low' | 'normal' | 'high';
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  link?: string;
  url?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'delivered' | 'read' | string;
  type?: string;
}

export interface NotificationsListResponse {
  success: boolean;
  message: string;
  data: {
    data: NotificationItem[];
    total: number;
  };
}

/**
 * Step 4: Token Registration Service
 * Requests browser push notification permission, registers service worker,
 * fetches FCM registration token, and synchronizes it with the OXBO backend.
 */
export const requestAndSyncFcmToken = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[FCM] This browser does not support push notifications.');
      return null;
    }

    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission denied by user.');
      return null;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // 3. Obtain Firebase Messaging instance
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.warn('[FCM] Firebase Messaging is not supported in this environment.');
      return null;
    }

    // 4. Get FCM Token from Firebase
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      // 5. Send token to OXBO Backend
      await api.post('/notifications/fcm-token', { fcmToken: currentToken });
      localStorage.setItem(FCM_TOKEN_STORAGE_KEY, currentToken);
      console.log('[FCM] FCM token synchronized with backend successfully.');
      return currentToken;
    } else {
      console.warn('[FCM] No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error setting up push notifications:', error);
    return null;
  }
};

/**
 * Remove FCM Token on User Logout
 * Clears the user's token registration on the backend so they no longer receive push notifications.
 */
export const removeFcmTokenOnLogout = async (): Promise<void> => {
  try {
    await api.delete('/notifications/fcm-token');
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    console.log('[FCM] FCM token removed successfully on logout.');
  } catch (error) {
    console.error('[FCM] Error clearing FCM token on backend:', error);
  }
};

/**
 * In-App Notification Center API Calls
 */
export const notificationService = {
  /**
   * 1. Get Notification List (Paginated, filtered)
   * GET /api/v1/notifications?page=1&limit=10&status=...&type=...
   */
  getNotifications: async (params?: GetNotificationsParams | number, maybeLimit?: number) => {
    let query = '';
    if (typeof params === 'number') {
      query = `?page=${params}&limit=${maybeLimit || 10}`;
    } else if (params) {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', String(params.page));
      if (params.limit) searchParams.append('limit', String(params.limit));
      if (params.status) searchParams.append('status', params.status);
      if (params.type) searchParams.append('type', params.type);
      query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    }
    const response = await api.get(`/notifications${query}`);
    return response.data;
  },

  /**
   * 2. Get Unread Notifications (For Badge Count)
   * GET /api/v1/notifications/unread
   */
  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  /**
   * Get notification details by ID
   * GET /api/v1/notifications/:id
   */
  getNotificationDetails: async (id: string) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  /**
   * 3. Mark Single Notification as Read
   * PATCH /api/v1/notifications/:id
   */
  markAsRead: async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}`, { status: 'read', isRead: true });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const response = await api.patch(`/notifications/${id}/read`, { status: 'read', isRead: true });
        return response.data;
      }
      throw err;
    }
  },

  /**
   * 4. Mark All Notifications as Read
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * 5. Delete Notification
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  requestAndSyncFcmToken,
  removeFcmTokenOnLogout,
};

export default notificationService;
