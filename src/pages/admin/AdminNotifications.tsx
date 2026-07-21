import { useState, useEffect, useCallback } from 'react';
import { Loader2, Bell } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminNotificationApi } from '../../services/admin/adminNotification.Api';
import toast from 'react-hot-toast';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
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
      // Assuming response contains notifications array and total count
      setNotifications(response.notifications || response.data || []);
      setTotalNotifications(response.total || response.count || 0);
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
                  <tr key={notification._id || notification.id || index} className="hover:bg-gray-50 transition-colors">
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
    </PageWrapper>
  );
};
