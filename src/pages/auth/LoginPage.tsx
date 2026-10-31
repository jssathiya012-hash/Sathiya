import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, Users, AlertCircle, Info } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../../components/BrandLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login, isLoading } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'STAFF' | 'CUSTOMER'>('CUSTOMER');
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

  const handleRoleChange = (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Password validation rule: minimum 8 characters and at least one uppercase letter (A-Z)
    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one uppercase capital letter (A-Z).');
      return;
    }

    try {
      const loggedInUser = await login(email, password, rememberMe, selectedRole);
      handleLoginSuccess(loggedInUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please check your credentials.');
    }
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
        {/* Step 1: Select Account Portal Type */}
        <div className="bg-[#E9DDF2]/70 border border-[#D8C2E5] rounded-2xl p-1.5 mb-5 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#81758A] px-2 py-1 flex items-center justify-between">
            <span>Step 1: Select Account Portal</span>
            <span className="font-semibold text-[#673B70]">
              {selectedRole === 'ADMIN' ? 'Admin Mode' : selectedRole === 'STAFF' ? 'Staff Mode' : 'Customer Mode'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#4B2455] text-white shadow-xs'
                  : 'bg-white/80 text-[#34243A] hover:bg-white border border-[#D8C2E5]'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-[#E9DDF2]' : 'text-[#673B70]'}`} />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('STAFF')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'STAFF'
                  ? 'bg-[#673B70] text-white shadow-xs'
                  : 'bg-white/80 text-[#34243A] hover:bg-white border border-[#D8C2E5]'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${selectedRole === 'STAFF' ? 'text-[#E9DDF2]' : 'text-[#673B70]'}`} />
              <span>Staff Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('CUSTOMER')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-[#673B70] text-white shadow-xs'
                  : 'bg-white/80 text-[#34243A] hover:bg-white border border-[#D8C2E5]'
              }`}
            >
              <Users className={`w-4 h-4 ${selectedRole === 'CUSTOMER' ? 'text-[#E9DDF2]' : 'text-[#673B70]'}`} />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-[0_20px_60px_rgba(103,59,112,0.12)] border border-[#E6DDEC]">
          {/* Portal Header Indicator */}
          <div className="mb-6 pb-4 border-b border-[#E6DDEC] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81758A]">
                Step 2: Authenticate Account
              </span>
              <h3 className="text-base font-black text-[#34243A] mt-0.5">
                {selectedRole === 'ADMIN'
                  ? 'Administrator Access'
                  : selectedRole === 'STAFF'
                  ? 'Staff Member Login'
                  : 'Customer Account Login'}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#4B2455] text-[#E9DDF2]'
                  : 'bg-[#F3EFFF] text-[#673B70] border border-[#E6DDEC]'
              }`}
            >
              {selectedRole}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#D85B69] text-xs font-semibold flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1.5">
                {selectedRole === 'ADMIN' ? 'Administrator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={
                    selectedRole === 'ADMIN'
                      ? 'Enter admin email'
                      : selectedRole === 'STAFF'
                      ? 'staff@brightloop.com'
                      : 'customer@example.com'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] placeholder-[#81758A]/60 focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all font-medium"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Min 8 characters with 1 capital letter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] placeholder-[#81758A]/60 focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#81758A] hover:text-[#34243A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#81758A] mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-[#673B70]" />
                <span>Security rule: Minimum 8 characters with at least one capital letter (A-Z).</span>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#673B70] focus:ring-[#673B70] border-[#D8C2E5]"
                />
                <span className="text-xs font-medium text-[#81758A]">Remember this session</span>
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
                  <span>
                    Sign In to {selectedRole === 'ADMIN' ? 'Admin Control Center' : selectedRole === 'STAFF' ? 'Staff Portal' : 'Customer Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Customer / Staff sample credentials help (Admin email is hidden for privacy) */}
          {selectedRole !== 'ADMIN' && (
            <div className="mt-5 p-3 rounded-2xl bg-[#F3EFFF] border border-[#E6DDEC] text-[11px] text-[#81758A]">
              <span className="font-bold text-[#34243A]">Sample {selectedRole === 'STAFF' ? 'Staff' : 'Customer'} Login:</span>
              <p className="mt-0.5">
                Email: <span className="font-mono text-[#673B70] font-semibold">{selectedRole === 'STAFF' ? 'staff@brightloop.com' : 'demo@brightloop.com'}</span>
                {' '}| Password: <span className="font-mono text-[#673B70] font-semibold">{selectedRole === 'STAFF' ? 'Staff@12345' : 'Demo@12345'}</span>
              </p>
            </div>
          )}

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
