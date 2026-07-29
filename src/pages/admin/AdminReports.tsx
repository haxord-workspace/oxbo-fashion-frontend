import { useState, useEffect } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { adminReportsApi, type ReportParams } from '../../services/admin/adminReports.Api';
import { useAppSelector } from '../../app/hooks';
import { selectIsStoreManager } from '../../features/auth/authSlice';
import { 
  TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, Users, AlertTriangle, Clock, CreditCard, Award, Store, Download
} from 'lucide-react';

export const AdminReports = () => {
  const isStoreManager = useAppSelector(selectIsStoreManager);
  
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // States for each report
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: ReportParams = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const [sales, inventory, orders, customers, stores] = await Promise.all([
        adminReportsApi.getSalesReports(params).catch(() => null),
        adminReportsApi.getInventoryReports(params).catch(() => null),
        adminReportsApi.getOrderReports(params).catch(() => null),
        adminReportsApi.getCustomerReports(params).catch(() => null),
        adminReportsApi.getStoreReports(params).catch(() => null),
      ]);

      setSalesData(sales);
      setInventoryData(inventory);
      setOrderData(orders);
      setCustomerData(customers);
      setStoreData(stores);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const StatCard = ({ title, value, icon: Icon, subtext, type = 'neutral' }: any) => {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value || '0'}</h3>
          </div>
          <div className={`p-3 rounded-lg ${
            type === 'positive' ? 'bg-green-100 text-green-600' :
            type === 'negative' ? 'bg-red-100 text-red-600' :
            'bg-blue-50 text-blue-600'
          }`}>
            <Icon size={24} />
          </div>
        </div>
        {subtext && (
          <div className="mt-4 flex items-center text-sm">
            <span className={type === 'positive' ? 'text-green-600 font-medium' : type === 'negative' ? 'text-red-600 font-medium' : 'text-gray-500'}>
              {subtext}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <PageWrapper title="Analytics & Reports">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Crunching the numbers...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Safely extract values from API responses
  const totalRevenue = salesData?.overall?.totalRevenue ?? salesData?.totalRevenue ?? 0;
  const aov = salesData?.overall?.averageOrderValue ?? salesData?.averageOrderValue ?? 0;
  const refunds = salesData?.refunds?.totalRefundedAmount ?? (typeof salesData?.refunds === 'number' ? salesData.refunds : 0);
  
  let fulfillmentRateStr = orderData?.fulfillmentRate || orderData?.averageFulfillmentTime || 'N/A';
  if (orderData?.fulfillmentRate?.averageFulfillmentTimeMs !== undefined) {
    const hours = Math.round(orderData.fulfillmentRate.averageFulfillmentTimeMs / (1000 * 60 * 60));
    fulfillmentRateStr = `${hours} hrs`;
  }

  const getOrderStatusCount = (statusName: string) => {
    if (Array.isArray(orderData?.statusOverview)) {
      const statusObj = orderData.statusOverview.find((s: any) => s._id === statusName);
      if (statusObj) return statusObj.count;
    }
    return 0;
  };
  
  const pendingCount = getOrderStatusCount('Pending');
  const shippedCount = getOrderStatusCount('Shipped');
  const cancelledCount = getOrderStatusCount('Cancelled');

  const getCustomerTypeCount = (type: string) => {
    if (Array.isArray(customerData?.newVsReturning)) {
      const typeObj = customerData.newVsReturning.find((c: any) => c._id === type);
      if (typeObj) return typeObj.count;
    }
    return 0;
  };

  return (
    <PageWrapper title="Analytics & Reports">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-gray-600 print:hidden">Overview of your store's performance and key metrics.</p>
        <div className="flex gap-2 print:hidden">
          <input 
            type="date" 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <input 
            type="date" 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          type="positive"
        />
        <StatCard 
          title="Average Order Value" 
          value={`Rs. ${aov.toLocaleString()}`} 
          icon={TrendingUp} 
          type="neutral"
        />
        <StatCard 
          title="Avg. Fulfillment Time" 
          value={`${fulfillmentRateStr}`} 
          icon={Clock} 
          type="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Orders Status Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-[#e35a39]" />
              Order Status Breakdown
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-orange-600 text-sm font-semibold mb-1">Pending</p>
              <h4 className="text-2xl font-black text-orange-700">{pendingCount}</h4>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-600 text-sm font-semibold mb-1">Shipped</p>
              <h4 className="text-2xl font-black text-blue-700">{shippedCount}</h4>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600 text-sm font-semibold mb-1">Cancelled</p>
              <h4 className="text-2xl font-black text-red-700">{cancelledCount}</h4>
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-[#e35a39]" />
              Customer Metrics
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">New Customers</span>
              <span className="font-bold text-gray-900">{getCustomerTypeCount('New')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Returning Customers</span>
              <span className="font-bold text-gray-900">{getCustomerTypeCount('Returning')}</span>
            </div>
            
            {customerData?.topSpenders?.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-sm text-gray-900 mb-4">Top Spenders</h4>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {customerData.topSpenders.map((spencer: any, i: number) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                          {spencer.userInfo?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium text-sm">{spencer.userInfo?.firstName} {spencer.userInfo?.lastName}</p>
                          <p className="text-gray-500 text-xs">{spencer.orderCount} orders</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">Rs. {spencer.totalSpent?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" />
              Low Stock Alerts
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {inventoryData?.lowStockAlerts?.length > 0 ? (
              inventoryData.lowStockAlerts.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                  <span className="text-gray-700 font-medium">{item.variantId?.sku || item.name || 'Unknown Product'}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                    {item.availableQuantity || item.quantity || item.stock || 0} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">No low stock alerts right now.</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-yellow-500" />
              Top Selling Products
            </h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {inventoryData?.topProducts?.length > 0 ? (
              inventoryData.topProducts.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{item.productName || item.name || 'Unknown Product'}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.totalQuantitySold || item.sold || 0} sold</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">Not enough data for top sellers.</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods & Store Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" />
              Payment Methods
            </h3>
          </div>
          <div className="space-y-4">
            {salesData?.paymentMethods ? (
              Object.entries(salesData.paymentMethods).map(([method, amount]: any, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium capitalize">{method}</span>
                  <span className="font-bold text-gray-900">Rs. {Number(amount).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4">No payment method data.</p>
            )}
          </div>
        </div>

        {/* Store Comparison (More useful for Super Admin) */}
        {!isStoreManager && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Store size={20} className="text-purple-500" />
                Store Comparison
              </h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {storeData?.storePerformance?.length > 0 ? (
                storeData.storePerformance.map((store: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                    <span className="text-gray-700 font-medium">{store.name || store.storeName || 'Unknown Store'}</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Rs. {(store.revenue || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{store.orders || 0} orders</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No store performance data available.</p>
              )}
            </div>
          </div>
        )}
      </div>

    </PageWrapper>
  );
};
