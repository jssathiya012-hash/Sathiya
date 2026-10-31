import { DB } from '../models/index.js';

export async function getCompanySettings(req, res) {
  try {
    let settings = await DB.CompanySettings().findOne();
    if (!settings) {
      settings = await DB.CompanySettings().create({
        companyName: 'Brightloop Software',
        brandName: 'SmartSub',
        tagline: 'Unified Subscription Management System',
        contactEmail: 'support@brightloop.com',
        contactPhone: '+91 98765 43210',
        address: 'Brightloop Tower, Sector 62, Bangalore, India',
        gstNumber: '29ABCDE1234F1Z5',
        taxRatePercent: 18,
        currency: 'INR',
        currencySymbol: '₹',
        testPaymentMode: true
      });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCompanySettings(req, res) {
  try {
    const updates = req.body;
    let settings = await DB.CompanySettings().findOne();

    let updated;
    if (settings) {
      updated = await DB.CompanySettings().findByIdAndUpdate(settings._id || settings.id, updates);
    } else {
      updated = await DB.CompanySettings().create(updates);
    }

    await DB.ActivityLog().create({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SETTINGS_UPDATED',
      description: 'Admin updated application and company settings',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Settings saved successfully.', settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
