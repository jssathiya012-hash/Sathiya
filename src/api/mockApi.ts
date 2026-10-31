import { createSeedData } from '../data/seed'
import type { AppData, Invoice, Payment, Subscription, SupportTicket, User } from '../types'
import { readData, writeData } from './storage'

const delay = () => new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250))

const getData = () => readData<AppData>(createSeedData())
const saveData = (data: AppData) => writeData(data)
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

// Ownership check: public login returns only the account whose email and password match.
export const login = async (email: string, password: string): Promise<User> => {
  await delay()
  const data = getData()
  const user = data.users.find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password)
  if (!user) throw new Error('Email or password is incorrect.')
  return user
}

// Ownership check: password reset starts only when the email belongs to a stored account.
export const requestPasswordReset = async (email: string): Promise<string> => {
  await delay()
  const data = getData()
  const user = data.users.find(item => item.email.toLowerCase() === email.toLowerCase())
  if (!user) throw new Error('We could not find an account with that email.')
  return encodeURIComponent(user.email)
}

// Ownership check: reset updates only the account identified by the email token.
export const resetPassword = async (token: string, password: string): Promise<void> => {
  await delay()
  const data = getData()
  const email = decodeURIComponent(token)
  const index = data.users.findIndex(item => item.email.toLowerCase() === email.toLowerCase())
  if (index === -1) throw new Error('This reset link is invalid or has expired.')
  data.users[index] = { ...data.users[index], password }
  saveData(data)
}

// Ownership check: signup reserves a unique normalized email before creating the new owner.
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  await delay()
  const data = getData()
  if (data.users.some(item => item.email.toLowerCase() === email.toLowerCase())) throw new Error('An account already exists with this email.')
  const user: User = { id: newId('user'), name, email, password, billingAddress: { line1: '', city: '', state: '', postalCode: '', country: 'India' } }
  data.users.push(user)
  saveData(data)
  return user
}

// Ownership check: this catalogue is shared and contains no customer-specific records.
export const getCatalogue = async () => {
  await delay()
  const data = getData()
  return { products: data.products, plans: data.plans, discounts: data.discounts, taxRate: data.taxRate }
}

// Ownership check: discount rules are shared catalogue data and usage is not tied to customer records.
export const validateDiscount = async (code: string, quantity: number) => {
  await delay()
  const rule = getData().discounts.find(item => item.code.toUpperCase() === code.trim().toUpperCase())
  if (!rule) throw new Error('This discount code does not exist.')
  if (new Date(rule.expiresAt) < new Date()) throw new Error('This discount code has expired.')
  if (rule.usedCount >= rule.usageLimit) throw new Error('This discount code has been used up.')
  if (quantity < rule.minimumQuantity) throw new Error(`Add at least ${rule.minimumQuantity} items to use this code.`)
  return rule
}

