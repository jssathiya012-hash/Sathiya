import type { AppData } from '../types'

const iso = (daysFromToday: number) => {
  const date = new Date()
  date.setUTCHours(12, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  return date.toISOString()
}

export const createSeedData = (): AppData => {
  const plans = [
    { id: 'crm-starter', productId: 'crm', name: 'Starter', description: 'Simple tools for a small sales team.', monthlyPrice: 4999, yearlyPrice: 49990, minimumQuantity: 1, features: ['100 contacts', 'Email support', 'Sales pipeline'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: true, closableEarly: true, autoCloseAtEnd: false, renewable: true },
    { id: 'crm-growth', productId: 'crm', name: 'Growth', description: 'Everything growing teams need to sell faster.', monthlyPrice: 8999, yearlyPrice: 89990, minimumQuantity: 3, features: ['Unlimited contacts', 'Automation', 'Priority support'], availableFrom: iso(-365), availableTo: iso(730), recommended: true, pausable: true, closableEarly: true, autoCloseAtEnd: false, renewable: true },
    { id: 'crm-enterprise', productId: 'crm', name: 'Enterprise', description: 'Advanced control, reporting and support.', monthlyPrice: 14999, yearlyPrice: 149990, minimumQuantity: 5, features: ['Custom reporting', 'SAML access', 'Dedicated support'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: false, closableEarly: true, autoCloseAtEnd: true, renewable: true },
    { id: 'helpdesk-starter', productId: 'helpdesk', name: 'Starter', description: 'A friendly inbox for your support team.', monthlyPrice: 2999, yearlyPrice: 29990, minimumQuantity: 1, features: ['3 inboxes', 'Knowledge base', 'Email support'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: true, closableEarly: true, autoCloseAtEnd: false, renewable: true },
    { id: 'helpdesk-team', productId: 'helpdesk', name: 'Team', description: 'Manage customer conversations in one place.', monthlyPrice: 5999, yearlyPrice: 59990, minimumQuantity: 2, features: ['Unlimited inboxes', 'SLA rules', 'Team reports'], availableFrom: iso(-365), availableTo: iso(730), recommended: true, pausable: true, closableEarly: false, autoCloseAtEnd: true, renewable: true },
    { id: 'helpdesk-scale', productId: 'helpdesk', name: 'Scale', description: 'Powerful service operations for large teams.', monthlyPrice: 9999, yearlyPrice: 99990, minimumQuantity: 5, features: ['Multi-brand support', 'AI answers', 'Audit logs'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: false, closableEarly: true, autoCloseAtEnd: true, renewable: true },
    { id: 'analytics-basic', productId: 'analytics', name: 'Basic', description: 'Clear reports for everyday decisions.', monthlyPrice: 3999, yearlyPrice: 39990, minimumQuantity: 1, features: ['10 dashboards', 'Weekly reports', 'CSV export'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: true, closableEarly: true, autoCloseAtEnd: false, renewable: true },
    { id: 'analytics-pro', productId: 'analytics', name: 'Pro', description: 'Live insights across every team.', monthlyPrice: 7999, yearlyPrice: 79990, minimumQuantity: 2, features: ['Unlimited dashboards', 'Live data', 'Scheduled reports'], availableFrom: iso(-365), availableTo: iso(730), recommended: true, pausable: true, closableEarly: true, autoCloseAtEnd: false, renewable: true },
    { id: 'analytics-business', productId: 'analytics', name: 'Business', description: 'Data governance and advanced analytics.', monthlyPrice: 12999, yearlyPrice: 129990, minimumQuantity: 4, features: ['Data warehouse sync', 'Forecasting', 'SSO'], availableFrom: iso(-365), availableTo: iso(730), recommended: false, pausable: false, closableEarly: false, autoCloseAtEnd: true, renewable: false },
  ]

  const products = [
    { id: 'crm', name: 'Brightloop CRM', type: 'Sales Software', description: 'Track leads, customers and sales from one simple workspace.', startingPrice: 4999, variants: [{ id: 'brand', name: 'Brand', options: [{ id: 'brightloop', name: 'Brightloop', priceExtra: 0 }, { id: 'odoo', name: 'Odoo', priceExtra: 560 }] }, { id: 'size', name: 'Team size', options: [{ id: 'small', name: 'Small team', priceExtra: 0 }, { id: 'large', name: 'Large team', priceExtra: 1200 }] }], planIds: plans.filter(p => p.productId === 'crm').map(p => p.id) },
    { id: 'helpdesk', name: 'Brightloop Helpdesk', type: 'Support Software', description: 'Turn customer questions into fast, thoughtful support.', startingPrice: 2999, variants: [{ id: 'brand', name: 'Brand', options: [{ id: 'brightloop', name: 'Brightloop', priceExtra: 0 }, { id: 'odoo', name: 'Odoo', priceExtra: 900 }] }], planIds: plans.filter(p => p.productId === 'helpdesk').map(p => p.id) },
    { id: 'analytics', name: 'Brightloop Analytics', type: 'Data Software', description: 'Understand your business with clear live dashboards.', startingPrice: 3999, variants: [{ id: 'brand', name: 'Brand', options: [{ id: 'brightloop', name: 'Brightloop', priceExtra: 0 }, { id: 'odoo', name: 'Odoo', priceExtra: 560 }] }, { id: 'size', name: 'Team size', options: [{ id: 'small', name: 'Small team', priceExtra: 0 }, { id: 'large', name: 'Large team', priceExtra: 1500 }] }], planIds: plans.filter(p => p.productId === 'analytics').map(p => p.id) },
  ]

  const subscriptions = [
    { id: 'SUB-CRM-001', userId: 'user-demo', productId: 'crm', planId: 'crm-growth', planName: 'Growth', productName: 'Brightloop CRM', status: 'Active' as const, quantity: 5, startDate: iso(-75), expiryDate: iso(290), nextBillingDate: iso(12), amount: 8999, billingFrequency: 'Monthly' as const, activity: [{ id: 'act-1', type: 'created' as const, title: 'Subscription created', description: 'Growth plan started with 5 users.', date: iso(-75) }, { id: 'act-2', type: 'paid' as const, title: 'Payment received', description: 'Monthly payment was paid successfully.', date: iso(-45) }, { id: 'act-3', type: 'upgraded' as const, title: 'Plan upgraded', description: 'Moved from Starter to Growth.', date: iso(-30) }] },
    { id: 'SUB-HLP-001', userId: 'user-demo', productId: 'helpdesk', planId: 'helpdesk-team', planName: 'Team', productName: 'Brightloop Helpdesk', status: 'Paused' as const, quantity: 3, startDate: iso(-120), expiryDate: iso(245), nextBillingDate: iso(1), amount: 5999, billingFrequency: 'Monthly' as const, activity: [{ id: 'act-4', type: 'created' as const, title: 'Subscription created', description: 'Team plan started.', date: iso(-120) }, { id: 'act-5', type: 'paused' as const, title: 'Subscription paused', description: 'Billing paused by the customer.', date: iso(-7) }] },
    { id: 'SUB-AN-OTHER', userId: 'user-other', productId: 'analytics', planId: 'analytics-pro', planName: 'Pro', productName: 'Brightloop Analytics', status: 'Active' as const, quantity: 2, startDate: iso(-40), expiryDate: iso(325), nextBillingDate: iso(20), amount: 7999, billingFrequency: 'Monthly' as const, activity: [{ id: 'act-6', type: 'created' as const, title: 'Subscription created', description: 'Pro analytics plan started.', date: iso(-40) }] },
  ]

  const invoices = Array.from({ length: 12 }, (_, index) => {
    const userId = index === 11 ? 'user-other' : 'user-demo'
    const amount = index === 11 ? 7999 : index % 2 === 0 ? 8999 : 5999
    return {
      id: `INV-${1001 + index}`,
      userId,
      subscriptionId: index === 11 ? 'SUB-AN-OTHER' : index % 2 === 0 ? 'SUB-CRM-001' : 'SUB-HLP-001',
      number: `BL-${2026}-${String(1001 + index).padStart(4, '0')}`,
      date: iso(-210 + index * 18),
      dueDate: iso(index === 8 ? -12 : index === 9 ? -3 : index === 10 ? 7 : -210 + index * 18 + 10),
      status: index < 8 ? 'Paid' as const : 'Confirmed' as const,
      lines: [{ id: `line-${index}`, description: index === 11 ? 'Brightloop Analytics Pro' : index % 2 === 0 ? 'Brightloop CRM Growth' : 'Brightloop Helpdesk Team', quantity: index === 11 ? 2 : index % 2 === 0 ? 5 : 3, unitPrice: amount, total: amount }],
      discount: 0,
      tax: Math.round(amount * 0.18),
      total: Math.round(amount * 1.18),
    }
  })

  return {
    users: [
      { id: 'user-demo', name: 'Demo Customer', email: 'demo@brightloop.com', password: 'Demo@12345', phone: '+91 98765 43210', companyName: 'Brightloop Labs Pvt Ltd', gstNumber: '29ABCDE1234F1Z5', billingAddress: { line1: '42 Tech Park Road', line2: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038', country: 'India' } },
      { id: 'user-other', name: 'Other Customer', email: 'other@brightloop.com', password: 'Other@12345', phone: '+91 91234 56780', companyName: 'Other Works Pvt Ltd', gstNumber: '27ABCDE1234F1Z6', billingAddress: { line1: '18 Market Street', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India' } },
    ],
    products,
    plans,
    subscriptions,
    invoices,
    payments: [
      { id: 'PAY-001', userId: 'user-demo', invoiceId: 'INV-1001', amount: 10618, method: 'Card', date: iso(-210), note: 'Monthly invoice payment', status: 'Success' },
      { id: 'PAY-002', userId: 'user-demo', invoiceId: 'INV-1002', amount: 7078, method: 'UPI', date: iso(-192), note: 'Monthly invoice payment', status: 'Success' },
      { id: 'PAY-003', userId: 'user-demo', invoiceId: 'INV-1003', amount: 10618, method: 'Net Banking', date: iso(-174), note: 'Monthly invoice payment', status: 'Success' },
      { id: 'PAY-004', userId: 'user-demo', invoiceId: 'INV-1008', amount: 7078, method: 'Card', date: iso(-84), note: 'Payment failed at the bank', status: 'Failed' },
      { id: 'PAY-005', userId: 'user-demo', invoiceId: 'INV-1009', amount: 10618, method: 'UPI', date: iso(-66), note: 'Payment is being checked', status: 'Pending' },
      { id: 'PAY-006', userId: 'user-other', invoiceId: 'INV-1012', amount: 9438, method: 'Card', date: iso(-20), note: 'Other customer payment', status: 'Success' },
    ],
    discounts: [
      { id: 'disc-save10', code: 'SAVE10', percent: 10, minimumQuantity: 5, expiresAt: iso(365), usageLimit: 100, usedCount: 12 },
      { id: 'disc-old', code: 'EXPIRED20', percent: 20, minimumQuantity: 1, expiresAt: iso(-10), usageLimit: 50, usedCount: 50 },
    ],
    notifications: [
      { id: 'NOT-001', userId: 'user-demo', type: 'renewal_reminder', title: 'Renewal coming up', message: 'Your Brightloop CRM plan renews soon.', date: iso(-1), read: false },
      { id: 'NOT-002', userId: 'user-demo', type: 'payment_received', title: 'Payment received', message: 'We received your latest payment of ₹10,618.', date: iso(-3), read: true },
      { id: 'NOT-003', userId: 'user-demo', type: 'invoice_generated', title: 'Invoice ready', message: 'A new invoice has been added to your account.', date: iso(-5), read: false },
      { id: 'NOT-004', userId: 'user-demo', type: 'payment_failed', title: 'Payment failed', message: 'We could not collect payment for invoice INV-1008.', date: iso(-84), read: true },
      { id: 'NOT-005', userId: 'user-other', type: 'renewal_reminder', title: 'Renewal coming up', message: 'Your Analytics plan renews soon.', date: iso(-1), read: false },
    ],
    tickets: [
      { id: 'TKT-001', userId: 'user-demo', subject: 'Need help adding users', message: 'How can I add more users to the Growth plan?', status: 'Answered', createdAt: iso(-14), reply: 'You can add users from the subscription change-plan screen.' },
      { id: 'TKT-002', userId: 'user-demo', subject: 'GST invoice question', message: 'Can I update my GST number for past invoices?', status: 'Open', createdAt: iso(-2) },
      { id: 'TKT-003', userId: 'user-other', subject: 'Analytics export', message: 'Where can I export my dashboard?', status: 'Open', createdAt: iso(-3) },
    ],
    taxRate: 18,
    forcePaymentOutcome: 'random',
  }
}
