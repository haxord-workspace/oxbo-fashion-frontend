import React, { useState, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCurrentUser, logout, updateUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { authApi } from '../services/authApi';
import { useNavigate } from 'react-router-dom';
import { Loader2, Camera, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropUtils';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  pincode?: string;
  address?: string;
}

const Profile: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    profileImage: user?.profileImage || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      const response = await authApi.logout();
      dispatch(logout());
      toast.success(response.message || 'Logged out successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Logout failed');
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last Name is required';
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.pincode && !/^\d{4,8}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid pincode';
    }
    if (formData.address && formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authApi.updateProfile(user._id || user.id || '', formData);
      dispatch(updateUser(response.user));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsCropping(true);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        setFormData({ ...formData, profileImage: croppedImage });
        setIsCropping(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  };

  if (!user) {
    return null;
  }

  const avatarUrl = formData.profileImage || user.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(`${user.firstName} ${user.lastName}`) + "&background=random";

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white p-6 max-w-md w-full relative flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold uppercase tracking-wider">Crop Image</h3>
              <button onClick={() => setIsCropping(false)} className="text-gray-500 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative flex-1 bg-gray-900 w-full mb-4">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <button
                onClick={handleCropSave}
                className="w-full bg-black text-white font-bold py-3 uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 border border-gray-200">
          {!isEditing ? (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex-shrink-0">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white border rounded-xl border-black text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                  Edit Profile
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {user.phone && (
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                      <span className="block mt-1 font-medium text-gray-800">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Address</span>
                      <span className="block mt-1 font-medium text-gray-800">{user.address}</span>
                    </div>
                  )}
                  {user.pincode && (
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Pincode</span>
                      <span className="block mt-1 font-medium text-gray-800">{user.pincode}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 flex justify-center md:justify-start">
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto rounded-xl px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8 text-left" noValidate>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-black">Edit Profile</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to actual user data
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      pincode: user.pincode || '',
                      profileImage: user.profileImage || '',
                    });
                    setErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img 
                    src={avatarUrl} 
                    alt="Profile Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm transition-opacity group-hover:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={onFileChange}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-bold uppercase tracking-wider text-black hover:underline"
                >
                  Change Photo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({...formData, firstName: e.target.value});
                      if (errors.firstName) setErrors({...errors, firstName: undefined});
                    }}
                    className={`mt-1 block w-full rounded-none border px-3 py-2 focus:outline-none sm:text-sm ${
                      errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
                    }`}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({...formData, lastName: e.target.value});
                      if (errors.lastName) setErrors({...errors, lastName: undefined});
                    }}
                    className={`mt-1 block w-full rounded-none border px-3 py-2 focus:outline-none sm:text-sm ${
                      errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
                    }`}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      if (errors.phone) setErrors({...errors, phone: undefined});
                    }}
                    className={`mt-1 block w-full rounded-none border px-3 py-2 focus:outline-none sm:text-sm ${
                      errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      setFormData({...formData, pincode: e.target.value});
                      if (errors.pincode) setErrors({...errors, pincode: undefined});
                    }}
                    className={`mt-1 block w-full rounded-none border px-3 py-2 focus:outline-none sm:text-sm ${
                      errors.pincode ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
                    }`}
                  />
                  {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                  <textarea
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({...formData, address: e.target.value});
                      if (errors.address) setErrors({...errors, address: undefined});
                    }}
                    className={`mt-1 block w-full rounded-none border px-3 py-2 focus:outline-none sm:text-sm ${
                      errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      pincode: user.pincode || '',
                      profileImage: user.profileImage || '',
                    });
                    setErrors({});
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mr-4 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 uppercase tracking-wider"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {!isEditing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-white border border-gray-200 py-4 text-center text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors shadow-sm"
            >
              View Order History
            </button>
            
            <button
              onClick={() => navigate('/wishlist')}
              className="w-full bg-white border border-gray-200 py-4 text-center text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors shadow-sm"
            >
              My Wishlist
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
