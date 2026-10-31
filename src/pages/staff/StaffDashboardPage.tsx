import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Repeat, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Link } from 'react-router-dom';

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/customers'),
      api.get('/subscriptions'),
    ])
      .then(([cRes, sRes]) => {
        setCustomers(cRes.data.customers || []);
        setSubscriptions(sRes.data.subscriptions || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeSubs = subscriptions.filter((s) => s.status === 'Active');
  const upcomingRenewals = activeSubs.filter((s) => {
    const end = new Date(s.endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return diffDays >= 0 && diffDays <= 15;
  });

  return (
    <div className="space-y-6">
      {/* Staff Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#673B70] to-[#4B2455] text-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(103,59,112,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#E9DDF2] mb-3 border border-white/10">
            <UserCheck className="w-4 h-4" /> Staff Member Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-[#E9DDF2] text-xs sm:text-sm mt-1">
            Customer Success & Subscription Lifecycle Support Portal
          </p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-xs backdrop-blur-sm">
          <p className="text-[10px] uppercase font-bold text-[#E9DDF2]">Staff Reference</p>
          <p className="font-mono font-bold text-sm text-white">ID: {user?.staffDetails?.staffId || 'STF-101'}</p>
          <p className="text-[#E9DDF2] mt-0.5">{user?.staffDetails?.designation || 'Customer Support Specialist'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Customers"
          value={customers.length}
          icon={Users}
          color="#673B70"
          subtitle="Accounts under your care"
        />
        <StatCard
          title="Managed Subscriptions"
          value={subscriptions.length}
          icon={Repeat}
          color="#2E9467"
          subtitle={`${activeSubs.length} currently active`}
        />
        <StatCard
          title="Upcoming Renewals"
          value={upcomingRenewals.length}
          icon={Calendar}
          color="#D99A39"
          subtitle="Expiring in next 15 days"
        />
      </div>

      {/* Grid: Assigned Customers & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Customers */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">My Assigned Customers</h4>
            <Link to="/staff/customers" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {customers.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#81758A]">No assigned customers found.</p>
            ) : (
              customers.slice(0, 5).map((c) => (
                <div key={c._id || c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#34243A]">{c.name}</p>
                    <p className="text-[11px] text-[#81758A]">{c.email} • {c.companyName || 'Individual'}</p>
                  </div>
                  <Badge status={c.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Managed Subscriptions */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">Active Customer Subscriptions</h4>
            <Link to="/staff/subscriptions" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {subscriptions.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#81758A]">No active subscriptions found.</p>
            ) : (
              subscriptions.slice(0, 5).map((s) => (
                <div key={s._id || s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#34243A]">{s.customerName}</p>
                    <p className="text-[11px] text-[#81758A]">{s.productName} ({s.planName})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#2E9467]">₹{s.finalAmount}</p>
                    <Badge status={s.status} size="sm" />
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
