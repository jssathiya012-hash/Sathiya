import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LoaderCircle } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { PasswordInput } from '../../components/PasswordInput'
import { login } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAppStore(state => state.setUser)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const submit = async (values: FormData) => {
    setLoading(true)
    try {
      const user = await login(values.email, values.password)
      setUser(user)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign you in.')
    } finally {
      setLoading(false)
    }
  }

  const useDemo = () => {
    setValue('email', 'demo@brightloop.com')
    setValue('password', 'Demo@12345')
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your plans and billing.">
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
          <input id="email" type="email" autoComplete="email" {...register('email')} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" placeholder="you@company.com" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <PasswordInput label="Password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="-mt-3 text-xs text-red-600">{errors.password.message}</p>}
        <div className="flex items-center justify-between">
          <button type="button" onClick={useDemo} className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">Use demo account</button>
          <Link to="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-indigo-700">Forgot password?</Link>
        </div>
        <button disabled={loading} className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Sign in'}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-600">
        New to Brightloop? <Link to="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">Create an account</Link>
      </p>
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Demo: <strong className="text-slate-700">demo@brightloop.com</strong> / <strong className="text-slate-700">Demo@12345</strong>
      </div>
    </AuthLayout>
  )
}
