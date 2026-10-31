import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth'

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'CUSTOMER' ? '/portal/dashboard' : '/admin'} replace />
  }
  return <Outlet />
}

export function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'CUSTOMER' ? '/portal/dashboard' : '/admin'} replace />
}
