import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Building, Mail, Phone, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    companyName: 'Brightloop Software',
    brandName: 'SmartSub',
    tagline: 'Unified Subscription Management System',
    contactEmail: 'support@brightloop.com',
    contactPhone: '+91 98765 43210',
    address: 'Brightloop Tower, Sector 62, Bangalore, India',
    gstNumber: '29ABCDE1234F1Z5',
    taxRatePercent: 18,
    currency: 'INR',
    currencySymbol: '₹',
    testPaymentMode: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        if (res.data.settings) setSettings(res.data.settings);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">System & Company Settings</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          Configure Brightloop Software corporate information, default GST tax percentages, and gateway parameters.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#2E9467] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Application settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] space-y-6 text-xs">
        {/* Company Identity */}
        <div>
          <h3 className="text-sm font-bold text-[#34243A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E6DDEC]">
            Company Identity & Branding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#34243A] mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] mb-1">Application Brand Title</label>
              <input
                type="text"
                required
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div>
          <h3 className="text-sm font-bold text-[#34243A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E6DDEC]">
            Official Contact & Office
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#34243A] mb-1">Support Email Address</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] mb-1">Support Phone Helpline</label>
              <input
                type="text"
                required
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-bold text-[#34243A] mb-1">Headquarters Registered Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>
        </div>

        {/* Tax and Currency */}
        <div>
          <h3 className="text-sm font-bold text-[#34243A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E6DDEC]">
            Fiscal, Tax & Gateway Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-[#34243A] mb-1">GSTIN Number</label>
              <input
                type="text"
                required
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono font-bold focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.taxRatePercent}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] mb-1">Default Currency</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  disabled
                  value="INR (₹)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-[#F3EFFF] text-[#673B70] font-bold"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-[#F3EFFF] border border-[#D8C2E5] flex items-center justify-between">
            <div>
              <p className="font-bold text-[#34243A]">Development Test Payment Mode</p>
              <p className="text-[11px] text-[#81758A]">
                When enabled, checkout executes through instant test simulation without requiring external payment gateway keys.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.testPaymentMode}
                onChange={(e) => setSettings({ ...settings, testPaymentMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#673B70]"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6DDEC] flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
