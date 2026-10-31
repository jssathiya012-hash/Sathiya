import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../hooks/useAuth'

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/
const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().regex(strongPassword, 'Password does not meet all requirements'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type FormData = z.infer<typeof schema>

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const password = watch('password') ?? ''
  const checks = [
    ['More than 8 characters', password.length > 8],
    ['One uppercase letter', /[A-Z]/.test(password)],
    ['One lowercase letter', /[a-z]/.test(password)],
    ['One special character', /[^A-Za-z0-9]/.test(password)],
  ] as const

  const submit = async (values: FormData) => {
    try {
      const user = await authApi.signup(values.name, values.email, values.password)
      setUser(user)
      toast.success('Your account is ready!')
      navigate('/portal/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not create your account.')
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-lg items-center px-6 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Create your account</h1>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4" noValidate>
          {[{ name: 'name' as const, label: 'Full name', type: 'text', autoComplete: 'name' }, { name: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' }].map(field =>
            <div key={field.name}><label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label><input id={field.name} type={field.type} autoComplete={field.autoComplete} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm" {...register(field.name)} />{errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]?.message}</p>}</div>)}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm shadow-sm" {...register('password')} /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-2.5 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <ul className="mt-3 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">{checks.map(([label, passed]) => <li key={label} className={passed ? 'text-green-700' : 'text-slate-500'}>{passed ? <Check className="mr-1 inline" size={15} /> : <X className="mr-1 inline text-slate-300" size={15} />}{label}</li>)}</ul>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div><label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label><input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm" {...register('confirmPassword')} />{errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}</div>
          <button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-indigo-600">Log in</Link></p>
      </section>
    </main>
  )
}
