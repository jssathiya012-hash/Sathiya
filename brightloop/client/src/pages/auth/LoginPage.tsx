import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

const schema = z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(1, 'Password is required') })
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const submit = async (values: FormData) => {
    try {
      const user = await authApi.login(values.email, values.password)
      setUser(user)
      toast.success(`Welcome back, ${user.name}!`)
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from ?? (user.role === 'CUSTOMER' ? '/portal/dashboard' : '/admin'), { replace: true })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not log you in.')
    }
  }

  const demoLogin = async () => {
    setValue('email', 'demo@brightloop.com')
    setValue('password', 'Demo@12345')
    await submit({ email: 'demo@brightloop.com', password: 'Demo@12345' })
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center px-6 py-10 md:grid-cols-2">
      <section className="hidden pr-12 md:block">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white"><ShieldCheck /></div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">Manage subscriptions with confidence.</h1>
        <p className="mt-4 max-w-md text-lg leading-8 text-slate-600">One clear place for plans, invoices, payments, and customer billing.</p>
      </section>
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Log in to your Brightloop account.</p>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500" {...register('email')} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label><Link to="/forgot-password" className="text-sm font-medium text-indigo-600">Forgot password?</Link></div>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm shadow-sm focus:border-indigo-500" {...register('password')} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-2.5 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? 'Logging in...' : 'Log in'}</button>
        </form>
        <button type="button" onClick={demoLogin} className="mt-3 w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">Use demo customer account</button>
        <p className="mt-6 text-center text-sm text-slate-600">New to Brightloop? <Link to="/signup" className="font-semibold text-indigo-600">Create an account</Link></p>
      </section>
    </main>
  )
}
