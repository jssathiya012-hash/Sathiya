import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'STAFF', 'CUSTOMER'], default: 'CUSTOMER' },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

const StaffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Suspended', 'Deactivated'], default: 'Active' },
  permissions: {
    canViewCustomers: { type: Boolean, default: true },
    canEditCustomers: { type: Boolean, default: true },
    canViewSubscriptions: { type: Boolean, default: true },
    canRenewSubscriptions: { type: Boolean, default: true },
    canViewPayments: { type: Boolean, default: true },
    canViewInvoices: { type: Boolean, default: true }
  },
  tempPassword: { type: String },
  mustChangePassword: { type: Boolean, default: true }
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  companyName: { type: String },
  gstNumber: { type: String },
  billingAddress: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'India' }
  },
  status: { type: String, enum: ['Active', 'Suspended', 'Deactivated'], default: 'Active' },
  assignedStaffId: { type: String }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: String, default: 'Software' },
  description: { type: String },
  icon: { type: String, default: 'Package' },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const PlanSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  name: { type: String, required: true },
  period: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: 'Monthly' },
  durationMonths: { type: Number, default: 1 },
  price: { type: Number, required: true },
  features: [{ type: String }],
  minQuantity: { type: Number, default: 1 },
  recommended: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  period: { type: String, default: 'Monthly' },
  durationMonths: { type: Number, default: 1 },
  originalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  nextRenewalDate: { type: Date },
  status: { type: String, enum: ['Pending', 'Active', 'Expired', 'Cancelled', 'Suspended'], default: 'Active' },
  paymentStatus: { type: String, enum: ['Successful', 'Pending', 'Failed'], default: 'Successful' },
  autoRenew: { type: Boolean, default: false }
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  subscriptionId: { type: String },
  invoiceId: { type: String },
  customerId: { type: String, required: true },
  customerName: { type: String },
  customerEmail: { type: String },
  amount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  method: { type: String, enum: ['Card', 'UPI', 'Net Banking'], default: 'Card' },
  transactionRef: { type: String, required: true },
  status: { type: String, enum: ['Successful', 'Pending', 'Failed', 'Refunded'], default: 'Successful' },
  paidAt: { type: Date, default: Date.now }
}, { timestamps: true });

const DiscountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String },
  type: { type: String, enum: ['PERCENT', 'FIXED'], default: 'PERCENT' },
  value: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  subscriptionId: { type: String },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  productName: { type: String, required: true },
  planName: { type: String, required: true },
  subscriptionDuration: { type: String, default: '1 Month' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  originalPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Card' },
  transactionRef: { type: String },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Cancelled'], default: 'Paid' }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: String },
  userName: { type: String },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const CompanySettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Brightloop Software' },
  brandName: { type: String, default: 'SmartSub' },
  tagline: { type: String, default: 'Unified Subscription Management System' },
  contactEmail: { type: String, default: 'support@brightloop.com' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  address: { type: String, default: 'Brightloop Tower, Sector 62, Bangalore, India' },
  gstNumber: { type: String, default: '29ABCDE1234F1Z5' },
  taxRatePercent: { type: Number, default: 18 },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  testPaymentMode: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Staff = mongoose.model('Staff', StaffSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Plan = mongoose.model('Plan', PlanSchema);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);
export const Payment = mongoose.model('Payment', PaymentSchema);
export const Discount = mongoose.model('Discount', DiscountSchema);
export const Invoice = mongoose.model('Invoice', InvoiceSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export const CompanySettings = mongoose.model('CompanySettings', CompanySettingsSchema);
