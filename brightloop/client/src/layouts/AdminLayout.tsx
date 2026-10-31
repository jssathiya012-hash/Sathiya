import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, Boxes, CreditCard, FileText, LayoutDashboard, LogOut, ReceiptText, Settings, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products & Plans', icon: Boxes },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: ShieldCheck },
  { to: '/admin/invoices', label: 'Invoices', icon: ReceiptText },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/staff', label: 'Staff & Settings', icon: Settings, adminOnly: true },
  { to: '/admin/audit', label: 'Audit log', icon: FileText, adminOnly: true },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => {
    await logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="flex h-12 items-center gap-2 px-2 font-bold text-indigo-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">B</span> Brightloop
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {menu.filter(item => !item.adminOnly || user?.role === 'ADMIN').map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <item.icon size={18} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 px-2 text-xs"><p className="font-semibold text-slate-800">{user?.name}</p><p className="mt-1 text-slate-500">{user?.role}</p></div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut size={18} />Log out</button>
        </div>
      </aside>
      <main className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6"><span className="font-semibold lg:hidden">Brightloop</span><span className="text-sm text-slate-500">Subscription Management</span></header><Outlet /></main>
    </div>
  )
}
