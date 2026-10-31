import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { ApiError } from '../../api/client'

const schema = z.object({ password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}$/, 'Password does not meet all requirements'), confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const submit = async (values: FormData) => {
    try {
      const result = await authApi.resetPassword(token, values.password)
      setDone(true)
      toast.success(result.message)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not reset the password.')
    }
  }
  if (done) return <main className="grid min-h-[calc(100vh-64px)] place-items-center px-6"><section className="text-center"><CheckCircle2 className="mx-auto text-green-600" size={48} /><h1 className="mt-4 text-2xl font-bold">Password updated</h1><p className="mt-2 text-slate-600">Taking you to login...</p></section></main>
  return (
    <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-lg items-center px-6 py-10"><section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h1 className="text-2xl font-bold">Choose a new password</h1><form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4"><div><label htmlFor="password" className="mb-1.5 block text-sm font-medium">New password</label><input id="password" type="password" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('password')} />{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}</div><div><label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">Confirm password</label><input id="confirmPassword" type="password" autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5" {...register('confirmPassword')} />{errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}</div><button disabled={isSubmitting} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white">{isSubmitting ? 'Updating...' : 'Update password'}</button></form><Link to="/login" className="mt-5 block text-center text-sm font-semibold text-indigo-600">Back to login</Link></section></main>
  )
}
