import React, { useState, useEffect } from 'react';
import { Repeat, RefreshCw, Eye } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const StaffSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleRenew = async (id: string, customerName: string) => {
    if (!confirm(`Assist renewal for ${customerName}?`)) return;
    try {
      await api.post(`/subscriptions/${id}/renew`);
      alert('Subscription successfully renewed!');
      fetchSubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Managed Subscriptions</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          Review subscriber status, expiration dates, and execute customer renewal requests.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No Subscriptions Found"
          description="Subscriptions belonging to your assigned customers will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Subscription ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product & Plan</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {subscriptions.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{s.subscriptionId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{s.customerName}</p>
                      <p className="text-[11px] text-[#81758A]">{s.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{s.productName}</p>
                      <p className="text-[11px] text-[#81758A]">{s.planName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#34243A]">{s.period}</td>
                    <td className="py-3.5 px-4 font-bold text-[#2E9467]">₹{s.finalAmount}</td>
                    <td className="py-3.5 px-4 text-[#81758A]">{new Date(s.endDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><Badge status={s.status} size="sm" /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRenew(s._id || s.id, s.customerName)}
                        className="px-3 py-1.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Assist Renew</span>
                      </button>
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
