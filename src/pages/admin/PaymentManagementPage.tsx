import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Download, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payments?search=${encodeURIComponent(search)}&status=${statusFilter}&method=${methodFilter}`);
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, methodFilter]);

  const handleRefund = async (id: string, amount: number) => {
    if (!confirm(`Are you sure you want to process a full refund of ₹${amount} for this payment?`)) return;
    try {
      await api.post(`/payments/${id}/refund`);
      alert(`Refund of ₹${amount} processed successfully.`);
      fetchPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process refund');
    }
  };

  const exportCSV = () => {
    if (payments.length === 0) return;
    const headers = ['Payment ID', 'Customer Name', 'Subscription ID', 'Amount (INR)', 'Discount', 'Tax', 'Method', 'Transaction Ref', 'Status', 'Date'];
    const rows = payments.map(p => [
      p.paymentId,
      `"${p.customerName || ''}"`,
      p.subscriptionId || '',
      p.amount,
      p.discount || 0,
      p.tax || 0,
      p.method,
      p.transactionRef,
      p.status,
      new Date(p.paidAt || Date.now()).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartsub_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Payment Transactions</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Audit gateway reconciliations, verify payment methods (Card, UPI, Net Banking), and process authorized refunds.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#E6DDEC] text-[#673B70] hover:bg-[#F3EFFF] text-xs font-bold shadow-2xs flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, customer or ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DDEC] bg-white text-xs text-[#34243A] focus:outline-none focus:border-[#673B70]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#81758A]">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
            >
              <option value="all">All Methods</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#81758A]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
            >
              <option value="all">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          title="No Payment Records Found"
          description="Customer checkout transactions will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {payments.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{p.paymentId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{p.customerName || 'Customer'}</p>
                      <p className="text-[11px] text-[#81758A]">{p.customerEmail || ''}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#81758A]">
                      {p.subscriptionId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#34243A]">{p.method}</td>
                    <td className="py-3.5 px-4 font-black text-[#2E9467] text-sm">
                      ₹{p.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#81758A]">
                      {p.transactionRef}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#81758A]">
                      {new Date(p.paidAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'Successful' && (
                        <button
                          onClick={() => handleRefund(p._id || p.id, p.amount)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#D85B69] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1 ml-auto"
                          title="Process Refund"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
