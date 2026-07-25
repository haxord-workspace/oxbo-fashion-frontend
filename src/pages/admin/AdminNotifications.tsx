import { useState, useEffect, useCallback } from 'react';
import { Loader2, Bell, X, Send, Plus, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminNotificationApi } from '../../services/admin/adminNotification.Api';
import toast from 'react-hot-toast';

// ─── Bulk Notification Modal ──────────────────────────────────────────────────

const EMPTY_BULK_FORM = {
  userIds: [''],
  title: '',
  message: '',
  type: 'system',
  channel: 'in_app',
  priority: 'normal',
};

const BulkNotificationModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [form, setForm] = useState({ ...EMPTY_BULK_FORM });
  const [isSending, setIsSending] = useState(false);

  const handleUserIdChange = (index: number, value: string) => {
    const ids = [...form.userIds];
    ids[index] = value;
    setForm({ ...form, userIds: ids });
  };

  const addUserId = () => setForm({ ...form, userIds: [...form.userIds, ''] });

  const removeUserId = (index: number) => {
    const ids = form.userIds.filter((_, i) => i !== index);
    setForm({ ...form, userIds: ids.length ? ids : [''] });
  };

  const handleSend = async () => {
    const cleanedIds = form.userIds.map(id => id.trim()).filter(Boolean);
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.message.trim()) return toast.error('Message is required');
    if (cleanedIds.length === 0) return toast.error('At least one User ID is required');

    setIsSending(true);
    try {
      await adminNotificationApi.sendBulkNotification({
        ...form,
        userIds: cleanedIds,
      });
      toast.success('Bulk notification sent successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send bulk notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-primary" />
            <h3 className="text-lg font-bold text-gray-900">Send Bulk Notification</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Notification title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Message <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Notification message..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Type / Channel / Priority */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="system">System</option>
                <option value="promotional">Promotional</option>
                <option value="alert">Alert</option>
                <option value="offer">Offer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Channel</label>
              <select
                value={form.channel}
                onChange={e => setForm({ ...form, channel: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* User IDs
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              User IDs <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.userIds.join('\n')}
              onChange={e => {
                const lines = e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
                setForm({ ...form, userIds: lines.length ? lines : [''] });
              }}
              placeholder={`Paste user IDs here, one per line or comma-separated:\n6a532b44149168eb11420d07\n6a5096875000ef73eece56b0`}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary font-mono resize-none"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Enter one MongoDB User ID per line, or paste multiple comma-separated.
            </p>
          </div> */}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {isSending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const itemsPerPage = 10;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminNotificationApi.getAllNotifications({
        page: currentPage,
        limit: itemsPerPage
      });
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
    <>
      <PageWrapper
        title="All Notifications"
        headerAction={
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors shadow-sm"
          >
            <Send size={15} />
            Send Bulk Notification
          </button>
        }
      >
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
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
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

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Notification Details</h3>
                <button onClick={() => setSelectedNotification(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
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
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
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

      {/* Bulk Notification Modal — rendered outside PageWrapper to avoid z-index issues */}
      {showBulkModal && (
        <BulkNotificationModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={fetchNotifications}
        />
      )}
    </>
  );
};
