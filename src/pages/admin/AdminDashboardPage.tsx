import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Package, Layers, Repeat, CheckCircle, AlertTriangle, XCircle,
  IndianRupee, TrendingUp, Clock, Calendar, ArrowRight, ShieldCheck, RefreshCw, Eye
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/overview');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const m = data?.metrics || {};
  const charts = data?.charts || {};
  const recent = data?.recent || {};

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#673B70] to-[#4B2455] text-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(103,59,112,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#E9DDF2] mb-3 border border-white/10">
            <ShieldCheck className="w-4 h-4" /> Super Administrator Console
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Company Control Center
          </h2>
          <p className="text-[#E9DDF2] text-xs sm:text-sm mt-1 max-w-xl">
            Real-time multi-product subscriber growth, MRR, ARR and renewal intelligence for Brightloop Software.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all backdrop-blur-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-white text-[#4B2455] hover:bg-[#E9DDF2] font-bold text-xs shadow-sm transition-all"
          >
            Full Analytics
          </Link>
        </div>
      </div>

      {/* 12 Key Statistics Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#81758A] mb-4">
          All 12 Real-Time Key Performance Indicators
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard title="Total Customers" value={m.totalCustomers || 0} icon={Users} color="#673B70" subtitle="Registered accounts" />
          <StatCard title="Total Staff" value={m.totalStaff || 0} icon={UserCheck} color="#4B2455" subtitle="Support & success team" />
          <StatCard title="Active Products" value={m.totalProducts || 0} icon={Package} color="#A77BB8" subtitle="SaaS & streaming lines" />
          <StatCard title="Subscription Plans" value={m.totalPlans || 0} icon={Layers} color="#673B70" subtitle="Monthly/Yearly tiers" />
          <StatCard title="Total Subscriptions" value={m.totalSubscriptions || 0} icon={Repeat} color="#34243A" subtitle="Lifetime subscriptions" />
          <StatCard title="Active Subscriptions" value={m.activeSubscriptions || 0} icon={CheckCircle} color="#2E9467" subtitle="Generating recurring rev" />
          <StatCard title="Expired Subscriptions" value={m.expiredSubscriptions || 0} icon={AlertTriangle} color="#D99A39" subtitle="Past due / lapsed" />
          <StatCard title="Cancelled Subscriptions" value={m.cancelledSubscriptions || 0} icon={XCircle} color="#D85B69" subtitle="Terminated contracts" />
          <StatCard title="Monthly Revenue" value={`₹${(m.monthlyRevenue || 0).toLocaleString()}`} icon={IndianRupee} color="#2E9467" trend="+18.4%" trendUp={true} subtitle="Current month collection" />
          <StatCard title="Yearly Revenue" value={`₹${(m.yearlyRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="#673B70" trend="+34.2%" trendUp={true} subtitle="Annual cumulative" />
          <StatCard title="Pending Payments" value={m.pendingPayments || 0} icon={Clock} color="#D99A39" subtitle="Awaiting reconciliation" />
          <StatCard title="Upcoming Renewals" value={m.upcomingRenewals || 0} icon={Calendar} color="#A77BB8" subtitle="Next 15 days pipeline" />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-black text-[#34243A] text-base">Monthly Revenue Trend (₹)</h4>
              <p className="text-xs text-[#81758A]">Verified transaction collection over last 6 months</p>
            </div>
            <span className="text-xs font-bold text-[#2E9467] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Verified
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueByMonth || []}>
                <defs>
                  <linearGradient id="plumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#673B70" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#673B70" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3EFFF" />
                <XAxis dataKey="month" stroke="#81758A" fontSize={12} tickLine={false} />
                <YAxis stroke="#81758A" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E6DDEC', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#673B70" strokeWidth={3} fillOpacity={1} fill="url(#plumGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] flex flex-col justify-between">
          <div>
            <h4 className="font-black text-[#34243A] text-base">Subscription Status</h4>
            <p className="text-xs text-[#81758A] mb-2">Active vs Expired vs Cancelled</p>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.statusData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(charts.statusData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E6DDEC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E6DDEC]">
            {(charts.statusData || []).map((s: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[#34243A]">{s.name}</span>
                </div>
                <span className="font-bold text-[#34243A]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product-wise Subscription Distribution */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
        <h4 className="font-black text-[#34243A] text-base mb-1">Product-wise Subscriptions</h4>
        <p className="text-xs text-[#81758A] mb-4">Subscriber volume across catalogue offerings</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.productStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EFFF" />
              <XAxis dataKey="name" stroke="#81758A" fontSize={11} tickLine={false} />
              <YAxis stroke="#81758A" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E6DDEC' }}
              />
              <Bar dataKey="subscriptions" fill="#673B70" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">Recent Subscriptions</h4>
            <Link to="/admin/subscriptions" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {(recent.subscriptions || []).length === 0 ? (
              <p className="text-xs text-[#81758A] py-6 text-center">No subscriptions found.</p>
            ) : (
              (recent.subscriptions || []).map((sub: any) => (
                <div key={sub._id || sub.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#34243A]">{sub.customerName}</p>
                    <p className="text-[11px] text-[#81758A]">{sub.productName} • {sub.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#673B70]">₹{sub.finalAmount}</p>
                    <div className="mt-0.5"><Badge status={sub.status} size="sm" /></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-[#34243A] text-base">Recent Payments</h4>
            <Link to="/admin/payments" className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1">
              <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#E6DDEC]">
            {(recent.payments || []).length === 0 ? (
              <p className="text-xs text-[#81758A] py-6 text-center">No payments found.</p>
            ) : (
              (recent.payments || []).map((p: any) => (
                <div key={p._id || p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#34243A]">{p.paymentId}</p>
                    <p className="text-[11px] text-[#81758A]">{p.method} • Ref: {p.transactionRef}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#2E9467]">+₹{p.amount}</p>
                    <span className="text-[10px] text-[#81758A]">
                      {new Date(p.paidAt || Date.now()).toLocaleDateString()}
                    </span>
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
