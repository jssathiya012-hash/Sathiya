import { DB } from '../models/index.js';

export async function getAllProducts(req, res) {
  try {
    const products = await DB.Product().find();
    const plans = await DB.Plan().find();
    const subscriptions = await DB.Subscription().find();

    const enriched = products.map(prod => {
      const prodPlans = plans.filter(p => p.productId === prod._id || p.productId === prod.id || p.productName === prod.name);
      const prodSubs = subscriptions.filter(s => s.productId === prod._id || s.productId === prod.id || s.productName === prod.name);
      const activeSubs = prodSubs.filter(s => s.status === 'Active');

      return {
        ...prod,
        plans: prodPlans,
        totalPlans: prodPlans.length,
        totalSubscribers: prodSubs.length,
        activeSubscribers: activeSubs.length
      };
    });

    res.json({ success: true, count: enriched.length, products: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, type, category, description, icon, features, isActive } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Product name and type are required.' });
    }

    const product = await DB.Product().create({
      name,
      type,
      category: category || 'Software',
      description: description || '',
      icon: icon || 'Package',
      features: features || [],
      isActive: isActive !== undefined ? isActive : true
    });

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PRODUCT_CREATED',
      description: `Created new product: ${name} (${type})`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Product created successfully.', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, type, category, description, icon, features, isActive } = req.body;

    const product = await DB.Product().findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const updates = {};
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (icon) updates.icon = icon;
    if (features) updates.features = features;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await DB.Product().findByIdAndUpdate(id, updates);
    res.json({ success: true, message: 'Product updated successfully.', product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await DB.Product().findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Check if plans exist
    const plans = await DB.Plan().find({ productId: id });
    if (plans.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product with ${plans.length} active subscription plan(s). Deactivate or delete plans first.`
      });
    }

    await DB.Product().findByIdAndDelete(id);

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PRODUCT_DELETED',
      description: `Deleted product ${product.name}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
