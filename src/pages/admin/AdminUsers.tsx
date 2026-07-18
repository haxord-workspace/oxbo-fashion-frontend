import { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Search, Loader2, X, AlertTriangle, Plus, Image as ImageIcon, Eye, EyeOff, Bell } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { ImageCropper } from '../../components/common/ImageCropper';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import { adminUserApi } from '../../services/admin/adminUser.Api';
import { adminNotificationApi } from '../../services/admin/adminNotification.Api';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerStats, setCustomerStats] = useState<{
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    newCustomersThisMonth: number;
  } | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Modal States
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [orderSummary, setOrderSummary] = useState<{ orderCount: number, totalPurchaseAmount: number } | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [userToNotify, setUserToNotify] = useState<User | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'system',
    channel: 'email',
    priority: 'normal'
  });
  const [notificationErrors, setNotificationErrors] = useState<{ title?: string; message?: string }>({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User> & { password?: string }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'CUSTOMER',
    password: ''
  });
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await adminUserApi.getAllUsers(params);
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const stats = await adminUserApi.getCustomerStatistics();
        setCustomerStats(stats);
      } catch (err: any) {
        console.error('Failed to fetch customer stats', err);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getRoleBadge = (user: User) => {
    const roleName = user.roleId?.name || user.role || 'user';
    const lowerRole = roleName.toLowerCase();

    if (lowerRole.includes('super admin')) {
      return { text: 'Super Admin', className: 'bg-purple-100 text-purple-700' };
    }
    if (lowerRole.includes('store manager')) {
      return { text: 'Store Manager', className: 'bg-blue-100 text-blue-700' };
    }
    if (lowerRole.includes('admin')) {
      return { text: 'Admin', className: 'bg-purple-100 text-purple-700' };
    }
    if (lowerRole.includes('customer')) {
      return { text: 'Customer', className: 'bg-gray-100 text-gray-700' };
    }

    return { text: roleName, className: 'bg-gray-100 text-gray-700' };
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await adminUserApi.deleteUser(userToDelete);
      toast.success(response.message || 'User deleted successfully');
      setUsers(users.filter(u => (u._id || u.id) !== userToDelete));
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const validateEditForm = () => {
    if (!userToEdit) return false;
    const newErrors: FormErrors = {};
    if (!userToEdit.firstName?.trim()) newErrors.firstName = 'First Name is required';
    if (!userToEdit.lastName?.trim()) newErrors.lastName = 'Last Name is required';
    if (!userToEdit.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userToEdit.email)) {
      newErrors.email = 'Valid email is required';
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    if (!validateEditForm()) return;
    setIsEditing(true);

    try {
      const userId = userToEdit._id || userToEdit.id;
      if (!userId) return;
      const response = await adminUserApi.updateUser(userId, userToEdit);
      toast.success(response.message || 'User updated successfully');
      setUsers(users.map(u => (u._id || u.id) === userId ? { ...u, ...userToEdit } : u));
      setUserToEdit(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  };

  const validateCreateForm = () => {
    const newErrors: FormErrors = {};
    if (!newUser.firstName?.trim()) newErrors.firstName = 'First Name is required';
    if (!newUser.lastName?.trim()) newErrors.lastName = 'Last Name is required';
    if (!newUser.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!newUser.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    setCreateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;
    setIsCreating(true);

    try {
      const payload: any = { ...newUser };
      if (payload.role === '6a4cb6298643931db473ae84') {
        payload.roleId = payload.role;
        payload.roleName = 'Store Manager';
        delete payload.role;
      } else if (payload.role === '6a4c9d66477aee2f5fa8c820') {
        payload.roleId = payload.role;
        payload.roleName = 'Super Admin';
        delete payload.role;
      } else {
        payload.role = 'CUSTOMER';
        payload.roleName = 'CUSTOMER';
      }

      if (profileImagePreview) {
        payload.profileImage = profileImagePreview;
      }

      const response = await adminUserApi.createUser(payload);
      toast.success(response.message || 'User created successfully');
      if (response.user) {
        fetchUsers();
      } else {
        fetchUsers();
      }
      setIsCreateModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'CUSTOMER', password: '' });
      setProfileImagePreview(null);
      setCreateErrors({});
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u._id || u.id || '').filter(id => id));
    }
  };

  const handleToggleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    const isBulk = !userToNotify && selectedUserIds.length > 0;
    if (!userToNotify && !isBulk) return;
    const newErrors: any = {};
    if (!notificationForm.title.trim()) newErrors.title = 'Title is required';
    if (!notificationForm.message.trim()) newErrors.message = 'Message is required';
    if (Object.keys(newErrors).length > 0) {
      setNotificationErrors(newErrors);
      return;
    }

    setIsSendingNotification(true);
    try {
      if (isBulk) {
        await adminNotificationApi.sendBulkNotification({
          userIds: selectedUserIds,
          ...notificationForm
        });
        toast.success('Bulk notifications sent successfully');
        setSelectedUserIds([]);
      } else if (userToNotify) {
        await adminNotificationApi.sendNotification({
          userId: userToNotify._id || userToNotify.id || '',
          ...notificationForm
        });
        toast.success('Notification sent successfully');
      }
      setIsNotificationModalOpen(false);
      setNotificationForm({
        title: '',
        message: '',
        type: 'system',
        channel: 'email',
        priority: 'normal'
      });
      setUserToNotify(null);
    } catch (err: any) {
      toast.error(err.message || err.error || 'Failed to send notification');
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <PageWrapper title="Users">
      {/* Customer Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
          <div className="flex items-center gap-2">
            {isStatsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{customerStats?.totalCustomers || 0}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Active Customers</p>
          <div className="flex items-center gap-2">
            {isStatsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <p className="text-3xl font-bold text-green-600">{customerStats?.activeCustomers || 0}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">Inactive Customers</p>
          <div className="flex items-center gap-2">
            {isStatsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <p className="text-3xl font-bold text-red-500">{customerStats?.inactiveCustomers || 0}</p>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-500 mb-1">New This Month</p>
          <div className="flex items-center gap-2">
            {isStatsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <p className="text-3xl font-bold text-blue-600">+{customerStats?.newCustomersThisMonth || 0}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
          />
        </div>
        <div className="flex gap-2">
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => {
                setUserToNotify(null);
                setIsNotificationModalOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Send Bulk Notification ({selectedUserIds.length})
            </button>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="pb-3 font-medium px-4 w-12">
                <input 
                  type="checkbox" 
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
              </th>
              <th className="pb-3 font-medium px-4">User</th>
              <th className="pb-3 font-medium px-4">Role</th>
              <th className="pb-3 font-medium px-4">Status</th>
              <th className="pb-3 font-medium px-4">Joined Date</th>
              <th className="pb-3 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user._id || user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input 
                      type="checkbox" 
                      checked={selectedUserIds.includes(user._id || user.id || '')}
                      onChange={() => handleToggleSelect(user._id || user.id || '')}
                      className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-4 flex items-center gap-3">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.firstName} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {user.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 capitalize text-gray-600">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(user).className}`}>
                      {getRoleBadge(user).text}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setUserToNotify(user);
                          setIsNotificationModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors" title="Send Notification">
                        <Bell size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          const userId = user._id || user.id || '';
                          try {
                            const details = await adminUserApi.getCustomerById(userId);
                            setUserToView(details);
                          } catch(err) {
                            setUserToView(user);
                          }
                          setIsViewing(true);
                          setIsOrdersLoading(true);
                          try {
                            const [orders, summary] = await Promise.all([
                              adminUserApi.getCustomerOrders(userId),
                              adminUserApi.getCustomerOrderSummary(userId)
                            ]);
                            setUserOrders(orders);
                            setOrderSummary(summary);
                          } catch(e) {
                            setUserOrders([]);
                            setOrderSummary(null);
                          } finally {
                            setIsOrdersLoading(false);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setUserToEdit(user)}
                        className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setUserToDelete(user._id || user.id || '')}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalUsers > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalUsers}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">Delete User</h3>
            <p className="text-center text-gray-500 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setUserToEdit(null);
                  setEditErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={userToEdit.firstName}
                    onChange={e => {
                      setUserToEdit({ ...userToEdit, firstName: e.target.value });
                      if (editErrors.firstName) setEditErrors({ ...editErrors, firstName: undefined });
                    }}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${editErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                      }`}
                  />
                  {editErrors.firstName && <p className="mt-1 text-xs text-red-500">{editErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={userToEdit.lastName}
                    onChange={e => {
                      setUserToEdit({ ...userToEdit, lastName: e.target.value });
                      if (editErrors.lastName) setEditErrors({ ...editErrors, lastName: undefined });
                    }}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${editErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                      }`}
                  />
                  {editErrors.lastName && <p className="mt-1 text-xs text-red-500">{editErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userToEdit.email}
                  onChange={e => {
                    setUserToEdit({ ...userToEdit, email: e.target.value });
                    if (editErrors.email) setEditErrors({ ...editErrors, email: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${editErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                    }`}
                />
                {editErrors.email && <p className="mt-1 text-xs text-red-500">{editErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userToEdit.roleId?._id || userToEdit.role || 'CUSTOMER'}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'CUSTOMER') {
                        setUserToEdit({ ...userToEdit, role: 'CUSTOMER', roleId: null as any });
                      } else if (val === '6a4cb6298643931db473ae84') {
                        setUserToEdit({ ...userToEdit, roleId: { _id: val, name: 'Store Manager' }, role: undefined });
                      } else if (val === '6a4c9d66477aee2f5fa8c820') {
                        setUserToEdit({ ...userToEdit, roleId: { _id: val, name: 'Super Admin' }, role: undefined });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="6a4cb6298643931db473ae84">Store Manager</option>
                    <option value="6a4c9d66477aee2f5fa8c820">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={userToEdit.isActive !== false ? 'active' : 'inactive'}
                    onChange={e => setUserToEdit({ ...userToEdit, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setUserToEdit(null);
                    setEditErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 px-4 py-2.5 text-white bg-black hover:bg-gray-900 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {isViewing && userToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button 
                onClick={() => {
                  setUserToView(null);
                  setIsViewing(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                {userToView.profileImage ? (
                  <img src={userToView.profileImage} alt={userToView.firstName} className="w-20 h-20 rounded-full object-cover bg-gray-100 border-2 border-gray-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 border-2 border-gray-200">
                    {userToView.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{userToView.firstName} {userToView.lastName}</h4>
                  <p className="text-sm text-gray-500">{userToView.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(userToView).className}`}>
                      {getRoleBadge(userToView).text}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${userToView.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {userToView.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500 font-medium">Joined Date</span>
                  <span className="text-sm text-gray-900 col-span-2">{userToView.createdAt ? new Date(userToView.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm text-gray-500 font-medium">ID</span>
                  <span className="text-sm text-gray-900 col-span-2 font-mono">{userToView._id || userToView.id}</span>
                </div>
                {(userToView.address || userToView.pincode) && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500 font-medium">Address</span>
                    <span className="text-sm text-gray-900 col-span-2">
                      {userToView.address} {userToView.pincode && ` - ${userToView.pincode}`}
                    </span>
                  </div>
                )}
                {userToView.phone && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500 font-medium">Phone</span>
                    <span className="text-sm text-gray-900 col-span-2">{userToView.phone}</span>
                  </div>
                )}
              </div>

              {/* Orders Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center">
                    Recent Orders
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{userOrders.length}</span>
                  </h4>
                </div>

                {!isOrdersLoading && orderSummary && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col justify-center">
                      <p className="text-xs font-medium text-gray-500 mb-1">Total Orders</p>
                      <p className="text-lg font-bold text-gray-900">{orderSummary.orderCount}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col justify-center">
                      <p className="text-xs font-medium text-gray-500 mb-1">Total Spent</p>
                      <p className="text-lg font-bold text-green-600">Rs. {orderSummary.totalPurchaseAmount?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                )}

                {isOrdersLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : userOrders.length > 0 ? (
                  <div className="space-y-2">
                    {userOrders.map((order, idx) => (
                      <div key={order._id || idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-mono text-gray-500 mb-0.5">#{order.orderId || order._id?.substring(0, 8)}</p>
                          <p className="text-sm font-medium text-gray-900">
                            {order.totalAmount ? `Rs. ${order.totalAmount}` : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500">No orders found for this customer.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button
                onClick={() => {
                  setUserToView(null);
                  setIsViewing(false);
                }}
                className="px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  
                  setProfileImagePreview(null);
                  setNewUser({ firstName: '', lastName: '', email: '', role: 'CUSTOMER', password: '' });
                  setCreateErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-full bg-gray-100 border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={22} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:transition-colors cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Recommended size: 400x400px · Max 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={e => {
                      setNewUser({ ...newUser, firstName: e.target.value });
                      if (createErrors.firstName) setCreateErrors({ ...createErrors, firstName: undefined });
                    }}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${createErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                      }`}
                  />
                  {createErrors.firstName && <p className="mt-1 text-xs text-red-500">{createErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={e => {
                      setNewUser({ ...newUser, lastName: e.target.value });
                      if (createErrors.lastName) setCreateErrors({ ...createErrors, lastName: undefined });
                    }}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${createErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                      }`}
                  />
                  {createErrors.lastName && <p className="mt-1 text-xs text-red-500">{createErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => {
                    setNewUser({ ...newUser, email: e.target.value });
                    if (createErrors.email) setCreateErrors({ ...createErrors, email: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${createErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                    }`}
                />
                {createErrors.email && <p className="mt-1 text-xs text-red-500">{createErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password || ''}
                    onChange={e => {
                      setNewUser({ ...newUser, password: e.target.value });
                      if (createErrors.password) setCreateErrors({ ...createErrors, password: undefined });
                    }}
                    className={`w-full px-4 py-2 pr-10 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${createErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {createErrors.password && <p className="mt-1 text-xs text-red-500">{createErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role || 'CUSTOMER'}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="6a4cb6298643931db473ae84">Store Manager</option>
                  <option value="6a4c9d66477aee2f5fa8c820">Super Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    
                    setProfileImagePreview(null);
                    setNewUser({ firstName: '', lastName: '', email: '', role: 'CUSTOMER', password: '' });
                    setCreateErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 text-white bg-black hover:bg-gray-900 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={(croppedFile) => {
            setProfileImagePreview(URL.createObjectURL(croppedFile));
            setCropImageSrc(null);
          }}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={1}
        />
      )}

      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
              <button
                onClick={() => {
                  setIsNotificationModalOpen(false);
                  setNotificationForm({ title: '', message: '', type: 'system', channel: 'email', priority: 'normal' });
                  setNotificationErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="p-6 space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={e => {
                    setNotificationForm({ ...notificationForm, title: e.target.value });
                    if (notificationErrors.title) setNotificationErrors({ ...notificationErrors, title: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${notificationErrors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                    }`}
                />
                {notificationErrors.title && <p className="mt-1 text-xs text-red-500">{notificationErrors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={e => {
                    setNotificationForm({ ...notificationForm, message: e.target.value });
                    if (notificationErrors.message) setNotificationErrors({ ...notificationErrors, message: undefined });
                  }}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${notificationErrors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-black'
                    }`}
                />
                {notificationErrors.message && <p className="mt-1 text-xs text-red-500">{notificationErrors.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={e => setNotificationForm({ ...notificationForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white text-sm"
                  >
                    <option value="system">System</option>
                    <option value="promotional">Promotional</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={notificationForm.channel}
                    onChange={e => setNotificationForm({ ...notificationForm, channel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={e => setNotificationForm({ ...notificationForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationModalOpen(false);
                    setNotificationForm({ title: '', message: '', type: 'system', channel: 'email', priority: 'normal' });
                    setNotificationErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  disabled={isSendingNotification}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingNotification}
                  className="flex-1 px-4 py-2.5 text-white bg-black hover:bg-gray-900 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isSendingNotification ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
