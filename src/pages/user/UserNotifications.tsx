import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Loader2,
  Bell,
  CheckCircle,
  Trash2,
  CheckCheck,
  X,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  BellRing,
} from 'lucide-react';
import { userNotificationsApi } from '../../services/user/notifications.Api';
import { useFcmNotification } from '../../hooks/useFcmNotification';
import toast from 'react-hot-toast';

const isNotificationRead = (notif: any): boolean => {
  if (!notif) return false;
  return Boolean(
    notif.isRead === true ||
    notif.isRead === 'true' ||
    notif.read === true ||
    notif.read === 'true' ||
    notif.is_read === true ||
    notif.is_read === 'true' ||
    notif.status === 'read' ||
    notif.status === 'Read' ||
    (notif.readAt != null && notif.readAt !== '')
  );
};

export const UserNotifications = () => {
  const navigate = useNavigate();
  const { permission, requestPermission, isRegistering } = useFcmNotification();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
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
        : (notifsData?.notifications || notifsData?.data || notifsData?.docs || []);
        
      const normalizedArray = (Array.isArray(notifsArray) ? notifsArray : []).map((notif: any) => ({
        ...notif,
        isRead: isNotificationRead(notif),
      }));

      setNotifications(normalizedArray);

      const total =
        notifsData?.total ??
        notifsData?.totalDocs ??
        notifsData?.totalNotifications ??
        notifsData?.count ??
        notifsData?.pagination?.total ??
        response?.total ??
        response?.count ??
        normalizedArray.length;
      setTotalNotifications(total);
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
          (notif._id || notif.id) === id
            ? { ...notif, isRead: true, read: true, is_read: true, status: 'read', readAt: new Date().toISOString() }
            : notif
        )
      );
      window.dispatchEvent(new Event('notificationsRead'));
      toast.success('Notification marked as read');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const markAsReadSilently = async (id: string) => {
    try {
      await userNotificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          (notif._id || notif.id) === id
            ? { ...notif, isRead: true, read: true, is_read: true, status: 'read', readAt: new Date().toISOString() }
            : notif
        )
      );
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {
      console.error('Failed to mark notification as read silently', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading('read-all');
    try {
      await userNotificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
          read: true,
          is_read: true,
          status: 'read',
          readAt: new Date().toISOString(),
        }))
      );
      window.dispatchEvent(new Event('notificationsRead'));
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

  const isCartNotification = (notif: any): boolean => {
    if (!notif) return false;
    const type = String(notif.type || '').toLowerCase();
    const title = String(notif.title || '').toLowerCase();
    const message = String(notif.message || '').toLowerCase();
    const link = String(notif.actionUrl || notif.link || notif.url || '').toLowerCase();

    if (
      type.includes('cart') ||
      type.includes('recovery') ||
      type.includes('abandoned') ||
      link.includes('cart')
    ) {
      return true;
    }

    const cartKeywords = [
      'cart',
      'shopping bag',
      'stylish behind',
      'left something',
      'left items',
      'checkout',
      'resume your checkout',
      'items behind',
      'in your bag',
      'in your cart',
    ];

    return cartKeywords.some((kw) => title.includes(kw) || message.includes(kw));
  };

  const getNotificationTargetUrl = (notif: any): string | null => {
    if (!notif) return null;
    if (isCartNotification(notif)) return '/cart';
    if (notif.actionUrl) return notif.actionUrl;
    if (notif.link) return notif.link;
    if (notif.url) return notif.url;
    return null;
  };

  const handleNavigateToUrl = (notif: any, url: string) => {
    const id = notif?._id || notif?.id;
    if (id && !notif.isRead) {
      markAsReadSilently(id);
    }
    setSelectedNotification(null);
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  const handleNavigateToCart = (notif?: any) => {
    const target = notif || selectedNotification;
    handleNavigateToUrl(target, '/cart');
  };

  const renderMessageContent = (message: string, notif: any, targetUrl: string | null) => {
    if (!message) return null;
    if (!targetUrl) return message;

    const linkRegex = /(click here(?: to resume your checkout)?|resume your checkout|view your cart|go to cart)/gi;
    if (linkRegex.test(message)) {
      const parts = message.split(linkRegex);
      return (
        <span>
          {parts.map((part, idx) => {
            if (linkRegex.test(part)) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToUrl(notif, targetUrl);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-black transition-colors cursor-pointer mx-1"
                >
                  {part}
                  <ArrowRight className="w-3.5 h-3.5 inline shrink-0" />
                </button>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </span>
      );
    }

    return message;
  };

  const totalPages = Math.ceil(totalNotifications / itemsPerPage) || 1;
  const hasUnread = notifications.some((n) => !isNotificationRead(n));

  // Use frontend pagination if the backend returns all items instead of a paginated list
  const displayedNotifications = notifications.length > itemsPerPage 
    ? notifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : notifications;

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {totalNotifications > 0
                ? `Showing ${displayedNotifications.length} of ${totalNotifications} notification${totalNotifications !== 1 ? 's' : ''}`
                : 'No notifications'}
            </p>
          </div>
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

        {permission !== 'granted' && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-600 text-white rounded-xl shadow-sm shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Enable Push Notifications</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Get instant alerts on your desktop or phone for abandoned cart reminders, order updates, and offers.
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              disabled={isRegistering}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
              <span>Enable Notifications</span>
            </button>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 border border-gray-200 rounded-xl shadow-sm">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center text-gray-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading your notifications...</span>
            </div>
          ) : displayedNotifications.length > 0 ? (
            <div className="space-y-4">
              {displayedNotifications.map((notification, index) => {
                const id = notification._id || notification.id || index;
                const isRead = notification.isRead;
                const isCart = isCartNotification(notification);

                return (
                  <div
                    key={id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                      isRead
                        ? 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        : 'bg-white border-primary border-opacity-30 shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div
                      className={`p-3 rounded-full shrink-0 ${
                        isRead
                          ? 'bg-gray-200 text-gray-500'
                          : isCart
                          ? 'bg-amber-600 text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {isCart ? <ShoppingCart size={20} /> : <Bell size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-base font-bold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          {isCart && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <ShoppingCart className="w-3 h-3" />
                              Cart Reminder
                            </span>
                          )}
                        </div>
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
                      <p className={`text-sm ${isRead ? 'text-gray-500' : 'text-gray-700'} line-clamp-2`}>
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0 shrink-0">
                      {isCart && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToCart(notification);
                          }}
                          title="Navigate to Cart"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Go to Cart</span>
                        </button>
                      )}
                      {!isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(id);
                          }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(id);
                        }}
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
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedNotification && (() => {
        const isCart = isCartNotification(selectedNotification);
        const targetUrl = getNotificationTargetUrl(selectedNotification);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNotification(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isCart ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                    {isCart ? <ShoppingCart className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isCart ? 'Cart Reminder' : 'Notification Details'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</h4>
                  <p className="text-gray-900 font-semibold text-lg">{selectedNotification.title}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message</h4>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {renderMessageContent(selectedNotification.message, selectedNotification, targetUrl)}
                  </div>
                </div>

                {/* Abandoned Cart Action Card */}
                {isCart && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-sm shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-gray-900">Items waiting in your bag</h5>
                        <p className="text-xs text-gray-600">Your selected items are still reserved for you.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateToCart(selectedNotification)}
                      className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Resume Checkout</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span>
                      {selectedNotification.createdAt
                        ? new Date(selectedNotification.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={selectedNotification.isRead ? 'text-gray-500' : 'text-primary font-medium'}>
                      {selectedNotification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Close
                </button>

                {isCart ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateToCart(selectedNotification)}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2 group cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Go to Cart</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : targetUrl ? (
                  <button
                    type="button"
                    onClick={() => handleNavigateToUrl(selectedNotification, targetUrl)}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2 group cursor-pointer"
                  >
                    <span>View Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default UserNotifications;
