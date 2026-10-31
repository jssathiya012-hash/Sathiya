import bcrypt from 'bcryptjs';
import { DB } from '../models/index.js';

export async function getAllCustomers(req, res) {
  try {
    const { search, status, staffId } = req.query;
    let customers = await DB.Customer().find();

    // If requester is STAFF, filter by assigned customers unless they have permission to view all
    if (req.user.role === 'STAFF') {
      const staffMember = await DB.Staff().findOne({ email: req.user.email });
      if (staffMember) {
        customers = customers.filter(c => !c.assignedStaffId || c.assignedStaffId === staffMember.staffId);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    }
    if (status && status !== 'all') {
      customers = customers.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (staffId && staffId !== 'all') {
      customers = customers.filter(c => c.assignedStaffId === staffId);
    }

    // Attach active subscription count and total spent
    const subs = await DB.Subscription().find();
    const payments = await DB.Payment().find();

    const enriched = customers.map(c => {
      const custSubs = subs.filter(s => s.customerId === c.customerId || s.customerEmail === c.email);
      const activeSubs = custSubs.filter(s => s.status === 'Active');
      const custPayments = payments.filter(p => (p.customerId === c.customerId || p.customerEmail === c.email) && p.status === 'Successful');
      const totalSpent = custPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

      return {
        ...c,
        totalSubscriptions: custSubs.length,
        activeSubscriptions: activeSubs.length,
        totalSpent
      };
    });

    res.json({ success: true, count: enriched.length, customers: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await DB.Customer().findById(id) || await DB.Customer().findOne({ customerId: id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const subscriptions = await DB.Subscription().find({ customerId: customer.customerId });
    const payments = await DB.Payment().find({ customerId: customer.customerId });
    const invoices = await DB.Invoice().find({ customerId: customer.customerId });

    res.json({
      success: true,
      customer,
      subscriptions,
      payments,
      invoices
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, email, phone, companyName, gstNumber, billingAddress, assignedStaffId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await DB.User().findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const tempPassword = 'Cust@' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await DB.User().create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      role: 'CUSTOMER',
      isActive: true
    });

    const customerId = 'CUST-' + Math.floor(100000 + Math.random() * 900000);
    const customer = await DB.Customer().create({
      userId: user._id || user.id,
      customerId,
      name,
      email: user.email,
      phone: phone || '',
      companyName: companyName || '',
      gstNumber: gstNumber || '',
      billingAddress: billingAddress || {},
      status: 'Active',
      assignedStaffId: assignedStaffId || ''
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CUSTOMER_CREATED',
      description: `Created customer record for ${name} (${customerId})`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      customer,
      temporaryPassword: tempPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, companyName, gstNumber, status, assignedStaffId, billingAddress } = req.body;

    const customer = await DB.Customer().findById(id) || await DB.Customer().findOne({ customerId: id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (companyName !== undefined) updates.companyName = companyName;
    if (gstNumber !== undefined) updates.gstNumber = gstNumber;
    if (status) updates.status = status;
    if (assignedStaffId !== undefined) updates.assignedStaffId = assignedStaffId;
    if (billingAddress) updates.billingAddress = billingAddress;

    const updated = await DB.Customer().findByIdAndUpdate(customer._id || customer.id, updates);

    if (customer.userId) {
      await DB.User().findByIdAndUpdate(customer.userId, {
        ...(name ? { name } : {}),
        ...(status ? { isActive: status === 'Active' } : {})
      });
    }

    res.json({ success: true, message: 'Customer updated successfully.', customer: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const customer = await DB.Customer().findById(id) || await DB.Customer().findOne({ customerId: id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    if (customer.userId) {
      await DB.User().findByIdAndDelete(customer.userId);
    }
    await DB.Customer().findByIdAndDelete(customer._id || customer.id);

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CUSTOMER_DELETED',
      description: `Deleted customer ${customer.name} (${customer.customerId})`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
