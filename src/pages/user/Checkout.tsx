import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import { LoadingButton } from '../../components/common/LoadingButton';
import toast from 'react-hot-toast';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchCart, applyCouponAsync, removeCouponAsync } from '../../features/cart/cartSlice';
import { userOrdersApi } from '../../services/user/orders.Api';

import { userAddressesApi } from '../../services/user/addresses.Api';
import type { UserAddress } from '../../types/address';
import { CustomSelect, type Option } from '../../components/common/CustomSelect';

const STATE_OPTIONS: Option[] = [
  { value: '', label: '-- Select State --' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'union-territories-group', label: 'Union Territories', isGroup: true },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Delhi', label: 'Delhi (NCT)' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' }
];

const COUNTRY_OPTIONS: Option[] = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Other', label: 'Other' }
];

const ADDRESS_TYPE_OPTIONS: Option[] = [
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
  { value: 'other', label: 'Other' }
];

interface FormErrors {
  [key: string]: string | undefined;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressForm, setAddressForm] = useState<UserAddress>({
    type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', isDefault: true
  });
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  // Helper to load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const dispatch = useAppDispatch();
  const { items: cartItems, couponCode, appliedCoupon, isLoading } = useAppSelector((state) => state.cart);
  const [couponInput, setCouponInput] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
    
    // Fetch user addresses
    const fetchUserAddresses = async () => {
      try {
        const response: any = await userAddressesApi.getAddresses();
        const list = Array.isArray(response) ? response : (response.data?.data || response.data || []);
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddress = list.find((a: UserAddress) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddress._id || null);
        } else {
          setIsAddingAddress(true);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchUserAddresses();
  }, [dispatch]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = subtotal * (appliedCoupon.value / 100);
      if (appliedCoupon.maximumDiscount && discountAmount > appliedCoupon.maximumDiscount) {
        discountAmount = appliedCoupon.maximumDiscount;
      }
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    }
  }

  const shipping: number = cartItems.length > 0 ? 0 : 0; // Free shipping as per UI
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const validateCardForm = () => {
    if (!selectedAddressId && !isAddingAddress) {
      toast.error('Please select a delivery address');
      return false;
    }
    return true;
  };

  const validateAddressForm = () => {
    const newErrors: FormErrors = {};

    // Full Name — at least 3 characters
    if (!addressForm.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (addressForm.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    }

    // Phone — 10 digits (India), optionally prefixed with +91
    if (!addressForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digitsOnly = addressForm.phone.replace(/^\+91/, '').replace(/\s/g, '');
      if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
        newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
      }
    }

    // Address Line 1
    if (!addressForm.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    } else if (addressForm.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Address Line 1 must be at least 5 characters';
    }

    // City
    if (!addressForm.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s\-\.]+$/.test(addressForm.city.trim())) {
      newErrors.city = 'City must contain only letters';
    }

    // State
    if (!addressForm.state.trim()) {
      newErrors.state = 'State is required';
    } else if (!/^[a-zA-Z\s\-\.]+$/.test(addressForm.state.trim())) {
      newErrors.state = 'State must contain only letters';
    }

    // PIN / ZIP Code — 6 digits for India, 5-10 digits otherwise
    if (!addressForm.postalCode.trim()) {
      newErrors.postalCode = 'PIN/ZIP Code is required';
    } else if (addressForm.country === 'India' && !/^[1-9]\d{5}$/.test(addressForm.postalCode.trim())) {
      newErrors.postalCode = 'Enter a valid 6-digit Indian PIN code';
    } else if (addressForm.country !== 'India' && !/^\d{4,10}$/.test(addressForm.postalCode.trim())) {
      newErrors.postalCode = 'Enter a valid postal code (4–10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateAddressForm()) return false;
    
    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        const response: any = await userAddressesApi.updateAddress(editingAddressId, addressForm);
        const updatedAddress = response.data?.data || response.data || response;
        setAddresses(addresses.map(a => a._id === editingAddressId ? updatedAddress : a));
        setSelectedAddressId(updatedAddress._id);
        setIsAddingAddress(false);
        setEditingAddressId(null);
        setAddressForm({ type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', isDefault: true });
        toast.success('Address updated successfully');
        return updatedAddress._id;
      } else {
        const response: any = await userAddressesApi.addAddress(addressForm);
        const newAddress = response.data?.data || response.data || response;
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress._id);
        setIsAddingAddress(false);
        setAddressForm({ type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', isDefault: true });
        toast.success('Address saved successfully');
        return newAddress._id;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
      return null;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setAddressForm({
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      postalCode: address.postalCode,
      isDefault: address.isDefault || false
    });
    setEditingAddressId(address._id || null);
    setIsAddingAddress(true);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressToDelete(id);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    const id = addressToDelete;
    setIsDeletingAddress(id);
    try {
      await userAddressesApi.deleteAddress(id);
      setAddresses(addresses.filter(a => a._id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(addresses.find(a => a._id !== id)?._id || null);
      }
      toast.success('Address deleted successfully');
      setAddressToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setIsDeletingAddress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCardForm()) return;
    
    let finalAddressId = selectedAddressId;
    
    if (isAddingAddress) {
      finalAddressId = await handleSaveAddress();
      if (!finalAddressId) return; // Validation failed or API error
    } else if (!finalAddressId) {
      toast.error('Please select or add a shipping address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsSubmitting(false);
          return;
        }

        // 1. Create the order in the database first (as PENDING)
        const dbOrderRes: any = await userOrdersApi.createOrder({
          shippingAddressId: finalAddressId,
          paymentReference: 'PENDING_RAZORPAY',
          notes: ''
        });
        
        const orderData = dbOrderRes?.data?.data || dbOrderRes?.data || dbOrderRes;
        const myOrderId = orderData?._id || orderData?.id;

        if (!myOrderId) {
          toast.error('Failed to create order. Please try again.');
          setIsSubmitting(false);
          return;
        }

        // 2. Get Razorpay Order ID from backend
        const orderRes: any = await userOrdersApi.createRazorpayOrder({ orderId: myOrderId });
        const rzpOrderId = orderRes?.data?.razorpayOrder?.id || orderRes?.data?.id || orderRes?.id || orderRes?.razorpayOrderId;
        
        if (!rzpOrderId) {
          toast.error('Failed to initialize payment gateway.');
          setIsSubmitting(false);
          return;
        }

        // 3. Initialize Razorpay options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TFnF0Gb7WxO1Os', // Your public key
          amount: total * 100, // grandTotalInPaise
          currency: 'INR',
          name: "Oxbo Men's Wear",
          description: 'Payment for your order',
          order_id: rzpOrderId, // The ID you got from Step 2
          handler: async function (response: any) {
            try {
              // 4. Verify payment signature on backend
              await userOrdersApi.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              toast.success('Payment successful!');
              navigate('/orders');
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: {
            name: addresses.find((a: any) => a._id === finalAddressId)?.fullName || '',
            email: '',
            contact: addresses.find((a: any) => a._id === finalAddressId)?.phone || ''
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function() {
              setIsSubmitting(false);
              toast.error('Payment cancelled');
            }
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          toast.error(response.error.description);
          setIsSubmitting(false);
        });
        rzp1.open();
        
      } else {
        // COD logic
        await userOrdersApi.createOrder({
          shippingAddressId: finalAddressId,
          paymentReference: 'COD',
          notes: ''
        });
        
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim() || isLoading) return;
    dispatch(applyCouponAsync({ code: couponInput, cartTotal: subtotal }));
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCouponAsync());
    setCouponInput('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-xs sm:text-sm font-medium text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span className="hidden xs:inline">Back to Cart</span>
            <span className="xs:hidden">Back</span>
          </button>
          <h1 className="text-base sm:text-xl font-bold tracking-widest uppercase">Checkout</h1>
          <div className="w-12 sm:w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-24" noValidate>
          
          {/* Left Column - Shipping & Payment */}
          <div className="flex-1">
            <div className="mb-12">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 flex justify-between items-center">
                Shipping Address
                {!isAddingAddress && addresses.length > 0 && (
                  <button type="button" onClick={() => {
                    setAddressForm({ type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', isDefault: true });
                    setEditingAddressId(null);
                    setIsAddingAddress(true);
                  }} className="text-sm text-blue-600 font-medium hover:underline">
                    + Add New
                  </button>
                )}
              </h2>
              
              {isLoadingAddresses ? (
                <div className="py-8 text-center text-gray-500">Loading addresses...</div>
              ) : isAddingAddress ? (
                <div className="bg-gray-50 p-4 sm:p-6 border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Full Name</label>
                      <input
                        type="text" name="fullName" value={addressForm.fullName}
                        onChange={handleAddressChange}
                        className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Phone</label>
                      <input
                        type="tel" name="phone" value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="+91 9876543210"
                        className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Address Line 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Address Line 1</label>
                      <input
                        type="text" name="addressLine1" value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="Flat, House no., Building"
                        className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.addressLine1 && <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>}
                    </div>

                    {/* Address Line 2 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Address Line 2 <span className="normal-case text-gray-400">(optional)</span></label>
                      <input
                        type="text" name="addressLine2" value={addressForm.addressLine2}
                        onChange={handleAddressChange}
                        placeholder="Area, Colony, Street"
                        className="w-full border border-gray-300 rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none"
                      />
                    </div>

                    {/* PIN / ZIP Code */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">PIN / ZIP Code</label>
                      <input
                        type="tel" name="postalCode" value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        inputMode="numeric"
                        maxLength={6}
                        className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">City</label>
                      <input
                        type="text" name="city" value={addressForm.city}
                        onChange={handleAddressChange}
                        className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div className="relative z-[60]">
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">State</label>
                      {addressForm.country === 'India' ? (
                        <CustomSelect
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange as any}
                          options={STATE_OPTIONS}
                          error={!!errors.state}
                        />
                      ) : (
                        <input
                          type="text" name="state" value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="Enter state / province"
                          className={`w-full border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                        />
                      )}
                      {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                    </div>

                    {/* Address Type */}
                    <div className="relative z-[50]">
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Address Type</label>
                      <CustomSelect
                        name="type"
                        value={addressForm.type}
                        onChange={handleAddressChange as any}
                        options={ADDRESS_TYPE_OPTIONS}
                      />
                    </div>

                    {/* Country */}
                    <div className="relative z-[40]">
                      <label className="block text-xs font-medium text-gray-700 uppercase mb-1.5">Country</label>
                      <CustomSelect
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange as any}
                        options={COUNTRY_OPTIONS}
                      />
                    </div>

                  </div>

                  {/* Save / Cancel Buttons */}
                  <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setEditingAddressId(null);
                          setAddressForm({ type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '', isDefault: true });
                        }}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-sm font-bold uppercase hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={isSavingAddress}
                      className="w-full sm:w-auto px-6 py-3 bg-primary text-white text-sm font-bold uppercase hover:bg-gray-900 transition-colors"
                    >
                      {isSavingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </div>

              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map((address) => (
                    <label key={address._id} className={`block border ${selectedAddressId === address._id ? 'border-primary bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-colors relative`}>
                      <div className="flex items-start">
                        <input 
                          type="radio" 
                          name="selectedAddress" 
                          value={address._id} 
                          checked={selectedAddressId === address._id} 
                          onChange={() => setSelectedAddressId(address._id || null)}
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{address.fullName}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-200 text-[10px] font-bold uppercase tracking-wider rounded-sm">{address.type}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address);
                                }}
                                className="text-gray-500 hover:text-primary transition-colors p-1"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (address._id) {
                                    confirmDelete(address._id, e);
                                  }
                                }}
                                disabled={isDeletingAddress === address._id}
                                className={`text-gray-500 hover:text-red-500 transition-colors p-1 ${isDeletingAddress === address._id ? 'opacity-50' : ''}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{address.addressLine1} {address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                          <p className="text-gray-600 text-sm">{address.city}, {address.state}, {address.postalCode}</p>
                          <p className="text-gray-600 text-sm mt-1">{address.country}</p>
                          <p className="text-gray-900 font-medium text-sm mt-2">{address.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Payment Method</h2>
              <div className="space-y-4">
                <label className={`block border ${paymentMethod === 'razorpay' ? 'border-primary bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-colors`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="razorpay" 
                      checked={paymentMethod === 'razorpay'} 
                      onChange={() => setPaymentMethod('razorpay')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium uppercase tracking-wide">Razorpay (Online Payment)</span>
                  </div>
                  {paymentMethod === 'razorpay' && (
                    <div className="mt-4 ml-7 text-xs text-gray-500">
                      You will be redirected to Razorpay securely to complete your payment. UPI, Credit/Debit cards, and Netbanking are supported.
                    </div>
                  )}
                </label>

                <label className={`block border ${paymentMethod === 'cod' ? 'border-primary bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-colors`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium uppercase tracking-wide">Cash on Delivery (COD)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 p-5 sm:p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6">Order Summary</h2>
              
              <div className="space-y-6 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product.id + (item.selectedSize || '')} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-200 flex-shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase">{item.product.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                        {item.selectedSize && <p className="text-gray-500 text-xs">Size: {item.selectedSize}</p>}
                      </div>
                      <p className="text-sm font-medium">Rs. {item.product.price.toLocaleString('en-IN')}.00</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={!!couponCode}
                    placeholder="Enter code" 
                    className="flex-1 border rounded-none px-4 py-2 text-sm focus:outline-none border-gray-300 focus:border-primary"
                  />
                  {couponCode ? (
                    <button type="button" onClick={handleRemoveCoupon} className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-600 transition-colors">
                      Remove
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon} 
                      disabled={isLoading}
                      className={`text-white px-4 py-2 text-xs font-bold uppercase transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-gray-800'}`}
                    >
                      {isLoading ? 'Applying' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toLocaleString('en-IN')}.00</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount ({appliedCoupon.code}
                      {appliedCoupon.type === 'percentage' ? ` - ${appliedCoupon.value}%` : ''})
                    </span>
                    <span className="font-medium">- Rs. {discountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'FREE' : `Rs. ${shipping.toLocaleString('en-IN')}.00`}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-bold">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <LoadingButton 
                type="submit"
                isLoading={isSubmitting}
                className="w-full bg-primary text-white py-4 mt-8 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Place Order
              </LoadingButton>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeletingAddress && setAddressToDelete(null)}></div>
          <div className="relative bg-white p-6 max-w-sm w-full z-10 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold uppercase mb-2">Delete Address</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 border border-gray-300 text-sm font-bold uppercase hover:bg-gray-50 transition-colors"
                disabled={!!isDeletingAddress}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAddress}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase hover:bg-red-700 transition-colors"
                disabled={!!isDeletingAddress}
              >
                {isDeletingAddress ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
