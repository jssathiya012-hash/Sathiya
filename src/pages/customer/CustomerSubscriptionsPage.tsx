import React, { useState, useEffect } from 'react';
import { Repeat, Play, Pause, XCircle, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';

export const CustomerSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
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

  const handleRenew = async (id: string, name: string) => {
    if (!confirm(`Confirm renewal of ${name}?`)) return;
    try {
      await api.post(`/subscriptions/${id}/renew`);
      alert('Subscription renewed successfully!');
      fetchSubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew');
    }
  };

  const handleTogglePause = async (id: string) => {
    try {
      await api.post(`/subscriptions/${id}/pause`);
      fetchSubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update subscription status');
    }
  };

  const handleCancel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to cancel ${name}? You will retain access until the end of the billing period.`)) return;
    try {
      await api.post(`/subscriptions/${id}/cancel`);
      alert('Subscription cancelled.');
      fetchSubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">My Active Subscriptions</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Manage renewals, pause services during vacation or review contract end dates.
          </p>
        </div>
        <Link
          to="/customer/plans"
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-xs transition-all"
        >
          Subscribe to New Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No Subscriptions Active"
          description="You do not have any active subscriptions. Explore available streaming & software services."
          actionText="Explore Plans"
          onAction={() => navigate('/customer/plans')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((s) => (
            <div
              key={s._id || s.id}
              className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_6px_25px_rgba(103,59,112,0.06)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#673B70]">{s.subscriptionId}</span>
                  <Badge status={s.status} size="sm" />
                </div>

                <h3 className="text-lg font-black text-[#34243A]">{s.productName}</h3>
                <p className="text-xs font-semibold text-[#81758A]">{s.planName} • {s.period}</p>

                <div className="mt-4 p-3 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#81758A]">
                    <span>Billing Amount:</span>
                    <span className="font-bold text-[#34243A]">₹{s.finalAmount}</span>
                  </div>
                  <div className="flex justify-between text-[#81758A]">
                    <span>Started On:</span>
                    <span className="font-bold text-[#34243A]">{new Date(s.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-[#81758A]">
                    <span>Valid Until:</span>
                    <span className="font-bold text-[#2E9467]">{new Date(s.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E6DDEC] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRenew(s._id || s.id, s.productName)}
                  className="flex-1 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew</span>
                </button>

                <button
                  onClick={() => handleTogglePause(s._id || s.id)}
                  className="p-2 rounded-xl border border-[#E6DDEC] hover:bg-[#F3EFFF] text-[#81758A] transition-colors"
                  title={s.status === 'Paused' ? 'Resume Subscription' : 'Pause Subscription'}
                >
                  {s.status === 'Paused' ? <Play className="w-4 h-4 text-[#2E9467]" /> : <Pause className="w-4 h-4 text-[#D99A39]" />}
                </button>

                {s.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleCancel(s._id || s.id, s.productName)}
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-[#D85B69] transition-colors"
                    title="Cancel Subscription"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
