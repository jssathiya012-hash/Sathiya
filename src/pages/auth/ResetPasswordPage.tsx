import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { BrandLogo } from '../../components/BrandLogo';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password. Token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="flex justify-center mb-5">
          <BrandLogo size="lg" />
        </div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">
          Set New Password
        </h2>
        <p className="mt-1 text-sm text-[#81758A]">
          Create a secure new password for your SmartSub account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-[0_20px_60px_rgba(103,59,112,0.12)] border border-[#E6DDEC]">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#D85B69] text-xs font-semibold">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#2E9467] border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#34243A]">Password Updated Successfully!</h3>
              <p className="text-xs text-[#81758A] mt-2 mb-6">
                Your password has been changed. You can now log in with your new credentials.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-sm"
              >
                Proceed to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-[0_6px_20px_rgba(103,59,112,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save & Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center">
                <Link to="/login" className="text-xs font-bold text-[#81758A] hover:text-[#673B70]">
                  Cancel & Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
