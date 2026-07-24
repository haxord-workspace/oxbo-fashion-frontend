import { useState, useEffect, useCallback } from 'react';
import { Loader2, Bell, X } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminNotificationApi } from '../../services/admin/adminNotification.Api';
import toast from 'react-hot-toast';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminNotificationApi.getAllNotifications({
        page: currentPage,
        limit: itemsPerPage
      });
      // Handle nested response format: { data: { data: [...], total: 15 } }
      const notifs = response?.data?.data || response?.data || response?.notifications || [];
      const total = response?.data?.total || response?.total || response?.count || 0;
      
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setTotalNotifications(total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const totalPages = Math.ceil(totalNotifications / itemsPerPage) || 1;

  const getBadgeClass = (type: string) => {
    const t = type?.toLowerCase();
    if (t === 'alert') return 'bg-red-100 text-red-700';
    if (t === 'promotional' || t === 'offer') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getPriorityClass = (priority: string) => {
    const p = priority?.toLowerCase();
    if (p === 'high') return 'text-red-600 font-bold';
    if (p === 'low') return 'text-gray-500';
    return 'text-green-600 font-medium';
  };

  return (
    <PageWrapper title="All Notifications">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="py-4 px-6 font-medium">Notification Details</th>
                <th className="py-4 px-6 font-medium">Type</th>
                <th className="py-4 px-6 font-medium">Channel</th>
                <th className="py-4 px-6 font-medium">Priority</th>
                <th className="py-4 px-6 font-medium text-right">Date Sent</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading notifications...
                    </div>
                  </td>
                </tr>
              ) : notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <tr 
                    key={notification._id || notification.id || index} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-gray-100 rounded-lg text-gray-500">
                          <Bell size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">{notification.title}</p>
                          <p className="text-gray-500 mt-1 max-w-md line-clamp-2">{notification.message}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getBadgeClass(notification.type)}`}>
                        {notification.type || 'system'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 capitalize">
                      {notification.channel || 'email'}
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span className={getPriorityClass(notification.priority)}>
                        {notification.priority || 'normal'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-500 whitespace-nowrap">
                      {notification.createdAt 
                        ? new Date(notification.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) 
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalNotifications > 0 && (
        <div className="mt-6">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalNotifications}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Notification Details</h3>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Title</span>
                <p className="mt-1 text-gray-900 font-medium">{selectedNotification.title}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Message</span>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getBadgeClass(selectedNotification.type)}`}>
                      {selectedNotification.type || 'system'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Priority</span>
                  <div className="mt-1">
                    <span className={`capitalize ${getPriorityClass(selectedNotification.priority)}`}>
                      {selectedNotification.priority || 'normal'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Channel</span>
                  <p className="mt-1 text-gray-900 capitalize">{selectedNotification.channel || 'email'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                  <p className="mt-1 text-gray-900 capitalize">{selectedNotification.status || 'pending'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Date Sent</span>
                  <p className="mt-1 text-gray-900">
                    {selectedNotification.createdAt 
                      ? new Date(selectedNotification.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
