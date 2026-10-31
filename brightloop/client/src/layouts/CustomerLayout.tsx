import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Bell, CreditCard, FileText, LayoutDashboard, LogOut, Package, ReceiptText, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const menu = [
  { to: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plans', label: 'Plans', icon: Package },
  { to: '/portal/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/portal/invoices', label: 'Invoices', icon: FileText },
  { to: '/portal/payments', label: 'Payments', icon: ReceiptText },
  { to: '/portal/profile', label: 'Profile', icon: UserRound },
  { to: '/portal/notifications', label: 'Notifications', icon: Bell },
]

export function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => {
    await logout()
    toast.success('You have been logged out.')
    navigate('/login', { replace: true })
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="flex h-12 items-center gap-2 px-2 font-bold text-indigo-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">B</span> Brightloop</div>
        <nav className="mt-6 flex-1 space-y-1">{menu.map(item => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}><item.icon size={18} />{item.label}</NavLink>)}</nav>
        <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut size={18} />Log out</button>
      </aside>
      <main className="md:pl-60"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6"><span className="font-semibold md:hidden">Brightloop</span><span className="text-sm text-slate-600">Welcome, {user?.name}</span></header><Outlet /></main>
    </div>
  )
}
