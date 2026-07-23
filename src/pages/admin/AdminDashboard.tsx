import { useState, useEffect } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { useAppSelector } from '../../app/hooks';
import { selectIsStoreManager, selectIsAdmin } from '../../features/auth/authSlice';
import { adminDashboardApi } from '../../services/admin/adminDashboard.Api';
import { DollarSign, Users, Store as StoreIcon, ShoppingBag, AlertTriangle, Clock } from 'lucide-react';

export const AdminDashboard = () => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStoreManager = useAppSelector(selectIsStoreManager);
  
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        let data;
        if (isStoreManager) {
          data = await adminDashboardApi.getStoreManagerDashboard();
        } else if (isAdmin) {
          data = await adminDashboardApi.getSuperAdminDashboard();
        }
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin, isStoreManager]);

  if (isLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="text-gray-500 animate-pulse">Loading dashboard metrics...</div>
      </PageWrapper>
    );
  }

  if (!stats) {
    return (
      <PageWrapper title="Dashboard">
        <div className="text-gray-500">No data available</div>
      </PageWrapper>
    );
  }

  // Derived metrics
  const totalOrders = stats.ordersStatusCount?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;

  return (
    <PageWrapper title="Dashboard">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">Rs. {(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <StoreIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStores || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status Breakdown */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-gray-400" />
            Order Status
          </h3>
          <div className="space-y-4">
            {stats.ordersStatusCount?.map((status: any) => {
              const percentage = totalOrders > 0 ? (status.count / totalOrders) * 100 : 0;
              return (
                <div key={status._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{status._id}</span>
                    <span className="text-gray-500">{status.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status._id === 'Delivered' ? 'bg-green-500' : 
                        status._id === 'Pending' ? 'bg-yellow-500' : 
                        status._id === 'Cancelled' ? 'bg-red-500' : 
                        'bg-blue-500'
                      }`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {(!stats.ordersStatusCount || stats.ordersStatusCount.length === 0) && (
              <p className="text-gray-500 text-sm">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Low Stock Alerts
          </h3>
          <div className="overflow-x-auto">
            {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Product</th>
                    <th className="px-4 py-3">Store</th>
                    <th className="px-4 py-3 text-right">Available</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.lowStockAlerts.slice(0, 5).map((alert: any) => (
                    <tr key={alert._id}>
                      <td className="px-4 py-3 font-medium">
                        {alert.variantId?.sku || 'Unknown SKU'}
                        <div className="text-xs text-gray-500">
                          {alert.variantId?.attributes?.color} - {alert.variantId?.attributes?.size}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{alert.storeId?.name || 'Main Hub'}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">{alert.availableQuantity}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{alert.lowStockThreshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm">Inventory levels are healthy.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Clock size={20} className="text-gray-400" />
          Recent Orders
        </h3>
        <div className="overflow-x-auto">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-primary">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.shippingAddress?.fullName || 'Guest'}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.placedDate || order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">Rs. {(order.grandTotal || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No recent orders found.</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

