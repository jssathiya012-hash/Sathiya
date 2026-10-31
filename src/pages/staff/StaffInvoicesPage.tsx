import React, { useState, useEffect } from 'react';
import { FileText, Eye, Printer } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { BrandLogo } from '../../components/BrandLogo';

export const StaffInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    api.get('/invoices')
      .then((res) => setInvoices(res.data.invoices || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleView = async (inv: any) => {
    try {
      const res = await api.get(`/invoices/${inv._id || inv.id || inv.invoiceNumber}`);
      setSelectedInvoice(res.data.invoice);
      setCompanyData(res.data.company);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">Customer Invoices & Billing Records</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          Access customer payment records and invoices to resolve billing queries.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No Invoices Accessible"
          description="Invoices for customers will be viewable once issued."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product & Plan</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {invoices.map((inv) => (
                  <tr key={inv._id || inv.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{inv.customerName}</p>
                      <p className="text-[11px] text-[#81758A]">{inv.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">{inv.productName} ({inv.planName})</td>
                    <td className="py-3.5 px-4 font-bold text-[#34243A]">₹{inv.finalAmount}</td>
                    <td className="py-3.5 px-4 text-[#81758A]">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><Badge status={inv.paymentStatus || 'Paid'} size="sm" /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleView(inv)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3EFFF] hover:bg-[#E9DDF2] text-[#673B70] font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-[#D8C2E5]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice: ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b border-[#E6DDEC]">
              <div>
                <p className="font-bold text-sm text-[#34243A]">{selectedInvoice.customerName}</p>
                <p className="text-[#81758A]">{selectedInvoice.customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-[#673B70]">{selectedInvoice.invoiceNumber}</p>
                <Badge status={selectedInvoice.paymentStatus || 'Paid'} size="sm" />
              </div>
            </div>

            <div className="p-3 bg-[#F3EFFF] rounded-xl border border-[#D8C2E5] space-y-1.5">
              <div className="flex justify-between">
                <span>Product / Plan:</span>
                <span className="font-bold text-[#34243A]">{selectedInvoice.productName} ({selectedInvoice.planName})</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-[#34243A]">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Ref:</span>
                <span className="font-mono text-[#673B70]">{selectedInvoice.transactionRef}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D8C2E5] font-black text-sm">
                <span>Total Amount:</span>
                <span className="text-[#2E9467]">₹{selectedInvoice.finalAmount}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6DDEC] flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
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