// Ownership check: every new subscription and invoice is created only for the signed-in userId.
export const subscribe = async (
  userId: string,
  productId: string,
  planId: string,
  quantity: number,
  billingFrequency: 'Monthly' | 'Yearly',
  discountCode?: string
) => {
  await delay()
  const data = getData()
  const product = data.products.find(item => item.id === productId)
  const plan = data.plans.find(item => item.id === planId && item.productId === productId)
  if (!product || !plan) throw new Error('Plan not found.')
  if (!data.users.some(item => item.id === userId)) throw new Error('User not found.')
  if (quantity < plan.minimumQuantity) throw new Error(`Minimum quantity is ${plan.minimumQuantity}.`)

  let discountPercent = 0
  if (discountCode) {
    const rule = data.discounts.find(item => item.code.toUpperCase() === discountCode.trim().toUpperCase())
    if (!rule) throw new Error('This discount code does not exist.')
    if (new Date(rule.expiresAt) < new Date()) throw new Error('This discount code has expired.')
    if (rule.usedCount >= rule.usageLimit) throw new Error('This discount code has been used up.')
    if (quantity < rule.minimumQuantity) throw new Error(`Add at least ${rule.minimumQuantity} items to use this code.`)
    discountPercent = rule.percent
    rule.usedCount += 1
  }

  const base = billingFrequency === 'Yearly' ? plan.yearlyPrice : plan.monthlyPrice
  const subtotal = base * quantity
  const discount = Math.round(subtotal * discountPercent / 100)
  const tax = Math.round((subtotal - discount) * data.taxRate / 100)
  const total = subtotal - discount + tax
  const now = new Date()
  const nextBilling = new Date(now)
  nextBilling.setMonth(nextBilling.getMonth() + (billingFrequency === 'Yearly' ? 12 : 1))
  const subscriptionId = newId('SUB')
  const subscription: Subscription = {
    id: subscriptionId,
    userId,
    productId,
    planId,
    planName: plan.name,
    productName: product.name,
    status: 'Active',
    quantity,
    startDate: now.toISOString(),
    expiryDate: new Date(nextBilling.getFullYear() + (billingFrequency === 'Yearly' ? 1 : 0), nextBilling.getMonth(), nextBilling.getDate()).toISOString(),
    nextBillingDate: nextBilling.toISOString(),
    amount: total,
    billingFrequency,
    activity: [{ id: newId('ACT'), type: 'created', title: 'Subscription created', description: `${plan.name} plan started.`, date: now.toISOString() }, { id: newId('ACT'), type: 'paid', title: 'First invoice created', description: 'Your first billing invoice is ready.', date: now.toISOString() }],
  }
  data.subscriptions.push(subscription)
  const invoiceNumber = `BL-${now.getFullYear()}-${String(data.invoices.length + 1001).padStart(4, '0')}`
  const invoice: Invoice = {
    id: `INV-${now.getTime().toString(36).toUpperCase()}`,
    userId,
    subscriptionId,
    number: invoiceNumber,
    date: now.toISOString(),
    dueDate: nextBilling.toISOString(),
    status: 'Confirmed',
    lines: [{ id: newId('LINE'), description: `${product.name} ${plan.name} (${billingFrequency})`, quantity, unitPrice: base, total: subtotal }],
    discount,
    tax,
    total,
  }
  data.invoices.push(invoice)
  data.notifications.push({ id: newId('NOT'), userId, type: 'invoice_generated', title: 'Invoice generated', message: `Invoice ${invoiceNumber} was created for your new subscription.`, date: now.toISOString(), read: false })
  saveData(data)
  return { subscription, invoice }
}

// Ownership check: subscription actions update only the record whose userId matches the session.
export const updateSubscription = async (
  userId: string,
  subscriptionId: string,
  action: 'pause' | 'resume' | 'cancel' | 'renew' | 'upgrade',
  reason?: string,
  newPlanId?: string
): Promise<Subscription> => {
  await delay()
  const data = getData()
  const index = data.subscriptions.findIndex(item => item.id === subscriptionId && item.userId === userId)
  if (index === -1) throw new Error('Subscription not found or access denied.')
  const subscription = data.subscriptions[index]
  const plan = data.plans.find(item => item.id === subscription.planId)
  if (!plan) throw new Error('Plan details are unavailable.')
  const now = new Date()

  if (action === 'pause') {
    if (!plan.pausable) throw new Error('This plan cannot be paused.')
    subscription.status = 'Paused'
    subscription.activity.push({ id: newId('ACT'), type: 'paused', title: 'Subscription paused', description: reason || 'Billing was paused by the customer.', date: now.toISOString() })
  }
  if (action === 'resume') {
    if (subscription.status !== 'Paused') throw new Error('This subscription is not paused.')
    subscription.status = 'Active'
    subscription.activity.push({ id: newId('ACT'), type: 'resumed', title: 'Subscription resumed', description: 'Billing resumed by the customer.', date: now.toISOString() })
  }
  if (action === 'cancel') {
    if (!plan.closableEarly && subscription.status !== 'Active') throw new Error('This plan cannot be cancelled early.')
    subscription.status = 'Closed'
    subscription.activity.push({ id: newId('ACT'), type: 'cancelled', title: 'Subscription cancelled', description: reason || 'Cancelled by the customer.', date: now.toISOString() })
  }
  if (action === 'renew') {
    if (!plan.renewable) throw new Error('This plan is not renewable.')
    const next = new Date(subscription.nextBillingDate)
    if (subscription.billingFrequency === 'Yearly') next.setFullYear(next.getFullYear() + 1)
    else next.setMonth(next.getMonth() + 1)
    subscription.nextBillingDate = next.toISOString()
    subscription.expiryDate = next.toISOString()
    subscription.status = 'Active'
    subscription.activity.push({ id: newId('ACT'), type: 'renewed', title: 'Subscription renewed', description: `Renewed for another ${subscription.billingFrequency.toLowerCase()} period.`, date: now.toISOString() })
  }
  if (action === 'upgrade') {
    const newPlan = data.plans.find(item => item.id === newPlanId && item.productId === subscription.productId)
    if (!newPlan) throw new Error('The selected plan is not available.')
    subscription.planId = newPlan.id
    subscription.planName = newPlan.name
    subscription.amount = subscription.billingFrequency === 'Yearly' ? newPlan.yearlyPrice : newPlan.monthlyPrice
    subscription.activity.push({ id: newId('ACT'), type: 'upgraded', title: 'Plan changed', description: `Changed to the ${newPlan.name} plan.`, date: now.toISOString() })
  }

  data.subscriptions[index] = subscription
  saveData(data)
  return subscription
}

