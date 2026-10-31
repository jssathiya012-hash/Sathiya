import { DB } from '../models/index.js';

export async function runBillingJob() {
  try {
    const now = new Date();
    const subs = await DB.Subscription().find();
    let expiredCount = 0;
    let reminderCount = 0;

    for (const sub of subs) {
      if (sub.status === 'Active') {
        const endDate = new Date(sub.endDate);

        // Check if expired
        if (endDate < now) {
          await DB.Subscription().findByIdAndUpdate(sub._id || sub.id, {
            status: 'Expired'
          });
          expiredCount++;

          await DB.Notification().create({
            userId: sub.customerId,
            role: 'CUSTOMER',
            title: 'Subscription Expired',
            description: `Your subscription to ${sub.productName} (${sub.planName}) has expired. Please renew to continue access.`,
            type: 'subscription_expired',
            read: false
          });
        }
        // Check if expiring in next 3 days for reminder
        else if (endDate.getTime() - now.getTime() < 3 * 86400000) {
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
          reminderCount++;

          // Check if notification already sent in last 24h
          const existingNotif = await DB.Notification().findOne({
            userId: sub.customerId,
            type: 'renewal_reminder',
            title: 'Upcoming Subscription Renewal'
          });

          if (!existingNotif) {
            await DB.Notification().create({
              userId: sub.customerId,
              role: 'CUSTOMER',
              title: 'Upcoming Subscription Renewal',
              description: `Reminder: Your subscription to ${sub.productName} will renew / expire in ${daysLeft} day(s).`,
              type: 'renewal_reminder',
              read: false
            });
          }
        }
      }
    }

    if (expiredCount > 0 || reminderCount > 0) {
      console.log(`[Billing Job] Processed: ${expiredCount} expired, ${reminderCount} renewal reminders.`);
    }
  } catch (err) {
    console.error('[Billing Job Error]:', err.message);
  }
}

export function startBillingScheduler() {
  // Run on startup
  runBillingJob();
  // Run every 10 minutes
  setInterval(runBillingJob, 10 * 60 * 1000);
  console.log(' Subscription lifecycle scheduler active (every 10m)');
}
