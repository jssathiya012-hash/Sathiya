import { DB } from '../models/index.js';

export async function getAllInvoices(req, res) {
  try {
    const { status, search, customerId } = req.query;
    let invoices = await DB.Invoice().find();

    if (req.user.role === 'CUSTOMER') {
      invoices = invoices.filter(i => i.customerId === req.user.id || i.customerEmail === req.user.email);
    }

    if (status && status !== 'all') {
      invoices = invoices.filter(i => i.paymentStatus.toLowerCase() === status.toLowerCase());
    }
    if (customerId) {
      invoices = invoices.filter(i => i.customerId === customerId);
    }
    if (search) {
      const q = search.toLowerCase();
      invoices = invoices.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.productName.toLowerCase().includes(q) ||
        (i.transactionRef && i.transactionRef.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: invoices.length, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await DB.Invoice().findById(id) || await DB.Invoice().findOne({ invoiceNumber: id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    if (req.user.role === 'CUSTOMER' && invoice.customerId !== req.user.id && invoice.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
    }

    const settings = await DB.CompanySettings().findOne() || {
      companyName: 'Brightloop Software',
      brandName: 'SmartSub',
      contactEmail: 'billing@brightloop.com',
      contactPhone: '+91 98765 43210',
      address: 'Brightloop Tower, Sector 62, Bangalore, India',
      gstNumber: '29ABCDE1234F1Z5'
    };

    res.json({ success: true, invoice, company: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
