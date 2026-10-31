import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as staffCtrl from '../controllers/staffController.js';
import * as custCtrl from '../controllers/customerController.js';
import * as prodCtrl from '../controllers/productController.js';
import * as planCtrl from '../controllers/planController.js';
import * as discCtrl from '../controllers/discountController.js';
import * as subCtrl from '../controllers/subscriptionController.js';
import * as payCtrl from '../controllers/paymentController.js';
import * as invCtrl from '../controllers/invoiceController.js';
import * as repCtrl from '../controllers/reportController.js';
import * as notifCtrl from '../controllers/notificationController.js';
import * as actCtrl from '../controllers/activityLogController.js';
import * as setCtrl from '../controllers/settingsController.js';

const router = express.Router();

// Public Auth & Catalogue
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);
router.post('/auth/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully.' }));
router.get('/products', prodCtrl.getAllProducts);
router.get('/plans', planCtrl.getAllPlans);
router.post('/discounts/validate', discCtrl.validateDiscount);

// Authenticated User Profile & Notifications
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);
router.get('/notifications', authenticate, notifCtrl.getNotifications);
router.patch('/notifications/:id/read', authenticate, notifCtrl.markAsRead);
router.patch('/notifications/read-all', authenticate, notifCtrl.markAllAsRead);

// Subscriptions & Checkout
router.get('/subscriptions', authenticate, subCtrl.getAllSubscriptions);
router.get('/subscriptions/:id', authenticate, subCtrl.getSubscriptionById);
router.post('/subscriptions', authenticate, subCtrl.createSubscription);
router.post('/subscriptions/:id/renew', authenticate, subCtrl.renewSubscription);
router.post('/subscriptions/:id/cancel', authenticate, subCtrl.cancelSubscription);
router.post('/subscriptions/:id/pause', authenticate, subCtrl.pauseSubscription);

// Payments & Invoices
router.get('/payments', authenticate, payCtrl.getAllPayments);
router.get('/invoices', authenticate, invCtrl.getAllInvoices);
router.get('/invoices/:id', authenticate, invCtrl.getInvoiceById);

// Staff & Customer Views
router.get('/customers', authenticate, authorize('ADMIN', 'STAFF'), custCtrl.getAllCustomers);
router.get('/customers/:id', authenticate, authorize('ADMIN', 'STAFF'), custCtrl.getCustomerById);
router.post('/customers', authenticate, authorize('ADMIN'), custCtrl.createCustomer);
router.put('/customers/:id', authenticate, authorize('ADMIN', 'STAFF'), custCtrl.updateCustomer);
router.delete('/customers/:id', authenticate, authorize('ADMIN'), custCtrl.deleteCustomer);

// Admin-only Staff Management
router.get('/staff', authenticate, authorize('ADMIN'), staffCtrl.getAllStaff);
router.post('/staff', authenticate, authorize('ADMIN'), staffCtrl.createStaff);
router.put('/staff/:id', authenticate, authorize('ADMIN'), staffCtrl.updateStaff);
router.delete('/staff/:id', authenticate, authorize('ADMIN'), staffCtrl.deleteStaff);
router.post('/staff/:id/reset-password', authenticate, authorize('ADMIN'), staffCtrl.resetStaffPassword);

// Admin-only Products & Plans
router.post('/products', authenticate, authorize('ADMIN'), prodCtrl.createProduct);
router.put('/products/:id', authenticate, authorize('ADMIN'), prodCtrl.updateProduct);
router.delete('/products/:id', authenticate, authorize('ADMIN'), prodCtrl.deleteProduct);

router.post('/plans', authenticate, authorize('ADMIN'), planCtrl.createPlan);
router.put('/plans/:id', authenticate, authorize('ADMIN'), planCtrl.updatePlan);
router.delete('/plans/:id', authenticate, authorize('ADMIN'), planCtrl.deletePlan);

// Admin-only Discounts
router.get('/discounts', authenticate, authorize('ADMIN'), discCtrl.getAllDiscounts);
router.post('/discounts', authenticate, authorize('ADMIN'), discCtrl.createDiscount);
router.put('/discounts/:id', authenticate, authorize('ADMIN'), discCtrl.updateDiscount);
router.delete('/discounts/:id', authenticate, authorize('ADMIN'), discCtrl.deleteDiscount);

// Admin Payments & Refunds
router.post('/payments/:id/refund', authenticate, authorize('ADMIN'), payCtrl.refundPayment);

// Reports & Analytics
router.get('/reports/overview', authenticate, authorize('ADMIN', 'STAFF'), repCtrl.getDashboardOverview);
router.get('/reports/details', authenticate, authorize('ADMIN'), repCtrl.getDetailedReports);

// Activity Logs
router.get('/activity-logs', authenticate, authorize('ADMIN'), actCtrl.getActivityLogs);

// Settings
router.get('/settings', setCtrl.getCompanySettings);
router.put('/settings', authenticate, authorize('ADMIN'), setCtrl.updateCompanySettings);

export default router;
