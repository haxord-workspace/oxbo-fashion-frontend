import api from '../api';

export const userNotificationsApi = {
  /**
   * Get all notifications with pagination
   */
  getAllNotifications: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get all unread notifications
   */
  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  /**
   * Get a specific notification by ID
   */
  getNotificationDetails: async (notificationId: string) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}`, { isRead: true, read: true });
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const response = await api.patch(`/notifications/${notificationId}/read`, { isRead: true, read: true });
        return response.data;
      }
      throw err;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a specific notification
   */
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Register or update device FCM token
   */
  registerFcmToken: async (fcmToken: string) => {
    const response = await api.post('/notifications/fcm-token', { fcmToken });
    return response.data;
  },

  /**
   * Remove device FCM token on logout
   */
  removeFcmToken: async () => {
    const response = await api.delete('/notifications/fcm-token');
    return response.data;
  }
};
