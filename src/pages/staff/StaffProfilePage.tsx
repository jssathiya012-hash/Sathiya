import React, { useState } from 'react';
import { UserCheck, Lock, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';

export const StaffProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (newPassword && newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('New passwords do not match.');
      return;
    }

    try {
      const payload: any = { name, phone };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await api.put('/auth/profile', payload);
      updateUser({ name, phone });
      setIsError(false);
      setMessage('Staff profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Staff Account Profile</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          View your staff credentials, designated permissions, and update login password.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            isError ? 'bg-rose-50 text-[#D85B69] border border-rose-200' : 'bg-emerald-50 text-[#2E9467] border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-[#E6DDEC]">
          <div className="w-16 h-16 rounded-2xl bg-[#673B70] text-white flex items-center justify-center font-black text-xl shadow-sm">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="text-lg font-black text-[#34243A]">{user?.name}</h3>
            <p className="text-xs text-[#81758A]">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E9DDF2] text-[#4B2455] font-bold text-[10px] border border-[#D8C2E5]">
                STAFF MEMBER
              </span>
              <span className="font-mono text-[10px] font-bold text-[#673B70]">
                {user?.staffDetails?.staffId || 'STF-101'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Email (System Login)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-[#F3EFFF] text-[#81758A] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 00002"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="pt-4 border-t border-[#E6DDEC] space-y-3">
            <h4 className="font-bold text-sm text-[#34243A]">Security & Password</h4>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6DDEC] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.01]"
            >
              Update Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
