import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DB } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop-smartsub-jwt-secret-key-2026';

export async function login(req, res) {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await DB.User().findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated or suspended. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const expiresIn = rememberMe ? '30d' : '24h';
    const payload = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    // Log login activity
    await DB.ActivityLog().create({
      userId: user._id || user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      description: `${user.role} ${user.name} logged in successfully`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

export async function register(req, res) {
  try {
    const { name, email, phone, password, companyName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await DB.User().findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await DB.User().create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      role: 'CUSTOMER',
      isActive: true
    });

    const customerId = 'CUST-' + Math.floor(100000 + Math.random() * 900000);
    await DB.Customer().create({
      userId: newUser._id || newUser.id,
      customerId,
      name,
      email: newUser.email,
      phone: phone || '',
      companyName: companyName || '',
      status: 'Active',
      assignedStaffId: ''
    });

    // Notify admins
    await DB.Notification().create({
      userId: 'admin',
      role: 'ADMIN',
      title: 'New Customer Registered',
      description: `${name} (${email}) created a new customer account.`,
      type: 'customer_registered',
      read: false
    });

    const payload = {
      id: newUser._id || newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'CUSTOMER'
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SmartSub.',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: 'CUSTOMER',
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await DB.User().findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal account existence for security
      return res.json({ success: true, message: 'If that email is registered, password reset instructions have been dispatched.' });
    }

    const resetToken = 'rst_' + Math.random().toString(36).substring(2, 12);
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await DB.User().findByIdAndUpdate(user._id || user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires
    });

    res.json({
      success: true,
      message: 'Password reset token generated successfully. In demo mode, use the provided token or link.',
      resetToken,
      resetUrl: `/reset-password/${resetToken}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    const user = await DB.User().findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await DB.User().findByIdAndUpdate(user._id || user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ success: true, message: 'Password has been successfully updated. You may now log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await DB.User().findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let extra = {};
    if (user.role === 'STAFF') {
      const staff = await DB.Staff().findOne({ email: user.email });
      if (staff) extra = { staffDetails: staff };
    } else if (user.role === 'CUSTOMER') {
      const cust = await DB.Customer().findOne({ email: user.email });
      if (cust) extra = { customerDetails: cust };
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        ...extra
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = await DB.User().findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await DB.User().findByIdAndUpdate(user._id || user.id, updates);
    res.json({ success: true, message: 'Profile updated successfully.', user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
