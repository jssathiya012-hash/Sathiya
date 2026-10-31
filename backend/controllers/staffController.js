import bcrypt from 'bcryptjs';
import { DB } from '../models/index.js';

export async function getAllStaff(req, res) {
  try {
    const { search, status, department } = req.query;
    let staffList = await DB.Staff().find();

    if (search) {
      const q = search.toLowerCase();
      staffList = staffList.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.staffId.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') {
      staffList = staffList.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }
    if (department && department !== 'all') {
      staffList = staffList.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }

    res.json({ success: true, count: staffList.length, staff: staffList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createStaff(req, res) {
  try {
    const { name, email, phone, designation, department, permissions } = req.body;
    if (!name || !email || !designation || !department) {
      return res.status(400).json({ success: false, message: 'Name, email, designation, and department are required.' });
    }

    const existingUser = await DB.User().findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const count = await DB.Staff().countDocuments();
    const staffId = `STF-${String(count + 101).padStart(3, '0')}`;
    const tempPassword = 'Staff@' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await DB.User().create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      role: 'STAFF',
      isActive: true
    });

    const staff = await DB.Staff().create({
      userId: user._id || user.id,
      staffId,
      name,
      email: user.email,
      phone: phone || '',
      designation,
      department,
      status: 'Active',
      permissions: permissions || {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewSubscriptions: true,
        canRenewSubscriptions: true,
        canViewPayments: true,
        canViewInvoices: true
      },
      tempPassword,
      mustChangePassword: true
    });

    // Log Activity
    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'STAFF_CREATED',
      description: `Admin created staff account for ${name} (${staffId}) with designation ${designation}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Staff account created successfully with Staff ID ${staffId}.`,
      staff,
      temporaryCredentials: {
        staffId,
        email: user.email,
        temporaryPassword: tempPassword
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, designation, department, status, permissions } = req.body;

    const staff = await DB.Staff().findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (designation) updates.designation = designation;
    if (department) updates.department = department;
    if (status) updates.status = status;
    if (permissions) updates.permissions = permissions;

    const updated = await DB.Staff().findByIdAndUpdate(id, updates);

    // Also update User record if name or status changed
    if (staff.userId) {
      await DB.User().findByIdAndUpdate(staff.userId, {
        ...(name ? { name } : {}),
        ...(status ? { isActive: status === 'Active' } : {})
      });
    }

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'STAFF_UPDATED',
      description: `Updated staff profile for ${staff.name} (${staff.staffId})`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Staff member updated successfully.', staff: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function resetStaffPassword(req, res) {
  try {
    const { id } = req.params;
    const staff = await DB.Staff().findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found.' });

    const newTempPassword = 'Staff@' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    if (staff.userId) {
      await DB.User().findByIdAndUpdate(staff.userId, { password: hashedPassword });
    }
    await DB.Staff().findByIdAndUpdate(id, {
      tempPassword: newTempPassword,
      mustChangePassword: true
    });

    res.json({
      success: true,
      message: 'Password reset successfully.',
      temporaryPassword: newTempPassword
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    const staff = await DB.Staff().findById(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found.' });

    if (staff.userId) {
      await DB.User().findByIdAndDelete(staff.userId);
    }
    await DB.Staff().findByIdAndDelete(id);

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'STAFF_DELETED',
      description: `Admin deleted staff member ${staff.name} (${staff.staffId})`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Staff member deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
