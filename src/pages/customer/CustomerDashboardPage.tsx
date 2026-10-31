import React, { useState, useEffect } from 'react';
import { Repeat, CreditCard, FileText, ShoppingBag, Sparkles, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions'),
      api.get('/payments'),
      api.get('/invoices'),
    ])
      .then(([sRes, pRes, iRes]) => {
        setSubscriptions(sRes.data.subscriptions || []);
        setPayments(pRes.data.payments || []);
        setInvoices(iRes.data.invoices || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const primarySub = activeSubs[0] || subscriptions[0];

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const handleRenew = async (subId: string) => {
    try {
      await api.post(`/subscriptions/${subId}/renew`);
      alert('Subscription successfully renewed!');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew subscription');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#673B70] to-[#4B2455] text-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(103,59,112,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#E9DDF2] mb-3 border border-white/10">
            <Sparkles className="w-4 h-4 text-[#E9DDF2]" /> SmartSub Customer Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user?.name}!
          </h2>
          <p className="text-[#E9DDF2] text-xs sm:text-sm mt-1 max-w-xl">
            Manage your cloud storage, media streams, invoices and subscription renewals from your personal account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/customer/plans"
            className="px-5 py-2.5 rounded-xl bg-white text-[#4B2455] hover:bg-[#E9DDF2] font-bold text-xs shadow-sm transition-all"
          >
            Explore New Plans
          </Link>
        </div>
      </div>

      {/* Active Subscription Highlight Card */}
      {primarySub && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#673B70] shadow-[0_8px_30px_rgba(103,59,112,0.12)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#81758A]">
                  Primary Active Subscription
                </span>
                <Badge status={primarySub.status} size="sm" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#34243A]">
                {primarySub.productName}
              </h3>
              <p className="text-xs text-[#81758A] mt-0.5">
                Plan: <span className="font-bold text-[#673B70]">{primarySub.planName}</span> ({primarySub.period} Billing)
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-4 text-xs font-semibold">
                <div>
                  <span className="text-[10px] text-[#81758A] block uppercase font-bold">Expires On</span>
                  <span className="text-[#34243A] font-bold">{new Date(primarySub.endDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#81758A] block uppercase font-bold">Days Remaining</span>
                  <span className="text-[#2E9467] font-black">{getDaysRemaining(primarySub.endDate)} days</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#81758A] block uppercase font-bold">Recurring Cost</span>
                  <span className="text-[#34243A] font-bold">₹{primarySub.finalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleRenew(primarySub._id || primarySub.id)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs shadow-[0_4px_14px_rgba(103,59,112,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>Renew Subscription</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/customer/subscriptions"
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#E6DDEC] text-[#34243A] hover:bg-[#F3EFFF] font-bold text-xs text-center transition-colors"
              >
                Manage All
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Subscriptions"
          value={activeSubs.length}
          icon={Repeat}
          color="#673B70"
          subtitle="Currently active services"
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          icon={FileText}
          color="#4B2455"
          subtitle="Official billing tax receipts"
        />
        <StatCard
          title="Total Paid (INR)"
          value={`₹${payments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString()}`}
          icon={CreditCard}
          color="#2E9467"
          subtitle="Lifetime payments processed"
        />
      </div>

      {/* Recent Subscriptions and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">My Subscriptions</h4>
            <Link to="/customer/subscriptions" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {subscriptions.length === 0 ? (
              <EmptyState
                title="No Subscriptions Yet"
                description="Browse our catalogue and subscribe to a service."
                actionText="Browse Plans"
                onAction={() => navigate('/customer/plans')}
              />
            ) : (
              subscriptions.map((s) => (
                <div key={s._id || s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#34243A]">{s.productName}</p>
                    <p className="text-[11px] text-[#81758A]">{s.planName} • {s.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#673B70]">₹{s.finalAmount}</p>
                    <Badge status={s.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">Recent Invoices</h4>
            <Link to="/customer/invoices" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {invoices.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#81758A]">No invoices recorded yet.</p>
            ) : (
              invoices.slice(0, 5).map((inv) => (
                <div key={inv._id || inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#673B70]">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-[#81758A]">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#34243A]">₹{inv.finalAmount}</p>
                    <Badge status={inv.paymentStatus || 'Paid'} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
