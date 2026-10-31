import bcrypt from 'bcryptjs'
import { PrismaClient, BillingPeriod, DiscountAppliesTo, DiscountType, InvoiceStatus, PaymentMethod, PaymentStatus, Role, SubscriptionStatus } from '@prisma/client'
import { performance } from 'node:perf_hooks'

const prisma = new PrismaClient()
const large = process.argv.includes('--large')

const padNumber = (prefix: string, number: number) =>
  `${prefix}-${String(number).padStart(6, '0')}`

async function main() {
  console.log('Seeding Brightloop database...')

  await prisma.emailLog.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoiceLine.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.subscriptionEvent.deleteMany()
  await prisma.subscriptionLine.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.quotationTemplateLine.deleteMany()
  await prisma.quotationTemplate.deleteMany()
  await prisma.discountProduct.deleteMany()
  await prisma.discount.deleteMany()
  await prisma.taxProduct.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.plan.deleteMany()
  await prisma.tax.deleteMany()
  await prisma.product.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.customerProfile.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('Admin@12345', 12)
  const demoPassword = await bcrypt.hash('Demo@12345', 12)
  const staffPassword = await bcrypt.hash('Staff@12345', 12)

  const admin = await prisma.user.create({
    data: { name: 'Brightloop Admin', email: 'admin@brightloop.com', passwordHash: password, role: Role.ADMIN },
  })
  const staffOne = await prisma.user.create({
    data: { name: 'Asha Staff', email: 'staff@brightloop.com', passwordHash: staffPassword, role: Role.STAFF },
  })
  await prisma.user.create({
    data: { name: 'Ravi Staff', email: 'ravi@brightloop.com', passwordHash: staffPassword, role: Role.STAFF },
  })

  const demo = await prisma.user.create({
    data: {
      name: 'Demo Customer',
      email: 'demo@brightloop.com',
      passwordHash: demoPassword,
      role: Role.CUSTOMER,
      profile: { create: { phone: '+91 98765 43210', companyName: 'Demo Retail Pvt Ltd', gstNumber: '29ABCDE1234F1Z5', addressLine1: '42 Market Road', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', country: 'India' } },
    },
  })
  const customerTwo = await prisma.user.create({
    data: {
      name: 'Meera Customer',
      email: 'meera@brightloop.com',
      passwordHash: demoPassword,
      role: Role.CUSTOMER,
      profile: { create: { companyName: 'Meera Studios', addressLine1: '15 Lake View', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600001' } },
    },
  })
  const other = await prisma.user.create({
    data: {
      name: 'Other Customer',
      email: 'other@brightloop.com',
      passwordHash: demoPassword,
      role: Role.CUSTOMER,
      profile: { create: { companyName: 'Other Industries', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' } },
    },
  })

  const now = new Date()
  const future = new Date(now)
  future.setFullYear(future.getFullYear() + 3)

  const crm = await prisma.product.create({ data: { name: 'Brightloop CRM', type: 'SAAS', salesPrice: 499900, costPrice: 180000, notes: 'Customer relationships and sales pipeline' } })
  const helpdesk = await prisma.product.create({ data: { name: 'Brightloop Helpdesk', type: 'SAAS', salesPrice: 399900, costPrice: 150000, notes: 'Shared support inbox and ticketing' } })
  const analytics = await prisma.product.create({ data: { name: 'Brightloop Analytics', type: 'SAAS', salesPrice: 599900, costPrice: 220000, notes: 'Business reports and dashboards' } })

  for (const product of [crm, helpdesk, analytics]) {
    await prisma.productVariant.createMany({
      data: [
        { productId: product.id, attribute: 'Brand', value: 'Odoo', extraPrice: 56000 },
        { productId: product.id, attribute: 'Size', value: 'Team', extraPrice: 0 },
        { productId: product.id, attribute: 'Size', value: 'Enterprise', extraPrice: 250000 },
      ],
    })
  }

  const gst = await prisma.tax.create({ data: { name: 'GST', ratePercent: 18, isActive: true } })
  await prisma.taxProduct.createMany({ data: [crm, helpdesk, analytics].map(product => ({ taxId: gst.id, productId: product.id })) })

  const planData = [
    { name: 'CRM Starter', product: crm, price: 499900, period: BillingPeriod.MONTHLY, minQuantity: 1, early: true, pause: true, renew: true },
    { name: 'CRM Yearly', product: crm, price: 4999000, period: BillingPeriod.YEARLY, minQuantity: 1, early: false, pause: false, renew: true },
    { name: 'Helpdesk Weekly', product: helpdesk, price: 99900, period: BillingPeriod.WEEKLY, minQuantity: 2, early: true, pause: true, renew: true },
    { name: 'Helpdesk Monthly', product: helpdesk, price: 399900, period: BillingPeriod.MONTHLY, minQuantity: 1, early: true, pause: true, renew: true },
    { name: 'Analytics Daily', product: analytics, price: 14900, period: BillingPeriod.DAILY, minQuantity: 1, early: true, pause: false, renew: false },
    { name: 'Analytics Yearly', product: analytics, price: 5999000, period: BillingPeriod.YEARLY, minQuantity: 1, early: false, pause: false, renew: true },
  ] as const

  const plans = []
  for (const item of planData) {
    plans.push(await prisma.plan.create({
      data: {
        name: item.name,
        productId: item.product.id,
        price: item.price,
        billingPeriod: item.period,
        minQuantity: item.minQuantity,
        availableFrom: now,
        availableTo: future,
        autoCloseAtEnd: item.name.includes('Yearly'),
        allowEarlyClose: item.early,
        allowPause: item.pause,
        allowRenew: item.renew,
      },
    }))
  }

  const save10 = await prisma.discount.create({
    data: { name: 'SAVE10', type: DiscountType.PERCENT, value: 10, minPurchase: 100000, minQuantity: 5, startDate: new Date(now.getTime() - 86400000), endDate: future, usageLimit: 1000, appliesTo: DiscountAppliesTo.PRODUCTS },
  })
  await prisma.discountProduct.createMany({ data: [crm.id, helpdesk.id, analytics.id].map(productId => ({ discountId: save10.id, productId })) })

  const nearlyUsed = await prisma.discount.create({
    data: { name: 'Launch Discount', type: DiscountType.FIXED, value: 50000, minPurchase: 0, minQuantity: 1, startDate: new Date(now.getTime() - 86400000), endDate: future, usageLimit: 5, usedCount: 4, appliesTo: DiscountAppliesTo.SUBSCRIPTIONS },
  })
  await prisma.discount.create({
    data: { name: 'Expired Discount', type: DiscountType.PERCENT, value: 25, minPurchase: 0, minQuantity: 1, startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31'), usageLimit: 100, appliesTo: DiscountAppliesTo.SUBSCRIPTIONS },
  })

  for (const plan of plans.slice(0, 2)) {
    const template = await prisma.quotationTemplate.create({
      data: { name: `${plan.name} Standard`, validityDays: 30, planId: plan.id },
    })
    await prisma.quotationTemplateLine.create({
      data: { templateId: template.id, productId: plan.productId, quantity: Math.max(1, plan.minQuantity) },
    })
  }

  const statuses: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAUSED,
    SubscriptionStatus.CLOSED,
    SubscriptionStatus.QUOTATION,
  ]
  const demoSubscriptions = []
  for (let index = 0; index < statuses.length; index++) {
    const plan = plans[index % plans.length]
    if (!plan) continue
    const start = new Date(now)
    start.setDate(start.getDate() - (index + 1) * 30)
    const expiry = new Date(start)
    expiry.setFullYear(expiry.getFullYear() + 1)
    const nextBilling = new Date(now)
    nextBilling.setDate(nextBilling.getDate() + (index === 1 ? 1 : 12))
    const subscription = await prisma.subscription.create({
      data: {
        number: padNumber('SUB', index + 1),
        customerId: demo.id,
        planId: plan.id,
        startDate: start,
        expiryDate: expiry,
        status: statuses[index] ?? SubscriptionStatus.ACTIVE,
        nextBillingDate: nextBilling,
        createdById: admin.id,
        events: { create: { type: 'CREATED', note: 'Subscription seeded', actorId: admin.id } },
        lines: { create: { productId: plan.productId, quantity: Math.max(1, plan.minQuantity), unitPrice: plan.price, taxId: gst.id, amount: plan.price * Math.max(1, plan.minQuantity) } },
      },
    })
    demoSubscriptions.push(subscription)
  }

  for (const [index, status] of ['CONFIRMED', 'CONFIRMED', 'PAID', 'PAID', 'DRAFT', 'PAID', 'CONFIRMED', 'PAID', 'CONFIRMED', 'PAID', 'CANCELLED', 'PAID'].entries()) {
    const subscription = demoSubscriptions[index % demoSubscriptions.length]
    if (!subscription) continue
    const invoiceStatus = status as InvoiceStatus
    const isOverdue = index === 1 || index === 6
    const invoiceDate = new Date(now)
    invoiceDate.setDate(invoiceDate.getDate() - (12 - index) * 5)
    const dueDate = isOverdue ? new Date(now.getTime() - 15 * 86400000) : new Date(now.getTime() + (15 + index) * 86400000)
    const periodStart = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const periodEnd = new Date(periodStart)
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    periodEnd.setDate(periodEnd.getDate() - 1)
    const total = 499900 + (index % 2) * 56000
    const invoice = await prisma.invoice.create({
      data: {
        number: padNumber('INV', index + 1),
        subscriptionId: subscription.id,
        customerId: demo.id,
        periodStart,
        periodEnd,
        invoiceDate,
        dueDate,
        status: invoiceStatus,
        subtotal: total,
        discountTotal: 0,
        taxTotal: Math.round(total * 0.18),
        total: Math.round(total * 1.18),
        amountPaid: invoiceStatus === 'PAID' ? Math.round(total * 1.18) : 0,
        lines: { create: { description: 'Brightloop subscription', quantity: 1, unitPrice: total, discount: 0, tax: Math.round(total * 0.18), amount: Math.round(total * 1.18), productId: crm.id, taxId: gst.id } },
      },
    })
    if (invoiceStatus === 'PAID') {
      await prisma.payment.create({ data: { invoiceId: invoice.id, customerId: demo.id, method: index % 2 === 0 ? PaymentMethod.CARD : PaymentMethod.UPI, amount: invoice.total, paidAt: invoiceDate, status: PaymentStatus.SUCCESS, reference: `PAY-${index + 1}` } })
    }
  }

  await prisma.payment.create({
    data: { invoiceId: (await prisma.invoice.findFirst({ where: { customerId: demo.id } }))!.id, customerId: demo.id, method: PaymentMethod.NETBANKING, amount: 499900, paidAt: now, status: PaymentStatus.FAILED, reference: 'PAY-FAILED-DEMO', note: 'Demo card declined' },
  })
  await prisma.payment.create({
    data: { invoiceId: (await prisma.invoice.findFirst({ where: { customerId: demo.id, status: InvoiceStatus.CONFIRMED } }))!.id, customerId: demo.id, method: PaymentMethod.UPI, amount: 499900, paidAt: now, status: PaymentStatus.PENDING, reference: 'PAY-PENDING-DEMO', note: 'Waiting for bank confirmation' },
  })

  await prisma.notification.createMany({
    data: [
      { userId: demo.id, type: 'RENEWAL_REMINDER', title: 'Renewal in 7 days', body: 'Your Brightloop subscription renews soon.' },
      { userId: demo.id, type: 'INVOICE_GENERATED', title: 'New invoice ready', body: 'A new invoice has been added to your account.' },
      { userId: demo.id, type: 'PAYMENT_FAILED', title: 'Payment failed', body: 'Please retry the failed payment.' },
    ],
  })

  await prisma.emailLog.create({ data: { userId: demo.id, to: demo.email, subject: 'Welcome to Brightloop', body: 'Your demo account is ready.' } })

  // Large seed is intentionally opt-in because it creates many rows.
  if (large) {
    const largeStart = performance.now()
    const customerIds = [demo.id, customerTwo.id, other.id]
    const batchSize = 500
    for (let offset = 0; offset < 5000; offset += batchSize) {
      const data = []
      for (let i = offset; i < Math.min(offset + batchSize, 5000); i++) {
        const plan = plans[i % plans.length]
        if (!plan) continue
        const start = new Date(now.getTime() - (i % 365) * 86400000)
        const expiry = new Date(start)
        expiry.setFullYear(expiry.getFullYear() + 1)
        const nextBilling = new Date(now.getTime() + (i % 30) * 86400000)
        data.push({
          number: padNumber('SUB-LARGE', i + 1),
          customerId: customerIds[i % customerIds.length]!,
          planId: plan.id,
          startDate: start,
          expiryDate: expiry,
          status: i % 20 === 0 ? SubscriptionStatus.PAUSED : SubscriptionStatus.ACTIVE,
          nextBillingDate: nextBilling,
          createdById: staffOne.id,
        })
      }
      await prisma.subscription.createMany({ data })
    }

    const largeSubscriptions = await prisma.subscription.findMany({
      where: { number: { startsWith: 'SUB-LARGE-' } },
      select: { id: true, customerId: true },
    })
    let invoiceNumber = 100001
    for (let offset = 0; offset < largeSubscriptions.length; offset += batchSize) {
      const data = []
      for (const subscription of largeSubscriptions.slice(offset, offset + batchSize)) {
        for (let period = 0; period < 3; period++) {
          const periodStart = new Date(now.getTime() - (period + 1) * 30 * 86400000)
          periodStart.setDate(1)
          const periodEnd = new Date(periodStart)
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          periodEnd.setDate(periodEnd.getDate() - 1)
          const dueDate = new Date(periodStart.getTime() + 15 * 86400000)
          const amount = 499900
          data.push({
            number: padNumber('INV-LARGE', invoiceNumber++),
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            periodStart,
            periodEnd,
            invoiceDate: periodStart,
            dueDate,
            status: period === 0 ? InvoiceStatus.CONFIRMED : InvoiceStatus.PAID,
            subtotal: amount,
            discountTotal: 0,
            taxTotal: Math.round(amount * 0.18),
            total: Math.round(amount * 1.18),
            amountPaid: period === 0 ? 0 : Math.round(amount * 1.18),
          })
        }
      }
      await prisma.invoice.createMany({ data })
    }
    console.log(`Large seed completed in ${Math.round(performance.now() - largeStart)} ms`)
  }

  console.log('Seed complete.')
  console.log(`Report lookup check: ${await prisma.subscription.count()} subscriptions, ${await prisma.invoice.count()} invoices`)
  if (large) {
    const reportStart = performance.now()
    await prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } })
    await prisma.invoice.aggregate({ _sum: { total: true, amountPaid: true } })
    await prisma.invoice.findMany({ where: { status: InvoiceStatus.CONFIRMED }, take: 20, orderBy: { dueDate: 'asc' } })
    console.log(`Main report queries with large seed: ${Math.round(performance.now() - reportStart)} ms`)
  }
  console.log('Accounts: admin@brightloop.com / Admin@12345; demo@brightloop.com / Demo@12345; other@brightloop.com / Demo@12345')
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
