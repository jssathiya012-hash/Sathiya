import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { BrandLogo } from '../../components/BrandLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetUrl?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessInfo({
        message: res.data.message,
        resetUrl: res.data.resetUrl,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit password reset request.');
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
          Reset Your Password
        </h2>
        <p className="mt-1 text-sm text-[#81758A]">
          Enter your registered email address to receive reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-[0_20px_60px_rgba(103,59,112,0.12)] border border-[#E6DDEC]">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#D85B69] text-xs font-semibold">
              {error}
            </div>
          )}

          {successInfo ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#2E9467] border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#34243A]">Reset Link Dispatched</h3>
              <p className="text-xs text-[#81758A] mt-2 leading-relaxed">
                {successInfo.message}
              </p>

              {successInfo.resetUrl && (
                <div className="mt-5 p-3 rounded-xl bg-[#F3EFFF] border border-[#D8C2E5] text-left">
                  <p className="text-[11px] font-bold text-[#4B2455] uppercase">Demo Direct Link:</p>
                  <Link
                    to={successInfo.resetUrl}
                    className="text-xs text-[#673B70] font-semibold underline break-all hover:text-[#4B2455] mt-1 block"
                  >
                    Click here to open Reset Password page
                  </Link>
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#673B70] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] placeholder-[#81758A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-[0_6px_20px_rgba(103,59,112,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#E6DDEC] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#81758A] hover:text-[#673B70]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
