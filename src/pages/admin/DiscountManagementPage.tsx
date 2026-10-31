import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const DiscountManagementPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PERCENT',
    value: 20,
    minPurchase: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    usageLimit: 100,
    isActive: true,
  });

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/discounts');
      setDiscounts(res.data.discounts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenAdd = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      name: '',
      type: 'PERCENT',
      value: 20,
      minPurchase: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      usageLimit: 100,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: any) => {
    setEditingDiscount(d);
    setFormData({
      code: d.code,
      name: d.name || '',
      type: d.type || 'PERCENT',
      value: d.value || 0,
      minPurchase: d.minPurchase || 0,
      startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
      endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
      usageLimit: d.usageLimit || 100,
      isActive: d.isActive !== undefined ? d.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDiscount) {
        await api.put(`/discounts/${editingDiscount._id || editingDiscount.id}`, formData);
      } else {
        await api.post('/discounts', formData);
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save discount code');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete discount coupon "${code}"?`)) return;
    try {
      await api.delete(`/discounts/${id}`);
      fetchDiscounts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Discounts & Promo Codes</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Create percentage and flat coupons, set usage limits, and monitor redemptions in real time.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : discounts.length === 0 ? (
        <EmptyState
          title="No Discount Codes Active"
          description="Create coupon codes like FESTIVE50 or SAVE10 for your customers."
          actionText="Create Coupon"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((d) => (
            <div
              key={d._id || d.id}
              className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="px-3 py-1 rounded-xl bg-[#F3EFFF] border border-[#D8C2E5] font-mono font-black text-sm text-[#673B70] tracking-wider">
                    {d.code}
                  </div>
                  <Badge status={d.isActive ? 'Active' : 'Inactive'} size="sm" />
                </div>

                <h3 className="text-base font-bold text-[#34243A]">{d.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#2E9467]">
                    {d.type === 'PERCENT' ? `${d.value}% OFF` : `₹${d.value} OFF`}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#81758A]">
                    <span>Min Purchase:</span>
                    <span className="font-bold text-[#34243A]">₹{d.minPurchase || 0}</span>
                  </div>
                  <div className="flex justify-between text-[#81758A]">
                    <span>Redemptions:</span>
                    <span className="font-bold text-[#673B70]">{d.usedCount || 0} / {d.usageLimit || '∞'}</span>
                  </div>
                  <div className="flex justify-between text-[#81758A]">
                    <span>Valid Until:</span>
                    <span className="font-bold text-[#34243A]">
                      {d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Unlimited'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E6DDEC] flex items-center justify-between">
                <span className="text-[11px] text-[#81758A] font-semibold">
                  {d.type === 'PERCENT' ? 'Percentage Discount' : 'Fixed Amount Rebate'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF]"
                    title="Edit Coupon"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d._id || d.id, d.code)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDiscount ? `Edit Coupon: ${editingDiscount.code}` : 'Create Discount Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Coupon Code (Uppercase) *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
              placeholder="e.g. FESTIVE50"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white font-mono font-bold focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Offer Title / Description</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Festive Holiday 50% Off"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Discount Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Value *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Minimum Purchase (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Usage Limit</label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-[#673B70]"
              />
              <span className="font-bold text-[#34243A]">Coupon is Active for Redemptions</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#E6DDEC] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E6DDEC] font-bold text-[#81758A] hover:bg-[#F3EFFF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold shadow-xs"
            >
              {editingDiscount ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
