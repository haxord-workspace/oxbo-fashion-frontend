import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import AdminModal from '../../components/common/AdminModal';
import { LoadingButton } from '../../components/common/LoadingButton';
import { adminAbandonedCartApi } from '../../services/admin/adminAbandonedCart.Api';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  RefreshCw,
  Send,
  Settings,
  CheckCircle2,
  Clock,
  Eye,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Mail,
  Bell,
  Sparkles,
  Search,
  RotateCcw,
  Tag,
  AlertCircle,
  Percent,
} from 'lucide-react';
import type {
  AbandonedCart,
  AbandonedCartStats,
  AbandonedCartSettings,
  AbandonedCartStatus,
  NotificationChannel
} from '../../types';

export const AdminAbandonedCarts: React.FC = () => {
  // Stats & Listing State
  const [stats, setStats] = useState<AbandonedCartStats>({
    totalAbandoned: 0,
    totalRecovered: 0,
    totalRecoveredRevenue: 0,
    conversionRate: 0,
    activeCount: 0,
  });
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [totalCarts, setTotalCarts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCarts / itemsPerPage) || 1;

  // Trigger Action States
  const [isScanning, setIsScanning] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  // Modals State
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Reminder Modal Form State
  const [reminderChannel, setReminderChannel] = useState<'both' | NotificationChannel>('both');
  const [reminderCoupon, setReminderCoupon] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<AbandonedCartSettings>({
    isEnabled: true,
    abandonmentThresholdMinutes: 60,
    recoveryTokenExpiryDays: 7,
    maxReminders: 3,
    stages: [
      {
        stageNumber: 1,
        delayMinutes: 60,
        channels: ['email', 'push'],
        emailSubject: 'Did you leave something behind in your cart?',
        discountCouponCode: '',
        discountPercentage: 0,
        isEnabled: true,
      },
      {
        stageNumber: 2,
        delayMinutes: 1440,
        channels: ['email', 'push'],
        emailSubject: 'Special 10% Off: Complete your OXBO order today!',
        discountCouponCode: 'RECOVER10',
        discountPercentage: 10,
        isEnabled: true,
      },
      {
        stageNumber: 3,
        delayMinutes: 4320,
        channels: ['email'],
        emailSubject: 'Final Notice: Your cart is about to expire!',
        discountCouponCode: '',
        discountPercentage: 0,
        isEnabled: true,
      },
    ],
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await adminAbandonedCartApi.getAbandonedCartStats();
      setStats(res);
    } catch (error: any) {
      console.error('Failed to fetch abandoned cart stats', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch Abandoned Carts
  const fetchCarts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminAbandonedCartApi.getAbandonedCarts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setCarts(res.carts || []);
      setTotalCarts(res.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch abandoned carts', error);
      toast.error(error?.response?.data?.message || 'Failed to load abandoned carts');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const res = await adminAbandonedCartApi.getSettings();
      if (res) {
        setSettings({
          isEnabled: res.isEnabled ?? true,
          abandonmentThresholdMinutes: res.abandonmentThresholdMinutes ?? 60,
          recoveryTokenExpiryDays: res.recoveryTokenExpiryDays ?? 7,
          maxReminders: res.maxReminders ?? 3,
          stages: res.stages?.length ? res.stages : settings.stages,
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch abandoned cart settings', error);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  // Trigger Cart Scan Now
  const handleScanNow = async () => {
    try {
      setIsScanning(true);
      const res = await adminAbandonedCartApi.scanNow();
      toast.success(res.message || 'Cart scan executed successfully!');
      fetchCarts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to trigger scan');
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Notifications Dispatch Now
  const handleDispatchNow = async () => {
    try {
      setIsDispatching(true);
      const res = await adminAbandonedCartApi.dispatchNow();
      toast.success(res.message || 'Recovery notifications dispatched!');
      fetchCarts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to dispatch notifications');
    } finally {
      setIsDispatching(false);
    }
  };

  // Copy Recovery Link
  const handleCopyRecoveryLink = (cart: AbandonedCart) => {
    const recoveryUrl = cart.recoveryUrl || (cart.recoveryToken ? `${window.location.origin}/checkout?recoveryToken=${cart.recoveryToken}` : '');
    if (!recoveryUrl) {
      toast.error('Recovery link not available for this cart');
      return;
    }
    navigator.clipboard.writeText(recoveryUrl);
    setCopiedTokenId(cart._id);
    toast.success('1-Click Recovery Link copied to clipboard!');
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  // Open Details Modal
  const handleOpenDetails = async (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setIsDetailsModalOpen(true);
    try {
      const detailed = await adminAbandonedCartApi.getAbandonedCartById(cart._id);
      if (detailed) {
        setSelectedCart(detailed);
      }
    } catch (err) {
      // Keep selectedCart from listing if deep fetch fails
    }
  };

  // Open Reminder Modal
  const handleOpenReminder = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setReminderChannel('both');
    setReminderCoupon(cart.currentStage >= 1 ? 'RECOVER10' : '');
    setReminderMessage('');
    setIsReminderModalOpen(true);
  };

  // Send Manual Recovery Reminder
  const handleSendReminder = async () => {
    if (!selectedCart) return;
    try {
      setIsSendingReminder(true);
      const res = await adminAbandonedCartApi.sendRecovery(selectedCart._id, {
        channel: reminderChannel,
        couponCode: reminderCoupon.trim() || undefined,
        customMessage: reminderMessage.trim() || undefined,
      });
      toast.success(res.message || 'Recovery notification dispatched successfully!');
      setIsReminderModalOpen(false);
      fetchCarts();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send recovery reminder');
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Open Settings Modal
  const handleOpenSettings = () => {
    fetchSettings();
    setIsSettingsModalOpen(true);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation: delayMinutes must be >= 15 for all stages (backend requirement)
    const invalidStage = settings.stages?.find(
      (stage) => stage.delayMinutes === undefined || stage.delayMinutes < 15
    );
    if (invalidStage) {
      toast.error(
        `Stage ${invalidStage.stageNumber} delay must be at least 15 minutes (currently ${invalidStage.delayMinutes ?? 0}m).`
      );
      return;
    }

    try {
      setIsSavingSettings(true);
      const res = await adminAbandonedCartApi.updateSettings(settings);
      toast.success(res.message || 'Campaign automation settings saved!');
      setIsSettingsModalOpen(false);
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const errorDetails = apiErrors.map((err: any) => err.message).join(' | ');
        toast.error(`Validation error: ${errorDetails}`);
      } else {
        toast.error(error?.response?.data?.message || 'Failed to save settings');
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Helper formatting
  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getCustomerName = (cart: AbandonedCart): string => {
    if (typeof cart.userId === 'object' && cart.userId !== null) {
      if (cart.userId.name) return cart.userId.name;
      if (cart.userId.firstName) return `${cart.userId.firstName} ${cart.userId.lastName || ''}`.trim();
      return cart.userId.email || 'Customer';
    }
    return 'Registered Customer';
  };

  const getCustomerEmail = (cart: AbandonedCart): string => {
    if (typeof cart.userId === 'object' && cart.userId !== null) {
      return cart.userId.email || '';
    }
    return '';
  };

  const getCustomerPhone = (cart: AbandonedCart): string => {
    if (typeof cart.userId === 'object' && cart.userId !== null) {
      return cart.userId.phone || '';
    }
    return '';
  };

  const calculateCartTotal = (cart: AbandonedCart): number => {
    if (cart.grandTotal !== undefined && cart.grandTotal > 0) return cart.grandTotal;
    if (cart.cartTotal !== undefined && cart.cartTotal > 0) return cart.cartTotal;
    if (cart.subtotal !== undefined && cart.subtotal > 0) return cart.subtotal;
    if (Array.isArray(cart.items)) {
      return cart.items.reduce((acc, item) => acc + (item.subtotal || ((item.price ?? item.unitPrice ?? 0) * item.quantity) || 0), 0);
    }
    return 0;
  };

  const renderStatusBadge = (status: AbandonedCartStatus) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" /> Recovered
          </span>
        );
      case 'notified':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Mail size={12} className="mr-1" /> Notified
          </span>
        );
      case 'notification_pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} className="mr-1" /> Scheduled
          </span>
        );
      case 'abandoned':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            <AlertCircle size={12} className="mr-1" /> Abandoned
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Expired
          </span>
        );
      case 'unsubscribed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Opted Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const renderStageBadge = (stage: number) => {
    switch (stage) {
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            Stage 0: Detected
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800">
            Stage 1: Nudge
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
            Stage 2: 10% Voucher
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Stage 3: Urgency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            Stage {stage}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageWrapper
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingCart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {stats.activeCount} Active
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Automated multi-stage drip recovery campaigns, revenue attribution & executive analytics
              </p>
            </div>
          </div>
        }
        headerAction={
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleScanNow}
              disabled={isScanning}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-primary transition-all disabled:opacity-60 shadow-sm"
              title="Detect carts inactive past threshold"
            >
              <RotateCcw size={16} className={`mr-2 ${isScanning ? 'animate-spin text-primary' : 'text-gray-500'}`} />
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </button>

            <button
              onClick={handleDispatchNow}
              disabled={isDispatching}
              className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-primary transition-all disabled:opacity-60 shadow-sm"
              title="Run reminder dispatcher cycle immediately"
            >
              <Send size={16} className={`mr-2 ${isDispatching ? 'animate-pulse text-primary' : 'text-gray-500'}`} />
              {isDispatching ? 'Dispatching...' : 'Dispatch Reminders'}
            </button>

            <button
              onClick={handleOpenSettings}
              className="inline-flex items-center px-3.5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              <Settings size={16} className="mr-2" />
              Campaign Settings
            </button>
          </div>
        }
      >
        {/* Executive Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Abandoned */}
          <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Total Abandoned</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {isStatsLoading ? '...' : stats.totalAbandoned.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShoppingCart size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
              <span className="inline-flex items-center font-semibold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded">
                {stats.activeCount}
              </span>
              <span>awaiting recovery action</span>
            </div>
          </div>

          {/* Recovered Carts */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Recovered Carts</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {isStatsLoading ? '...' : stats.totalRecovered.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <Sparkles size={14} />
              <span>Converted via automated reminders</span>
            </div>
          </div>

          {/* Recovered Revenue */}
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Recovered Revenue</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {isStatsLoading ? '...' : formatCurrency(stats.totalRecoveredRevenue)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-blue-700 font-medium">
              <TrendingUp size={14} />
              <span>Attributed directly to completed checkouts</span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Recovery Rate</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {isStatsLoading ? '...' : `${Number(stats.conversionRate).toFixed(1)}%`}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Percent size={22} />
              </div>
            </div>
            <div className="mt-3 w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.conversionRate))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by customer name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer text-gray-700"
            >
              <option value="all">All Statuses</option>
              <option value="abandoned">Abandoned</option>
              <option value="notification_pending">Scheduled (Pending)</option>
              <option value="notified">Notified</option>
              <option value="recovered">Recovered</option>
              <option value="expired">Expired</option>
              <option value="unsubscribed">Opted Out</option>
            </select>

            <button
              onClick={() => {
                fetchCarts();
                fetchStats();
              }}
              className="p-2 border border-gray-300 bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh table"
            >
              <RefreshCw size={17} className={isLoading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </div>

        {/* Abandoned Carts Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Cart Items</th>
                <th className="px-5 py-3.5">Cart Total</th>
                <th className="px-5 py-3.5">Campaign Stage</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date Abandoned</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw size={28} className="animate-spin text-primary mb-2" />
                      <p className="text-sm font-medium">Loading abandoned carts...</p>
                    </div>
                  </td>
                </tr>
              ) : carts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart size={40} className="text-gray-300 mb-2 stroke-[1.5]" />
                      <p className="text-base font-semibold text-gray-800">No abandoned carts found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Carts inactive past the threshold or matching your search filter will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                carts.map((cart) => {
                  const customerName = getCustomerName(cart);
                  const customerEmail = getCustomerEmail(cart);
                  const customerPhone = getCustomerPhone(cart);
                  const total = calculateCartTotal(cart);
                  const itemCount = cart.items?.length || 0;
                  const firstItem = cart.items?.[0];

                  return (
                    <tr key={cart._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{customerName}</div>
                            {customerEmail && (
                              <div className="text-xs text-gray-500 truncate max-w-[180px]">{customerEmail}</div>
                            )}
                            {customerPhone && (
                              <div className="text-xs text-gray-400">{customerPhone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Items Preview */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {firstItem?.thumbnail ? (
                            <img
                              src={firstItem.thumbnail}
                              alt={firstItem.name || firstItem.productName || 'Product'}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-50"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                              <Tag size={16} />
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {firstItem?.name || firstItem?.productName || `${itemCount} Product(s)`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {firstItem ? (
                                <>
                                  {(firstItem.size || (firstItem.sku ? firstItem.sku.split('-').slice(-1)[0] : '')) && (
                                    <span>Size: {firstItem.size || (firstItem.sku ? firstItem.sku.split('-').slice(-1)[0] : '')} · </span>
                                  )}
                                  <span>Qty: {firstItem.quantity}</span>
                                </>
                              ) : null}
                              {itemCount > 1 && (
                                <span className="ml-1 text-primary font-medium">+{itemCount - 1} more</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cart Total */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{formatCurrency(total)}</div>
                        {cart.isRecovered && cart.recoveredAmount && (
                          <div className="text-xs text-emerald-600 font-medium">
                            Recovered: {formatCurrency(cart.recoveredAmount)}
                          </div>
                        )}
                      </td>

                      {/* Campaign Stage */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {renderStageBadge(cart.currentStage)}
                          {cart.nextNotificationScheduledAt && cart.status !== 'recovered' && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> Next: {new Date(cart.nextNotificationScheduledAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(cart.status)}
                      </td>

                      {/* Date Abandoned */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div>{new Date(cart.createdAt).toLocaleDateString()}</div>
                        <div className="text-[11px] text-gray-400">
                          {new Date(cart.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Recovery Link */}
                          <button
                            onClick={() => handleCopyRecoveryLink(cart)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy 1-Click Recovery Link"
                          >
                            {copiedTokenId === cart._id ? (
                              <Check size={16} className="text-emerald-600" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>

                          {/* Manual Send Recovery Notification */}
                          {!cart.isRecovered && cart.status !== 'unsubscribed' && (
                            <button
                              onClick={() => handleOpenReminder(cart)}
                              className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                              title="Send Recovery Reminder"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          {/* View Details Modal */}
                          <button
                            onClick={() => handleOpenDetails(cart)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Cart Snapshot & History"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCarts > 0 && (
          <div className="mt-4">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCarts}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </PageWrapper>

      {/* ========================================================================= */}
      {/* 1. CART DETAILS & SNAPSHOT MODAL */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Abandoned Cart Snapshot & Telemetry"
        maxWidth="max-w-3xl"
      >
        {selectedCart && (
          <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {getCustomerName(selectedCart).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{getCustomerName(selectedCart)}</h4>
                  <p className="text-xs text-gray-500">{getCustomerEmail(selectedCart)}</p>
                  {getCustomerPhone(selectedCart) && (
                    <p className="text-xs text-gray-400">{getCustomerPhone(selectedCart)}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(selectedCart.status)}
                  {renderStageBadge(selectedCart.currentStage)}
                </div>
                <p className="text-xs text-gray-500">
                  Cart Total:{' '}
                  <span className="font-bold text-gray-900 text-sm">
                    {formatCurrency(calculateCartTotal(selectedCart))}
                  </span>
                </p>
              </div>
            </div>

            {/* Recovery Attribution Alert (If Recovered) */}
            {selectedCart.isRecovered && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-xs text-emerald-900">
                  <p className="font-bold text-sm">Successfully Recovered & Attributed!</p>
                  <p className="mt-0.5">
                    Order Total:{' '}
                    <span className="font-semibold">{formatCurrency(selectedCart.recoveredAmount)}</span>
                    {typeof selectedCart.recoveredOrderId === 'object' && selectedCart.recoveredOrderId?.orderNumber
                      ? ` · Order #${selectedCart.recoveredOrderId.orderNumber}`
                      : ''}
                  </p>
                </div>
              </div>
            )}

            {/* 1-Click Recovery Link Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 truncate">
                <span className="font-semibold shrink-0">1-Click Recovery Link:</span>
                <span className="font-mono text-gray-500 truncate">
                  {selectedCart.recoveryUrl || (selectedCart.recoveryToken ? `${window.location.origin}/checkout?recoveryToken=${selectedCart.recoveryToken}` : '')}
                </span>
              </div>
              <button
                onClick={() => handleCopyRecoveryLink(selectedCart)}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors shrink-0"
              >
                <Copy size={13} className="mr-1" />
                Copy Link
              </button>
            </div>

            {/* Drip Campaign Cadence Progress */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Drip Campaign Cadence Progress
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Stage 1 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    selectedCart.currentStage >= 1
                      ? 'bg-sky-50/50 border-sky-200 text-sky-900'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Stage 1: Gentle Nudge</span>
                    {selectedCart.currentStage >= 1 && <Check size={14} className="text-sky-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500">1 Hour Inactivity</p>
                  <p className="mt-1 text-gray-600">Cart item thumbnails, specs & CTA</p>
                </div>

                {/* Stage 2 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    selectedCart.currentStage >= 2
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Stage 2: Incentive</span>
                    {selectedCart.currentStage >= 2 && <Check size={14} className="text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500">24 Hours Inactivity</p>
                  <p className="mt-1 text-gray-600">10% Recovery voucher (RECOVER10)</p>
                </div>

                {/* Stage 3 */}
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    selectedCart.currentStage >= 3
                      ? 'bg-purple-50/50 border-purple-200 text-purple-900'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Stage 3: Urgency</span>
                    {selectedCart.currentStage >= 3 && <Check size={14} className="text-purple-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500">72 Hours Inactivity</p>
                  <p className="mt-1 text-gray-600">Stock urgency & impending expiration</p>
                </div>
              </div>
            </div>

            {/* Itemized Cart Snapshot */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Abandoned Cart Items ({selectedCart.items?.length || 0})
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {selectedCart.items && selectedCart.items.length > 0 ? (
                  selectedCart.items.map((item, idx) => {
                    const itemTitle = item.name || item.productName || 'Product';
                    const itemSize = item.size || (item.sku ? item.sku.split('-').slice(-1)[0] : '');
                    const itemPrice = item.price ?? item.unitPrice ?? 0;
                    const itemSubtotal = item.subtotal || itemPrice * item.quantity;

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={itemTitle}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                              <Tag size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{itemTitle}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {itemSize && <span>Size: {itemSize}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(itemSubtotal)}
                          </div>
                          <div className="text-xs text-gray-400">{formatCurrency(itemPrice)} each</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-gray-400 text-xs">No item snapshot available</div>
                )}
              </div>
            </div>

            {/* Notification Audit History */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Notification History & Telemetry ({selectedCart.notificationHistory?.length || 0})
              </h4>
              {selectedCart.notificationHistory && selectedCart.notificationHistory.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {selectedCart.notificationHistory.map((entry, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                          {entry.channel === 'email' ? <Mail size={15} /> : <Bell size={15} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            Stage {entry.stage}: {entry.channel} Notification
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {entry.sentAt || entry.timestamp
                              ? new Date(entry.sentAt || entry.timestamp || '').toLocaleString()
                              : 'Timestamp unavailable'}
                          </p>
                          {entry.couponCode && (
                            <span className="inline-block mt-0.5 text-[10px] font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                              Promo: {entry.couponCode}
                            </span>
                          )}
                          {entry.errorMessage && (
                            <p className="text-rose-600 text-[11px] mt-0.5">{entry.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          entry.status === 'sent' || entry.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : entry.status === 'clicked'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500">
                  No notifications dispatched yet for this cart.
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* ========================================================================= */}
      {/* 2. SEND CUSTOM RECOVERY REMINDER MODAL */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Dispatch Custom Recovery Reminder"
        maxWidth="max-w-lg"
      >
        {selectedCart && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <p className="text-gray-500">Sending to:</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{getCustomerName(selectedCart)}</p>
              <p className="text-gray-600">{getCustomerEmail(selectedCart)}</p>
              <p className="mt-1 text-primary font-semibold">
                Cart Total: {formatCurrency(calculateCartTotal(selectedCart))}
              </p>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Notification Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderChannel('both')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    reminderChannel === 'both'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Sparkles size={14} /> Both (Email & Push)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderChannel('email')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    reminderChannel === 'email'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Mail size={14} /> Email Only
                </button>
                <button
                  type="button"
                  onClick={() => setReminderChannel('push')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    reminderChannel === 'push'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Bell size={14} /> Push Only
                </button>
              </div>
            </div>

            {/* Discount Coupon Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Incentive Coupon Voucher (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. RECOVER10 or OXBOVIP"
                  value={reminderCoupon}
                  onChange={(e) => setReminderCoupon(e.target.value.toUpperCase())}
                  className="w-full pl-3 pr-24 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setReminderCoupon('RECOVER10')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline px-2 py-1"
                >
                  + RECOVER10
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Coupon will be automatically embedded into the 1-click recovery URL.
              </p>
            </div>

            {/* Custom Message / Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Custom Message / Headline (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add an extra personalized touch or leave empty to use standard drip template..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <LoadingButton
                type="button"
                onClick={handleSendReminder}
                isLoading={isSendingReminder}
                className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center shadow-sm"
              >
                <Send size={15} className="mr-1.5" />
                Dispatch Now
              </LoadingButton>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ========================================================================= */}
      {/* 3. CAMPAIGN AUTOMATION SETTINGS MODAL */}
      {/* ========================================================================= */}
      <AdminModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Abandoned Cart Automation & Cadence Settings"
        maxWidth="max-w-2xl"
      >
        {isLoadingSettings ? (
          <div className="py-12 text-center text-gray-500">
            <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Loading campaign settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Global Automation Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Automated Recovery Campaigns</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Toggle automated detection, scheduled cron dispatcher, and multi-stage drip reminders.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isEnabled}
                  onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Core Timers & Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Inactivity Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={15}
                    max={1440}
                    value={settings.abandonmentThresholdMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        abandonmentThresholdMinutes: Number(e.target.value) || 60,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mins</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Default: 60 mins</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Token Lifespan
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.recoveryTokenExpiryDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        recoveryTokenExpiryDays: Number(e.target.value) || 7,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">days</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Default: 7 days</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Max Reminders
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={settings.maxReminders}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxReminders: Number(e.target.value) || 3,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">msgs</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Default: 3 per cycle</p>
              </div>
            </div>

            {/* Stages Configuration */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Multi-Stage Cadence Configuration
              </h4>
              <div className="space-y-3">
                {settings.stages?.map((stage, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {stage.stageNumber}
                        </span>
                        <h5 className="font-semibold text-gray-900 text-sm">
                          Stage {stage.stageNumber}: {stage.stageNumber === 1 ? 'Gentle Nudge' : stage.stageNumber === 2 ? 'Value Incentive' : 'Inventory Urgency'}
                        </h5>
                      </div>
                      <label className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-gray-600">
                        <input
                          type="checkbox"
                          checked={stage.isEnabled}
                          onChange={(e) => {
                            const newStages = [...settings.stages];
                            newStages[idx].isEnabled = e.target.checked;
                            setSettings({ ...settings, stages: newStages });
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        Enabled
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-medium text-gray-600">Delay (Minutes from Inactivity)</label>
                          <span className="text-[10px] text-amber-600 font-medium">Min: 15 mins</span>
                        </div>
                        <input
                          type="number"
                          min={15}
                          value={stage.delayMinutes}
                          onChange={(e) => {
                            const newStages = [...settings.stages];
                            newStages[idx].delayMinutes = Number(e.target.value) || 0;
                            setSettings({ ...settings, stages: newStages });
                          }}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary ${
                            stage.delayMinutes < 15 ? 'border-amber-400 bg-amber-50/30' : 'border-gray-300'
                          }`}
                        />
                        {stage.delayMinutes < 15 && (
                          <p className="text-[10px] text-amber-600 mt-1">Must be 15 minutes or more</p>
                        )}
                      </div>

                      <div>
                        <label className="block font-medium text-gray-600 mb-1">Coupon Code (Optional)</label>
                        <input
                          type="text"
                          value={stage.discountCouponCode || ''}
                          onChange={(e) => {
                            const newStages = [...settings.stages];
                            newStages[idx].discountCouponCode = e.target.value.toUpperCase();
                            setSettings({ ...settings, stages: newStages });
                          }}
                          placeholder="e.g. RECOVER10"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-medium text-gray-600 mb-1">Email Subject Line</label>
                        <input
                          type="text"
                          value={stage.emailSubject}
                          onChange={(e) => {
                            const newStages = [...settings.stages];
                            newStages[idx].emailSubject = e.target.value;
                            setSettings({ ...settings, stages: newStages });
                          }}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <LoadingButton
                type="submit"
                isLoading={isSavingSettings}
                className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
              >
                Save Settings
              </LoadingButton>
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
};
