import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Filter, Shield, Key, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const StaffManagementPage: React.FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [tempCredentials, setTempCredentials] = useState<{ staffId: string; email: string; temporaryPassword: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Customer Success',
    permissions: {
      canViewCustomers: true,
      canEditCustomers: true,
      canViewSubscriptions: true,
      canRenewSubscriptions: true,
      canViewPayments: true,
      canViewInvoices: true,
    },
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/staff?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/staff', formData);
      setIsAddModalOpen(false);
      setTempCredentials(res.data.temporaryCredentials);
      fetchStaff();
      setFormData({
        name: '',
        email: '',
        phone: '',
        designation: '',
        department: 'Customer Success',
        permissions: {
          canViewCustomers: true,
          canEditCustomers: true,
          canViewSubscriptions: true,
          canRenewSubscriptions: true,
          canViewPayments: true,
          canViewInvoices: true,
        },
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create staff account');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await api.put(`/staff/${selectedStaff._id || selectedStaff.id}`, selectedStaff);
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm('Generate a new temporary password for this staff member?')) return;
    try {
      const res = await api.post(`/staff/${id}/reset-password`);
      alert(`New Temporary Password: ${res.data.temporaryPassword}\nPlease share this securely with the staff member.`);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete staff account for ${name}?`)) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Staff Account Management</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            Create, configure permissions, and monitor staff logins for customer support & billing.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Temporary Credentials Banner Modal */}
      {tempCredentials && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2E9467]" />
              <h4 className="font-bold text-sm">Staff Account Created Successfully!</h4>
            </div>
            <p className="text-xs text-[#2E9467] mt-1">
              Securely share these temporary login credentials with the staff member:
            </p>
            <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-200 font-mono text-xs space-y-1">
              <p><strong>Staff ID:</strong> {tempCredentials.staffId}</p>
              <p><strong>Email:</strong> {tempCredentials.email}</p>
              <p><strong>Temporary Password:</strong> {tempCredentials.temporaryPassword}</p>
            </div>
          </div>
          <button
            onClick={() => setTempCredentials(null)}
            className="text-xs font-bold text-emerald-800 hover:underline px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or email..."
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
            <option value="Suspended">Suspended</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : staffList.length === 0 ? (
        <EmptyState
          title="No Staff Members Found"
          description="Click Add Staff Member to generate credentials and assign departmental permissions."
          actionText="Add Staff Member"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Staff ID</th>
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {staffList.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{s.staffId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{s.name}</p>
                      <p className="text-[11px] text-[#81758A]">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#34243A]">{s.designation}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#E9DDF2] text-[#4B2455] text-[10px] font-bold border border-[#D8C2E5]">
                        {s.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleResetPassword(s._id || s.id)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#673B70] hover:bg-[#F3EFFF]"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStaff(s);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF]"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id || s.id, s.name)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Staff Account">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Staff Member Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                const firstName = val.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                const autoEmail = firstName ? `${firstName}@brightloop.com` : '';
                setFormData({
                  ...formData,
                  name: val,
                  email: (!formData.email || formData.email.endsWith('@brightloop.com')) ? autoEmail : formData.email
                });
              }}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="priya@brightloop.com"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
              <p className="text-[10px] text-[#81758A] mt-1">
                Format: <span className="font-semibold text-[#673B70]">[name]@brightloop.com</span> | Password: <span className="font-semibold text-[#673B70]">[Name]@123</span>
              </p>
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00003"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Designation *</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Account Executive"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
              >
                <option value="Customer Success">Customer Success</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing & Accounts">Billing & Accounts</option>
                <option value="Sales & Onboarding">Sales & Onboarding</option>
              </select>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="pt-3 border-t border-[#E6DDEC]">
            <label className="block font-bold text-[#34243A] uppercase mb-2">Granted Staff Permissions</label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewCustomers}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canViewCustomers: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>View Assigned Customers</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canEditCustomers}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canEditCustomers: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>Edit Customer Profiles</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewSubscriptions}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canViewSubscriptions: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>View Subscriptions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canRenewSubscriptions}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canRenewSubscriptions: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>Assist Subscription Renewals</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewInvoices}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canViewInvoices: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>Access Invoices</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewPayments}
                  onChange={(e) => setFormData({
                    ...formData,
                    permissions: { ...formData.permissions, canViewPayments: e.target.checked }
                  })}
                  className="rounded text-[#673B70]"
                />
                <span>View Payment Records</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6DDEC] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#E6DDEC] font-bold text-[#81758A] hover:bg-[#F3EFFF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold shadow-xs"
            >
              Generate Staff Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      {selectedStaff && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Staff: ${selectedStaff.name}`}>
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={selectedStaff.name}
                onChange={(e) => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">Designation</label>
                <input
                  type="text"
                  value={selectedStaff.designation}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, designation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">Status</label>
                <select
                  value={selectedStaff.status}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6DDEC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E6DDEC] font-bold text-[#81758A] hover:bg-[#F3EFFF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
