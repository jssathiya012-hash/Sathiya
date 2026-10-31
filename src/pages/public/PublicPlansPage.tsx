import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Check, Sparkles, Tag, ArrowRight, Layers, LayoutDashboard } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { BrandLogo } from '../../components/BrandLogo';

export const PublicPlansPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const isInsideDashboard = location.pathname.startsWith('/customer') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>(searchParams.get('productId') || 'All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/plans'),
      api.get('/products'),
    ])
      .then(([plansRes, prodRes]) => {
        setPlans(plansRes.data.plans || []);
        setProducts(prodRes.data.products || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPlans = plans.filter((p) => {
    if (selectedPeriod !== 'All' && p.period.toLowerCase() !== selectedPeriod.toLowerCase()) return false;
    if (selectedProduct !== 'All' && p.productId !== selectedProduct && p.productName !== selectedProduct) return false;
    return true;
  });

  const handleSubscribe = (plan: any) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/customer/checkout?planId=${plan._id || plan.id}`);
    } else if (user?.role === 'CUSTOMER') {
      navigate(`/customer/checkout?planId=${plan._id || plan.id}`);
    } else {
      alert(`Logged in as ${user?.role}. Only Customer accounts can purchase customer subscriptions.`);
    }
  };

  const dashboardPath = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'STAFF'
    ? '/staff/dashboard'
    : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-[#F3EFFF] text-[#34243A]">
      {!isInsideDashboard && (
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E6DDEC] sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="text-xs font-bold text-[#673B70] hover:text-[#4B2455] px-3 py-2 rounded-xl hover:bg-[#F3EFFF] transition-colors"
            >
              Browse Products
            </Link>
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="px-4 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>
            ) : null}
          </div>
        </header>
      )}

      {/* Promo banner */}
      <div className="bg-gradient-to-r from-[#673B70] to-[#4B2455] text-white py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <Tag className="w-3.5 h-3.5 text-[#E9DDF2]" />
        <span>Use discount code <span className="font-extrabold text-[#E9DDF2] underline tracking-wider">FESTIVE50</span> for 50% OFF your first subscription!</span>
      </div>

      <section className="py-10 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[#34243A] tracking-tight">
          Flexible Plans for Every Need
        </h1>
        <p className="text-[#81758A] text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Transparent pricing with zero hidden fees. Select monthly, quarterly, or yearly billing cycles with instant activation.
        </p>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          {/* Period Toggle */}
          <div className="bg-white p-1 rounded-2xl border border-[#E6DDEC] shadow-xs flex items-center gap-1">
            {['All', 'Monthly', 'Quarterly', 'Yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPeriod === period
                    ? 'bg-[#673B70] text-white shadow-xs'
                    : 'text-[#81758A] hover:text-[#34243A]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Product Selector */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white border border-[#E6DDEC] text-xs font-bold text-[#34243A] focus:outline-none focus:border-[#673B70]"
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id || plan.id}
                className={`rounded-3xl p-6 bg-white border transition-all duration-300 flex flex-col justify-between relative ${
                  plan.recommended
                    ? 'border-[#673B70] shadow-[0_12px_40px_rgba(103,59,112,0.18)] scale-[1.02]'
                    : 'border-[#E6DDEC] shadow-[0_6px_25px_rgba(103,59,112,0.06)] hover:shadow-[0_10px_35px_rgba(103,59,112,0.12)]'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#673B70] text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E9DDF2]" /> Recommended
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#81758A]">
                      {plan.productName}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5]">
                      {plan.period}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#34243A]">{plan.name}</h3>

                  <div className="mt-4 mb-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#34243A]">₹{plan.price}</span>
                    <span className="text-xs font-semibold text-[#81758A]">/{plan.period.toLowerCase()}</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-[#E6DDEC]">
                    <p className="text-[11px] font-bold text-[#81758A] uppercase tracking-wider">Plan Features:</p>
                    {plan.features?.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#34243A]">
                        <Check className="w-4 h-4 text-[#2E9467] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#E6DDEC]">
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                      plan.recommended
                        ? 'bg-[#673B70] hover:bg-[#4B2455] text-white shadow-[0_4px_14px_rgba(103,59,112,0.3)]'
                        : 'bg-[#F3EFFF] hover:bg-[#E9DDF2] text-[#673B70] border border-[#D8C2E5]'
                    }`}
                  >
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
