import cron from 'node-cron'
import { InvoiceStatus, SubscriptionStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { addBillingPeriod } from '../lib/dates.js'
import { calculatePriceBreakdown } from '../lib/money.js'

export interface BillingSummary {
  created: number
  skipped: number
  failed: number
  dryRun: boolean
  failures: { subscriptionId: string; message: string }[]
}

export const runBillingJob = async (dryRun = false): Promise<BillingSummary> => {
  const summary: BillingSummary = { created: 0, skipped: 0, failed: 0, dryRun, failures: [] }
  const subscriptions = await prisma.subscription.findMany({
    where: { status: SubscriptionStatus.ACTIVE, nextBillingDate: { lte: new Date() } },
    include: { plan: true, lines: { include: { tax: true, product: true, variant: true } }, customer: true },
  })
  for (const subscription of subscriptions) {
    try {
      const periodStart = subscription.nextBillingDate
      const periodEnd = addBillingPeriod(periodStart, subscription.plan.billingPeriod)
      const existing = await prisma.invoice.findUnique({
        where: { subscriptionId_periodStart: { subscriptionId: subscription.id, periodStart } },
      })
      if (existing) { summary.skipped++; continue }
      if (dryRun) { summary.created++; continue }

      await prisma.$transaction(async tx => {
        const subtotal = subscription.lines.reduce((sum, line) => sum + line.amount, 0)
        const tax = subscription.lines.reduce((sum, line) => sum + calculatePriceBreakdown({
          basePricePaise: line.unitPrice,
          variantExtraPaise: 0,
          quantity: line.quantity,
          taxPercent: line.tax?.ratePercent ?? 0,
        }).tax, 0)
        const total = subtotal + tax
        await tx.invoice.create({
          data: {
            number: `INV-${String(await tx.invoice.count() + 1).padStart(6, '0')}`,
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            periodStart,
            periodEnd,
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 15 * 86400000),
            status: InvoiceStatus.DRAFT,
            subtotal,
            discountTotal: 0,
            taxTotal: tax,
            total,
            lines: {
              create: subscription.lines.map(line => ({
                description: `${line.product.name}${line.variant ? ` - ${line.variant.value}` : ''}`,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                discount: 0,
                tax: calculatePriceBreakdown({ basePricePaise: line.unitPrice, variantExtraPaise: 0, quantity: line.quantity, taxPercent: line.tax?.ratePercent ?? 0 }).tax,
                amount: line.amount + calculatePriceBreakdown({ basePricePaise: line.unitPrice, variantExtraPaise: 0, quantity: line.quantity, taxPercent: line.tax?.ratePercent ?? 0 }).tax,
                productId: line.productId,
                taxId: line.taxId,
              })),
            },
          },
        })
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            nextBillingDate: periodEnd,
            lastBilledThrough: periodEnd,
            events: { create: { type: 'RENEWED', note: 'Automatic invoice created', actorId: null } },
          },
        })
      })
      summary.created++
    } catch (error) {
      summary.failed++
      summary.failures.push({
        subscriptionId: subscription.id,
        message: error instanceof Error ? error.message : 'Billing failed.',
      })
      console.error(`Billing failed for subscription ${subscription.id}:`, error)
    }
  }
  return summary
}

export const scheduleBillingJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled Brightloop billing job...')
    await runBillingJob(false)
  })
}
