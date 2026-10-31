import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Eye, Edit, Trash2, UserCheck, CreditCard, Repeat, Building } from 'lucide-react';
import { api } from '../../api/client';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';

export const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerHistory, setCustomerHistory] = useState<any>({ subscriptions: [], payments: [], invoices: [] });

  // Add form
  const [newCust, setNewCust] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    gstNumber: '',
    assignedStaffId: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custRes, staffRes] = await Promise.all([
        api.get(`/customers?search=${encodeURIComponent(search)}&status=${statusFilter}`),
        api.get('/staff'),
      ]);
      setCustomers(custRes.data.customers || []);
      setStaffList(staffRes.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCust);
      setIsAddModalOpen(false);
      fetchData();
      setNewCust({ name: '', email: '', phone: '', companyName: '', gstNumber: '', assignedStaffId: '' });
      alert('Customer added successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleViewHistory = async (cust: any) => {
    setSelectedCustomer(cust);
    try {
      const res = await api.get(`/customers/${cust._id || cust.id || cust.customerId}`);
      setCustomerHistory(res.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await api.put(`/customers/${selectedCustomer._id || selectedCustomer.id}`, selectedCustomer);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer ${name}? All associated records will be removed.`)) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Customer Management</h2>
          <p className="text-xs text-[#81758A] mt-0.5">
            View customer subscriber histories, assign account managers, and manage account statuses.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white text-xs font-bold shadow-[0_4px_14px_rgba(103,59,112,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, email or phone..."
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

      {/* Customer Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description="Add a new customer manually or allow customers to sign up through public registration."
          actionText="Add Customer"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Customer Info</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Active Subs</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {customers.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{c.customerId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{c.name}</p>
                      <p className="text-[11px] text-[#81758A]">{c.email}</p>
                      {c.phone && <p className="text-[10px] text-[#A77BB8]">{c.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#34243A]">
                      {c.companyName || <span className="text-[#81758A] italic">Individual</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#E9DDF2] text-[#4B2455] font-bold text-[11px]">
                        {c.activeSubscriptions || 0} active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2E9467]">
                      ₹{(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.assignedStaffId ? (
                        <span className="font-bold text-[#673B70] bg-[#F3EFFF] px-2 py-0.5 rounded-lg border border-[#D8C2E5] text-[10px]">
                          {c.assignedStaffId}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#81758A] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleViewHistory(c)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#673B70] hover:bg-[#F3EFFF]"
                        title="View Full History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#34243A] hover:bg-[#F3EFFF]"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id || c.id, c.name)}
                        className="p-1.5 rounded-lg text-[#81758A] hover:text-[#D85B69] hover:bg-rose-50"
                        title="Delete Customer"
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

      {/* Customer Detail & History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={`Customer History: ${selectedCustomer.name} (${selectedCustomer.customerId})`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5]">
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Email</span>
                <p className="font-bold text-[#34243A] mt-0.5 truncate">{selectedCustomer.email}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Company</span>
                <p className="font-bold text-[#34243A] mt-0.5">{selectedCustomer.companyName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#81758A] uppercase font-bold">Assigned Staff</span>
                <p className="font-bold text-[#673B70] mt-0.5">{selectedCustomer.assignedStaffId || 'Unassigned'}</p>
              </div>
            </div>

            {/* Subscriptions section */}
            <div>
              <h4 className="font-black text-sm text-[#34243A] flex items-center gap-1.5 mb-2">
                <Repeat className="w-4 h-4 text-[#673B70]" /> Subscriptions ({customerHistory.subscriptions?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E6DDEC] divide-y divide-[#E6DDEC]">
                {(customerHistory.subscriptions || []).length === 0 ? (
                  <p className="p-3 text-center text-[#81758A]">No subscriptions recorded.</p>
                ) : (
                  customerHistory.subscriptions.map((s: any) => (
                    <div key={s._id || s.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#34243A]">{s.productName} ({s.planName})</p>
                        <p className="text-[10px] text-[#81758A]">
                          Expires: {new Date(s.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#673B70]">₹{s.finalAmount}</p>
                        <Badge status={s.status} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payments section */}
            <div>
              <h4 className="font-black text-sm text-[#34243A] flex items-center gap-1.5 mb-2">
                <CreditCard className="w-4 h-4 text-[#2E9467]" /> Payments ({customerHistory.payments?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E6DDEC] divide-y divide-[#E6DDEC]">
                {(customerHistory.payments || []).length === 0 ? (
                  <p className="p-3 text-center text-[#81758A]">No payments recorded.</p>
                ) : (
                  customerHistory.payments.map((p: any) => (
                    <div key={p._id || p.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#34243A]">{p.paymentId} • {p.method}</p>
                        <p className="text-[10px] text-[#81758A]">Ref: {p.transactionRef}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2E9467]">₹{p.amount}</p>
                        <Badge status={p.status} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Customer Record">
        <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              placeholder="e.g. Anand Kumar"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                placeholder="anand@company.com"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="+91 98765 11223"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={newCust.companyName}
                onChange={(e) => setNewCust({ ...newCust, companyName: e.target.value })}
                placeholder="e.g. Apex Tech"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">GST Number</label>
              <input
                type="text"
                value={newCust.gstNumber}
                onChange={(e) => setNewCust({ ...newCust, gstNumber: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#34243A] uppercase mb-1">Assign to Staff Member</label>
            <select
              value={newCust.assignedStaffId}
              onChange={(e) => setNewCust({ ...newCust, assignedStaffId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70] font-semibold"
            >
              <option value="">-- No Assigned Staff --</option>
              {staffList.map((st) => (
                <option key={st._id || st.id} value={st.staffId}>
                  {st.name} ({st.staffId}) - {st.designation}
                </option>
              ))}
            </select>
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Customer: ${selectedCustomer.name}`}>
          <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-[#34243A] uppercase mb-1">Name</label>
              <input
                type="text"
                value={selectedCustomer.name}
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">Status</label>
                <select
                  value={selectedCustomer.status}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#34243A] uppercase mb-1">Assigned Staff</label>
                <select
                  value={selectedCustomer.assignedStaffId || ''}
                  onChange={(e) => setSelectedCustomer({ ...selectedCustomer, assignedStaffId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E6DDEC] bg-white focus:outline-none focus:border-[#673B70]"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((st) => (
                    <option key={st._id || st.id} value={st.staffId}>
                      {st.name} ({st.staffId})
                    </option>
                  ))}
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
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
