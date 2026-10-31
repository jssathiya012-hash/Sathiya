import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, LoaderCircle } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { PasswordInput } from '../../components/PasswordInput'
import { signup } from '../../api/mockApi'
import { useAppStore } from '../../store/appStore'
import { isValidPassword, passwordChecks } from '../../lib/validators'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().refine(isValidPassword, 'Your password needs all four requirements below'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
type FormData = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const setUser = useAppStore(state => state.setUser)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const password = watch('password', '')
  const checks = useMemo(() => passwordChecks(password), [password])

  const submit = async (values: FormData) => {
    setLoading(true)
    try {
      const user = await signup(values.name, values.email, values.password)
      setUser(user)
      toast.success('Your account is ready!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  const requirements = [
    [checks.length, 'More than 8 characters'],
    [checks.uppercase, 'One uppercase letter'],
    [checks.lowercase, 'One lowercase letter'],
    [checks.special, 'One special character'],
  ] as const

  return (
    <AuthLayout title="Create your account" subtitle="Start managing subscriptions and billing.">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
          <input id="name" {...register('name')} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
          <input id="signup-email" type="email" {...register('email')} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <PasswordInput label="Password" {...register('password')} />
        {errors.password && <p className="-mt-2 text-xs text-red-600">{errors.password.message}</p>}
        <ul className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-3 text-xs">
          {requirements.map(([passed, label]) => (
            <li key={label} className={`flex items-center gap-2 ${passed ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`grid h-4 w-4 place-items-center rounded-full border ${passed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>{passed && <Check size={11} />}</span>
              {label}
            </li>
          ))}
        </ul>
        <PasswordInput label="Confirm password" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="-mt-2 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        <button disabled={loading} className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-semibold text-indigo-700">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
