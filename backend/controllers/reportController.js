import { DB } from '../models/index.js';

export async function getDashboardOverview(req, res) {
  try {
    const customers = await DB.Customer().find();
    const staff = await DB.Staff().find();
    const products = await DB.Product().find();
    const plans = await DB.Plan().find();
    const subscriptions = await DB.Subscription().find();
    const payments = await DB.Payment().find();
    const discounts = await DB.Discount().find();
    const activityLogs = await DB.ActivityLog().find();

    const activeSubs = subscriptions.filter(s => s.status === 'Active');
    const expiredSubs = subscriptions.filter(s => s.status === 'Expired');
    const cancelledSubs = subscriptions.filter(s => s.status === 'Cancelled');

    const successfulPayments = payments.filter(p => p.status === 'Successful');
    const pendingPayments = payments.filter(p => p.status === 'Pending').length;

    // Monthly & yearly revenue calculation from real payments
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    successfulPayments.forEach(p => {
      const pDate = new Date(p.paidAt || p.createdAt || now);
      if (pDate.getFullYear() === currentYear) {
        yearlyRevenue += Number(p.amount) || 0;
        if (pDate.getMonth() === currentMonth) {
          monthlyRevenue += Number(p.amount) || 0;
        }
      }
    });

    // Upcoming renewals within next 15 days
    const next15Days = new Date(now.getTime() + 15 * 86400000);
    const upcomingRenewals = activeSubs.filter(s => {
      const end = new Date(s.endDate);
      return end >= now && end <= next15Days;
    }).length;

    // Monthly revenue chart data (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const total = successfulPayments
        .filter(p => {
          const pd = new Date(p.paidAt || p.createdAt || now);
          return pd.getMonth() === mIdx && pd.getFullYear() === yr;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      revenueByMonth.push({
        month: monthNames[mIdx],
        revenue: total
      });
    }

    // Product-wise subscription count
    const productStats = products.map(prod => {
      const count = subscriptions.filter(s => s.productId === prod._id || s.productId === prod.id || s.productName === prod.name).length;
      return {
        name: prod.name,
        subscriptions: count
      };
    });

    // Subscriptions by status
    const statusData = [
      { name: 'Active', value: activeSubs.length, color: '#2E9467' },
      { name: 'Expired', value: expiredSubs.length, color: '#D99A39' },
      { name: 'Cancelled', value: cancelledSubs.length, color: '#D85B69' }
    ];

    // Recent items
    const recentCustomers = customers.slice(-5).reverse();
    const recentPayments = payments.slice(-5).reverse();
    const recentSubscriptions = subscriptions.slice(-5).reverse();
    const recentActivities = activityLogs.slice(-6).reverse();

    res.json({
      success: true,
      metrics: {
        totalCustomers: customers.length,
        totalStaff: staff.length,
        totalProducts: products.length,
        totalPlans: plans.length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubs.length,
        expiredSubscriptions: expiredSubs.length,
        cancelledSubscriptions: cancelledSubs.length,
        monthlyRevenue,
        yearlyRevenue,
        pendingPayments,
        upcomingRenewals
      },
      charts: {
        revenueByMonth,
        productStats,
        statusData
      },
      recent: {
        customers: recentCustomers,
        payments: recentPayments,
        subscriptions: recentSubscriptions,
        activities: recentActivities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDetailedReports(req, res) {
  try {
    const { reportType, fromDate, toDate } = req.query;
    const subs = await DB.Subscription().find();
    const payments = await DB.Payment().find();
    const customers = await DB.Customer().find();
    const staff = await DB.Staff().find();
    const products = await DB.Product().find();
    const plans = await DB.Plan().find();
    const discounts = await DB.Discount().find();
    const activities = await DB.ActivityLog().find();

    res.json({
      success: true,
      reportType: reportType || 'all',
      data: {
        subscriptions: subs,
        payments,
        customers,
        staff,
        products,
        plans,
        discounts,
        activities
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
