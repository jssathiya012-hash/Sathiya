import { DB } from '../models/index.js';

export async function getAllPayments(req, res) {
  try {
    const { status, method, search, customerId } = req.query;
    let payments = await DB.Payment().find();

    if (req.user.role === 'CUSTOMER') {
      payments = payments.filter(p => p.customerId === req.user.id || p.customerEmail === req.user.email);
    }

    if (status && status !== 'all') {
      payments = payments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (method && method !== 'all') {
      payments = payments.filter(p => p.method.toLowerCase() === method.toLowerCase());
    }
    if (customerId) {
      payments = payments.filter(p => p.customerId === customerId);
    }
    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(p =>
        p.paymentId.toLowerCase().includes(q) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        (p.transactionRef && p.transactionRef.toLowerCase().includes(q)) ||
        (p.subscriptionId && p.subscriptionId.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function refundPayment(req, res) {
  try {
    const { id } = req.params;
    const payment = await DB.Payment().findById(id) || await DB.Payment().findOne({ paymentId: id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found.' });

    if (payment.status === 'Refunded') {
      return res.status(400).json({ success: false, message: 'This payment has already been refunded.' });
    }

    const updated = await DB.Payment().findByIdAndUpdate(payment._id || payment.id, {
      status: 'Refunded'
    });

    if (payment.subscriptionId) {
      const sub = await DB.Subscription().findOne({ subscriptionId: payment.subscriptionId });
      if (sub) {
        await DB.Subscription().findByIdAndUpdate(sub._id || sub.id, { status: 'Cancelled' });
      }
    }

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PAYMENT_REFUNDED',
      description: `Admin processed refund of ₹${payment.amount} for payment ${payment.paymentId}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: `Payment of ₹${payment.amount} refunded successfully.`, payment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