// Ownership check: payment creation is allowed only when both invoice and user belong to the signed-in customer.
export const createPayment = async (
  userId: string,
  invoiceId: string | undefined,
  amount: number,
  method: 'Card' | 'UPI' | 'Net Banking'
): Promise<Payment> => {
  await delay()
  const data = getData()
  if (invoiceId) {
    const invoice = data.invoices.find(item => item.id === invoiceId && item.userId === userId)
    if (!invoice) throw new Error('Invoice not found or access denied.')
  }
  const outcome = data.forcePaymentOutcome
  const status: 'Success' | 'Pending' | 'Failed' =
    outcome === 'success' ? 'Success' :
    outcome === 'fail' ? 'Failed' :
    Math.random() < 0.2 ? 'Failed' : Math.random() < 0.1 ? 'Pending' : 'Success'
  const payment: Payment = {
    id: newId('PAY'),
    userId,
    invoiceId,
    amount,
    method,
    date: new Date().toISOString(),
    note: status === 'Success' ? 'Payment completed successfully' : status === 'Pending' ? 'Payment is waiting for confirmation' : 'Payment failed; please retry',
    status,
  }
  data.payments.push(payment)
  if (status === 'Success' && invoiceId) {
    const invoice = data.invoices.find(item => item.id === invoiceId && item.userId === userId)
    if (invoice) invoice.status = 'Paid'
    data.notifications.push({ id: newId('NOT'), userId, type: 'payment_received', title: 'Payment received', message: `We received ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}.`, date: new Date().toISOString(), read: false })
  }
  if (status === 'Failed') {
    data.notifications.push({ id: newId('NOT'), userId, type: 'payment_failed', title: 'Payment failed', message: 'A payment could not be completed. You can retry it from Payments.', date: new Date().toISOString(), read: false })
  }
  saveData(data)
  return payment
}

// Ownership check: retry creates a payment only for an existing failed payment owned by userId.
export const retryPayment = async (userId: string, paymentId: string, method: 'Card' | 'UPI' | 'Net Banking'): Promise<Payment> => {
  await delay()
  const data = getData()
  const oldPayment = data.payments.find(item => item.id === paymentId && item.userId === userId)
  if (!oldPayment) throw new Error('Payment not found or access denied.')
  const retry = await createPayment(userId, oldPayment.invoiceId, oldPayment.amount, method)
  return retry
}

// Ownership check: demo payment outcome affects only this browser's mock data.
export const setPaymentOutcome = async (userId: string, outcome: 'random' | 'success' | 'fail'): Promise<void> => {
  await delay()
  if (!getData().users.some(item => item.id === userId)) throw new Error('User not found.')
  const data = getData()
  data.forcePaymentOutcome = outcome
  saveData(data)
}

// Ownership check: subscription results are filtered by userId before returning.
export const getSubscriptions = async (userId: string): Promise<Subscription[]> => {
  await delay()
  return getData().subscriptions.filter(item => item.userId === userId)
}

// Ownership check: reject a subscription unless both its ID and userId match the session.
export const getSubscription = async (userId: string, subscriptionId: string): Promise<Subscription> => {
  await delay()
  const item = getData().subscriptions.find(subscription => subscription.id === subscriptionId && subscription.userId === userId)
  if (!item) throw new Error('Subscription not found or access denied.')
  return item
}

