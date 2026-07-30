import { useState, useEffect } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';
import { adminSettingsApi, type GeneralSettings, type TaxSettings, type ShippingSettings, type PaymentSettings } from '../../services/admin/adminSettings.Api';
import toast from 'react-hot-toast';
import { Loader2, Upload } from 'lucide-react';

interface FormErrors {
  siteName?: string;
  supportEmail?: string;
  currency?: string;
  supportPhone?: string;
}

export const AdminSettings = () => {
  const [settingsForm, setSettingsForm] = useState<GeneralSettings>({
    siteName: '',
    siteLogo: '',
    supportEmail: '',
    supportPhone: '',
    currency: 'INR',
    maintenanceMode: false
  });
  const [taxSettingsForm, setTaxSettingsForm] = useState<TaxSettings>({
    taxPercentage: 0,
    taxEnabled: false,
    taxIncludedInPrice: false
  });
  const [shippingSettingsForm, setShippingSettingsForm] = useState<ShippingSettings>({
    shippingCharge: 0,
    freeShippingEnabled: false,
    freeShippingMinOrderAmount: 0,
    estimatedDeliveryDays: 0
  });
  const [paymentSettingsForm, setPaymentSettingsForm] = useState<PaymentSettings>({
    cashOnDeliveryEnabled: false,
    razorpayEnabled: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    autoCapturePayment: false,
    refundEnabled: false
  });
  const [activeTab, setActiveTab] = useState<'general' | 'tax' | 'shipping' | 'payment'>('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const [genRes, taxRes, shippingRes, paymentRes] = await Promise.all([
        adminSettingsApi.getGeneralSettings().catch(() => ({ success: false, data: null })),
        adminSettingsApi.getTaxSettings().catch(() => ({ success: false, data: null })),
        adminSettingsApi.getShippingSettings().catch(() => ({ success: false, data: null })),
        adminSettingsApi.getPaymentSettings().catch(() => ({ success: false, data: null }))
      ]);

      if (genRes.success && genRes.data) {
        setSettingsForm({
          siteName: genRes.data.siteName || '',
          siteLogo: genRes.data.siteLogo || '',
          supportEmail: genRes.data.supportEmail || '',
          supportPhone: genRes.data.supportPhone || '',
          currency: genRes.data.currency || 'INR',
          maintenanceMode: genRes.data.maintenanceMode || false
        });
      }

      if (taxRes.success && taxRes.data) {
        setTaxSettingsForm({
          taxPercentage: taxRes.data.taxPercentage || 0,
          taxEnabled: taxRes.data.taxEnabled || false,
          taxIncludedInPrice: taxRes.data.taxIncludedInPrice || false
        });
      }

      if (shippingRes.success && shippingRes.data) {
        setShippingSettingsForm({
          shippingCharge: shippingRes.data.shippingCharge || 0,
          freeShippingEnabled: shippingRes.data.freeShippingEnabled || false,
          freeShippingMinOrderAmount: shippingRes.data.freeShippingMinOrderAmount || 0,
          estimatedDeliveryDays: shippingRes.data.estimatedDeliveryDays || 0
        });
      }

      if (paymentRes.success && paymentRes.data) {
        setPaymentSettingsForm({
          cashOnDeliveryEnabled: paymentRes.data.cashOnDeliveryEnabled || false,
          razorpayEnabled: paymentRes.data.razorpayEnabled || false,
          razorpayKeyId: paymentRes.data.razorpayKeyId || '',
          razorpayKeySecret: '', // Reset on fetch
          autoCapturePayment: paymentRes.data.autoCapturePayment || false,
          refundEnabled: paymentRes.data.refundEnabled || false
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!settingsForm.siteName.trim()) newErrors.siteName = 'Site name is required';
    if (!settingsForm.supportEmail.trim()) {
      newErrors.supportEmail = 'Support email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsForm.supportEmail)) {
      newErrors.supportEmail = 'Please enter a valid email address';
    }
    if (!settingsForm.currency.trim()) newErrors.currency = 'Currency is required';
    if (!settingsForm.supportPhone.trim()) newErrors.supportPhone = 'Support phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('siteName', settingsForm.siteName);
      formData.append('supportEmail', settingsForm.supportEmail);
      formData.append('supportPhone', settingsForm.supportPhone);
      formData.append('currency', settingsForm.currency);
      formData.append('maintenanceMode', settingsForm.maintenanceMode.toString());

      if (logoFile) {
        formData.append('siteLogo', logoFile);
      } else if (typeof settingsForm.siteLogo === 'string') {
        formData.append('siteLogo', settingsForm.siteLogo);
      }

      const response = await adminSettingsApi.updateGeneralSettings(formData);
      if (response.success) {
        toast.success(response.message || 'Settings updated successfully');
        fetchSettings(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const response = await adminSettingsApi.updateTaxSettings(taxSettingsForm);
      if (response.success) {
        toast.success(response.message || 'Tax settings updated successfully');
        fetchSettings(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tax settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const response = await adminSettingsApi.updateShippingSettings(shippingSettingsForm);
      if (response.success) {
        toast.success(response.message || 'Shipping settings updated successfully');
        fetchSettings(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update shipping settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      // Remove empty secret so it doesn't overwrite with empty string if not changed
      const payload = { ...paymentSettingsForm };
      if (!payload.razorpayKeySecret) {
        delete payload.razorpayKeySecret;
      }

      const response = await adminSettingsApi.updatePaymentSettings(payload);
      if (response.success) {
        toast.success(response.message || 'Payment settings updated successfully');
        fetchSettings(); // Refresh
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      // Show preview
      setSettingsForm({
        ...settingsForm,
        siteLogo: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Settings">
      <div className="max-w-2xl">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('general')}
          >
            General Settings
          </button>
          {/* <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'tax' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('tax')}
          >
            Tax Settings
          </button> */}
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'shipping' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping Settings
          </button>
          {/* <button
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'payment' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment Settings
          </button> */}
        </div>

        {activeTab === 'general' && (
          <form className="space-y-6" onSubmit={handleSettingsSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Logo</label>
              <div className="flex items-center gap-4">
                {settingsForm.siteLogo && typeof settingsForm.siteLogo === 'string' && (
                  <div className="w-24 h-24 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img src={settingsForm.siteLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center gap-2">
                  <Upload size={16} />
                  Upload Logo
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input type="text" value={settingsForm.siteName} onChange={e => {
                setSettingsForm({ ...settingsForm, siteName: e.target.value });
                if (errors.siteName) setErrors({ ...errors, siteName: undefined });
              }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.siteName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.siteName && <p className="mt-1 text-xs text-red-500">{errors.siteName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" value={settingsForm.supportEmail} onChange={e => {
                setSettingsForm({ ...settingsForm, supportEmail: e.target.value });
                if (errors.supportEmail) setErrors({ ...errors, supportEmail: undefined });
              }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.supportEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.supportEmail && <p className="mt-1 text-xs text-red-500">{errors.supportEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input type="text" value={settingsForm.supportPhone} onChange={e => {
                setSettingsForm({ ...settingsForm, supportPhone: e.target.value });
                if (errors.supportPhone) setErrors({ ...errors, supportPhone: undefined });
              }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.supportPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.supportPhone && <p className="mt-1 text-xs text-red-500">{errors.supportPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input type="text" value={settingsForm.currency} onChange={e => {
                setSettingsForm({ ...settingsForm, currency: e.target.value });
                if (errors.currency) setErrors({ ...errors, currency: undefined });
              }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.currency ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="e.g. INR, USD" />
              {errors.currency && <p className="mt-1 text-xs text-red-500">{errors.currency}</p>}
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settingsForm.maintenanceMode}
                onChange={e => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enable Maintenance Mode
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'tax' && (
          <form className="space-y-6" onSubmit={handleTaxSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxSettingsForm.taxPercentage}
                onChange={e => setTaxSettingsForm({ ...taxSettingsForm, taxPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="e.g. 18"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="taxEnabled"
                checked={taxSettingsForm.taxEnabled}
                onChange={e => setTaxSettingsForm({ ...taxSettingsForm, taxEnabled: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="taxEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enable Taxes
              </label>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="taxIncludedInPrice"
                checked={taxSettingsForm.taxIncludedInPrice}
                onChange={e => setTaxSettingsForm({ ...taxSettingsForm, taxIncludedInPrice: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="taxIncludedInPrice" className="text-sm font-medium text-gray-700 cursor-pointer">
                Prices Include Tax
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-0 pt-0 ml-7 -mt-2">(If enabled, the listed price includes the tax. Otherwise, tax is added at checkout.)</p>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Tax Settings'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'shipping' && (
          <form className="space-y-6" onSubmit={handleShippingSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Shipping Charge</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={shippingSettingsForm.shippingCharge}
                onChange={e => setShippingSettingsForm({ ...shippingSettingsForm, shippingCharge: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="e.g. 50"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="freeShippingEnabled"
                checked={shippingSettingsForm.freeShippingEnabled}
                onChange={e => setShippingSettingsForm({ ...shippingSettingsForm, freeShippingEnabled: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="freeShippingEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enable Free Shipping
              </label>
            </div>

            {shippingSettingsForm.freeShippingEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Minimum Order Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingSettingsForm.freeShippingMinOrderAmount}
                  onChange={e => setShippingSettingsForm({ ...shippingSettingsForm, freeShippingMinOrderAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="e.g. 999"
                />
                <p className="text-xs text-gray-500 mt-1">Orders above this amount will qualify for free shipping.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Days</label>
              <input
                type="number"
                min="1"
                step="1"
                value={shippingSettingsForm.estimatedDeliveryDays}
                onChange={e => setShippingSettingsForm({ ...shippingSettingsForm, estimatedDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="e.g. 5"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Shipping Settings'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'payment' && (
          <form className="space-y-6" onSubmit={handlePaymentSubmit} noValidate>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cash On Delivery (COD)</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cashOnDeliveryEnabled"
                  checked={paymentSettingsForm.cashOnDeliveryEnabled}
                  onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, cashOnDeliveryEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="cashOnDeliveryEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enable Cash On Delivery
                </label>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Razorpay Settings</h3>

              <div className="flex items-center gap-3 pb-2">
                <input
                  type="checkbox"
                  id="razorpayEnabled"
                  checked={paymentSettingsForm.razorpayEnabled}
                  onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, razorpayEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="razorpayEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enable Razorpay Gateway
                </label>
              </div>

              {paymentSettingsForm.razorpayEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                    <input
                      type="text"

                      onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, razorpayKeyId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter your razorpay key id"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      value={paymentSettingsForm.razorpayKeySecret}
                      onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, razorpayKeySecret: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Leave blank to keep existing secret"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Options</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoCapturePayment"
                  checked={paymentSettingsForm.autoCapturePayment}
                  onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, autoCapturePayment: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="autoCapturePayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Auto Capture Payment
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="refundEnabled"
                  checked={paymentSettingsForm.refundEnabled}
                  onChange={e => setPaymentSettingsForm({ ...paymentSettingsForm, refundEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="refundEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enable Automated Refunds
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Payment Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageWrapper>
  );
};
