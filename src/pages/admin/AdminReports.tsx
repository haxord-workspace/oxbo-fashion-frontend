import PageWrapper from '../../components/admin/PageWrapper';

export const AdminReports = () => (
  <PageWrapper title="Sales Reports">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Revenue Trends (Last 7 Days)</h3>
        <div className="h-48 flex items-end gap-2 justify-between mt-8">
          {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
            <div key={i} className="w-full bg-black hover:bg-[#e35a39] transition-colors rounded-t-sm" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Top Selling Categories</h3>
        <ul className="space-y-4">
          <li className="flex justify-between items-center"><span className="text-gray-600">Clothing</span><span className="font-medium">45%</span></li>
          <li className="flex justify-between items-center"><span className="text-gray-600">Accessories</span><span className="font-medium">25%</span></li>
          <li className="flex justify-between items-center"><span className="text-gray-600">Outerwear</span><span className="font-medium">20%</span></li>
          <li className="flex justify-between items-center"><span className="text-gray-600">Pants</span><span className="font-medium">10%</span></li>
        </ul>
      </div>
    </div>
  </PageWrapper>
);
