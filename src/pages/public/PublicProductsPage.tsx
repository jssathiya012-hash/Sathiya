import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Music, Film, Cloud, Cpu, GraduationCap, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { api } from '../../api/client';
import { BrandLogo } from '../../components/BrandLogo';
import { useAuthStore } from '../../store/authStore';

export const PublicProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith('/customer') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-7 h-7 text-[#673B70]" />;
      case 'Film': return <Film className="w-7 h-7 text-[#673B70]" />;
      case 'Cloud': return <Cloud className="w-7 h-7 text-[#673B70]" />;
      case 'Cpu': return <Cpu className="w-7 h-7 text-[#673B70]" />;
      case 'GraduationCap': return <GraduationCap className="w-7 h-7 text-[#673B70]" />;
      default: return <Package className="w-7 h-7 text-[#673B70]" />;
    }
  };

  const dashboardPath = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'STAFF'
    ? '/staff/dashboard'
    : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-[#F3EFFF] text-[#34243A]">
      {/* Public Header - Only show when NOT embedded inside dashboard */}
      {!isInsideDashboard && (
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E6DDEC] sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-3">
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

      {/* Hero Section */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto">
        <span className="px-3.5 py-1.5 rounded-full bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5] text-xs font-bold uppercase tracking-wider">
          Enterprise Subscription Catalogue
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#34243A] tracking-tight mt-4 mb-3">
          Stream, Store & Scale with <span className="text-[#673B70]">Brightloop Software</span>
        </h1>
        <p className="text-[#81758A] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Explore our suite of cloud services, high-fidelity audio, 4K streaming, and business subscription management software.
        </p>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod._id || prod.id}
                className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_6px_25px_rgba(103,59,112,0.08)] hover:shadow-[0_12px_40px_rgba(103,59,112,0.15)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F3EFFF] border border-[#D8C2E5] flex items-center justify-center shadow-xs">
                      {getProductIcon(prod.icon)}
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5]">
                      {prod.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#34243A]">{prod.name}</h3>
                  <p className="text-xs text-[#81758A] mt-1 leading-relaxed line-clamp-3">
                    {prod.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-[#E6DDEC] space-y-2">
                    <p className="text-[11px] font-bold text-[#81758A] uppercase tracking-wider">Features included:</p>
                    {prod.features?.slice(0, 4).map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#34243A]">
                        <CheckCircle2 className="w-4 h-4 text-[#2E9467] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6DDEC] flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Available Product
                  </span>
                  <span className="text-[11px] font-semibold text-[#81758A]">Brightloop Software</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
