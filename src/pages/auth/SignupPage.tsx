import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, Building, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../../components/BrandLogo';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('Please accept the Terms of Service to continue.');
      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        companyName,
        password,
      });
      navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFFF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#E9DDF2] blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#D8C2E5] blur-3xl opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="flex justify-center mb-5">
          <BrandLogo size="lg" />
        </div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">
          Create Customer Account
        </h2>
        <p className="mt-1 text-sm text-[#81758A]">
          Join SmartSub to subscribe to premium software & streaming services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-[0_20px_60px_rgba(103,59,112,0.12)] border border-[#E6DDEC]">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-[#D85B69] text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Rao"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                  Email Address *
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
                    placeholder="aditi@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                Company Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. NextGen Digital Labs"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#81758A]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#34243A] mb-1">
                  Confirm Password *
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
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDEC] bg-white text-sm text-[#34243A] focus:outline-none focus:border-[#673B70] focus:ring-2 focus:ring-[#673B70]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#673B70] focus:ring-[#673B70] border-[#D8C2E5]"
                />
                <span className="text-xs text-[#81758A] leading-relaxed">
                  I agree to the <span className="font-semibold text-[#673B70]">Terms of Service</span>, Privacy Policy and recurring subscription billing terms.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-sm shadow-[0_6px_20px_rgba(103,59,112,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E6DDEC] text-center">
            <p className="text-xs text-[#81758A]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#673B70] hover:text-[#4B2455] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
