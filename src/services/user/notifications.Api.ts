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
    const response = await api.patch(`/notifications/${notificationId}`);
    return response.data;
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
  }
};
