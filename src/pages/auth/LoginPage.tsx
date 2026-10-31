import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, Users, Sparkles, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../../components/BrandLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSuccess = (loggedInUser: any) => {
    if (redirectParam && (loggedInUser.role === 'CUSTOMER' || !redirectParam.startsWith('/customer'))) {
      navigate(redirectParam);
    } else if (loggedInUser.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (loggedInUser.role === 'STAFF') {
      navigate('/staff/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const loggedInUser = await login(email, password, rememberMe);
      handleLoginSuccess(loggedInUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please check credentials.');
    }
  };

  // Only auto-populates credentials in the form fields — does NOT log in automatically
  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F3EFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E9DDF2] blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D8C2E5] blur-3xl opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="flex justify-center mb-5">
          <BrandLogo size="lg" />
        </div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">
          Welcome to SmartSub
        </h2>
        <p className="mt-1 text-sm text-[#81758A]">
          Unified Subscription Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Quick Demo Fill Selector */}
        <div className="bg-[#E9DDF2]/70 border border-[#D8C2E5] rounded-2xl p-3 mb-6 shadow-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B2455] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#673B70]" /> Quick Fill Demo Credentials
            </span>
            <span className="text-[10px] text-[#81758A]">Fills input fields</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('jssathiya012@gmail.com', 'Admin@12345')}
              className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                email === 'jssathiya012@gmail.com'
                  ? 'bg-[#4B2455] text-white border-[#4B2455] shadow-xs'
                  : 'bg-white text-[#34243A] border-[#D8C2E5] hover:bg-[#F3EFFF]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A77BB8]" />
                <span>Admin</span>
              </div>
              <p className="text-[9px] opacity-75 truncate">jssathiya012@gmail.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials('staff@brightloop.com', 'Staff@12345')}
              className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                email === 'staff@brightloop.com'
                  ? 'bg-[#673B70] text-white border-[#673B70] shadow-xs'
                  : 'bg-white text-[#34243A] border-[#D8C2E5] hover:bg-[#F3EFFF]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-[#A77BB8]" />
                <span>Staff</span>
              </div>
              <p className="text-[9px] opacity-75 truncate">staff@brightloop.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials('demo@brightloop.com', 'Demo@12345')}
              className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                email === 'demo@brightloop.com'
                  ? 'bg-[#673B70] text-white border-[#673B70] shadow-xs'
                  : 'bg-white text-[#34243A] border-[#D8C2E5] hover:bg-[#F3EFFF]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Users className="w-3.5 h-3.5 text-[#A77BB8]" />
                <span>Customer</span>
              </div>
              <p className="text-[9px] opacity-75 truncate">demo@brightloop.com</p>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-[0_20px_60px_rgba(103,59,112,0.12)] border border-[#E6DDEC]">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#D85B69] text-xs font-semibold flex items-center gap-2">
              <span>{errorMessage}</span>
            </div>
          )}

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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#673B70] hover:text-[#4B2455] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] placeholder-[#81758A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#81758A] hover:text-[#34243A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#673B70] focus:ring-[#673B70] border-[#D8C2E5]"
                />
                <span className="text-xs font-medium text-[#81758A]">Remember me</span>
              </label>
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
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E6DDEC] text-center">
            <p className="text-xs text-[#81758A]">
              New customer?{' '}
              <Link to="/signup" className="font-bold text-[#673B70] hover:text-[#4B2455] hover:underline">
                Create an account
              </Link>
            </p>
            <div className="mt-3 flex justify-center gap-4 text-xs font-semibold text-[#81758A]">
              <Link to="/products" className="hover:text-[#673B70]">Browse Products</Link>
              <span>•</span>
              <Link to="/plans" className="hover:text-[#673B70]">Subscription Plans</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
