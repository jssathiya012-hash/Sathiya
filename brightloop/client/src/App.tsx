import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, HomeRedirect } from './components/RouteGuards'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { CustomerLayout } from './layouts/CustomerLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { ComingSoonPage } from './pages/ComingSoonPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/plans" element={<ComingSoonPage title="Plans" />} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN', 'STAFF']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<ComingSoonPage title="Admin dashboard" />} />
            <Route path="/admin/products" element={<ComingSoonPage title="Products and plans" />} />
            <Route path="/admin/customers" element={<ComingSoonPage title="Customers" />} />
            <Route path="/admin/subscriptions" element={<ComingSoonPage title="Subscriptions" />} />
            <Route path="/admin/invoices" element={<ComingSoonPage title="Invoices" />} />
            <Route path="/admin/payments" element={<ComingSoonPage title="Payments" />} />
            <Route path="/admin/reports" element={<ComingSoonPage title="Reports" />} />
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin/staff" element={<ComingSoonPage title="Staff and settings" />} />
              <Route path="/admin/audit" element={<ComingSoonPage title="Audit log" />} />
            </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/portal/dashboard" element={<ComingSoonPage title="My Subscription Portal" />} />
            <Route path="/portal/subscriptions" element={<ComingSoonPage title="My subscriptions" />} />
            <Route path="/portal/subscriptions/:id" element={<ComingSoonPage title="Subscription details" />} />
            <Route path="/portal/invoices" element={<ComingSoonPage title="My invoices" />} />
            <Route path="/portal/invoices/:id" element={<ComingSoonPage title="Invoice details" />} />
            <Route path="/portal/payments" element={<ComingSoonPage title="Payments" />} />
            <Route path="/portal/profile" element={<ComingSoonPage title="Profile" />} />
            <Route path="/portal/notifications" element={<ComingSoonPage title="Notifications" />} />
            <Route path="/portal/support" element={<ComingSoonPage title="Support" />} />
          </Route>
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}
