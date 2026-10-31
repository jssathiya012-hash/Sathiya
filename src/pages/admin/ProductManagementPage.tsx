import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle2, Layers, Music, Film, Cloud, Cpu, GraduationCap } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Music Streaming',
    category: 'Audio Streaming',
    description: '',
    icon: 'Music',
    features: ['High Quality Streaming', 'Offline Playback'],
    isActive: true,
  });

  const [featureInput, setFeatureInput] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      type: 'Music Streaming',
      category: 'Audio Streaming',
      description: '',
      icon: 'Music',
      features: ['High Quality Streaming', 'Offline Playback'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      type: prod.type,
      category: prod.category || 'Software',
      description: prod.description || '',
      icon: prod.icon || 'Package',
      features: prod.features || [],
      isActive: prod.isActive !== undefined ? prod.isActive : true,
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
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id || editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const getProductIcon = (icon: string) => {
    switch (icon) {
      case 'Music': return <Music className="w-5 h-5 text-[#673B70]" />;
      case 'Film': return <Film className="w-5 h-5 text-[#673B70]" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-[#673B70]" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-[#673B70]" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-[#673B70]" />;
      default: return <Package className="w-5 h-5 text-[#673B70]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Product Catalogue Management</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Configure software products, streaming services, feature bundles and track active subscribers.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products in Catalogue"
          description="Create your first software or streaming service offering."
          actionText="Add Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p._id || p.id}
              className="bg-white rounded-3xl p-6 border border-[#E6DDEC] shadow-[0_6px_25px_rgba(103,59,112,0.06)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3EFFF] border border-[#D8C2E5] flex items-center justify-center shadow-xs">
                    {getProductIcon(p.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9DDF2] text-[#4B2455] border border-[#D8C2E5]">
                      {p.category}
                    </span>
                    <Badge status={p.isActive ? 'Active' : 'Deactivated'} size="sm" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-[#34243A]">{p.name}</h3>
                <p className="text-xs text-[#81758A] mt-1 leading-relaxed line-clamp-2">{p.description}</p>

                {/* Sub & Plan statistics */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] text-center">
                  <div>
                    <span className="text-[10px] text-[#81758A] uppercase font-bold">Plans</span>
                    <p className="text-sm font-black text-[#673B70] mt-0.5">{p.totalPlans || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#81758A] uppercase font-bold">Active Subs</span>
                    <p className="text-sm font-black text-[#2E9467] mt-0.5">{p.activeSubscribers || 0}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[10px] font-bold text-[#81758A] uppercase tracking-wider">Features ({p.features?.length || 0}):</p>
                  {p.features?.slice(0, 3).map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-[#34243A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9467] shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E6DDEC] flex items-center justify-between">
                <Link
                  to={`/admin/plans?productId=${p._id || p.id}`}
                  className="text-xs font-bold text-[#673B70] hover:underline flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" /> Manage Plans
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF]"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id || p.id, p.name)}
                    className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product Offering'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. CineStream Pro"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Product Type *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const val = e.target.value;
                  const iconMap: any = {
                    'Music Streaming': 'Music',
                    'Video Streaming': 'Film',
                    'Cloud Storage': 'Cloud',
                    'Premium Software': 'Cpu',
                    'Online Learning Platform': 'GraduationCap'
                  };
                  setFormData({ ...formData, type: val, icon: iconMap[val] || 'Package' });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
              >
                <option value="Music Streaming">Music Streaming</option>
                <option value="Video Streaming">Video Streaming</option>
                <option value="Cloud Storage">Cloud Storage</option>
                <option value="Premium Software">Premium Software</option>
                <option value="Online Learning Platform">Online Learning Platform</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Media & Entertainment"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of features and capabilities..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          {/* Features Builder */}
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Product Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                placeholder="Add feature and press Enter or Add..."
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

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-[#673B70]"
              />
              <span className="font-bold text-[#34243A]">Product is Active & Visible</span>
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
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
