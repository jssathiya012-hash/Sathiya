import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Layers3 } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1fr_520px]">
      <section className="hidden lg:flex flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white">
        <Link to="/plans" className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Layers3 size={21} /></span>
          Brightloop
        </Link>
        <div className="max-w-lg">
          <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-indigo-200">Your business, connected</p>
          <blockquote className="text-4xl font-semibold leading-tight">
            One simple place for plans, billing, and subscriptions.
          </blockquote>
        </div>
        <p className="text-sm text-indigo-200">Trusted by modern customer teams</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <Link to="/plans" className="mb-10 flex items-center gap-2 text-lg font-bold text-indigo-700 lg:hidden">
            <Layers3 size={22} /> Brightloop
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  )
}
