import { Outlet, Link } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/login" className="flex items-center gap-2 font-bold text-indigo-700">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">B</span>
            Brightloop
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/plans" className="text-slate-600 hover:text-indigo-700">Plans</Link>
            <Link to="/login" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">Log in</Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
