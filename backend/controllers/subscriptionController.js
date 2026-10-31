import { DB } from '../models/index.js';

export async function getAllSubscriptions(req, res) {
  try {
    const { status, search, customerId, productId } = req.query;
    let subs = await DB.Subscription().find();

    // Role-based filtering
    if (req.user.role === 'CUSTOMER') {
      subs = subs.filter(s => s.customerId === req.user.id || s.customerEmail === req.user.email);
    } else if (req.user.role === 'STAFF') {
      const staffMember = await DB.Staff().findOne({ email: req.user.email });
      if (staffMember) {
        const assignedCustomers = await DB.Customer().find({ assignedStaffId: staffMember.staffId });
        const assignedIds = new Set(assignedCustomers.map(c => c.customerId));
        const assignedEmails = new Set(assignedCustomers.map(c => c.email));
        subs = subs.filter(s => assignedIds.has(s.customerId) || assignedEmails.has(s.customerEmail));
      }
    }

    if (status && status !== 'all') {
      subs = subs.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    if (customerId) {
      subs = subs.filter(s => s.customerId === customerId);
    }
    if (productId && productId !== 'all') {
      subs = subs.filter(s => s.productId === productId || s.productName === productId);
    }
    if (search) {
      const q = search.toLowerCase();
      subs = subs.filter(s =>
        s.subscriptionId.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerEmail.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: subs.length, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSubscriptionById(req, res) {
  try {
    const { id } = req.params;
    const sub = await DB.Subscription().findById(id) || await DB.Subscription().findOne({ subscriptionId: id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

    // Customer permission check
    if (req.user.role === 'CUSTOMER' && sub.customerId !== req.user.id && sub.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this subscription.' });
    }

    const invoices = await DB.Invoice().find({ subscriptionId: sub.subscriptionId });
    const payments = await DB.Payment().find({ subscriptionId: sub.subscriptionId });

    res.json({ success: true, subscription: sub, invoices, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createSubscription(req, res) {
  try {
    const {
      customerId, customerName, customerEmail,
      productId, productName,
      planId, planName, period,
      originalAmount, discountAmount, taxAmount, finalAmount,
      paymentMethod, transactionRef
    } = req.body;

    if (!productId || !planId || !finalAmount) {
      return res.status(400).json({ success: false, message: 'Missing subscription details.' });
    }

    let targetCustId = customerId;
    let targetCustName = customerName;
    let targetCustEmail = customerEmail;

    if (req.user.role === 'CUSTOMER') {
      targetCustId = req.user.id;
      targetCustName = req.user.name;
      targetCustEmail = req.user.email;
    }

    const durationMap = { 'Monthly': 1, 'Quarterly': 3, 'Half-Yearly': 6, 'Yearly': 12 };
    const months = durationMap[period || 'Monthly'] || 1;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const count = await DB.Subscription().countDocuments();
    const subscriptionId = `SUB-${String(count + 1001).padStart(4, '0')}`;

    const newSub = await DB.Subscription().create({
      subscriptionId,
      customerId: targetCustId || 'CUST-001',
      customerName: targetCustName || 'Valued Customer',
      customerEmail: targetCustEmail || 'customer@example.com',
      productId,
      productName: productName || 'Software Subscription',
      planId,
      planName: planName || 'Standard Plan',
      period: period || 'Monthly',
      durationMonths: months,
      originalAmount: Number(originalAmount) || Number(finalAmount),
      discountAmount: Number(discountAmount) || 0,
      taxAmount: Number(taxAmount) || 0,
      finalAmount: Number(finalAmount),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextRenewalDate: endDate.toISOString(),
      status: 'Active',
      paymentStatus: 'Successful',
      autoRenew: true
    });

    // Auto generate payment
    const paymentCount = await DB.Payment().countDocuments();
    const paymentId = `PAY-${String(paymentCount + 5001).padStart(4, '0')}`;
    const txRef = transactionRef || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    await DB.Payment().create({
      paymentId,
      subscriptionId,
      customerId: targetCustId,
      customerName: targetCustName,
      customerEmail: targetCustEmail,
      amount: Number(finalAmount),
      discount: Number(discountAmount) || 0,
      tax: Number(taxAmount) || 0,
      method: paymentMethod || 'Card',
      transactionRef: txRef,
      status: 'Successful',
      paidAt: new Date().toISOString()
    });

    // Auto generate invoice
    const invCount = await DB.Invoice().countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 101).padStart(4, '0')}`;

    await DB.Invoice().create({
      invoiceNumber,
      subscriptionId,
      customerId: targetCustId,
      customerName: targetCustName,
      customerEmail: targetCustEmail,
      productName,
      planName,
      subscriptionDuration: `${months} Month${months > 1 ? 's' : ''}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      originalPrice: Number(originalAmount) || Number(finalAmount),
      discountAmount: Number(discountAmount) || 0,
      taxAmount: Number(taxAmount) || 0,
      finalAmount: Number(finalAmount),
      paymentMethod: paymentMethod || 'Card',
      transactionRef: txRef,
      paymentStatus: 'Paid'
    });

    // Notify customer & admins
    await DB.Notification().create({
      userId: targetCustId,
      role: 'CUSTOMER',
      title: 'Subscription Activated!',
      description: `Your subscription to ${productName} (${planName}) is now active until ${endDate.toLocaleDateString()}.`,
      type: 'subscription_success',
      read: false
    });

    await DB.Notification().create({
      userId: 'admin',
      role: 'ADMIN',
      title: 'New Subscription Purchase',
      description: `${targetCustName} purchased ${productName} (${planName}) for ₹${finalAmount}.`,
      type: 'new_subscription',
      read: false
    });

    // Log Activity
    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBSCRIPTION_ACTIVATED',
      description: `Subscription ${subscriptionId} for ${productName} (${planName}) activated by ${targetCustName}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created and activated successfully.',
      subscription: newSub,
      invoiceNumber,
      paymentId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function renewSubscription(req, res) {
  try {
    const { id } = req.params;
    const sub = await DB.Subscription().findById(id) || await DB.Subscription().findOne({ subscriptionId: id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

    const currentEnd = new Date(sub.endDate);
    const baseDate = currentEnd > new Date() ? currentEnd : new Date();
    baseDate.setMonth(baseDate.getMonth() + (sub.durationMonths || 1));

    const updated = await DB.Subscription().findByIdAndUpdate(sub._id || sub.id, {
      endDate: baseDate.toISOString(),
      nextRenewalDate: baseDate.toISOString(),
      status: 'Active',
      paymentStatus: 'Successful'
    });

    // Create renewal payment and invoice
    const paymentCount = await DB.Payment().countDocuments();
    const paymentId = `PAY-${String(paymentCount + 5001).padStart(4, '0')}`;
    const txRef = `TXN-RNW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    await DB.Payment().create({
      paymentId,
      subscriptionId: sub.subscriptionId,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      amount: sub.finalAmount,
      method: 'Card',
      transactionRef: txRef,
      status: 'Successful',
      paidAt: new Date().toISOString()
    });

    const invCount = await DB.Invoice().countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 101).padStart(4, '0')}`;

    await DB.Invoice().create({
      invoiceNumber,
      subscriptionId: sub.subscriptionId,
      customerId: sub.customerId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      productName: sub.productName,
      planName: sub.planName,
      subscriptionDuration: `${sub.durationMonths} Month renewal`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      originalPrice: sub.originalAmount || sub.finalAmount,
      discountAmount: sub.discountAmount || 0,
      taxAmount: sub.taxAmount || 0,
      finalAmount: sub.finalAmount,
      paymentMethod: 'Card',
      transactionRef: txRef,
      paymentStatus: 'Paid'
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBSCRIPTION_RENEWED',
      description: `Subscription ${sub.subscriptionId} (${sub.productName}) renewed until ${baseDate.toLocaleDateString()}`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Subscription successfully renewed until ${baseDate.toLocaleDateString()}.`,
      subscription: updated,
      invoiceNumber
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const { id } = req.params;
    const sub = await DB.Subscription().findById(id) || await DB.Subscription().findOne({ subscriptionId: id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

    const updated = await DB.Subscription().findByIdAndUpdate(sub._id || sub.id, {
      status: 'Cancelled',
      autoRenew: false
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SUBSCRIPTION_CANCELLED',
      description: `Subscription ${sub.subscriptionId} (${sub.productName}) was cancelled`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Subscription cancelled successfully.', subscription: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function pauseSubscription(req, res) {
  try {
    const { id } = req.params;
    const sub = await DB.Subscription().findById(id) || await DB.Subscription().findOne({ subscriptionId: id });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

    const newStatus = sub.status === 'Paused' ? 'Active' : 'Paused';
    const updated = await DB.Subscription().findByIdAndUpdate(sub._id || sub.id, { status: newStatus });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: newStatus === 'Paused' ? 'SUBSCRIPTION_PAUSED' : 'SUBSCRIPTION_RESUMED',
      description: `Subscription ${sub.subscriptionId} was ${newStatus.toLowerCase()}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: `Subscription is now ${newStatus}.`, subscription: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
