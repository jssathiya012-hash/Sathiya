import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const CustomerPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then((res) => setPayments(res.data.payments || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Payment Receipts</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          History of all card, UPI and net banking transactions processed on your account.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          title="No Payment Records"
          description="Your payment confirmations and bank transaction IDs will be logged here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Payment ID</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {payments.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{p.paymentId}</td>
                    <td className="py-3.5 px-4 font-mono text-[#81758A]">{p.subscriptionId || 'Subscription'}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#34243A]">{p.method}</td>
                    <td className="py-3.5 px-4 font-black text-[#2E9467]">₹{p.amount}</td>
                    <td className="py-3.5 px-4 font-mono text-[#81758A]">{p.transactionRef}</td>
                    <td className="py-3.5 px-4 text-[#81758A]">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><Badge status={p.status} size="sm" /></td>
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
