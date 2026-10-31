import bcrypt from 'bcryptjs';
import { DB } from './models/index.js';
import { connectDB } from './config/db.js';

export async function seedData() {
  await connectDB();

  console.log('Seeding initial SmartSub data...');

  // 1. Initial Admin
  const adminEmail = 'admin@brightloop.com';
  const existingAdmin = await DB.User().findOne({ email: adminEmail });
  if (!existingAdmin) {
    const adminPass = await bcrypt.hash('Admin@12345', 10);
    await DB.User().create({
      name: 'Super Administrator',
      email: adminEmail,
      password: adminPass,
      role: 'ADMIN',
      phone: '+91 98765 00001',
      isActive: true
    });
    console.log(' Created Super Admin: admin@brightloop.com / Admin@12345');
  }

  // 2. Staff Account
  const staffEmail = 'staff@brightloop.com';
  let staffUser = await DB.User().findOne({ email: staffEmail });
  if (!staffUser) {
    const staffPass = await bcrypt.hash('Staff@12345', 10);
    staffUser = await DB.User().create({
      name: 'Rahul Sharma',
      email: staffEmail,
      password: staffPass,
      role: 'STAFF',
      phone: '+91 98765 00002',
      isActive: true
    });

    await DB.Staff().create({
      userId: staffUser._id || staffUser.id,
      staffId: 'STF-101',
      name: 'Rahul Sharma',
      email: staffEmail,
      phone: '+91 98765 00002',
      designation: 'Senior Account Manager',
      department: 'Customer Success',
      status: 'Active',
      permissions: {
        canViewCustomers: true,
        canEditCustomers: true,
        canViewSubscriptions: true,
        canRenewSubscriptions: true,
        canViewPayments: true,
        canViewInvoices: true
      },
      tempPassword: '',
      mustChangePassword: false
    });
    console.log(' Created Staff: staff@brightloop.com / Staff@12345');
  }

  // 3. Demo Customer 1
  const custEmail = 'demo@brightloop.com';
  let custUser = await DB.User().findOne({ email: custEmail });
  if (!custUser) {
    const custPass = await bcrypt.hash('Demo@12345', 10);
    custUser = await DB.User().create({
      name: 'Aditi Rao',
      email: custEmail,
      password: custPass,
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      isActive: true
    });

    await DB.Customer().create({
      userId: custUser._id || custUser.id,
      customerId: 'CUST-100201',
      name: 'Aditi Rao',
      email: custEmail,
      phone: '+91 98765 43210',
      companyName: 'NextGen Digital Labs',
      gstNumber: '29AAACN1234M1Z2',
      billingAddress: {
        line1: '402 Prestige Cyber Towers',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India'
      },
      status: 'Active',
      assignedStaffId: 'STF-101'
    });
    console.log(' Created Customer 1: demo@brightloop.com / Demo@12345');
  }

  // Demo Customer 2 (Sathiya)
  const cust2Email = 'sathiya@brightloop.com';
  let cust2User = await DB.User().findOne({ email: cust2Email });
  if (!cust2User) {
    const cust2Pass = await bcrypt.hash('Sathiya@12345', 10);
    cust2User = await DB.User().create({
      name: 'Sathiya JS',
      email: cust2Email,
      password: cust2Pass,
      role: 'CUSTOMER',
      phone: '+91 98765 88990',
      isActive: true
    });

    await DB.Customer().create({
      userId: cust2User._id || cust2User.id,
      customerId: 'CUST-100202',
      name: 'Sathiya JS',
      email: cust2Email,
      phone: '+91 98765 88990',
      companyName: 'CloudStream Innovations',
      gstNumber: '29BBBCN5678M1Z3',
      billingAddress: {
        line1: '12 Anna Salai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600002',
        country: 'India'
      },
      status: 'Active',
      assignedStaffId: 'STF-101'
    });
    console.log(' Created Customer 2: sathiya@brightloop.com / Sathiya@12345');
  }

  // 4. Products
  const productsCount = await DB.Product().countDocuments();
  let prodMap = {};
  if (productsCount === 0) {
    const p1 = await DB.Product().create({
      name: 'HarmoniX Audio',
      type: 'Music Streaming',
      category: 'Audio Streaming',
      description: 'High-fidelity lossless music streaming with 100M+ tracks and offline playback.',
      icon: 'Music',
      features: ['Lossless Hi-Res Audio', 'Unlimited Skips', 'Offline Downloads', 'Multi-device sync'],
      isActive: true
    });
    const p2 = await DB.Product().create({
      name: 'CineStream Pro',
      type: 'Video Streaming',
      category: 'Video Streaming',
      description: '4K HDR on-demand video streaming platform with multi-screen simultaneous streaming.',
      icon: 'Film',
      features: ['4K Ultra HD + Dolby Atmos', '4 Simultaneous Screens', 'Ad-free Experience', 'Download to Mobile'],
      isActive: true
    });
    const p3 = await DB.Product().create({
      name: 'SkyVault Cloud',
      type: 'Cloud Storage',
      category: 'Storage & Backup',
      description: 'Secure, encrypted automated cloud backup and collaboration workspace.',
      icon: 'Cloud',
      features: ['Zero-Knowledge Encryption', 'File Version History (90 days)', 'Instant Share Links', 'Team Folders'],
      isActive: true
    });
    const p4 = await DB.Product().create({
      name: 'SmartSub Suite',
      type: 'Premium Software',
      category: 'SaaS Software',
      description: 'Unified subscription billing, tax management, invoicing and recurring revenue engine.',
      icon: 'Cpu',
      features: ['Automated Invoicing & GST', 'Webhooks & API Access', 'Multi-gateway reconciliation', 'Audit Logs'],
      isActive: true
    });
    const p5 = await DB.Product().create({
      name: 'BrightLearn Academy',
      type: 'Online Learning Platform',
      category: 'EdTech',
      description: 'Interactive coding, software architecture, and system design masterclasses.',
      icon: 'GraduationCap',
      features: ['Accredited Certifications', 'Live Mentor Sessions', 'Hands-on Projects', 'Job Board Access'],
      isActive: true
    });

    prodMap = { p1, p2, p3, p4, p5 };
    console.log(' Created 5 sample software and streaming products.');
  }

  // 5. Subscription Plans
  const plansCount = await DB.Plan().countDocuments();
  let planRefs = [];
  if (plansCount === 0) {
    const products = await DB.Product().find();
    for (const p of products) {
      const pl1 = await DB.Plan().create({
        productId: p._id || p.id,
        productName: p.name,
        name: `${p.name} - Starter Monthly`,
        period: 'Monthly',
        durationMonths: 1,
        price: p.type === 'Music Streaming' ? 199 : p.type === 'Video Streaming' ? 499 : 799,
        features: p.features.slice(0, 2),
        minQuantity: 1,
        recommended: false,
        isActive: true
      });
      const pl2 = await DB.Plan().create({
        productId: p._id || p.id,
        productName: p.name,
        name: `${p.name} - Pro Quarterly`,
        period: 'Quarterly',
        durationMonths: 3,
        price: p.type === 'Music Streaming' ? 499 : p.type === 'Video Streaming' ? 1299 : 1999,
        features: p.features,
        minQuantity: 1,
        recommended: true,
        isActive: true
      });
      const pl3 = await DB.Plan().create({
        productId: p._id || p.id,
        productName: p.name,
        name: `${p.name} - Enterprise Yearly`,
        period: 'Yearly',
        durationMonths: 12,
        price: p.type === 'Music Streaming' ? 1899 : p.type === 'Video Streaming' ? 4799 : 6999,
        features: [...p.features, '24/7 Dedicated Support', 'SLA 99.99%'],
        minQuantity: 1,
        recommended: false,
        isActive: true
      });
      planRefs.push(pl1, pl2, pl3);
    }
    console.log(' Created monthly, quarterly, and yearly plans for all products.');
  }

  // 6. Discounts
  const discountsCount = await DB.Discount().countDocuments();
  if (discountsCount === 0) {
    await DB.Discount().create({
      code: 'FESTIVE50',
      name: 'Festive Season 50% Off',
      type: 'PERCENT',
      value: 50,
      minPurchase: 300,
      startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      usageLimit: 200,
      usedCount: 14,
      isActive: true
    });
    await DB.Discount().create({
      code: 'SAVE10',
      name: 'SmartSub Special 10% Off',
      type: 'PERCENT',
      value: 10,
      minPurchase: 100,
      startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      usageLimit: 1000,
      usedCount: 42,
      isActive: true
    });
    await DB.Discount().create({
      code: 'WELCOME200',
      name: 'Flat ₹200 Welcome Offer',
      type: 'FIXED',
      value: 200,
      minPurchase: 500,
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
      usageLimit: 500,
      usedCount: 28,
      isActive: true
    });
    console.log(' Created discount coupon codes (FESTIVE50, SAVE10, WELCOME200).');
  }

  // 7. Subscriptions, Payments & Invoices for demo customers
  const subsCount = await DB.Subscription().countDocuments();
  if (subsCount === 0) {
    const now = new Date();
    const end1 = new Date(now.getTime() + 25 * 86400000); // in 25 days
    const end2 = new Date(now.getTime() + 85 * 86400000); // in 85 days
    const expiredDate = new Date(now.getTime() - 10 * 86400000); // 10 days ago

    // Active sub 1
    await DB.Subscription().create({
      subscriptionId: 'SUB-1001',
      customerId: custUser._id || custUser.id,
      customerName: 'Aditi Rao',
      customerEmail: 'demo@brightloop.com',
      productId: 'prod_1',
      productName: 'HarmoniX Audio',
      planId: 'plan_1',
      planName: 'HarmoniX Audio - Starter Monthly',
      period: 'Monthly',
      durationMonths: 1,
      originalAmount: 199,
      discountAmount: 20,
      taxAmount: 32,
      finalAmount: 211,
      startDate: new Date(now.getTime() - 5 * 86400000).toISOString(),
      endDate: end1.toISOString(),
      nextRenewalDate: end1.toISOString(),
      status: 'Active',
      paymentStatus: 'Successful',
      autoRenew: true
    });

    // Active sub 2
    await DB.Subscription().create({
      subscriptionId: 'SUB-1002',
      customerId: cust2User._id || cust2User.id,
      customerName: 'Sathiya JS',
      customerEmail: 'sathiya@brightloop.com',
      productId: 'prod_4',
      productName: 'SmartSub Suite',
      planId: 'plan_4',
      planName: 'SmartSub Suite - Pro Quarterly',
      period: 'Quarterly',
      durationMonths: 3,
      originalAmount: 1999,
      discountAmount: 200,
      taxAmount: 324,
      finalAmount: 2123,
      startDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
      endDate: end2.toISOString(),
      nextRenewalDate: end2.toISOString(),
      status: 'Active',
      paymentStatus: 'Successful',
      autoRenew: true
    });

    // Expired sub 3
    await DB.Subscription().create({
      subscriptionId: 'SUB-1003',
      customerId: custUser._id || custUser.id,
      customerName: 'Aditi Rao',
      customerEmail: 'demo@brightloop.com',
      productId: 'prod_2',
      productName: 'CineStream Pro',
      planId: 'plan_2',
      planName: 'CineStream Pro - Starter Monthly',
      period: 'Monthly',
      durationMonths: 1,
      originalAmount: 499,
      discountAmount: 0,
      taxAmount: 90,
      finalAmount: 589,
      startDate: new Date(now.getTime() - 40 * 86400000).toISOString(),
      endDate: expiredDate.toISOString(),
      nextRenewalDate: expiredDate.toISOString(),
      status: 'Expired',
      paymentStatus: 'Successful',
      autoRenew: false
    });

    // Payments
    await DB.Payment().create({
      paymentId: 'PAY-5001',
      subscriptionId: 'SUB-1001',
      customerId: custUser._id || custUser.id,
      customerName: 'Aditi Rao',
      customerEmail: 'demo@brightloop.com',
      amount: 211,
      discount: 20,
      tax: 32,
      method: 'Card',
      transactionRef: 'TXN-98421876',
      status: 'Successful',
      paidAt: new Date(now.getTime() - 5 * 86400000).toISOString()
    });

    await DB.Payment().create({
      paymentId: 'PAY-5002',
      subscriptionId: 'SUB-1002',
      customerId: cust2User._id || cust2User.id,
      customerName: 'Sathiya JS',
      customerEmail: 'sathiya@brightloop.com',
      amount: 2123,
      discount: 200,
      tax: 324,
      method: 'UPI',
      transactionRef: 'TXN-UPI-44910283',
      status: 'Successful',
      paidAt: new Date(now.getTime() - 10 * 86400000).toISOString()
    });

    // Invoices
    await DB.Invoice().create({
      invoiceNumber: 'INV-2026-0001',
      subscriptionId: 'SUB-1001',
      customerId: custUser._id || custUser.id,
      customerName: 'Aditi Rao',
      customerEmail: 'demo@brightloop.com',
      productName: 'HarmoniX Audio',
      planName: 'HarmoniX Audio - Starter Monthly',
      subscriptionDuration: '1 Month',
      invoiceDate: new Date(now.getTime() - 5 * 86400000).toISOString(),
      dueDate: new Date(now.getTime() - 5 * 86400000).toISOString(),
      originalPrice: 199,
      discountAmount: 20,
      taxAmount: 32,
      finalAmount: 211,
      paymentMethod: 'Card',
      transactionRef: 'TXN-98421876',
      paymentStatus: 'Paid'
    });

    await DB.Invoice().create({
      invoiceNumber: 'INV-2026-0002',
      subscriptionId: 'SUB-1002',
      customerId: cust2User._id || cust2User.id,
      customerName: 'Sathiya JS',
      customerEmail: 'sathiya@brightloop.com',
      productName: 'SmartSub Suite',
      planName: 'SmartSub Suite - Pro Quarterly',
      subscriptionDuration: '3 Months',
      invoiceDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
      dueDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
      originalPrice: 1999,
      discountAmount: 200,
      taxAmount: 324,
      finalAmount: 2123,
      paymentMethod: 'UPI',
      transactionRef: 'TXN-UPI-44910283',
      paymentStatus: 'Paid'
    });

    console.log(' Created sample subscriptions, payments and invoices.');
  }

  // 8. Company Settings
  const existingSettings = await DB.CompanySettings().findOne();
  if (!existingSettings) {
    await DB.CompanySettings().create({
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

  // 9. Initial Activity Log
  await DB.ActivityLog().create({
    userId: 'system',
    userName: 'SmartSub Engine',
    userRole: 'SYSTEM',
    action: 'INITIAL_SETUP',
    description: 'SmartSub platform initialized with demo subscriptions, products, and accounts.',
    timestamp: new Date().toISOString()
  });

  console.log(' Seeding completed successfully!');
}

// Execute if run directly
if (process.argv[1].endsWith('seed.js')) {
  seedData().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
