import PageWrapper from '../../components/admin/PageWrapper';

export const AdminDashboard = () => (
  <PageWrapper title="Dashboard">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
        <p className="text-3xl font-bold text-primary">Rs. 45,231</p>
      </div>
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
        <p className="text-3xl font-bold text-primary">128</p>
      </div>
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">Active Customers</p>
        <p className="text-3xl font-bold text-primary">842</p>
      </div>
    </div>
    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
      Chart Placeholder
    </div>
  </PageWrapper>
);
