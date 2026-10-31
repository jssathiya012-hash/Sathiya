import { DB } from '../models/index.js';

export async function getAllDiscounts(req, res) {
  try {
    const discounts = await DB.Discount().find();
    res.json({ success: true, count: discounts.length, discounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function validateDiscount(req, res) {
  try {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Discount code is required.' });
    }

    const discount = await DB.Discount().findOne({ code: code.toUpperCase().trim() });
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Invalid discount code.' });
    }

    if (!discount.isActive) {
      return res.status(400).json({ success: false, message: 'This discount code is inactive.' });
    }

    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return res.status(400).json({ success: false, message: 'This offer has not started yet.' });
    }

    if (discount.endDate && new Date(discount.endDate) < now) {
      return res.status(400).json({ success: false, message: 'This offer has expired.' });
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ success: false, message: 'This discount code has reached its maximum usage limit.' });
    }

    const subtotal = Number(amount) || 0;
    if (discount.minPurchase && subtotal < discount.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${discount.minPurchase} required to use code ${discount.code}.`
      });
    }

    let discountValue = 0;
    if (discount.type === 'PERCENT') {
      discountValue = Math.round((subtotal * discount.value) / 100);
    } else {
      discountValue = Math.min(discount.value, subtotal);
    }

    res.json({
      success: true,
      message: `Discount code applied: ${discount.code} (-₹${discountValue})`,
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount: discountValue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createDiscount(req, res) {
  try {
    const { code, name, type, value, minPurchase, startDate, endDate, usageLimit, isActive } = req.body;
    if (!code || value === undefined) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    const existing = await DB.Discount().findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A discount with this code already exists.' });
    }

    const discount = await DB.Discount().create({
      code: code.toUpperCase().trim(),
      name: name || code.toUpperCase().trim(),
      type: type || 'PERCENT',
      value: Number(value),
      minPurchase: Number(minPurchase) || 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DISCOUNT_CREATED',
      description: `Created discount code ${discount.code} (${discount.value}${discount.type === 'PERCENT' ? '%' : '₹'})`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Discount code created successfully.', discount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateDiscount(req, res) {
  try {
    const { id } = req.params;
    const { name, type, value, minPurchase, startDate, endDate, usageLimit, isActive } = req.body;

    const discount = await DB.Discount().findById(id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (value !== undefined) updates.value = Number(value);
    if (minPurchase !== undefined) updates.minPurchase = Number(minPurchase);
    if (startDate) updates.startDate = startDate;
    if (endDate) updates.endDate = endDate;
    if (usageLimit !== undefined) updates.usageLimit = Number(usageLimit);
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await DB.Discount().findByIdAndUpdate(id, updates);
    res.json({ success: true, message: 'Discount updated successfully.', discount: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteDiscount(req, res) {
  try {
    const { id } = req.params;
    const discount = await DB.Discount().findById(id);
    if (!discount) return res.status(404).json({ success: false, message: 'Discount not found.' });

    await DB.Discount().findByIdAndDelete(id);

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DISCOUNT_DELETED',
      description: `Deleted discount code ${discount.code}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Discount deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
