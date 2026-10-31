export type SubscriptionStatus = 'Active' | 'Paused' | 'Expired' | 'Closed'
export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Paid'
export type PaymentStatus = 'Success' | 'Pending' | 'Failed'
export type NotificationType = 'renewal_reminder' | 'payment_received' | 'invoice_generated' | 'payment_failed' | 'overdue_invoice'

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  companyName?: string
  gstNumber?: string
  billingAddress: Address
}

export interface ProductVariantOption {
  id: string
  name: string
  priceExtra: number
}

export interface ProductVariant {
  id: string
  name: string
  options: ProductVariantOption[]
}

export interface Plan {
  id: string
  productId: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  minimumQuantity: number
  features: string[]
  availableFrom: string
  availableTo: string
  recommended?: boolean
  pausable: boolean
  closableEarly: boolean
  autoCloseAtEnd: boolean
  renewable: boolean
}

export interface Product {
  id: string
  name: string
  type: string
  description: string
  startingPrice: number
  variants: ProductVariant[]
  planIds: string[]
}

export interface DiscountRule {
  id: string
  code: string
  percent: number
  minimumQuantity: number
  expiresAt: string
  usageLimit: number
  usedCount: number
}

export interface SubscriptionActivity {
  id: string
  type: 'created' | 'paid' | 'upgraded' | 'paused' | 'resumed' | 'renewed' | 'cancelled' | 'expired'
  title: string
  description: string
  date: string
}

export interface Subscription {
  id: string
  userId: string
  productId: string
  planId: string
  planName: string
  productName: string
  status: SubscriptionStatus
  quantity: number
  startDate: string
  expiryDate: string
  nextBillingDate: string
  amount: number
  billingFrequency: 'Monthly' | 'Yearly'
  activity: SubscriptionActivity[]
}

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  userId: string
  subscriptionId?: string
  number: string
  date: string
  dueDate: string
  status: InvoiceStatus
  lines: InvoiceLine[]
  discount: number
  tax: number
  total: number
}

export interface Payment {
  id: string
  userId: string
  invoiceId?: string
  amount: number
  method: 'Card' | 'UPI' | 'Net Banking'
  date: string
  note: string
  status: PaymentStatus
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  date: string
  read: boolean
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  message: string
  status: 'Open' | 'Answered' | 'Closed'
  createdAt: string
  reply?: string
}

export interface AppData {
  users: User[]
  products: Product[]
  plans: Plan[]
  subscriptions: Subscription[]
  invoices: Invoice[]
  payments: Payment[]
  discounts: DiscountRule[]
  notifications: Notification[]
  tickets: SupportTicket[]
  taxRate: number
  forcePaymentOutcome: 'random' | 'success' | 'fail'
}