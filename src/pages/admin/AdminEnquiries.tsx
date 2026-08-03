import { useState, useEffect } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { Search, Mail, Calendar, CheckCircle, Loader2, X } from 'lucide-react';
import { adminEnquiryApi, type Enquiry } from '../../services/admin/adminEnquiry.Api';
import toast from 'react-hot-toast';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await adminEnquiryApi.getEnquiries();
      // Handle the cases where response might be nested or direct array
      if (Array.isArray(response.enquiries)) {
        setEnquiries(response.enquiries);
      } else if (Array.isArray(response)) {
        setEnquiries(response);
      } else {
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminEnquiryApi.markAsRead(id);
      toast.success('Marked as read');
      setEnquiries(prev => prev.map(enq => enq._id === id ? { ...enq, status: 'read' } : enq));
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleRowClick = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    if (enquiry.status !== 'read') {
      handleMarkAsRead(enquiry._id);
    }
  };

  const filteredEnquiries = enquiries.filter(enq => 
    enq.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    enq.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper title="Customer Enquiries">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-gray-600">Manage and respond to customer enquiries and contact forms.</p>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search enquiries..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer Details</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enquiry) => (
                  <tr 
                    key={enquiry._id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(enquiry)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1">{enquiry.name}</div>
                      <div className="flex items-center text-xs text-gray-500 gap-1 mb-1">
                        <Mail size={12} /> {enquiry.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="text-sm text-gray-800 line-clamp-3">{enquiry.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600 gap-1 whitespace-nowrap">
                        <Calendar size={14} />
                        {new Date(enquiry.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        enquiry.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {enquiry.status === 'read' ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {enquiry.status !== 'read' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(enquiry._id);
                          }}
                          className="text-gray-400 hover:text-green-600 transition-colors" 
                          title="Mark as Read"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Message Details</h3>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <a href={`mailto:${selectedEnquiry.email}`} className="text-primary hover:underline font-medium">{selectedEnquiry.email}</a>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(selectedEnquiry.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    selectedEnquiry.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedEnquiry.status === 'read' ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Content</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedEnquiry(null)}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
