import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers, Plus, Edit, Trash2, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const PlanManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [productFilter, setProductFilter] = useState(searchParams.get('productId') || 'all');
  const [periodFilter, setPeriodFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [featureInput, setFeatureInput] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    name: '',
    period: 'Monthly',
    price: 199,
    minQuantity: 1,
    features: ['Standard Access', 'Customer Support'],
    recommended: false,
    isActive: true,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, prodRes] = await Promise.all([
        api.get(`/plans?productId=${productFilter}&period=${periodFilter}`),
        api.get('/products'),
      ]);
      setPlans(plansRes.data.plans || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productFilter, periodFilter]);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    const firstProd = products[0];
    setFormData({
      productId: firstProd ? (firstProd._id || firstProd.id) : '',
      productName: firstProd ? firstProd.name : '',
      name: '',
      period: 'Monthly',
      price: 199,
      minQuantity: 1,
      features: ['Standard Access', 'Customer Support'],
      recommended: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      productId: plan.productId || '',
      productName: plan.productName || '',
      name: plan.name,
      period: plan.period || 'Monthly',
      price: plan.price || 0,
      minQuantity: plan.minQuantity || 1,
      features: plan.features || [],
      recommended: plan.recommended || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id || editingPlan.id}`, formData);
      } else {
        await api.post('/plans', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete plan "${name}"?`)) return;
    try {
      await api.delete(`/plans/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Subscription Plan Management</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Configure monthly, quarterly, and yearly pricing in INR (₹) and monitor plan subscribers.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#81758A]" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#81758A]">Product:</span>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#81758A]">Billing Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DDEC] text-xs font-bold text-[#34243A] bg-white focus:outline-none focus:border-[#673B70]"
            >
              <option value="all">All Periods</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#81758A]">Showing {plans.length} plan tiers</span>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          title="No Subscription Plans Found"
          description="Create customized monthly, quarterly or yearly tiers for your products."
          actionText="Add Plan"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p._id || p.id}
              className={`rounded-3xl p-6 bg-white border flex flex-col justify-between transition-all relative ${
                p.recommended
                  ? 'border-[#673B70] shadow-[0_10px_35px_rgba(103,59,112,0.14)]'
                  : 'border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)]'
              }`}
            >
              {p.recommended && (
                <div className="absolute -top-3 left-6 bg-[#673B70] text-white text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E9DDF2]" /> Recommended Tier
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#81758A]">
                    {p.productName}
                  </span>
                  <Badge status={p.period} size="sm" />
                </div>

                <h3 className="text-lg font-black text-[#34243A]">{p.name}</h3>

                <div className="mt-3 mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#34243A]">₹{p.price}</span>
                  <span className="text-xs font-semibold text-[#81758A]">/{p.period.toLowerCase()}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F3EFFF] border border-[#D8C2E5] flex items-center justify-between mb-4 text-xs font-semibold">
                  <span className="text-[#81758A]">Active Subscribers:</span>
                  <span className="font-bold text-[#673B70]">{p.activeSubscribers || 0} users</span>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#E6DDEC]">
                  <p className="text-[10px] font-bold text-[#81758A] uppercase tracking-wider">Features:</p>
                  {p.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[#34243A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9467] shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E6DDEC] flex items-center justify-between">
                <Badge status={p.isActive ? 'Active' : 'Inactive'} size="sm" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF]"
                    title="Edit Plan"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id || p.id, p.name)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Target Product *</label>
            <select
              value={formData.productId}
              onChange={(e) => {
                const prod = products.find((p) => (p._id || p.id) === e.target.value);
                setFormData({
                  ...formData,
                  productId: e.target.value,
                  productName: prod ? prod.name : '',
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
            >
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Plan Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. CineStream Pro - Starter Monthly"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Billing Period *</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
              >
                <option value="Monthly">Monthly (1 Month)</option>
                <option value="Quarterly">Quarterly (3 Months)</option>
                <option value="Half-Yearly">Half-Yearly (6 Months)</option>
                <option value="Yearly">Yearly (12 Months)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Price (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          {/* Features Builder */}
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Included Plan Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                placeholder="Type feature and press Enter or Add..."
                className="flex-1 px-3.5 py-1.5 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 rounded-xl bg-[#E9DDF2] text-[#4B2455] font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.features.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3EFFF] text-[#673B70] border border-[#D8C2E5] text-[11px] font-semibold"
                >
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recommended}
                onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                className="rounded text-[#673B70]"
              />
              <span className="font-bold text-[#34243A]">Mark as Recommended Tier</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-[#673B70]"
              />
              <span className="font-bold text-[#34243A]">Active for Purchase</span>
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
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
