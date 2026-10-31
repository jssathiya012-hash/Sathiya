import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, CreditCard, FileText, LayoutDashboard, LifeBuoy, Layers3, Moon, Package, Sun, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { getNotifications } from '../api/mockApi'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/plans', label: 'Plans', icon: Package },
  { to: '/subscriptions', label: 'Subscriptions', icon: Layers3 },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/support', label: 'Support', icon: LifeBuoy },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const user = useAppStore(state => state.user)
  const theme = useAppStore(state => state.theme)
  const setTheme = useAppStore(state => state.setTheme)
  const logout = useAppStore(state => state.logout)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!user) return
    getNotifications(user.id).then(items => setUnread(items.filter(item => !item.read).length)).catch(() => setUnread(0))
  }, [user])

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-indigo-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><Layers3 size={19} /></span>Brightloop</Link>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-slate-500 lg:hidden"><X size={20} /></button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigation.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              <item.icon size={19} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-3 dark:border-slate-800">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-950"><LogOut size={19} />Log out</button>
        </div>
      </aside>
      {menuOpen && <button aria-label="Close menu overlay" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8 dark:border-slate-800 dark:bg-slate-900/90">
          <button aria-label="Open menu" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 lg:hidden"><Menu size={21} /></button>
          <div className="hidden text-sm text-slate-500 sm:block">Brightloop customer portal</div>
          <div className="flex items-center gap-2">
            <button aria-label="Toggle dark mode" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/notifications" aria-label={`${unread} unread notifications`} className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Bell size={19} />
              {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <div className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{user?.name?.charAt(0) ?? 'U'}</div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
