import api from '../api';

export const userNotificationsApi = {
  /**
   * Get all notifications with pagination and optional filters
   */
  getAllNotifications: async (
    pageOrParams: number | { page?: number; limit?: number; status?: string; type?: string } = 1,
    limit: number = 10
  ) => {
    let query = '';
    if (typeof pageOrParams === 'number') {
      query = `?page=${pageOrParams}&limit=${limit}`;
    } else if (pageOrParams) {
      const searchParams = new URLSearchParams();
      if (pageOrParams.page) searchParams.append('page', String(pageOrParams.page));
      if (pageOrParams.limit) searchParams.append('limit', String(pageOrParams.limit));
      if (pageOrParams.status) searchParams.append('status', pageOrParams.status);
      if (pageOrParams.type) searchParams.append('type', pageOrParams.type);
      query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    }
    const response = await api.get(`/notifications${query}`);
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
