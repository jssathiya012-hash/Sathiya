import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAppStore(state => state.user)
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
