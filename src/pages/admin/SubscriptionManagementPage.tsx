import React, { useState, useEffect } from 'react';
import { Repeat, Search, Filter, Play, Pause, XCircle, RefreshCw, Calendar, Eye, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const SubscriptionManagementPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/subscriptions?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [search, statusFilter]);

  const handleRenew = async (id: string, name: string) => {
    if (!confirm(`Renew subscription for ${name}?`)) return;
    try {
      await api.post(`/subscriptions/${id}/renew`);
      alert('Subscription renewed successfully!');
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew subscription');
    }
  };

  const handleTogglePause = async (id: string, currentStatus: string) => {
    try {
      await api.post(`/subscriptions/${id}/pause`);
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update subscription status');
    }
  };

  const handleCancel = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to cancel subscription for ${name}?`)) return;
    try {
      await api.post(`/subscriptions/${id}/cancel`);
      alert('Subscription cancelled.');
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Subscription Management</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Monitor subscriber lifecycles, renew contracts, pause or cancel recurring services.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, customer, product or plan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DDEC] bg-white text-xs text-[#34243A] focus:outline-none focus:border-[#673B70]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#81758A]" />
          <span className="text-xs font-semibold text-[#81758A]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscription Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No Subscriptions Found"
          description="Subscriptions created by customers upon checkout will be listed here automatically."
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
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                    <td className="py-3.5 px-4 font-semibold text-[#34243A]">
                      <Badge status={s.period || 'Monthly'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">₹{s.finalAmount}</p>
                      {s.discountAmount > 0 && (
                        <p className="text-[10px] text-[#2E9467]">Save ₹{s.discountAmount}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#81758A]">
                      {new Date(s.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedSub(s);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#673B70] hover:bg-[#F3EFFF]"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRenew(s._id || s.id, s.customerName)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#2E9467] hover:bg-emerald-50"
                        title="Renew Subscription"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePause(s._id || s.id, s.status)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D99A39] hover:bg-amber-50"
                        title={s.status === 'Paused' ? 'Resume Subscription' : 'Pause Subscription'}
                      >
                        {s.status === 'Paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      {s.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleCancel(s._id || s.id, s.customerName)}
                          className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                          title="Cancel Subscription"
                        >
                          <XCircle className="w-4 h-4" />
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

      {/* Detail Modal */}
      {selectedSub && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Subscription Details: ${selectedSub.subscriptionId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#81758A]">Customer:</span>
                <span className="font-bold text-[#34243A]">{selectedSub.customerName} ({selectedSub.customerEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Product:</span>
                <span className="font-bold text-[#34243A]">{selectedSub.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Plan:</span>
                <span className="font-bold text-[#34243A]">{selectedSub.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Billing Period:</span>
                <span className="font-bold text-[#673B70]">{selectedSub.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Status:</span>
                <Badge status={selectedSub.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#E6DDEC]">
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Start Date</span>
                <p className="font-bold text-[#34243A] mt-0.5">{new Date(selectedSub.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Expiry Date</span>
                <p className="font-bold text-[#34243A] mt-0.5">{new Date(selectedSub.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Original Amount</span>
                <p className="font-bold text-[#34243A] mt-0.5">₹{selectedSub.originalAmount}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Final Amount Paid</span>
                <p className="font-bold text-[#2E9467] mt-0.5">₹{selectedSub.finalAmount}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6DDEC] flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#673B70] text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
