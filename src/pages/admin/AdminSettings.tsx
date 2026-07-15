import { useState } from 'react';
import PageWrapper from '../../components/admin/PageWrapper';

interface FormErrors {
  storeName?: string;
  supportEmail?: string;
  currencySymbol?: string;
}

export const AdminSettings = () => {
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'Oxbo Fashion',
    supportEmail: 'support@oxbo.com',
    currencySymbol: 'Rs.'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!settingsForm.storeName.trim()) newErrors.storeName = 'Store name is required';
    if (!settingsForm.supportEmail.trim()) {
      newErrors.supportEmail = 'Support email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsForm.supportEmail)) {
      newErrors.supportEmail = 'Please enter a valid email address';
    }
    if (!settingsForm.currencySymbol.trim()) newErrors.currencySymbol = 'Currency symbol is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Save settings logic here
  };

  return (
  <PageWrapper title="Settings">
    <div className="max-w-2xl">
      <form className="space-y-6" onSubmit={handleSettingsSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input type="text" value={settingsForm.storeName} onChange={e => {
            setSettingsForm({...settingsForm, storeName: e.target.value});
            if (errors.storeName) setErrors({...errors, storeName: undefined});
          }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.storeName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} />
          {errors.storeName && <p className="mt-1 text-xs text-red-500">{errors.storeName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
          <input type="email" value={settingsForm.supportEmail} onChange={e => {
            setSettingsForm({...settingsForm, supportEmail: e.target.value});
            if (errors.supportEmail) setErrors({...errors, supportEmail: undefined});
          }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.supportEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} />
          {errors.supportEmail && <p className="mt-1 text-xs text-red-500">{errors.supportEmail}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
          <input type="text" value={settingsForm.currencySymbol} onChange={e => {
            setSettingsForm({...settingsForm, currencySymbol: e.target.value});
            if (errors.currencySymbol) setErrors({...errors, currencySymbol: undefined});
          }} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${errors.currencySymbol ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} />
          {errors.currencySymbol && <p className="mt-1 text-xs text-red-500">{errors.currencySymbol}</p>}
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  </PageWrapper>
  );
};
