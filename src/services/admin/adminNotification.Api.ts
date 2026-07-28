import api from '../api';

export interface SendNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  priority: string;
}

export interface SendBulkNotificationPayload {
  userIds: string[];
  title: string;
  message: string;
  type: string;
  channel: string;
  priority: string;
}

export interface SendAllNotificationPayload {
  title: string;
  message: string;
  type: string;
  channel: string;
  priority: string;
}

export const adminNotificationApi = {
  sendNotification: async (data: SendNotificationPayload) => {
    try {
      const response = await api.post('/admin/notifications/send', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  sendBulkNotification: async (data: SendBulkNotificationPayload) => {
    try {
      const response = await api.post('/admin/notifications/send-bulk', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  getAllNotifications: async (params?: { page?: number; limit?: number }) => {
    try {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  sendAllNotifications: async (data: SendAllNotificationPayload) => {
    try {
      const response = await api.post('/admin/notifications/send-all', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};
