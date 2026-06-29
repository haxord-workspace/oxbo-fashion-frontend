import React from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCurrentUser, logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) {
    return null;
  }

  // Dummy avatar image
  const avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">

        
        <div className="bg-white p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
              />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 mt-1">{user.email}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">User ID</span>
                  <span className="block mt-1 font-medium text-gray-800">{user.id}</span>
                </div>
                {user.mobileNumber && (
                  <div>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</span>
                    <span className="block mt-1 font-medium text-gray-800">{user.mobileNumber}</span>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Role</span>
                  <span className="block mt-1 font-medium text-gray-800 capitalize">Customer</span>
                </div>
                 <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Address</span>
                  <span className="block mt-1 font-medium text-gray-800">thrisurr punnayukulam near royal hospital ,kerala ,678004</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Pincode</span>
                  <span className="block mt-1 font-medium text-gray-800">678004</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">phone number</span>
                  <span className="block mt-1 font-medium text-gray-800">9876543210</span>
                </div>
                 
              </div>
              
              <div className="pt-6 flex justify-center md:justify-start">
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
