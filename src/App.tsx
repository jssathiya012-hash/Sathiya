import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { PlansPage } from './pages/plans/PlansPage'
import { ProductPlansPage } from './pages/plans/ProductPlansPage'
import { SubscriptionsPage } from './pages/subscriptions/SubscriptionsPage'
import { SubscriptionDetailPage } from './pages/subscriptions/SubscriptionDetailPage'
import { InvoicesPage } from './pages/invoices/InvoicesPage'
import { InvoiceDetailPage } from './pages/invoices/InvoiceDetailPage'
import { PaymentsPage } from './pages/payments/PaymentsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { SupportPage } from './pages/support/SupportPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/plans/:productId" element={<ProtectedRoute><ProductPlansPage /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
        <Route path="/subscriptions/:id" element={<ProtectedRoute><SubscriptionDetailPage /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><AppLayout><SupportPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