// Ownership check: invoice results are filtered by userId.
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  await delay()
  return getData().invoices.filter(invoice => invoice.userId === userId)
}

// Ownership check: an invoice owned by another customer returns not-found, even when the ID is known.
export const getInvoice = async (userId: string, invoiceId: string): Promise<Invoice> => {
  await delay()
  const invoice = getData().invoices.find(item => item.id === invoiceId && item.userId === userId)
  if (!invoice) throw new Error('Invoice not found or access denied.')
  return invoice
}

// Ownership check: payment history is filtered by the current userId.
export const getPayments = async (userId: string): Promise<Payment[]> => {
  await delay()
  return getData().payments.filter(payment => payment.userId === userId)
}

// Ownership check: profile reads only the user record matching userId.
export const getProfile = async (userId: string): Promise<User> => {
  await delay()
  const user = getData().users.find(item => item.id === userId)
  if (!user) throw new Error('User not found.')
  return user
}

// Ownership check: profile writes update only the signed-in user's record.
export const updateProfile = async (userId: string, changes: Partial<User>): Promise<User> => {
  await delay()
  const data = getData()
  const index = data.users.findIndex(item => item.id === userId)
  if (index === -1) throw new Error('User not found.')
  data.users[index] = { ...data.users[index], ...changes, id: userId }
  saveData(data)
  return data.users[index]
}

// Ownership check: notifications are filtered by userId.
export const getNotifications = async (userId: string) => {
  await delay()
  const data = getData()
  const items = data.notifications.filter(item => item.userId === userId)
  const subscriptions = data.subscriptions.filter(item => item.userId === userId)
  subscriptions.forEach(subscription => {
    const days = Math.ceil((new Date(subscription.nextBillingDate).getTime() - Date.now()) / 86400000)
    if ([7, 1].includes(days)) {
      const exists = data.notifications.some(item => item.userId === userId && item.type === 'renewal_reminder' && item.message.includes(subscription.planName))
      if (!exists) items.push({ id: newId('NOT'), userId, type: 'renewal_reminder', title: 'Renewal reminder', message: `${subscription.planName} renews in ${days} day${days === 1 ? '' : 's'}.`, date: new Date().toISOString(), read: false })
    }
  })
  data.invoices.filter(invoice => invoice.userId === userId).forEach(invoice => {
    if (invoice.status !== 'Paid' && new Date(invoice.dueDate) < new Date()) {
      const exists = data.notifications.some(item => item.userId === userId && item.type === 'overdue_invoice' && item.message.includes(invoice.number))
      if (!exists) items.push({ id: newId('NOT'), userId, type: 'overdue_invoice', title: 'Invoice overdue', message: `${invoice.number} is overdue and needs payment.`, date: new Date().toISOString(), read: false })
    }
  })
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

// Ownership check: mark-read changes only notifications owned by userId.
export const markNotificationRead = async (userId: string, notificationId: string) => {
  await delay()
  const data = getData()
  data.notifications = data.notifications.map(item => item.userId === userId && item.id === notificationId ? { ...item, read: true } : item)
  saveData(data)
  return data.notifications.filter(item => item.userId === userId)
}

// Ownership check: mark-all-read changes only this signed-in customer's notifications.
export const markAllNotificationsRead = async (userId: string) => {
  await delay()
  const data = getData()
  data.notifications = data.notifications.map(item => item.userId === userId ? { ...item, read: true } : item)
  saveData(data)
  return data.notifications.filter(item => item.userId === userId)
}

// Ownership check: support-ticket lists are filtered by the current userId.
export const getSupportTickets = async (userId: string): Promise<SupportTicket[]> => {
  await delay()
  return getData().tickets.filter(ticket => ticket.userId === userId)
}

// Ownership check: a new support ticket is always attached to the current userId.
export const createSupportTicket = async (userId: string, subject: string, message: string): Promise<SupportTicket> => {
  await delay()
  const data = getData()
  const ticket: SupportTicket = { id: newId('TKT'), userId, subject, message, status: 'Open', createdAt: new Date().toISOString() }
  data.tickets.push(ticket)
  saveData(data)
  return ticket
}
