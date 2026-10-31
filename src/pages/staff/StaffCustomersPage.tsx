import React, { useState, useEffect } from 'react';
import { Users, Search, Eye } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';

export const StaffCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    api.get(`/customers?search=${encodeURIComponent(search)}`)
      .then((res) => setCustomers(res.data.customers || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Assigned Customer Accounts</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          View and assist customers assigned to your support and success queue.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E6DDEC] shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-[#81758A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned customers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DDEC] bg-white text-xs text-[#34243A] focus:outline-none focus:border-[#673B70]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Customers Assigned"
          description="You currently do not have any customers assigned to your account."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Company</th>
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
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#81758A]">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4">{c.companyName || 'Individual'}</td>
                    <td className="py-3.5 px-4"><Badge status={c.status} size="sm" /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3EFFF] hover:bg-[#E9DDF2] text-[#673B70] font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-[#D8C2E5]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Profile: ${selectedCustomer.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#81758A]">Customer ID:</span>
                <span className="font-mono font-bold text-[#673B70]">{selectedCustomer.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Email:</span>
                <span className="font-bold text-[#34243A]">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Phone:</span>
                <span className="font-bold text-[#34243A]">{selectedCustomer.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Company:</span>
                <span className="font-bold text-[#34243A]">{selectedCustomer.companyName || 'Individual'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81758A]">Account Status:</span>
                <Badge status={selectedCustomer.status} size="sm" />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6DDEC] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
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
