import React, { useState, useEffect } from 'react';
import { FileText, Eye, Printer } from 'lucide-react';
import { api } from '../../api/client';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { BrandLogo } from '../../components/BrandLogo';

export const CustomerInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.get('/invoices')
      .then((res) => setInvoices(res.data.invoices || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleViewInvoice = async (inv: any) => {
    try {
      const res = await api.get(`/invoices/${inv._id || inv.id || inv.invoiceNumber}`);
      setSelectedInvoice(res.data.invoice);
      setCompanyData(res.data.company);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#34243A] tracking-tight">My Invoices & Receipts</h2>
        <p className="text-xs text-[#81758A] mt-0.5">
          Download GST tax invoices, receipts, and proofs of purchase.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#673B70] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No Invoices Yet"
          description="Invoices generated upon subscription payments will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6DDEC] shadow-[0_4px_25px_rgba(103,59,112,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFFF] text-[#81758A] uppercase tracking-wider font-bold border-b border-[#E6DDEC]">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Product & Plan</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDEC]">
                {invoices.map((inv) => (
                  <tr key={inv._id || inv.id} className="hover:bg-[#F3EFFF]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#673B70]">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#34243A]">{inv.productName}</p>
                      <p className="text-[11px] text-[#81758A]">{inv.planName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#34243A]">{inv.subscriptionDuration || '1 Month'}</td>
                    <td className="py-3.5 px-4 font-black text-[#34243A]">₹{inv.finalAmount}</td>
                    <td className="py-3.5 px-4 text-[#81758A]">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><Badge status={inv.paymentStatus || 'Paid'} size="sm" /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewInvoice(inv)}
                        className="px-3 py-1.5 rounded-xl bg-[#F3EFFF] hover:bg-[#E9DDF2] text-[#673B70] font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-[#D8C2E5]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Invoice: ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs printable-invoice bg-white p-2">
            <div className="flex justify-between items-start pb-4 border-b border-[#E6DDEC]">
              <div>
                <BrandLogo size="md" />
                <p className="text-[11px] text-[#81758A] mt-2 leading-relaxed">
                  {companyData?.companyName || 'Brightloop Software'}<br />
                  GSTIN: {companyData?.gstNumber || '29ABCDE1234F1Z5'}
                </p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#2E9467] font-black text-xs border border-emerald-200">
                  {selectedInvoice.paymentStatus || 'PAID'}
                </span>
                <p className="font-mono font-bold text-sm text-[#34243A] mt-2">{selectedInvoice.invoiceNumber}</p>
                <p className="text-[11px] text-[#81758A]">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F3EFFF] rounded-2xl border border-[#D8C2E5] flex justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#81758A]">Billed To:</span>
                <p className="font-bold text-[#34243A] text-sm mt-0.5">{selectedInvoice.customerName}</p>
                <p className="text-[#81758A]">{selectedInvoice.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#81758A]">Method:</span>
                <p className="font-semibold text-[#34243A] mt-0.5">{selectedInvoice.paymentMethod || 'Card'}</p>
                <p className="font-mono text-[#673B70]">{selectedInvoice.transactionRef}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6DDEC] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#F3EFFF] text-[#81758A] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDEC]">
                  <tr>
                    <td className="p-3">
                      <p className="font-bold text-[#34243A]">{selectedInvoice.productName}</p>
                      <p className="text-[10px] text-[#81758A]">{selectedInvoice.planName} ({selectedInvoice.subscriptionDuration})</p>
                    </td>
                    <td className="p-3 text-right font-bold text-[#34243A]">₹{selectedInvoice.originalPrice || selectedInvoice.finalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="w-64 ml-auto space-y-1.5 text-right">
              <div className="flex justify-between text-[#81758A]">
                <span>Original Subtotal:</span>
                <span className="font-bold text-[#34243A]">₹{selectedInvoice.originalPrice || selectedInvoice.finalAmount}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-[#2E9467] font-bold">
                  <span>Discount:</span>
                  <span>-₹{selectedInvoice.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#81758A]">
                <span>GST (18%):</span>
                <span className="font-bold text-[#34243A]">₹{selectedInvoice.taxAmount || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E6DDEC] text-base font-black text-[#34243A]">
                <span>Total:</span>
                <span className="text-[#673B70]">₹{selectedInvoice.finalAmount}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6DDEC] flex justify-end print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-[#673B70] hover:bg-[#4B2455] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
