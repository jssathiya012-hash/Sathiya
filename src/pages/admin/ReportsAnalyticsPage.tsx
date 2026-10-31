import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../api/client';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';

export const ReportsAnalyticsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('monthly_revenue');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/details');
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportReportCSV = () => {
    if (!reportData) return;
    let headers: string[] = [];
    let rows: any[] = [];

    if (selectedReport === 'monthly_revenue' || selectedReport === 'payments') {
      headers = ['Payment ID', 'Customer Name', 'Amount (INR)', 'Method', 'Date', 'Status'];
      rows = (reportData.payments || []).map((p: any) => [
        p.paymentId, `"${p.customerName || ''}"`, p.amount, p.method, p.paidAt, p.status
      ]);
    } else if (selectedReport === 'customers') {
      headers = ['Customer ID', 'Name', 'Email', 'Company', 'Status', 'Registered Date'];
      rows = (reportData.customers || []).map((c: any) => [
        c.customerId, `"${c.name}"`, c.email, `"${c.companyName || ''}"`, c.status, c.createdAt
      ]);
    } else {
      headers = ['Subscription ID', 'Customer', 'Product', 'Plan', 'Period', 'Amount', 'Status'];
      rows = (reportData.subscriptions || []).map((s: any) => [
        s.subscriptionId, `"${s.customerName}"`, `"${s.productName}"`, `"${s.planName}"`, s.period, s.finalAmount, s.status
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartsub_report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportsList = [
    { id: 'monthly_revenue', name: '1. Monthly Revenue Report' },
    { id: 'yearly_revenue', name: '2. Yearly Revenue Report' },
    { id: 'customer_growth', name: '3. Customer Growth Report' },
    { id: 'active_subscriptions', name: '4. Active Subscription Report' },
    { id: 'expired_subscriptions', name: '5. Expired Subscription Report' },
    { id: 'cancelled_subscriptions', name: '6. Cancelled Subscription Report' },
    { id: 'product_wise', name: '7. Product-wise Subscription Report' },
    { id: 'plan_wise', name: '8. Plan-wise Subscription Report' },
    { id: 'discount_usage', name: '9. Discount Usage Report' },
    { id: 'payments', name: '10. Payment Reconciliation Report' },
    { id: 'staff_activity', name: '11. Staff Activity & Audit Report' },
  ];

  const subscriptions = reportData?.subscriptions || [];
  const payments = reportData?.payments || [];
  const customers = reportData?.customers || [];
  const products = reportData?.products || [];
  const staff = reportData?.staff || [];
  const discounts = reportData?.discounts || [];
  const activities = reportData?.activities || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Business Reports & Analytics</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            11 dedicated reports calculated from actual database records. Export to CSV for audit and tax filing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-white border border-[#E6DDEC] text-[#81758A] hover:text-[#34243A]"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportReportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pill Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E6DDEC] shadow-2xs overflow-x-auto flex gap-2">
        {reportsList.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedReport === r.id
                ? 'bg-[#673B70] text-white shadow-xs'
                : 'text-[#81758A] hover:bg-[#F3EFFF] hover:text-[#34243A]'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Report Data Render */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6DDEC]">
            <div>
              <h3 className="text-lg font-black text-[#34243A]">
                {reportsList.find((r) => r.id === selectedReport)?.name}
              </h3>
              <p className="text-xs text-[#81758A]">Generated from production database</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5]">
              Real Database Records
            </span>
          </div>

          {/* Dynamic Table based on selected report */}
          <div className="overflow-x-auto">
            {selectedReport === 'monthly_revenue' || selectedReport === 'yearly_revenue' || selectedReport === 'payments' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  {payments.map((p: any) => (
                    <tr key={p._id || p.id} className="hover:bg-[#F3EFFF]/30">
                      <td className="py-3 px-4 font-mono font-bold text-[#673B70]">{p.paymentId}</td>
                      <td className="py-3 px-4 font-bold text-[#34243A]">{p.customerName}</td>
                      <td className="py-3 px-4">{p.method}</td>
                      <td className="py-3 px-4 font-black text-[#2E9467]">₹{p.amount}</td>
                      <td className="py-3 px-4 text-[#81758A]">{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><Badge status={p.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedReport === 'customer_growth' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  {customers.map((c: any) => (
                    <tr key={c._id || c.id} className="hover:bg-[#F3EFFF]/30">
                      <td className="py-3 px-4 font-mono font-bold text-[#673B70]">{c.customerId}</td>
                      <td className="py-3 px-4 font-bold text-[#34243A]">{c.name}</td>
                      <td className="py-3 px-4">{c.email}</td>
                      <td className="py-3 px-4">{c.companyName || 'Individual'}</td>
                      <td className="py-3 px-4 text-[#81758A]">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><Badge status={c.status} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedReport === 'discount_usage' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Offer Name</th>
                    <th className="py-3 px-4">Discount Value</th>
                    <th className="py-3 px-4">Times Redeemed</th>
                    <th className="py-3 px-4">Usage Limit</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  {discounts.map((d: any) => (
                    <tr key={d._id || d.id} className="hover:bg-[#F3EFFF]/30">
                      <td className="py-3 px-4 font-mono font-bold text-[#673B70]">{d.code}</td>
                      <td className="py-3 px-4 font-bold text-[#34243A]">{d.name}</td>
                      <td className="py-3 px-4 font-bold text-[#2E9467]">
                        {d.type === 'PERCENT' ? `${d.value}%` : `₹${d.value}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#34243A]">{d.usedCount || 0}</td>
                      <td className="py-3 px-4 text-[#81758A]">{d.usageLimit || '∞'}</td>
                      <td className="py-3 px-4"><Badge status={d.isActive ? 'Active' : 'Inactive'} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedReport === 'staff_activity' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  {activities.slice(0, 15).map((a: any) => (
                    <tr key={a._id || a.id} className="hover:bg-[#F3EFFF]/30">
                      <td className="py-3 px-4 text-[#81758A]">{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-[#34243A]">{a.userName || 'System'}</td>
                      <td className="py-3 px-4"><Badge status={a.userRole} size="sm" /></td>
                      <td className="py-3 px-4 font-mono font-bold text-[#673B70]">{a.action}</td>
                      <td className="py-3 px-4 text-[#34243A]">{a.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Subscription ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Plan Tier</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  {subscriptions
                    .filter((s: any) => {
                      if (selectedReport === 'active_subscriptions') return s.status === 'Active';
                      if (selectedReport === 'expired_subscriptions') return s.status === 'Expired';
                      if (selectedReport === 'cancelled_subscriptions') return s.status === 'Cancelled';
                      return true;
                    })
                    .map((s: any) => (
                      <tr key={s._id || s.id} className="hover:bg-[#F3EFFF]/30">
                        <td className="py-3 px-4 font-mono font-bold text-[#673B70]">{s.subscriptionId}</td>
                        <td className="py-3 px-4 font-bold text-[#34243A]">{s.customerName}</td>
                        <td className="py-3 px-4 font-semibold text-[#34243A]">{s.productName}</td>
                        <td className="py-3 px-4 text-[#81758A]">{s.planName}</td>
                        <td className="py-3 px-4 font-bold text-[#2E9467]">₹{s.finalAmount}</td>
                        <td className="py-3 px-4 text-[#81758A]">{new Date(s.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4"><Badge status={s.status} size="sm" /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
