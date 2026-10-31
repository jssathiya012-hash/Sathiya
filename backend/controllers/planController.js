import { DB } from '../models/index.js';

export async function getAllPlans(req, res) {
  try {
    const { productId, period } = req.query;
    let plans = await DB.Plan().find();
    const subs = await DB.Subscription().find();

    if (productId && productId !== 'all') {
      plans = plans.filter(p => p.productId === productId || p.productName === productId);
    }
    if (period && period !== 'all') {
      plans = plans.filter(p => p.period.toLowerCase() === period.toLowerCase());
    }

    const enriched = plans.map(p => {
      const activeSubs = subs.filter(s => (s.planId === p._id || s.planId === p.id || s.planName === p.name) && s.status === 'Active');
      return {
        ...p,
        activeSubscribers: activeSubs.length
      };
    });

    res.json({ success: true, count: enriched.length, plans: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPlan(req, res) {
  try {
    const { productId, productName, name, period, price, features, minQuantity, recommended, isActive } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Plan name and price are required.' });
    }

    const durationMap = {
      'Monthly': 1,
      'Quarterly': 3,
      'Half-Yearly': 6,
      'Yearly': 12
    };

    const selectedPeriod = period || 'Monthly';
    const durationMonths = durationMap[selectedPeriod] || 1;

    let prodName = productName;
    if (productId && !prodName) {
      const prod = await DB.Product().findById(productId);
      if (prod) prodName = prod.name;
    }

    const plan = await DB.Plan().create({
      productId: productId || '',
      productName: prodName || 'General Subscription',
      name,
      period: selectedPeriod,
      durationMonths,
      price: Number(price),
      features: features || [],
      minQuantity: minQuantity || 1,
      recommended: Boolean(recommended),
      isActive: isActive !== undefined ? isActive : true
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PLAN_CREATED',
      description: `Created new plan: ${name} (₹${price}/${selectedPeriod}) for ${prodName}`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Plan created successfully.', plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const { name, period, price, features, minQuantity, recommended, isActive } = req.body;

    const plan = await DB.Plan().findById(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (period) {
      updates.period = period;
      const durationMap = { 'Monthly': 1, 'Quarterly': 3, 'Half-Yearly': 6, 'Yearly': 12 };
      updates.durationMonths = durationMap[period] || 1;
    }
    if (price !== undefined) updates.price = Number(price);
    if (features) updates.features = features;
    if (minQuantity !== undefined) updates.minQuantity = minQuantity;
    if (recommended !== undefined) updates.recommended = recommended;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await DB.Plan().findByIdAndUpdate(id, updates);
    res.json({ success: true, message: 'Plan updated successfully.', plan: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const plan = await DB.Plan().findById(id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const subs = await DB.Subscription().find({ planId: id, status: 'Active' });
    if (subs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${subs.length} active subscriber(s). Deactivate it instead.`
      });
    }

    await DB.Plan().findByIdAndDelete(id);

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PLAN_DELETED',
      description: `Deleted plan ${plan.name}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Plan deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
