import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Public Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PublicProductsPage } from './pages/public/PublicProductsPage';
import { PublicPlansPage } from './pages/public/PublicPlansPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { CustomerManagementPage } from './pages/admin/CustomerManagementPage';
import { ProductManagementPage } from './pages/admin/ProductManagementPage';
import { PlanManagementPage } from './pages/admin/PlanManagementPage';
import { SubscriptionManagementPage } from './pages/admin/SubscriptionManagementPage';
import { DiscountManagementPage } from './pages/admin/DiscountManagementPage';
import { PaymentManagementPage } from './pages/admin/PaymentManagementPage';
import { InvoiceManagementPage } from './pages/admin/InvoiceManagementPage';
import { ReportsAnalyticsPage } from './pages/admin/ReportsAnalyticsPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffCustomersPage } from './pages/staff/StaffCustomersPage';
import { StaffSubscriptionsPage } from './pages/staff/StaffSubscriptionsPage';
import { StaffInvoicesPage } from './pages/staff/StaffInvoicesPage';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

// Customer Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerCheckoutPage } from './pages/customer/CustomerCheckoutPage';
import { CustomerSubscriptionsPage } from './pages/customer/CustomerSubscriptionsPage';
import { CustomerInvoicesPage } from './pages/customer/CustomerInvoicesPage';
import { CustomerPaymentsPage } from './pages/customer/CustomerPaymentsPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Shared
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/products" element={<PublicProductsPage />} />
        <Route path="/plans" element={<PublicPlansPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Admin Overview">
                <AdminDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Staff Management">
                <StaffManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Customer Accounts">
                <CustomerManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Catalogue Products">
                <ProductManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Subscription Plans">
                <PlanManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="All Subscriptions">
                <SubscriptionManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/discounts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Discount Management">
                <DiscountManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Payment Records">
                <PaymentManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Tax Invoices">
                <InvoiceManagementPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Reports & Analytics">
                <ReportsAnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Activity & Audit Logs">
                <ActivityLogsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Company Settings">
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Admin Notifications">
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout title="Administrator Profile">
                <AdminProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* STAFF ROUTES */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Staff Dashboard">
                <StaffDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/customers"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Assigned Customers">
                <StaffCustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Managed Subscriptions">
                <StaffSubscriptionsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/invoices"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Customer Invoices">
                <StaffInvoicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/payments"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Customer Payments">
                <StaffInvoicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <DashboardLayout title="Staff Profile">
                <StaffProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* CUSTOMER ROUTES */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="Customer Portal">
                <CustomerDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/products"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="Software Products">
                <PublicProductsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/plans"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="Subscription Plans">
                <PublicPlansPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/checkout"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="Subscribe & Checkout">
                <CustomerCheckoutPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="My Subscriptions">
                <CustomerSubscriptionsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/invoices"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="My Invoices">
                <CustomerInvoicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="Payment Receipts">
                <CustomerPaymentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="My Notifications">
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <DashboardLayout title="My Account Profile">
                <CustomerProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Global Fallback */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate
                to={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'STAFF'
                    ? '/staff/dashboard'
                    : '/customer/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            isAuthenticated && user ? (
              <Navigate
                to={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'STAFF'
                    ? '/staff/dashboard'
                    : '/customer/dashboard'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
