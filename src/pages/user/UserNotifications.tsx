import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Bell, CheckCircle, Trash2, CheckCheck } from 'lucide-react';
import { userNotificationsApi } from '../../services/user/notifications.Api';
import toast from 'react-hot-toast';

export const UserNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userNotificationsApi.getAllNotifications(currentPage, itemsPerPage);
      
      let notifsData = response;
      if (response && response.success && response.data) {
        notifsData = response.data;
      }
      
      const notifsArray = Array.isArray(notifsData) 
        ? notifsData 
        : (notifsData?.notifications || notifsData?.data || []);
        
      setNotifications(Array.isArray(notifsArray) ? notifsArray : []);
      setTotalNotifications(notifsData?.total || notifsData?.count || notifsArray?.length || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(`read-${id}`);
    try {
      await userNotificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          (notif._id || notif.id) === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading('read-all');
    try {
      await userNotificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(`delete-${id}`);
    try {
      await userNotificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => (notif._id || notif.id) !== id));
      setTotalNotifications((prev) => Math.max(0, prev - 1));
      toast.success('Notification deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalNotifications / itemsPerPage) || 1;

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h2>
          {notifications.length > 0 && hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading === 'read-all'}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {actionLoading === 'read-all' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark All as Read
            </button>
          )}
        </div>

        <div className="bg-white p-6 sm:p-8 border border-gray-200 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-gray-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading your notifications...</span>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => {
                const id = notification._id || notification.id || index;
                const isRead = notification.isRead;
                return (
                  <div
                    key={id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border transition-colors ${
                      isRead ? 'bg-gray-50 border-gray-100' : 'bg-white border-primary border-opacity-30 shadow-sm'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${isRead ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white'}`}>
                      <Bell size={20} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-base font-bold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                      <p className={`text-sm ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0">
                      {!isRead && (
                        <button
                          onClick={() => handleMarkAsRead(id)}
                          disabled={actionLoading === `read-${id}`}
                          title="Mark as read"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `read-${id}` ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={actionLoading === `delete-${id}`}
                        title="Delete notification"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `delete-${id}` ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No notifications found.</p>
              <p className="text-sm mt-1">We'll let you know when something new happens.</p>
            </div>
          )}

          {/* Pagination */}
          {totalNotifications > itemsPerPage && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;
